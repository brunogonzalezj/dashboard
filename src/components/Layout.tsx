import { ReactNode, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, FileSpreadsheet, LogOut } from 'lucide-react'

type LayoutProps = {
    children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const [userRole, setUserRole] = useState<string | null>(null)

    useEffect(() => {
        // Fetch user role from the server
        const fetchUserRole = async () => {
            try {
                const response = await fetch('http://localhost:3001/user-role', {
                    credentials: 'include',
                })
                if (response.ok) {
                    const data = await response.json()
                    setUserRole(data.role)
                } else {
                    navigate('/login')
                }
            } catch (error) {
                console.error('Error fetching user role:', error)
                navigate('/login')
            }
        }

        fetchUserRole()
    }, [navigate])

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
        <div className="flex h-screen bg-gradient-to-r from-purple-500 to-indigo-600">
            <aside className="w-64 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg">
                <div className="p-4">
                    <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
                </div>
                <nav className="mt-6">
                    <Link to="/" className={`flex items-center px-4 py-2 text-white ${isActive('/') ? 'bg-white bg-opacity-20' : ''}`}>
                        <Home className="mr-3" size={20} />
                        <span>Dashboard</span>
                    </Link>
                    {userRole === 'admin' && (
                        <>
                            <Link to="/users" className={`flex items-center px-4 py-2 text-white ${isActive('/users') ? 'bg-white bg-opacity-20' : ''}`}>
                                <Users className="mr-3" size={20} />
                                <span>Users</span>
                            </Link>
                            <Link to="/csv-upload" className={`flex items-center px-4 py-2 text-white ${isActive('/csv-upload') ? 'bg-white bg-opacity-20' : ''}`}>
                                <FileSpreadsheet className="mr-3" size={20} />
                                <span>CSV Upload</span>
                            </Link>
                        </>
                    )}
                    <button onClick={handleLogout} className="flex items-center px-4 py-2 w-full text-left text-white">
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