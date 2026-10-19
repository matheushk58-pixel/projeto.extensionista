import { useCurrentFrame } from "remotion";
import { Cartao, Cena, COR, Fonte, H3, P, surge, Titulo } from "../tema";

const ITENS = [
  { titulo: "Danos físicos", texto: "Ferem ou bloqueiam o trato digestivo e dão falsa saciedade.", cor: COR.rosa },
  { titulo: "Carona para poluentes", texto: "Atraem poluentes da água e carregam aditivos químicos.", cor: COR.ambar },
  { titulo: "Biofilme", texto: "Levam bactérias grudadas para novos ambientes.", cor: COR.ciano },
];

export const Efeitos: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cena fundo={COR.filtro2}>
      <Titulo>Efeitos na vida aquática</Titulo>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, flex: 1, alignItems: "center" }}>
        {ITENS.map((it, i) => (
          <Cartao key={it.titulo} estilo={{ borderTop: `12px solid ${it.cor}`, minHeight: 420, ...surge(f, 25 + i * 45, 24, 70) }}>
            <H3 tamanho={60}>{it.titulo}</H3>
            <P tamanho={46}>{it.texto}</P>
          </Cartao>
        ))}
      </div>
      <Fonte>Fontes: Wright, Thompson e Galloway (2013) · GESAMP (2015)</Fonte>
    </Cena>
  );
};
