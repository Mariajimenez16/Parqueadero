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
  LogIn,
  LogOut,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6'];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEntries, setShowEntries] = useState(true);
  const [showExits, setShowExits] = useState(true);

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
  const hourlyFlow = (stats?.charts?.flujoPorHoras || []).map((item) => ({
    ...item,
    entradas: Number(item.entradas) || 0,
    salidas: Number(item.salidas) || 0,
  }));
  const hourlyFlowMax = Math.max(
    5,
    ...hourlyFlow.flatMap(({ entradas, salidas }) => [entradas, salidas]),
  );
  const totalHourlyEntries = hourlyFlow.reduce((total, item) => total + item.entradas, 0);
  const totalHourlyExits = hourlyFlow.reduce((total, item) => total + item.salidas, 0);

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
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Flujo de vehículos por hora</h3>
              <p className="text-xs text-slate-400 mt-1">Actividad operativa de hoy, de 7:00 a 20:00</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowEntries((visible) => !visible)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${showEntries ? 'border-sky-500/40 bg-sky-500/10 text-sky-300' : 'border-slate-700 bg-slate-800 text-slate-500'}`}
                aria-pressed={showEntries}
              >
                <LogIn className="h-4 w-4" />
                Entradas
              </button>
              <button
                type="button"
                onClick={() => setShowExits((visible) => !visible)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${showExits ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-slate-800 text-slate-500'}`}
                aria-pressed={showExits}
              >
                <LogOut className="h-4 w-4" />
                Salidas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-sky-300"><LogIn className="h-4 w-4" /> Total entradas</div>
              <p className="mt-1 text-2xl font-bold text-sky-200">{totalHourlyEntries}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-emerald-300"><LogOut className="h-4 w-4" /> Total salidas</div>
              <p className="mt-1 text-2xl font-bold text-emerald-200">{totalHourlyExits}</p>
            </div>
          </div>

          <div className="h-[26rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyFlow}
                margin={{ top: 28, right: 16, left: 0, bottom: 12 }}
                barCategoryGap="24%"
                barGap={5}
              >
                <XAxis dataKey="hora" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={{ stroke: '#334155' }} />
                <YAxis allowDecimals={false} domain={[0, hourlyFlowMax]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#1e293b', opacity: 0.45 }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', borderRadius: '12px', color: '#f8fafc' }}
                  labelStyle={{ color: '#cbd5e1', fontWeight: 600, marginBottom: 6 }}
                />
                {showEntries && <Bar dataKey="entradas" fill="#0ea5e9" name="Entradas" barSize={26} radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="entradas" position="top" fill="#7dd3fc" fontSize={12} formatter={(value) => value === 0 ? '' : value} />
                </Bar>}
                {showExits && <Bar dataKey="salidas" fill="#10b981" name="Salidas" barSize={26} radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="salidas" position="top" fill="#6ee7b7" fontSize={12} formatter={(value) => value === 0 ? '' : value} />
                </Bar>}
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
