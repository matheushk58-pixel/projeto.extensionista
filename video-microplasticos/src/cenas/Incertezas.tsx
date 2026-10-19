import { useCurrentFrame } from "remotion";
import { Cartao, Cena, COR, Fonte, H3, P, surge, Titulo } from "../tema";

const LIMITES = [
  { t: "Amostras pequenas", d: "poucas dezenas de pessoas" },
  { t: "Métodos sem padrão", d: "sobretudo abaixo de 10 µm" },
  { t: "Contaminação", d: "o laboratório também tem plástico" },
  { t: "Associação, não causa", d: "doses dos testes nem sempre são as reais" },
];

export const Incertezas: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cena fundo={COR.filtro2}>
      <Titulo>O que a ciência ainda não sabe</Titulo>
      <P tamanho={48} cor={COR.tinta} estilo={{ maxWidth: 1500, borderLeft: `10px solid ${COR.ambar}`, paddingLeft: 36, ...surge(f, 20) }}>
        Achar plástico em um órgão não prova que ele causa doença. Para a OMS, os dados ainda não bastam para medir o risco.
      </P>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {LIMITES.map((l, i) => (
          <Cartao key={l.t} estilo={{ padding: "28px 36px", gap: 6, ...surge(f, 120 + i * 35) }}>
            <H3 tamanho={44}>{l.t}</H3>
            <P>{l.d}</P>
          </Cartao>
        ))}
      </div>
      <Fonte>Fonte: Organização Mundial da Saúde (2022)</Fonte>
    </Cena>
  );
};
