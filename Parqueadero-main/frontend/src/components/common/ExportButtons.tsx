import React from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';

interface ExportButtonsProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  disabled?: boolean;
}

/** Botones de exportación PDF / Excel con el mismo estilo del módulo de Reportes */
export const ExportButtons: React.FC<ExportButtonsProps> = ({ onExportPDF, onExportExcel, disabled }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={onExportPDF}
      disabled={disabled}
      className="flex items-center gap-2 px-3.5 py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 rounded-xl font-semibold text-xs transition-all shadow-md disabled:opacity-50"
    >
      <FileText className="w-4 h-4 text-red-400" />
      <span>Exportar PDF</span>
    </button>
    <button
      type="button"
      onClick={onExportExcel}
      disabled={disabled}
      className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 rounded-xl font-semibold text-xs transition-all shadow-md disabled:opacity-50"
    >
      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
      <span>Exportar Excel</span>
    </button>
  </div>
);
