import type React from 'react';
import { ArrowDown } from 'lucide-react';
import type { DataItem } from '../../interfaces/IData';

interface InfoViewProps {
  data: DataItem[];
}

const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
const fmt = (n: number) => n.toLocaleString('es', { maximumFractionDigits: 1 });

/**
 * Embudo de avance: cuántos de los registrados entraron y cuántos terminaron.
 * Cada etapa es una barra proporcional al total, con la conversión desde la etapa anterior.
 */
const InfoView: React.FC<InfoViewProps> = ({ data }) => {
  const registered = data.length;
  const loggedIn = data.filter((item) => item.login === 'SI').length;
  const completed = data.filter((item) => item.stateOfCompleteness === 'Completado').length;

  const stages = [
    { name: 'Registrados', value: registered, color: '#2a4f84', from: null as number | null },
    { name: 'Iniciaron sesión', value: loggedIn, color: '#5f8ccb', from: registered },
    { name: 'Completaron el curso', value: completed, color: '#e39a0b', from: loggedIn },
  ];

  return (
    <section className="dashboard-card">
      <header className="mb-6">
        <h2 className="card-title">Embudo de avance</h2>
        <p className="card-subtitle">De los participantes registrados, cuántos entraron a la plataforma y cuántos terminaron.</p>
      </header>

      <ol className="space-y-2">
        {stages.map((stage, i) => {
          const ofTotal = pct(stage.value, registered);
          return (
            <li key={stage.name}>
              {i > 0 && stage.from !== null && (
                <p className="my-2 flex items-center gap-2 pl-1 text-[13px] text-[color:var(--text-muted)]">
                  <ArrowDown className="h-4 w-4" />
                  <span>
                    <span className="font-semibold text-emerald-700 tabular">{fmt(pct(stage.value, stage.from))}%</span> continúa
                    <span className="mx-1.5 text-[#c3cad4]">·</span>
                    <span className="font-semibold text-red-700 tabular">{fmt(100 - pct(stage.value, stage.from))}%</span> se queda
                  </span>
                </p>
              )}
              <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,12rem)_1fr_auto] sm:gap-4">
                <p className="text-sm font-medium text-[color:var(--text-strong)]">{stage.name}</p>
                <div className="h-9 overflow-hidden rounded-md bg-[#eef1f5]">
                  <div
                    className="h-full rounded-md transition-[width] duration-500 ease-out"
                    style={{ width: `${Math.max(ofTotal, stage.value > 0 ? 1.5 : 0)}%`, background: stage.color }}
                  />
                </div>
                <p className="tabular sm:text-right">
                  <span className="text-xl font-semibold tracking-tight text-[color:var(--text-strong)]">{stage.value.toLocaleString('es')}</span>
                  <span className="ml-2 text-[13px] text-[color:var(--text-muted)]">{fmt(ofTotal)}% del total</span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default InfoView;
