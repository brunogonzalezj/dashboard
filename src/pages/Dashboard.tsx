import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import {ChartLineIcon, LayoutDashboardIcon, NotepadTextDashedIcon } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-3 sm:p-4 lg:p-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl w-full">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8">
            <img 
              src="/soy_logo.webp" 
              alt="Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full shadow-md" 
            />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
              Menú principal
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-2">
              Selecciona el módulo que deseas visualizar
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {Object.values(ViewType).map((view) => {
              const getViewInfo = (viewType: ViewType) => {
                switch (viewType) {
                  case ViewType.Current:
                    return {
                      icon: <NotepadTextDashedIcon/>,
                      title: 'Cursos Activos',
                      description: 'Cursos en proceso, estadísticas en tiempo real y gestión de participantes activos',
                      shortDescription: 'Cursos en proceso y estadísticas actuales',
                      color: 'bg-[#48a259]',
                      hoverColor: 'hover:bg-[#008f39]'
                    };
                  case ViewType.Historic:
                    return {
                      icon: <ChartLineIcon/>,
                      title: 'Histórico de Cursos',
                      description: 'Análisis completo de cursos pasados con filtros avanzados y reportes detallados',
                      shortDescription: 'Análisis de cursos pasados y reportes',
                      color: 'bg-[#3A69AA]',
                      hoverColor: 'hover:bg-[#335a91]'
                    };
                  case ViewType.Charts:
                    return {
                      icon: <LayoutDashboardIcon/>,
                      title: 'Gráficos Sociolaborales',
                      description: 'Visualizaciones interactivas de datos porcentuales de información personal y laboral.',
                      shortDescription: 'Visualizaciones intereactivas de datos',
                      color: 'bg-[#F3B537]',
                      hoverColor: 'hover:bg-[#d9a12e]'
                    };
                  default:
                    return {
                      icon: '📊',
                      title: view,
                      description: 'Descripción no disponible',
                      shortDescription: 'Descripción no disponible',
                      color: 'from-gray-500 to-gray-600',
                      hoverColor: 'hover:from-gray-600 hover:to-gray-700'
                    };
                }
              };

              const viewInfo = getViewInfo(view);

              return (
                <div
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-102 sm:hover:scale-105 active:scale-95"
                >
                  <div className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 h-full hover:border-transparent hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 min-h-[200px] sm:min-h-[240px] lg:min-h-[280px] flex flex-col">
                    {/* Progress bar */}
                    <div className={`w-full h-1 sm:h-2 ${viewInfo.color} rounded-full mb-3 sm:mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    {/* Content */}
                    <div className="text-center flex-1 flex flex-col justify-between">
                      <div>
                        <div
                            className="flex justify-center items-center text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 lg:mb-4">
                          {viewInfo.icon}
                        </div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-3 leading-tight">
                        {viewInfo.title}
                        </h3>
                        {/* Descripción adaptativa */}
                        <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed px-1 sm:px-0">
                          <span className="sm:hidden">{viewInfo.shortDescription}</span>
                          <span className="hidden sm:inline">{viewInfo.description}</span>
                        </p>
                      </div>

                      {/* Button */}
                      <div className="mt-4 sm:mt-6">
                        <div className={`w-full py-2 sm:py-3 px-3 sm:px-4 ${viewInfo.color} ${viewInfo.hoverColor} text-white rounded-md sm:rounded-lg text-center font-medium text-sm sm:text-base opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-md`}>
                          Acceder
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
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
    <div className="h-full flex flex-col space-y-4 sm:space-y-6">
      {/* Header con navegación */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setSelectedView(null)}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm sm:text-base"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Volver al menú</span>
            <span className="sm:hidden">Menú</span>
          </button>
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
            {getTitle()}
          </h1>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;