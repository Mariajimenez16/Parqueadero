import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Car,
  Grid,
  QrCode,
  CalendarCheck,
  CircleDollarSign,
  Receipt,
  BarChart3,
  History,
  FileCheck2,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const links = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'VIGILANTE', 'CAJERO', 'USUARIO'],
    },
    {
      to: '/movements',
      label: 'Control de Acceso / QR',
      icon: QrCode,
      roles: ['ADMIN', 'VIGILANTE'],
    },
    {
      to: '/spaces',
      label: 'Mapa de Espacios',
      icon: Grid,
      roles: ['ADMIN', 'VIGILANTE', 'CAJERO', 'USUARIO'],
    },
    {
      to: '/payments',
      label: 'Gestión de Pagos',
      icon: CircleDollarSign,
      roles: ['ADMIN', 'CAJERO'],
    },
    {
      to: '/reservations',
      label: 'Reservas',
      icon: CalendarCheck,
      roles: ['ADMIN', 'USUARIO'],
    },
    {
      to: '/vehicles',
      label: 'Vehículos',
      icon: Car,
      roles: ['ADMIN', 'VIGILANTE', 'USUARIO'],
    },
    {
      to: '/users',
      label: 'Usuarios y Roles',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      to: '/tariffs',
      label: 'Config. Tarifas',
      icon: Receipt,
      roles: ['ADMIN'],
    },
    {
      to: '/reports',
      label: 'Reportes y Exportación',
      icon: BarChart3,
      roles: ['ADMIN'],
    },
    {
      to: '/audit',
      label: 'Auditoría del Sistema',
      icon: History,
      roles: ['ADMIN'],
    },
  ];

  const allowedLinks = links.filter((link) => link.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Módulos Principales
        </div>
        {allowedLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-sky-600/10 text-sky-400 border border-sky-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        <p className="font-medium text-slate-400">Sistemas Empresariales</p>
        <p className="mt-0.5">Versión 1.0.0 — Final 2026</p>
      </div>
    </aside>
  );
};
