import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import FileSaver from 'file-saver';
import {
  Edit2Icon,
  Trash2Icon,
  ChevronUpIcon,
  ChevronDownIcon, TriangleAlertIcon
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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users`,
        { withCredentials: true },
      );
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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/data/company-options`,
        { withCredentials: true },
      );
      const sortedOptions = {
        businessGroups: response.data.businessGroups.sort(
          (a: string, b: string) => a.localeCompare(b),
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
      setNewUser({ username: '', companyType: '', company: '', role: '', email: '', fullName: '', phone: '' });
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
      title: '¿Está seguro de que desea reestablecer TODAS las contraseñas de los clientes?',
      text: 'Esto actualizará las contraseñas de los usuarios y generará un archivo CSV con las nuevas contraseñas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, reestablecer',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) {
      return;
    }

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
      Swal.fire({
        title: '¡Éxito!',
        text: 'Las contraseñas se han reestablecido correctamente. El archivo CSV se ha descargado.',
        icon: 'success',
      });
    } catch (error) {
      console.error('Error al reestablecer las contraseñas:', error);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un problema al reestablecer las contraseñas. Por favor, inténtelo nuevamente.',
        icon: 'error',
      });
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
      if (newPhone) {
        updateData.phone = newPhone;
      }
      if (newEmail) {
        updateData.email = newEmail;
      }
      if (newFullName) {
        updateData.fullName = newFullName;
      }
      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/update-user/${editingUser.id}`,
        updateData,
        { withCredentials: true },
      );
      setEditingUser(null);
      setNewPassword('');
      fetchUsers();
      Swal.fire({
        title: '¡Éxito!',
        text: 'La contraseña se ha actualizado correctamente.',
        icon: 'success',
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un problema al reestablecer las contraseñas. Por favor, inténtelo nuevamente.',
        icon: 'error',
      });
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/users/delete-user/${id}`,
          { withCredentials: true },
        );
        fetchUsers();
        setSuccessMessage('Usuario eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Error al eliminar usuario');
      }
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
      <ChevronUpIcon className='w-4 h-4 inline-block ml-1' />
    ) : (
      <ChevronDownIcon className='w-4 h-4 inline-block ml-1' />
    );
  };

  if (!isAuthenticated || userRole !== 'admin') {
    return (
      <div className='p-6 bg-white rounded-lg shadow-md'>
        Acceso no autorizado
      </div>
    );
  }

  return (
    <div className='bg-white shadow rounded-lg p-6'>
      <h2 className='text-2xl font-bold mb-4'>Gestión de Usuarios</h2>
      <div className="space-y-4">
        {isModalOpen && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-96'>
              <h3 className='text-lg font-bold mb-4'>Nuevo Usuario</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createUser();
                  setIsModalOpen(false);
                }}
                className='space-y-4'
              >
                <input
                  type='text'
                  placeholder='Nombre de usuario'
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className='p-2 border rounded w-full'
                />
                <input
                  type='text'
                  placeholder='Nombre completo'
                  value={newUser.fullName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, fullName: e.target.value })
                  }
                  className='p-2 border rounded w-full'
                />
                <input
                  type='email'
                  placeholder='Correo electrónico'
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className='p-2 border rounded w-full'
                />
                <input
                  type='text'
                  placeholder='Teléfono'
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className='p-2 border rounded w-full'
                />
                <div className='flex items-center space-x-4'>
                  <label className='inline-flex items-center'>
                    <input
                      type='radio'
                      className='form-radio'
                      name='companyType'
                      value='businessGroup'
                      checked={newUser.companyType === 'businessGroup'}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          companyType: e.target.value,
                          company: '',
                        })
                      }
                    />
                    <span className='ml-2'>Grupo Empresarial</span>
                  </label>
                  <label className='inline-flex items-center'>
                    <input
                      type='radio'
                      className='form-radio'
                      name='companyType'
                      value='association'
                      checked={newUser.companyType === 'association'}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          companyType: e.target.value,
                          company: '',
                        })
                      }
                    />
                    <span className='ml-2'>Asociación</span>
                  </label>
                  <label className='inline-flex items-center'>
                    <input
                      type='radio'
                      className='form-radio'
                      name='companyType'
                      value='business'
                      checked={newUser.companyType === 'business'}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          companyType: e.target.value,
                          company: '',
                        })
                      }
                    />
                    <span className='ml-2'>Empresa</span>
                  </label>
                </div>
                {newUser.companyType && (
                  <select
                    value={newUser.company}
                    onChange={(e) =>
                      setNewUser({ ...newUser, company: e.target.value })
                    }
                    className='p-2 border rounded w-full'
                  >
                    <option value=''>Seleccione una opción</option>
                    {newUser.companyType === 'businessGroup' &&
                      companyOptions.businessGroups.map((group: string) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    {newUser.companyType === 'association' &&
                      companyOptions.associations.map((association: string) => (
                        <option key={association} value={association}>
                          {association}
                        </option>
                      ))}
                    {newUser.companyType === 'business' &&
                      companyOptions.business.map((business: string) => (
                        <option key={business} value={business}>
                          {business}
                        </option>
                      ))}
                  </select>
                )}
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className='p-2 border rounded w-full'
                >
                  <option value=''>Seleccione un rol</option>
                  <option value='admin'>Administrador</option>
                  <option value='client'>Cliente</option>
                </select>
                <div className='flex justify-end space-x-2'>
                  <button
                    type='button'
                    onClick={() => setIsModalOpen(false)}
                    className='px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400'
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className={"flex flex-row gap-2 w-full"}>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Crear Usuario
        </button>
        <button
          onClick={handleUpdatePasswords}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <TriangleAlertIcon />
          {loading ? 'Reestableciendo...' : 'Reestablecer todas las contraseñas'}
        </button>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {successMessage && (
          <div className="text-green-500">{successMessage}</div>
        )}
        {!userLoading ? (
          <table className="min-w-full bg-white">
            <thead>
            <tr>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort('username')}
              >
                Username <SortIcon column="username" />
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort('fullName')}
              >
                Full Name <SortIcon column="fullName" />
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort('email')}
              >
                Email <SortIcon column="email" />
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort('phone')}
              >
                Phone <SortIcon column="phone" />
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort('role')}
              >
                Role <SortIcon column="role" />
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort('company')}
              >
                Company <SortIcon column="company" />
              </th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
            </thead>
            <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b text-center">
                  {user.username}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {user.fullName}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {user.email}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {user.phone}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {user.role}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {user.company}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="mr-2 p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Edit2Icon size={16} />
                  </button>
                  {user.username !== 'clagonjor' ? (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2Icon size={16} />
                    </button>) : null}
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
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className='bg-white w-1/3 p-5 rounded-lg shadow-xl'>
            <h3 className='text-lg font-bold mb-4'>Editar Usuario</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser();
              }}
              className='space-y-4'
            >
              <label className=' text-sm font-medium text-gray-700'>
                Usuario
              </label>
              <input
                type='text'
                value={editingUser.username}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, username: e.target.value })
                }
                className='p-2 border rounded mb-2 w-full'
                placeholder='Nombre de usuario'
              />
              <label className=' text-sm font-medium text-gray-700'>
                Contraseña
              </label>
              <input
                type='text'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='p-2 border rounded mb-4 w-full'
                placeholder='Nueva contraseña (dejar en blanco para no cambiar)'
              />
              <label className=' text-sm font-medium text-gray-700'>
                Nombre Completo
              </label>
              <input
                type='text'
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className='p-2 border rounded mb-4 w-full'
                placeholder='Nuevo nombre (dejar en blanco para no cambiar)'
              />
              <label className=' text-sm font-medium text-gray-700'>
                Teléfono
              </label>
              <input
                type='text'
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className='p-2 border rounded mb-4 w-full'
                placeholder='Nuevo número (dejar en blanco para no cambiar)'
              />
              <label className=' text-sm font-medium text-gray-700'>
                Correo Electrónico
              </label>
              <input
                type='text'
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className='p-2 border rounded mb-4 w-full'
                placeholder='Nuevo correo (dejar en blanco para no cambiar)'
              />
              <div className='flex justify-end'>
                <button
                  onClick={() => setEditingUser(null)}
                  className='px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 mr-2'
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
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
