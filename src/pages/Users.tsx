import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface User {
    id: number;
    username: string;
    role: string;
    company: string;
    password: string;
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [newUser, setNewUser] = useState({ username: '', company: '' });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { userRole } = useAuth();

    useEffect(() => {
        if (userRole === 'admin') {
            fetchUsers();
        }
    }, [userRole]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/users', { withCredentials: true });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Error al obtener usuarios');
        }
    };

    const createUser = async () => {
        try {
            const response = await axios.post('http://localhost:3001/users', newUser, { withCredentials: true });
            setNewUser({ username: '', company: '' });
            setSuccessMessage(`Usuario creado: ${response.data.username}, Contraseña: ${response.data.password}`);
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            setError('Error al crear usuario');
        }
    };

    if (userRole !== 'admin') {
        return <div className="p-6 bg-white rounded-lg shadow-md">Acceso no autorizado</div>;
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>
            <div className="space-y-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Nombre de usuario"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        className="flex-1 p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Compañía"
                        value={newUser.company}
                        onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                        className="flex-1 p-2 border rounded"
                    />
                    <button
                        onClick={createUser}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Crear Usuario
                    </button>
                </div>
                {error && <div className="text-red-500">{error}</div>}
                {successMessage && <div className="text-green-500">{successMessage}</div>}
                <table className="min-w-full bg-white">
                    <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Username</th>
                        <th className="py-2 px-4 border-b">Role</th>
                        <th className="py-2 px-4 border-b">Company</th>
                        <th className="py-2 px-4 border-b">Password</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="py-2 px-4 border-b">{user.username}</td>
                            <td className="py-2 px-4 border-b">{user.role}</td>
                            <td className="py-2 px-4 border-b">{user.company}</td>
                            <td className="py-2 px-4 border-b">{user.password}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
