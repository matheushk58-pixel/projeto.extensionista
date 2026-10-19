import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";

// Fontes locais (public/fontes): o navegador da renderização não acessa o Google Fonts.
const display = "Bricolage Grotesque", serif = "Source Serif 4";
loadFont({ family: display, url: staticFile("fontes/bricolage.woff2"), weight: "400 800" });
loadFont({ family: serif, url: staticFile("fontes/source-serif.woff2"), weight: "400 600" });

export const FONTES = { display: `"${display}", Arial, sans-serif`, serif: `"${serif}", Georgia, serif` };
export const COR = {
  filtro: "#F1F4F2",
  filtro2: "#E3E9E6",
  filtro3: "#D3DCD8",
  tinta: "#0F2733",
  tintaSuave: "#2B4350",
  cinza: "#4E626C",
  escuro: "#0F2733",
  escuroTexto: "#BFD3D9",
  rosa: "#D9366B",
  rosaTexto: "#C42A5C",
  ciano: "#1C9CC0",
  cianoClaro: "#6FD0EA",
  ambar: "#E3A821",
  ambarClaro: "#F2B84B",
  roxo: "#7A55C9",
  verde: "#2EA36B",
  verdeEscuro: "#1A7A42",
};
export const FRAGMENTOS = [COR.rosa, COR.ciano, COR.ambar, COR.roxo, COR.verde];

// Escala de texto para 1920 × 1080 (título, destaque, corpo, apoio, fonte)
export const T = { gigante: 220, titulo: 104, destaque: 84, corpo: 54, apoio: 42, fonte: 32 };

export const suave = Easing.bezier(0.16, 1, 0.3, 1);

/** 0 → 1 entre `inicio` e `inicio + dur` quadros, com saída suave. */
export const prog = (f: number, inicio: number, dur = 20) =>
  interpolate(f, [inicio, inicio + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });

/** Entrada padrão: aparece subindo. */
export const surge = (f: number, inicio: number, dur = 20, dist = 48): React.CSSProperties => ({
  opacity: prog(f, inicio, dur),
  translate: `0px ${(1 - prog(f, inicio, dur)) * dist}px`,
});

/** Contador que sobe até `fim`. */
export const conta = (f: number, inicio: number, dur: number, fim: number) =>
  interpolate(f, [inicio, inicio + dur], [0, fim], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.25, 1, 0.5, 1) });

export const Cena: React.FC<{ fundo: string; cor?: string; children: React.ReactNode }> = ({ fundo, cor = COR.tinta, children }) => (
  <AbsoluteFill style={{ background: fundo, color: cor, fontFamily: FONTES.serif, padding: "100px 140px 160px", display: "flex", flexDirection: "column", gap: 48 }}>
    {children}
  </AbsoluteFill>
);

export const Titulo: React.FC<{ children: React.ReactNode; cor?: string; inicio?: number; largura?: number }> = ({ children, cor = COR.tinta, inicio = 0, largura = 1640 }) => {
  const f = useCurrentFrame();
  return (
    <h2 style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 800, fontSize: T.titulo, lineHeight: 1.02, letterSpacing: -3, color: cor, maxWidth: largura, ...surge(f, inicio, 22, 36) }}>
      {children}
    </h2>
  );
};

/** Fonte científica no rodapé de cada cena. */
export const Fonte: React.FC<{ children: React.ReactNode; cor?: string; inicio?: number }> = ({ children, cor = COR.cinza, inicio = 30 }) => {
  const f = useCurrentFrame();
  return (
    <p style={{ position: "absolute", left: 140, bottom: 64, margin: 0, width: 1640, fontFamily: FONTES.display, fontSize: T.fonte, color: cor, opacity: prog(f, inicio, 24) }}>
      {children}
    </p>
  );
};

/** Fragmentos de plástico subindo devagar, como na abertura do site. */
export const Particulas: React.FC<{ n?: number; opacidade?: number; semente?: string }> = ({ n = 46, opacidade = 0.9, semente = "p" }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }} aria-hidden>
      {Array.from({ length: n }).map((_, i) => {
        const x = random(semente + "x" + i) * width;
        const vel = 0.25 + random(semente + "v" + i) * 0.7;
        const y = ((random(semente + "y" + i) * (height + 200) - f * vel) % (height + 200) + height + 200) % (height + 200) - 100;
        const s = 6 + random(semente + "s" + i) * 22;
        const rot = random(semente + "r" + i) * 360 + f * (random(semente + "w" + i) - 0.5) * 2;
        const cor = FRAGMENTOS[i % FRAGMENTOS.length];
        const tipo = i % 3;
        return (
          <g key={i} transform={`translate(${x + Math.sin(f / 40 + i) * 12} ${y}) rotate(${rot})`} opacity={opacidade * (0.35 + random(semente + "o" + i) * 0.65)}>
            {tipo === 0 && <path d={`M${-s} ${-s * 0.4} L${s * 0.6} ${-s} L${s} ${s * 0.5} L${-s * 0.3} ${s}Z`} fill={cor} />}
            {tipo === 1 && <circle r={s * 0.45} fill={cor} />}
            {tipo === 2 && <path d={`M${-s * 1.6} 0 q${s * 0.8} ${-s} ${s * 1.6} 0 t${s * 1.6} 0`} stroke={cor} strokeWidth={4} fill="none" strokeLinecap="round" />}
          </g>
        );
      })}
    </svg>
  );
};

export const Cartao: React.FC<{ children: React.ReactNode; estilo?: React.CSSProperties }> = ({ children, estilo }) => (
  <div style={{ background: "#FBFCFB", border: `1.5px solid ${COR.filtro3}`, borderRadius: 28, padding: "44px 48px", display: "flex", flexDirection: "column", gap: 16, ...estilo }}>
    {children}
  </div>
);

export const H3: React.FC<{ children: React.ReactNode; cor?: string; tamanho?: number }> = ({ children, cor = COR.tinta, tamanho = 56 }) => (
  <h3 style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 700, fontSize: tamanho, lineHeight: 1.1, letterSpacing: -1, color: cor }}>{children}</h3>
);

export const P: React.FC<{ children: React.ReactNode; cor?: string; tamanho?: number; estilo?: React.CSSProperties }> = ({ children, cor = COR.tintaSuave, tamanho = T.apoio, estilo }) => (
  <p style={{ margin: 0, fontSize: tamanho, lineHeight: 1.4, color: cor, ...estilo }}>{children}</p>
);

export const Numero: React.FC<{ children: React.ReactNode; cor?: string; tamanho?: number; estilo?: React.CSSProperties }> = ({ children, cor = COR.rosaTexto, tamanho = T.destaque, estilo }) => (
  <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 800, fontSize: tamanho, lineHeight: 1, letterSpacing: -3, color: cor, fontVariantNumeric: "tabular-nums", ...estilo }}>{children}</p>
);

export const fmt = (n: number, casas = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
