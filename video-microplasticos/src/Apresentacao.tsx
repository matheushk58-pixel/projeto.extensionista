import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
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

// Duração de cada cena em quadros (30 fps), pensada para dar tempo de ler.
export const CENAS = [
  { id: "Abertura", componente: Abertura, duracao: 195 },
  { id: "OQueSao", componente: OQueSao, duracao: 450 },
  { id: "Escala", componente: Escala, duracao: 450 },
  { id: "Oceanos", componente: Oceanos, duracao: 270 },
  { id: "Cadeia", componente: Cadeia, duracao: 450 },
  { id: "Efeitos", componente: Efeitos, duracao: 330 },
  { id: "Exposicao", componente: Exposicao, duracao: 420 },
  { id: "Corpo", componente: Corpo, duracao: 510 },
  { id: "Arterias", componente: Arterias, duracao: 300 },
  { id: "Brasil", componente: Brasil, duracao: 360 },
  { id: "Incertezas", componente: Incertezas, duracao: 480 },
  { id: "Acoes", componente: Acoes, duracao: 420 },
  { id: "Projeto", componente: Projeto, duracao: 300 },
  { id: "Fontes", componente: Fontes, duracao: 240 },
  { id: "Equipe", componente: Equipe, duracao: 210 },
  { id: "Encerramento", componente: Encerramento, duracao: 180 },
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
  </AbsoluteFill>
);
