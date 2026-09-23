import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Toast } from '../components/common/Toast';
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
  const [period, setPeriod] = useState('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [occupancyReport, setOccupancyReport] = useState<any>(null);
  const [revenueReport, setRevenueReport] = useState<any>(null);
  const [peakHoursReport, setPeakHoursReport] = useState<any[]>([]);
  const [spaceUtilReport, setSpaceUtilReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [occRes, revRes, peakRes, spaceRes] = await Promise.all([
        api.get('/reports/occupancy'),
        api.get('/reports/revenue', { params: { period, dateFrom, dateTo } }),
        api.get('/reports/peak-hours'),
        api.get('/reports/spaces-utilization'),
      ]);

      setOccupancyReport(occRes.data);
      setRevenueReport(revRes.data);
      setPeakHoursReport(peakRes.data);
      setSpaceUtilReport(spaceRes.data);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const handleApplyCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  // Exportar a Excel XLSX real
  const exportToExcel = () => {
    if (!revenueReport) return;

    const workbook = XLSX.utils.book_new();

    // Hoja 1: Resumen de Ingresos
    const summaryData = [
      ['UNIVERSIDAD PRIVADA — PARQUEADERO CAMPUS CENTRAL'],
      ['REPORTE CONSOLIDADO DE INGRESOS Y OPERACIÓN'],
      ['Fecha de Generación', new Date().toLocaleString()],
      ['Filtro Aplicado', period.toUpperCase()],
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

    XLSX.writeFile(workbook, `Reporte_Parqueadero_${new Date().toISOString().split('T')[0]}.xlsx`);
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
    doc.text(`REPORTE ADMINISTRATIVO EJECUTIVO DE INGRESOS (${period.toUpperCase()})`, 14, 25);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 43);

    // Resumen Metricas
    autoTable(doc, {
      startY: 48,
      head: [['Métrica de Rendimiento', 'Valor Consolidado']],
      body: [
        ['Total Recaudado en el Período', `$${revenueReport.totalIngresos.toLocaleString()} COP`],
        ['Total Transacciones de Pago', `${revenueReport.cantidadPagos} transacciones`],
        ['Promedio Recaudo por Vehículo', `$${revenueReport.promedioPago.toLocaleString()} COP`],
        ['Capacidad del Parqueadero', `${occupancyReport?.capacidadTotal || 20} espacios`],
        ['Porcentaje Actual Ocupación', `${occupancyReport?.porcentajeOcupacion || 0}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [2, 132, 199] },
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

    doc.save(`Reporte_Administrativo_${new Date().toISOString().split('T')[0]}.pdf`);
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

      {/* Bar Selector Periodo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Seleccionar Período:</span>
          <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setPeriod('day')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                period === 'day' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hoy (Día)
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                period === 'week' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Última Semana
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                period === 'month' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mes Actual
            </button>
          </div>
        </div>

        {/* Custom Date Form */}
        <form onSubmit={handleApplyCustomFilter} className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-200"
          />
          <span className="text-slate-500">a</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-200"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold rounded-xl transition-colors border border-slate-700"
          >
            Filtrar Rango
          </button>
        </form>
      </div>

      {/* KPI Cards de Reporte */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Recaudado ({period.toUpperCase()})
          </span>
          <p className="text-3xl font-extrabold text-amber-400">
            ${revenueReport?.totalIngresos.toLocaleString() || 0}
          </p>
          <p className="text-[11px] text-slate-500">
            {revenueReport?.cantidadPagos || 0} pagos procesados exitosamente
          </p>
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
