import {Link, useLocation} from "react-router-dom";
import {FileSpreadsheet, Home, LogOut, Users} from "lucide-react";
import {useAuth} from "../contexts/AuthContext";
import React from "react";

export const Sidebar: React.FC = () => {
    const {logout, userRole} = useAuth();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return <aside className="w-30 px-4  bg-amber-500  text-white flex flex-col items-center py-8  relative z-10">
        <div className="flex-grow flex flex-col gap-2">
            <div className="mb-8">
                <img src={"/soy_logo.png"} alt="Soy Logo" className="w-14 h-14"/>
            </div>

            <nav className="flex flex-col items-center space-y-4 p-1 bg-gray-200/30 backdrop-blur rounded-full">
                <div className={"flex group tooltip tooltip-right"} data-tip={"Home"}>
                    <Link to="/"
                          className={`p-3 rounded-full ${isActive('/') ? 'bg-white/80' : 'group-hover:bg-white/50'}`}>
                        <Home size={24}
                              className={`${isActive("/") ? 'text-amber-500' : 'text-white group-hover:text-amber-500'}`}/>
                    </Link>
                </div>
                {userRole === 'admin' && (
                    <>
                        <div className={"flex group tooltip tooltip-right"} data-tip={"Users"}>
                            <Link to="/users"
                                  className={`p-3 rounded-full ${isActive('/users') ? 'bg-white/80' : 'group-hover:bg-white/50'}`}>
                                <Users size={24}
                                       className={`${isActive("/users") ? 'text-amber-500' : 'text-white group-hover:text-amber-500'}`}/>
                            </Link>
                        </div>

                        <div className={"flex group tooltip tooltip-right"} data-tip={"CSV Upload"}>
                            <Link to="/csv-upload"
                                  className={`p-3 rounded-full ${isActive('/csv-upload') ? 'bg-white/80' : 'group-hover:bg-white/50 '}`}>
                                <FileSpreadsheet size={24}
                                                 className={`${isActive("/csv-upload") ? 'text-amber-500' : 'text-white group-hover:text-amber-500'}`}/>
                            </Link>
                        </div>
                    </>
                )}


            </nav>
        </div>

        <footer className={"group"}>
            <button onClick={logout}
                    className="tooltip tooltip-right mt-auto p-3 rounded-full bg-gray-200/30 group-hover:bg-white/80"
                    data-tip={"Logout"}>
                <LogOut size={24} className={"group-hover:text-amber-500"}/>
            </button>
        </footer>

    </aside>
}