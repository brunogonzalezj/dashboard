import React from 'react';
import { useEffect, useState } from "react"
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, Legend } from 'recharts';
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
            absoluteValue: item.value
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

    const chartConfig = {
        margin: { top: 5, right: 30, left: 20, bottom: 5 },
        labelStyle: { fontSize: 12 },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <ChoroplethMap data={data} selectedCountry={selectedCountry} onCountrySelect={onCountrySelect} />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-base font-semibold mb-4">Géneros</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={genderData} margin={chartConfig.margin}>
                        <XAxis dataKey="name" tick={{ fontSize: chartConfig.labelStyle.fontSize }} />
                        <YAxis 
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, 100]}
                            tick={{ fontSize: chartConfig.labelStyle.fontSize }}
                        />
                        <Tooltip
                            formatter={(value: number, name: string, props: any) => [
                                `${value}% (${props.payload.absoluteValue})`,
                                'Usuarios'
                            ]}
                        />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-base font-semibold mb-4">Nivel de Educación</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={educationData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => `${entry.value}%`}
                        >
                            {educationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number, name: string, props: any) => [
                                `${value}% (${props.payload.absoluteValue})`,
                                name
                            ]}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => <span className="text-xs">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-base font-semibold mb-4">Distribución de puesto de trabajo</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={jobAreaData} margin={chartConfig.margin}>
                        <XAxis dataKey="name" tick={{ fontSize: chartConfig.labelStyle.fontSize }} />
                        <YAxis 
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, 100]}
                            tick={{ fontSize: chartConfig.labelStyle.fontSize }}
                        />
                        <Tooltip
                            formatter={(value: number, name: string, props: any) => [
                                `${value}% (${props.payload.absoluteValue})`,
                                'Usuarios'
                            ]}
                        />
                        <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-base font-semibold mb-4">Años de experiencia</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={experienceData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => `${entry.value}%`}
                        >
                            {experienceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number, name: string, props: any) => [
                                `${value}% (${props.payload.absoluteValue})`,
                                name
                            ]}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => <span className="text-xs">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-base font-semibold mb-4">Distribución de los cursos</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={courseData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => `${entry.value}%`}
                        >
                            {courseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number, name: string, props: any) => [
                                `${value}% (${props.payload.absoluteValue})`,
                                name
                            ]}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => <span className="text-xs">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default ChartsView