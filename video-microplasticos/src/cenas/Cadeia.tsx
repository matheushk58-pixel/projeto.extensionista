import { useCurrentFrame } from "remotion";
import { Cena, COR, FONTES, Fonte, FRAGMENTOS, P, prog, surge, Titulo } from "../tema";

// Quatro elos; o plástico viaja pela linha e se acumula em cada um.
const ELOS = [
  { nome: "Plâncton", texto: "confunde microesferas com comida" },
  { nome: "Filtradores", texto: "mexilhões retêm o que passa" },
  { nome: "Peixes", texto: "1 em 4 vendidos tinha detritos" },
  { nome: "Pessoas", texto: "frutos do mar, sal e água" },
];
const INICIO = 30, PASSO = 90, X0 = 200, DX = 413, Y = 170;

const Icone: React.FC<{ i: number }> = ({ i }) => {
  const s = { fill: "none", stroke: COR.tinta, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (i === 0) return <g><ellipse cx={0} cy={0} rx={46} ry={30} fill="#BFE9F2" stroke={COR.tinta} strokeWidth={6} /><path d="M30 -18 L80 -60 M30 18 L80 60" {...s} /><circle cx={-6} cy={0} r={10} fill={COR.rosa} /></g>;
  if (i === 1) return <g><path d="M-60 10 Q0 -60 60 10 Q0 40 -60 10Z" fill="#2E3F80" stroke={COR.tinta} strokeWidth={6} /><path d="M-50 12 Q0 30 50 12" stroke="#F08A4B" strokeWidth={10} fill="none" /></g>;
  if (i === 2) return <g><ellipse cx={0} cy={0} rx={56} ry={36} fill="#F57A1F" stroke={COR.tinta} strokeWidth={6} /><path d="M-54 0 L-90 -30 L-90 30Z" fill="#F57A1F" stroke={COR.tinta} strokeWidth={6} strokeLinejoin="round" /><circle cx={26} cy={-8} r={8} fill={COR.tinta} /></g>;
  return <g><circle cx={0} cy={-34} r={24} fill="#F2C230" stroke={COR.tinta} strokeWidth={6} /><path d="M-44 56 Q-44 0 0 0 Q44 0 44 56Z" fill="#1C9CC0" stroke={COR.tinta} strokeWidth={6} strokeLinejoin="round" /></g>;
};

export const Cadeia: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Cena fundo={COR.filtro}>
      <Titulo>Como o plástico sobe na cadeia alimentar</Titulo>
      <div style={{ position: "relative", flex: 1 }}>
        <svg width={1640} height={360} style={{ position: "absolute", left: 0, top: 0 }} aria-hidden>
          {ELOS.slice(0, -1).map((_, i) => {
            const p = prog(f, INICIO + i * PASSO + 40, 40);
            const x1 = X0 + i * DX + 110, x2 = X0 + (i + 1) * DX - 110;
            return (
              <g key={i}>
                <line x1={x1} y1={Y} x2={x1 + (x2 - x1) * p} y2={Y} stroke={COR.ciano} strokeWidth={8} strokeDasharray="4 18" strokeLinecap="round" />
                {[0, 1, 2].map(k => {
                  const q = prog(f, INICIO + i * PASSO + 50 + k * 10, 36);
                  return q > 0 && q < 1 ? <circle key={k} cx={x1 + (x2 - x1) * q} cy={Y + Math.sin(q * 6 + k) * 14} r={10} fill={FRAGMENTOS[(i + k) % 5]} /> : null;
                })}
              </g>
            );
          })}
          {ELOS.map((_, i) => {
            const p = prog(f, INICIO + i * PASSO, 22);
            const cx = X0 + i * DX;
            return (
              <g key={i} transform={`translate(${cx} ${Y}) scale(${0.6 + 0.4 * p})`} opacity={p}>
                <circle r={110} fill={i === 3 ? COR.tinta : "#FBFCFB"} stroke={i === 3 ? COR.tinta : COR.filtro3} strokeWidth={4} />
                <g transform={i === 3 ? "scale(1)" : undefined}>{i === 3 ? <g transform="translate(0 -6)"><circle cx={0} cy={-34} r={24} fill="#F2C230" /><path d="M-44 56 Q-44 0 0 0 Q44 0 44 56Z" fill="#6FD0EA" /></g> : <Icone i={i} />}</g>
                {/* plástico acumulado: mais pontos a cada elo */}
                {Array.from({ length: (i + 1) * 4 }).map((__, k) => {
                  const a = (k / ((i + 1) * 4)) * Math.PI * 2;
                  return <circle key={k} cx={Math.cos(a) * 132} cy={Math.sin(a) * 132} r={8} fill={FRAGMENTOS[k % 5]} opacity={prog(f, INICIO + i * PASSO + 30 + k * 3, 10)} />;
                })}
              </g>
            );
          })}
        </svg>
        {ELOS.map((e, i) => (
          <div key={e.nome} style={{ position: "absolute", left: X0 + i * DX - 195, top: Y + 165, width: 390, textAlign: "center", ...surge(f, INICIO + i * PASSO + 10) }}>
            <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 800, fontSize: 56, letterSpacing: -1 }}>{e.nome}</p>
            <P estilo={{ marginTop: 8 }}>{e.texto}</P>
          </div>
        ))}
      </div>
      <Fonte>Fontes: Cole et al. (2013) · Wright et al. (2013) · Rochman et al. (2015) · OMS (2022)</Fonte>
    </Cena>
  );
};
