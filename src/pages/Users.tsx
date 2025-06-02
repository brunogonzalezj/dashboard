import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import FileSaver from 'file-saver';
import {
  Edit2Icon,
  Trash2Icon,
  ChevronUpIcon,
  ChevronDownIcon,
  TriangleAlertIcon,
  DownloadIcon,
} from 'lucide-react';
import { User } from '../interfaces/IUsers';
import Swal from 'sweetalert2';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    companyType: '',
    company: '',
    role: '',
    email: '',
    phone: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { userRole, isAuthenticated } = useAuth();
  const [companyOptions, setCompanyOptions] = useState<{
    businessGroups: string[];
    associations: string[];
    business: string[];
  }>({
    businessGroups: [],
    associations: [],
    business: [],
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'asc' | 'desc';
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      fetchUsers();
      fetchCompanyOptions();
    }
  }, [isAuthenticated, userRole]);

  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al obtener usuarios');
    } finally {
      setUserLoading(false);
    }
  };

  const fetchPasswords = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/get_passwords`,
        { withCredentials: true },
      );
      const blob = new Blob([response.data.csv], {
        type: 'text/csv;charset=utf-8;',
      });
      FileSaver.saveAs(blob, 'clients_passwords.csv');
    } catch (error) {
      console.error('Error fetching passwords:', error);
      setError('Error al obtener contraseñas');
    }
  };

  const fetchCompanyOptions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/data/company-options`,
        { withCredentials: true },
      );
      const sortedOptions = {
        businessGroups: response.data.businessGroups.sort((a: string, b: string) =>
          a.localeCompare(b),
        ),
        associations: response.data.associations.sort((a: string, b: string) =>
          a.localeCompare(b),
        ),
        business: response.data.business.sort((a: string, b: string) =>
          a.localeCompare(b),
        ),
      };
      setCompanyOptions(sortedOptions);
    } catch (error) {
      console.error('Error fetching company options:', error);
      setError('Error al obtener opciones de compañía');
    }
  };

  const createUser = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users`,
        newUser,
        { withCredentials: true },
      );
      setNewUser({
        username: '',
        companyType: '',
        company: '',
        role: '',
        email: '',
        fullName: '',
        phone: '',
      });
      setSuccessMessage(
        `Usuario creado: ${response.data.username}, Contraseña: ${response.data.password}`,
      );
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error al crear usuario');
    }
  };

  const handleUpdatePasswords = async () => {
    const result = await Swal.fire({
      title: '¿Está seguro de que desea reestablecer TODAS las contraseñas?',
      text: 'Esto actualizará las contraseñas de los usuarios y generará un archivo CSV.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, reestablecer',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/update-passwords`,
        { withCredentials: true },
      );
      const blob = new Blob([response.data.csv], {
        type: 'text/csv;charset=utf-8;',
      });
      FileSaver.saveAs(blob, 'updated_clients_passwords.csv');
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Las contraseñas se han reestablecido correctamente.',
        icon: 'success',
      });
    } catch (error) {
      console.error('Error al reestablecer las contraseñas:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Ocurrió un problema al reestablecer las contraseñas.',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewPassword('');
    setNewPhone(user.phone || '');
    setNewEmail(user.email || '');
    setNewFullName(user.fullName || '');
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const updateData: Partial<User> & { password?: string } = {
        username: editingUser.username,
      };
      if (newPassword) updateData.password = newPassword;
      if (newPhone) updateData.phone = newPhone;
      if (newEmail) updateData.email = newEmail;
      if (newFullName) updateData.fullName = newFullName;

      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/update-user/${editingUser.id}`,
        updateData,
        { withCredentials: true },
      );
      setEditingUser(null);
      setNewPassword('');
      fetchUsers();
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Usuario actualizado correctamente.',
        icon: 'success',
      });
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'Ocurrió un problema al actualizar el usuario.',
        icon: 'error',
      });
    }
  };

  const handleDeleteUser = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/users/delete-user/${id}`,
        { withCredentials: true },
      );
      fetchUsers();
      await Swal.fire({
        title: '¡Eliminado!',
        text: 'El usuario ha sido eliminado.',
        icon: 'success',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el usuario.',
        icon: 'error',
      });
    }
  };

  const handleSort = (key: keyof User) => {
    setSortConfig((prevConfig) =>
      prevConfig?.key === key
        ? {
            ...prevConfig,
            direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
          }
        : { key, direction: 'asc' },
    );
  };

  const sortedUsers = React.useMemo(() => {
    const sortableUsers = [...users];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const SortIcon = ({ column }: { column: keyof User }) => {
    if (sortConfig?.key !== column) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 inline-block ml-1" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 inline-block ml-1" />
    );
  };

  if (!isAuthenticated || userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 flex items-center gap-2"
          >
            <span className="hidden sm:inline">Crear Usuario</span>
            <span className="sm:hidden">Crear</span>
          </button>
          <button
            onClick={handleUpdatePasswords}
            disabled={loading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TriangleAlertIcon className="w-5 h-5" />
            <span className="hidden sm:inline">
              {loading ? 'Reestableciendo...' : 'Reestablecer contraseñas'}
            </span>
            <span className="sm:hidden">
              {loading ? 'Procesando...' : 'Reestablecer'}
            </span>
          </button>
          <button
            onClick={fetchPasswords}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <DownloadIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Descargar contraseñas</span>
            <span className="sm:hidden">Descargar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <TriangleAlertIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {userLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'username', label: 'Usuario' },
                  { key: 'fullName', label: 'Nombre' },
                  { key: 'email', label: 'Correo' },
                  { key: 'phone', label: 'Teléfono' },
                  { key: 'role', label: 'Rol' },
                  { key: 'company', label: 'Empresa' },
                  { key: 'actions', label: 'Acciones' },
                ].map((column) => (
                  <th
                    key={column.key}
                    onClick={() =>
                      column.key !== 'actions' &&
                      handleSort(column.key as keyof User)
                    }
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.key !== 'actions' && 'cursor-pointer hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.key !== 'actions' && (
                        <SortIcon column={column.key as keyof User} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-amber-500 hover:text-amber-600 transition-colors duration-150"
                      >
                        <Edit2Icon className="w-5 h-5" />
                      </button>
                      {user.username !== 'clagonjor' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-600 transition-colors duration-150"
                        >
                          <Trash2Icon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Nuevo Usuario</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createUser();
                setIsModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de empresa
                </label>
                <div className="flex flex-wrap gap-4">
                  {[
                    {
                      value: 'businessGroup',
                      label: 'Grupo Empresarial',
                    },
                    { value: 'association', label: 'Asociación' },
                    { value: 'business', label: 'Empresa' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="inline-flex items-center"
                    >
                      <input
                        type="radio"
                        name="companyType"
                        value={option.value}
                        checked={newUser.companyType === option.value}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            companyType: e.target.value,
                            company: '',
                          })
                        }
                        className="form-radio text-amber-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {newUser.companyType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <select
                    value={newUser.company}
                    onChange={(e) =>
                      setNewUser({ ...newUser, company: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  >
                    <option value="">Seleccione una opción</option>
                    {newUser.companyType === 'businessGroup' &&
                      companyOptions.businessGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    {newUser.companyType === 'association' &&
                      companyOptions.associations.map((association) => (
                        <option key={association} value={association}>
                          {association}
                        </option>
                      ))}
                    {newUser.companyType === 'business' &&
                      companyOptions.business.map((business) => (
                        <option key={business} value={business}>
                          {business}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                >
                  <option value="">Seleccione un rol</option>
                  <option value="admin">Administrador</option>
                  <option value="client">Cliente</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors duration-150"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Editar Usuario</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateUser();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Dejar en blanco para mantener la actual"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors duration-150"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;