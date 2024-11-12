import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataItem {
    id: number;
    gender: string;
    name: string;
    lastName: string;
    email: string;
    association: string;
    businessGroup: string;
    business: string;
    course: string;
    country: string;
    progressPercentage: string;
    state: string;
    finalScore: string;
    login: string;
    evaluationsAverage: string;
    progress: string;
    previousPoll: boolean;
    seenMaterial: string;
    completedEvaluations: string;
    reunionVisualized: boolean;
    postPoll: boolean;
    evaluationRange: string;
    material: string;
    evaluations: string;
    year: string;
}

const buildBadge = (isCompleted: boolean) => {
    if (!isCompleted) {
        return <div className="badge badge-error text-white text-nowrap">No completado</div>
    }
    return <div className="badge badge-success text-white">Completado</div>
}

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DataItem[] >([]);
    const [filteredData, setFilteredData] = useState<DataItem[]>([]);
    const [displayedData, setDisplayedData] = useState<DataItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    const { isAuthenticated } = useAuth();
    const [dataType, setDataType] = useState<'actual' | 'historico'>('historico');

    // Estados para los filtros
    const [loginFilter, setLoginFilter] = useState<string>('all');
    const [courseFilter, setCourseFilter] = useState<string>('all');
    const [groupFilter, setGroupFilter] = useState<string>('all');
    const [yearFilter, setYearFilter] = useState<string>('all');

    const handleDataTypeChange = (type: 'actual' | 'historico') => {
        setDataType(type);
        fetchData();
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, dataType]);

    useEffect(() => {
        filterData();
    }, [data, loginFilter, courseFilter, groupFilter, yearFilter]);

    useEffect(() => {
        setDisplayedData(filteredData.slice(0, currentPage * itemsPerPage));
    }, [filteredData, currentPage]);

    const fetchData = async () => {
        try {
            const url = dataType === 'actual'
              ? 'http://localhost:3001/data/dashboard-data'
              : 'http://localhost:3001/data/history-dashboard-data';
            const response = await axios.get(url, { withCredentials: true });
            setData(response.data);
        } catch (error) {
            setData([])
            console.error('Error fetching dashboard data:', error);
        }
    };

    const filterData = () => {
        let result = data;

        if (loginFilter !== 'all') {
            result = result.filter(item => item.login === loginFilter);
        }
        if (courseFilter !== 'all') {
            result = result.filter(item => item.course === courseFilter);
        }
        if (groupFilter !== 'all') {
            result = result.filter(item => item.businessGroup === groupFilter);
        }
        if (yearFilter !== 'all') {
            result = result.filter(item => item.year === yearFilter);
        }

        setFilteredData(result);
        setCurrentPage(1);
    };

    const loadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const getAverageProgress = () => {
        if (filteredData.length === 0) return 0;
        const totalProgress = filteredData.reduce((sum, item) => sum + parseFloat(item.progressPercentage), 0);
        return (totalProgress / filteredData.length).toFixed(2);
    };

    const getCompletionRate = () => {
        if (filteredData.length === 0) return 0;
        const completedCourses = filteredData.filter(item => item.state === 'Completado').length;
        return ((completedCourses / filteredData.length) * 100).toFixed(2);
    };

    const getAverageScore = () => {
        if (filteredData.length === 0) return 0;
        const totalScore = filteredData.reduce((sum, item) => sum + parseFloat(item.evaluationsAverage), 0);
        return (totalScore / filteredData.length).toFixed(2);
    };

    const getProgressData = () => {
        const progressCounts = filteredData.reduce((acc, item) => {
            const progress = Math.floor(parseFloat(item.progressPercentage) / 10) * 10;
            acc[progress] = (acc[progress] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        return Object.entries(progressCounts).map(([progress, count]) => ({
            progress: `${progress}-${parseInt(progress) + 10}%`,
            count,
        }));
    };

    const getUniqueValues = (key: keyof DataItem) => {
        return Array.from(new Set(data.map(item => item[key])));
    };

    return (
      <div className="p-6 bg-gray-100 rounded-lg shadow-2xl overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <div className="flex space-x-2">
                  <button
                    onClick={() => handleDataTypeChange('actual')}
                    className={`px-4 py-2 rounded ${dataType === 'actual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                      Actual
                  </button>
                  <button
                    onClick={() => handleDataTypeChange('historico')}
                    className={`px-4 py-2 rounded ${dataType === 'historico' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                      Histórico
                  </button>
              </div>
          </div>
          <div className={"flex flex-row mb-8"}>
              <div className={"flex flex-col w-1/4 gap-y-4"}>
                  <div className="bg-[#3a69aa]/80 p-4 rounded-lg text-white">
                      <h2 className="text-lg font-semibold mb-2">Average Progress</h2>
                      <p className="text-3xl font-bold">{getAverageProgress()}%</p>
                  </div>
                  <div className="bg-[#3a69aa]/80 p-4 rounded-lg text-white">
                      <h2 className="text-lg font-semibold mb-2">Completion Rate</h2>
                      <p className="text-3xl font-bold">{getCompletionRate()}%</p>
                  </div>
                  <div className="bg-[#3a69aa]/80 p-4 rounded-lg text-white">
                      <h2 className="text-lg font-semibold mb-2">Average Score</h2>
                      <p className="text-3xl font-bold">{getAverageScore()}%</p>
                  </div>
              </div>

              <div className="flex items-center justify-center flex-col w-full">
                  <h2 className="text-xl font-semibold mb-4">Progress Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getProgressData()}>
                          <CartesianGrid strokeDasharray="3 3"/>
                          <XAxis dataKey="progress"/>
                          <YAxis/>
                          <Tooltip/>
                          <Legend/>
                          <Bar dataKey="count" fill="#3a69aa"/>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          <h1 className="text-xl font-bold mb-4">User Data</h1>
          <h2 className={"text-xl font-semibold"}>Filtros</h2>
          <div className="grid grid-cols-12 md:grid-cols-2 gap-4 mb-6">
              <div>
                  <label htmlFor="login-filter" className="block text-sm font-medium text-gray-700">Logged In</label>
                  <select
                    id="login-filter"
                    value={loginFilter}
                    onChange={(e) => setLoginFilter(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                      <option value="all">All</option>
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                  </select>
              </div>
              <div>
                  <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700">Course</label>
                  <select
                    id="course-filter"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                      <option value="all">All</option>
                      {getUniqueValues('course').map((course) => (
                        <option key={`${course}`} value={`${course}`}>
                            {course}
                        </option>
                      ))}
                  </select>
              </div>
              <div>
                  <label htmlFor="group-filter" className="block text-sm font-medium text-gray-700">Group</label>
                  <select
                    id="group-filter"
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                      <option value="all">All</option>
                      {getUniqueValues('businessGroup').map(group => (
                        <option key={`${group}`} value={`${group}`}>{group}</option>
                      ))}
                  </select>
              </div>
              <div>
                  <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700">Year</label>
                  <select
                    id="year-filter"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                      <option value="all">All</option>
                      {getUniqueValues('year').map(year => (
                        <option key={`${year}`} value={`${year}`}>{year}</option>
                      ))}
                  </select>
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="min-w-full bg-white overflow-y-auto">
                  <thead>
                  <tr>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Email</th>
                      <th className="py-2 px-4 border-b">Course</th>
                      <th className="py-2 px-4 border-b">Progress</th>
                      <th className="py-2 px-4 border-b">State</th>
                      <th className="py-2 px-4 border-b">Final Score</th>
                  </tr>
                  </thead>
                  <tbody>
                  {displayedData.map((item) => (
                    <tr key={item.id} className={"text-center"}>
                        <td className="py-2 px-4 border-b text-left">{`${item.name} ${item.lastName}`}</td>
                        <td className="py-2 px-4 border-b text-left">{item.email}</td>
                        <td className="py-2 px-4 border-b">{item.course}</td>
                        <td className="py-2 px-4 border-b">{item.progressPercentage}</td>
                        <td className="py-2 px-4 border-b">{buildBadge(item.state === "Completado")}</td>
                        <td className="py-2 px-4 border-b">{item.finalScore}</td>
                    </tr>
                  ))}
                  </tbody>
              </table>
          </div>
          {displayedData.length < filteredData.length && (
            <div className="mt-4 flex justify-center">
                <button
                  onClick={loadMore}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                    Cargar más
                </button>
            </div>
          )}
      </div>
    );
};

export default Dashboard;