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
  Label,
  Sector 
} from 'recharts';
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import type { DataItem } from "../../interfaces/IData"

interface ChartsViewProps {
    data: DataItem[]
    selectedCountry: string
    onCountrySelect: (country: string) => void
}

enum FilterLabels {
  login = 'Sesion Iniciada',
  course = 'Curso',
  country = 'País',
  business = 'Empresa',
  progressPercentage = '% de Progreso',
  association = 'Asociación',
  businessGroup = 'Grupo Empresarial',
  stateOfCompleteness = 'Estado de progreso',
  year = 'Año',
}

const COLORS = {
    education: ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
    jobArea: "#EEAC48",
    experience: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"],
    courses: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"],
    age: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
}

const courseColors = {
    "Alimento Balanceado": "#DDA338",
    Avicultura: "#FFCE00",
    Acuacultura: "#85D5FC",
    Porcicultura: "#9E2A2B",
    "Ganado Lechero": "#6E6059",
}

const genderColors = {
    Hombre:  "#1F7BC2",
    Mujer: "#C97FBB"
}

const educationColors = {
  "Sin Formacion": "#8A6B60",
  "Primaria Completa": "#D7CCC8",
  "Secundaria Completa": "#A1887F",
  "Tecnico o Tecnologo": "#AED581",
  "Universitario": "#81D4D5",
  "Posgrado": "#81ABD5"
}

const experienceColors = {
  "0-5": "#A8DADC",
  "5-10": "#457B9D",
  "10-15": "#1D3557",
  "15-20": "#B78AC2",
  "20+": "#F4A261"
}

