import { NavLink } from 'react-router';
import { LogOut, X } from 'lucide-react';
import { LayoutGroup, motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import React from 'react';
import { cn } from '../lib/utils';
import { NAV } from './nav';

interface SidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
}

const ROLE_LABEL: Record<string, string> = { admin: 'Administrador', client: 'Cliente' };

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, onClose }) => {
  const { logout, userRole, username } = useAuth();

  return (
    <div className="flex h-full w-full flex-col bg-primary-900 text-primary-100">
      {/* Marca */}
      <div className="flex h-16 items-center justify-between gap-3 px-5">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/soy_logo.webp" alt="" className="h-9 w-9 rounded-full ring-1 ring-white/15" />
          <div className="min-w-0 leading-tight">
            <p className="text-[15px] font-semibold text-white truncate">Excelencia</p>
            <p className="text-xs text-primary-200/80 truncate">de la Soya</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary-200 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 pt-4" aria-label="Principal">
        {/* Grupo propio por instancia: la barra fija y el menú del celular están montados a la vez */}
        <LayoutGroup id={onClose ? 'sidebar-drawer' : 'sidebar-fixed'}>
        <ul className="space-y-1">
          {NAV.filter((n) => !n.adminOnly || userRole === 'admin').map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150',
                    isActive ? 'text-white' : 'text-primary-200 hover:bg-white/6 hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      // El resaltado se desliza hasta la sección nueva
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg bg-white/8"
                        transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        'relative h-[18px] w-[18px] shrink-0 transition-colors',
                        isActive ? 'text-secondary-400' : 'text-primary-300 group-hover:text-primary-100',
                      )}
                    />
                    <span className="relative truncate">{label}</span>
                    {isActive && <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-secondary-400" aria-hidden="true" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        </LayoutGroup>
      </nav>

      {/* Usuario */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-400 text-sm font-bold uppercase text-primary-950">
            {username?.[0] ?? '?'}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-white">{username}</p>
            <p className="text-xs text-primary-200/80">{ROLE_LABEL[userRole ?? ''] ?? 'Sin rol'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="mt-1 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-primary-200 transition-colors hover:bg-white/6 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
