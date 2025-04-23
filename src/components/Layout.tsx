import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className='flex h-screen bg-gray-200 -z-50'>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className='flex-1 overflow-y-auto overflow-x-hidden'>
        <header className='sticky top-0 z-10 bg-white sm:bg-transparent'>
          <div className='max-w-7xl mx-auto md:hidden py-2 px-4 sm:px-6 lg:px-8 flex sm:justify-end sm:w-screen justify-between items-center'>
            <button
              className='sm:hidden text-gray-600 focus:outline-none'
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
        <div className='w-full mx-auto py-4 px-4 sm:px-6 lg:px-8 overflow-hidden'>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
