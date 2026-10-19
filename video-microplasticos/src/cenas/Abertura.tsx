import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COR, FONTES, Particulas, prog, surge, T } from "../tema";

export const Abertura: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COR.escuro, color: "#fff", fontFamily: FONTES.serif }}>
      <Particulas semente="abertura" opacidade={0.6} />
      <AbsoluteFill style={{ padding: "110px 140px 150px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 28 }}>
        <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 600, fontSize: T.apoio, color: COR.cianoClaro, ...surge(f, 6) }}>Projeto extensionista</p>
        <h1 style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 800, fontSize: 168, lineHeight: 0.95, letterSpacing: -5 }}>
          <span style={{ display: "block", ...surge(f, 14, 24, 70) }}>Microplásticos</span>
          <span style={{ display: "block", color: COR.cianoClaro, ...surge(f, 24, 24, 70) }}>e Saúde</span>
        </h1>
        <div style={{ height: 8, width: 360, background: COR.rosa, borderRadius: 4, transformOrigin: "0 50%", scale: `${prog(f, 40, 30)} 1` }} />
        <p style={{ margin: 0, fontSize: T.corpo, color: COR.escuroTexto, maxWidth: 1300, ...surge(f, 50) }}>Impactos no corpo humano e nos ecossistemas aquáticos</p>
        <p style={{ margin: 0, fontFamily: FONTES.display, fontSize: T.apoio, color: COR.escuroTexto, ...surge(f, 65) }}>Universidade Nove de Julho · Grupo 4 · 2026</p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
