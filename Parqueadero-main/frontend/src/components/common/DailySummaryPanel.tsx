import React from 'react';
import { TrendingUp } from 'lucide-react';
import { DailySummaryRow } from '../../utils/dateFilters';

interface DailySummaryPanelProps {
  title: string;
  rows: DailySummaryRow[];
  countLabel: string;
  /** Si se indica, se muestra la columna de total en dinero */
  totalLabel?: string;
}

/**
 * Resumen por día del período filtrado (análisis semanal del flujo).
 * Muestra una barra proporcional a la cantidad de cada día.
 */
export const DailySummaryPanel: React.FC<DailySummaryPanelProps> = ({ title, rows, countLabel, totalLabel }) => {
  if (rows.length === 0) return null;
  const max = Math.max(1, ...rows.map((r) => r.cantidad));
  const totalCount = rows.reduce((acc, r) => acc + r.cantidad, 0);
  const totalMoney = rows.reduce((acc, r) => acc + r.total, 0);
  const best = rows.reduce((b, r) => (r.cantidad > b.cantidad ? r : b), rows[0]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          {title}
        </h3>
        <p className="text-[11px] text-slate-400">
          Total: <strong className="text-slate-200">{totalCount}</strong> {countLabel.toLowerCase()}
          {totalLabel && (
            <>
              {' '}· <strong className="text-amber-400">${totalMoney.toLocaleString()}</strong>
            </>
          )}
          {best.cantidad > 0 && (
            <>
              {' '}· Día de mayor flujo: <strong className="text-sky-400">{best.dia} {best.fechaTexto}</strong>
            </>
          )}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3">Día</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">{countLabel}</th>
              {totalLabel && <th className="p-3">{totalLabel}</th>}
              <th className="p-3 w-1/3">Flujo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rows.map((r) => (
              <tr key={r.fecha} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3 font-semibold text-slate-200">{r.dia}</td>
                <td className="p-3 font-mono text-slate-400">{r.fechaTexto}</td>
                <td className="p-3 font-bold text-slate-100">{r.cantidad}</td>
                {totalLabel && <td className="p-3 font-bold text-amber-400">${r.total.toLocaleString()}</td>}
                <td className="p-3">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(r.cantidad / max) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
