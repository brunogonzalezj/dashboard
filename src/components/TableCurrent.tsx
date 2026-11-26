import React from 'react';
import { Link } from 'react-router-dom';
import { MailIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { Whatsapp } from './WhatsappIcon';
import { DataItem } from '../interfaces/IData.ts';

interface TableProps {
  data: DataItem[];
  onSort: (key: keyof DataItem) => void;
  sortConfig: { key: string; direction: string } | null;
  isHistoric?: boolean;
}

const TableCurrent: React.FC<TableProps> = ({ data, onSort, sortConfig, isHistoric = false }) => {
  const headers = [
    { key: 'course', label: 'Curso' },
    { key: 'name', label: 'Nombre' },
    { key: 'lastName', label: 'Apellido' },
    { key: 'email', label: 'Correo' },
    { key: 'business', label: 'Empresa' },
    { key: 'stateOfCompleteness', label: 'Estado' },
    { key: 'progressPercentage', label: '% Progreso' },
    ...(isHistoric ? [{ key: 'finalScore', label: 'Nota Final' }] : []),
    { key: 'contact', label: 'Contactar' },
  ];

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) return null;
    return sortConfig.direction === 'asc'
      ? <ChevronUpIcon className="w-3.5 h-3.5 inline-block ml-0.5 text-amber-600" />
      : <ChevronDownIcon className="w-3.5 h-3.5 inline-block ml-0.5 text-amber-600" />;
  };

  return (
    <table className="data-table">
      <thead>
        <tr>
          {headers.map(({ key, label }) => (
            <th
              key={key}
              onClick={() => key !== 'contact' && onSort(key as keyof DataItem)}
              className={key !== 'contact' ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
            >
              <span className="inline-flex items-center">
                {label}
                {key !== 'contact' && <SortIcon column={key} />}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.course}</td>
            <td>{item.name}</td>
            <td>{item.lastName}</td>
            <td className="text-gray-500">{item.email}</td>
            <td>{item.business}</td>
            <td>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  item.stateOfCompleteness === 'Completado'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {item.stateOfCompleteness === 'Completado' ? 'Completado' : 'No completado'}
              </span>
            </td>
            <td>
              <div className="flex items-center gap-2 min-w-[100px]">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${parseFloat(item.progressPercentage)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{item.progressPercentage}</span>
              </div>
            </td>
            {isHistoric && (
              <td className="text-center font-semibold">
                {item.finalScore || 'N/A'}
              </td>
            )}
            <td>
              <div className="flex items-center justify-center gap-2">
                <Link
                  to={`https://api.whatsapp.com/send?phone=${item.phone}`}
                  target="_blank"
                >
                  <Whatsapp />
                </Link>
                <button
                  onClick={() => {
                    const subject = `Curso ${item.course} - ${item.name} ${item.lastName}`;
                    const body = `Estimado/a ${item.name},\nLe informamos que su nota final en el curso de ${item.course} es: ${item.finalScore}, su porcentaje de avance es de ${item.progressPercentage} y el estado de finalización del curso es: ${item.stateOfCompleteness}.\nSaludos.`;
                    const mailto = `mailto:${item.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.location.href = mailto;
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MailIcon className="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableCurrent;