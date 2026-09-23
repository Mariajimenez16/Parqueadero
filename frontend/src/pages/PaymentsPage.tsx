import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Payment, Receipt } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  CircleDollarSign,
  CreditCard,
  Banknote,
  Smartphone,
  Download,
  CheckCircle2,
  Receipt as ReceiptIcon,
  Search,
  History,
  Clock,
  Loader2,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [historyPayments, setHistoryPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Payment Checkout Modal
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'PAGO_DIGITAL'>('EFECTIVO');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // PDF Receipt Modal
  const [receiptData, setReceiptData] = useState<Receipt | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const res = await api.get('/payments/pending', { params: { search } });
        setPendingPayments(res.data);
      } else {
        const res = await api.get('/payments/history', { params: { search } });
        setHistoryPayments(res.data);
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [activeTab, search]);

  const handleOpenCheckout = (payment: Payment) => {
    setSelectedPayment(payment);
    setSelectedMethod('EFECTIVO');
    setIsCheckoutOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedPayment) return;
    setIsProcessing(true);

    try {
      // Simular latencia de red de pasarela bancaria digital
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = await api.post(`/payments/${selectedPayment.id}/pay`, {
        metodoPago: selectedMethod,
      });

      setToast({ type: 'success', message: 'Pago procesado y registrado correctamente.' });
      setIsCheckoutOpen(false);
      setReceiptData(res.data.receipt);
      fetchPayments();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = (data: Receipt) => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(data.institucion, 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`NIT: ${data.nit} | Tel: ${data.telefono}`, 14, 25);
    doc.text(`Dirección: ${data.direccion}`, 14, 31);

    doc.setTextColor(2, 132, 199);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`COMPROBANTE DE PAGO #${data.numeroFactura}`, 14, 52);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha Emisión: ${new Date(data.fechaEmision).toLocaleString()}`, 14, 60);
    doc.text(`Método de Pago: ${data.metodoPago}`, 14, 66);
    doc.text(`Cajero / Responsable: ${data.cajero}`, 14, 72);

    // Tabla con autoTable
    autoTable(doc, {
      startY: 80,
      head: [['Concepto / Descripción', 'Detalles']],
      body: [
        ['Propietario / Cliente', `${data.usuario.nombreCompleto} (Doc: ${data.usuario.documento})`],
        ['Tipo de Usuario', data.usuario.tipoUsuario],
        ['Vehículo / Placa', `${data.vehiculo.marca} ${data.vehiculo.modelo} [ ${data.vehiculo.placa} ]`],
        ['Espacio Asignado', `${data.movimiento.espacio} (${data.movimiento.zona})`],
        ['Hora de Entrada', new Date(data.movimiento.horaEntrada).toLocaleString()],
        ['Hora de Salida', data.movimiento.horaSalida ? new Date(data.movimiento.horaSalida).toLocaleString() : 'N/A'],
        ['Duración Total', `${data.movimiento.duracionMinutos} minutos (${data.movimiento.horasFacturables} hrs facturables)`],
        ['Tarifa Aplicada', `$${data.tarifa.valorHora} / hora (Mínimo: $${data.tarifa.valorMinimo})`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 9 },
    });

    // Total final
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, finalY, 182, 18, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`VALOR TOTAL PAGADO: $${data.valorTotal.toLocaleString()} COP`, 20, finalY + 12);

    // Pie de página
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('Este documento sirve como comprobante oficial de pago de parqueadero universitario.', 14, 280);

    doc.save(`Comprobante_Pago_${data.numeroFactura}.pdf`);
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
            <CircleDollarSign className="w-6 h-6 text-sky-400" />
            Gestión de Pagos y Comprobantes
          </h1>
          <p className="text-xs text-slate-400">
            Módulo de Caja para liquidación de facturas, pasarela digital y emisión de comprobantes PDF
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pagos Pendientes por Cobrar ({pendingPayments.length})
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
          Historial de Facturas Pagadas
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por Placa, Nº Factura o Usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 pl-10 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Nº Factura</th>
                <th className="p-4">Vehículo / Placa</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Estancia / Duración</th>
                <th className="p-4">Valor Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Cargando pagos...
                  </td>
                </tr>
              ) : (activeTab === 'pending' ? pendingPayments : historyPayments).length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    {activeTab === 'pending'
                      ? 'No hay cobros ni pagos pendientes en este momento.'
                      : 'No existen registros en el historial de pagos.'}
                  </td>
                </tr>
              ) : (
                (activeTab === 'pending' ? pendingPayments : historyPayments).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-sky-400">{p.numeroFactura}</td>
                    <td className="p-4">
                      <span className="font-mono text-sm font-extrabold text-slate-100">
                        {p.movement?.vehicle?.placa}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {p.movement?.vehicle?.type}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">
                        {p.movement?.user?.nombre} {p.movement?.user?.apellidos}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Doc: {p.movement?.user?.documento} ({p.movement?.user?.userType})
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-300">
                        {p.movement?.duracionMinutos || 0} minutos
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Espacio: {p.movement?.space?.codigo}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-extrabold text-amber-400">
                        ${p.valorTotal.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge status={p.estado} />
                    </td>
                    <td className="p-4 text-right">
                      {p.estado === 'PENDIENTE' ? (
                        <button
                          onClick={() => handleOpenCheckout(p)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-all shadow-md shadow-emerald-900/30"
                        >
                          Procesar Cobro
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            const res = await api.get(`/payments/${p.id}/receipt`);
                            handleDownloadPDF(res.data);
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
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

      {/* Modal Simulador de Pasarela Digital de Pago */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title={`Cobro Factura — ${selectedPayment?.numeroFactura}`}
      >
        <div className="space-y-5 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Placa Vehículo:</span>
              <strong className="font-mono text-sky-400">{selectedPayment?.movement?.vehicle?.placa}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cliente:</span>
              <strong className="text-slate-200">
                {selectedPayment?.movement?.user?.nombre} {selectedPayment?.movement?.user?.apellidos}
              </strong>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-extrabold">
              <span className="text-slate-200">Total a Liquidar:</span>
              <span className="text-amber-400">${selectedPayment?.valorTotal.toLocaleString()} COP</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-2">
              Seleccionar Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('EFECTIVO')}
                className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all ${
                  selectedMethod === 'EFECTIVO'
                    ? 'bg-sky-950 border-sky-500 text-sky-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Efectivo</p>
                  <p className="text-[10px] text-slate-400">Pago presencial caja</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('TARJETA_DEBITO')}
                className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all ${
                  selectedMethod === 'TARJETA_DEBITO'
                    ? 'bg-sky-950 border-sky-500 text-sky-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Tarjeta Débito</p>
                  <p className="text-[10px] text-slate-400">Datáfono / Chip</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('TARJETA_CREDITO')}
                className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all ${
                  selectedMethod === 'TARJETA_CREDITO'
                    ? 'bg-sky-950 border-sky-500 text-sky-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Tarjeta Crédito</p>
                  <p className="text-[10px] text-slate-400">Visa / Mastercard</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('PAGO_DIGITAL')}
                className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all ${
                  selectedMethod === 'PAGO_DIGITAL'
                    ? 'bg-sky-950 border-sky-500 text-sky-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Pago Digital</p>
                  <p className="text-[10px] text-slate-400">QR / Nequi / Daviplata</p>
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={handleProcessPayment}
            disabled={isProcessing}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 text-xs disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando Pasarela Bancaria...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y Procesar Transacción</span>
              </>
            )}
          </button>
        </div>
      </Modal>

      {/* Modal Ver / Descargar Comprobante PDF Emitido */}
      {receiptData && (
        <Modal
          isOpen={!!receiptData}
          onClose={() => setReceiptData(null)}
          title={`Comprobante Emitido #${receiptData.numeroFactura}`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-sky-400 text-sm border-b border-slate-800 pb-1">
                {receiptData.institucion}
              </h4>
              <p className="text-slate-300">
                Cliente: <strong>{receiptData.usuario.nombreCompleto}</strong> (Doc: {receiptData.usuario.documento})
              </p>
              <p className="text-slate-300">
                Vehículo: <strong className="font-mono text-sky-400">{receiptData.vehiculo.placa}</strong> ({receiptData.vehiculo.marca} {receiptData.vehiculo.modelo})
              </p>
              <p className="text-slate-300">
                Duración Estancia: <strong>{receiptData.movimiento.duracionMinutos} min</strong>
              </p>
              <div className="flex justify-between text-sm font-extrabold border-t border-slate-800 pt-2">
                <span className="text-slate-200">Monto Total:</span>
                <span className="text-emerald-400">${receiptData.valorTotal.toLocaleString()} COP</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadPDF(receiptData)}
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Factura PDF</span>
              </button>
              <button
                onClick={() => setReceiptData(null)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
