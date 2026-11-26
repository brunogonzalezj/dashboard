import { useState } from 'react';
import { useHistoryData } from '../../hooks/queries';
import { DataItem } from '../../interfaces/IData';
import ChartsView from '../history/ChartsView';
import InfoView from '../history/InfoView';
import YearInfoView from '../history/YearInfoView';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/utils';

const SUBVIEWS = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'embudo', label: 'Embudo de avance' },
  { id: 'anual', label: 'Por año' },
] as const;
type SubviewId = (typeof SUBVIEWS)[number]['id'];

const EMPTY_DATA: DataItem[] = [];

export default function History() {
  const { data = EMPTY_DATA, isLoading } = useHistoryData();
  const [current, setCurrent] = useState<SubviewId>('perfil');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  const filteredData = selectedCountry === 'all' ? data : data.filter((item) => item.country === selectedCountry);

  if (isLoading) {
    return (
      <div className="space-y-5" role="status" aria-label="Cargando gráficos">
        <Skeleton className="h-10 w-80 rounded-lg" />
        <Skeleton className="h-[104px] rounded-xl" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-[420px] rounded-xl" />
          <div className="grid gap-4">
            <Skeleton className="h-[200px] rounded-xl" />
            <Skeleton className="h-[200px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Selector segmentado: tres maneras de mirar los mismos datos */}
        <div role="radiogroup" aria-label="Tipo de gráfico" className="inline-flex max-w-full overflow-x-auto rounded-lg bg-[#e9ecf1] p-1">
          {SUBVIEWS.map((v) => {
            const selected = current === v.id;
            return (
              <button
                key={v.id}
                role="radio"
                aria-checked={selected}
                onClick={() => setCurrent(v.id)}
                className={cn(
                  'h-9 whitespace-nowrap rounded-md px-3.5 text-[13px] font-semibold transition-[background-color,color,box-shadow] duration-150',
                  selected
                    ? 'bg-white text-[color:var(--text-strong)] shadow-[0_1px_2px_rgba(16,28,45,0.12)]'
                    : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]',
                )}
              >
                {v.label}
              </button>
            );
          })}
        </div>
        {selectedCountry !== 'all' && current !== 'perfil' && (
          <p className="text-[13px] text-[color:var(--text-muted)]">
            Mostrando solo <span className="font-semibold text-[color:var(--text-strong)]">{selectedCountry}</span> ·{' '}
            <button className="font-semibold text-primary-600 underline hover:text-primary-700" onClick={() => setSelectedCountry('all')}>
              ver todos
            </button>
          </p>
        )}
      </div>

      {current === 'perfil' && (
        <ChartsView data={data} selectedCountry={selectedCountry} onCountrySelect={setSelectedCountry} />
      )}
      {current === 'embudo' && <InfoView data={filteredData} />}
      {current === 'anual' && <YearInfoView data={filteredData} />}
    </div>
  );
}
