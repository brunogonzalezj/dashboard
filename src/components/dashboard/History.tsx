import { useState, useEffect } from "react"
import axios from "axios"
import ChartsView from "../history/ChartsView"
import InfoView from "../history/InfoView"
import YearInfoView from "../history/YearInfoView"
import type { DataItem } from "../../interfaces/IData"

enum ViewType {
  Charts = "Gráficos",
  Info = "Funnel",
  YearInfo = "Info Anual",
}

export default function History() {
  const [data, setData] = useState<DataItem[]>([])
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.Charts)
  const [selectedCountry, setSelectedCountry] = useState<string>("all")

  useEffect(() => {
    axios
      .get<DataItem[]>(`${import.meta.env.VITE_API_URL}/data/history-dashboard-data`, { withCredentials: true })
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error fetching data:", err))
  }, [])

  const filteredData = selectedCountry === "all" ? data : data.filter((item) => item.country === selectedCountry)

  return (
    <div className="h-full flex-1 flex flex-col overflow-hidden">
      <div className="p-4 h-full flex flex-col bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Vista Histórica</h2>
            <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 shadow-sm">
              {Object.values(ViewType).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === view 
                      ? 'bg-white text-gray-800 shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 h-full overflow-hidden bg-gray-50 rounded-lg p-4">
          {currentView === ViewType.Charts && (
            <ChartsView data={filteredData} selectedCountry={selectedCountry} onCountrySelect={setSelectedCountry} />
          )}
          {currentView === ViewType.Info && <InfoView data={filteredData} />}
          {currentView === ViewType.YearInfo && <YearInfoView data={filteredData} />}
        </div>
      </div>
    </div>
  )
}