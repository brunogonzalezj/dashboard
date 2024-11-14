import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
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

const buildBadge = (isCompleted: boolean) => {
  if (!isCompleted) {
    return <div className="badge badge-error text-white text-nowrap">No completado</div>;
  }
  return <div className="badge badge-success text-white">Completado</div>;
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [displayedData, setDisplayedData] = useState<DataItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const { isAuthenticated } = useAuth();
  const [dataType, setDataType] = useState<'actual' | 'historico'>('actual');
  const [loading, setLoading] = useState(true);

  // Estados para los filtros
  const [loginFilter, setLoginFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [businessFilter, setBusinessFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<keyof DataItem | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleDataTypeChange = (type: 'actual' | 'historico') => {
    setDataType(type);
    fetchData();
  };

  useEffect(() => {
    if (sortColumn) {
      const sortedData = [...filteredData].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      setFilteredData(sortedData);
    }
  }, [sortColumn, sortDirection]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, dataType]);

  useEffect(() => {
    filterData();
  }, [data, loginFilter, courseFilter, groupFilter, yearFilter, countryFilter, businessFilter]);

  useEffect(() => {
    setDisplayedData(filteredData.slice(0, currentPage * itemsPerPage));
  }, [filteredData, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = dataType === 'actual'
        ? 'http://localhost:3001/data/dashboard-data'
        : 'http://localhost:3001/data/history-dashboard-data';
      const response = await axios.get(url, { withCredentials: true });
      setData(response.data);

      setTimeout(() => {
          setLoading(false);
        }, 2000
      );
    } catch (error) {
      setData([]);
      console.error('Error fetching dashboard data:', error);
    }
  };

  const filterData = () => {
    let result = data;

    if (loginFilter !== 'all') {
      result = result.filter(item => item.login === loginFilter);
    }
    if (courseFilter !== 'all') {
      result = result.filter(item => item.course === courseFilter);
    }
    if (groupFilter !== 'all') {
      result = result.filter(item => item.grupo === groupFilter);
    }
    if (yearFilter !== 'all') {
      result = result.filter(item => item.year === yearFilter);
    }
    if (countryFilter !== 'all') {
      result = result.filter(item => item.country === countryFilter);
    }
    if (businessFilter !== 'all') {
      result = result.filter(item => item.business === businessFilter);
    }

    setFilteredData(result);
    setCurrentPage(1);

    updateFilterOptions(result);
  };

  const handleSort = (column: keyof DataItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: keyof DataItem }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4 inline-block ml-1" /> :
      <ChevronDownIcon className="w-4 h-4 inline-block ml-1" />;
  };

  const loadMore = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const getAverageProgress = () => {
    if (filteredData.length === 0) return 0;
    const totalProgress = filteredData.reduce((sum, item) => sum + parseFloat(item.progressPercentage), 0);
    return (totalProgress / filteredData.length).toFixed(2);
  };

  const getCompletionRate = () => {
    if (filteredData.length === 0) return 0;
    const completedCourses = filteredData.filter(item => item.stateOfCompleteness === 'Completado').length;
    return ((completedCourses / filteredData.length) * 100).toFixed(2);
  };

  const getAverageScore = () => {
    if (filteredData.length === 0) return 0;
    const totalScore = filteredData.reduce((sum, item) => sum + parseFloat(item.finalScore), 0);
    return (totalScore / filteredData.length).toFixed(2);
  };

  const getProgressData = () => {
    const progressCounts = filteredData.reduce((acc, item) => {
      const progress = Math.floor(parseFloat(item.progressPercentage) / 10) * 10;
      acc[progress] = (acc[progress] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(progressCounts).map(([progress, count]) => ({
      progress: `${progress}-${parseInt(progress) + 10}%`,
      count
    }));
  };

  const handleDownloadXLSX = () => {
    // Filtrar y mapear los datos requeridos
    const dataToExport = filteredData.map(item => ({
      'Curso': item.course,
      'Nombre': item.name,
      'Apellido': item.lastName,
      'Correo': item.email,
      'Empresa': item.business,
      'Estado': item.stateOfCompleteness,
      '% de avance': item.progressPercentage
    }));

    // Crear una hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Crear un libro de trabajo y agregar la hoja
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos del Dashboard');

    // Generar el archivo XLSX
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Descargar el archivo
    saveAs(data, 'datos_dashboard.xlsx');
  };

  const updateFilterOptions = (filteredData: DataItem[]) => {
    const getUniqueValues = (key: keyof DataItem) => Array.from(new Set(filteredData.map(item => item[key]))).sort();

    setCourseFilter(prevFilter => getUniqueValues('course').includes(prevFilter) ? prevFilter : 'all');
    setGroupFilter(prevFilter => getUniqueValues('grupo').includes(prevFilter) ? prevFilter : 'all');
    setYearFilter(prevFilter => getUniqueValues('year').includes(prevFilter) ? prevFilter : 'all');
    setCountryFilter(prevFilter => getUniqueValues('country').includes(prevFilter) ? prevFilter : 'all');
    setBusinessFilter(prevFilter => getUniqueValues('business').includes(prevFilter) ? prevFilter : 'all');
  };

  // Modify the getUniqueValues function to use filteredData instead of data
  const getUniqueValues = (key: keyof DataItem) => {
    return Array.from(new Set(filteredData.map(item => item[key]))).sort();
  };

  return (
    <>
      <div className="p-6 bg-gray-100 rounded-lg shadow-2xl overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => handleDataTypeChange('actual')}
              className={`px-4 py-2 rounded ${dataType === 'actual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Actual
            </button>
            <button
              onClick={() => handleDataTypeChange('historico')}
              className={`px-4 py-2 rounded ${dataType === 'historico' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Histórico
            </button>
          </div>
        </div>
        <div className={'flex flex-row mb-8'}>
          <div className={'flex flex-col w-1/4 gap-y-4'}>
            <div className="bg-[#3a69aa]/80 p-4 rounded-lg text-white">
              <h2 className="text-lg font-semibold mb-2">Progreso Promedio</h2>
              {!loading ? (
                <p className={`text-3xl font-bold`}>{getAverageProgress()}%</p>) : (
                <span className="loading loading-ring loading-lg"></span>)}
            </div>
            <div className="bg-[#3a69aa]/80 p-4 rounded-lg text-white">
              <h2 className="text-lg font-semibold mb-2">Tasa de Completados</h2>
              {!loading ? (
                <p className="text-3xl font-bold">{getCompletionRate()}%
                </p>) : (<span className="loading loading-ring loading-lg"></span>)}
            </div>
            <div className="bg-[#3a69aa]/80 p-4 rounded-lg text-white">
              <h2 className="text-lg font-semibold mb-2">Puntaje Promedio</h2>
              {!loading ? (
                <p className="text-3xl font-bold">{getAverageScore()}%</p>) : (
                <span className="loading loading-ring loading-lg"></span>)}
            </div>
          </div>

          <div className="flex items-center justify-center flex-col w-full">
            <h2 className="text-xl font-semibold mb-4">Distribución de Progreso</h2>
            {!loading ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={getProgressData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="progress" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3a69aa" />
                </BarChart>
              </ResponsiveContainer>) : (<span className="loading loading-ring loading-lg"></span>)}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">User Data</h1>
          <button
            onClick={handleDownloadXLSX}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <Download className="mr-2" size={18} />
            Descargar Excel
          </button>
        </div>
        <h2 className={'text-xl font-semibold'}>Filtros</h2>
        <div className="grid grid-cols-12 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="login-filter" className="block text-sm font-medium text-gray-700">Sesión Iniciada</label>
            <select
              id="login-filter"
              value={loginFilter}
              onChange={(e) => setLoginFilter(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">Todos</option>
              <option value="SI">SI</option>
              <option value="NO">NO</option>
            </select>
          </div>
          <div>
            <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700">Curso</label>
            <select
              id="course-filter"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">Todos</option>
              {getUniqueValues('course').map((course) => (
                <option key={`${course}`} value={`${course}`}>
                  {course}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="group-filter" className="block text-sm font-medium text-gray-700">Grupo</label>
            <select
              id="group-filter"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">Todos</option>
              {getUniqueValues('grupo').map(group => (
                <option key={`${group}`} value={`${group}`}>{group}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700">Año</label>
            <select
              id="year-filter"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">Todos</option>
              {getUniqueValues('year').map(year => (
                <option key={`${year}`} value={`${year}`}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="business-filter" className="block text-sm font-medium text-gray-700">Empresa</label>
            <select
              id="business-filter"
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">Todos</option>
              {getUniqueValues('business').map(business => (
                <option key={`${business}`} value={`${business}`}>{business}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="country-filter" className="block text-sm font-medium text-gray-700">País</label>
            <select
              id="country-filter"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">Todos</option>
              {getUniqueValues('country').map(country => (
                <option key={`${country}`} value={`${country}`}>{country}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">

          {!loading ?
            <table className="min-w-full bg-white overflow-y-auto">
              <thead>
              <tr>
                <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('course')}>
                  Curso <SortIcon column="name" />
                </th>
                <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('name')}>
                  Nombre <SortIcon column="name" />
                </th>
                <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('lastName')}>
                  Apellido <SortIcon column="name" />
                </th>
                <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('email')}>
                  Correo <SortIcon column="name" />
                </th>
                <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('business')}>
                  Empresa <SortIcon column="name" />
                </th>
                <th className="py-2 px-4 border-b cursor-pointer"
                    onClick={() => handleSort('stateOfCompleteness')}>
                  Estado <SortIcon column="name" />
                </th>
                <th className="py-2 px-4 border-b cursor-pointer"
                    onClick={() => handleSort('progressPercentage')}>
                  % de avance <SortIcon column="name" />
                </th>
              </tr>
              </thead>
              <tbody>
              {displayedData.map((item) => (

                <tr key={item.id} className={'text-center'}>
                  <td className="py-2 px-4 border-b">{item.course}</td>
                  <td className="py-2 px-4 border-b text-left">{item.name}</td>
                  <td className="py-2 px-4 border-b text-left">{item.lastName}</td>
                  <td className="py-2 px-4 border-b text-left">{item.email}</td>
                  <td className="py-2 px-4 border-b text-left">{item.business}</td>
                  <td className="py-2 px-4 border-b">{buildBadge(item.stateOfCompleteness === 'Completado')}</td>
                  <td className="py-2 px-4 border-b">{item.progressPercentage}</td>
                </tr>
              ))}
              </tbody>
            </table> : <div className={'flex items-center justify-center'}>
              <span className="loading loading-ring loading-lg"></span>
            </div>}
        </div>
        {displayedData.length < filteredData.length && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={loadMore}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Cargar más
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;