import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'VIGILANTE':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'CAJERO':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-sky-950 text-sky-300 border-sky-800';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'VIGILANTE':
        return 'Vigilante';
      case 'CAJERO':
        return 'Cajero';
      case 'USUARIO':
        return 'Usuario';
      default:
        return role || '';
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Logotipo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-900/30">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-base leading-tight flex items-center gap-2">
            PARQUEADERO UNISISTEMAS
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 tracking-wider">
              Empresarial
            </span>
          </h1>
          <p className="text-xs text-slate-400">Campus Central Privado</p>
        </div>
      </div>

      {/* Información del usuario */}
      {user && (
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-200">
              {user.nombre} {user.apellidos}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRoleBadgeStyle(user.role)}`}
              >
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          {/* Avatar inicial */}
          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-sm">
            {user.nombre.charAt(0).toUpperCase()}
          </div>

          {/* Botón cerrar sesión */}
          <button
            onClick={logout}
            title="Cerrar Sesión"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
