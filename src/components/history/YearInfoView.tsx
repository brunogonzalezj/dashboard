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
    <div>
        <div className={"flex flex-col  bg-white rounded-lg shadow-xl p-4"}>
            <h2 className="text-2xl font-bold mb-4 text-left">Información Histórica Anual</h2>
            <div className={"flex-col"}>
            <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="mb-4 p-2 border rounded-lg"
            >
                <option value="all">Todos los cursos</option>
                {courses.map((course) => (
                    <option key={course} value={course}>
                        {course}
                    </option>
                ))}
            </select>
            </div>
            <ResponsiveContainer width={"100%"} height={450} className={"m-4 p-4"}>
                <BarChart data={chartData}>
                    <XAxis dataKey="year"/>
                    <YAxis/>
                    <Tooltip/>
                    <Legend/>
                    {selectedCourse === "all" ? (
                        courses.map((course) => (
                            <Bar key={course} dataKey={course} fill={getColorForCourse(course)}/>
                        ))
                    ) : (
                        <Bar dataKey={selectedCourse} fill={getColorForCourse(selectedCourse)}/>
                    )}
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  )
}

export default YearInfoView