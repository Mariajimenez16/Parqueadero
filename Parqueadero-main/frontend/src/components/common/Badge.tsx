import React from 'react';

interface BadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, label, size = 'md' }) => {
  const getStyle = (st: string) => {
    switch (st.toUpperCase()) {
      case 'DISPONIBLE':
      case 'AUTORIZADO':
      case 'ACTIVO':
      case 'PAGADO':
      case 'CONFIRMADA':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800/60 icon-emerald';
      case 'OCUPADO':
      case 'BLOQUEADO':
      case 'DENTRO':
      case 'NO_AUTORIZADO':
      case 'FALLIDO':
        return 'bg-red-950 text-red-400 border-red-800/60 icon-red';
      case 'RESERVADO':
      case 'PENDIENTE':
        return 'bg-amber-950 text-amber-400 border-amber-800/60 icon-amber';
      case 'MANTENIMIENTO':
        return 'bg-orange-950 text-orange-400 border-orange-800/60 icon-orange';
      case 'INACTIVO':
      case 'FINALIZADA':
      case 'FINALIZADO':
      case 'CANCELADA':
        return 'bg-slate-800 text-slate-400 border-slate-700 icon-slate';
      default:
        return 'bg-sky-950 text-sky-400 border-sky-800/60 icon-sky';
    }
  };

  const text = label || status;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeClasses} ${getStyle(
        status,
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {text}
    </span>
  );
};
