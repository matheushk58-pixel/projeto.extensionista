import { useCurrentFrame } from "remotion";
import { Cena, COR, FONTES, Fonte, prog, surge, Titulo } from "../tema";

const COLUNAS = [
  { titulo: "No dia a dia", itens: ["Água filtrada da torneira", "Nada de esquentar comida em pote plástico", "Pano úmido na limpeza da casa", "Roupa sintética em ciclo frio"] },
  { titulo: "Na comunidade", itens: ["Separar o reciclável", "Mutirões em praias e rios", "Menos descartáveis", "Cobrar saneamento básico"] },
];

export const Acoes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cena fundo={COR.filtro}>
      <Titulo>O que dá para fazer</Titulo>
      <div style={{ display: "flex", gap: 80, flex: 1 }}>
        {COLUNAS.map((c, ci) => (
          <div key={c.titulo} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 700, fontSize: 56, borderBottom: `5px solid ${COR.tinta}`, paddingBottom: 18, ...surge(f, 15 + ci * 20) }}>{c.titulo}</p>
            {c.itens.map((it, i) => {
              const ini = 50 + (ci * 4 + i) * 32;
              const marca = prog(f, ini + 14, 12);
              return (
                <div key={it} style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 0", borderBottom: `2px solid ${COR.filtro3}`, ...surge(f, ini, 18, 24) }}>
                  <svg width={52} height={52} viewBox="0 0 52 52" style={{ flex: "none" }} aria-hidden>
                    <rect x={3} y={3} width={46} height={46} rx={12} fill={marca > 0.5 ? COR.verdeEscuro : "none"} stroke={marca > 0.5 ? COR.verdeEscuro : COR.cinza} strokeWidth={4} />
                    <path d="M14 27 L23 36 L39 17" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - marca)} />
                  </svg>
                  <span style={{ fontSize: 46, lineHeight: 1.25, color: COR.tintaSuave }}>{it}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <Fonte>Uma carga de 6 kg de roupas de acrílico pode soltar cerca de 700 mil fibras (Napper e Thompson, 2016)</Fonte>
    </Cena>
  );
};
