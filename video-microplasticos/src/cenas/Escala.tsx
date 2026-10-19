import { useCurrentFrame } from "remotion";
import { Cena, COR, FONTES, Fonte, prog, T, Titulo } from "../tema";

// Uma partícula que encolhe em quatro paradas; a faixa de baixo mostra até onde ela chega no corpo.
const PARADAS = [
  { rotulo: "5 mm", compara: "um grão de arroz", raio: 230, zona: 0 },
  { rotulo: "150 µm", compara: "um fio de cabelo", raio: 120, zona: 1 },
  { rotulo: "1,5 µm", compara: "uma bactéria", raio: 46, zona: 2 },
  { rotulo: "100 nm", compara: "um vírus", raio: 14, zona: 2 },
];
const ZONAS = [
  { texto: "Fica no intestino", cor: COR.filtro3, flex: 30 },
  { texto: "Pequena fração atravessa o intestino", cor: "#EBC765", flex: 44 },
  { texto: "Pode chegar a órgãos", cor: "#E98AA8", flex: 26 },
];
const INICIO = 30, PASSO = 95;

export const Escala: React.FC = () => {
  const f = useCurrentFrame();
  const tempo = (i: number) => INICIO + i * PASSO;
  const idx = PARADAS.reduce((a, _, i) => (f >= tempo(i) - 10 ? i : a), 0);
  const raio = PARADAS.reduce((r, p, i) => (i === 0 ? p.raio : r + (p.raio - PARADAS[i - 1].raio) * prog(f, tempo(i) - 18, 18)), 0);
  const troca = (i: number) => prog(f, tempo(i) - 6, 14) - (i < PARADAS.length - 1 ? prog(f, tempo(i + 1) - 18, 10) : 0);
  return (
    <Cena fundo={COR.filtro2}>
      <Titulo>Quanto menor, mais longe chega no corpo</Titulo>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 80 }}>
        <div style={{ width: 420, height: 420, display: "grid", placeItems: "center", opacity: prog(f, 15) }}>
          <svg width={420} height={420} viewBox="0 0 520 520" aria-hidden>
            <circle cx={260} cy={260} r={250} fill="none" stroke={COR.tinta} strokeWidth={4} strokeDasharray="6 14" opacity={0.35} />
            <path d={`M${260 - raio} ${260 - raio * 0.3} L${260 + raio * 0.5} ${260 - raio} L${260 + raio} ${260 + raio * 0.45} L${260 - raio * 0.25} ${260 + raio}Z`} fill={COR.rosa} />
          </svg>
        </div>
        <div style={{ flex: 1, position: "relative", height: 300 }}>
          {PARADAS.map((p, i) => (
            <div key={p.rotulo} style={{ position: "absolute", inset: 0, opacity: Math.max(0, troca(i)), translate: `0px ${(1 - Math.max(0, troca(i))) * 30}px` }}>
              <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 800, fontSize: 180, lineHeight: 1, letterSpacing: -6 }}>{p.rotulo}</p>
              <p style={{ margin: "16px 0 0", fontSize: T.corpo, color: COR.tintaSuave }}>do tamanho de {p.compara}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 20, opacity: prog(f, 40) }}>
        {ZONAS.map((z, i) => {
          const ativa = f > INICIO && PARADAS[idx].zona === i;
          return (
            <div key={z.texto} style={{ flex: z.flex, background: z.cor, borderRadius: 20, padding: "26px 30px", opacity: ativa ? 1 : 0.6, scale: ativa ? "1.02" : "1", outline: ativa ? `4px solid ${COR.tinta}` : "none" }}>
              <p style={{ margin: 0, fontFamily: FONTES.display, fontWeight: 700, fontSize: 40, lineHeight: 1.15, color: COR.tinta }}>{z.texto}</p>
            </div>
          );
        })}
      </div>
      <Fonte>Fonte: EFSA (2016), com base em estudos em roedores · a absorção é considerada muito baixa</Fonte>
    </Cena>
  );
};
