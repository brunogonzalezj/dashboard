import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { ChartLineIcon, LayoutDashboardIcon, NotepadTextDashedIcon, ArrowLeft } from 'lucide-react';

const Current = React.lazy(() => import('../components/dashboard/Current.tsx'));
const Historic = React.lazy(() => import('../components/dashboard/Historic.tsx'));
const History = React.lazy(() => import('../components/dashboard/History.tsx'));

enum ViewType {
  Current = 'Actual',
  Historic = 'Histórico',
  Charts = 'Gráficos',
}

const VIEW_CONFIG = {
  [ViewType.Current]: {
    icon: NotepadTextDashedIcon,
    title: 'Cursos Activos',
    description: 'Cursos en proceso, estadísticas en tiempo real y gestión de participantes activos',
    accent: 'amber',
  },
  [ViewType.Historic]: {
    icon: ChartLineIcon,
    title: 'Histórico de Cursos',
    description: 'Análisis completo de cursos pasados con filtros avanzados y reportes detallados',
    accent: 'amber',
  },
  [ViewType.Charts]: {
    icon: LayoutDashboardIcon,
    title: 'Gráficos Sociolaborales',
    description: 'Visualizaciones interactivas de datos porcentuales de información personal y laboral',
    accent: 'amber',
  },
} as const;

const Dashboard: React.FC = () => {
  const [selectedView, setSelectedView] = useState<ViewType | null>(null);
  const { username } = useAuth();

  if (!selectedView) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="/soy_logo.webp"
              alt="Logo"
              className="w-14 h-14 mx-auto mb-4 rounded-full shadow-md"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
              Menú principal
            </h1>
            <p className="text-gray-500">
              Selecciona el módulo que deseas visualizar
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {Object.values(ViewType).map((view) => {
              const config = VIEW_CONFIG[view];
              const Icon = config.icon;
              return (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className="group dashboard-card text-left hover:border-amber-300 hover:shadow-lg transition-all duration-200 flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1.5">{config.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">
                    {config.description}
                  </p>
                  <div className="mt-4 text-sm font-medium text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Acceder →
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Bienvenido, <span className="font-medium text-gray-600">{username}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getTitle = () => VIEW_CONFIG[selectedView]?.title ?? 'Dashboard';

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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedView(null)}
          className="btn-ghost !px-3 !py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Menú</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
          {getTitle()}
        </h1>
      </div>

      {/* Content */}
      <div>{renderContent()}</div>
    </div>
  );
}

export default Dashboard;