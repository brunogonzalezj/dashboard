import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import FileSaver from 'file-saver';
import { DownloadIcon } from "lucide-react";
import { User } from "../interfaces/IUsers.ts";

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [newUser, setNewUser] = useState({ username: '', companyType: '', company: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { userRole } = useAuth();
    const [companyOptions, setCompanyOptions] = useState<{ businessGroups: string[], associations: string[] }>({
        businessGroups: [],
        associations: []
    });

    useEffect(() => {
        if (userRole === 'admin') {
            fetchUsers();
            fetchCompanyOptions();
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

    const fetchCompanyOptions = async () => {
        try {
            const response = await axios.get('http://localhost:3001/company-options', { withCredentials: true });
            setCompanyOptions(response.data);
        } catch (error) {
            console.error('Error fetching company options:', error);
            setError('Error al obtener opciones de compañía');
        }
    };

    const createUser = async () => {
        try {
            const response = await axios.post('http://localhost:3001/users', newUser, { withCredentials: true });
            setNewUser({ username: '', companyType: '', company: '' });
            setSuccessMessage(`Usuario creado: ${response.data.username}, Contraseña: ${response.data.password}`);
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            setError('Error al crear usuario');
        }
    };

    const handleUpdatePasswords = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3001/users/update-passwords', { withCredentials: true });
            const blob = new Blob([response.data.csv], { type: 'text/csv;charset=utf-8;' });
            FileSaver.saveAs(blob, 'updated_clients_passwords.csv');
        } catch (error) {
            console.error('Error updating passwords', error);
        } finally {
            setLoading(false);
        }
    };

    if (userRole !== 'admin') {
        return <div className="p-6 bg-white rounded-lg shadow-md">Acceso no autorizado</div>;
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>
            <div className="space-y-4">
                <div className="flex flex-col space-y-4">
                    <input
                        type="text"
                        placeholder="Nombre de usuario"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        className="p-2 border rounded"
                    />
                    <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio"
                                name="companyType"
                                value="businessGroup"
                                checked={newUser.companyType === 'businessGroup'}
                                onChange={(e) => setNewUser({...newUser, companyType: e.target.value, company: ''})}
                            />
                            <span className="ml-2">Grupo Empresarial</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio"
                                name="companyType"
                                value="association"
                                checked={newUser.companyType === 'association'}
                                onChange={(e) => setNewUser({...newUser, companyType: e.target.value, company: ''})}
                            />
                            <span className="ml-2">Asociación</span>
                        </label>
                    </div>
                    {newUser.companyType && (
                        <select
                            value={newUser.company}
                            onChange={(e) => setNewUser({...newUser, company: e.target.value})}
                            className="p-2 border rounded"
                        >
                            <option value="">Seleccione una opción</option>
                            {newUser.companyType === 'businessGroup'
                                ? companyOptions.businessGroups.map((group: string) => (
                                    <option key={group} value={group}>{group}</option>
                                ))
                                : companyOptions.associations.map((association: string) => (
                                    <option key={association} value={association}>{association}</option>
                                ))
                            }
                        </select>
                    )}
                    <button
                        onClick={createUser}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Crear Usuario
                    </button>
                </div>
                <button onClick={handleUpdatePasswords} disabled={loading}
                        className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2">
                    <DownloadIcon/>{loading ? 'Actualizando...' : 'Actualizar Contraseñas'}
                </button>
                {error && <div className="text-red-500">{error}</div>}
                {successMessage && <div className="text-green-500">{successMessage}</div>}
                <table className="min-w-full bg-white">
                    <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Username</th>
                        <th className="py-2 px-4 border-b">Role</th>
                        <th className="py-2 px-4 border-b">Company</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="py-2 px-4 border-b text-center">{user.username}</td>
                            <td className="py-2 px-4 border-b text-center">{user.role}</td>
                            <td className="py-2 px-4 border-b text-center">{user.company}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}