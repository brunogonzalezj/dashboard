import React, { Suspense, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarClock, Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import { useAuth } from '../../contexts/AuthContext';
import { DataItem } from '../../interfaces/IData';
import { FilterBar } from '../ui/FilterBar';
import { Skeleton, StatCardSkeleton, TableSkeleton } from '../ui/Skeleton';
import { Spinner } from '../ui/Spinner';
import { CHART_AXIS, CHART_GRID } from '../ui/chartTheme';
import { ChartTooltip } from '../ui/ChartTooltip';

const TableCurrent = React.lazy(() => import('../TableCurrent'));

type FilterKey =
  | 'login' | 'course' | 'country' | 'business' | 'progressPercentage'
  | 'association' | 'businessGroup' | 'stateOfCompleteness' | 'year';

const FILTER_LABELS: Record<FilterKey, string> = {
  course: 'Curso',
  country: 'País',
  login: 'Inició sesión',
  stateOfCompleteness: 'Estado',
  progressPercentage: 'Progreso',
  business: 'Empresa',
  businessGroup: 'Grupo empresarial',
  association: 'Asociación',
  year: 'Año',
};

/** Filtros que solo ve un administrador */
const ADMIN_ONLY: FilterKey[] = ['association', 'businessGroup', 'business'];

const PROGRESS_RANGES = Array.from({ length: 10 }, (_, i) => `${i * 10}-${i * 10 + 10}`);
const PAGE_SIZE = 50;

const progressOf = (item: DataItem) => {
  const n = parseFloat(item.progressPercentage);
  return Number.isFinite(n) ? n : 0;
};

/** Rango de progreso: el último tramo incluye el 100 % */
const inRange = (value: number, range: string) => {
  const [min, max] = range.split('-').map(Number);
  return value >= min && (max === 100 ? value <= max : value < max);
};

interface ParticipantsViewProps {
  data: DataItem[];
  isLoading: boolean;
  variant: 'current' | 'historic';
  /** Fecha de la última carga, solo para cursos activos */
  uploadDate?: string;
}

const ParticipantsView: React.FC<ParticipantsViewProps> = ({ data, isLoading, variant, uploadDate }) => {
  const { username, userRole } = useAuth();
  const isHistoric = variant === 'historic';

  const filterKeys = useMemo<FilterKey[]>(() => {
    const base: FilterKey[] = ['course', 'country', 'login', 'stateOfCompleteness', 'progressPercentage', 'business', 'businessGroup', 'association'];
    const keys = isHistoric ? ['year' as FilterKey, ...base] : base;
    return keys.filter((k) => userRole === 'admin' || !ADMIN_ONLY.includes(k));
  }, [isHistoric, userRole]);

  const emptyFilters = useMemo(
    () => Object.fromEntries(filterKeys.map((k) => [k, 'all'])) as Record<FilterKey, string>,
    [filterKeys],
  );
  const [filters, setFilters] = useState<Record<FilterKey, string>>(emptyFilters);
  const [sortConfig, setSortConfig] = useState<{ key: keyof DataItem; direction: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const filteredData = useMemo(() => {
    const result = data.filter((item) =>
      filterKeys.every((key) => {
        const value = filters[key] ?? 'all';
        if (value === 'all') return true;
        if (key === 'progressPercentage') return inRange(progressOf(item), value);
        return String(item[key as keyof DataItem]) === value;
      }),
    );
    if (sortConfig) {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const av = a[sortConfig.key];
        const bv = b[sortConfig.key];
        if (sortConfig.key === 'progressPercentage') return (progressOf(a) - progressOf(b)) * dir;
        if (typeof av === 'string' && typeof bv === 'string') {
          return av.localeCompare(bv, 'es', { sensitivity: 'base', numeric: true }) * dir;
        }
        if (av < bv) return -dir;
        if (av > bv) return dir;
        return 0;
      });
    }
    return result;
  }, [data, filters, filterKeys, sortConfig]);

  const displayed = useMemo(() => filteredData.slice(0, page * PAGE_SIZE), [filteredData, page]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const loggedIn = filteredData.filter((i) => i.login === 'SI').length;
    const completed = filteredData.filter((i) => i.stateOfCompleteness === 'Completado').length;
    const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
    return { total, loggedIn, completed, loginRate: pct(loggedIn), completionRate: pct(completed) };
  }, [filteredData]);

  // Distribución en 10 tramos fijos para que el eje no salte según los datos
  const progressData = useMemo(() => {
    const counts = new Array(10).fill(0);
    filteredData.forEach((item) => {
      const bucket = Math.min(9, Math.floor(progressOf(item) / 10));
      counts[Math.max(0, bucket)] += 1;
    });
    return counts.map((count, i) => ({ range: `${i * 10}–${i * 10 + 10}%`, count }));
  }, [filteredData]);

  const optionsFor = (key: FilterKey) => {
    if (key === 'progressPercentage') return PROGRESS_RANGES;
    return Array.from(new Set(data.map((item) => item[key as keyof DataItem]))).sort((a, b) =>
      String(a).localeCompare(String(b), 'es', { numeric: true }),
    );
  };

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSort = (key: keyof DataItem) => {
    setSortConfig((prev) =>
      prev?.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' },
    );
  };

  const handleDownloadXLSX = async () => {
    setExporting(true);
    setExportError('');
    try {
      const path = isHistoric ? '/data/export-history-xlsx' : '/data/export-xlsx';
      const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
            ...(isHistoric ? { year: item.year, finalScore: item.finalScore } : {}),
          })),
          username,
        }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const date = new Date().toISOString().split('T')[0];
      saveAs(
        blob,
        isHistoric
          ? `Reporte histórico de participantes de ${username} de cursos de SEC_${date}.xlsx`
          : `Reporte de participantes de ${username} de cursos de SEC_${date}.xlsx`,
      );
    } catch (error) {
      console.error('Error al generar el archivo Excel:', error);
      setExportError('No se pudo generar el Excel. Intenta de nuevo en unos minutos.');
    } finally {
      setExporting(false);
    }
  };

  const formattedUpload =
    uploadDate && !isNaN(new Date(uploadDate).getTime())
      ? new Date(uploadDate).toLocaleString('es', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : null;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        {!isHistoric && <Skeleton className="h-[320px] rounded-xl" />}
        <Skeleton className="h-[104px] rounded-xl" />
        <TableSkeleton rows={8} cols={7} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          label="Iniciaron sesión"
          value={stats.loggedIn}
          total={stats.total}
          rate={stats.loginRate}
          tone="navy"
        />
        <StatCard
          label="Completaron el curso"
          value={stats.completed}
          total={stats.total}
          rate={stats.completionRate}
          tone="amber"
        />
      </div>

      {/* Distribución del progreso: solo en cursos activos */}
      {!isHistoric && (
        <section className="dashboard-card">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
            <div>
              <h2 className="card-title">Distribución del progreso</h2>
              <p className="card-subtitle">Cantidad de participantes por tramo de avance</p>
            </div>
            <p className="inline-flex items-center gap-1.5 text-[13px] text-(--text-muted)">
              <CalendarClock className="h-4 w-4" />
              {formattedUpload ? <>Datos del {formattedUpload}</> : 'Todavía no se cargaron datos'}
            </p>
          </div>
          <div className="h-[240px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid {...CHART_GRID} />
                <XAxis dataKey="range" {...CHART_AXIS} interval="preserveStartEnd" minTickGap={4} />
                <YAxis {...CHART_AXIS} allowDecimals={false} width={44} />
                <Tooltip
                  cursor={{ fill: 'rgba(58,105,170,0.06)' }}
                  content={<ChartTooltip format={(v) => `${v} participantes`} />}
                />
                <Bar dataKey="count" name="Participantes" fill="var(--navy-500)" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Participantes */}
      <section className="space-y-3" aria-labelledby={`${variant}-participantes`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id={`${variant}-participantes`} className="section-title">
              {isHistoric ? 'Participantes de cursos anteriores' : 'Participantes'}
            </h2>
            <p className="card-subtitle hidden xl:block">Ordena la tabla con el encabezado de cada columna.</p>
          </div>
          <button onClick={handleDownloadXLSX} disabled={exporting || filteredData.length === 0} className="btn-primary">
            {exporting ? <Spinner /> : <Download className="h-4 w-4" />}
            {exporting ? 'Generando…' : 'Descargar Excel'}
          </button>
        </div>

        {exportError && (
          <p className="notice-error" role="alert">{exportError}</p>
        )}

        <FilterBar
          fields={filterKeys.map((key) => ({
            key,
            label: FILTER_LABELS[key],
            value: filters[key] ?? 'all',
            options: optionsFor(key),
          }))}
          onChange={setFilter}
          onReset={() => {
            setFilters(emptyFilters);
            setPage(1);
          }}
          summary={
            <>
              {filteredData.length.toLocaleString('es')} de {data.length.toLocaleString('es')}
            </>
          }
        />

        <Suspense fallback={<TableSkeleton rows={8} cols={7} />}>
          <TableCurrent data={displayed} onSort={handleSort} sortConfig={sortConfig} isHistoric={isHistoric} />
        </Suspense>

        {filteredData.length > 0 && (
          <div className="flex flex-col items-center gap-3 pt-1">
            <p className="text-[13px] text-(--text-muted) tabular">
              Mostrando {displayed.length.toLocaleString('es')} de {filteredData.length.toLocaleString('es')}
            </p>
            {displayed.length < filteredData.length && (
              <button onClick={() => setPage((p) => p + 1)} className="btn-secondary">
                Mostrar {Math.min(PAGE_SIZE, filteredData.length - displayed.length)} más
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  total: number;
  rate: number;
  tone: 'navy' | 'amber';
}

function StatCard({ label, value, total, rate, tone }: StatCardProps) {
  return (
    <div className="dashboard-card p-4! sm:p-5!">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[13px] font-medium leading-snug text-(--text-muted)">{label}</p>
        <p className="text-sm font-semibold tabular text-(--text-strong)">{rate}%</p>
      </div>
      <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight tabular text-(--text-strong)">
        {value.toLocaleString('es')}
        <span className="ml-1 sm:ml-1.5 text-sm sm:text-base font-normal text-(--text-muted)">
          de {total.toLocaleString('es')}
        </span>
      </p>
      <div
        className="meter mt-4"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rate}
      >
        <span style={{ width: `${rate}%`, background: tone === 'navy' ? 'var(--navy-500)' : 'var(--amber-500)' }} />
      </div>
    </div>
  );
}

export default ParticipantsView;
