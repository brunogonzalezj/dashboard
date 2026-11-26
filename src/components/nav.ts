import { FileSpreadsheet, LayoutDashboard, Users } from 'lucide-react';

/** Secciones de la navegación principal (barra lateral y barra superior en celular) */
export const NAV = [
  { to: '/',           icon: LayoutDashboard, label: 'Panel de cursos' },
  { to: '/users',      icon: Users,           label: 'Usuarios',           adminOnly: true },
  { to: '/csv-upload', icon: FileSpreadsheet, label: 'Datos y formulario', adminOnly: true },
];
