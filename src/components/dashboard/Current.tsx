import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronDownIcon, ChevronUpIcon, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion';

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
  business = 'Empresa'
}

const Current: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [displayedData, setDisplayedData] = useState<DataItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    login: 'all',
    course: 'all',
    country: 'all',
    business: 'all'
  });

  const [sortConfig, setSortConfig] = useState<{ key: keyof DataItem, direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterAndSortData();
  }, [data, filters, sortConfig]);

  useEffect(() => {
    setDisplayedData(filteredData.slice(0, currentPage * itemsPerPage));
  }, [filteredData, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = `${import.meta.env.API_URL}/data/dashboard-data`;
      const response = await axios.get(url, { withCredentials: true });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortData = () => {
    const result = data.filter(item =>
      Object.entries(filters).every(([key, value]) =>
        value === 'all' || item[key as keyof DataItem] === value
      )
    );

    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(result);
    setCurrentPage(1);
  };

  const handleSort = (key: keyof DataItem) => {
    setSortConfig(prevConfig =>
      prevConfig?.key === key
        ? { ...prevConfig, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const SortIcon = ({ column }: { column: keyof DataItem }) => {
    if (sortConfig?.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4 inline-block ml-1" /> :
      <ChevronDownIcon className="w-4 h-4 inline-block ml-1" />;
  };

  const getAverageProgress = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const totalProgress = filteredData.reduce((sum, item) => sum + parseFloat(item.progressPercentage), 0);
    return (totalProgress / filteredData.length).toFixed(2);
  }, [filteredData]);

  const getCompletionRate = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const completedCourses = filteredData.filter(item => item.stateOfCompleteness === 'Completado').length;
    return ((completedCourses / filteredData.length) * 100).toFixed(2);
  }, [filteredData]);

  const getAverageScore = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const totalScore = filteredData.reduce((sum, item) => sum + parseFloat(item.finalScore), 0);
    return (totalScore / filteredData.length).toFixed(2);
  }, [filteredData]);

  const getProgressData = useMemo(() => {
    const progressCounts = filteredData.reduce((acc, item) => {
      const progress = Math.floor(parseFloat(item.progressPercentage) / 10) * 10;
      acc[progress] = (acc[progress] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(progressCounts).map(([progress, count]) => ({
      progress: `${progress}-${parseInt(progress) + 10}%`,
      count
    }));
  }, [filteredData]);

  const handleDownloadXLSX = () => {
    const dataToExport = filteredData.map(item => ({
      'Curso': item.course,
      'Nombre': item.name,
      'Apellido': item.lastName,
      'Correo': item.email,
      'Empresa': item.business,
      'Estado': item.stateOfCompleteness,
      '% de avance': item.progressPercentage
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos del Dashboard');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'datos_dashboard.xlsx');
  };

  const getUniqueValues = (key: keyof DataItem) => {
    return Array.from(new Set(filteredData.map(item => item[key]))).sort();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="stat-card"
        >
          <h2 className="text-lg font-medium mb-2">Progreso Promedio</h2>
          {!loading ? (
            <p className="text-4xl font-bold">{getAverageProgress}%</p>
          ) : (
            <span className="loading loading-ring loading-lg"></span>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="stat-card"
        >
          <h2 className="text-lg font-medium mb-2">Tasa de Completados</h2>
          {!loading ? (
            <p className="text-4xl font-bold">{getCompletionRate}%</p>
          ) : (
            <span className="loading loading-ring loading-lg"></span>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="stat-card"
        >
          <h2 className="text-lg font-medium mb-2">Puntaje Promedio</h2>
          {!loading ? (
            <p className="text-4xl font-bold">{getAverageScore}%</p>
          ) : (
            <span className="loading loading-ring loading-lg"></span>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="dashboard-card"
      >
        <h2 className="text-xl font-semibold mb-6">Distribución de Progreso</h2>
        {!loading ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={getProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="progress" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-[350px]">
            <span className="loading loading-ring loading-lg"></span>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="dashboard-card"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Datos de Usuario</h2>
          <button
            onClick={handleDownloadXLSX}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Excel</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(filters).map(([key, value]) => (
              <div key={key}>
                <label htmlFor={`${key}-filter`} className="block text-sm font-medium text-gray-700 mb-1">
                  {FilterLabels[key as keyof typeof FilterLabels]}
                </label>
                <select
                  id={`${key}-filter`}
                  value={value}
                  onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                  className="input-field"
                >
                  <option value="all">Todos</option>
                  {getUniqueValues(key as keyof DataItem).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            {!loading ? (
              <table className="data-table">
                <thead>
                  <tr>
                    {['curso', 'nombre', 'apellido', 'correo', 'empresa', 'estado', '% de progreso'].map((column) => (
                      <th
                        key={column}
                        onClick={() => handleSort(column as keyof DataItem)}
                        className="cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                      >
                        {column.charAt(0).toUpperCase() + column.slice(1)}
                        <SortIcon column={column as keyof DataItem} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td>{item.course}</td>
                      <td>{item.name}</td>
                      <td>{item.lastName}</td>
                      <td>{item.email}</td>
                      <td>{item.business}</td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.stateOfCompleteness === 'Completado'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.stateOfCompleteness === 'Completado' ? 'Completado' : 'No completado'}
                        </span>
                      </td>
                      <td>{item.progressPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex justify-center py-8">
                <span className="loading loading-ring loading-lg"></span>
              </div>
            )}
          </div>

          {displayedData.length < filteredData.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="btn-primary"
              >
                Cargar más
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Current;