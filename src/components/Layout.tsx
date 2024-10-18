import React from 'react';
import { Outlet } from 'react-router-dom';
import { User2Icon} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {Sidebar} from "./Sidebar.tsx";




const Layout: React.FC = () => {
    const { username } = useAuth();

    return (
        <div className="flex h-screen bg-gray-100 background-custom -z-50" >
            <Sidebar />
            <main className="flex-1 overflow-y-auto ">
            <header className=" sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto pt-4 px-4 sm:px-6 lg:px-8 flex justify-end items-end">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-gray-200 opacity-60 rounded-lg p-2">
                                <span className="text-sm font-medium text-black flex items-center gap-2"><User2Icon/>{username}</span> {/* Line 48 */}
                            </div>
                        </div>
                    </div>
                </header>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 overflow-hidden" >
                    <Outlet/>
                </div>
            </main>
        </div>
    );
};

export default Layout;