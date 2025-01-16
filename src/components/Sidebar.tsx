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
          {/* Overlay */}
          {isOpen && (
            <div
              className="fixed inset-0 z-20 bg-black bg-opacity-50 sm:hidden"
              onClick={onClose}
            ></div>
          )}

          {/* Sidebar */}
        <aside
          className={`
                    fixed sm:static inset-y-0 left-0 z-30 w-64 sm:w-20 bg-amber-500 text-white 
                    transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                    sm:translate-x-0 transition-transform duration-300 ease-in-out
                    flex flex-col items-center justify-between py-4 sm:py-8
                `}
        >
          <div className="flex flex-col items-center gap-4 sm:gap-8 w-full">
            <div className="flex justify-between items-center w-full px-4 sm:px-0 sm:justify-center">
              <img src="/soy_logo.webp" alt="Soy Logo" className="w-10 h-10 sm:w-14 sm:h-14" />
              <button onClick={onClose} className="sm:hidden text-white">
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col sm:items-center space-y-4 w-full px-4 sm:px-0">
              <div className="tooltip tooltip-right" data-tip="Home">
                <Link
                  to="/"
                  className={`flex items-center space-x-4 sm:space-x-0 p-2 rounded-md ${isActive('/') ? 'bg-white/80 text-amber-500' : 'hover:bg-white/20'}`}
                  onClick={onClose}
                >
                  <Home size={20} />
                  <span className="sm:hidden">Home</span>
                </Link>
              </div>
              {userRole === 'admin' && (
                <>
                  <div className="tooltip tooltip-right" data-tip="Usuarios">
                    <Link
                      to="/users"
                      className={`flex items-center space-x-4 sm:space-x-0 p-2 rounded-md ${isActive('/users') ? 'bg-white/80 text-amber-500' : 'hover:bg-white/20'}`}
                      onClick={onClose}
                    >
                      <Users size={20} />
                      <span className="sm:hidden">Usuarios</span>
                    </Link>
                  </div>
                  <div className="tooltip tooltip-right" data-tip="CSV">
                    <Link
                      to="/csv-upload"
                      className={`flex items-center space-x-4 sm:space-x-0 p-2 rounded-md ${isActive('/csv-upload') ? 'bg-white/80 text-amber-500' : 'hover:bg-white/20'}`}
                      onClick={onClose}
                    >
                      <FileSpreadsheet size={20} />
                      <span className="sm:hidden">CSV</span>
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
          <div className="tooltip tooltip-right" data-tip="Cerrar Sesión">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center space-x-4 sm:space-x-0 p-2 rounded-md hover:bg-white/20 w-full px-4 sm:justify-center sm:px-3"
            >
              <LogOut size={20} />
              <span className="sm:hidden">Cerrar Sesión</span>
            </button>
          </div>
        </aside>
      </>
);
};

