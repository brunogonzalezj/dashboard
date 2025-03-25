import React, { useEffect, useState } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import type { DataItem } from "../../interfaces/IData"

interface ChartsViewProps {
  data: DataItem[]
  selectedCountry: string
  onCountrySelect: (country: string) => void
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const ChoroplethMap: React.FC<ChartsViewProps> = ({ data, selectedCountry, onCountrySelect }) => {
  const countries = Array.from(new Set(data.map((d) => d.country)))
  const [mapData, setMapData] = useState<string | Record<string, any> | undefined>(undefined);

  useEffect(() => {
    fetch("/world-110m.json") // 📌 Ojo: la ruta es relativa a `public/`
      .then((response) => response.json())
      .then((data) => setMapData(data))
      .catch((error) => console.error("Error cargando el mapa:", error));
  }, []);

  return (
    <div className="mb-4 h-1/3">
      <ComposableMap projection="geoMercator">
        <Geographies geography={mapData}>
          {({ geographies }) =>
            geographies.map((geo: { rsmKey: any; properties: { NAME: string } }) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={selectedCountry === geo.properties.NAME ? "#F53" : "#D6D6DA"}
                stroke="#FFFFFF"
                strokeWidth={0.5}
                onClick={() => onCountrySelect(geo.properties.NAME)}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
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
      acc[item.gender] = (acc[item.gender] || 0) + 1
      return acc
    }, {}),
  ).map(([name, value]) => ({ name, value }))

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

