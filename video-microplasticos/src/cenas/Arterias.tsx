import { AbsoluteFill, useCurrentFrame } from "remotion";
import { conta, COR, fmt, FONTES, Fonte, P, prog, surge, T } from "../tema";

export const Arterias: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COR.rosaTexto, color: "#fff", fontFamily: FONTES.serif, padding: "110px 140px 150px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 34 }}>
      <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 600, fontSize: T.apoio, color: "#FFD9E3", ...surge(f, 5) }}>Artérias carótidas · New England Journal of Medicine, 2024</p>
      <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 800, fontSize: 168, lineHeight: 1, letterSpacing: -5, fontVariantNumeric: "tabular-nums", ...surge(f, 12) }}>
        {fmt(1 + conta(f, 15, 45, 3.5), 1)}× mais risco
      </p>
      <P cor="#FFF4F6" tamanho={T.corpo} estilo={{ maxWidth: 1450, ...surge(f, 45) }}>de infarto, AVC ou morte em cerca de 34 meses entre quem tinha plástico nas placas de gordura das artérias.</P>
      <p style={{ margin: "10px 0 0", alignSelf: "flex-start", fontFamily: FONTES.display, fontWeight: 700, fontSize: 44, background: "#FFF4F6", color: "#8E1B40", padding: "18px 34px", borderRadius: 999, opacity: prog(f, 110, 18), scale: `${0.9 + 0.1 * prog(f, 110, 22)}` }}>
        Mostra associação, não prova causa.
      </p>
      <Fonte cor="#FFD9E3">Fonte: Marfella et al. (2024), NEJM · estudo observacional com 257 pacientes</Fonte>
    </AbsoluteFill>
  );
};
