import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardData, useUploadDate } from '../../hooks/queries';
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
import { StatCardSkeleton, Skeleton } from '../ui/Skeleton';
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

const EMPTY_DATA: DataItem[] = [];

const Current: React.FC = () => {
  const { data = EMPTY_DATA, isLoading } = useDashboardData();
  const { data: uploadDateData } = useUploadDate();
  const lastDate = uploadDateData?.uploadDate ?? '';

  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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
    filterAndSortData();
  }, [data, filters, sortConfig]);

  const displayedData = useMemo(() => {
    return filteredData.slice(0, currentPage * itemsPerPage);
  }, [filteredData, currentPage]);

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
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="stat-card">
              <h2 className="text-sm font-medium text-white/80 mb-1">
                Usuarios que iniciaron sesión
              </h2>
              <p className="text-2xl sm:text-3xl font-bold">
                {getLoginStats.loggedInCount}
                <span className="text-base font-normal text-white/70 ml-2">
                  de {getLoginStats.totalCount} ({getLoginStats.rate}%)
                </span>
              </p>
            </div>
            <div className="stat-card">
              <h2 className="text-sm font-medium text-white/80 mb-1">
                Usuarios que completaron el curso
              </h2>
              <p className="text-2xl sm:text-3xl font-bold">
                {getCompletionStats.completedCount}
                <span className="text-base font-normal text-white/70 ml-2">
                  de {getCompletionStats.totalCount} ({getCompletionStats.rate}%)
                </span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Progress Chart */}
      <div className="dashboard-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <h2 className="section-title mb-2 sm:mb-0">
            Distribución de Progreso
          </h2>
          <p className="text-sm text-gray-500">
            Última modificación:{' '}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              {new Date(lastDate).toLocaleString()}
            </span>
          </p>
        </div>
        {isLoading ? (
          <Skeleton className="w-full h-[300px]" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="progress" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="count" name="Nro de Usuarios" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Data Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="section-title">Datos de Usuario</h1>
        <button
          onClick={handleDownloadXLSX}
          className="btn-secondary"
        >
          <Download size={16} />
          Descargar Excel
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {Object.entries(filters).map(
          ([key, value]) =>
            (userRole === 'admin' ||
              !['association', 'businessGroup', 'business'].includes(key)) && (
              <div key={key} className="min-w-[130px] max-w-[180px] flex-1">
                <label
                  htmlFor={`${key}-filter`}
                  className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5 block"
                >
                  {FilterLabels[key as keyof typeof FilterLabels]}
                </label>
                <select
                  id={`${key}-filter`}
                  value={value}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="input-field-sm"
                >
                  <option value="all">Todos</option>
                  {getUniqueValues(key as keyof DataItem).map((option) => (
                    <option key={option?.toString()} value={option?.toString()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )
        )}
      </div>

      {/* Table */}
      <div className="dashboard-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <TableCurrent
            data={displayedData}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </div>
      </div>

      {displayedData.length < filteredData.length && (
        <div className="flex justify-center">
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="btn-secondary"
          >
            Cargar más
          </button>
        </div>
      )}
    </div>
  );
};

export default Current;