import type React from 'react';
import { useEffect, useState } from 'react';
import { Cell, Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip } from 'recharts';
import type { DataItem } from '../../interfaces/IData';
import { CATEGORICAL, ChartTooltip } from '../ui/chartTheme';

interface InfoViewProps {
  data: DataItem[];
}

// Misma paleta que "Por año": azul, ámbar y verde azulado de la marca
const STAGE_COLORS = [CATEGORICAL[0], CATEGORICAL[1], CATEGORICAL[2]];

const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
const fmt = (n: number) => n.toLocaleString('es', { maximumFractionDigits: 1 });

/** Embudo de avance: registrados → iniciaron sesión → completaron el curso */
/** true en pantallas de al menos 640px: ahí hay lugar para poner nombres al costado del embudo */
function useWideScreen() {
  const query = '(min-width: 640px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide;
}

const InfoView: React.FC<InfoViewProps> = ({ data }) => {
  const wide = useWideScreen();
  const registered = data.length;
  const loggedIn = data.filter((item) => item.login === 'SI').length;
  const completed = data.filter((item) => item.stateOfCompleteness === 'Completado').length;

  const stages = [
    { name: 'Registrados', value: registered, fill: STAGE_COLORS[0] },
    { name: 'Iniciaron sesión', value: loggedIn, fill: STAGE_COLORS[1] },
    { name: 'Completaron el curso', value: completed, fill: STAGE_COLORS[2] },
  ];

  const conversions = [
    { label: 'Registro → sesión', rate: pct(loggedIn, registered) },
    { label: 'Sesión → completado', rate: pct(completed, loggedIn) },
  ];

  return (
    <section className="dashboard-card">
      <header className="mb-5">
        <h2 className="card-title">Embudo de avance</h2>
        <p className="card-subtitle">De los participantes registrados, cuántos entraron a la plataforma y cuántos terminaron.</p>
      </header>

      {registered === 0 ? (
        <p className="py-16 text-center text-[13px] text-[color:var(--text-muted)]">Sin datos para mostrar</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Embudo */}
          <div className="h-[280px] sm:h-[360px] lg:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                <Tooltip content={<ChartTooltip formatter={(v) => `${v.toLocaleString('es')} participantes`} />} />
                <Funnel dataKey="value" data={stages} isAnimationActive animationDuration={700} animationEasing="ease-out" stroke="#ffffff" strokeWidth={2}>
                  {stages.map((s) => (
                    <Cell key={s.name} fill={s.fill} />
                  ))}
                  <LabelList
                    dataKey="name"
                    position="center"
                    content={({ x, y, width, height, value, index }) => {
                      const w = Number(width);
                      const cx = Number(x) + w / 2;
                      const cy = Number(y) + Number(height) / 2;
                      // Ancho útil a media altura del trapecio (~55 %) contra el ancho aproximado del texto
                      const fitsInside = w * 0.55 > String(value).length * 8.5;
                      // En celular no hay lugar al costado: las tarjetas de abajo nombran cada etapa con su color
                      if (!fitsInside && !wide) return null;
                      if (!fitsInside) {
                        // Etapa angosta: el nombre va al costado, en texto oscuro
                        return (
                          <text x={cx + w * 0.3 + 14} y={cy} textAnchor="start" dominantBaseline="central" fontSize={14} fontWeight={600} fill="#111c2d">
                            {value}
                          </text>
                        );
                      }
                      return (
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={14}
                          fontWeight={600}
                          // Sobre el ámbar, texto marino: el blanco no alcanza contraste
                          fill={index === 1 ? '#0c1626' : '#ffffff'}
                        >
                          {value}
                        </text>
                      );
                    }}
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* Etapas y conversiones */}
          <div className="flex flex-col justify-center gap-3">
            {stages.map((stage) => (
              <div key={stage.name} className="rounded-lg border border-[color:var(--border)] px-4 py-3" style={{ backgroundColor: `${stage.fill}0f` }}>
                <p className="flex items-center gap-2 text-[13px] font-medium text-[color:var(--text-muted)]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.fill }} />
                  {stage.name}
                </p>
                <p className="mt-1 tabular">
                  <span className="text-2xl font-semibold tracking-tight text-[color:var(--text-strong)]">{stage.value.toLocaleString('es')}</span>
                  <span className="ml-2 text-[13px] text-[color:var(--text-muted)]">{fmt(pct(stage.value, registered))}% del total</span>
                </p>
              </div>
            ))}

            <ul className="mt-1 space-y-2">
              {conversions.map((c) => (
                <li key={c.label} className="flex items-center justify-between gap-3 rounded-lg bg-[#f5f6f8] px-3.5 py-2.5 text-[13px]">
                  <span className="text-[color:var(--text-muted)]">{c.label}</span>
                  <span className="tabular whitespace-nowrap">
                    <span className="font-semibold text-emerald-700">{fmt(c.rate)}%</span>
                    <span className="ml-2 text-red-700">−{fmt(100 - c.rate)}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};

export default InfoView;
