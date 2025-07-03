import { useState, useEffect } from "react"
import axios from "axios"
import ChartsView from "../history/ChartsView"
import type { DataItem } from "../../interfaces/IData"

enum ViewType {
  Charts = "Gráficos",
}

export default function History() {
  const [data, setData] = useState<DataItem[]>([])
  const [currentView] = useState<ViewType>(ViewType.Charts)
  const [selectedCountry, setSelectedCountry] = useState<string>("all")

  useEffect(() => {
    axios
      .get<DataItem[]>(`${import.meta.env.VITE_API_URL}/data/history-dashboard-data`, { withCredentials: true })
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error fetching data:", err))
  }, [])

  const filteredData = selectedCountry === "all" ? data : data.filter((item) => item.country === selectedCountry)

  return (
    <div className="h-full flex-1 flex flex-col overflow-hidden pt-2">
      <div className="p-4 h-full flex flex-col">
        <div className="mb-4">
        </div>

        <div className="flex-1 h-full overflow-hidden">
          {currentView === ViewType.Charts && (
            <ChartsView data={filteredData} selectedCountry={selectedCountry} onCountrySelect={setSelectedCountry} />
          )}
        </div>
      </div>
    </div>
  )
}