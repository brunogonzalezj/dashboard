import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { AnimatePresence } from 'framer-motion';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className='flex h-screen bg-gray-100'>
      <div className="hidden sm:block sm:h-full h-full">
        <Sidebar isOpen={true} onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="sm:hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      <main className='flex-1 overflow-hidden'>
        <header className='sticky top-0 z-10 bg-white sm:bg-transparent'>
          <div className='max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8'>
            <button
              className='sm:hidden text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg p-2'
              onClick={toggleSidebar}
            >
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
          </div>
        </header>
        
        <div className='h-[calc(100vh-4rem)] overflow-auto px-4 py-6 sm:px-6 lg:px-8'>
          <div className='max-w-7xl mx-auto'>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;