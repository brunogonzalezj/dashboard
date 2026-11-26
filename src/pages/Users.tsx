import React, { useMemo, useState } from 'react';
import axios from 'axios';
import FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Copy,
  Download,
  KeyRound,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../interfaces/IUsers';
import { useUsers, useCompanyOptions, useCreateUser, useUpdateUser, useDeleteUser } from '../hooks/queries';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { cn } from '../lib/utils';

const ROLE_LABEL: Record<string, string> = { admin: 'Administrador', client: 'Cliente' };
const COMPANY_TYPES = [
  { value: 'businessGroup', label: 'Grupo empresarial' },
  { value: 'association', label: 'Asociación' },
  { value: 'business', label: 'Empresa' },
];
const EMPTY_USER = { username: '', companyType: '', company: '', role: '', email: '', phone: '', fullName: '' };

/** Usuario protegido: no se puede editar ni eliminar desde la interfaz */
const PROTECTED_USERNAME = 'clagonjor';

const Users: React.FC = () => {
  const { data: users = [], isLoading: userLoading } = useUsers();
  const { data: rawCompanyOptions } = useCompanyOptions();
  const companyOptions = useMemo(() => {
    if (!rawCompanyOptions) return { businessGroups: [], associations: [], business: [] };
    return {
      businessGroups: [...rawCompanyOptions.businessGroups].sort((a, b) => a.localeCompare(b)),
      associations: [...rawCompanyOptions.associations].sort((a, b) => a.localeCompare(b)),
      business: [...rawCompanyOptions.business].sort((a, b) => a.localeCompare(b)),
    };
  }, [rawCompanyOptions]);
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const { userRole, isAuthenticated } = useAuth();

  const [newUser, setNewUser] = useState(EMPTY_USER);
  const [createError, setCreateError] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);

  const fetchPasswords = async () => {
    setError('');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/get_passwords`, { withCredentials: true });
      const blob = new Blob([response.data.csv], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(blob, 'clients_passwords.csv');
    } catch (err) {
      console.error('Error fetching passwords:', err);
      setError('No se pudieron descargar las contraseñas. Intenta de nuevo.');
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    try {
      const result = await createUserMutation.mutateAsync(newUser);
      setNewUser(EMPTY_USER);
      setIsModalOpen(false);
      setCopied(false);
      setCreated({ username: result.username, password: result.password });
    } catch (err) {
      console.error('Error creating user:', err);
      setCreateError('No se pudo crear el usuario. Revisa que el nombre de usuario no exista ya.');
    }
  };

  const handleUpdatePasswords = async () => {
    const result = await Swal.fire({
      title: '¿Restablecer todas las contraseñas?',
      text: 'Se generan contraseñas nuevas para todos los clientes y se descarga un CSV con ellas. Las contraseñas actuales dejan de funcionar.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, restablecer',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: { confirmButton: 'is-danger' },
    });
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/update-passwords`, { withCredentials: true });
      const blob = new Blob([response.data.csv], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(blob, 'updated_clients_passwords.csv');
      await Swal.fire({ title: 'Contraseñas restablecidas', text: 'Se descargó el CSV con las contraseñas nuevas.', icon: 'success' });
    } catch (err) {
      console.error('Error al restablecer las contraseñas:', err);
      await Swal.fire({ title: 'No se pudieron restablecer', text: 'No se cambió ninguna contraseña. Intenta de nuevo.', icon: 'error' });
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

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updateData: Partial<User> & { password?: string } = { username: editingUser.username };
      if (newPassword) updateData.password = newPassword;
      if (newPhone) updateData.phone = newPhone;
      if (newEmail) updateData.email = newEmail;
      if (newFullName) updateData.fullName = newFullName;

      await updateUserMutation.mutateAsync({ id: editingUser.id, data: updateData });
      setEditingUser(null);
      setNewPassword('');
      await Swal.fire({ title: 'Usuario actualizado', icon: 'success', timer: 1600, showConfirmButton: false });
    } catch {
      await Swal.fire({ title: 'No se pudo actualizar', text: 'Los datos del usuario no cambiaron. Intenta de nuevo.', icon: 'error' });
    }
  };

  const handleDeleteUser = async (user: User) => {
    const result = await Swal.fire({
      title: `¿Eliminar a ${user.username}?`,
      text: 'El usuario pierde el acceso al panel. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: { confirmButton: 'is-danger' },
    });
    if (!result.isConfirmed) return;

    try {
      await deleteUserMutation.mutateAsync(user.id);
      await Swal.fire({ title: 'Usuario eliminado', icon: 'success', timer: 1600, showConfirmButton: false });
    } catch (err) {
      console.error('Error deleting user:', err);
      await Swal.fire({ title: 'No se pudo eliminar', text: 'El usuario sigue activo. Intenta de nuevo.', icon: 'error' });
    }
  };

  const handleSort = (key: keyof User) => {
    setSortConfig((prev) =>
      prev?.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' },
    );
  };

  const sortedUsers = useMemo(() => {
    const list = [...users];
    if (sortConfig) {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      list.sort((a, b) =>
        String(a[sortConfig.key] ?? '').localeCompare(String(b[sortConfig.key] ?? ''), 'es', { numeric: true, sensitivity: 'base' }) * dir,
      );
    }
    return list;
  }, [users, sortConfig]);

  const copyCredentials = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(`Usuario: ${created.username}\nContraseña: ${created.password}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (!isAuthenticated || userRole !== 'admin') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="dashboard-card max-w-sm text-center">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-[color:var(--text-muted)]" />
          <h1 className="section-title mb-1">Acceso restringido</h1>
          <p className="text-[color:var(--text-muted)]">Solo un administrador puede gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  const columns: { key: keyof User; label: string }[] = [
    { key: 'username', label: 'Usuario' },
    { key: 'email', label: 'Correo' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'password', label: 'Contraseña' },
    { key: 'role', label: 'Rol' },
    { key: 'company', label: 'Empresa' },
  ];

  const companyChoices =
    newUser.companyType === 'businessGroup'
      ? companyOptions.businessGroups
      : newUser.companyType === 'association'
        ? companyOptions.associations
        : newUser.companyType === 'business'
          ? companyOptions.business
          : [];

  const RowActions = ({ user }: { user: User }) =>
    user.username === PROTECTED_USERNAME ? (
      <span className="text-xs text-[color:var(--text-muted)]">Protegido</span>
    ) : (
      <div className="flex items-center gap-0.5">
        <button onClick={() => handleEditUser(user)} className="icon-btn" aria-label={`Editar a ${user.username}`} title="Editar">
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleDeleteUser(user)}
          className="icon-btn hover:!bg-red-50 hover:!text-red-700"
          aria-label={`Eliminar a ${user.username}`}
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">
            {users.length > 0 ? `${users.length} cuentas con acceso al panel` : 'Cuentas con acceso al panel'}
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap">
          <button onClick={handleUpdatePasswords} disabled={loading} className="btn-danger-outline">
            {loading ? <Spinner /> : <KeyRound className="h-4 w-4" />}
            {loading ? 'Restableciendo…' : 'Restablecer contraseñas'}
          </button>
          <button onClick={fetchPasswords} className="btn-secondary">
            <Download className="h-4 w-4" />
            Descargar contraseñas
          </button>
          <button
            onClick={() => {
              setCreateError('');
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Crear usuario
          </button>
        </div>
      </header>

      {error && (
        <p className="notice-error" role="alert">
          <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {error}
        </p>
      )}

      {created && (
        <div className="notice-success flex-col sm:flex-row sm:items-center" role="status">
          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 hidden sm:block" />
          <div className="flex-1">
            <p className="font-semibold">Usuario creado. Estos son sus datos de acceso:</p>
            <p className="mt-1 font-mono text-[13px]">
              {created.username} · {created.password}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyCredentials} className="btn-secondary btn-sm">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button onClick={() => setCreated(null)} className="icon-btn !h-9 !w-9" aria-label="Cerrar aviso">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {userLoading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : (
        <>
          {/* Computadora: tabla */}
          <div className="dashboard-card !p-0 hidden lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    {columns.map(({ key, label }) => {
                      const sorted = sortConfig?.key === key;
                      return (
                        <th key={key} aria-sort={sorted ? (sortConfig?.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                          <button type="button" className={cn('th-sort', sorted && 'text-[color:var(--text-strong)]')} onClick={() => handleSort(key)}>
                            {label}
                            {sorted ? (
                              sortConfig?.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                            )}
                          </button>
                        </th>
                      );
                    })}
                    <th><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <p className="font-medium text-[color:var(--text-strong)]">{user.username}</p>
                        <p className="text-xs text-[color:var(--text-muted)]">{user.fullName}</p>
                      </td>
                      <td className="text-[color:var(--text-muted)]">{user.email}</td>
                      <td className="tabular text-[color:var(--text-muted)]">{user.phone}</td>
                      <td className="font-mono text-[13px]">{user.password}</td>
                      <td>
                        <span className={user.role === 'admin' ? 'badge-admin' : 'badge-client'}>{ROLE_LABEL[user.role] ?? user.role}</span>
                      </td>
                      <td className="max-w-[220px] truncate" title={user.company ?? ''}>
                        {user.company || <span className="text-[color:var(--text-muted)]">—</span>}
                      </td>
                      <td className="!py-1.5 text-right"><RowActions user={user} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Celular y tablet: tarjetas */}
          <ul className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sortedUsers.map((user) => (
              <li key={user.id} className="dashboard-card !p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[color:var(--text-strong)]">{user.username}</p>
                    <p className="truncate text-[13px] text-[color:var(--text-muted)]">{user.fullName}</p>
                  </div>
                  <span className={user.role === 'admin' ? 'badge-admin' : 'badge-client'}>{ROLE_LABEL[user.role] ?? user.role}</span>
                </div>
                <dl className="mt-3 space-y-1.5 text-[13px]">
                  <div className="flex gap-2"><dt className="w-24 flex-shrink-0 text-[color:var(--text-muted)]">Correo</dt><dd className="min-w-0 truncate">{user.email}</dd></div>
                  <div className="flex gap-2"><dt className="w-24 flex-shrink-0 text-[color:var(--text-muted)]">Teléfono</dt><dd className="tabular">{user.phone || '—'}</dd></div>
                  <div className="flex gap-2"><dt className="w-24 flex-shrink-0 text-[color:var(--text-muted)]">Contraseña</dt><dd className="font-mono">{user.password}</dd></div>
                  <div className="flex gap-2"><dt className="w-24 flex-shrink-0 text-[color:var(--text-muted)]">Empresa</dt><dd className="min-w-0 truncate">{user.company || '—'}</dd></div>
                </dl>
                <div className="mt-2 -mb-1 flex justify-end -mr-2"><RowActions user={user} /></div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Crear usuario */}
      <Modal open={isModalOpen} title="Crear usuario" description="La contraseña se genera automáticamente." onClose={() => setIsModalOpen(false)}>
        <form onSubmit={createUser} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nu-username" className="form-label">Usuario</label>
              <input id="nu-username" type="text" autoComplete="off" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label htmlFor="nu-fullname" className="form-label">Nombre completo</label>
              <input id="nu-fullname" type="text" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label htmlFor="nu-email" className="form-label">Correo</label>
              <input id="nu-email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label htmlFor="nu-phone" className="form-label">Teléfono</label>
              <input id="nu-phone" type="tel" inputMode="tel" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className="input-field" required />
            </div>
          </div>

          <fieldset>
            <legend className="form-label">Rol</legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'admin', label: 'Administrador', hint: 'Ve y gestiona todo' },
                { value: 'client', label: 'Cliente', hint: 'Ve solo su empresa' },
              ].map((r) => (
                <label
                  key={r.value}
                  className={cn(
                    'cursor-pointer rounded-lg border px-3 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500',
                    newUser.role === r.value ? 'border-secondary-500 bg-secondary-50' : 'border-[#cfd5dd] hover:bg-[#f7f8fa]',
                  )}
                >
                  <input type="radio" name="role" value={r.value} checked={newUser.role === r.value} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="sr-only" required />
                  <span className="block text-sm font-semibold text-[color:var(--text-strong)]">{r.label}</span>
                  <span className="block text-xs text-[color:var(--text-muted)]">{r.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="form-label">Tipo de empresa</legend>
            <div className="flex flex-wrap gap-2">
              {COMPANY_TYPES.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'inline-flex h-9 cursor-pointer items-center rounded-full border px-3.5 text-[13px] font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500',
                    newUser.companyType === option.value
                      ? 'border-secondary-500 bg-secondary-50 text-[color:var(--text-strong)]'
                      : 'border-[#cfd5dd] text-[color:var(--text)] hover:bg-[#f7f8fa]',
                  )}
                >
                  <input
                    type="radio"
                    name="companyType"
                    value={option.value}
                    checked={newUser.companyType === option.value}
                    onChange={(e) => setNewUser({ ...newUser, companyType: e.target.value, company: '' })}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          {newUser.companyType && (
            <div>
              <label htmlFor="nu-company" className="form-label">
                {COMPANY_TYPES.find((c) => c.value === newUser.companyType)?.label}
              </label>
              <select id="nu-company" value={newUser.company} onChange={(e) => setNewUser({ ...newUser, company: e.target.value })} className="input-field" required>
                <option value="">Elige una opción</option>
                {companyChoices.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {createError && (
            <p className="notice-error" role="alert">
              <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
              {createError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={createUserMutation.isPending} className="btn-primary">
              {createUserMutation.isPending && <Spinner />}
              Crear usuario
            </button>
          </div>
        </form>
      </Modal>

      {/* Editar usuario */}
      <Modal open={editingUser !== null} title="Editar usuario" description={editingUser?.username} onClose={() => setEditingUser(null)}>
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label htmlFor="eu-username" className="form-label">Usuario</label>
              <input id="eu-username" type="text" value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label htmlFor="eu-password" className="form-label">Contraseña nueva</label>
              <input id="eu-password" type="text" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" placeholder="Déjala vacía para mantener la actual" />
            </div>
            <div>
              <label htmlFor="eu-fullname" className="form-label">Nombre completo</label>
              <input id="eu-fullname" type="text" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} className="input-field" required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="eu-phone" className="form-label">Teléfono</label>
                <input id="eu-phone" type="tel" inputMode="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label htmlFor="eu-email" className="form-label">Correo</label>
                <input id="eu-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="input-field" required />
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={updateUserMutation.isPending} className="btn-primary">
                {updateUserMutation.isPending && <Spinner />}
                Guardar cambios
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Users;
