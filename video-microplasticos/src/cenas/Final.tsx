import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Cena, COR, FONTES, P, Particulas, prog, surge, T, Titulo } from "../tema";

const RECURSOS = [
  { t: "Cenas em 3D", d: "partículas e um recife com a cadeia alimentar" },
  { t: "Mapa do corpo", d: "cada órgão com o estudo e o dado" },
  { t: "Quiz", d: "verdadeiro ou falso, com a fonte" },
  { t: "Minijogo", d: "recolha o plástico antes que se quebre" },
];

export const Projeto: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COR.escuro, color: "#fff", fontFamily: FONTES.serif, padding: "110px 140px 130px", display: "flex", flexDirection: "column", gap: 52 }}>
      <Titulo cor="#fff">A ação extensionista</Titulo>
      <P tamanho={T.corpo} cor={COR.escuroTexto} estilo={{ maxWidth: 1500, ...surge(f, 18) }}>Um site aberto à comunidade que explica o tema com fontes científicas e ensina brincando.</P>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}>
        {RECURSOS.map((r, i) => (
          <div key={r.t} style={{ background: "#16384A", borderRadius: 26, padding: "36px 34px", display: "flex", flexDirection: "column", gap: 14, ...surge(f, 60 + i * 22, 22, 60) }}>
            <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 700, fontSize: 48, color: "#fff" }}>{r.t}</p>
            <P cor={COR.escuroTexto} tamanho={38}>{r.d}</P>
          </div>
        ))}
      </div>
      <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 700, fontSize: 56, color: COR.ambarClaro, ...surge(f, 170) }}>[endereço do site]</p>
    </AbsoluteFill>
  );
};

const REFS = [
  "OMS, 2019 e 2022", "PNUMA, 2021", "Eriksen et al., 2014 · PLOS ONE", "Cox et al., 2019 · ES&T",
  "Marfella et al., 2024 · NEJM", "Nihart et al., 2025 · Nature Medicine", "Amato-Lourenço et al., 2021 e 2024 · USP", "EFSA, 2016",
];

export const Fontes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cena fundo={COR.filtro}>
      <Titulo>Principais fontes</Titulo>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "26px 72px" }}>
        {REFS.map((r, i) => (
          <p key={r} style={{ margin: 0, fontFamily: FONTES.display, fontSize: 46, lineHeight: 1.25, color: COR.tintaSuave, borderBottom: `2px solid ${COR.filtro3}`, paddingBottom: 18, opacity: prog(f, 12 + i * 5, 14) }}>{r}</p>
        ))}
      </div>
      <P tamanho={T.corpo} cor={COR.tinta} estilo={{ opacity: prog(f, 70, 20) }}>As 24 referências completas, em ABNT e com DOI, estão no site.</P>
    </Cena>
  );
};

export const Encerramento: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COR.escuro, color: "#fff", fontFamily: FONTES.serif }}>
      <Particulas semente="fim" opacidade={0.6} />
      <AbsoluteFill style={{ padding: "110px 140px 150px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
        <h2 style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 800, fontSize: 168, letterSpacing: -5, lineHeight: 1, ...surge(f, 8, 24, 60) }}>Obrigado!</h2>
        <P cor={COR.escuroTexto} tamanho={T.corpo} estilo={surge(f, 28)}>Teste o que aprendeu no quiz e no minijogo do site.</P>
        <p style={{ margin: 0, fontFamily: FONTES.display, fontSize: T.apoio, color: COR.escuroTexto, ...surge(f, 45) }}>Grupo 4 · Universidade Nove de Julho · 2026</p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EQUIPE = [
  "Matheus Henrique Quintino Julio", "Rafael Sobreira Feitoza", "João Fabrício Sivero", "Fabiana Bernadino da Costa Rodrigues",
  "Sara dos Santos Rocha", "Maiara Rosa da Silva", "Eduardo Talhoni Ribeiro", "Emily Janaína Santos Silva",
  "Maria Letícia Lima Madrid", "Victoria Gabriely Oliveira Santos", "Ana Clara Silva Dantas", "Ana Lívia de Freitas Rocha",
];

export const Equipe: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cena fundo={COR.filtro}>
      <Titulo>Equipe</Titulo>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 72px" }}>
        {EQUIPE.map((n, i) => (
          <p key={n} style={{ margin: 0, fontFamily: FONTES.display, fontSize: 46, lineHeight: 1.2, color: COR.tinta, padding: "16px 0", borderBottom: `2px solid ${COR.filtro3}`, ...surge(f, 10 + i * 4, 16, 20) }}>{n}</p>
        ))}
      </div>
      <P estilo={{ opacity: prog(f, 70, 20) }}>Universidade Nove de Julho · São Paulo, 2026</P>
    </Cena>
  );
};
