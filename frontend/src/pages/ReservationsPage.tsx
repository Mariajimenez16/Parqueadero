import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Reservation, User, Vehicle, Space } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { CalendarCheck, Plus, Calendar, Clock, Car, Grid, XCircle } from 'lucide-react';

export const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    userId: '',
    vehicleId: '',
    spaceId: '',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '08:00',
    horaFin: '12:00',
    observaciones: '',
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, uRes, vRes, sRes] = await Promise.all([
        api.get('/reservations', { params: { status: statusFilter } }),
        api.get('/users'),
        api.get('/vehicles'),
        api.get('/spaces', { params: { estado: 'DISPONIBLE' } }),
      ]);
      setReservations(rRes.data);
      setUsers(uRes.data);
      setVehicles(vRes.data);
      setSpaces(sRes.data);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleOpenCreate = () => {
    setFormData({
      userId: users[0]?.id || '',
      vehicleId: vehicles[0]?.id || '',
      spaceId: spaces[0]?.id || '',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '08:00',
      horaFin: '12:00',
      observaciones: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startIso = `${formData.fecha}T${formData.horaInicio}:00Z`;
      const endIso = `${formData.fecha}T${formData.horaFin}:00Z`;

      await api.post('/reservations', {
        userId: formData.userId,
        vehicleId: formData.vehicleId,
        spaceId: formData.spaceId,
        fecha: formData.fecha,
        horaInicio: startIso,
        horaFin: endIso,
        observaciones: formData.observaciones,
      });

      setToast({ type: 'success', message: 'Reserva confirmada exitosamente.' });
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.patch(`/reservations/${id}/cancel`);
      setToast({ type: 'success', message: 'Reserva cancelada exitosamente.' });
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
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
            <CalendarCheck className="w-6 h-6 text-sky-400" />
            Gestión de Reservas
          </h1>
          <p className="text-xs text-slate-400">
            Reserva de espacios con control estricto anti-solapamientos y disponibilidad
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-sky-900/30 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nueva Reserva</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-xs">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
        >
          <option value="">Todas las Reservas</option>
          <option value="CONFIRMADA">CONFIRMADA</option>
          <option value="ACTIVA">ACTIVA</option>
          <option value="CANCELADA">CANCELADA</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">Vehículo</th>
                <th className="p-4">Espacio Reservado</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Horario (Inicio - Fin)</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Cargando reservas...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No se encontraron reservas registradas.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-100">
                        {r.user?.nombre} {r.user?.apellidos}
                      </div>
                      <div className="text-[10px] text-slate-400">{r.user?.correo}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-sky-400">{r.vehicle?.placa}</span>
                      <div className="text-[10px] text-slate-400">
                        {r.vehicle?.marca} {r.vehicle?.modelo}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-amber-400">
                        {r.space?.codigo}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-200">
                      {new Date(r.fecha).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {new Date(r.horaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(r.horaFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <Badge status={r.estado} />
                    </td>
                    <td className="p-4 text-right">
                      {r.estado === 'CONFIRMADA' && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelar</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Reserva */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Reserva de Espacio">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Usuario</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellidos} — Doc: {u.documento}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Vehículo Autorizado</label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.marca} {v.modelo} ({v.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Espacio Disponible</label>
            <select
              value={formData.spaceId}
              onChange={(e) => setFormData({ ...formData, spaceId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
            >
              {spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.codigo} ({s.tipo} — {s.zona})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Hora Inicio</label>
              <input
                type="time"
                required
                value={formData.horaInicio}
                onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Hora Fin</label>
              <input
                type="time"
                required
                value={formData.horaFin}
                onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Observaciones</label>
            <input
              type="text"
              placeholder="Ej: Reserva para jornada académica"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-sky-900/30 text-xs mt-2"
          >
            Confirmar Reserva
          </button>
        </form>
      </Modal>
    </div>
  );
};
