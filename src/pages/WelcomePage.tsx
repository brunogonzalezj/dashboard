import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    username: string;
}

export default function WelcomePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:3001/protected', {
                    method: 'GET',
                    credentials: 'include', // Important for sending cookies
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser({ id: data.userId, username: data.username });
                } else {
                    throw new Error('No autorizado');
                }
            } catch (error) {
                setError((error as Error).message);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:3001/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                navigate('/login');
            } else {
                throw new Error('Error al cerrar sesión');
            }
        } catch (error) {
            setError((error as Error).message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-xl font-semibold">Cargando...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-xl font-semibold text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Bienvenido, {user?.username}!
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Has iniciado sesión correctamente.
                    </p>
                </div>
                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleLogout}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
}