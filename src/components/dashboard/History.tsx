import { useState } from 'react';
import { useSearchParams } from 'react-router';
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
  // La sub-vista vive en la URL (?detalle=), igual que las pestañas del panel
  const [params, setParams] = useSearchParams();
  const current: SubviewId = SUBVIEWS.find((v) => v.id === params.get('detalle'))?.id ?? 'perfil';
  const setCurrent = (id: SubviewId) => {
    const next = new URLSearchParams(params);
    next.set('detalle', id);
    setParams(next, { replace: true });
  };
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
        <div role="radiogroup" aria-label="Tipo de gráfico" className="inline-flex max-w-full overflow-x-auto overflow-y-hidden no-scrollbar rounded-lg bg-[#e9ecf1] p-1">
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
                    ? 'bg-white text-(--text-strong) shadow-[0_1px_2px_rgba(16,28,45,0.12)]'
                    : 'text-(--text-muted) hover:text-(--text-strong)',
                )}
              >
                {v.label}
              </button>
            );
          })}
        </div>
        {selectedCountry !== 'all' && current !== 'perfil' && (
          <p className="text-[13px] text-(--text-muted)">
            Mostrando solo <span className="font-semibold text-(--text-strong)">{selectedCountry}</span> ·{' '}
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
