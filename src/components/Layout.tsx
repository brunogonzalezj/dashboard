import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileSpreadsheet, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type LayoutProps = {
    children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { userRole, logout } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-20 bg-teal-500 text-white flex flex-col items-center py-8">
                <div className="mb-8">
                    <div className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center text-teal-500 font-bold text-xl">
                        H
                    </div>
                </div>
                <nav className="flex flex-col items-center space-y-8">
                    <Link to="/" className={`p-2 rounded-lg ${isActive('/') ? 'bg-teal-600' : 'hover:bg-teal-600'}`}>
                        <Home size={24} />
                    </Link>
                    {userRole === 'admin' && (
                        <>
                            <Link to="/users" className={`p-2 rounded-lg ${isActive('/users') ? 'bg-teal-600' : 'hover:bg-teal-600'}`}>
                                <Users size={24} />
                            </Link>
                            <Link to="/csv-upload" className={`p-2 rounded-lg ${isActive('/csv-upload') ? 'bg-teal-600' : 'hover:bg-teal-600'}`}>
                                <FileSpreadsheet size={24} />
                            </Link>
                        </>
                    )}
                </nav>
                <button onClick={logout} className="mt-auto p-2 rounded-lg hover:bg-teal-600">
                    <LogOut size={24} />
                </button>
            </aside>
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">${}</span>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;