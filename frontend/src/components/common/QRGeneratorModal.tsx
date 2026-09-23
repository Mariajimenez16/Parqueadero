import React from 'react';
import { Modal } from './Modal';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, QrCode } from 'lucide-react';
import { Vehicle } from '../../types';

interface QRGeneratorModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRGeneratorModal: React.FC<QRGeneratorModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  if (!vehicle) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Código QR de Identificación — ${vehicle.placa}`}>
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="p-6 bg-white rounded-2xl border-4 border-slate-700 shadow-2xl inline-block">
          <QRCodeSVG
            id="qr-code-svg"
            value={vehicle.qrCodeToken}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 w-full space-y-1 text-xs">
          <p className="font-mono text-sky-400 font-bold tracking-widest text-sm uppercase">
            {vehicle.placa}
          </p>
          <p className="text-slate-300 font-medium">
            {vehicle.marca} {vehicle.modelo} ({vehicle.color})
          </p>
          <p className="text-slate-400">
            Propietario: {vehicle.user ? `${vehicle.user.nombre} ${vehicle.user.apellidos}` : 'Usuario Registrado'}
          </p>
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            Token Seguro: {vehicle.qrCodeToken}
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
          >
            <Printer className="w-4 h-4" />
            Imprimir Carné
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 rounded-xl transition-all text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};
