/**
 * Exportación genérica a PDF y Excel (.xlsx) usada por todos los roles.
 * Cada página arma sus columnas/filas según los filtros aplicados en pantalla.
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const INSTITUCION = 'UNIVERSIDAD PRIVADA — PARQUEADERO CAMPUS CENTRAL';

export interface ExportTable {
  /** Título de la tabla (PDF) y nombre de la hoja (Excel, máx. 31 caracteres) */
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export interface ExportOptions {
  /** Título principal del reporte */
  title: string;
  /** Rol / módulo que genera el reporte */
  generatedBy?: string;
  /** Texto del filtro de fechas aplicado */
  filterLabel: string;
  /** Otros filtros activos (estado, búsqueda, pestaña...) */
  extraFilters?: string[];
  /** Pares [métrica, valor] del resumen */
  summary?: [string, string | number][];
  /** Tablas de detalle (la primera es la principal) */
  tables: ExportTable[];
  /** Nombre del archivo sin extensión */
  fileName: string;
  /** Orientación del PDF */
  orientation?: 'portrait' | 'landscape';
}

const sanitizeSheetName = (name: string) => name.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Hoja';

export const exportToPDF = (opts: ExportOptions) => {
  const doc = new jsPDF({ orientation: opts.orientation || 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(INSTITUCION, 14, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(opts.title.toUpperCase(), 14, 24);

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  let y = 43;
  doc.text(`Generado el: ${new Date().toLocaleString('es-CO')}${opts.generatedBy ? `  |  ${opts.generatedBy}` : ''}`, 14, y);
  y += 5;
  doc.text(`Filtro de fecha: ${opts.filterLabel}`, 14, y);
  (opts.extraFilters || []).forEach((f) => {
    y += 5;
    doc.text(f, 14, y);
  });
  y += 5;

  if (opts.summary && opts.summary.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Métrica', 'Valor']],
      body: opts.summary.map(([k, v]) => [k, String(v)]),
      theme: 'striped',
      headStyles: { fillColor: [2, 132, 199] },
      styles: { fontSize: 9 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  opts.tables.forEach((table) => {
    if (y > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(table.title, 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [table.columns],
      body: table.rows.length > 0 ? table.rows.map((r) => r.map((c) => String(c ?? ''))) : [[{ content: 'Sin registros para el filtro seleccionado', colSpan: table.columns.length }] as any],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 7.5 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  });

  doc.save(`${opts.fileName}.pdf`);
};

export const exportToExcel = (opts: ExportOptions) => {
  const workbook = XLSX.utils.book_new();

  // Hoja 1: Resumen con los filtros aplicados
  const summaryData: (string | number)[][] = [
    [INSTITUCION],
    [opts.title.toUpperCase()],
    ['Fecha de Generación', new Date().toLocaleString('es-CO')],
  ];
  if (opts.generatedBy) summaryData.push(['Generado por', opts.generatedBy]);
  summaryData.push(['Filtro de fecha', opts.filterLabel]);
  (opts.extraFilters || []).forEach((f) => summaryData.push(['Filtro', f]));
  if (opts.summary && opts.summary.length > 0) {
    summaryData.push([]);
    summaryData.push(['Métrica', 'Valor']);
    opts.summary.forEach(([k, v]) => summaryData.push([k, v]));
  }
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 34 }, { wch: 48 }];
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Resumen');

  // Hojas de detalle
  const usedNames = new Set(['Resumen']);
  opts.tables.forEach((table) => {
    let name = sanitizeSheetName(table.title);
    let i = 2;
    while (usedNames.has(name)) name = sanitizeSheetName(`${table.title.slice(0, 28)} ${i++}`);
    usedNames.add(name);

    const ws = XLSX.utils.aoa_to_sheet([table.columns, ...table.rows]);
    ws['!cols'] = table.columns.map((c) => ({ wch: Math.max(12, c.length + 4) }));
    XLSX.utils.book_append_sheet(workbook, ws, name);
  });

  XLSX.writeFile(workbook, `${opts.fileName}.xlsx`);
};

export const formatMoney = (value: number) => `$${Math.round(value || 0).toLocaleString('es-CO')}`;
