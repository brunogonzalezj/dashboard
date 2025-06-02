import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className='flex h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <div className="hidden sm:block">
        <Sidebar isOpen={true} onClose={() => setIsSidebarOpen(false)} />
      </div>
      <div className="sm:hidden">
        {isSidebarOpen && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
      </div>
      <main className='flex-1 overflow-hidden'>
        <header className='sticky top-0 z-10 backdrop-blur-sm bg-white/50'>
          <div className='max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center'>
              <button
                className='sm:hidden text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-2'
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
          </div>
        </header>
        <AnimatePresence mode='wait'>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className='h-[calc(100vh-4rem)] overflow-auto px-4 py-6 sm:px-6 lg:px-8'
          >
            <div className='max-w-7xl mx-auto'>
              <Outlet />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;