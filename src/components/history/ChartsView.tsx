"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import type { DataItem } from "../../interfaces/IData"
import { MinusIcon, PlusIcon } from "lucide-react"

interface ChartsViewProps {
    data: DataItem[]
    selectedCountry: string
    onCountrySelect: (country: string) => void
}

interface Position {
    coordinates: [number, number]
    zoom: number
}
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const ChoroplethMap: React.FC<ChartsViewProps> = ({ data, selectedCountry, onCountrySelect }) => {
    const countries = Array.from(new Set(data.map((d) => d.country)))
    const [countriesData, setCountriesData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [position, setPosition] = useState<Position>({ coordinates: [0, 0], zoom: 1 })
    const [tooltipContent, setTooltipContent] = useState("")
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200)

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const handleZoomIn = () => {
        if (position.zoom >= 4) return
        setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }))
    }

    const handleZoomOut = () => {
        if (position.zoom <= 1) return
        setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }))
    }

    const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
        setPosition(position)
    }

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

    const isMobile = windowWidth < 768

    return (
        <div className="h-full flex flex-col">
            {error && <p className="text-red-500 text-xs">{error}</p>}
            {!countriesData && !error && <p className="text-xs">Cargando mapa...</p>}
            <div className={`flex ${isMobile ? "flex-col space-y-2" : "flex-row items-center"} justify-between mb-1`}>
                <select
                    value={selectedCountry}
                    onChange={(e) => onCountrySelect(e.target.value)}
                    className={`text-xs p-1 border rounded ${isMobile ? "w-full" : "w-auto"}`}
                >
                    <option value="all">All Countries</option>
                    {countries.map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>
                <div className="hidden lg:flex ">
                    <button onClick={handleZoomIn} className="border rounded p-1 mr-1 hover:bg-gray-100">
                        <PlusIcon className="h-3 w-3" />
                    </button>
                    <button onClick={handleZoomOut} className="border rounded p-1 hover:bg-gray-100">
                        <MinusIcon className="h-3 w-3" />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative">
                <ComposableMap className="rounded h-full w-full absolute inset-0">
                    <ZoomableGroup zoom={position.zoom} center={position.coordinates} onMoveEnd={handleMoveEnd}>
                        <Geographies geography={countriesData}>
                            {({ geographies }) =>
                                geographies.map((geo: { rsmKey: any; properties: { name: string } }) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={
                                            selectedCountry === geo.properties.name
                                                ? "#f59e0b"
                                                : countries.includes(geo.properties.name)
                                                    ? "#9b9b9b"
                                                    : "#E5E5E5"
                                        }
                                        stroke="#FFFFFF"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none" },
                                            hover: {
                                                fill: countries.includes(geo.properties.name) ? "#f59e0b" : "#E5E5E5",
                                                cursor: countries.includes(geo.properties.name) ? "pointer" : "default",
                                            },
                                        }}
                                        onMouseEnter={(e) => {
                                            const { pageX, pageY } = e
                                            setTooltipContent(geo.properties.name)
                                            setTooltipPosition({ x: pageX, y: pageY })
                                        }}
                                        onMouseLeave={() => {
                                            setTooltipContent("")
                                        }}
                                        onClick={() => {
                                            if (countries.includes(geo.properties.name)) {
                                                onCountrySelect(geo.properties.name)
                                            }
                                        }}
                                    />
                                ))
                            }
                        </Geographies>
                    </ZoomableGroup>
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
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200)

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

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

    // Determinar el layout basado en el ancho de la ventana
    const getGridLayout = () => {
        if (windowWidth < 640) {
            // Móvil: una columna
            return "h-[calc(100vh-180px)] max-h-[768px] grid grid-cols-1 gap-2 p-1 overflow-auto"
        } else if (windowWidth < 1024) {
            // Tablet: dos columnas
            return "h-[calc(100vh-180px)] max-h-[768px] grid grid-cols-2 gap-2 p-1 overflow-auto"
        } else {
            // Desktop: mantener el layout original de 6 columnas
            return "h-[calc(100vh-180px)] max-h-[768px] grid grid-cols-6 gap-2 p-1 overflow-auto"
        }
    }

    // Determinar las clases de columnas para cada elemento
    const getMapClasses = () => {
        if (windowWidth < 640) {
            return "col-span-1 row-span-1"
        } else if (windowWidth < 1024) {
            return "col-span-2 row-span-1"
        } else {
            return "col-span-2 row-span-2"
        }
    }

    const getChartClasses = () => {
        if (windowWidth < 640) {
            return "col-span-1"
        } else if (windowWidth < 1024) {
            return "col-span-1"
        } else {
            return "col-span-2"
        }
    }

    // Ajustar el tamaño del radio del gráfico circular según el tamaño de la pantalla
    const getPieRadius = () => {
        if (windowWidth < 640) {
            return 30
        } else if (windowWidth < 1024) {
            return 35
        } else {
            return 40
        }
    }

    return (
        <div className={getGridLayout()}>
            <div className={`${getMapClasses()} rounded-lg shadow-sm p-1 bg-white flex flex-col`}>
                <ChoroplethMap data={data} selectedCountry={selectedCountry} onCountrySelect={onCountrySelect} />
            </div>

            <div className={`${getChartClasses()} rounded-lg shadow-sm p-1 bg-white flex flex-col`}>
                <h3 className="text-xs font-bold">Gender Distribution</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={genderData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={`${getChartClasses()} rounded-lg shadow-sm p-1 bg-white flex flex-col`}>
                <h3 className="text-xs font-bold">Education Level</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Pie
                                data={educationData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={getPieRadius()}
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
            </div>

            <div className={`${getChartClasses()} rounded-lg shadow-sm p-1 bg-white flex flex-col`}>
                <h3 className="text-xs font-bold">Job Area Distribution</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={jobAreaData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={`${getChartClasses()} rounded-lg shadow-sm p-1 bg-white flex flex-col`}>
                <h3 className="text-xs font-bold">Years of Experience</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Pie
                                data={experienceData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={getPieRadius()}
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
            </div>

            <div className={`${getChartClasses()} rounded-lg shadow-sm p-1 bg-white flex flex-col`}>
                <h3 className="text-xs font-bold">Course Distribution</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Pie
                                data={courseData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={getPieRadius()}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {courseData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default ChartsView
