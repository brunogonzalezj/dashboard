import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { DataItem } from '../interfaces/IData';
import { User } from '../interfaces/IUsers';

// ── Query hooks ──────────────────────────────────────────────────────────────

export const useDashboardData = () =>
  useQuery<DataItem[]>({
    queryKey: ['dashboardData'],
    queryFn: () => api.get('/data/dashboard-data').then((r) => r.data),
  });

export const useUploadDate = () =>
  useQuery<{ uploadDate: string }>({
    queryKey: ['uploadDate'],
    queryFn: () => api.get('/data/get-upload-date').then((r) => r.data),
  });

export const useHistoryData = () =>
  useQuery<DataItem[]>({
    queryKey: ['historyData'],
    queryFn: () => api.get('/data/history-dashboard-data').then((r) => r.data),
  });

export const useUsers = () =>
  useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  });

export const useCompanyOptions = () =>
  useQuery<{ businessGroups: string[]; associations: string[]; business: string[] }>({
    queryKey: ['companyOptions'],
    queryFn: () => api.get('/data/company-options').then((r) => r.data),
  });

export const useFormStatus = () =>
  useQuery<{ habilitado: boolean }>({
    queryKey: ['formStatus'],
    queryFn: () => api.get('/data/form-status').then((r) => r.data),
  });

export const useCursos = () =>
  useQuery<{ id: number; nombre: string; activo: boolean }[]>({
    queryKey: ['cursos'],
    queryFn: () => api.get('/data/cursos').then((r) => r.data),
  });

// ── Mutation hooks ───────────────────────────────────────────────────────────

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: object) => api.post('/users', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) =>
      api.put(`/users/update-user/${id}`, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/users/delete-user/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useToggleFormStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { habilitado: boolean }) =>
      api.put('/data/form-status', body).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formStatus'] }),
  });
};

export const useToggleCurso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { cursoId: number; activo: boolean }) =>
      api.put('/data/cursos/toggle', body).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cursos'] }),
  });
};

export const useMigrate = () =>
  useMutation({
    mutationFn: () => api.get('/data/migrate').then((r) => r.data),
  });
