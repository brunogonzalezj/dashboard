import React, { Suspense } from 'react';
import { useSearchParams } from 'react-router';
import { BarChart3, ClipboardList, History as HistoryIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';

const Current = React.lazy(() => import('../components/dashboard/Current.tsx'));
const Historic = React.lazy(() => import('../components/dashboard/Historic.tsx'));
const History = React.lazy(() => import('../components/dashboard/History.tsx'));

const VIEWS = [
  {
    id: 'actual',
    label: 'Cursos activos',
    icon: ClipboardList,
    description: 'Participantes de los cursos en curso: inicio de sesión, avance y finalización.',
    Component: Current,
  },
  {
    id: 'historico',
    label: 'Histórico',
    icon: HistoryIcon,
    description: 'Participantes de cursos anteriores, con nota final y filtros por empresa y país.',
    Component: Historic,
  },
  {
    id: 'graficos',
    label: 'Gráficos sociolaborales',
    icon: BarChart3,
    description: 'Perfil de los participantes: género, edad, educación, puesto y experiencia.',
    Component: History,
  },
] as const;

type ViewId = (typeof VIEWS)[number]['id'];

const ViewFallback = () => (
  <div className="space-y-5" role="status" aria-label="Cargando vista">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Skeleton className="h-[120px] rounded-xl" />
      <Skeleton className="h-[120px] rounded-xl" />
    </div>
    <Skeleton className="h-[320px] rounded-xl" />
  </div>
);

const Dashboard: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const requested = params.get('vista') as ViewId | null;
  const view = VIEWS.find((v) => v.id === requested) ?? VIEWS[0];
  const { Component } = view;

  const select = (id: ViewId) => {
    const next = new URLSearchParams(params);
    next.set('vista', id);
    setParams(next, { replace: true });
  };

  // Flechas izquierda/derecha para moverse entre pestañas (patrón de tablist)
  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const nextIndex = (index + (e.key === 'ArrowRight' ? 1 : -1) + VIEWS.length) % VIEWS.length;
    select(VIEWS[nextIndex].id);
    document.getElementById(`tab-${VIEWS[nextIndex].id}`)?.focus();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Panel de cursos</h1>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={view.id}
            className="page-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            {view.description}
          </motion.p>
        </AnimatePresence>
      </header>

      <div className="-mx-4 sm:mx-0 overflow-x-auto overflow-y-hidden no-scrollbar px-4 sm:px-0 border-b border-(--border)">
        <div role="tablist" aria-label="Vistas del panel" className="flex min-w-max gap-1">
          {VIEWS.map((v, i) => {
            const selected = v.id === view.id;
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                id={`tab-${v.id}`}
                role="tab"
                aria-selected={selected}
                aria-controls="panel-vista"
                tabIndex={selected ? 0 : -1}
                onClick={() => select(v.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={cn(
                  'relative inline-flex h-11 items-center gap-2 rounded-t-lg px-3 sm:px-4 text-sm font-medium transition-colors duration-200',
                  selected ? 'text-(--text-strong)' : 'text-(--text-muted) hover:text-(--text-strong) hover:bg-black/3',
                )}
              >
                <Icon className={cn('h-4 w-4 transition-colors duration-200', selected ? 'text-secondary-600' : 'text-current')} />
                {v.label}
                {selected && (
                  // El subrayado se desliza de una pestaña a otra: muestra de dónde a dónde cambió la vista
                  <motion.span
                    layoutId="dashboard-tab-indicator"
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-secondary-500"
                    transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cambio de vista: la anterior se va rápido y la nueva entra con un leve ascenso */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view.id}
          id="panel-vista"
          role="tabpanel"
          aria-labelledby={`tab-${view.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.12, ease: 'easeIn' } }}
        >
          <Suspense fallback={<ViewFallback />}>
            <Component />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
