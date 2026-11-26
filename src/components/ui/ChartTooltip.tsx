import type { TooltipContentProps } from 'recharts';

type Formatter = (value: number, name: string, payload: Record<string, unknown>) => string;

/** Tooltip de los gráficos con el estilo de la interfaz */
export function ChartTooltip({
  active,
  payload,
  label,
  format,
}: Partial<TooltipContentProps<number, string>> & { format?: Formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-(--border) bg-white px-3 py-2 text-[13px] shadow-[0_8px_24px_-8px_rgba(12,22,38,0.25)]">
      {label !== undefined && label !== '' && (
        <p className="mb-1 font-semibold text-(--text-strong)">{label}</p>
      )}
      {payload.map((p) => (
        <p key={String(p.dataKey) + String(p.name)} className="flex items-center gap-2 text-(--text)">
          <span className="h-2 w-2 rounded-full" style={{ background: (p.color || p.payload?.fill) as string }} />
          <span className="text-(--text-muted)">{p.name}</span>
          <span className="ml-auto pl-3 font-semibold tabular text-(--text-strong)">
            {format ? format(Number(p.value), String(p.name), p.payload ?? {}) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}
