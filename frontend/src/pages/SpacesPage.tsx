import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Space } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import {
  Grid,
  Car,
  Bike,
  Star,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  Clock,
  Filter,
  RefreshCw,
  Plus,
} from 'lucide-react';

export const SpacesPage: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [zonaFilter, setZonaFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { hasRole } = useAuth();

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const [sRes, sumRes] = await Promise.all([
        api.get('/spaces', { params: { zona: zonaFilter, tipo: tipoFilter, estado: estadoFilter } }),
        api.get('/spaces/summary'),
      ]);
      setSpaces(sRes.data);
      setSummary(sumRes.data);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [zonaFilter, tipoFilter, estadoFilter]);

  const handleOpenStatusModal = (space: Space) => {
    if (!hasRole('ADMIN')) return;
    setSelectedSpace(space);
    setNewStatus(space.estado);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace) return;

    try {
      await api.patch(`/spaces/${selectedSpace.id}/status`, { estado: newStatus });
      setToast({ type: 'success', message: `Estado del espacio ${selectedSpace.codigo} actualizado.` });
      setIsStatusModalOpen(false);
      fetchSpaces();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const getSpaceCardStyle = (estado: string) => {
    switch (estado) {
      case 'DISPONIBLE':
        return 'bg-emerald-950/40 border-emerald-800/80 hover:border-emerald-500 text-emerald-300';
      case 'OCUPADO':
        return 'bg-red-950/40 border-red-800/80 hover:border-red-500 text-red-300';
      case 'RESERVADO':
        return 'bg-amber-950/40 border-amber-800/80 hover:border-amber-500 text-amber-300';
      case 'MANTENIMIENTO':
        return 'bg-orange-950/40 border-orange-800/80 hover:border-orange-500 text-orange-300';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-400';
    }
  };

  const getSpaceIcon = (tipo: string) => {
    switch (tipo) {
      case 'MOTOCICLETA':
        return <Bike className="w-5 h-5" />;
      case 'PREFERENCIAL':
        return <Star className="w-5 h-5 text-amber-400" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Grid className="w-6 h-6 text-sky-400" />
            Mapa Interactivo de Parqueadero
          </h1>
          <p className="text-xs text-slate-400">
            Vista tipo Grid en tiempo real con indicador visual y etiquetas de accesibilidad
          </p>
        </div>

        <button
          onClick={fetchSpaces}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refrescar Mapa</span>
        </button>
      </div>

      {/* Indicadores Leyenda */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-900 border border-emerald-800/50 p-3 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold text-emerald-400">🟢 Disponibles</p>
            <p className="text-xl font-extrabold text-slate-100 mt-0.5">{summary.disponibles}</p>
          </div>
          <div className="bg-slate-900 border border-red-800/50 p-3 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold text-red-400">🔴 Ocupados</p>
            <p className="text-xl font-extrabold text-slate-100 mt-0.5">{summary.ocupados}</p>
          </div>
          <div className="bg-slate-900 border border-amber-800/50 p-3 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold text-amber-400">🟡 Reservados</p>
            <p className="text-xl font-extrabold text-slate-100 mt-0.5">{summary.reservados}</p>
          </div>
          <div className="bg-slate-900 border border-orange-800/50 p-3 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold text-orange-400">⚠️ Mantenimiento</p>
            <p className="text-xl font-extrabold text-slate-100 mt-0.5">{summary.mantenimiento}</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
            <p className="text-[10px] uppercase font-bold text-sky-400">📊 Capacidad Total</p>
            <p className="text-xl font-extrabold text-slate-100 mt-0.5">{summary.total}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
        >
          <option value="">Todos los Tipos (Autos / Motos / Preferencial)</option>
          <option value="AUTOMOVIL">AUTOMOVIL</option>
          <option value="MOTOCICLETA">MOTOCICLETA</option>
          <option value="PREFERENCIAL">PREFERENCIAL</option>
        </select>

        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
        >
          <option value="">Todos los Estados</option>
          <option value="DISPONIBLE">DISPONIBLE</option>
          <option value="OCUPADO">OCUPADO</option>
          <option value="RESERVADO">RESERVADO</option>
          <option value="MANTENIMIENTO">MANTENIMIENTO</option>
        </select>

        <input
          type="text"
          placeholder="Filtrar por Zona..."
          value={zonaFilter}
          onChange={(e) => setZonaFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Grid Interactivo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500">
            Cargando espacios del mapa...
          </div>
        ) : spaces.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500">
            No hay espacios que coincidan con el filtro seleccionando.
          </div>
        ) : (
          spaces.map((space) => {
            const activeMov = space.movements && space.movements.length > 0 ? space.movements[0] : null;

            return (
              <div
                key={space.id}
                onClick={() => handleOpenStatusModal(space)}
                className={`border rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer shadow-lg hover:scale-[1.02] ${getSpaceCardStyle(
                  space.estado,
                )}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-base font-extrabold tracking-wider">
                      {space.codigo}
                    </span>
                    {getSpaceIcon(space.tipo)}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mb-2">{space.zona}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <Badge status={space.estado} size="sm" />

                  {activeMov && (
                    <div className="mt-1 bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-[10px] space-y-0.5">
                      <p className="font-mono font-bold text-sky-400">
                        {activeMov.vehicle?.placa}
                      </p>
                      <p className="text-slate-300 truncate">
                        {activeMov.vehicle?.user?.nombre} {activeMov.vehicle?.user?.apellidos}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Cambiar Estado de Espacio */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Gestión de Espacio ${selectedSpace?.codigo}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div>
            <p className="text-slate-400 mb-2">
              Tipo: <strong className="text-slate-200">{selectedSpace?.tipo}</strong> | Zona:{' '}
              <strong className="text-slate-200">{selectedSpace?.zona}</strong>
            </p>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Cambiar Estado del Espacio</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-semibold"
            >
              <option value="DISPONIBLE">🟢 DISPONIBLE</option>
              <option value="OCUPADO">🔴 OCUPADO</option>
              <option value="RESERVADO">🟡 RESERVADO</option>
              <option value="MANTENIMIENTO">⚠️ MANTENIMIENTO</option>
              <option value="INACTIVO">⚪ INACTIVO</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-sky-900/30 text-xs"
          >
            Actualizar Estado del Espacio
          </button>
        </form>
      </Modal>
    </div>
  );
};
