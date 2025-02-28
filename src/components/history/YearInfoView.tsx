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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Annual Historical Data</h2>
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="mb-4 p-2 border rounded-lg"
      >
        <option value="all">All Courses</option>
        {courses.map((course) => (
          <option key={course} value={course}>
            {course}
          </option>
        ))}
      </select>
      <div className={"flex justify-center items-center bg-white rounded-lg shadow-xl p-4"}>
      <ResponsiveContainer width={"100%"} height={450} className={"m-4 p-4"}>
      <BarChart data={chartData}>
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        {selectedCourse === "all" ? (
          courses.map((course) => (
            <Bar key={course} dataKey={course} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
          ))
        ) : (
          <Bar dataKey={selectedCourse} fill="#8884d8" />
        )}
      </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}

export default YearInfoView