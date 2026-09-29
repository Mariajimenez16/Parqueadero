import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Camera, Keyboard, QrCode, Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (identifier: string) => void;
  title?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Escanear Código QR o Buscar Placa',
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('manual');
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let scanner: any = null;

    if (isOpen && activeTab === 'camera') {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader-container',
          { fps: 10, qrbox: { width: 220, height: 220 } },
          /* verbose= */ false,
        );

        scanner.render(
          (decodedText: string) => {
            scanner.clear();
            onScanSuccess(decodedText);
            onClose();
          },
          (error: any) => {
            // Ignore frame decode errors
          },
        );
      } catch (err) {
        setCameraError('No se pudo acceder a la cámara del dispositivo. Use la entrada manual.');
      }
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [isOpen, activeTab, onScanSuccess, onClose]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScanSuccess(manualInput.trim());
      setManualInput('');
      onClose();
    }
  };

  const handleQuickDemoPlate = (plateOrToken: string) => {
    onScanSuccess(plateOrToken);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4">
        {/* Selector de pestañas */}
        <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Entrada Manual / Demo
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'camera'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            Cámara QR en Vivo
          </button>
        </div>

        {activeTab === 'camera' ? (
          <div className="space-y-3">
            <div id="qr-reader-container" className="overflow-hidden rounded-xl bg-slate-950 border border-slate-800 min-h-[250px] flex items-center justify-center">
              {cameraError && (
                <div className="p-4 text-center text-red-400 text-xs">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  {cameraError}
                </div>
              )}
            </div>
            <p className="text-center text-xs text-slate-400">
              Apunte el código QR de la tarjeta del vehículo frente a la cámara.
            </p>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Placa o Identificador QR
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej: KLR-456 o QR-KLR456-ESTUDIANTE"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pl-11 text-slate-100 placeholder-slate-500 font-mono text-base tracking-wider uppercase focus:outline-none focus:border-sky-500"
                />
                <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-sky-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Validar e Identificar Vehículo
            </button>

            {/* Accesos rápidos para la sustentación docente */}
            <div className="pt-3 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                ⚡ Accesos Rápidos para Demostración Académica:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoPlate('KLR-456')}
                  className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-left transition-colors"
                >
                  <p className="text-xs font-bold text-sky-400 font-mono">KLR-456</p>
                  <p className="text-[10px] text-slate-400">Estudiante (Autorizado)</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoPlate('MXZ-890')}
                  className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-left transition-colors"
                >
                  <p className="text-xs font-bold text-emerald-400 font-mono">MXZ-890</p>
                  <p className="text-[10px] text-slate-400">Docente (Autorizado)</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoPlate('MTO-12D')}
                  className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-left transition-colors"
                >
                  <p className="text-xs font-bold text-amber-400 font-mono">MTO-12D</p>
                  <p className="text-[10px] text-slate-400">Motocicleta (Estudiante)</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoPlate('XYZ-999')}
                  className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-left transition-colors"
                >
                  <p className="text-xs font-bold text-red-400 font-mono">XYZ-999</p>
                  <p className="text-[10px] text-slate-400">No Autorizado / Bloqueado</p>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
