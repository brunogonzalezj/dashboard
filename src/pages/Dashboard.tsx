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
  const [selectedView, setSelectedView] = useState<ViewType | null>(null);
  const { username } = useAuth();

  // Si no hay vista seleccionada, mostrar el selector principal
  if (!selectedView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <img src="/soy_logo.webp" alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-full" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Dashboard de Cursos
            </h1>
            <p className="text-gray-600">
              Selecciona el tipo de datos que deseas visualizar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(ViewType).map((view) => {
              const getViewInfo = (viewType: ViewType) => {
                switch (viewType) {
                  case ViewType.Current:
                    return {
                      icon: '📊',
                      title: 'Datos Actuales',
                      description: 'Cursos en proceso, estadísticas en tiempo real y gestión de participantes activos',
                      color: 'from-blue-500 to-blue-600'
                    };
                  case ViewType.Historic:
                    return {
                      icon: '📈',
                      title: 'Datos Históricos',
                      description: 'Análisis completo de cursos pasados con filtros avanzados y reportes detallados',
                      color: 'from-green-500 to-green-600'
                    };
                  case ViewType.Charts:
                    return {
                      icon: '📋',
                      title: 'Gráficos y Análisis',
                      description: 'Visualizaciones interactivas, mapas geográficos y análisis demográfico',
                      color: 'from-amber-500 to-amber-600'
                    };
                  default:
                    return {
                      icon: '📊',
                      title: view,
                      description: 'Descripción no disponible',
                      color: 'from-gray-500 to-gray-600'
                    };
                }
              };

              const viewInfo = getViewInfo(view);

              return (
                <div
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 h-full hover:border-transparent hover:shadow-xl transition-all duration-300">
                    <div className={`w-full h-2 bg-gradient-to-r ${viewInfo.color} rounded-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    <div className="text-center">
                      <div className="text-4xl mb-4">{viewInfo.icon}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        {viewInfo.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {viewInfo.description}
                      </p>
                    </div>

                    <div className="mt-6">
                      <div className={`w-full py-3 px-4 bg-gradient-to-r ${viewInfo.color} text-white rounded-lg text-center font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0`}>
                        Acceder
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Bienvenido, <span className="font-semibold text-gray-700">{username}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Una vez seleccionada la vista, mostrar el contenido con opción de volver
  const getTitle = () => {
    switch (selectedView) {
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
    switch (selectedView) {
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedView(null)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al menú
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {getTitle()}
          </h1>
        </div>
        
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
          {Object.values(ViewType).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedView === view 
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