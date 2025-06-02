import { Link, useLocation } from "react-router-dom";
import { FileSpreadsheet, Home, LogOut, Users, X } from 'lucide-react';
import { useAuth } from "../contexts/AuthContext";
import React from "react";
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, userRole } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const NavLink = ({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) => (
    <div className="tooltip tooltip-right" data-tip={label}>
      <Link
        to={to}
        onClick={onClose}
        className={`flex items-center space-x-4 sm:space-x-0 p-3 rounded-lg transition-all duration-200 ${
          isActive(to)
            ? 'bg-primary-100 text-primary-600'
            : 'hover:bg-white/10 text-gray-100 hover:text-white'
        }`}
      >
        <Icon className="w-6 h-6" />
        <span className="sm:hidden font-medium">{label}</span>
      </Link>
    </div>
  );

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-20 bg-black bg-opacity-50 sm:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        initial={false}
        className={`
          fixed sm:static inset-y-0 left-0 z-30 w-64 sm:w-20 bg-gradient-to-b from-primary-600 to-primary-800
          transform sm:transform-none transition-transform duration-300 ease-in-out
          flex flex-col items-center justify-between py-6 px-2
        `}
      >
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="flex justify-between items-center w-full px-4 sm:px-0 sm:justify-center">
            <img src="/soy_logo.webp" alt="Logo" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full" />
            <button onClick={onClose} className="sm:hidden text-white hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col space-y-2 w-full">
            <NavLink to="/" icon={Home} label="Home" />
            {userRole === 'admin' && (
              <>
                <NavLink to="/users" icon={Users} label="Usuarios" />
                <NavLink to="/csv-upload" icon={FileSpreadsheet} label="CSV" />
              </>
            )}
          </nav>
        </div>

        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center space-x-4 sm:space-x-0 p-3 rounded-lg hover:bg-white/10 text-gray-100 hover:text-white w-full sm:justify-center transition-colors duration-200"
        >
          <LogOut className="w-6 h-6" />
          <span className="sm:hidden font-medium">Cerrar Sesión</span>
        </button>
      </motion.aside>
    </>
  );
};