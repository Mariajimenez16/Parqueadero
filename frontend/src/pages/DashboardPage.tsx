import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardStats, WeeklyFlowResponse } from '../types';
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
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Flame,
  Snowflake,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6'];
const VEHICLE_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#a78bfa'];

const formatDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekRange = (date: Date): { start: string; end: string } => {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: formatDate(monday),
    end: formatDate(sunday),
  };
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyFlow, setWeeklyFlow] = useState<WeeklyFlowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  // Filtros gráficos de hoy
  const [showEntries, setShowEntries] = useState(true);
  const [showExits, setShowExits] = useState(true);

  // Filtros de navegación semanal
  const [weeklyPivot, setWeeklyPivot] = useState<Date>(new Date());
  const [weeklyStartDate, setWeeklyStartDate] = useState<string>('');
  const [weeklyEndDate, setWeeklyEndDate] = useState<string>('');

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

  const fetchWeeklyFlow = async (start?: string, end?: string) => {
    setWeeklyLoading(true);
    try {
      const params: any = {};
      if (start && end) {
        params.startDate = start;
        params.endDate = end;
      }
      const res = await api.get('/dashboard/weekly-flow', { params });
      setWeeklyFlow(res.data);
      if (!start) {
        setWeeklyStartDate(res.data.period.startDate.split('T')[0]);
        setWeeklyEndDate(res.data.period.endDate.split('T')[0]);
      }
    } catch (err) {
      console.error('Error al cargar flujo semanal:', err);
    } finally {
      setWeeklyLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const currentRange = getWeekRange(new Date());
    setWeeklyStartDate(currentRange.start);
    setWeeklyEndDate(currentRange.end);
    fetchWeeklyFlow(currentRange.start, currentRange.end);

    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePrevWeek = () => {
    const prev = new Date(weeklyPivot);
    prev.setDate(prev.getDate() - 7);
    setWeeklyPivot(prev);
    const range = getWeekRange(prev);
    setWeeklyStartDate(range.start);
    setWeeklyEndDate(range.end);
    fetchWeeklyFlow(range.start, range.end);
  };

  const handleNextWeek = () => {
    const next = new Date(weeklyPivot);
    next.setDate(next.getDate() + 7);
    setWeeklyPivot(next);
    const range = getWeekRange(next);
    setWeeklyStartDate(range.start);
    setWeeklyEndDate(range.end);
    fetchWeeklyFlow(range.start, range.end);
  };

  const handleCurrentWeek = () => {
    const today = new Date();
    setWeeklyPivot(today);
    const range = getWeekRange(today);
    setWeeklyStartDate(range.start);
    setWeeklyEndDate(range.end);
    fetchWeeklyFlow(range.start, range.end);
  };

  const handleApplyDateRange = () => {
    if (weeklyStartDate && weeklyEndDate) {
      fetchWeeklyFlow(weeklyStartDate, weeklyEndDate);
    }
  };

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
    <div className="space-y-8">
      {/* Header Titulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-sky-400" />
            Dashboard Operativo Institucional
          </h1>
          <p className="text-xs text-slate-400">
            Métricas e indicadores en tiempo real de ocupación, análisis semanal e ingresos
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchWeeklyFlow(weeklyStartDate, weeklyEndDate);
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all w-fit shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading || weeklyLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* Grid KPI Cards de Hoy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ocupación */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Ocupación Actual</p>
            <h3 className="text-xl font-bold text-slate-100">
              {overview?.porcentajeOcupacion}%
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {overview?.ocupados} de {overview?.totalEspacios} espacios ocupados
            </p>
          </div>
        </div>

        {/* Vehículos Dentro */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Vehículos en Recinto</p>
            <h3 className="text-xl font-bold text-slate-100">
              {overview?.vehiculosDentro}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {overview?.disponibles} espacios libres disponibles
            </p>
          </div>
        </div>

        {/* Operación Hoy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Movimientos de Hoy</p>
            <h3 className="text-xl font-bold text-slate-100">
              {(overview?.entradasHoy || 0) + (overview?.salidasHoy || 0)}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {overview?.entradasHoy} entradas | {overview?.salidasHoy} salidas
            </p>
          </div>
        </div>

        {/* Ingresos Hoy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Recaudado Hoy</p>
            <h3 className="text-xl font-bold text-emerald-400">
              ${overview?.ingresosHoy?.toLocaleString()} COP
            </h3>
            <p className="text-[10px] text-amber-500/80 mt-0.5">
              {overview?.pagosPendientesCount} cobros pendientes (${overview?.pagosPendientesMonto?.toLocaleString()})
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN NUEVA: ANÁLISIS SEMANAL DEL FLUJO OPERATIVO */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 mb-2 border border-sky-500/20">
              <Calendar className="w-3.5 h-3.5" />
              <span>Análisis Periódico Institucional</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              Análisis Semanal del Flujo de la Operación
            </h2>
            <p className="text-xs text-slate-400">
              Comparativa diaria, tendencias de entradas y salidas, y recaudo total por día de la semana
            </p>
          </div>

          {/* Selector y Navegación Semanal */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={handlePrevWeek}
                title="Semana Anterior"
                className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Semana Ant.</span>
              </button>
              <button
                onClick={handleCurrentWeek}
                title="Semana Actual"
                className="px-2.5 py-1 bg-sky-600/30 text-sky-300 hover:bg-sky-600/50 rounded-lg font-bold transition-all flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Esta Semana</span>
              </button>
              <button
                onClick={handleNextWeek}
                title="Semana Siguiente"
                className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition-all flex items-center gap-1"
              >
                <span>Semana Sig.</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Selector de rango de fechas personalizado */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <input
                type="date"
                value={weeklyStartDate}
                onChange={(e) => setWeeklyStartDate(e.target.value)}
                className="bg-transparent text-slate-200 px-2 py-1 focus:outline-none"
              />
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <input
                type="date"
                value={weeklyEndDate}
                onChange={(e) => setWeeklyEndDate(e.target.value)}
                className="bg-transparent text-slate-200 px-2 py-1 focus:outline-none"
              />
              <button
                onClick={handleApplyDateRange}
                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition-all ml-1"
              >
                Filtrar
              </button>
            </div>
          </div>
        </div>

        {/* KPIs del Flujo Semanal */}
        {weeklyLoading ? (
          <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
            <span>Consultando datos del flujo semanal...</span>
          </div>
        ) : weeklyFlow ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-400 font-medium">Entradas Período</span>
                <p className="text-lg font-bold text-sky-400 mt-0.5">
                  {weeklyFlow.kpis.totalEntradas}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-400 font-medium">Salidas Período</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">
                  {weeklyFlow.kpis.totalSalidas}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-400 font-medium">Total Operaciones</span>
                <p className="text-lg font-bold text-slate-100 mt-0.5">
                  {weeklyFlow.kpis.totalOperaciones}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-400 font-medium">Promedio / Día</span>
                <p className="text-lg font-bold text-indigo-400 mt-0.5">
                  {weeklyFlow.kpis.promedioDiarioOperaciones}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  Día Mayor Flujo
                </span>
                <p className="text-sm font-bold text-rose-300 mt-0.5">
                  {weeklyFlow.kpis.diaMayorFlujo?.dia || 'N/A'}
                </p>
                <span className="text-[10px] text-slate-500">
                  {weeklyFlow.kpis.diaMayorFlujo ? `${weeklyFlow.kpis.diaMayorFlujo.operaciones} ops` : 'Sin registros'}
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  Recaudo Semanal
                </span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                  ${weeklyFlow.kpis.totalRecaudo.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-500">COP liquidado</span>
              </div>
            </div>

            {/* Gráfico Comparativo Semanal de Entradas vs Salidas por Día */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-bold text-slate-200">
                  Actividad Diaria: Entradas vs Salidas por Día de la Semana
                </h4>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-sky-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block"></span> Entradas
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Salidas
                  </span>
                </div>
              </div>

              <div className="h-64 w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
                {weeklyFlow.dailyStats.length === 0 || weeklyFlow.kpis.totalOperaciones === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Snowflake className="w-8 h-8 mb-2 text-slate-600" />
                    <span>No se registraron movimientos vehiculares en la semana seleccionada.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyFlow.dailyStats}
                      margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                      barCategoryGap="20%"
                      barGap={4}
                    >
                      <XAxis
                        dataKey="dia"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#334155' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: '#1e293b', opacity: 0.4 }}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#475569',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                        formatter={(value: any, name: any) => [
                          `${value} operaciones`,
                          name === 'entradas' ? 'Entradas' : 'Salidas',
                        ]}
                        labelFormatter={(label, payload) => {
                          const item = payload[0]?.payload;
                          return `${label} (${item?.fecha || ''}) — Recaudo: $${(item?.recaudo || 0).toLocaleString()} COP`;
                        }}
                      />
                      <Bar dataKey="entradas" fill="#0ea5e9" name="entradas" radius={[4, 4, 0, 0]}>
                        <LabelList
                          dataKey="entradas"
                          position="top"
                          fill="#7dd3fc"
                          fontSize={10}
                          formatter={(v) => (v === 0 ? '' : v)}
                        />
                      </Bar>
                      <Bar dataKey="salidas" fill="#10b981" name="salidas" radius={[4, 4, 0, 0]}>
                        <LabelList
                          dataKey="salidas"
                          position="top"
                          fill="#6ee7b7"
                          fontSize={10}
                          formatter={(v) => (v === 0 ? '' : v)}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Tabla resumen detallada por día de la semana */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Día</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3 text-center">Entradas</th>
                    <th className="p-3 text-center">Salidas</th>
                    <th className="p-3 text-center">Total Operaciones</th>
                    <th className="p-3 text-right">Recaudo Diario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {weeklyFlow.dailyStats.map((d) => (
                    <tr key={d.fecha} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-semibold text-slate-200">{d.dia}</td>
                      <td className="p-3 font-mono text-slate-400">{d.fecha}</td>
                      <td className="p-3 text-center font-mono font-bold text-sky-400">{d.entradas}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-400">{d.salidas}</td>
                      <td className="p-3 text-center font-mono font-extrabold text-slate-100">{d.totalOperaciones}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-400">
                        ${d.recaudo.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>

      {/* Grid Gráficos: Flujo por Horas de Hoy & Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flujo Horario Hoy */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Flujo Horario de la Jornada Actual (Hoy)
              </h3>
              <p className="text-xs text-slate-400">
                Comparativa de ingresos y salidas en el transcurso del día de hoy
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEntries((visible) => !visible)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${showEntries ? 'border-sky-500/40 bg-sky-500/10 text-sky-300' : 'border-slate-700 bg-slate-800 text-slate-500'}`}
                aria-pressed={showEntries}
              >
                <LogIn className="h-3.5 w-3.5" />
                Entradas
              </button>
              <button
                type="button"
                onClick={() => setShowExits((visible) => !visible)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${showExits ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-slate-800 text-slate-500'}`}
                aria-pressed={showExits}
              >
                <LogOut className="h-3.5 w-3.5" />
                Salidas
              </button>
            </div>
          </div>

          <div className="h-[22rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyFlow}
                margin={{ top: 20, right: 16, left: 0, bottom: 12 }}
                barCategoryGap="24%"
                barGap={5}
              >
                <XAxis dataKey="hora" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
                <YAxis allowDecimals={false} domain={[0, hourlyFlowMax]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#1e293b', opacity: 0.45 }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                  labelStyle={{ color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}
                />
                {showEntries && <Bar dataKey="entradas" fill="#0ea5e9" name="Entradas" barSize={24} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="entradas" position="top" fill="#7dd3fc" fontSize={11} formatter={(value) => value === 0 ? '' : value} />
                </Bar>}
                {showExits && <Bar dataKey="salidas" fill="#10b981" name="Salidas" barSize={24} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="salidas" position="top" fill="#6ee7b7" fontSize={11} formatter={(value) => value === 0 ? '' : value} />
                </Bar>}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Uso por Tipo de Usuario */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Distribución por Tipo de Usuario
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingresos de la jornada por vinculación institucional
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.charts.usoPorTipoUsuario || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="cantidad"
                >
                  {(stats?.charts.usoPorTipoUsuario || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
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
