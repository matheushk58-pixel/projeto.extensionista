import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Abertura } from "./cenas/Abertura";
import { OQueSao } from "./cenas/OQueSao";
import { Escala } from "./cenas/Escala";
import { Oceanos } from "./cenas/Oceanos";
import { Cadeia } from "./cenas/Cadeia";
import { Efeitos } from "./cenas/Efeitos";
import { Exposicao } from "./cenas/Exposicao";
import { Corpo } from "./cenas/Corpo";
import { Arterias } from "./cenas/Arterias";
import { Brasil } from "./cenas/Brasil";
import { Incertezas } from "./cenas/Incertezas";
import { Acoes } from "./cenas/Acoes";
import { Encerramento, Equipe, Fontes, Projeto } from "./cenas/Final";
import { COR } from "./tema";
import { DURACOES } from "./narracao";

// Duração de cada cena em quadros (30 fps): o mínimo para ler, esticado para caber a narração (src/narracao.ts).
export const CENAS = [
  { id: "Abertura", componente: Abertura, duracao: DURACOES.Abertura },
  { id: "OQueSao", componente: OQueSao, duracao: DURACOES.OQueSao },
  { id: "Escala", componente: Escala, duracao: DURACOES.Escala },
  { id: "Oceanos", componente: Oceanos, duracao: DURACOES.Oceanos },
  { id: "Cadeia", componente: Cadeia, duracao: DURACOES.Cadeia },
  { id: "Efeitos", componente: Efeitos, duracao: DURACOES.Efeitos },
  { id: "Exposicao", componente: Exposicao, duracao: DURACOES.Exposicao },
  { id: "Corpo", componente: Corpo, duracao: DURACOES.Corpo },
  { id: "Arterias", componente: Arterias, duracao: DURACOES.Arterias },
  { id: "Brasil", componente: Brasil, duracao: DURACOES.Brasil },
  { id: "Incertezas", componente: Incertezas, duracao: DURACOES.Incertezas },
  { id: "Acoes", componente: Acoes, duracao: DURACOES.Acoes },
  { id: "Projeto", componente: Projeto, duracao: DURACOES.Projeto },
  { id: "Fontes", componente: Fontes, duracao: DURACOES.Fontes },
  { id: "Equipe", componente: Equipe, duracao: DURACOES.Equipe },
  { id: "Encerramento", componente: Encerramento, duracao: DURACOES.Encerramento },
];
export const TRANSICAO = 15;
export const DURACAO_TOTAL = CENAS.reduce((s, c) => s + c.duracao, 0) - TRANSICAO * (CENAS.length - 1);

// Barra fina na base: mostra quanto falta do vídeo.
const Progresso: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 8, width: "100%", background: "rgba(15,39,51,.25)" }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 8, background: COR.ambar, width: `${interpolate(f, [0, durationInFrames - 1], [0, 100])}%` }} />
    </AbsoluteFill>
  );
};

export const Apresentacao: React.FC = () => (
  <AbsoluteFill style={{ background: COR.escuro }}>
    <TransitionSeries>
      {CENAS.flatMap((c, i) => {
        const Comp = c.componente;
        const seq = (
          <TransitionSeries.Sequence key={c.id} name={c.id} durationInFrames={c.duracao}>
            <Comp />
          </TransitionSeries.Sequence>
        );
        if (i === CENAS.length - 1) return [seq];
        // slide só na virada do ambiente aquático para o corpo humano
        const apresentacao = CENAS[i + 1].id === "Exposicao" ? slide({ direction: "from-right" }) : fade();
        return [seq, <TransitionSeries.Transition key={c.id + "-t"} presentation={apresentacao} timing={linearTiming({ durationInFrames: TRANSICAO })} />];
      })}
    </TransitionSeries>
    <Progresso />
    {/* Narração (scripts/narrar.py) e trilha ambiente original (scripts/trilha.py), mais baixa para não competir com a voz */}
    <Audio src={staticFile("narracao.wav")} volume={1} />
    <Audio src={staticFile("trilha.mp3")} volume={0.32} />
  </AbsoluteFill>
);
