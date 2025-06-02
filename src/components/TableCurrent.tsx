import React from 'react';
import { Link } from 'react-router-dom';
import { MailIcon } from 'lucide-react';
import { Whatsapp } from './WhatsappIcon';
import { DataItem } from '../interfaces/IData.ts';

interface TableProps {
  data: DataItem[];
  onSort: (key: keyof DataItem) => void;
  sortConfig: { key: string; direction: string } | null;
}

const TableCurrent: React.FC<TableProps> = ({ data, onSort, sortConfig }) => {
  const headers = [
    { key: 'course', label: 'Curso' },
    { key: 'name', label: 'Nombre' },
    { key: 'lastName', label: 'Apellido' },
    { key: 'email', label: 'Correo' },
    { key: 'business', label: 'Empresa' },
    { key: 'stateOfCompleteness', label: 'Estado' },
    { key: 'progressPercentage', label: '% de progreso' },
    { key: 'contact', label: 'Contactar' },
  ];

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) return null;
    return sortConfig.direction === 'asc' ? '🔼' : '🔽';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] bg-white">
        <thead>
          <tr>
            {headers.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => key !== 'contact' && onSort(key as keyof DataItem)}
                className="py-2 px-4 border-b cursor-pointer text-left"
              >
                {label} {key !== 'contact' && <SortIcon column={key} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{item.course}</td>
              <td className="py-2 px-4 border-b">{item.name}</td>
              <td className="py-2 px-4 border-b">{item.lastName}</td>
              <td className="py-2 px-4 border-b">{item.email}</td>
              <td className="py-2 px-4 border-b">{item.business}</td>
              <td className="py-2 px-4 border-b">
                <div
                  className={`badge p-2 sm:p-4 justify-center ${
                    item.stateOfCompleteness === 'Completado'
                      ? 'badge-success'
                      : 'badge-error'
                  } text-white text-nowrap text-xs sm:text-sm`}
                >
                  {item.stateOfCompleteness === 'Completado'
                    ? 'Completado'
                    : 'No completado'}
                </div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${item.progressPercentage}` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-1">{item.progressPercentage}</span>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="flex items-center justify-center space-x-2">
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
                      const mailto = `mailto:${item.email}?subject=${encodeURIComponent(
                        subject
                      )}&body=${encodeURIComponent(body)}`;
                      window.location.href = mailto;
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <MailIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableCurrent;