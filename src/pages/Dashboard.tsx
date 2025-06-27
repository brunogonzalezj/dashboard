import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
const Current = React.lazy(() => import('../components/dashboard/Current.tsx'));
const Historic = React.lazy(() => import('../components/dashboard/Historic.tsx'));
const History = React.lazy(() => import('../components/dashboard/History.tsx'));

enum ViewType {
  Current = 'Actual',
  Historic = 'Histórico',
  Charts = 'Gráficos',
}

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.Current);
  const { username } = useAuth();

  const getTitle = () => {
    switch (currentView) {
      case ViewType.Current:
        return 'Cursos en proceso';
      case ViewType.Historic:
        return 'Datos históricos de cursos';
      case ViewType.Charts:
        return 'Gráficos y análisis histórico';
      default:
        return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewType.Current:
        return <Current />;
      case ViewType.Historic:
        return <Historic />;
      case ViewType.Charts:
        return <History />;
      default:
        return <Current />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {getTitle()}
        </h1>
        
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
          {Object.values(ViewType).map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === view 
                  ? 'bg-amber-500 text-white shadow-md transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;