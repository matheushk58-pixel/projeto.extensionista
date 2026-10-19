import { AbsoluteFill, useCurrentFrame } from "remotion";
import { conta, COR, fmt, FONTES, Fonte, Numero, P, Particulas, surge, T, Titulo } from "../tema";

export const Oceanos: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COR.escuro, color: "#fff", fontFamily: FONTES.serif }}>
      <Particulas semente="oceano" n={30} opacidade={0.45} />
      <AbsoluteFill style={{ padding: "110px 140px 130px", display: "flex", flexDirection: "column", gap: 64 }}>
        <Titulo cor="#fff">Os oceanos em números</Titulo>
        <div style={{ display: "flex", gap: 80, flex: 1, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24, borderTop: "3px solid #3C5966", paddingTop: 40, ...surge(f, 12) }}>
            <Numero cor={COR.cianoClaro} tamanho={96}>{fmt(conta(f, 15, 55, 5.25), 2)} trilhões</Numero>
            <P cor={COR.escuroTexto} tamanho={T.corpo}>de partículas de plástico flutuam nos oceanos, numa estimativa mínima.</P>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24, borderTop: "3px solid #3C5966", paddingTop: 40, ...surge(f, 120) }}>
            <Numero cor={COR.ambarClaro} tamanho={96}>até {fmt(conta(f, 125, 50, 12.7), 1)} mi t</Numero>
            <P cor={COR.escuroTexto} tamanho={T.corpo}>de resíduos plásticos chegaram ao mar em um único ano, 2010.</P>
          </div>
        </div>
      </AbsoluteFill>
      <Fonte cor="#8FA8B1">Fontes: Eriksen et al. (2014), PLOS ONE · Jambeck et al. (2015), Science</Fonte>
    </AbsoluteFill>
  );
};
