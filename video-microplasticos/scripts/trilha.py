"""Trilha ambiente original para o vídeo "Microplásticos e Saúde".

Gera um WAV estéreo de 178 s: pad suave, baixo, gotas em arpejo e um leve
som de mar, tudo sintetizado aqui (sem amostras de terceiros).
Uso: python3 trilha.py saida.wav
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 178.0
N = int(SR * DUR)
rng = np.random.default_rng(4)

BPM = 72
BEAT = 60 / BPM
ACORDE = BEAT * 8  # dois compassos por acorde (~6,7 s)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# Acordes em MIDI. Começa claro (água), escurece no meio (corpo/saúde),
# clareia de novo nas ações e no fim.
CLARO = [
    [50, 57, 62, 66, 69, 76],   # Dmaj9
    [47, 54, 62, 66, 69, 73],   # Bm9
    [43, 55, 59, 62, 66, 69],   # Gmaj9
    [45, 52, 57, 61, 64, 71],   # A add9
]
ESCURO = [
    [47, 54, 59, 62, 66, 69],   # Bm(add11)
    [43, 55, 59, 62, 66, 71],   # Gmaj7
    [40, 55, 59, 62, 66, 67],   # Em9
    [42, 54, 57, 61, 64, 69],   # F#m7
]
FINAL = [50, 57, 62, 66, 69, 74, 76]  # Dmaj9 aberto

n_acordes = int(np.ceil(DUR / ACORDE))
prog = []
for i in range(n_acordes):
    t = i * ACORDE
    if t < 52 or t >= 128:
        prog.append(CLARO[i % 4])
    else:
        prog.append(ESCURO[i % 4])
prog[-1] = FINAL
prog[-2] = CLARO[3]

L = np.zeros(N)
R = np.zeros(N)


def envelope(n, ataque, soltura):
    e = np.ones(n)
    a = min(int(ataque * SR), n // 2)
    s = min(int(soltura * SR), n // 2)
    e[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    e[n - s:] = np.cos(np.linspace(0, np.pi / 2, s)) ** 2
    return e


def add(sinal, inicio, pan):
    i0 = int(inicio * SR)
    if i0 >= N:
        return
    fim = min(N, i0 + len(sinal))
    trecho = sinal[: fim - i0]
    L[i0:fim] += trecho * np.cos(pan * np.pi / 2)
    R[i0:fim] += trecho * np.sin(pan * np.pi / 2)


# --- Pad: vozes levemente desafinadas, com sobreposição entre acordes ---
for i, notas in enumerate(prog):
    ini = max(0.0, i * ACORDE - 1.5)
    dur = ACORDE + 3.0 if i < len(prog) - 1 else DUR - ini
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = envelope(n, 2.2, 3.0 if i < len(prog) - 1 else 7.0)
    for k, m in enumerate(notas[1:]):
        f = hz(m)
        voz = np.zeros(n)
        for d in (-0.07, 0.0, 0.06):
            ff = f * 2 ** (d / 12)
            fase = rng.uniform(0, 2 * np.pi)
            voz += np.sin(2 * np.pi * ff * t + fase)
            voz += 0.18 * np.sin(2 * np.pi * 2 * ff * t + fase)
        # leve "respiração" no volume
        voz *= 1 + 0.15 * np.sin(2 * np.pi * (0.07 + 0.01 * k) * t + k)
        add(voz * env * 0.035, ini, 0.25 + 0.5 * (k % 2) * 0.8 + 0.05 * k)

# --- Baixo: fundamental suave ---
for i, notas in enumerate(prog):
    ini = i * ACORDE
    dur = ACORDE + 1.0 if i < len(prog) - 1 else DUR - ini
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(notas[0] - 12 if notas[0] > 45 else notas[0])
    b = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    add(b * envelope(n, 1.2, 2.5 if i < len(prog) - 1 else 7.0) * 0.07, ini, 0.5)

# --- Gotas: arpejo em colcheias com notas do acorde, uma oitava acima ---
COLCHEIA = BEAT / 2
t_gota = np.arange(int(1.6 * SR)) / SR
for passo in range(int(DUR / COLCHEIA)):
    tt = passo * COLCHEIA
    if tt < 7 or tt > DUR - 5:
        continue
    meio = 52 <= tt < 128
    prob = 0.32 if meio else 0.5
    if passo % 8 == 0:
        prob = 0.9
    if rng.random() > prob:
        continue
    notas = prog[min(int(tt / ACORDE), len(prog) - 1)]
    m = notas[1:][rng.integers(0, len(notas) - 1)] + 12
    while m > 86:
        m -= 12
    f = hz(m)
    decai = np.exp(-t_gota / (0.35 if meio else 0.45))
    g = np.sin(2 * np.pi * f * t_gota) + 0.12 * np.sin(2 * np.pi * 2.76 * f * t_gota) * np.exp(-t_gota / 0.08)
    g *= decai * np.minimum(1, t_gota / 0.004)
    vol = (0.05 if meio else 0.065) * rng.uniform(0.6, 1.0)
    pan = rng.uniform(0.2, 0.8)
    add(g * vol, tt + rng.uniform(0, 0.012), pan)
    # eco pingue-pongue
    add(g * vol * 0.35, tt + BEAT * 0.75, 1 - pan)
    add(g * vol * 0.14, tt + BEAT * 1.5, pan)

# --- Mar: ruído filtrado com ondulação lenta ---
def ruido_suave(corte):
    x = rng.standard_normal(N)
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(N, 1 / SR)
    X *= 1 / (1 + (fr / corte) ** 4) * (1 / (1 + (90 / np.maximum(fr, 1e-3)) ** 4))
    y = np.fft.irfft(X, N)
    return y / np.max(np.abs(y))

tt = np.arange(N) / SR
onda = 0.5 + 0.5 * np.sin(2 * np.pi * tt / 11.0 - np.pi / 2)
mar = 0.022 * onda ** 1.5
L += ruido_suave(420) * mar
R += ruido_suave(420) * mar

# --- Reverberação por convolução com resposta sintética ---
def reverb(x, segundos=3.2, seed=0):
    r = np.random.default_rng(seed)
    n = int(segundos * SR)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.9 / segundos)
    ir[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
    ir /= np.sqrt(np.sum(ir ** 2))
    tam = 1 << int(np.ceil(np.log2(len(x) + n)))
    y = np.fft.irfft(np.fft.rfft(x, tam) * np.fft.rfft(ir, tam), tam)[: len(x)]
    return y

molhado = 0.45


def passa_alta(x, corte=38):
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (corte / np.maximum(fr, 1e-3)) ** 4)
    return np.fft.irfft(X, len(x))


L = passa_alta(L)
R = passa_alta(R)
L2 = L * (1 - molhado) + reverb(L, seed=1) * molhado
R2 = R * (1 - molhado) + reverb(R, seed=2) * molhado

# --- Master: entrada e saída suaves, nível uniforme ---
mestre = np.ones(N)
a = int(3.0 * SR)
mestre[:a] = np.linspace(0, 1, a) ** 2
s = int(6.0 * SR)
mestre[N - s:] = np.linspace(1, 0, s) ** 2
L2 *= mestre
R2 *= mestre

pico = max(np.max(np.abs(L2)), np.max(np.abs(R2)))
ganho = 0.5 / pico
st = np.stack([L2, R2], axis=1) * ganho
rms = np.sqrt(np.mean(st ** 2))
print(f"pico {20*np.log10(np.max(np.abs(st))):.1f} dBFS, rms {20*np.log10(rms):.1f} dBFS")

pcm = (np.clip(st, -1, 1) * 32767).astype("<i2")
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
