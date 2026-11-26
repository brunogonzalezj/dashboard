import type React from 'react';
import { useEffect, useState } from 'react';
import { Cell, Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip } from 'recharts';
import type { DataItem } from '../../interfaces/IData';
import { ChartTooltip } from '../ui/ChartTooltip';

interface InfoViewProps {
  data: DataItem[];
}

// Colores del embudo del diseño anterior: azul, ámbar y verde
const STAGE_COLORS = ['#3a69aa', '#f59e0b', '#10b981'];
// Texto sobre cada etapa: blanco sobre el azul; marino sobre ámbar y verde (el blanco no alcanza contraste)
const LABEL_COLORS = ['#ffffff', '#0c1626', '#0c1626'];

/** Parte un texto en líneas de hasta `max` caracteres, sin cortar palabras */
function wrapWords(text: string, max: number) {
  const lines: string[] = [];
  text.split(' ').forEach((word) => {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word;
    else lines.push(word);
  });
  return lines;
}

const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
const fmt = (n: number) => n.toLocaleString('es', { maximumFractionDigits: 1 });

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

/** Embudo de avance: registrados → iniciaron sesión → completaron el curso */
const InfoView: React.FC<InfoViewProps> = ({ data }) => {
  const wide = useWideScreen();
  const fontSize = wide ? 14 : 12;
  const charWidth = wide ? 8.5 : 7.3;
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
        <p className="py-16 text-center text-[13px] text-(--text-muted)">Sin datos para mostrar</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Embudo */}
          <div className="h-[280px] sm:h-[360px] lg:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                <Tooltip content={<ChartTooltip format={(v) => `${v.toLocaleString('es')} participantes`} />} />
                <Funnel
                  dataKey="value"
                  data={stages}
                  isAnimationActive animationDuration={700} animationEasing="ease-out" stroke="#ffffff" strokeWidth={2}>
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
                      const fitsInside = w * 0.55 > String(value).length * charWidth;
                      if (fitsInside) {
                        return (
                          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fontWeight={600} fill={LABEL_COLORS[Number(index)] ?? '#ffffff'}>
                            {value}
                          </text>
                        );
                      }
                      // Etapa angosta: el nombre va al costado de la forma, en texto oscuro.
                      // En celular se parte en líneas cortas para no salirse de la pantalla.
                      const labelX = cx + w * (wide ? 0.3 : 0.5) + (wide ? 14 : 10);
                      const lines = wide ? [String(value)] : wrapWords(String(value), 12);
                      const lineHeight = fontSize + 3;
                      return (
                        <text x={labelX} y={cy - ((lines.length - 1) * lineHeight) / 2} textAnchor="start" dominantBaseline="central" fontSize={fontSize} fontWeight={600} fill="#111c2d">
                          {lines.map((line, i) => (
                            <tspan key={line} x={labelX} dy={i === 0 ? 0 : lineHeight}>
                              {line}
                            </tspan>
                          ))}
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
              <div key={stage.name} className="rounded-lg border border-(--border) px-4 py-3" style={{ backgroundColor: `${stage.fill}0f` }}>
                <p className="flex items-center gap-2 text-[13px] font-medium text-(--text-muted)">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.fill }} />
                  {stage.name}
                </p>
                <p className="mt-1 tabular">
                  <span className="text-2xl font-semibold tracking-tight text-(--text-strong)">{stage.value.toLocaleString('es')}</span>
                  <span className="ml-2 text-[13px] text-(--text-muted)">{fmt(pct(stage.value, registered))}% del total</span>
                </p>
              </div>
            ))}

            <ul className="mt-1 space-y-2">
              {conversions.map((c) => (
                <li key={c.label} className="flex items-center justify-between gap-3 rounded-lg bg-[#f5f6f8] px-3.5 py-2.5 text-[13px]">
                  <span className="text-(--text-muted)">{c.label}</span>
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
