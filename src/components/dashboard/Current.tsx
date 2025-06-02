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
import { Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import { DataItem } from '../../interfaces/IData.ts';
import { motion } from 'framer-motion';
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
    } finally {
      setLoading(false);
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
        : { key, direction: 'asc' }
    );
  };

  const getLoginStats = useMemo(() => {
    if (filteredData.length === 0) return { loggedInCount: 0, totalCount: 0, rate: 0 };

    const loggedInCount = filteredData.filter((item) => item.login === 'SI').length;
    const totalCount = filteredData.length;
    const rate = ((loggedInCount / totalCount) * 100).toFixed(0);

    return { loggedInCount, totalCount, rate };
  }, [filteredData]);

  const getCompletionStats = useMemo(() => {
    if (filteredData.length === 0) return { completedCount: 0, totalCount: 0, rate: 0 };

    const completedCount = filteredData.filter(
      (item) => item.stateOfCompleteness === 'Completado'
    ).length;
    const totalCount = filteredData.length;
    const rate = ((completedCount / totalCount) * 100).toFixed(0);

    return { completedCount, totalCount, rate };
  }, [filteredData]);

  const getProgressData = useMemo(() => {
    const progressCounts = filteredData.reduce((acc, item) => {
      const progress = Math.floor(parseFloat(item.progressPercentage) / 10) * 10;
      acc[progress] = (acc[progress] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(progressCounts)
      .map(([progress, count]) => ({
        progress: `${progress}-${parseInt(progress) + 10}%`,
        count,
      }))
      .sort((a, b) => parseInt(a.progress) - parseInt(b.progress));
  }, [filteredData]);

  const handleDownloadXLSX = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/data/export-xlsx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataToExport: filteredData.map((item) => ({
            course: item.course,
            name: item.name,
            lastName: item.lastName,
            country: item.country,
            city: item.city,
            email: item.email,
            login: item.login,
            business: item.business,
            stateOfCompleteness: item.stateOfCompleteness,
            progressPercentage: item.progressPercentage,
          })),
          username,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        saveAs(
          blob,
          `Reporte de participantes de ${username} de curos de SEC_${
            new Date().toISOString().split('T')[0]
          }.xlsx`
        );
      } else {
        console.error('Error al generar el archivo Excel');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-white rounded-xl shadow-xl space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-500 p-6 rounded-xl text-white"
        >
          <h2 className="text-xl font-semibold mb-3">Usuarios que iniciaron sesión</h2>
          {!loading ? (
            <p className="text-3xl font-bold">
              {getLoginStats.loggedInCount} de {getLoginStats.totalCount} usuarios ({getLoginStats.rate}%)
            </p>
          ) : (
            <div className="flex justify-center">
              <span className="loading loading-ring loading-lg"></span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-500 p-6 rounded-xl text-white"
        >
          <h2 className="text-xl font-semibold mb-3">Usuarios que completaron el curso</h2>
          {!loading ? (
            <p className="text-3xl font-bold">
              {getCompletionStats.completedCount} de {getCompletionStats.totalCount} usuarios ({getCompletionStats.rate}%)
            </p>
          ) : (
            <div className="flex justify-center">
              <span className="loading loading-ring loading-lg"></span>
            </div>
          )}
        </motion.div>
      </div>

      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-semibold">Distribución de Progreso</h2>
          <p className="text-sm text-gray-600">
            Ultima modificación:{' '}
            <span className="badge badge-warning font-semibold">
              {new Date(lastDate).toLocaleString()}
            </span>
          </p>
        </div>

        {!loading ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="progress" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Nro de Usuarios" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center h-[300px] items-center">
            <span className="loading loading-ring loading-lg"></span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Datos de Usuario</h2>
          <button
            onClick={handleDownloadXLSX}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            Descargar Excel
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(filters).map(
              ([key, value]) =>
                (userRole === 'admin' ||
                  !['association', 'businessGroup', 'business'].includes(key)) && (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {FilterLabels[key as keyof typeof FilterLabels]}
                    </label>
                    <select
                      value={value}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="all">Todos</option>
                      {getUniqueValues(key as keyof DataItem).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )
            )}
          </div>
        </div>

        <TableCurrent
          data={displayedData}
          onSort={handleSort}
          sortConfig={sortConfig}
        />

        {displayedData.length < filteredData.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cargar más
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Current;