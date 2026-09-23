import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Vehicle, User } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { QRGeneratorModal } from '../components/common/QRGeneratorModal';
import { Car, Plus, Search, QrCode, ShieldCheck, ShieldAlert, Edit, User as UserIcon } from 'lucide-react';

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [qrModalVehicle, setQrModalVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    placa: '',
    type: 'AUTOMOVIL',
    marca: '',
    modelo: '',
    color: '',
    userId: '',
    status: 'AUTORIZADO',
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, uRes] = await Promise.all([
        api.get('/vehicles', { params: { search, type: typeFilter, status: statusFilter } }),
        api.get('/users'),
      ]);
      setVehicles(vRes.data);
      setUsers(uRes.data);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, typeFilter, statusFilter]);

  const handleOpenCreate = () => {
    setSelectedVehicle(null);
    setFormData({
      placa: '',
      type: 'AUTOMOVIL',
      marca: '',
      modelo: '',
      color: '',
      userId: users[0]?.id || '',
      status: 'AUTORIZADO',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setSelectedVehicle(v);
    setFormData({
      placa: v.placa,
      type: v.type,
      marca: v.marca,
      modelo: v.modelo,
      color: v.color,
      userId: v.userId,
      status: v.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedVehicle) {
        await api.put(`/vehicles/${selectedVehicle.id}`, formData);
        setToast({ type: 'success', message: 'Vehículo actualizado exitosamente.' });
      } else {
        await api.post('/vehicles', formData);
        setToast({ type: 'success', message: 'Vehículo registrado exitosamente.' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleToggleAuth = async (vehicleId: string, newStatus: string) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/authorization`, { status: newStatus });
      setToast({
        type: 'success',
        message: `Estado de autorización cambiado a ${newStatus} exitosamente.`,
      });
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
            <Car className="w-6 h-6 text-sky-400" />
            Gestión de Vehículos y Tarjetas QR
          </h1>
          <p className="text-xs text-slate-400">
            Registro, autorización y carnetización por código QR para automóviles y motocicletas
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-sky-900/30 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Vehículo</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por Placa, Marca, Modelo o Propietario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 pl-10 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
        >
          <option value="">Todos los Tipos de Vehículo</option>
          <option value="AUTOMOVIL">AUTOMOVIL</option>
          <option value="MOTOCICLETA">MOTOCICLETA</option>
          <option value="BICICLETA">BICICLETA</option>
          <option value="ELECTRICO">ELECTRICO</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
        >
          <option value="">Todos los Estados de Autorización</option>
          <option value="AUTORIZADO">AUTORIZADO</option>
          <option value="NO_AUTORIZADO">NO AUTORIZADO</option>
          <option value="INACTIVO">INACTIVO</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Placa / Tipo</th>
                <th className="p-4">Marca y Modelo</th>
                <th className="p-4">Color</th>
                <th className="p-4">Propietario</th>
                <th className="p-4">Estado Recinto</th>
                <th className="p-4">Autorización</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Cargando vehículos...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No se encontraron vehículos registrados.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-base font-extrabold text-sky-400 tracking-wider">
                        {v.placa}
                      </span>
                      <div className="text-[10px] text-slate-400 font-semibold">{v.type}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-100">{v.marca}</div>
                      <div className="text-[11px] text-slate-400">{v.modelo}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-300">{v.color}</td>
                    <td className="p-4">
                      {v.user ? (
                        <div>
                          <div className="font-medium text-slate-200">
                            {v.user.nombre} {v.user.apellidos}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Doc: {v.user.documento} ({v.user.userType})
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">Sin propietario</span>
                      )}
                    </td>
                    <td className="p-4">
                      {v.movements && v.movements.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          DENTRO ({v.movements[0].space?.codigo})
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Fuera del recinto</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge status={v.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setQrModalVehicle(v)}
                          title="Ver / Generar Código QR"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-colors border border-slate-700"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(v)}
                          title="Editar"
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {v.status === 'AUTORIZADO' ? (
                          <button
                            onClick={() => handleToggleAuth(v.id, 'NO_AUTORIZADO')}
                            title="Revocar Autorización"
                            className="p-1.5 hover:bg-red-950 text-red-400 rounded-lg transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleAuth(v.id, 'AUTORIZADO')}
                            title="Autorizar Vehículo"
                            className="p-1.5 hover:bg-emerald-950 text-emerald-400 rounded-lg transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar Vehículo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedVehicle ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Placa del Vehículo</label>
              <input
                type="text"
                required
                placeholder="Ej: KLR-456"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono tracking-wider text-sm uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Tipo de Vehículo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
              >
                <option value="AUTOMOVIL">AUTOMOVIL</option>
                <option value="MOTOCICLETA">MOTOCICLETA</option>
                <option value="BICICLETA">BICICLETA</option>
                <option value="ELECTRICO">ELECTRICO</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Marca</label>
              <input
                type="text"
                required
                placeholder="Ej: Mazda"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Modelo</label>
              <input
                type="text"
                required
                placeholder="Ej: 3 Sedan"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Color</label>
              <input
                type="text"
                required
                placeholder="Ej: Rojo"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Usuario Propietario</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellidos} — Doc: {u.documento} ({u.userType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Estado de Autorización</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
            >
              <option value="AUTORIZADO">AUTORIZADO</option>
              <option value="NO_AUTORIZADO">NO AUTORIZADO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-sky-900/30 text-xs mt-2"
          >
            {selectedVehicle ? 'Guardar Cambios' : 'Registrar Vehículo'}
          </button>
        </form>
      </Modal>

      {/* Modal QR Code */}
      <QRGeneratorModal
        isOpen={!!qrModalVehicle}
        onClose={() => setQrModalVehicle(null)}
        vehicle={qrModalVehicle}
      />
    </div>
  );
};
