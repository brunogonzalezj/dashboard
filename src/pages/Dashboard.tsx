import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

type DashboardData = {
    [key: string]: string
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData[]>([])

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('http://localhost:3001/dashboard-data', {
                credentials: 'include',
            })
            if (response.ok) {
                const data = await response.json()
                setData(data)
            } else {
                throw new Error('Failed to fetch dashboard data')
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        }
    }

    return (
        <Layout>
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8">
                <h1 className="text-3xl font-bold mb-6 text-white">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white bg-opacity-20 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-white">Regional Footprint</h2>
                        {/* Add visualization for regional data */}
                    </div>
                    <div className="bg-white bg-opacity-20 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-white">Historical Summary</h2>
                        {/* Add visualization for historical data */}
                    </div>
                    <div className="bg-white bg-opacity-20 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-white">Associations & Companies</h2>
                        {/* Add list or visualization for associations and companies */}
                    </div>
                    <div className="bg-white bg-opacity-20 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-white">Current Courses Report</h2>
                        {/* Add report for current courses */}
                    </div>
                    <div className="bg-white bg-opacity-20 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-white">Current Courses Performance</h2>
                        {/* Add performance data for current courses */}
                    </div>
                    <div className="bg-white bg-opacity-20 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-white">Data Table</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-white">
                                <thead>
                                <tr>
                                    {Object.keys(data[0] || {}).map((key) => (
                                        <th key={key} className="p-2 text-left">{key}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {data.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((value, i) => (
                                            <td key={i} className="p-2">{value}</td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}