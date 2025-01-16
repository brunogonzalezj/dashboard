import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Download} from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { DataItem } from '../../interfaces/IData.ts';
const TableCurrent = React.lazy(() => import('../TableCurrent'));

enum FilterLabels {
  login = 'Sesion Iniciada',
  course = 'Curso',
  country = 'País',
  business = 'Empresa',
  progressPercentage = '% de Progreso',
  association = 'Asociación',
  businessGroup = 'Grupo Empresarial',
  stateOfCompleteness = 'Estado de progreso',
}

const Current: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lastDate, setLastDate] = useState('');

  const { username, userRole } = useAuth();

  const [filters, setFilters] = useState({
    login: 'all',
    course: 'all',
    country: 'all',
    business: 'all',
    progressPercentage: 'all',
    association: 'all',
    businessGroup: 'all',
    stateOfCompleteness: 'all',
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof DataItem;
    direction: 'asc' | 'desc';
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      getLastDate();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterAndSortData();
  }, [data, filters, sortConfig]);

  const displayedData = useMemo(() => {
    return filteredData.slice(0, currentPage * itemsPerPage);
  }, [filteredData, currentPage]);

  const getLastDate = async () => {
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_API_URL}/data/get-upload-date`;
      const response = await axios.get(url, { withCredentials: true });
      setLastDate(response.data.uploadDate);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLastDate('');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_API_URL}/data/dashboard-data`;
      const response = await axios.get(url, { withCredentials: true });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData([]);
    }
  };

  const filterAndSortData = () => {
    const result = data.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        if (value === 'all') return true;
        if (key === 'progressPercentage') {
          const [min, max] = value.split('-').map(Number);
          const progressValue = parseFloat(item.progressPercentage);
          return progressValue >= min && progressValue < max;
        }
        return item[key as keyof DataItem] === value;
      })
    );

    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return (
            aValue.localeCompare(bValue, 'es', { sensitivity: 'base' }) *
            (sortConfig.direction === 'asc' ? 1 : -1)
          );
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(result);
    setCurrentPage(1);
  };

  const handleSort = (key: keyof DataItem) => {
    setSortConfig((prevConfig) =>
      prevConfig?.key === key
        ? {
            ...prevConfig,
            direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
          }
        : { key, direction: 'asc' },
    );
  };



  const getLoginStats = useMemo(() => {
    if (filteredData.length === 0)
      return { loggedInCount: 0, totalCount: 0, rate: 0 };

    const loggedInCount = filteredData.filter((item) => item.login === 'SI').length;
    const totalCount = filteredData.length;
    const rate = ((loggedInCount / totalCount) * 100).toFixed(0);

    return { loggedInCount, totalCount, rate };
  }, [filteredData]);

  const getCompletionStats = useMemo(() => {
    if (filteredData.length === 0)
      return { completedCount: 0, totalCount: 0, rate: 0 };

    const completedCount = filteredData.filter(
      (item) => item.stateOfCompleteness === 'Completado',
    ).length;
    const totalCount = filteredData.length;
    const rate = ((completedCount / totalCount) * 100).toFixed(0);

    return { completedCount, totalCount, rate };
  }, [filteredData]);


  const getProgressData = useMemo(() => {
    const progressCounts = filteredData.reduce(
      (acc, item) => {
        const progress =
          Math.floor(parseFloat(item.progressPercentage) / 10) * 10;
        acc[progress] = (acc[progress] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    return Object.entries(progressCounts).map(([progress, count]) => ({
      progress: `${progress}-${parseInt(progress) + 10}%`,
      count,
    }));
  }, [filteredData]);


  const handleDownloadXLSX = () => {
    const dataToExport = filteredData.map((item) => ({
      Curso: item.course,
      Nombre: item.name,
      Apellido: item.lastName,
      Correo: item.email,
      'Sesion iniciada': item.login,
      Empresa: item.business,
      Estado: item.stateOfCompleteness,
      '% de avance': item.progressPercentage,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();

    // Aplicar estilos a la hoja de cálculo
    const headerStyle = {
      font: { bold: true, color: { rgb: '000000' } },
      fill: { fgColor: { rgb: 'F59E0B' } }, // Color mostaza
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    // Obtener el rango de celdas para los encabezados
    const range = XLSX.utils.decode_range(ws['!ref'] as string);
    const headerRange = {
      s: { r: range.s.r, c: range.s.c },
      e: { r: range.s.r, c: range.e.c },
    };

    // Aplicar estilos a los encabezados
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: headerRange.s.r, c: C });
      if (!ws[address]) ws[address] = {};
      ws[address].s = headerStyle;
    }

    // Ajustar el ancho de las columnas
    ws['!cols'] = [
      { wch: 20 }, // Curso
      { wch: 15 }, // Nombre
      { wch: 15 }, // Apellido
      { wch: 30 }, // Correo
      { wch: 15 }, // Sesion iniciada
      { wch: 35 }, // Empresa
      { wch: 15 }, // Estado
      { wch: 12 }, // % de avance
    ];

    XLSX.utils.book_append_sheet(wb, ws, `Datos de ${username}`);


    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(data, `Reporte de participantes de ${username} en cursos SEC | ${new Date().toLocaleString().split('T')[0]}.xlsx`);
  };

  const getProgressRangeOptions = () => {
    const ranges = [];
    for (let i = 0; i < 100; i += 10) {
      ranges.push(`${i}-${i + 10}`);
    }
    return ranges;
  };

  const getUniqueValues = (key: keyof DataItem) => {
    if (key === 'progressPercentage') return getProgressRangeOptions();
    return Array.from(new Set(data.map((item) => item[key]))).sort();
  };


  return (
    <div className='p-2 sm:p-4 md:p-6 bg-gray-100 rounded-lg shadow-2xl overflow-y-auto'>
      <div className='flex flex-col mb-4 lg:mb-8 gap-4'>
        <div className='flex flex-col items-center justify-center lg:flex-row w-full gap-4'>
          <div className='bg-[#3a69aa]/80 p-4 rounded-lg text-white'>
            <h2 className='text-base sm:text-lg font-semibold mb-2'>
              Usuarios que iniciaron sesión
            </h2>
            {!loading ? (
              <p className='text-2xl sm:text-3xl font-bold'>
                {getLoginStats.loggedInCount} de {' '}{getLoginStats.totalCount} usuarios ({getLoginStats.rate}%)
              </p>
            ) : (
              <span className='loading loading-ring loading-lg'></span>
            )}
          </div>
          <div className='bg-[#3a69aa]/80 p-4 rounded-lg text-white'>
            <h2 className='text-base sm:text-lg font-semibold mb-2'>
              Usuarios que completaron el curso
            </h2>
            {!loading ? (
              <p className='flex text-nowrap text-2xl sm:text-3xl font-bold'>
                {getCompletionStats.completedCount} de{' '}
                {getCompletionStats.totalCount} usuarios ({getCompletionStats.rate}%)
              </p>
            ) : (
              <span className='loading loading-ring loading-lg'></span>
            )}
          </div>
        </div>

        <div className='flex items-center justify-center flex-col w-full lg:flex-1'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 w-full'>
            <h2 className='text-lg sm:text-xl font-semibold mb-2 sm:mb-0'>
              Distribución de Progreso
            </h2>
            <p className='text-sm sm:text-base'>
              Ultima modificación:{' '}
              <span className='badge badge-warning font-semibold'>
                {new Date(lastDate).toLocaleString()}
              </span>
            </p>
          </div>
          {!loading ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="progress" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Nro de Usuarios"
                  fill="#3a69aa"
                >
                </Bar>

              </BarChart>
            </ResponsiveContainer>
          ) : (
            <span className='loading loading-ring loading-lg'></span>
          )}
        </div>
      </div>

      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2'>
        <h1 className='text-lg sm:text-xl font-bold'>Datos de Usuario</h1>
        <button
          onClick={handleDownloadXLSX}
          className='bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center text-sm'
        >
          <Download className='mr-2' size={18} />
          Descargar Excel
        </button>
      </div>

      <h2 className='text-lg sm:text-xl font-semibold mb-2'>Filtros</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {Object.entries(filters).map(([key, value]) => (
          (userRole === 'admin' || !['association', 'businessGroup', 'business'].includes(key)) && (
            <div key={key}>
              <label
                htmlFor={`${key}-filter`}
                className='block text-sm font-medium text-gray-700'
              >
                {FilterLabels[key as keyof typeof FilterLabels]
                    .charAt(0)
                    .toUpperCase() +
                  FilterLabels[key as keyof typeof FilterLabels].slice(1)}
              </label>
              <select
                id={`${key}-filter`}
                value={value}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm'
              >
                <option value='all'>Todos</option>
                {getUniqueValues(key as keyof DataItem).map((option) => (
                  //@ts-ignore
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )
        ))}
      </div>

      <div className='overflow-x-auto w-full'>
        <TableCurrent
          data={displayedData}
          onSort={handleSort}
          sortConfig={sortConfig}
        />
      </div>
      {displayedData.length < filteredData.length && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm sm:text-base'
          >
            Cargar más
          </button>
        </div>
      )}
    </div>
  );
};

export default Current;
