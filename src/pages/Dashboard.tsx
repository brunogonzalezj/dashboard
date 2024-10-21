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
}

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DataItem[]>([]);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:3001/data/dashboard-data', { withCredentials: true });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const getAverageProgress = () => {
        if (data.length === 0) return 0;
        const totalProgress = data.reduce((sum, item) => sum + parseFloat(item.progressPercentage), 0);
        return (totalProgress / data.length).toFixed(2);
    };

    const getCompletionRate = () => {
        if (data.length === 0) return 0;
        const completedCourses = data.filter(item => item.state === 'Completado').length;
        return ((completedCourses / data.length) * 100).toFixed(2);
    };

    const getAverageScore = () => {
        if (data.length === 0) return 0;
        const totalScore = data.reduce((sum, item) => sum + parseFloat(item.finalScore), 0);
        return (totalScore / data.length).toFixed(2);
    };

    const getProgressData = () => {
        const progressCounts = data.reduce((acc, item) => {
            const progress = Math.floor(parseFloat(item.progressPercentage) / 10) * 10;
            acc[progress] = (acc[progress] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        return Object.entries(progressCounts).map(([progress, count]) => ({
            progress: `${progress}-${parseInt(progress) + 10}%`,
            count,
        }));
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Average Progress</h2>
                    <p className="text-3xl font-bold">{getAverageProgress()}%</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Completion Rate</h2>
                    <p className="text-3xl font-bold">{getCompletionRate()}%</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Average Score</h2>
                    <p className="text-3xl font-bold">{getAverageScore()}</p>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Progress Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getProgressData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="progress" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <h2 className="text-xl font-semibold mb-4">User Data</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
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
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td className="py-2 px-4 border-b">{`${item.name} ${item.lastName}`}</td>
                            <td className="py-2 px-4 border-b">{item.email}</td>
                            <td className="py-2 px-4 border-b">{item.course}</td>
                            <td className="py-2 px-4 border-b">{item.progressPercentage}%</td>
                            <td className="py-2 px-4 border-b">{item.state}</td>
                            <td className="py-2 px-4 border-b">{item.finalScore}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;