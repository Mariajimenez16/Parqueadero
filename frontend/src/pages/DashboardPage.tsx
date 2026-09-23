import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import {
  Car,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Grid,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6'];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Auto-refresh cada 30 seg
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
        <span>Cargando datos del parqueadero...</span>
      </div>
    );
  }

  const overview = stats?.overview;

  return (
    <div className="space-y-6">
      {/* Header Titulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard Operativo</h1>
          <p className="text-xs text-slate-400">
            Métricas e indicadores en tiempo real de ocupación e ingresos
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ocupación Actual
            </span>
            <div className="w-9 h-9 bg-sky-950/80 border border-sky-800 rounded-xl flex items-center justify-center text-sky-400">
              <Grid className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-100">
              {overview?.porcentajeOcupacion}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {overview?.ocupados} / {overview?.totalEspacios} Espacios
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overview?.porcentajeOcupacion}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Vehículos Dentro
            </span>
            <div className="w-9 h-9 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center justify-center text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-100">
              {overview?.vehiculosDentro}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Activos en recinto</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Hoy: {overview?.entradasHoy} Entradas / {overview?.salidasHoy} Salidas
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ingresos del Día
            </span>
            <div className="w-9 h-9 bg-amber-950/80 border border-amber-800 rounded-xl flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-100">
              ${overview?.ingresosHoy.toLocaleString()}
            </span>
            <span className="text-xs text-amber-400 font-medium">Recaudado hoy</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Pendiente por cobrar: ${overview?.pagosPendientesMonto.toLocaleString()} ({overview?.pagosPendientesCount} facturas)
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Reservas del Día
            </span>
            <div className="w-9 h-9 bg-purple-950/80 border border-purple-800 rounded-xl flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-100">
              {overview?.reservasHoy}
            </span>
            <span className="text-xs text-purple-400 font-medium">Programadas</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {overview?.disponibles} Espacios disponibles ahora
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flujo por Horas */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              Flujo de Vehículos por Horas (Hoy)
            </h3>
            <span className="text-xs text-slate-500">Entradas vs Salidas</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.charts.flujoPorHoras || []}>
                <XAxis dataKey="hora" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Legend />
                <Bar dataKey="entradas" fill="#0284c7" name="Entradas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="salidas" fill="#10b981" name="Salidas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Uso por Tipo de Usuario */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-200">
            Distribución de Uso por Tipo de Usuario
          </h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.charts.usoPorTipoUsuario || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="cantidad"
                >
                  {(stats?.charts.usoPorTipoUsuario || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {(stats?.charts.usoPorTipoUsuario || []).map((u, i) => (
              <div key={u.name} className="flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  ></span>
                  <span>{u.name}</span>
                </div>
                <span className="font-semibold text-slate-200">{u.cantidad} ingresos</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
