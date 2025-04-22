import React, { useCallback, useEffect, useState } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import type { DataItem } from "../../interfaces/IData"

interface ChartsViewProps {
  data: DataItem[]
  selectedCountry: string
  onCountrySelect: (country: string) => void
}

interface Position {
  coordinates: [number, number];
  zoom: number;
}
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const ChoroplethMap: React.FC<ChartsViewProps> = ({ data, selectedCountry, onCountrySelect }) => {
  const countries = Array.from(new Set(data.map((d) => d.country)))
  const [countriesData, setCountriesData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [position, setPosition] = useState<Position>({ coordinates: [0, 0], zoom: 1 });
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  };

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY;
    if (delta > 0) {
      handleZoomOut();
    } else {
      handleZoomIn();
    }
  }, []);

  useEffect(() => {
    // Cargar los datos de países desde una fuente confiable
    fetch("/countries_es.geo.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudieron cargar los datos del mapa")
        }
        return response.json()
      })
      .then((data) => {
        setCountriesData(data)
      })
      .catch((err) => {
        console.error("Error cargando el mapa:", err)
        setError("No se pudo cargar el mapa. Por favor, intenta de nuevo más tarde.")
      })
  }, [])

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  return (
    <div className="mb-4 h-1/3">
      {error && <p className="text-red-500">{error}</p>}
      {!countriesData && !error && <p>Cargando mapa...</p>}

      <ComposableMap>
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={countriesData}>
            {({ geographies }) =>
              geographies.map((geo: { rsmKey: any; properties: { name: string } }) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={
                    selectedCountry === geo.properties.name
                      ? '#f59e0b'
                      : countries.includes(geo.properties.name)
                        ? '#9b9b9b'
                        : '#E5E5E5'
                  }
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: {
                      fill: countries.includes(geo.properties.name) ? '#f59e0b' : '#E5E5E5',
                      cursor: countries.includes(geo.properties.name) ? 'pointer' : 'default'
                    }
                  }}
                  onMouseEnter={(e) => {
                    const { pageX, pageY } = e;
                    setTooltipContent(geo.properties.name);
                    setTooltipPosition({ x: pageX, y: pageY });
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                  onClick={() => {
                    if (countries.includes(geo.properties.name)) {
                      onCountrySelect(geo.properties.name);
                    }
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {tooltipContent && (
        <div
          style={{
            position: 'fixed',
            top: tooltipPosition.y - 40,
            left: tooltipPosition.x + 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '14px',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          {tooltipContent}
        </div>
      )}
      <select
        value={selectedCountry}
        onChange={(e) => onCountrySelect(e.target.value)}
        className="mt-2 p-2 border rounded"
      >
        <option value="all">All Countries</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
    </div>
  )
}

const ChartsView: React.FC<ChartsViewProps> = ({ data, selectedCountry, onCountrySelect }) => {
  const genderData = Object.entries(
    data.reduce((acc: Record<string, number>, item) => {
      acc[item.gender] = (acc[item.gender] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const educationData = Object.entries(
    data.reduce((acc: Record<string, number>, item) => {
      acc[item.education] = (acc[item.education] || 0) + 1
      return acc
    }, {}),
  ).map(([name, value]) => ({ name, value }))

  const jobAreaData = Object.entries(
    data.reduce((acc: Record<string, number>, item) => {
      acc[item.jobArea] = (acc[item.jobArea] || 0) + 1
      return acc
    }, {}),
  ).map(([name, value]) => ({ name, value }))

  const experienceData = Object.entries(
    data.reduce((acc: Record<string, number>, item) => {
      acc[item.yearsExperience] = (acc[item.yearsExperience] || 0) + 1
      return acc
    }, {}),
  ).map(([name, value]) => ({ name, value }))

  const courseData = Object.entries(
    data.reduce((acc: Record<string, number>, item) => {
      acc[item.course] = (acc[item.course] || 0) + 1
      return acc
    }, {}),
  ).map(([name, value]) => ({ name, value }))

  return (
    <div className="min-h-full grid grid-cols-6 grid-rows-6 gap-6 overflow-hidden p-2">
      <div className="col-span-2 row-span-6  rounded-lg shadow-xl p-2 bg-white">
        <ChoroplethMap data={data} selectedCountry={selectedCountry} onCountrySelect={onCountrySelect} />
      </div>

      <div className={"col-span-2 row-span-2 col-start-3  rounded-lg shadow-xl p-2 bg-white"}>
        <h3 className="text-lg font-bold mb-2">Gender Distribution</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={genderData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={"col-span-2 row-span-2 col-start-5  rounded-lg shadow-xl p-2 bg-white"}>
        <h3 className="text-lg font-bold mb-2">Education Level</h3>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={educationData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {educationData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={"col-span-2 row-span-2 col-start-3 row-start-3  rounded-lg shadow-xl p-2 bg-white"}>
        <h3 className="text-lg font-bold mb-2">Job Area Distribution</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={jobAreaData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={"col-span-2 row-span-2 col-start-5 row-start-3  rounded-lg shadow-xl p-2 bg-white"}>
        <h3 className="text-lg font-bold mb-2">Years of Experience</h3>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={experienceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {experienceData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={"col-span-2 row-span-2 col-start-4 row-start-5 rounded-lg shadow-xl p-2 bg-white"}>
        <h3 className="text-lg font-bold mb-2">Course Distribution</h3>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie data={courseData} cx="50%" cy="50%" labelLine={false} outerRadius={60} fill="#8884d8" dataKey="value">
              {courseData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ChartsView

