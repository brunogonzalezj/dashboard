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
    <div className="w-full h-full p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 h-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Información Histórica Anual</h2>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">Todos los cursos</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        <div className="h-[calc(100%-100px)]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="year"
                tick={{ fill: '#4B5563', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fill: '#4B5563', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px'
                }}
              />
              {selectedCourse === "all" ? (
                courses.map((course) => (
                  <Bar 
                    key={course} 
                    dataKey={course} 
                    fill={getColorForCourse(course)}
                    radius={[4, 4, 0, 0]}
                  />
                ))
              ) : (
                <Bar 
                  dataKey={selectedCourse} 
                  fill={getColorForCourse(selectedCourse)}
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default YearInfoView