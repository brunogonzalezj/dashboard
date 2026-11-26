import type React from "react"
import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DataItem } from "../../interfaces/IData"

interface YearInfoViewProps {
  data: DataItem[]
}

const YearInfoView: React.FC<YearInfoViewProps> = ({ data }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("all")

  const courses = Array.from(new Set(data.map((item) => item.course)))

  const yearlyData = data.reduce((acc: Record<string, Record<string, number>>, item) => {
    if (!acc[item.year]) {
      acc[item.year] = {}
    }
    if (!acc[item.year][item.course]) {
      acc[item.year][item.course] = 0
    }
    acc[item.year][item.course]++
    return acc
  }, {})

  const chartData = Object.entries(yearlyData).map(([year, courses]) => ({
    year,
    ...courses,
  }))

  const courseColors = {
    "Alimento Balanceado": "#DDA338",
    Avicultura: "#FFCE00",
    Acuacultura: "#85D5FC",
    Porcicultura: "#9E2A2B",
    "Ganado Lechero": "#6E6059",
  } as const

  type CourseName = keyof typeof courseColors

  const getColorForCourse = (course: string) => {
    if (Object.keys(courseColors).includes(course)) {
      return courseColors[course as CourseName]
    }
    return "#8884d8"
  }

  return (
    <div className="space-y-4">
      <div className="filter-bar">
        <div className="min-w-[140px] max-w-[200px]">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5 block" htmlFor="course-filter">Curso</label>
          <select
            id="course-filter"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="input-field-sm"
          >
            <option value="all">Todos los cursos</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="dashboard-card">
        <h2 className="section-title mb-2">Información Histórica Anual</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <XAxis dataKey="year" tick={{ fontSize: 13, fill: '#4B5563' }} />
            <YAxis tick={{ fontSize: 13, fill: '#4B5563' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            />
            <Legend />
            {selectedCourse === "all" ? (
              courses.map((course) => (
                <Bar key={course} dataKey={course} fill={getColorForCourse(course)} radius={[4, 4, 0, 0]} />
              ))
            ) : (
              <Bar dataKey={selectedCourse} fill={getColorForCourse(selectedCourse)} radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default YearInfoView