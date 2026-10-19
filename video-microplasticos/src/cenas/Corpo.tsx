import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COR, FONTES, Fonte, prog, surge, Titulo } from "../tema";

// Silhueta do site (viewBox 200 × 440) com os achados aparecendo em ordem de publicação.
const ACHADOS = [
  { ano: "2021", orgao: "Placenta", dado: "4 de 6 placentas", x: 100, y: 262, br: false },
  { ano: "2021", orgao: "Pulmão", dado: "13 de 20 amostras", x: 80, y: 150, br: true },
  { ano: "2022", orgao: "Sangue", dado: "1,6 µg/mL em média", x: 36, y: 230, br: false },
  { ano: "2024", orgao: "Artérias", dado: "58% com polietileno", x: 90, y: 92, br: false },
  { ano: "2024", orgao: "Bulbo olfatório", dado: "8 de 15 pessoas", x: 100, y: 58, br: true },
  { ano: "2025", orgao: "Cérebro", dado: "+50% de 2016 a 2024", x: 100, y: 30, br: false },
];
const INICIO = 40, PASSO = 55, ESC = 1.4;

export const Corpo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COR.escuro, color: "#fff", fontFamily: FONTES.serif, padding: "100px 140px 160px", display: "flex", flexDirection: "column", gap: 32 }}>
      <Titulo cor="#fff">Onde já foram encontrados no corpo</Titulo>
      <div style={{ flex: 1, display: "flex", gap: 90, alignItems: "center" }}>
        <svg width={200 * ESC} height={440 * ESC} viewBox="0 0 200 440" style={{ flex: "none", opacity: prog(f, 10) }} aria-hidden>
          <g fill="#16384A" stroke="#16384A">
            <ellipse cx={100} cy={46} rx={29} ry={35} />
            <rect x={88} y={76} width={24} height={26} rx={6} />
            <path d="M58 104 Q100 92 142 104 L150 124 L146 252 Q140 292 100 294 Q60 292 54 252 L50 124 Z" />
            <path d="M52 112 L30 282" strokeWidth={22} strokeLinecap="round" fill="none" />
            <path d="M148 112 L170 282" strokeWidth={22} strokeLinecap="round" fill="none" />
            <path d="M82 284 L78 424" strokeWidth={30} strokeLinecap="round" fill="none" />
            <path d="M118 284 L122 424" strokeWidth={30} strokeLinecap="round" fill="none" />
          </g>
          {ACHADOS.map((a, i) => {
            const p = prog(f, INICIO + i * PASSO, 16);
            const pulso = ((f - INICIO - i * PASSO) % 45) / 45;
            const cor = a.br ? "#3FC27E" : COR.rosa;
            return (
              <g key={a.orgao} opacity={p}>
                <circle cx={a.x} cy={a.y} r={7 + pulso * 12} fill="none" stroke={cor} strokeWidth={2} opacity={f > INICIO + i * PASSO ? 1 - pulso : 0} />
                <circle cx={a.x} cy={a.y} r={7 * p} fill={cor} stroke={COR.escuro} strokeWidth={2} />
              </g>
            );
          })}
        </svg>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {ACHADOS.map((a, i) => (
            <div key={a.orgao} style={{ display: "grid", gridTemplateColumns: "140px 1fr auto", alignItems: "baseline", gap: 28, borderBottom: "2px solid #23465A", paddingBottom: 14, ...surge(f, INICIO + i * PASSO, 18, 30) }}>
              <span style={{ fontFamily: FONTES.display, fontSize: 40, color: COR.escuroTexto, fontVariantNumeric: "tabular-nums" }}>{a.ano}</span>
              <span style={{ fontFamily: FONTES.display, fontWeight: 700, fontSize: 52 }}>
                {a.orgao}
                {a.br && <span style={{ marginLeft: 16, fontSize: 28, fontWeight: 600, background: COR.verdeEscuro, padding: "4px 12px", borderRadius: 8, verticalAlign: "middle" }}>USP</span>}
              </span>
              <span style={{ fontSize: 42, color: COR.escuroTexto }}>{a.dado}</span>
            </div>
          ))}
        </div>
      </div>
      <Fonte cor="#8FA8B1">Ragusa (2021) · Amato-Lourenço (2021, 2024) · Leslie (2022) · Marfella (2024) · Nihart (2025)</Fonte>
    </AbsoluteFill>
  );
};
