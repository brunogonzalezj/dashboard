import type React from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from "recharts"
import type { DataItem } from "../../interfaces/IData"

interface InfoViewProps {
  data: DataItem[]
}

const InfoView: React.FC<InfoViewProps> = ({ data }) => {
  const totalRegistered = data.length
  const loggedIn = data.filter((item) => item.login === "true").length
  const completed = data.filter((item) => item.stateOfCompleteness === "Completed").length

  const funnelData = [
    { name: "Registered", value: totalRegistered },
    { name: "Logged In", value: loggedIn },
    { name: "Completed", value: completed },
  ]

  return (
    <div className="flex flex-col w-full h-full items-center justify-center">
      <div className="flex flex-col w-full h-full rounded-lg shadow-xl p-4 bg-white">
        <h2 className="text-2xl font-bold mb-4">Funnel de Cursos</h2>
        <ResponsiveContainer width={"100%"} height={350}>
          <BarChart data={funnelData} layout="vertical" >
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 14 }} />
            <Tooltip />
            <Bar dataKey="value" name="Cantidad" fill="#8884d8">
              <LabelList dataKey="value" position="right" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-col justify-center p-4 text-center space-y-2 mt-4 bg-gray-100 rounded-lg">
          <p>Registered: {totalRegistered} (100%)</p>
          <p>
            Logged In: {loggedIn} ({((loggedIn / totalRegistered) * 100).toFixed(2)}%)
          </p>
          <p>
            Completed: {completed} ({((completed / totalRegistered) * 100).toFixed(2)}%)
          </p>
        </div>
      </div>
    </div>
  )
}

export default InfoView

