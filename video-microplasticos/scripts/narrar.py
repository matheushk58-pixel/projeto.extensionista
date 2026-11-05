"""Gera a narração, as legendas e as durações das cenas do vídeo.

Cada fala é sintetizada separadamente (Piper, offline) e medida, então as
legendas saem sincronizadas e nenhuma cena fica mais curta que a sua fala.

Uso: python3 scripts/narrar.py <modelo.onnx>
Saídas: public/narracao.wav, public/legendas.vtt, src/narracao.ts
"""
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
FPS, TRANSICAO, SR = 30, 15, 48000
ATRASO, PAUSA, FOLGA = 0.5, 0.3, 0.8  # s: início da fala na cena, entre frases, fim da cena

ORDEM = ["Abertura", "OQueSao", "Escala", "Oceanos", "Cadeia", "Efeitos", "Exposicao", "Corpo",
         "Arterias", "Brasil", "Incertezas", "Acoes", "Projeto", "Fontes", "Equipe", "Encerramento"]
DURACAO_MIN = {"Abertura": 195, "OQueSao": 450, "Escala": 450, "Oceanos": 270, "Cadeia": 450, "Efeitos": 330,
               "Exposicao": 420, "Corpo": 510, "Arterias": 300, "Brasil": 360, "Incertezas": 480, "Acoes": 420,
               "Projeto": 300, "Fontes": 240, "Equipe": 210, "Encerramento": 180}


def sintetizar(texto, modelo, pasta):
    saida = Path(pasta) / f"f{abs(hash(texto))}.wav"
    subprocess.run([sys.executable, "-m", "piper", "-m", modelo, "-f", str(saida), "--length-scale", "1.0"],
                   input=texto.encode(), check=True, capture_output=True)
    # reamostra para 48 kHz mono e lê como float
    bruto = subprocess.run(["ffmpeg", "-v", "error", "-i", str(saida), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                           check=True, capture_output=True).stdout
    return np.frombuffer(bruto, dtype="<f4").copy()


def dividir(texto, limite=80):
    """Legendas longas viram duas, cortadas na vírgula mais perto do meio."""
    if len(texto) <= limite:
        return [texto]
    cortes = [i + 1 for i, c in enumerate(texto) if c == "," and 20 < i < len(texto) - 20]
    if not cortes:
        cortes = [i for i, c in enumerate(texto) if c == " " and 20 < i < len(texto) - 20]
    meio = min(cortes, key=lambda i: abs(i - len(texto) / 2))
    return dividir(texto[:meio].strip(), limite) + dividir(texto[meio:].strip(), limite)


def ts(seg):
    h, r = divmod(seg, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}"


def main():
    modelo = sys.argv[1]
    roteiro = json.loads((RAIZ / "narracao" / "roteiro.json").read_text(encoding="utf-8"))
    cenas, falas = [], []
    with tempfile.TemporaryDirectory() as pasta:
        for nome in ORDEM:
            partes, t = [], ATRASO
            for legenda, fala in roteiro[nome]:
                audio = sintetizar(fala or legenda, modelo, pasta)
                partes.append((t, audio, legenda)); t += len(audio) / SR + PAUSA
            fim = t - PAUSA + FOLGA
            cenas.append((nome, max(DURACAO_MIN[nome], int(np.ceil(fim * FPS))), partes))
    inicio, total = 0, sum(d for _, d, _ in cenas) - TRANSICAO * (len(cenas) - 1)
    trilha = np.zeros(int(total / FPS * SR) + SR)
    vtt, n_cue = ["WEBVTT", ""], 0
    marcas = {}
    for i, (nome, dur, partes) in enumerate(cenas):
        marcas[nome] = inicio / FPS
        for t, audio, legenda in partes:
            a = int((inicio / FPS + t) * SR); trilha[a:a + len(audio)] += audio
            ini, fim = inicio / FPS + t, inicio / FPS + t + len(audio) / SR
            pedacos = dividir(legenda)
            total_c = sum(len(x) for x in pedacos)
            for j, pedaco in enumerate(pedacos):
                p0 = ini + (fim - ini) * sum(len(x) for x in pedacos[:j]) / total_c
                p1 = ini + (fim - ini) * sum(len(x) for x in pedacos[:j + 1]) / total_c
                n_cue += 1
                vtt += [str(n_cue), f"{ts(p0)} --> {ts(p1 + (.15 if j == len(pedacos) - 1 else 0))}", pedaco, ""]
        inicio += dur - TRANSICAO
    trilha = np.clip(trilha / max(1e-9, np.abs(trilha).max()) * .89, -1, 1)
    with wave.open(str(RAIZ / "public" / "narracao.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((trilha * 32767).astype("<i2").tobytes())
    (RAIZ / "public" / "legendas.vtt").write_text("\n".join(vtt), encoding="utf-8")
    ts_out = ["// Gerado por scripts/narrar.py: duração de cada cena (quadros) ajustada à narração.",
              "export const DURACOES: Record<string, number> = {"]
    ts_out += [f"  {n}: {d}," for n, d, _ in cenas] + ["};", ""]
    (RAIZ / "src" / "narracao.ts").write_text("\n".join(ts_out), encoding="utf-8")
    print(json.dumps({"total_s": round(total / FPS, 1), "cenas": {n: d for n, d, _ in cenas},
                      "escuro_ini": round(marcas["Exposicao"], 1), "escuro_fim": round(marcas["Acoes"], 1)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
