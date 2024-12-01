import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronDownIcon, ChevronUpIcon, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface DataItem {
  id: number;
  association: string;
  businessGroup: string;
  business: string;
  fiscalYear: string;
  year: string;
  course: string;
  grupo: string;
  country: string;
  city: string;
  gender: string;
  name: string;
  lastName: string;
  email: string;
  birthday: number;
  phone: string;
  education: string;
  jobArea: string;
  jobPosition: string;
  positionLevel: string;
  yearsExperience: string;
  login: string;
  progressPercentage: string;
  stateOfCompleteness: string;
  finalScore: string;
  progress: string;
  previousPoll: boolean;
  seenMaterial: string;
  completedEvaluations: string;
  reunionVisualized: number;
  postPoll: boolean;
  evaluationRange: string;
  presentialCourse: string;
}

enum FilterLabels {
  login = 'Sesion Iniciada',
  course = 'Curso',
  country = 'País',
  business = 'Empresa',
}

const Current: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lastDate, setLastDate] = useState('');

  const { username } = useAuth();

  const [filters, setFilters] = useState({
    login: 'all',
    course: 'all',
    country: 'all',
    business: 'all',
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
      Object.entries(filters).every(
        ([key, value]) =>
          value === 'all' || item[key as keyof DataItem] === value,
      ),
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

  const SortIcon = ({ column }: { column: keyof DataItem }) => {
    if (sortConfig?.key !== column) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className='w-4 h-4 inline-block ml-1' />
    ) : (
      <ChevronDownIcon className='w-4 h-4 inline-block ml-1' />
    );
  };

  const getAverageProgress = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const totalProgress = filteredData.reduce(
      (sum, item) => sum + parseFloat(item.progressPercentage),
      0,
    );
    return (totalProgress / filteredData.length).toFixed(2);
  }, [filteredData]);

  const getCompletionRate = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const completedCourses = filteredData.filter(
      (item) => item.stateOfCompleteness === 'Completado',
    ).length;
    return ((completedCourses / filteredData.length) * 100).toFixed(2);
  }, [filteredData]);

  const getAverageScore = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const totalScore = filteredData.reduce(
      (sum, item) => sum + parseFloat(item.finalScore),
      0,
    );
    return (totalScore / filteredData.length).toFixed(2);
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
      font: { bold: true },
      fill: { fgColor: { rgb: "FFD700" } }, // Color mostaza
      alignment: { horizontal: "center" }
    };

    // Obtener el rango de celdas para los encabezados
    const range = XLSX.utils.decode_range(ws['!ref'] as string);
    const headerRange = { s: { r: range.s.r, c: range.s.c }, e: { r: range.s.r, c: range.e.c } };

    // Aplicar estilos a los encabezados
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: headerRange.s.r, c: C });
      ws[address].s = headerStyle;
    }

    // Ajustar el ancho de las columnas
    ws['!cols'] = [
      { wch: 20 }, // Curso
      { wch: 15 }, // Nombre
      { wch: 15 }, // Apellido
      { wch: 25 }, // Correo
      { wch: 15 }, // Sesion iniciada
      { wch: 20 }, // Empresa
      { wch: 15 }, // Estado
      { wch: 12 }, // % de avance
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Datos del Dashboard');

    // Generar el archivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(data, `Cursos ${username}.xlsx`);
  };



  const getUniqueValues = (key: keyof DataItem) => {
    return Array.from(new Set(filteredData.map((item) => item[key]))).sort();
  };

  return (
    <div className='p-2 sm:p-4 md:p-6 bg-gray-100 rounded-lg shadow-2xl overflow-y-auto'>
      <div className='flex flex-col lg:flex-row mb-4 lg:mb-8 gap-4'>
        <div className='flex flex-col w-full lg:w-1/4 gap-y-4'>
          <div className='bg-[#3a69aa]/80 p-4 rounded-lg text-white'>
            <h2 className='text-base sm:text-lg font-semibold mb-2'>Progreso Promedio</h2>
            {!loading ? (
              <p className='text-2xl sm:text-3xl font-bold'>{getAverageProgress}%</p>
            ) : (
              <span className='loading loading-ring loading-lg'></span>
            )}
          </div>
          <div className='bg-[#3a69aa]/80 p-4 rounded-lg text-white'>
            <h2 className='text-base sm:text-lg font-semibold mb-2'>Tasa de Completados</h2>
            {!loading ? (
              <p className='text-2xl sm:text-3xl font-bold'>{getCompletionRate}%</p>
            ) : (
              <span className='loading loading-ring loading-lg'></span>
            )}
          </div>
          <div className='bg-[#3a69aa]/80 p-4 rounded-lg text-white'>
            <h2 className='text-base sm:text-lg font-semibold mb-2'>Puntaje Promedio</h2>
            {!loading ? (
              <p className='text-2xl sm:text-3xl font-bold'>{getAverageScore}%</p>
            ) : (
              <span className='loading loading-ring loading-lg'></span>
            )}
          </div>
        </div>

        <div className='flex items-center justify-center flex-col w-full lg:w-3/4'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 w-full'>
            <h2 className='text-lg sm:text-xl font-semibold mb-2 sm:mb-0'>Distribución de Progreso</h2>
            <p className='text-sm sm:text-base'>
              Ultima modificación:{' '}
              <span className='badge badge-warning font-semibold'>
                {new Date(lastDate).toLocaleString()}
              </span>
            </p>
          </div>
          {!loading ? (
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={getProgressData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='progress' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='count' name="Nro de Usuarios" fill='#3a69aa' />
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
        ))}
      </div>

      <div className='overflow-x-auto w-full'>
        <table className='w-full min-w-[640px] overflow-hidden text-sm sm:text-base'>
          <thead>
          <tr>
            {[
              { key: 'course', label: 'Curso' },
              { key: 'name', label: 'Nombre' },
              { key: 'lastName', label: 'Apellido' },
              { key: 'email', label: 'Correo' },
              { key: 'business', label: 'Empresa' },
              { key: 'stateOfCompleteness', label: 'Estado' },
              { key: 'progressPercentage', label: '% de progreso' },
            ].map(({ key, label }) => (
              <th
                key={key}
                className='py-2 px-2 border-b cursor-pointer'
                onClick={() => handleSort(key as keyof DataItem)}
              >
                {label} <SortIcon column={key as keyof DataItem} />
              </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {displayedData.map((item) => (
            <tr key={item.id} className='text-center'>
              <td className='py-2 px-2 border-b'>{item.course}</td>
              <td className='py-2 px-2 border-b text-left'>{item.name}</td>
              <td className='py-2 px-2 border-b text-left'>
                {item.lastName}
              </td>
              <td className='py-2 px-2 border-b text-left'>{item.email}</td>
              <td className='py-2 px-2 border-b text-left'>
                {item.business}
              </td>
              <td className='py-2 px-2 border-b'>
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
              <td className='py-2 px-4 border-b'>
                {item.progressPercentage}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
      {displayedData.length < filteredData.length && (
        <div className='mt-4 flex justify-center'>
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

