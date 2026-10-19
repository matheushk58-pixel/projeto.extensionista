import { useCurrentFrame } from "remotion";
import { Cartao, Cena, COR, Fonte, H3, Numero, P, prog, surge, T, Titulo } from "../tema";

export const OQueSao: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cena fundo={COR.filtro}>
      <Titulo>O que são microplásticos</Titulo>
      <div style={{ display: "flex", gap: 72, flex: 1, alignItems: "center" }}>
        <div style={{ flex: 1.1, display: "flex", flexDirection: "column", gap: 28 }}>
          <Numero tamanho={T.gigante} estilo={{ opacity: prog(f, 18, 18), scale: `${0.7 + 0.3 * prog(f, 18, 26)}`, transformOrigin: "0 70%" }}>&lt; 5 mm</Numero>
          <P tamanho={T.corpo} estilo={surge(f, 45)}>Pedaços de plástico menores que um grão de arroz.</P>
          <P tamanho={T.corpo} estilo={surge(f, 95)}>Abaixo de 1 micrômetro, viram <b style={{ color: COR.tinta }}>nanoplásticos</b>.</P>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 28 }}>
          <Cartao estilo={{ opacity: prog(f, 170), translate: `${(1 - prog(f, 170, 24)) * 80}px 0px` }}>
            <H3 cor="#0E6F8F">Primários</H3>
            <P>Já fabricados pequenos: microesferas de cosméticos e pellets industriais.</P>
          </Cartao>
          <Cartao estilo={{ opacity: prog(f, 215), translate: `${(1 - prog(f, 215, 24)) * 80}px 0px` }}>
            <H3 cor="#0E6F8F">Secundários</H3>
            <P>Vêm da quebra de garrafas, sacolas, redes e roupas sintéticas. São a maioria.</P>
          </Cartao>
        </div>
      </div>
      <Fonte>Fontes: Thompson et al. (2004), Science · PNUMA (2021)</Fonte>
    </Cena>
  );
};
