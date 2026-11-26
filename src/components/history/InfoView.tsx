import type React from "react"
import { FunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer, Cell } from "recharts"
import type { DataItem } from "../../interfaces/IData"

interface InfoViewProps {
  data: DataItem[]
}

const FUNNEL_COLORS = ['#3a69aa', '#f59e0b', '#10b981']

const InfoView: React.FC<InfoViewProps> = ({ data }) => {
  const totalRegistered = data.length
  const loggedIn = data.filter((item) => item.login === "SI").length
  const completed = data.filter((item) => item.stateOfCompleteness === "Completado").length

  const funnelData = [
    { name: "Registrados", value: totalRegistered, fill: FUNNEL_COLORS[0] },
    { name: "Iniciaron Sesión", value: loggedIn, fill: FUNNEL_COLORS[1] },
    { name: "Completados", value: completed, fill: FUNNEL_COLORS[2] },
  ]

  const conversionRates = [
    {
      label: 'Registro → Sesión',
      rate: totalRegistered > 0 ? ((loggedIn / totalRegistered) * 100).toFixed(1) : '0',
      drop: totalRegistered > 0 ? (((totalRegistered - loggedIn) / totalRegistered) * 100).toFixed(1) : '0',
    },
    {
      label: 'Sesión → Completado',
      rate: loggedIn > 0 ? ((completed / loggedIn) * 100).toFixed(1) : '0',
      drop: loggedIn > 0 ? (((loggedIn - completed) / loggedIn) * 100).toFixed(1) : '0',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="dashboard-card">
        <h2 className="section-title mb-4">Funnel de Progreso</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel Chart */}
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={350}>
              <FunnelChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: number, name: string) => [`${value} participantes`, name]}
                />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                  ))}
                  <LabelList
                    dataKey="name"
                    position="center"
                    fill="#fff"
                    fontSize={14}
                    fontWeight={600}
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* Stats sidebar */}
          <div className="flex flex-col gap-3 justify-center">
            {/* Stage cards */}
            {funnelData.map((stage, i) => {
              const pct = totalRegistered > 0 ? ((stage.value / totalRegistered) * 100).toFixed(1) : '0'
              return (
                <div
                  key={stage.name}
                  className="rounded-xl p-4 border border-gray-100"
                  style={{ backgroundColor: `${FUNNEL_COLORS[i]}10` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FUNNEL_COLORS[i] }} />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stage.name}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stage.value}</p>
                  <p className="text-xs text-gray-400">{pct}% del total</p>
                </div>
              )
            })}

            {/* Conversion rates */}
            <div className="mt-2 space-y-2">
              {conversionRates.map((cr) => (
                <div key={cr.label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-xs text-gray-500">{cr.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-green-600">{cr.rate}%</span>
                    <span className="text-xs text-red-400 ml-2">-{cr.drop}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoView