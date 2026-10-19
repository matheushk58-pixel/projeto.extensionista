import { useCurrentFrame } from "remotion";
import { Cena, conta, COR, fmt, FONTES, Fonte, Numero, P, prog, surge, Titulo } from "../tema";

// Três estimativas e a comparação torneira x garrafa (cada quadrado = 1.000 partículas por ano).
export const Exposicao: React.FC = () => {
  const f = useCurrentFrame();
  const quadrados = (n: number, inicio: number, cor: string) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, width: 1200 }}>
      {Array.from({ length: n }).map((_, k) => (
        <div key={k} style={{ width: 19, height: 19, borderRadius: 4, background: cor, opacity: prog(f, inicio + k * 1.2, 8), scale: `${prog(f, inicio + k * 1.2, 10)}` }} />
      ))}
    </div>
  );
  return (
    <Cena fundo={COR.filtro}>
      <Titulo>Quanto plástico chega até nós</Titulo>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 56 }}>
        <div style={{ borderTop: `4px solid ${COR.tinta}`, paddingTop: 28, display: "flex", flexDirection: "column", gap: 14, ...surge(f, 15) }}>
          <Numero tamanho={72}>{fmt(conta(f, 18, 40, 39))} a {fmt(conta(f, 18, 40, 52))} mil</Numero>
          <P>partículas engolidas por pessoa, por ano</P>
        </div>
        <div style={{ borderTop: `4px solid ${COR.tinta}`, paddingTop: 28, display: "flex", flexDirection: "column", gap: 14, ...surge(f, 60) }}>
          <Numero tamanho={72}>+{fmt(conta(f, 62, 40, 74))} mil</Numero>
          <P>por ano, somando o que respiramos</P>
        </div>
        <div style={{ borderTop: `4px solid ${COR.tinta}`, paddingTop: 28, display: "flex", flexDirection: "column", gap: 14, ...surge(f, 105) }}>
          <Numero tamanho={72}>{fmt(conta(f, 108, 40, 240))} mil</Numero>
          <P>por litro de água engarrafada, em média</P>
        </div>
      </div>
      <div style={{ background: "#FBFCFB", borderRadius: 28, padding: "40px 48px", display: "flex", flexDirection: "column", gap: 26, ...surge(f, 190) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <p style={{ margin: 0, width: 300, fontFamily: FONTES.display, fontWeight: 700, fontSize: 44 }}>Torneira</p>
          {quadrados(4, 205, COR.ciano)}
          <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 800, fontSize: 44, whiteSpace: "nowrap" }}>≈ 4 mil</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <p style={{ margin: 0, width: 300, fontFamily: FONTES.display, fontWeight: 700, fontSize: 44 }}>Garrafa</p>
          {quadrados(94, 225, COR.rosa)}
          <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 800, fontSize: 44, whiteSpace: "nowrap", color: COR.rosaTexto }}>≈ 94 mil</p>
        </div>
      </div>
      <Fonte>Fontes: Cox et al. (2019), Environ. Sci. Technol. · Qian et al. (2024), PNAS · cada quadrado = 1.000 partículas por ano</Fonte>
    </Cena>
  );
};
