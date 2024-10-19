import {Link, useLocation} from "react-router-dom";
import {FileSpreadsheet, Home, LogOut, Users} from "lucide-react";
import {useAuth} from "../contexts/AuthContext";
import React from "react";

export const Sidebar: React.FC = () => {
    const {logout, userRole} = useAuth();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return <aside className="w-20   text-white flex flex-col items-center py-8 pl-6 relative z-10">
                <div className="mb-8">
                    <img src={"/soy_logo.png"} alt="Soy Logo" className="w-14 h-14"/>
                </div>
                <nav className="flex flex-col items-center space-y-8 bg-gray-200/30 backdrop-blur p-2 rounded-full">
                    <>
                    <div className={"flex tooltip tooltip-right"} data-tip={"Home"}>
                        <Link to="/"
                              className={`p-2 rounded-full ${isActive('/') ? 'bg-teal-700' : 'hover:bg-teal-700'}`}>
                            <Home size={24}/>
                        </Link>
                    </div>
                    {userRole === 'admin' && (
                        <>
                            <div className={"flex tooltip tooltip-right"} data-tip={"Users"}>
                                <Link to="/users"
                                      className={`p-2 rounded-full ${isActive('/users') ? 'bg-teal-600' : 'hover:bg-teal-600'}`}>
                                    <Users size={24}/>
                                </Link>
                            </div>
                            <div className={"flex tooltip tooltip-right"} data-tip={"CSV Upload"}>
                                <Link to="/csv-upload"
                                      className={`p-2 rounded-full ${isActive('/csv-upload') ? 'bg-teal-600' : 'hover:bg-teal-600'}`}>
                                    <FileSpreadsheet size={24}/>
                                </Link>
                            </div>
                        </>
                    )}
                </>
                </nav>
                <button onClick={logout} className="tooltip tooltip-right mt-auto p-2 rounded-lg hover:bg-amber-700" data-tip={"Logout"}>
                    <LogOut size={24}/>
                </button>
            </aside>
}