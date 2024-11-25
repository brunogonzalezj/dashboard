import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import FileSaver from 'file-saver';
import { DownloadIcon, Edit2Icon, Trash2Icon } from 'lucide-react';
import { User } from '../interfaces/IUsers';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ username: '', companyType: '', company: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { userRole, isAuthenticated } = useAuth();
  const [companyOptions, setCompanyOptions] = useState<{ businessGroups: string[], associations: string[], business: string[] }>({
    businessGroups: [],
    associations: [],
    business: [],
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      fetchUsers();
      fetchCompanyOptions();
    }
  }, [isAuthenticated, userRole]);

  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, { withCredentials: true });
      setUsers(response.data);
      setUserLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al obtener usuarios');
      setUserLoading(false);
    }
  };

  const fetchCompanyOptions = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/data/company-options`, { withCredentials: true });
      setCompanyOptions(response.data);
    } catch (error) {
      console.error('Error fetching company options:', error);
      setError('Error al obtener opciones de compañía');
    }
  };

  const createUser = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users`, newUser, { withCredentials: true });
      setNewUser({ username: '', companyType: '', company: '', role: '' });
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/update-passwords`, { withCredentials: true });
      const blob = new Blob([response.data.csv], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(blob, 'updated_clients_passwords.csv');
    } catch (error) {
      console.error('Error updating passwords', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewPassword('');
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const updateData: Partial<User> & { password?: string } = {
        username: editingUser.username,
      };
      if (newPassword) {
        updateData.password = newPassword;
      }
      await axios.put(`${import.meta.env.VITE_API_URL}/update-user/:${editingUser.id}`, updateData, { withCredentials: true });
      setEditingUser(null);
      setNewPassword('');
      fetchUsers();
      setSuccessMessage('Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/delete-user/:${id}`, { withCredentials: true });
        fetchUsers();
        setSuccessMessage('Usuario eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Error al eliminar usuario');
      }
    }
  };

  if (!isAuthenticated || userRole !== 'admin') {
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
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
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
                onChange={(e) => setNewUser({ ...newUser, companyType: e.target.value, company: '' })}
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
                onChange={(e) => setNewUser({ ...newUser, companyType: e.target.value, company: '' })}
              />
              <span className="ml-2">Asociación</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="companyType"
                value="business"
                checked={newUser.companyType === 'business'}
                onChange={(e) => setNewUser({ ...newUser, companyType: e.target.value, company: '' })}
              />
              <span className="ml-2">Empresa</span>
            </label>
          </div>
          {newUser.companyType && (
            <select
              value={newUser.company}
              onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Seleccione una opción</option>
              {newUser.companyType === 'businessGroup'
                && (companyOptions.businessGroups.map((group: string) => (
                  <option key={group} value={group}>{group}</option>
                )))}
              {newUser.companyType === 'association'
                && (companyOptions.associations.map((association: string) => (
                  <option key={association} value={association}>{association}</option>
                )))
              }
              {newUser.companyType === 'business' && (
                companyOptions.business.map((business: string) => (
                  <option key={business} value={business}>{business}</option>
                )))}
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
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <DownloadIcon />{loading ? 'Actualizando...' : 'Actualizar Contraseñas'}
        </button>
        {error && <div className="text-red-500">{error}</div>}
        {successMessage && <div className="text-green-500">{successMessage}</div>}
        {!userLoading ? (
          <table className="min-w-full bg-white">
            <thead>
            <tr>
              <th className="py-2 px-4 border-b">Username</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Company</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
            </thead>
            <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b text-center">{user.username}</td>
                <td className="py-2 px-4 border-b text-center">{user.role}</td>
                <td className="py-2 px-4 border-b text-center">{user.company}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="mr-2 p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Edit2Icon size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2Icon size={16} />
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center">
            <span className="loading loading-ring loading-lg"></span>
          </div>
        )}
      </div>
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Editar Usuario</h3>
            <input
              type="text"
              value={editingUser.username}
              onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
              className="p-2 border rounded mb-2 w-full"
              placeholder="Nombre de usuario"
            />
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-2 border rounded mb-4 w-full"
              placeholder="Nueva contraseña (dejar en blanco para no cambiar)"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

