import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import FileSaver from 'file-saver';
import { Download, Plus, RefreshCw } from 'lucide-react';
import { User } from '../interfaces/IUsers';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      fetchUsers();
      fetchCompanyOptions();
    }
  }, [isAuthenticated, userRole]);

  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const response = await axios.get('http://excelenciadelasoya.org/api/users', { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al obtener usuarios');
    } finally {
      setUserLoading(false);
    }
  };

  const fetchCompanyOptions = async () => {
    try {
      const response = await axios.get('http://excelenciadelasoya.org/api/data/company-options', { withCredentials: true });
      setCompanyOptions(response.data);
    } catch (error) {
      console.error('Error fetching company options:', error);
      setError('Error al obtener opciones de compañía');
    }
  };

  const createUser = async () => {
    try {
      const response = await axios.post('http://excelenciadelasoya.org/api/users', newUser, { withCredentials: true });
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
      const response = await axios.get('http://excelenciadelasoya.org/api/users/update-passwords', { withCredentials: true });
      const blob = new Blob([response.data.csv], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(blob, 'updated_clients_passwords.csv');
    } catch (error) {
      console.error('Error updating passwords', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || userRole !== 'admin') {
    return <div className="dashboard-card">Acceso no autorizado</div>;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card"
      >
        <h2 className="text-2xl font-bold mb-6">Crear Nuevo Usuario</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            className="input-field"
          />

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                className="form-radio text-primary"
                name="companyType"
                value="businessGroup"
                checked={newUser.companyType === 'businessGroup'}
                onChange={(e) => setNewUser({ ...newUser, companyType: e.target.value, company: '' })}
              />
              <span>Grupo Empresarial</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                className="form-radio text-primary"
                name="companyType"
                value="association"
                checked={newUser.companyType === 'association'}
                onChange={(e) => setNewUser({ ...newUser, companyType: e.target.value, company: '' })}
              />
              <span>Asociación</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                className="form-radio text-primary"
                name="companyType"
                value="business"
                checked={newUser.companyType === 'business'}
                onChange={(e) => setNewUser({ ...newUser, companyType: e.target.value, company: '' })}
              />
              <span>Empresa</span>
            </label>
          </div>

          {newUser.companyType && (
            <select
              value={newUser.company}
              onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
              className="input-field"
            >
              <option value="">Seleccione una opción</option>
              {newUser.companyType === 'businessGroup' && companyOptions.businessGroups.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
              {newUser.companyType === 'association' && companyOptions.associations.map((association) => (
                <option key={association} value={association}>{association}</option>
              ))}
              {newUser.companyType === 'business' && companyOptions.business.map((business) => (
                <option key={business} value={business}>{business}</option>
              ))}
            </select>
          )}

          <div className="flex space-x-4">
            <button
              onClick={createUser}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Usuario</span>
            </button>

            <button
              onClick={handleUpdatePasswords}
              disabled={loading}
              className="btn-secondary flex items-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{loading ? 'Actualizando...' : 'Actualizar Contraseñas'}</span>
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="dashboard-card"
      >
        <h2 className="text-2xl font-bold mb-6">Lista de Usuarios</h2>
        {!userLoading ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Empresa</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td>{user.username}</td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.company}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <span className="loading loading-ring loading-lg"></span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Users;