import { Link, useLocation } from "react-router-dom";
import { FileSpreadsheet, Home, LogOut, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import React from "react";

export const Sidebar: React.FC = () => {
  const { logout, userRole } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar w-20 md:w-64 p-6 flex flex-col items-center md:items-start">
      <div className="flex-grow space-y-8">
        <div className="flex justify-center md:justify-start">
          <img src="/soy_logo.png" alt="Soy Logo" className="w-12 h-12 md:w-16 md:h-16" />
        </div>

        <nav className="flex flex-col space-y-2">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            title="Home"
          >
            <Home size={24} />
            <span className="hidden md:inline">Dashboard</span>
          </Link>

          {userRole === 'admin' && (
            <>
              <Link
                to="/users"
                className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                title="Users"
              >
                <Users size={24} />
                <span className="hidden md:inline">Users</span>
              </Link>

              <Link
                to="/csv-upload"
                className={`nav-link ${isActive('/csv-upload') ? 'active' : ''}`}
                title="CSV Upload"
              >
                <FileSpreadsheet size={24} />
                <span className="hidden md:inline">CSV Upload</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      <button
        onClick={logout}
        className="nav-link w-full mt-auto"
        title="Logout"
      >
        <LogOut size={24} />
        <span className="hidden md:inline">Logout</span>
      </button>
    </aside>
  );
};