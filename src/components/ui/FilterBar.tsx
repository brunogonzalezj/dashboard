import { useId, useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FilterField {
  key: string;
  label: string;
  value: string;
  options: (string | number | boolean | null | undefined)[];
  allLabel?: string;
}

interface FilterBarProps {
  fields: FilterField[];
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
  /** Texto a la derecha, por ejemplo la cantidad de resultados */
  summary?: React.ReactNode;
}

/**
 * Barra de filtros compartida. En pantallas chicas se pliega detrás de un botón
 * que muestra cuántos filtros hay activos; desde md se muestra siempre.
 */
export function FilterBar({ fields, onChange, onReset, summary }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const active = fields.filter((f) => f.value !== 'all').length;

  return (
    <section className="dashboard-card !p-0" aria-label="Filtros">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:py-2.5 md:border-b md:border-[color:var(--border)]">
        <button
          type="button"
          className="md:hidden inline-flex items-center gap-2 h-9 -ml-1 px-1 text-sm font-semibold text-[color:var(--text-strong)]"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {active > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary-400 px-1.5 text-[11px] font-bold text-primary-950 tabular">
              {active}
            </span>
          )}
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>
        <p className="hidden md:flex items-center gap-2 text-[13px] font-semibold text-[color:var(--text-strong)]">
          <SlidersHorizontal className="h-4 w-4 text-[color:var(--text-muted)]" />
          Filtros
          {active > 0 && <span className="font-normal text-[color:var(--text-muted)]">· {active} activos</span>}
        </p>
        <div className="flex items-center gap-3">
          {summary && <span className="text-[13px] text-[color:var(--text-muted)] tabular">{summary}</span>}
          {onReset && active > 0 && (
            <button type="button" onClick={onReset} className="btn-ghost btn-sm !h-8 !px-2.5 text-[color:var(--text-muted)]">
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div
        id={panelId}
        className={cn(
          'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-8 gap-x-3 gap-y-3 px-4 pb-4 md:pt-3.5',
          open ? 'grid' : 'hidden md:grid',
        )}
      >
        {fields.map((f) => (
          <div key={f.key} className="min-w-0">
            <label htmlFor={`${panelId}-${f.key}`} className="block text-xs font-medium text-[color:var(--text-muted)] mb-1">
              {f.label}
            </label>
            <select
              id={`${panelId}-${f.key}`}
              value={f.value}
              onChange={(e) => onChange(f.key, e.target.value)}
              className={cn('input-field-sm', f.value !== 'all' && 'is-active')}
            >
              <option value="all">{f.allLabel ?? 'Todos'}</option>
              {f.options
                .filter((o) => o !== null && o !== undefined && o !== '')
                .map((o) => (
                  <option key={String(o)} value={String(o)}>
                    {String(o)}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}
