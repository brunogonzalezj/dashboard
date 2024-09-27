import Layout from '../components/Layout'

export default function Dashboard() {
    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Regional Footprint</h2>
                    <p>Regional data visualization goes here</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Historical Summary</h2>
                    <p>Historical data summary goes here</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Associations & Companies</h2>
                    <p>List of associations and companies goes here</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Current Courses Report</h2>
                    <p>Current courses report data goes here</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Current Courses Performance</h2>
                    <p>Current courses performance data goes here</p>
                </div>
            </div>
        </Layout>
    )
}