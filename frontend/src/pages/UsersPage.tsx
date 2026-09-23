import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { Users, UserPlus, Search, Shield, Lock, Unlock, Edit, Eye, Filter } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    documento: '',
    correo: '',
    telefono: '',
    password: '',
    userType: 'ESTUDIANTE',
    role: 'USUARIO',
    status: 'ACTIVO',
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: { search, role: roleFilter, status: statusFilter },
      });
      setUsers(res.data);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setFormData({
      nombre: '',
      apellidos: '',
      documento: '',
      correo: '',
      telefono: '',
      password: '',
      userType: 'ESTUDIANTE',
      role: 'USUARIO',
      status: 'ACTIVO',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      apellidos: user.apellidos,
      documento: user.documento,
      correo: user.correo,
      telefono: user.telefono,
      password: '',
      userType: user.userType,
      role: user.role,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser.id}`, formData);
        setToast({ type: 'success', message: 'Usuario actualizado exitosamente.' });
      } else {
        await api.post('/users', formData);
        setToast({ type: 'success', message: 'Usuario registrado exitosamente.' });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleToggleStatus = async (userId: string, newStatus: string) => {
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus });
      setToast({
        type: 'success',
        message: `Estado del usuario cambiado a ${newStatus} exitosamente.`,
      });
      fetchUsers();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-400" />
            Administración de Usuarios y Roles
          </h1>
          <p className="text-xs text-slate-400">
            Gestión completa de estudiantes, docentes, administrativos y personal operativo
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-sky-900/30 w-fit"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Nuevo Usuario</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por Nombre, Documento o Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 pl-10 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
        >
          <option value="">Todos los Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="VIGILANTE">VIGILANTE</option>
          <option value="CAJERO">CAJERO</option>
          <option value="USUARIO">USUARIO</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
        >
          <option value="">Todos los Estados</option>
          <option value="ACTIVO">ACTIVO</option>
          <option value="BLOQUEADO">BLOQUEADO</option>
          <option value="INACTIVO">INACTIVO</option>
        </select>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">Documento</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Rol Sistema</th>
                <th className="p-4">Vehículos</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-100">
                        {user.nombre} {user.apellidos}
                      </div>
                      <div className="text-[11px] text-slate-400">{user.correo}</div>
                    </td>
                    <td className="p-4 font-mono">{user.documento}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-medium">
                        {user.userType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-sky-400">{user.role}</span>
                    </td>
                    <td className="p-4">
                      {user.vehicles && user.vehicles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.vehicles.map((v) => (
                            <span
                              key={v.id}
                              className="px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-[10px] font-mono text-slate-300"
                            >
                              {v.placa}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Sin vehículos</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge status={user.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Editar"
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {user.status === 'BLOQUEADO' ? (
                          <button
                            onClick={() => handleToggleStatus(user.id, 'ACTIVO')}
                            title="Desbloquear Usuario"
                            className="p-1.5 hover:bg-emerald-950 text-emerald-400 rounded-lg transition-colors"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(user.id, 'BLOQUEADO')}
                            title="Bloquear Usuario"
                            className="p-1.5 hover:bg-red-950 text-red-400 rounded-lg transition-colors"
                          >
                            <Lock className="w-4 h-4" />
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

      {/* Modal Crear/Editar Usuario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Nombre(s)</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Apellidos</label>
              <input
                type="text"
                required
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Documento Identidad</label>
              <input
                type="text"
                required
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Teléfono</label>
              <input
                type="text"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">
              Contraseña {selectedUser && '(Dejar en blanco para no cambiar)'}
            </label>
            <input
              type="password"
              required={!selectedUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Tipo Usuario</label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-100"
              >
                <option value="ESTUDIANTE">ESTUDIANTE</option>
                <option value="DOCENTE">DOCENTE</option>
                <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                <option value="VISITANTE">VISITANTE</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Rol Sistema</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-100"
              >
                <option value="USUARIO">USUARIO</option>
                <option value="ADMIN">ADMIN</option>
                <option value="VIGILANTE">VIGILANTE</option>
                <option value="CAJERO">CAJERO</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-100"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="BLOQUEADO">BLOQUEADO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-sky-900/30 text-xs mt-2"
          >
            {selectedUser ? 'Guardar Cambios' : 'Registrar Usuario'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
