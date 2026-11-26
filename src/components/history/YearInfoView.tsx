import type React from 'react';
import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DataItem } from '../../interfaces/IData';
import { CHART_AXIS, CHART_GRID, ChartTooltip, courseColor } from '../ui/chartTheme';

interface YearInfoViewProps {
  data: DataItem[];
}

const YearInfoView: React.FC<YearInfoViewProps> = ({ data }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  const courses = useMemo(
    () => Array.from(new Set(data.map((item) => item.course))).filter(Boolean).sort((a, b) => a.localeCompare(b, 'es')),
    [data],
  );

  const chartData = useMemo(() => {
    const byYear: Record<string, Record<string, number>> = {};
    data.forEach((item) => {
      if (!item.year) return;
      byYear[item.year] ??= {};
      byYear[item.year][item.course] = (byYear[item.year][item.course] ?? 0) + 1;
    });
    return Object.entries(byYear)
      .sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true }))
      .map(([year, counts]) => ({ year, ...counts }));
  }, [data]);

  const visibleCourses = selectedCourse === 'all' ? courses : [selectedCourse];

  return (
    <section className="dashboard-card">
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="card-title">Participantes por año</h2>
          <p className="card-subtitle">Cantidad de participantes de cada curso, año por año.</p>
        </div>
        <div className="w-full sm:w-60">
          <label className="block text-xs font-medium text-[color:var(--text-muted)] mb-1" htmlFor="course-filter">Curso</label>
          <select
            id="course-filter"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={`input-field-sm ${selectedCourse !== 'all' ? 'is-active' : ''}`}
          >
            <option value="all">Todos los cursos</option>
            {courses.map((course) => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
      </header>

      {chartData.length === 0 ? (
        <p className="py-16 text-center text-[13px] text-[color:var(--text-muted)]">Sin datos para mostrar</p>
      ) : (
        <div className="h-[300px] sm:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 4, left: -12, bottom: 0 }} barCategoryGap="22%">
              <CartesianGrid {...CHART_GRID} />
              <XAxis dataKey="year" {...CHART_AXIS} />
              <YAxis {...CHART_AXIS} allowDecimals={false} width={44} />
              <Tooltip cursor={{ fill: 'rgba(58,105,170,0.06)' }} content={<ChartTooltip formatter={(v) => `${v}`} />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: 12 }}
                formatter={(value) => <span className="text-[13px] text-[color:var(--text)]">{value}</span>}
              />
              {visibleCourses.map((course, i) => (
                <Bar key={course} dataKey={course} fill={courseColor(course, i)} radius={[3, 3, 0, 0]} maxBarSize={36} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default YearInfoView;
