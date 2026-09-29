import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tariff } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { Receipt, Plus, Edit, DollarSign, Check, X } from 'lucide-react';

export const TariffsPage: React.FC = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);

  const [formData, setFormData] = useState({
    userType: 'ESTUDIANTE',
    vehicleType: 'AUTOMOVIL',
    valorHora: 2500,
    valorMinimo: 2000,
    valorMaximo: 15000,
    estado: true,
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchTariffs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tariffs');
      setTariffs(res.data);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const handleOpenCreate = () => {
    setSelectedTariff(null);
    setFormData({
      userType: 'ESTUDIANTE',
      vehicleType: 'AUTOMOVIL',
      valorHora: 2500,
      valorMinimo: 2000,
      valorMaximo: 15000,
      estado: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Tariff) => {
    setSelectedTariff(t);
    setFormData({
      userType: t.userType,
      vehicleType: t.vehicleType,
      valorHora: t.valorHora,
      valorMinimo: t.valorMinimo,
      valorMaximo: t.valorMaximo || 0,
      estado: t.estado,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTariff) {
        await api.put(`/tariffs/${selectedTariff.id}`, formData);
        setToast({ type: 'success', message: 'Tarifa actualizada exitosamente.' });
      } else {
        await api.post('/tariffs', formData);
        setToast({ type: 'success', message: 'Tarifa configurada exitosamente.' });
      }
      setIsModalOpen(false);
      fetchTariffs();
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
            <Receipt className="w-6 h-6 text-sky-400" />
            Configuración de Tarifas del Parqueadero
          </h1>
          <p className="text-xs text-slate-400">
            Valores configurables por hora, mínimo y máximo según tipo de usuario y vehículo
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-sky-900/30 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Configurar Nueva Tarifa</span>
        </button>
      </div>

      {/* Grid de Tarifas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500">
            Cargando tarifas...
          </div>
        ) : (
          tariffs.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3 shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <span className="text-xs font-bold text-sky-400">{t.userType}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 rounded text-slate-300 font-semibold">
                    {t.vehicleType}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-2xl font-extrabold text-slate-100">
                    ${t.valorHora.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ hora</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Valor Mínimo: <strong className="text-slate-200">${t.valorMinimo.toLocaleString()}</strong>
                  </p>
                  {t.valorMaximo && (
                    <p className="text-xs text-slate-400">
                      Tope Máximo Detección: <strong className="text-slate-200">${t.valorMaximo.toLocaleString()}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.estado ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                  {t.estado ? 'VIGENTE' : 'INACTIVA'}
                </span>

                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors flex items-center gap-1 text-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTariff ? 'Modificar Tarifa' : 'Configurar Tarifa'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Tipo de Usuario</label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              >
                <option value="ESTUDIANTE">ESTUDIANTE</option>
                <option value="DOCENTE">DOCENTE</option>
                <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                <option value="VISITANTE">VISITANTE</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Tipo de Vehículo</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
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
              <label className="block text-slate-300 mb-1">Valor Hora ($)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.valorHora}
                onChange={(e) => setFormData({ ...formData, valorHora: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Valor Mínimo ($)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.valorMinimo}
                onChange={(e) => setFormData({ ...formData, valorMinimo: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Valor Máximo / Tope ($)</label>
              <input
                type="number"
                min="0"
                value={formData.valorMaximo}
                onChange={(e) => setFormData({ ...formData, valorMaximo: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-sky-900/30 text-xs mt-2"
          >
            Guardar Configuración de Tarifa
          </button>
        </form>
      </Modal>
    </div>
  );
};
