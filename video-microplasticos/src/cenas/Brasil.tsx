import { useCurrentFrame } from "remotion";
import { Cartao, Cena, COR, FONTES, Fonte, Numero, P, prog, surge, Titulo } from "../tema";

// Cada ponto é uma amostra; os coloridos tinham plástico.
const Pontos: React.FC<{ total: number; com: number; inicio: number }> = ({ total, com, inicio }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, width: 560 }}>
      {Array.from({ length: total }).map((_, k) => (
        <div key={k} style={{ width: 44, height: 44, borderRadius: 22, background: k < com && f > inicio + k * 5 ? COR.verdeEscuro : COR.filtro3, scale: `${0.4 + 0.6 * prog(f, inicio - 25 + k * 1.5, 12)}`, opacity: prog(f, inicio - 25 + k * 1.5, 10) }} />
      ))}
    </div>
  );
};

export const Brasil: React.FC = () => {
  const f = useCurrentFrame();
  const bloco = (rotulo: string, numero: string, texto: string, total: number, com: number, inicio: number) => (
    <Cartao estilo={{ flex: 1, borderLeft: `14px solid ${COR.verdeEscuro}`, gap: 24, ...surge(f, inicio - 30, 24, 60) }}>
      <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 600, fontSize: 40, color: COR.verdeEscuro }}>{rotulo}</p>
      <Numero cor={COR.tinta} tamanho={120}>{numero}</Numero>
      <Pontos total={total} com={com} inicio={inicio} />
      <P>{texto}</P>
    </Cartao>
  );
  return (
    <Cena fundo={COR.filtro}>
      <Titulo>A pesquisa brasileira</Titulo>
      <div style={{ display: "flex", gap: 48, flex: 1 }}>
        {bloco("Pulmão · 2021", "13 de 20", "amostras de pulmão em São Paulo tinham plástico", 20, 13, 50)}
        {bloco("Bulbo olfatório · 2024", "8 de 15", "pessoas tinham plástico na entrada do cérebro", 15, 8, 170)}
      </div>
      <Fonte>Fontes: Amato-Lourenço et al. (2021), J. Hazard. Mater. · (2024), JAMA Netw. Open · USP e IPT</Fonte>
    </Cena>
  );
};
