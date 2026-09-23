import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuditLog } from '../types';
import { History, Search, User as UserIcon, Shield, Clock } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit', { params: { search } });
      setLogs(res.data);
    } catch (err) {
      console.error('Error al cargar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-sky-400" />
            Auditoría y Trazabilidad de Operaciones
          </h1>
          <p className="text-xs text-slate-400">
            Registro cronológico e inmutable de acciones críticas (entradas, salidas, pagos, bloqueos, cambios de tarifas)
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por Acción, Usuario o Detalles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 pl-10 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Fecha / Hora</th>
                <th className="p-4">Usuario Operador</th>
                <th className="p-4">Acción Ejecutada</th>
                <th className="p-4">Entidad Afectada</th>
                <th className="p-4">Detalles de Trazabilidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Cargando registros de auditoría...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No existen registros de auditoría que coincidan.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {log.user ? (
                        <div className="font-sans">
                          <span className="font-semibold text-slate-200">
                            {log.user.nombre} {log.user.apellidos}
                          </span>
                          <span className="text-[10px] text-sky-400 font-mono ml-2">[{log.user.role}]</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Sistema Automático</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-sky-400">{log.accion}</td>
                    <td className="p-4 text-slate-300">{log.entidad}</td>
                    <td className="p-4 text-slate-400 font-sans">{log.detalles || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