const ageColors = {
  "-20": "#FF6B6B",
  "20-30": "#4ECDC4",
  "30-40": "#45B7D1",
  "40-50": "#96CEB4",
  "+50": "#FFEAA7"
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
                    <g transform={`translate(20, -250) scale(2.2)`}>
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
    const [activeEducationIndex, setActiveEducationIndex] = useState<number | undefined>();
    const [filteredData, setFilteredData] = useState<DataItem[]>(data);

    const [filters, setFilters] = useState({
        login: 'all',
        course: 'all',
        country: 'all',
        business: 'all',
        progressPercentage: 'all',
        association: 'all',
        businessGroup: 'all',
        stateOfCompleteness: 'all',
        year: 'all',
    });

    // Aplicar filtros
    useEffect(() => {
        const result = data.filter((item) =>
            Object.entries(filters).every(([key, value]) => {
                if (value === 'all') return true;
                if (key === 'progressPercentage') {
                    const [min, max] = value.split('-').map(Number);
                    const progressValue = parseFloat(item.progressPercentage);
                    return progressValue >= min && progressValue < max;
                }
                return item[key as keyof DataItem] === value;
            })
        );
        setFilteredData(result);
    }, [data, filters]);

    const getProgressRangeOptions = () => {
        const ranges = [];
        for (let i = 0; i < 100; i += 10) {
            ranges.push(`${i}-${i + 10}`);
        }
        return ranges;
    };

    const getUniqueValues = (key: keyof DataItem) => {
        if (key === 'progressPercentage') return getProgressRangeOptions();
        return Array.from(new Set(data.map((item) => item[key]))).sort();
    };

    const calculatePercentages = (rawData: { name: string; value: number }[]) => {
        const total = rawData.reduce((sum, item) => sum + item.value, 0);
        return rawData.map(item => ({
            name: item.name,
            value: Number(((item.value / total) * 100).toFixed(1)),
            absoluteValue: item.value,
            percentage: `${Number(((item.value / total) * 100).toFixed(1))}%`
        }));
    };

  const genderOrder = ["Hombre", "Mujer"];
  const genderData = calculatePercentages(
    Object.entries(
      filteredData.reduce((acc: Record<string, number>, item) => {
        if (item.gender !== null && item.gender !== "Prefiero no decirlo") {
          acc[item.gender] = (acc[item.gender] || 0) + 1;
        }
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }))
  ).sort((a, b) => genderOrder.indexOf(a.name) - genderOrder.indexOf(b.name));

    const educationData = calculatePercentages(
        Object.entries(
            filteredData.reduce((acc: Record<string, number>, item) => {
                if (item.education !== null) {
                    acc[item.education] = (acc[item.education] || 0) + 1
                }
                return acc
            }, {})
        ).map(([name, value]) => ({ name, value }))
    );

    const jobAreaData = calculatePercentages(
        Object.entries(
            filteredData.reduce((acc: Record<string, number>, item) => {
                if (item.jobArea !== null) {
                    acc[item.jobArea] = (acc[item.jobArea] || 0) + 1
                }
                return acc
            }, {})
        ).map(([name, value]) => ({ name, value }))
    );

    const experienceData = calculatePercentages(
        Object.entries(
            filteredData.reduce((acc: Record<string, number>, item) => {
                const yearsExperience = Number(item.yearsExperience);
                if (!isNaN(yearsExperience) && yearsExperience !== null) {
                    if (yearsExperience >= 20) {
                        acc["20+"] = (acc["20+"] || 0) + 1;
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
            if (a.name === "20+") return 1;
            if (b.name === "20+") return -1;
            const aStart = parseInt(a.name.split('-')[0]);
            const bStart = parseInt(b.name.split('-')[0]);
            return aStart - bStart;
        })
    );

    const courseData = calculatePercentages(
        Object.entries(
            filteredData.reduce((acc: Record<string, number>, item) => {
                acc[item.course] = (acc[item.course] || 0) + 1
                return acc
            }, {})
        ).map(([name, value]) => ({ name, value }))
    );

    // Nuevo gráfico de edad
    const ageData = calculatePercentages(
        Object.entries(
            filteredData.reduce((acc: Record<string, number>, item) => {
                const birthYear = Number(item.birthday);
                const courseYear = Number(item.year);
                
                if (!isNaN(birthYear) && !isNaN(courseYear) && birthYear > 0 && courseYear > 0) {
                    const age = courseYear - birthYear;
                    
                    if (age < 20) {
                        acc["-20"] = (acc["-20"] || 0) + 1;
                    } else if (age >= 20 && age < 30) {
                        acc["20-30"] = (acc["20-30"] || 0) + 1;
                    } else if (age >= 30 && age < 40) {
                        acc["30-40"] = (acc["30-40"] || 0) + 1;
                    } else if (age >= 40 && age < 50) {
                        acc["40-50"] = (acc["40-50"] || 0) + 1;
                    } else if (age >= 50) {
                        acc["+50"] = (acc["+50"] || 0) + 1;
                    }
                }
                return acc;
            }, {})
        ).map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
            const order = ["-20", "20-30", "30-40", "40-50", "+50"];
            return order.indexOf(a.name) - order.indexOf(b.name);
        })
    );

    const renderCustomizedLabel = (props: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;
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

    const renderActiveShape = (props: any) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 30) * cos;
        const my = cy + (outerRadius + 30) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                />
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
                <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">
                    {`${payload.name}`}
                </text>
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
                    {`${value.toFixed(1)}% (${payload.absoluteValue})`}
                </text>
            </g>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(filters).map(([key, value]) => (
                        <div key={key}>
                            <label
                                htmlFor={`${key}-filter`}
                                className="block text-sm font-medium text-gray-700"
                            >
                                {FilterLabels[key as keyof typeof FilterLabels]
                                    .charAt(0)
                                    .toUpperCase() +
                                    FilterLabels[key as keyof typeof FilterLabels].slice(1)}
                            </label>
                            <select
                                id={`${key}-filter`}
                                value={value}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
                            >
                                <option value="all">Todos</option>
                                {getUniqueValues(key as keyof DataItem).map((option) => (
                                    <option key={option?.toString()} value={option?.toString()}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* Layout según el diseño: Mapa a la izquierda, gráficos en grid a la derecha */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mapa - Ocupa toda la altura en la izquierda */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md p-6 h-full">
                        <h3 className="text-lg font-semibold mb-4">Mapa de Países</h3>
                        <ChoroplethMap data={filteredData} selectedCountry={selectedCountry} onCountrySelect={onCountrySelect} />
                    </div>
                </div>

                {/* Gráficos - Grid 2x3 en la derecha */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        {/* Fila superior */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Géneros</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={genderData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip
                                        formatter={(value: any) => [`${value}%`, 'Porcentaje']}
                                        labelStyle={{ color: '#666' }}
                                    />
                                    <Bar dataKey="value">
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={genderColors[entry.name as keyof typeof genderColors] || "#8884d8"}>
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
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        activeIndex={activeEducationIndex}
                                        activeShape={renderActiveShape}
                                        data={educationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        onMouseEnter={(_, index) => setActiveEducationIndex(index)}
                                        onMouseLeave={() => setActiveEducationIndex(undefined)}
                                    >
                                        {educationData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`}
                                                fill={educationColors[entry.name as keyof typeof educationColors] || "#8884d8"}
                                                className="transition-all duration-200"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: any, name: any, props: any) => [
                                            `${value}% (${props.payload.absoluteValue})`,
                                            name
                                        ]}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                        }}
                                    />
                                  <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Edad</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={ageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip
                                        formatter={(value: any) => [`${value}%`, 'Porcentaje']}
                                        labelStyle={{ color: '#666' }}
                                    />
                                    <Bar dataKey="value">
                                        {ageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={ageColors[entry.name as keyof typeof ageColors] || "#8884d8"}>
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

                        {/* Fila inferior */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Distribución de puesto de trabajo</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={jobAreaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip
                                        formatter={(value: any) => [`${value}%`, 'Porcentaje']}
                                        labelStyle={{ color: '#666' }}
                                    />
                                    <Bar dataKey="value" fill={COLORS.jobArea}>
                                        {jobAreaData.map((_entry, index) => (
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
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={experienceData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {experienceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={experienceColors[entry.name as keyof typeof experienceColors] || "#8884d8"} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => [`${value}%`, 'Porcentaje']} />
                                    <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Distribución de los cursos</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={courseData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {courseData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={courseColors[entry.name as keyof typeof courseColors] || "#8884d8"}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => [`${value}%`, 'Porcentaje']} />
                                    <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChartsView