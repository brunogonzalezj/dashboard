import React, { useState } from 'react';
import Current from '../components/dashboard/Current.tsx';
import History from '../components/dashboard/History.tsx';

const Dashboard: React.FC = () => {
  const [dataType] = useState<string>('actual');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {dataType === 'actual' ? <Current /> : <History />}
      </div>
    </div>
  );
};

export default Dashboard;