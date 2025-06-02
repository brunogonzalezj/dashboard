import React from 'react';
import { useEffect, useState } from "react"
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  ResponsiveContainer, 
  Legend,
  Label 
} from 'recharts';
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import type { DataItem } from "../../interfaces/IData"

interface ChartsViewProps {
    data: DataItem[]
    selectedCountry: string
    onCountrySelect: (country: string) => void
}

const COLORS = {
    gender: "#8884d8",
    education: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"],
    jobArea: "#82ca9d",
    experience: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"],
    courses: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]
}

const ChoroplethMap: React.FC<ChartsViewProps> = ({ data, selectedCountry, onCountrySelect }) => {
    const countries = Array.from(new Set(data.map((d) => d.country)))
    const [countriesData, setCountriesData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [tooltipContent, setTooltipContent] = useState("")
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
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

    return (
        <div className="h-full flex flex-col">
            {error && <p className="text-red-500 text-xs">{error}</p>}
            {!countriesData && !error && <p className="text-xs">Cargando mapa...</p>}
            <div className="mb-4">
                <select
                    value={selectedCountry}
                    onChange={(e) => onCountrySelect(e.target.value)}
                    className="w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                    <option value="all">Todos los países</option>
                    {countries.map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex-1 min-h-0 relative" style={{ touchAction: "none" }}>
                <ComposableMap className="rounded h-full w-full absolute inset-0">
                    <g transform={`translate(-90, -300) scale(2.5)`}>
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
                                                    : geo.properties.name === "Bermuda"
                                                        ? '#ffffff'
                                                        : '#E5E5E5'
                                        }
                                        stroke="#FFFFFF"
                                        style={{
                                            default: { outline: 'none' },
                                            hover: {
                                                fill: geo.properties.name === "Bermuda"
                                                    ? "#FFFFFF"
                                                    : countries.includes(geo.properties.name)
                                                        ? '#f59e0b'
                                                        : '#E5E5E5',
                                                cursor: countries.includes(geo.properties.name) ? 'pointer' : 'default'
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            const { pageX, pageY } = e;
                                            setTooltipContent(geo.properties.name);
                                            setTooltipPosition({ x: pageX, y: pageY });
                                        }}
                                        onMouseLeave={() => {
                                            setTooltipContent('');
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
                    </g>
                </ComposableMap>
            </div>
            {tooltipContent && (
                <div
                    style={{
                        position: "fixed",
                        top: tooltipPosition.y - 40,
                        left: tooltipPosition.x + 10,
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        fontSize: "14px",
                        pointerEvents: "none",
                        zIndex: 1000,
                        maxWidth: "200px",
                        wordBreak: "break-word",
                    }}
                >
                    {tooltipContent}
                </div>
            )}
        </div>
    )
}

const ChartsView: React.FC<ChartsViewProps> = ({ data, selectedCountry, onCountrySelect }) => {
    const calculatePercentages = (rawData: { name: string; value: number }[]) => {
        const total = rawData.reduce((sum, item) => sum + item.value, 0);
        return rawData.map(item => ({
            name: item.name,
            value: Number(((item.value / total) * 100).toFixed(1)),
            absoluteValue: item.value,
            percentage: `${Number(((item.value / total) * 100).toFixed(1))}%`
        }));
    };

    const genderData = calculatePercentages(
        Object.entries(
            data.reduce((acc: Record<string, number>, item) => {
                acc[item.gender] = (acc[item.gender] || 0) + 1
                return acc
            }, {})
        ).map(([name, value]) => ({ name, value }))
    );

    const educationData = calculatePercentages(
        Object.entries(
            data.reduce((acc: Record<string, number>, item) => {
                if (item.education !== null) {
                    acc[item.education] = (acc[item.education] || 0) + 1
                }
                return acc
            }, {})
        ).map(([name, value]) => ({ name, value }))
    );

    const jobAreaData = calculatePercentages(
        Object.entries(
            data.reduce((acc: Record<string, number>, item) => {
                if (item.jobArea !== null) {
                    acc[item.jobArea] = (acc[item.jobArea] || 0) + 1
                }
                return acc
            }, {})
        ).map(([name, value]) => ({ name, value }))
    );

    const experienceData = calculatePercentages(
        Object.entries(
            data.reduce((acc: Record<string, number>, item) => {
                const yearsExperience = Number(item.yearsExperience);
                if (!isNaN(yearsExperience) && yearsExperience !== null) {
                    if (yearsExperience >= 25) {
                        acc["25+"] = (acc["25+"] || 0) + 1;
                    } else {
                        const yearsRange = Math.floor(yearsExperience / 5) * 5;
                        const rangeKey = `${yearsRange}-${yearsRange + 5}`;
                        acc[rangeKey] = (acc[rangeKey] || 0) + 1;
                    }
                }
                return acc;
            }, {})
        ).map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
            if (a.name === "25+") return 1;
            if (b.name === "25+") return -1;
            const aStart = parseInt(a.name.split('-')[0]);
            const bStart = parseInt(b.name.split('-')[0]);
            return aStart - bStart;
        })
    );

    const courseData = calculatePercentages(
        Object.entries(
            data.reduce((acc: Record<string, number>, item) => {
                acc[item.course] = (acc[item.course] || 0) + 1
                return acc
            }, {})
        ).map(([name, value]) => ({ name, value }))
    );

    const renderCustomizedLabel = (props: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, value, name } = props;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-xs"
            >
                {`${value}%`}
            </text>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            <div className="bg-white rounded-xl shadow-md p-6">
                <ChoroplethMap data={data} selectedCountry={selectedCountry} onCountrySelect={onCountrySelect} />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Géneros</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={genderData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip
                            formatter={(value: any) => [`${value}%`, 'Porcentaje']}
                            labelStyle={{ color: '#666' }}
                        />
                        <Bar dataKey="value" fill={COLORS.gender}>
                            {genderData.map((entry, index) => (
                                <Cell key={`cell-${index}`}>
                                    <Label
                                        position="top"
                                        content={({ value }) => `${value}%`}
                                    />
                                </Cell>
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Nivel de Educación</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={educationData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {educationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS.education[index % COLORS.education.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value}%`, 'Porcentaje']} />
                        <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Distribución de puesto de trabajo</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={jobAreaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip
                            formatter={(value: any) => [`${value}%`, 'Porcentaje']}
                            labelStyle={{ color: '#666' }}
                        />
                        <Bar dataKey="value" fill={COLORS.jobArea}>
                            {jobAreaData.map((entry, index) => (
                                <Cell key={`cell-${index}`}>
                                    <Label
                                        position="top"
                                        content={({ value }) => `${value}%`}
                                    />
                                </Cell>
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Años de experiencia</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={experienceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {experienceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS.experience[index % COLORS.experience.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value}%`, 'Porcentaje']} />
                        <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Distribución de los cursos</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={courseData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {courseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS.courses[index % COLORS.courses.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value}%`, 'Porcentaje']} />
                        <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default ChartsView