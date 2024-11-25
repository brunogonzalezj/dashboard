import React, { useState } from 'react';
import Current from '../components/dashboard/Current.tsx';
import History from '../components/dashboard/History.tsx';





const Dashboard: React.FC = () => {
  const [dataType] = useState<string>('actual');
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {/*<div className="flex space-x-2">
            <button
              onClick={() => setDataType('actual')}
              className={`px-4 py-2 rounded-lg ${dataType === 'actual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Actual
            </button>
            <button
              onClick={() => setDataType('historico')}
              className={`px-4 py-2 rounded-lg ${dataType === 'historico' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Histórico
            </button>
          </div>*/}
        </div>
        {dataType === 'actual' ? <Current/> : <History/>}
      </>
    )
}

export default Dashboard;