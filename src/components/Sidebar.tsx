import { Link, useLocation } from "react-router-dom";
import { FileSpreadsheet, Home, LogOut, Users, X } from 'lucide-react';
import { useAuth } from "../contexts/AuthContext";
import React from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, userRole } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 sm:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed sm:static inset-y-0 left-0 z-30 w-64 sm:w-20 bg-amber-500
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:translate-x-0 transition-transform duration-300 ease-in-out
          flex flex-col h-full
        `}
      >
        <div className="flex flex-col items-center gap-8 w-full py-6">
          <div className="flex justify-between items-center w-full px-4 sm:px-0 sm:justify-center">
            <img src="/soy_logo.webp" alt="Logo" className="w-12 h-12 rounded-full" />
            <button onClick={onClose} className="sm:hidden text-white hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col space-y-2 w-full px-4">
            <Link
              to="/"
              onClick={onClose}
              className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-200 ${
                isActive('/')
                  ? 'bg-white/80 text-amber-500'
                  : 'hover:bg-white/20 text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="sm:hidden font-medium">Home</span>
            </Link>

            {userRole === 'admin' && (
              <>
                <Link
                  to="/users"
                  onClick={onClose}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-200 ${
                    isActive('/users')
                      ? 'bg-white/80 text-amber-500'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="sm:hidden font-medium">Usuarios</span>
                </Link>

                <Link
                  to="/csv-upload"
                  onClick={onClose}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-200 ${
                    isActive('/csv-upload')
                      ? 'bg-white/80 text-amber-500'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="sm:hidden font-medium">CSV</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-6">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center space-x-2 p-3 rounded-lg hover:bg-white/20 text-white w-full transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="sm:hidden font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};