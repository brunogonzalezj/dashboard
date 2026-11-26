import type { TooltipProps } from 'recharts';

/** Categorías sin orden (cursos, áreas): tonos de la marca bien separados entre sí */
export const CATEGORICAL = ['#3a69aa', '#e39a0b', '#178474', '#c8553d', '#6b7f99', '#8a9a3b'];

/** Categorías con orden (edad, educación, experiencia): rampa del azul de la marca, de claro a oscuro */
export const SEQUENTIAL = ['#bcd0ea', '#8fb0dc', '#5f8ccb', '#3a69aa', '#2a4f84', '#1b3152'];

export const COURSE_ORDER = ['Alimento Balanceado', 'Avicultura', 'Acuacultura', 'Porcicultura', 'Ganado Lechero'];

/** Color estable por curso: el mismo curso tiene el mismo color en todos los gráficos */
export const courseColor = (course: string, index = 0) => {
  const known = COURSE_ORDER.indexOf(course);
  return CATEGORICAL[(known >= 0 ? known : COURSE_ORDER.length + index) % CATEGORICAL.length];
};

export const GENDER_COLORS: Record<string, string> = { Hombre: '#3a69aa', Mujer: '#e39a0b' };

export const CHART_AXIS = {
  tick: { fontSize: 12, fill: '#5b6878' },
  tickLine: false,
  axisLine: { stroke: '#dfe3e9' },
} as const;

export const CHART_GRID = { stroke: '#edf0f3', vertical: false } as const;

type Formatter = (value: number, name: string, payload: Record<string, unknown>) => string;

/** Tooltip de los gráficos con el estilo de la interfaz */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: TooltipProps<number, string> & { formatter?: Formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-[13px] shadow-[0_8px_24px_-8px_rgba(12,22,38,0.25)]">
      {label !== undefined && label !== '' && (
        <p className="mb-1 font-semibold text-[color:var(--text-strong)]">{label}</p>
      )}
      {payload.map((p) => (
        <p key={String(p.dataKey) + String(p.name)} className="flex items-center gap-2 text-[color:var(--text)]">
          <span className="h-2 w-2 rounded-full" style={{ background: (p.color || p.payload?.fill) as string }} />
          <span className="text-[color:var(--text-muted)]">{p.name}</span>
          <span className="ml-auto pl-3 font-semibold tabular text-[color:var(--text-strong)]">
            {formatter ? formatter(Number(p.value), String(p.name), p.payload ?? {}) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}
