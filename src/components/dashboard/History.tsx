import { useState } from "react"
import { useHistoryData } from "../../hooks/queries"
import { DataItem } from "../../interfaces/IData"
import ChartsView from "../history/ChartsView"
import InfoView from "../history/InfoView"
import YearInfoView from "../history/YearInfoView"
import { Skeleton } from "../ui/Skeleton"

enum ViewType {
  Charts = "Gráficos",
  Info = "Información",
  YearInfo = "Info por año",
}

const EMPTY_DATA: DataItem[] = [];

export default function History() {
  const { data = EMPTY_DATA, isLoading } = useHistoryData()
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.Charts)
  const [selectedCountry, setSelectedCountry] = useState<string>("all")

  const filteredData = selectedCountry === "all" ? data : data.filter((item) => item.country === selectedCountry)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-10 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[300px] rounded-xl" />
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[250px] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex gap-2">
        {Object.values(ViewType).map((view) => (
          <button
            key={view}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === view
                ? "bg-amber-400 text-gray-800 shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-300"
            }`}
            onClick={() => setCurrentView(view)}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Content */}
      {currentView === ViewType.Charts && (
        <ChartsView data={filteredData} selectedCountry={selectedCountry} onCountrySelect={setSelectedCountry} />
      )}
      {currentView === ViewType.Info && (
        <InfoView data={filteredData} />
      )}
      {currentView === ViewType.YearInfo && (
        <YearInfoView data={filteredData} />
      )}
    </div>
  )
}