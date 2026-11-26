import React, { useEffect, useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import type { GeoJsonObject } from 'geojson';
import { MapPin, X } from 'lucide-react';
import type { DataItem } from '../../interfaces/IData';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { FilterBar } from '../ui/FilterBar';
import { AnimatedBar } from '../ui/AnimatedNumber';
import { Skeleton } from '../ui/Skeleton';
import { CATEGORICAL, GENDER_COLORS, SEQUENTIAL, courseColor } from '../ui/chartTheme';

interface ChartsViewProps {
  data: DataItem[];
  selectedCountry: string;
  onCountrySelect: (country: string) => void;
}

type FilterKey =
  | 'login' | 'course' | 'country' | 'business' | 'progressPercentage'
  | 'association' | 'businessGroup' | 'stateOfCompleteness' | 'year';

const FILTER_LABELS: Record<FilterKey, string> = {
  year: 'Año',
  course: 'Curso',
  country: 'País',
  login: 'Inició sesión',
  stateOfCompleteness: 'Estado',
  progressPercentage: 'Progreso',
  business: 'Empresa',
  businessGroup: 'Grupo empresarial',
  association: 'Asociación',
};
// El país se elige en el mapa, por eso no está en la barra de filtros
const FILTER_ORDER: FilterKey[] = ['year', 'course', 'login', 'stateOfCompleteness', 'progressPercentage', 'business', 'businessGroup', 'association'];
const PROGRESS_RANGES = Array.from({ length: 10 }, (_, i) => `${i * 10}-${i * 10 + 10}`);

const EDUCATION_ORDER = ['Sin Formación', 'Primaria', 'Secundaria', 'Técnico', 'Universitario', 'Posgrado'];
const AGE_ORDER = ['<20', '20-30', '30-40', '40-50', '+50'];
const EXPERIENCE_ORDER = ['0-5', '5-10', '10-15', '15-20', '20+'];

interface Slice { name: string; count: number; pct: number }

/** Cuenta valores no vacíos y los pasa a porcentaje del total contado */
function distribution(items: string[], order?: string[]): Slice[] {
  const counts = new Map<string, number>();
  items.forEach((v) => {
    if (v === null || v === undefined || v === '') return;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  });
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  const slices = Array.from(counts.entries()).map(([name, count]) => ({
    name,
    count,
    pct: total ? Number(((count / total) * 100).toFixed(1)) : 0,
  }));
  if (order) {
    const rank = (n: string) => (order.indexOf(n) === -1 ? order.length : order.indexOf(n));
    return slices.sort((a, b) => rank(a.name) - rank(b.name));
  }
  return slices.sort((a, b) => b.count - a.count);
}

const progressOf = (item: DataItem) => {
  const n = parseFloat(item.progressPercentage);
  return Number.isFinite(n) ? n : 0;
};

/* ── Mapa ─────────────────────────────────────────────────────────── */

const ChoroplethMap: React.FC<ChartsViewProps> = ({ data, selectedCountry, onCountrySelect }) => {
  const countries = useMemo(() => Array.from(new Set(data.map((d) => d.country))).filter(Boolean).sort(), [data]);
  const [countriesData, setCountriesData] = useState<GeoJsonObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<{ name: string; x: number; y: number } | null>(null);

  useEffect(() => {
    fetch('/countries_es.geo.json')
      .then((response) => {
        if (!response.ok) throw new Error('No se pudieron cargar los datos del mapa');
        return response.json();
      })
      .then(setCountriesData)
      .catch((err) => {
        console.error('Error cargando el mapa:', err);
        setError('No se pudo cargar el mapa. Prueba recargar la página.');
      });
  }, []);

  const countFor = (name: string) => data.filter((d) => d.country === name).length;

  return (
    <div className="flex h-full flex-col gap-3">
      <div>
        <label htmlFor="map-country" className="block text-xs font-medium text-(--text-muted) mb-1">
          País
        </label>
        <select
          id="map-country"
          value={selectedCountry}
          onChange={(e) => onCountrySelect(e.target.value)}
          className={`input-field-sm ${selectedCountry !== 'all' ? 'is-active' : ''}`}
        >
          <option value="all">Todos los países</option>
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-[#f3f6fa]" style={{ touchAction: 'none' }}>
        {error && <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-[13px] text-red-700">{error}</p>}
        {!countriesData && !error && <Skeleton className="absolute inset-3" />}
        {countriesData !== null && (
          <ComposableMap className="absolute inset-0 h-full w-full">
            <g transform="translate(-80, -400) scale(2.7)">
              <Geographies geography={countriesData}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const name = String(geo.properties?.name ?? '');
                    const hasData = countries.includes(name);
                    const isSelected = selectedCountry === name;
                    const isHovered = hovered?.name === name;
                    // El resaltado al pasar el mouse se maneja con estado: en v5 `style` es CSS común, sin estados
                    const fill = isSelected
                      ? isHovered ? '#d97706' : '#f59e0b'
                      : hasData
                        ? isHovered ? '#fbbf24' : '#7fa8de'
                        : name === 'Bermuda' ? '#f3f6fa' : '#dfe4eb';
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke="#ffffff"
                        strokeWidth={0.4}
                        style={{ outline: 'none', cursor: hasData ? 'pointer' : 'default' }}
                        onMouseEnter={(e) => hasData && setHovered({ name, x: e.clientX, y: e.clientY })}
                        onMouseMove={(e) => hasData && setHovered({ name, x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => hasData && onCountrySelect(isSelected ? 'all' : name)}
                      />
                    );
                  })
                }
              </Geographies>
            </g>
          </ComposableMap>
        )}
        {selectedCountry !== 'all' && (
          <button
            onClick={() => onCountrySelect('all')}
            className="absolute left-2 top-2 inline-flex h-8 items-center gap-1.5 rounded-full bg-white pl-2.5 pr-2 text-xs font-semibold text-(--text-strong) shadow-xs ring-1 ring-black/5 hover:bg-[#f3f5f8]"
          >
            <MapPin className="h-3.5 w-3.5 text-secondary-600" />
            {selectedCountry}
            <X className="h-3.5 w-3.5 text-(--text-muted)" aria-label="Quitar país" />
          </button>
        )}
      </div>

      <p className="flex items-center gap-4 text-xs text-(--text-muted)">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-xs bg-primary-300" />Con participantes</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-xs bg-secondary-500" />Seleccionado</span>
      </p>

      {hovered && (
        <div
          className="pointer-events-none fixed z-50 rounded-md bg-primary-950 px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{ top: hovered.y - 44, left: hovered.x + 12 }}
        >
          <span className="font-semibold">{hovered.name}</span>
          <span className="ml-1.5 text-primary-200 tabular">{countFor(hovered.name)} participantes</span>
        </div>
      )}
    </div>
  );
};

/* ── Barras de porcentaje ─────────────────────────────────────────── */

interface PercentBarsProps {
  title: string;
  subtitle?: string;
  slices: Slice[];
  colorFor: (name: string, index: number) => string;
}

function PercentBars({ title, subtitle, slices, colorFor }: PercentBarsProps) {
  const max = Math.max(...slices.map((s) => s.pct), 1);
  const total = slices.reduce((a, s) => a + s.count, 0);
  return (
    <section className="dashboard-card flex flex-col">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        <span className="text-xs text-(--text-muted) tabular whitespace-nowrap">
          {total.toLocaleString('es')} con dato
        </span>
      </header>
      {slices.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-(--text-muted)">Sin datos para estos filtros</p>
      ) : (
        <ul className="space-y-3">
          {slices.map((s, i) => (
            <li key={s.name}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
                <span className="truncate text-(--text-strong)">{s.name}</span>
                <span className="whitespace-nowrap tabular">
                  <span className="font-semibold text-(--text-strong)">{s.pct.toLocaleString('es')}%</span>
                  <span className="ml-1.5 text-xs text-(--text-muted)">{s.count.toLocaleString('es')}</span>
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-[#eef1f5]" aria-hidden="true">
                <AnimatedBar
                  className="absolute inset-y-0 left-0 rounded-full"
                  ratio={s.pct / max}
                  color={colorFor(s.name, i)}
                  delay={Math.min(i * 0.04, 0.2)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Reparto entre dos o pocas categorías en una sola barra (género) */
function SplitBar({ title, slices, colorFor }: PercentBarsProps) {
  return (
    <section className="dashboard-card">
      <h3 className="card-title mb-4">{title}</h3>
      {slices.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-(--text-muted)">Sin datos para estos filtros</p>
      ) : (
        <>
          <div className="flex h-3 overflow-hidden rounded-full bg-[#eef1f5]" aria-hidden="true">
            {slices.map((s, i) => (
              <div key={s.name} style={{ width: `${s.pct}%`, background: colorFor(s.name, i) }} />
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {slices.map((s, i) => (
              <li key={s.name}>
                <p className="flex items-center gap-2 text-[13px] text-(--text-muted)">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorFor(s.name, i) }} />
                  {s.name}
                </p>
                <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular text-(--text-strong)">
                  {s.pct.toLocaleString('es')}%
                  <span className="ml-1.5 text-sm font-normal text-(--text-muted)">{s.count.toLocaleString('es')}</span>
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/* ── Vista ────────────────────────────────────────────────────────── */

const ChartsView: React.FC<ChartsViewProps> = ({ data, selectedCountry, onCountrySelect }) => {
  const { userRole } = useAuth();
  const visibleKeys = FILTER_ORDER.filter((k) => userRole?.toLowerCase() === 'admin' || k !== 'year');
  const emptyFilters = Object.fromEntries(FILTER_ORDER.map((k) => [k, 'all'])) as Record<FilterKey, string>;
  const [filters, setFilters] = useState<Record<FilterKey, string>>(emptyFilters);

  // Filtros de la barra, sin el país del mapa: el mapa sigue mostrando todos los países con datos
  const filteredExceptCountry = useMemo(
    () =>
      data.filter((item) =>
        FILTER_ORDER.every((key) => {
          const value = filters[key];
          if (value === 'all') return true;
          if (key === 'progressPercentage') {
            const [min, max] = value.split('-').map(Number);
            const p = progressOf(item);
            return p >= min && (max === 100 ? p <= max : p < max);
          }
          return String(item[key as keyof DataItem]) === value;
        }),
      ),
    [data, filters],
  );
  const filteredData = useMemo(
    () => (selectedCountry === 'all' ? filteredExceptCountry : filteredExceptCountry.filter((i) => i.country === selectedCountry)),
    [filteredExceptCountry, selectedCountry],
  );

  const optionsFor = (key: FilterKey) =>
    key === 'progressPercentage'
      ? PROGRESS_RANGES
      : Array.from(new Set(data.map((item) => item[key as keyof DataItem]))).sort((a, b) =>
          String(a).localeCompare(String(b), 'es', { numeric: true }),
        );

  const charts = useMemo(() => {
    const ageBucket = (item: DataItem) => {
      const birth = Number(item.birthday);
      const year = Number(item.year);
      if (!(birth > 0 && year > 0)) return '';
      const age = year - birth;
      if (age < 20) return '<20';
      if (age < 30) return '20-30';
      if (age < 40) return '30-40';
      if (age < 50) return '40-50';
      return '+50';
    };
    const expBucket = (item: DataItem) => {
      if (item.yearsExperience === '' || item.yearsExperience === null || item.yearsExperience === undefined) return '';
      const y = Number(item.yearsExperience);
      if (isNaN(y)) return '';
      if (y >= 20) return '20+';
      const start = Math.floor(y / 5) * 5;
      return `${start}-${start + 5}`;
    };
    return {
      gender: distribution(filteredData.map((i) => i.gender).filter((g) => g !== 'Prefiero no decirlo'), ['Hombre', 'Mujer']),
      education: distribution(filteredData.map((i) => i.education), EDUCATION_ORDER),
      jobArea: distribution(filteredData.map((i) => i.jobArea)),
      experience: distribution(filteredData.map(expBucket), EXPERIENCE_ORDER),
      courses: distribution(filteredData.map((i) => i.course)),
      age: distribution(filteredData.map(ageBucket), AGE_ORDER),
    };
  }, [filteredData]);

  const sequential = (count: number) => (_: string, i: number) =>
    SEQUENTIAL[Math.min(SEQUENTIAL.length - 1, Math.round((i / Math.max(1, count - 1)) * (SEQUENTIAL.length - 1)))];

  return (
    <div className="space-y-5">
      <FilterBar
        fields={visibleKeys.map((key) => ({
          key,
          label: FILTER_LABELS[key],
          value: filters[key],
          options: optionsFor(key),
        }))}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onReset={() => setFilters(emptyFilters)}
        summary={<>{filteredData.length.toLocaleString('es')} participantes</>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <section className="dashboard-card flex flex-col lg:row-span-2 h-[420px] lg:h-auto lg:min-h-[560px]">
          <h3 className="card-title mb-3">Participantes por país</h3>
          <div className="min-h-0 flex-1">
            <ChoroplethMap data={filteredExceptCountry} selectedCountry={selectedCountry} onCountrySelect={onCountrySelect} />
          </div>
        </section>

        <SplitBar title="Género" slices={charts.gender} colorFor={(n, i) => GENDER_COLORS[n] ?? CATEGORICAL[i]} />
        <PercentBars title="Edad" subtitle="Al momento del curso" slices={charts.age} colorFor={sequential(charts.age.length)} />
        <PercentBars title="Nivel de educación" slices={charts.education} colorFor={sequential(charts.education.length)} />
        <PercentBars title="Años de experiencia" slices={charts.experience} colorFor={sequential(charts.experience.length)} />
        <PercentBars title="Área de trabajo" slices={charts.jobArea} colorFor={() => CATEGORICAL[1]} />
        <PercentBars title="Cursos" slices={charts.courses} colorFor={(n, i) => courseColor(n, i)} />
      </div>
    </div>
  );
};

export default ChartsView;
