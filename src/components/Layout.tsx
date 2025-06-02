import React from 'react';
import { Outlet } from 'react-router-dom';
import { User2Icon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from "./Sidebar.tsx";

const Layout: React.FC = () => {
  const { username } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-end items-center">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 transition-all duration-200 hover:bg-gray-200">
                <User2Icon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{username}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;