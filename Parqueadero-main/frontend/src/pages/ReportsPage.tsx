import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Toast } from '../components/common/Toast';
import { DateRangeFilter } from '../components/common/DateRangeFilter';
import { createDefaultDateFilter, resolveDateRange, fileSuffix } from '../utils/dateFilters';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  Download,
  TrendingUp,
  Grid,
  Clock,
  Car,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  // Filtro de fechas compartido por todos los reportes (por defecto últimos 30 días, como antes)
  const [dateFilter, setDateFilter] = useState(createDefaultDateFilter('last30'));
  const range = useMemo(() => resolveDateRange(dateFilter), [dateFilter]);
  const period = range.label;

  const [occupancyReport, setOccupancyReport] = useState<any>(null);
  const [revenueReport, setRevenueReport] = useState<any>(null);
  const [peakHoursReport, setPeakHoursReport] = useState<any[]>([]);
  const [spaceUtilReport, setSpaceUtilReport] = useState<any[]>([]);
  const [dailyFlowReport, setDailyFlowReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const dateParams = { dateFrom: range.dateFrom, dateTo: range.dateTo };
      const [occRes, revRes, peakRes, spaceRes, flowRes] = await Promise.all([
        api.get('/reports/occupancy'),
        api.get('/reports/revenue', {
          params: { period: dateFilter.mode === 'all' ? 'all' : 'custom', ...dateParams },
        }),
        api.get('/reports/peak-hours', { params: dateParams }),
        api.get('/reports/spaces-utilization', { params: dateParams }),
        api.get('/reports/daily-flow', { params: dateParams }),
      ]);

      setOccupancyReport(occRes.data);
      setRevenueReport(revRes.data);
      setPeakHoursReport(peakRes.data);
      setSpaceUtilReport(spaceRes.data);
      setDailyFlowReport(flowRes.data);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range.dateFrom, range.dateTo]);

  const flowDays: any[] = dailyFlowReport?.detalle || [];

  // Exportar a Excel XLSX real
  const exportToExcel = () => {
    if (!revenueReport) return;

    const workbook = XLSX.utils.book_new();

    // Hoja 1: Resumen de Ingresos
    const summaryData = [
      ['UNIVERSIDAD PRIVADA — PARQUEADERO CAMPUS CENTRAL'],
      ['REPORTE CONSOLIDADO DE INGRESOS Y OPERACIÓN'],
      ['Fecha de Generación', new Date().toLocaleString()],
      ['Filtro Aplicado', period],
      [],
      ['Métrica', 'Valor'],
      ['Total Ingresos Recaudados', `$${revenueReport.totalIngresos}`],
      ['Cantidad de Transacciones', revenueReport.cantidadPagos],
      ['Promedio de Pago por Vehículo', `$${revenueReport.promedioPago}`],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, wsSummary, 'Resumen Ingresos');

    // Hoja 2: Detalle de Facturación
    const detailData = revenueReport.detalle.map((item: any) => ({
      Factura: item.factura,
      Fecha: new Date(item.fecha).toLocaleString(),
      Placa: item.placa,
      Cliente: item.usuario,
      TipoUsuario: item.tipoUsuario,
      MetodoPago: item.metodo,
      MontoTotal: item.monto,
    }));
    const wsDetail = XLSX.utils.json_to_sheet(detailData);
    XLSX.utils.book_append_sheet(workbook, wsDetail, 'Detalle Facturas');

    // Hoja 3: Uso de Espacios
    const spaceData = spaceUtilReport.map((s: any) => ({
      CodigoEspacio: s.codigo,
      Tipo: s.tipo,
      Zona: s.zona,
      EstadoActual: s.estadoActual,
      UsosTotales: s.totalUsos,
      MinutosAcumulados: s.tiempoTotalMinutos,
    }));
    const wsSpaces = XLSX.utils.json_to_sheet(spaceData);
    XLSX.utils.book_append_sheet(workbook, wsSpaces, 'Uso de Espacios');

    // Hoja 4: Flujo diario (análisis semanal)
    const flowData = flowDays.map((d: any) => ({
      Fecha: d.fecha,
      Dia: d.dia,
      Entradas: d.entradas,
      Salidas: d.salidas,
      Pagos: d.pagos,
      Ingresos: d.ingresos,
      EstanciaPromedioMin: d.estanciaPromedioMin,
    }));
    const wsFlow = XLSX.utils.json_to_sheet(flowData);
    XLSX.utils.book_append_sheet(workbook, wsFlow, 'Flujo Diario');

    // Hoja 5: Horas pico del período
    const peakData = peakHoursReport.map((h: any) => ({ Hora: h.hora, VehiculosIngresados: h.ingresos }));
    const wsPeak = XLSX.utils.json_to_sheet(peakData);
    XLSX.utils.book_append_sheet(workbook, wsPeak, 'Horas Pico');

    XLSX.writeFile(workbook, `Reporte_Parqueadero_${fileSuffix(range)}.xlsx`);
    setToast({ type: 'success', message: 'Reporte Excel (.xlsx) exportado exitosamente.' });
  };

  // Exportar a PDF real
  const exportToPDF = () => {
    if (!revenueReport) return;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('UNIVERSIDAD PRIVADA — PARQUEADERO CAMPUS CENTRAL', 14, 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('REPORTE ADMINISTRATIVO EJECUTIVO DE INGRESOS', 14, 25);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 43);
    doc.text(`Filtro aplicado: ${period}`, 14, 48);

    // Resumen Metricas
    autoTable(doc, {
      startY: 53,
      head: [['Métrica de Rendimiento', 'Valor Consolidado']],
      body: [
        ['Total Recaudado en el Período', `$${revenueReport.totalIngresos.toLocaleString()} COP`],
        ['Total Transacciones de Pago', `${revenueReport.cantidadPagos} transacciones`],
        ['Promedio Recaudo por Vehículo', `$${revenueReport.promedioPago.toLocaleString()} COP`],
        ['Capacidad del Parqueadero', `${occupancyReport?.capacidadTotal || 20} espacios`],
        ['Porcentaje Actual Ocupación', `${occupancyReport?.porcentajeOcupacion || 0}%`],
        ['Entradas de vehículos en el período', `${dailyFlowReport?.totalEntradas || 0}`],
        ['Salidas de vehículos en el período', `${dailyFlowReport?.totalSalidas || 0}`],
        ['Promedio de entradas por día', `${dailyFlowReport?.promedioEntradasDia || 0}`],
        [
          'Día de mayor flujo',
          dailyFlowReport?.diaMayorFlujo
            ? `${dailyFlowReport.diaMayorFlujo.dia} ${dailyFlowReport.diaMayorFlujo.fecha} (${dailyFlowReport.diaMayorFlujo.entradas} entradas)`
            : '—',
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: [2, 132, 199] },
    });

    // Flujo diario (análisis semanal)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Flujo Diario del Período', 14, (doc as any).lastAutoTable.finalY + 12);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 16,
      head: [['Fecha', 'Día', 'Entradas', 'Salidas', 'Pagos', 'Ingresos', 'Estancia prom.']],
      body: flowDays.map((d: any) => [
        d.fecha,
        d.dia,
        d.entradas,
        d.salidas,
        d.pagos,
        `$${d.ingresos.toLocaleString()}`,
        `${d.estanciaPromedioMin} min`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199] },
      styles: { fontSize: 8 },
    });

    // Detalle de Transacciones
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle Reciente de Transacciones', 14, (doc as any).lastAutoTable.finalY + 12);

    const tableRows = revenueReport.detalle.slice(0, 30).map((item: any) => [
      item.factura,
      new Date(item.fecha).toLocaleDateString(),
      item.placa,
      item.usuario,
      item.tipoUsuario,
      item.metodo,
      `$${item.monto.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 16,
      head: [['Factura', 'Fecha', 'Placa', 'Cliente', 'Tipo', 'Método', 'Monto']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 },
    });

    doc.save(`Reporte_Administrativo_${fileSuffix(range)}.pdf`);
    setToast({ type: 'success', message: 'Reporte PDF exportado exitosamente.' });
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-400" />
            Reportes Administrativos y Analítica
          </h1>
          <p className="text-xs text-slate-400">
            Generación de reportes de ocupación, recaudo, franjas pico y exportación oficial a PDF y Excel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 rounded-xl font-semibold text-xs transition-all shadow-md"
          >
            <FileText className="w-4 h-4 text-red-400" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 rounded-xl font-semibold text-xs transition-all shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Filtro de período: accesos rápidos, día específico o rango de fechas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <DateRangeFilter
          value={dateFilter}
          onChange={setDateFilter}
          title="Seleccionar Período:"
          presets={['today', 'yesterday', 'week', 'last7', 'month', 'last30', 'all', 'day', 'range']}
        />
      </div>

      {/* KPI Cards de Reporte */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Recaudado del Período
          </span>
          <p className="text-3xl font-extrabold text-amber-400">
            ${revenueReport?.totalIngresos.toLocaleString() || 0}
          </p>
          <p className="text-[11px] text-slate-500">
            {revenueReport?.cantidadPagos || 0} pagos procesados exitosamente
          </p>
          <p className="text-[10px] text-slate-600">{period}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Promedio de Recaudo por Pago
          </span>
          <p className="text-3xl font-extrabold text-sky-400">
            ${revenueReport?.promedioPago.toLocaleString() || 0}
          </p>
          <p className="text-[11px] text-slate-500">Calculado sobre facturación pagada</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Porcentaje Ocupación Parqueadero
          </span>
          <p className="text-3xl font-extrabold text-emerald-400">
            {occupancyReport?.porcentajeOcupacion || 0}%
          </p>
          <p className="text-[11px] text-slate-500">
            {occupancyReport?.espaciosOcupados} de {occupancyReport?.capacidadTotal} espacios en uso
          </p>
        </div>
      </div>

      {/* Flujo diario del período (análisis semanal) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Flujo Diario de Vehículos e Ingresos</h3>
            <p className="text-[11px] text-slate-500">
              {dateFilter.mode === 'all' ? 'Últimos 7 días (sin filtro de fecha)' : period}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300">
              Entradas: <strong>{dailyFlowReport?.totalEntradas || 0}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              Salidas: <strong>{dailyFlowReport?.totalSalidas || 0}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              Prom. entradas/día: <strong>{dailyFlowReport?.promedioEntradasDia || 0}</strong>
            </span>
            {dailyFlowReport?.diaMayorFlujo && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                Mayor flujo: <strong>{dailyFlowReport.diaMayorFlujo.dia} {dailyFlowReport.diaMayorFlujo.fecha}</strong>
              </span>
            )}
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flowDays.map((d: any) => ({ ...d, etiqueta: `${d.dia.slice(0, 3)} ${d.fecha.slice(5)}` }))}>
              <XAxis dataKey="etiqueta" stroke="#64748b" fontSize={11} />
              <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="entradas" fill="#0ea5e9" name="Entradas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="salidas" fill="#10b981" name="Salidas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Día</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Entradas</th>
                <th className="p-3">Salidas</th>
                <th className="p-3">Pagos</th>
                <th className="p-3">Ingresos</th>
                <th className="p-3">Estancia prom.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {flowDays.map((d: any) => (
                <tr key={d.fecha} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-semibold text-slate-200">{d.dia}</td>
                  <td className="p-3 font-mono text-slate-400">{d.fecha}</td>
                  <td className="p-3 font-bold text-sky-400">{d.entradas}</td>
                  <td className="p-3 font-bold text-emerald-400">{d.salidas}</td>
                  <td className="p-3">{d.pagos}</td>
                  <td className="p-3 font-bold text-amber-400">${d.ingresos.toLocaleString()}</td>
                  <td className="p-3 font-mono">{d.estanciaPromedioMin} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico Horas Pico */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200">
          Horas de Mayor Ocupación (Franjas Pico de Ingreso)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peakHoursReport}>
              <XAxis dataKey="hora" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              <Bar dataKey="ingresos" fill="#0284c7" name="Vehículos Ingresados" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Utilización de Espacios */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200">
            Reporte de Utilización y Rotación de Espacios
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Código Espacio</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Zona</th>
                <th className="p-4">Usos Totales</th>
                <th className="p-4">Tiempo Acumulado (Min)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {spaceUtilReport.map((s) => (
                <tr key={s.codigo} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-sky-400">{s.codigo}</td>
                  <td className="p-4">{s.tipo}</td>
                  <td className="p-4 text-slate-400">{s.zona}</td>
                  <td className="p-4 font-bold text-slate-100">{s.totalUsos} ingresos</td>
                  <td className="p-4 font-mono">{s.tiempoTotalMinutos} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
