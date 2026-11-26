import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, MailIcon, SearchX } from 'lucide-react';
import { Whatsapp } from './WhatsappIcon';
import { DataItem } from '../interfaces/IData.ts';
import { cn } from '../lib/utils';

interface TableProps {
  data: DataItem[];
  onSort: (key: keyof DataItem) => void;
  sortConfig: { key: string; direction: string } | null;
  isHistoric?: boolean;
}

const progressOf = (item: DataItem) => {
  const n = parseFloat(item.progressPercentage);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
};

const mailtoFor = (item: DataItem) => {
  const subject = `Curso ${item.course} - ${item.name} ${item.lastName}`;
  const body = `Estimado/a ${item.name},\nLe informamos que su nota final en el curso de ${item.course} es: ${item.finalScore}, su porcentaje de avance es de ${item.progressPercentage} y el estado de finalización del curso es: ${item.stateOfCompleteness}.\nSaludos.`;
  return `mailto:${item.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const phoneDigits = (phone: string) => String(phone ?? '').replace(/\D/g, '');

function StatusBadge({ state }: { state: string }) {
  const done = state === 'Completado';
  return <span className={cn(done ? 'badge-success' : 'badge-neutral', 'badge-dot')}>{done ? 'Completado' : 'No completado'}</span>;
}

function Progress({ item }: { item: DataItem }) {
  const value = progressOf(item);
  return (
    <div className="flex items-center gap-2.5 min-w-[120px]">
      <div className="meter flex-1" aria-hidden="true">
        <span style={{ width: `${value}%`, background: value >= 90 ? '#1f9e89' : 'var(--amber-500)' }} />
      </div>
      <span className="w-10 text-right text-xs font-medium tabular text-(--text)">{Math.round(value)}%</span>
    </div>
  );
}

function ContactActions({ item }: { item: DataItem }) {
  const phone = phoneDigits(item.phone);
  const fullName = `${item.name} ${item.lastName}`;
  return (
    <div className="flex items-center gap-1">
      {phone ? (
        <a
          href={`https://api.whatsapp.com/send?phone=${phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="icon-btn hover:text-emerald-700! hover:bg-emerald-50!"
          aria-label={`Escribir por WhatsApp a ${fullName}`}
          title="WhatsApp"
        >
          <Whatsapp width={18} height={18} />
        </a>
      ) : (
        <span className="icon-btn opacity-40 cursor-not-allowed" title="Sin teléfono" aria-label="Sin teléfono">
          <Whatsapp width={18} height={18} />
        </span>
      )}
      <a href={mailtoFor(item)} className="icon-btn" aria-label={`Enviar correo a ${fullName}`} title="Correo">
        <MailIcon className="h-[18px] w-[18px]" />
      </a>
    </div>
  );
}

const TableCurrent: React.FC<TableProps> = ({ data, onSort, sortConfig, isHistoric = false }) => {
  const headers: { key: keyof DataItem | 'contact'; label: string; align?: 'right' }[] = [
    { key: 'name', label: 'Participante' },
    { key: 'course', label: 'Curso' },
    { key: 'business', label: 'Empresa' },
    { key: 'stateOfCompleteness', label: 'Estado' },
    { key: 'progressPercentage', label: 'Progreso' },
    ...(isHistoric ? [{ key: 'finalScore' as const, label: 'Nota final', align: 'right' as const }] : []),
    { key: 'contact', label: 'Contacto' },
  ];

  if (data.length === 0) {
    return (
      <div className="dashboard-card flex flex-col items-center justify-center gap-2 py-14 text-center">
        <SearchX className="h-8 w-8 text-(--text-muted)" />
        <p className="font-semibold text-(--text-strong)">No hay participantes con estos filtros</p>
        <p className="text-[13px] text-(--text-muted)">Prueba quitar algún filtro o elegir “Todos”.</p>
      </div>
    );
  }

  return (
    <>
      {/* Computadora: tabla */}
      <div className="dashboard-card p-0! hidden xl:block overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map(({ key, label, align }) => {
                  const sorted = sortConfig?.key === key;
                  const ariaSort = sorted ? (sortConfig?.direction === 'asc' ? 'ascending' : 'descending') : 'none';
                  return (
                    <th key={key} aria-sort={key === 'contact' ? undefined : ariaSort} className={align === 'right' ? 'text-right' : ''}>
                      {key === 'contact' ? (
                        label
                      ) : (
                        <button type="button" className={cn('th-sort', sorted && 'text-(--text-strong)')} onClick={() => onSort(key)}>
                          {label}
                          {sorted ? (
                            sortConfig?.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <p className="font-medium text-(--text-strong)">{item.name} {item.lastName}</p>
                    <p className="text-xs text-(--text-muted)">{item.email}</p>
                  </td>
                  <td>{item.course}</td>
                  <td className="max-w-[220px] truncate" title={item.business}>{item.business}</td>
                  <td><StatusBadge state={item.stateOfCompleteness} /></td>
                  <td><Progress item={item} /></td>
                  {isHistoric && (
                    <td className="text-right font-semibold tabular text-(--text-strong)">
                      {item.finalScore || <span className="font-normal text-(--text-muted)">—</span>}
                    </td>
                  )}
                  <td className="py-1.5!"><ContactActions item={item} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Celular y tablet: tarjetas */}
      <ul className="xl:hidden grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {data.map((item) => (
          <li key={item.id} className="dashboard-card p-4!">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-(--text-strong) truncate">{item.name} {item.lastName}</p>
                <p className="text-xs text-(--text-muted) truncate">{item.email}</p>
              </div>
              <StatusBadge state={item.stateOfCompleteness} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              <div className="min-w-0">
                <dt className="text-xs text-(--text-muted)">Curso</dt>
                <dd className="truncate text-(--text-strong)">{item.course}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-(--text-muted)">Empresa</dt>
                <dd className="truncate text-(--text-strong)">{item.business || '—'}</dd>
              </div>
              {isHistoric && (
                <div>
                  <dt className="text-xs text-(--text-muted)">Nota final</dt>
                  <dd className="font-semibold tabular text-(--text-strong)">{item.finalScore || '—'}</dd>
                </div>
              )}
            </dl>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1"><Progress item={item} /></div>
              <div className="-mr-2"><ContactActions item={item} /></div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TableCurrent;
