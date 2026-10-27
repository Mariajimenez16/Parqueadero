import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Movement } from '../types';
import { Badge } from '../components/common/Badge';
import { Toast } from '../components/common/Toast';
import { QRScannerModal } from '../components/common/QRScannerModal';
import { DateRangeFilter } from '../components/common/DateRangeFilter';
import { ExportButtons } from '../components/common/ExportButtons';
import { DailySummaryPanel } from '../components/common/DailySummaryPanel';
import { useAuth } from '../context/AuthContext';
import {
  createDefaultDateFilter,
  resolveDateRange,
  buildDailySummary,
  formatDateOnly,
  formatTimeOnly,
  fileSuffix,
} from '../utils/dateFilters';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import {
  QrCode,
  LogIn,
  LogOut,
  Car,
  Search,
  Clock,
  CheckCircle2,
  RefreshCw,
  History,
  AlertTriangle,
} from 'lucide-react';

/** Calcula el tiempo transcurrido desde una fecha de entrada */
const getElapsedTime = (entryTime: string): string => {
  const diffMs = Date.now() - new Date(entryTime).getTime();
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${minutes}m`;
};

/** Retorna true si el vehículo lleva más de 8 horas dentro */
const isLongStay = (entryTime: string): boolean => {
  const diffMs = Date.now() - new Date(entryTime).getTime();
  return diffMs > 8 * 60 * 60 * 1000;
};

export const MovementsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [activeMovements, setActiveMovements] = useState<Movement[]>([]);
  const [historyMovements, setHistoryMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // QR Modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanAction, setScanAction] = useState<'entry' | 'exit'>('entry');

  // Input manual de placa
  const [manualPlaca, setManualPlaca] = useState('');
  const [processing, setProcessing] = useState(false);

  // Result Summary Modal
  const [exitSummary, setExitSummary] = useState<any | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtro por fechas / día del historial (por hora de entrada)
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState(createDefaultDateFilter('all'));
  const range = useMemo(() => resolveDateRange(dateFilter), [dateFilter]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      if (activeTab === 'active') {
        const res = await api.get('/movements/active');
        setActiveMovements(res.data);
      } else {
        const res = await api.get('/movements/history', {
          params: { search, dateFrom: range.dateFrom, dateTo: range.dateTo },
        });
        setHistoryMovements(res.data);
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [activeTab, search, range.dateFrom, range.dateTo]);

  // ===== Resumen del período (análisis semanal del flujo de vehículos) =====
  const entriesByDay = useMemo(
    () => buildDailySummary(historyMovements, (m) => m.entryTime, () => 0, range),
    [historyMovements, range],
  );
  const exitsByDay = useMemo(
    () =>
      buildDailySummary(
        historyMovements.filter((m) => !!m.exitTime),
        (m) => m.exitTime,
        () => 0,
        range,
      ),
    [historyMovements, range],
  );
  const historyFinished = historyMovements.filter((m) => m.estado === 'FINALIZADO');
  const historyInside = historyMovements.filter((m) => m.estado === 'DENTRO');
  const avgStay =
    historyFinished.length > 0
      ? Math.round(historyFinished.reduce((acc, m) => acc + (m.duracionMinutos || 0), 0) / historyFinished.length)
      : 0;

  // ===== Exportación (PDF / Excel) con los filtros aplicados =====
  const buildExportOptions = () => {
    const generatedBy = user ? `${user.nombre} ${user.apellidos} (${user.role})` : undefined;

    if (activeTab === 'active') {
      return {
        title: 'Control de acceso — Vehículos dentro del recinto',
        generatedBy,
        filterLabel: `Estado actual al ${new Date().toLocaleString('es-CO')}`,
        summary: [['Vehículos actualmente dentro', activeMovements.length]] as [string, string | number][],
        tables: [
          {
            title: 'Vehículos dentro',
            columns: ['Placa', 'Vehículo', 'Tipo', 'Usuario', 'Documento', 'Espacio', 'Fecha entrada', 'Hora entrada', 'Tiempo en recinto', 'Operador'],
            rows: activeMovements.map((m) => [
              m.vehicle?.placa || '',
              `${m.vehicle?.marca || ''} ${m.vehicle?.modelo || ''}`.trim(),
              m.vehicle?.type || '',
              `${m.user?.nombre || m.vehicle?.user?.nombre || ''} ${m.user?.apellidos || m.vehicle?.user?.apellidos || ''}`.trim(),
              m.user?.documento || m.vehicle?.user?.documento || '',
              m.space?.codigo || '',
              formatDateOnly(m.entryTime),
              formatTimeOnly(m.entryTime),
              getElapsedTime(m.entryTime),
              m.operator ? `${m.operator.nombre} ${m.operator.apellidos}` : 'Sistema',
            ]),
          },
        ],
        fileName: `Accesos_Vehiculos_Dentro_${new Date().toISOString().split('T')[0]}`,
        orientation: 'landscape' as const,
      };
    }

    const flowRows = entriesByDay.map((d) => {
      const exits = exitsByDay.find((e) => e.fecha === d.fecha);
      return [d.fechaTexto, d.dia, d.cantidad, exits ? exits.cantidad : 0];
    });

    return {
      title: 'Control de acceso — Historial de movimientos',
      generatedBy,
      filterLabel: range.label,
      extraFilters: search ? [`Búsqueda: "${search}"`] : [],
      summary: [
        ['Total movimientos (entradas) en el período', historyMovements.length],
        ['Movimientos finalizados (con salida)', historyFinished.length],
        ['Vehículos que siguen dentro', historyInside.length],
        ['Estancia promedio', `${avgStay} min`],
      ] as [string, string | number][],
      tables: [
        {
          title: 'Flujo por día',
          columns: ['Fecha', 'Día', 'Entradas', 'Salidas'],
          rows: flowRows,
        },
        {
          title: 'Detalle de movimientos',
          columns: ['Placa', 'Vehículo', 'Usuario', 'Documento', 'Espacio', 'Fecha entrada', 'Hora entrada', 'Fecha salida', 'Hora salida', 'Duración (min)', 'Estado', 'Operador'],
          rows: historyMovements.map((m) => [
            m.vehicle?.placa || '',
            `${m.vehicle?.marca || ''} ${m.vehicle?.modelo || ''} (${m.vehicle?.type || ''})`.trim(),
            `${m.user?.nombre || ''} ${m.user?.apellidos || ''}`.trim(),
            m.user?.documento || '',
            m.space?.codigo || '',
            formatDateOnly(m.entryTime),
            formatTimeOnly(m.entryTime),
            m.exitTime ? formatDateOnly(m.exitTime) : '—',
            m.exitTime ? formatTimeOnly(m.exitTime) : '—',
            m.duracionMinutos ?? '—',
            m.estado,
            m.operator ? `${m.operator.nombre} ${m.operator.apellidos}` : 'Sistema',
          ]),
        },
      ],
      fileName: `Accesos_Historial_${fileSuffix(range)}`,
      orientation: 'landscape' as const,
    };
  };

  const handleExportPDF = () => {
    exportToPDF(buildExportOptions());
    setToast({ type: 'success', message: 'Reporte PDF exportado con los filtros aplicados.' });
  };

  const handleExportExcel = () => {
    exportToExcel(buildExportOptions());
    setToast({ type: 'success', message: 'Reporte Excel (.xlsx) exportado con los filtros aplicados.' });
  };

  const handleRegisterEntry = async (identifier: string) => {
    if (!identifier.trim()) return;
    setProcessing(true);
    try {
      const res = await api.post('/movements/entry', {
        identifier: identifier.trim().toUpperCase(),
        observaciones: 'Ingreso registrado vía torniquete QR',
      });
      setToast({ type: 'success', message: res.data.message });
      setManualPlaca('');
      fetchMovements();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleRegisterExit = async (identifier: string) => {
    if (!identifier.trim()) return;
    setProcessing(true);
    try {
      const res = await api.post('/movements/exit', {
        identifier: identifier.trim().toUpperCase(),
        observaciones: 'Salida registrada en garita',
      });
      setExitSummary(res.data.summary);
      setToast({ type: 'success', message: res.data.message });
      setManualPlaca('');
      fetchMovements();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleScanSuccess = (decoded: string) => {
    if (scanAction === 'entry') {
      handleRegisterEntry(decoded);
    } else {
      handleRegisterExit(decoded);
    }
  };

  const handleManualSubmit = (action: 'entry' | 'exit') => {
    if (!manualPlaca.trim()) {
      setToast({ type: 'error', message: 'Ingrese una placa válida para continuar.' });
      return;
    }
    if (action === 'entry') {
      handleRegisterEntry(manualPlaca);
    } else {
      handleRegisterExit(manualPlaca);
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
            <QrCode className="w-6 h-6 text-sky-400" />
            Control de Acceso y Torniquete QR
          </h1>
          <p className="text-xs text-slate-400">
            Módulo de operación para registrar entradas y salidas de vehículos autorizados
          </p>
        </div>

        <button
          onClick={fetchMovements}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Lista</span>
        </button>
      </div>

      {/* Panel de Operación Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Registro de ENTRADA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center justify-center text-emerald-400">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Registrar Entrada de Vehículo</h3>
              <p className="text-[11px] text-slate-400">Valida vehículo, usuario y asigna espacio</p>
            </div>
          </div>

          <div className="space-y-2">
            {/* Campo de placa manual */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Placa del vehículo (ej: ABC-123)"
                value={manualPlaca}
                onChange={(e) => setManualPlaca(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit('entry')}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 text-xs placeholder-slate-500 font-mono tracking-widest uppercase focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleManualSubmit('entry')}
                disabled={processing || !manualPlaca.trim()}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all"
              >
                Registrar
              </button>
            </div>

            <button
              onClick={() => {
                setScanAction('entry');
                setIsScannerOpen(true);
              }}
              className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-700/40 text-emerald-400 font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Escanear Codigo QR para Entrada</span>
            </button>
          </div>
        </div>

        {/* Registro de SALIDA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-sky-950/80 border border-sky-800 rounded-xl flex items-center justify-center text-sky-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Registrar Salida de Vehículo</h3>
              <p className="text-[11px] text-slate-400">Calcula tarifa, libera espacio y crea cobro</p>
            </div>
          </div>

          <div className="space-y-2">
            {/* Campo de placa manual */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Placa del vehículo (ej: ABC-123)"
                value={manualPlaca}
                onChange={(e) => setManualPlaca(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit('exit')}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 text-xs placeholder-slate-500 font-mono tracking-widest uppercase focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={() => handleManualSubmit('exit')}
                disabled={processing || !manualPlaca.trim()}
                className="px-4 py-2.5 bg-sky-700 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all"
              >
                Registrar
              </button>
            </div>

            <button
              onClick={() => {
                setScanAction('exit');
                setIsScannerOpen(true);
              }}
              className="w-full bg-sky-600/10 hover:bg-sky-600/20 border border-sky-700/40 text-sky-400 font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Escanear Codigo QR para Salida</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Car className="w-4 h-4" />
          Vehículos Actualmente Dentro ({activeMovements.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          Historial de Movimientos
        </button>
      </div>

      {/* Tabla de Movimientos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {activeTab === 'history' && (
          <div className="p-4 border-b border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Buscar en historial por placa, usuario o espacio..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 pl-10 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              </div>
              <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} disabled={loading} />
            </div>

            {/* Filtro por día o rango de fechas (hora de entrada) */}
            <DateRangeFilter value={dateFilter} onChange={setDateFilter} title="Fecha de entrada:" />

            {/* Mini resumen del período */}
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300">
                Entradas: <strong>{historyMovements.length}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                Finalizados: <strong>{historyFinished.length}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                Siguen dentro: <strong>{historyInside.length}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                Estancia promedio: <strong>{avgStay} min</strong>
              </span>
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="p-4 border-b border-slate-800 flex justify-end">
            <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} disabled={loading} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Placa / Vehículo</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Espacio Asignado</th>
                <th className="p-4">Hora de Entrada</th>
                {activeTab === 'active' && <th className="p-4">Tiempo en Recinto</th>}
                {activeTab === 'history' && <th className="p-4">Hora de Salida</th>}
                <th className="p-4">Operador</th>
                <th className="p-4 text-right">Accion Salida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Cargando movimientos...
                  </td>
                </tr>
              ) : (activeTab === 'active' ? activeMovements : historyMovements).length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    {activeTab === 'active'
                      ? 'No hay ningun vehiculo actualmente dentro del recinto.'
                      : 'No se encontraron movimientos registrados.'}
                  </td>
                </tr>
              ) : (
                (activeTab === 'active' ? activeMovements : historyMovements).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-base font-extrabold text-sky-400 tracking-wider">
                        {m.vehicle?.placa}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {m.vehicle?.marca} {m.vehicle?.modelo} ({m.vehicle?.type})
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-100">
                        {m.user?.nombre} {m.user?.apellidos}
                      </div>
                      <div className="text-[10px] text-slate-400">Doc: {m.user?.documento}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-amber-400">
                        {m.space?.codigo}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {new Date(m.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <div className="text-[10px] text-slate-500">
                        {new Date(m.entryTime).toLocaleDateString()}
                      </div>
                    </td>
                    {/* Columna de duración activa (solo en tab "active") */}
                    {activeTab === 'active' && (
                      <td className="p-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold ${
                            isLongStay(m.entryTime)
                              ? 'bg-amber-950/60 border border-amber-800/60 text-amber-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isLongStay(m.entryTime) ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span>{getElapsedTime(m.entryTime)}</span>
                        </div>
                      </td>
                    )}
                    {activeTab === 'history' && (
                      <td className="p-4 font-mono text-slate-300">
                        {m.exitTime
                          ? new Date(m.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                    )}
                    <td className="p-4 text-slate-400">
                      {m.operator ? `${m.operator.nombre}` : 'Sistema'}
                    </td>
                    <td className="p-4 text-right">
                      {m.estado === 'DENTRO' && (
                        <button
                          onClick={() => handleRegisterExit(m.vehicle?.placa || '')}
                          className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg font-semibold text-[11px] transition-colors"
                        >
                          Marcar Salida
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

      {/* Flujo por día del período (análisis semanal) */}
      {activeTab === 'history' && dateFilter.mode !== 'all' && !loading && (
        <DailySummaryPanel title="Entradas de vehículos por día del período" rows={entriesByDay} countLabel="Entradas" />
      )}

      {/* Modal Resumen de Salida con Deuda Generada */}
      {exitSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400 border-b border-slate-800 pb-3">
              <CheckCircle2 className="w-7 h-7" />
              <div>
                <h3 className="font-bold text-slate-100 text-base">Salida Registrada Exitosamente</h3>
                <p className="text-xs text-slate-400">Factura de Cobro Generada</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Factura N.:</span>
                <span className="font-mono font-bold text-sky-400">{exitSummary.numeroFactura}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehiculo:</span>
                <span className="font-mono font-bold text-slate-200">{exitSummary.placa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Usuario:</span>
                <span className="text-slate-200">{exitSummary.usuario}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duracion:</span>
                <span className="text-slate-200 font-semibold">
                  {exitSummary.duracionMinutos} min ({exitSummary.horasFacturables} hrs)
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-2 text-sm font-bold">
                <span className="text-slate-200">Total a Pagar:</span>
                <span className="text-amber-400">${exitSummary.valorTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setExitSummary(null)}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 rounded-xl transition-all text-xs"
            >
              Entendido / Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal QR Scanner */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title={scanAction === 'entry' ? 'Entrada — Escanear QR o Placa' : 'Salida — Escanear QR o Placa'}
      />
    </div>
  );
};
