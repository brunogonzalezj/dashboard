import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
const Current = React.lazy(() => import('../components/dashboard/Current.tsx'));
const History = React.lazy(() => import('../components/dashboard/History.tsx'));

const Dashboard: React.FC = () => {
  const [dataType, setDataType] = useState<string>('actual');
  const { username } = useAuth();

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {username === 'clagonjor' ? (
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {dataType === 'actual' ? "Cursos en proceso" : "Histórico de cursos"}
        </h1>) : (
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Cursos en proceso
        </h1>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setDataType('actual')}
            className={`px-6 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
              dataType === 'actual' 
                ? 'bg-amber-500 text-white shadow-md transform scale-105' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Actual
          </button>
          <button
            onClick={() => setDataType('historico')}
            className={`px-6 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
              dataType === 'historico' 
                ? 'bg-amber-500 text-white shadow-md transform scale-105' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Histórico
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {dataType === 'actual' ? <Current /> : <History />}
      </div>
    </div>
  );
}

export default Dashboard;