import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, FileSpreadsheet, LogOut } from 'lucide-react'

type LayoutProps = {
    children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation()
    const navigate = useNavigate()

    const isActive = (path: string) => location.pathname === path

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3001/logout', {
                method: 'POST',
                credentials: 'include',
            });
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md">
                <div className="p-4">
                    <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
                </div>
                <nav className="mt-6">
                    <Link to="/" className={`flex items-center px-4 py-2 ${isActive('/') ? 'bg-gray-200' : ''}`}>
                        <Home className="mr-3" size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/users" className={`flex items-center px-4 py-2 ${isActive('/users') ? 'bg-gray-200' : ''}`}>
                        <Users className="mr-3" size={20} />
                        <span>Users</span>
                    </Link>
                    <Link to="/csv-upload" className={`flex items-center px-4 py-2 ${isActive('/csv-upload') ? 'bg-gray-200' : ''}`}>
                        <FileSpreadsheet className="mr-3" size={20} />
                        <span>CSV Upload</span>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center px-4 py-2 w-full text-left">
                        <LogOut className="mr-3" size={20} />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}