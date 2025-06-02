import React from 'react';
import { Link } from 'react-router-dom';
import { MailIcon } from 'lucide-react';
import { Whatsapp } from './WhatsappIcon';
import { DataItem } from '../interfaces/IData.ts';
import { motion } from 'framer-motion';

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
    return (
      <motion.span
        initial={{ rotate: 0 }}
        animate={{ rotate: sortConfig.direction === 'asc' ? 0 : 180 }}
        transition={{ duration: 0.2 }}
        className="inline-block ml-1"
      >
        ▲
      </motion.span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <table className="w-full min-w-[640px] bg-white">
        <thead className="bg-gray-50">
          <tr>
            {headers.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => key !== 'contact' && onSort(key as keyof DataItem)}
                className={`
                  py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${key !== 'contact' ? 'cursor-pointer hover:bg-gray-100' : ''}
                `}
              >
                <div className="flex items-center space-x-1">
                  <span>{label}</span>
                  {key !== 'contact' && <SortIcon column={key} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4">{item.course}</td>
              <td className="py-3 px-4">{item.name}</td>
              <td className="py-3 px-4">{item.lastName}</td>
              <td className="py-3 px-4">{item.email}</td>
              <td className="py-3 px-4">{item.business}</td>
              <td className="py-3 px-4">
                <span
                  className={`
                    inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                    ${
                      item.stateOfCompleteness === 'Completado'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  `}
                >
                  {item.stateOfCompleteness === 'Completado' ? 'Completado' : 'No completado'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${item.progressPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-1">{item.progressPercentage}%</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center space-x-2">
                  <Link
                    to={`https://api.whatsapp.com/send?phone=${item.phone}`}
                    target="_blank"
                    className="text-green-600 hover:text-green-700 transition-colors"
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
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <MailIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableCurrent;