import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden sm:block h-full flex-shrink-0">
        <Sidebar isOpen={true} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="sm:hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="sm:hidden sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center px-4 h-14">
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg p-1.5"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <img src="/soy_logo.webp" alt="Logo" className="w-7 h-7 rounded-full ml-3" />
          </div>
        </header>

        {/* Page area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;