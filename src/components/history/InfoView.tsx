import type React from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from "recharts"
import type { DataItem } from "../../interfaces/IData"

interface InfoViewProps {
  data: DataItem[]
}

const InfoView: React.FC<InfoViewProps> = ({ data }) => {
  const totalRegistered = data.length
  const loggedIn = data.filter((item) => item.login === "SI").length
  const completed = data.filter((item) => item.stateOfCompleteness === "Completado").length

  const funnelData = [
    { name: "Registrados", value: totalRegistered },
    { name: "Iniciaron Sesión", value: loggedIn },
    { name: "Completados", value: completed },
  ]

  return (
    <div className="flex flex-col w-full h-full items-center justify-center gap-6">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Funnel de Progreso</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={funnelData} layout="vertical">
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fontSize: 14, fill: '#4B5563' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            />
            <Bar 
              dataKey="value" 
              name="Cantidad" 
              fill="#3A69AA"
              radius={[0, 4, 4, 0]}
            >
              <LabelList 
                dataKey="value" 
                position="right"
                fill="#4B5563"
                fontSize={14}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Registrados</p>
            <p className="text-2xl font-bold text-gray-800">{totalRegistered}</p>
            <p className="text-sm text-gray-500">100%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Iniciaron Sesión</p>
            <p className="text-2xl font-bold text-gray-800">{loggedIn}</p>
            <p className="text-sm text-gray-500">
              {((loggedIn / totalRegistered) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Completados</p>
            <p className="text-2xl font-bold text-gray-800">{completed}</p>
            <p className="text-sm text-gray-500">
              {((completed / totalRegistered) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoView