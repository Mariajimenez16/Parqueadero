import React from 'react';
import { Calendar } from 'lucide-react';
import {
  DateFilterMode,
  DateFilterValue,
  DATE_FILTER_LABELS,
  resolveDateRange,
} from '../../utils/dateFilters';

interface DateRangeFilterProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
  /** Accesos rápidos a mostrar (por defecto todos) */
  presets?: DateFilterMode[];
  /** Texto a la izquierda del filtro */
  title?: string;
}

const DEFAULT_PRESETS: DateFilterMode[] = ['all', 'today', 'yesterday', 'week', 'last7', 'month', 'day', 'range'];

/**
 * Filtro de fechas reutilizable: accesos rápidos (Hoy, Ayer, Semana...),
 * selección de un día específico o de un rango Desde / Hasta.
 */
export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  title = 'Filtrar por fecha:',
}) => {
  const resolved = resolveDateRange(value);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          {title}
        </span>
        <div className="flex flex-wrap p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs gap-0.5">
          {presets.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ ...value, mode })}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                value.mode === mode ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {DATE_FILTER_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      {value.mode === 'day' && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Día:</span>
          <input
            type="date"
            value={value.day}
            onChange={(e) => onChange({ ...value, day: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-200"
          />
        </div>
      )}

      {value.mode === 'range' && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Desde:</span>
          <input
            type="date"
            value={value.from}
            max={value.to || undefined}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-200"
          />
          <span className="text-slate-400">Hasta:</span>
          <input
            type="date"
            value={value.to}
            min={value.from || undefined}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-200"
          />
        </div>
      )}

      <p className="text-[11px] text-slate-500">
        Mostrando: <span className="text-slate-300 font-medium">{resolved.label}</span>
      </p>
    </div>
  );
};
