import React, { useState } from 'react';
const Current = React.lazy(() => import('../components/dashboard/Current.tsx'));
const History = React.lazy(() => import('../components/dashboard/History.tsx'));




const Dashboard: React.FC = () => {
  const [dataType, setDataType] = useState<string>('actual');
    return (
      <>
        <div className="h-full flex justify-between items-center overflow-hidden">
          <h1 className="text-2xl font-bold mb-2">{dataType === 'actual' ? "Cursos en proceso" : "Histórico de cursos"}</h1>
          <div className="flex space-x-2 mb-2">
            <button
              onClick={() => setDataType('actual')}
              className={`px-4 py-2 rounded-lg ${dataType === 'actual' ? 'bg-amber-500 text-white' : 'bg-gray-300'}`}
            >
              Actual
            </button>
            <button
              onClick={() => setDataType('historico')}
              className={`px-4 py-2 rounded-lg ${dataType === 'historico' ? 'bg-amber-500 text-white' : 'bg-gray-300'}`}
            >
              Histórico
            </button>
          </div>
        </div>
        {dataType === 'actual' ? <Current/> : <History/>}
      </>
    )
}

export default Dashboard;