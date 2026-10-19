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
  "Thompson et al., 2004 · Science", "OMS, 2022", "PNUMA, 2021", "Eriksen et al., 2014 · PLOS ONE", "Jambeck et al., 2015 · Science",
  "Rochman et al., 2015 · Sci. Reports", "Cole et al., 2013 · ES&T", "Wright et al., 2013 · Environ. Pollut.", "GESAMP, 2015", "OMS, 2019",
  "Cox et al., 2019 · ES&T", "Qian et al., 2024 · PNAS", "Ragusa et al., 2021 · Environ. Int.", "Amato-Lourenço et al., 2021 · J. Hazard. Mater.",
  "Leslie et al., 2022 · Environ. Int.", "Marfella et al., 2024 · NEJM", "Amato-Lourenço et al., 2024 · JAMA Netw. Open", "Nihart et al., 2025 · Nature Medicine",
  "EFSA, 2016 · EFSA Journal", "Napper e Thompson, 2016 · Mar. Pollut. Bull.", "Schuyler et al., 2014 · Conserv. Biol.",
];

export const Fontes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cena fundo={COR.filtro}>
      <Titulo>Fontes</Titulo>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px 48px" }}>
        {REFS.map((r, i) => (
          <p key={r} style={{ margin: 0, fontFamily: FONTES.display, fontSize: 32, lineHeight: 1.3, color: COR.tintaSuave, opacity: prog(f, 15 + i * 3, 14) }}>
            <b style={{ color: COR.tinta }}>{i + 1}.</b> {r}
          </p>
        ))}
      </div>
      <P estilo={{ opacity: prog(f, 90, 20) }}>Referências completas, no formato ABNT e com DOI, no site do projeto.</P>
    </Cena>
  );
};

export const Encerramento: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COR.escuro, color: "#fff", fontFamily: FONTES.serif }}>
      <Particulas semente="fim" />
      <AbsoluteFill style={{ padding: "110px 140px 150px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
        <h2 style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 800, fontSize: 168, letterSpacing: -5, lineHeight: 1, ...surge(f, 8, 24, 60) }}>Obrigado!</h2>
        <P cor={COR.escuroTexto} tamanho={T.corpo} estilo={surge(f, 28)}>Teste o que aprendeu no quiz e no minijogo do site.</P>
        <p style={{ margin: 0, fontFamily: FONTES.display, fontSize: T.apoio, color: COR.escuroTexto, ...surge(f, 45) }}>[Nomes do grupo] · [Curso] · [Instituição]</p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
