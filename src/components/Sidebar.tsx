import { Link, useLocation } from "react-router-dom";
import { FileSpreadsheet, Home, LogOut, Users, X } from 'lucide-react';
import { useAuth } from "../contexts/AuthContext";
import React from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV = [
  { to: '/',          icon: Home,            label: 'Inicio' },
  { to: '/users',     icon: Users,           label: 'Usuarios',       adminOnly: true },
  { to: '/csv-upload',icon: FileSpreadsheet, label: 'Cargar CSV',     adminOnly: true },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, userRole, username } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm sm:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed sm:static inset-y-0 left-0 z-30
          w-60 flex flex-col h-full
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:translate-x-0 transition-transform duration-300 ease-in-out
        `}
        style={{ background: 'linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%)' }}
      >
        {/* Logo + close */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/soy_logo.webp" alt="Logo" className="w-8 h-8 rounded-full ring-2 ring-white/30" />
            <span className="text-white font-semibold text-sm tracking-wide">Excelencia</span>
          </div>
          <button onClick={onClose} className="sm:hidden text-white/70 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.filter(n => !n.adminOnly || userRole === 'admin').map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${isActive(to)
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold uppercase flex-shrink-0">
              {username?.[0] ?? '?'}
            </div>
            <span className="text-white/80 text-sm truncate">{username}</span>
          </div>
          <button
            onClick={() => { logout(); onClose(); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};