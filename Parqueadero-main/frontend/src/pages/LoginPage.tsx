import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Mail, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const ROLE_HOME: Record<string, string> = {
  ADMIN: '/dashboard',
  VIGILANTE: '/movements',
  CAJERO: '/payments',
  USUARIO: '/reservations',
};

export const LoginPage: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const loggedUser = await login(correo, password);
      const target = ROLE_HOME[loggedUser.role] || '/';
      navigate(target, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifique su correo y contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Panel Izquierdo — Decorativo (solo desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-r border-slate-800 overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-sky-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
          <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-sky-500/5 rounded-full blur-2xl" />
        </div>

        {/* Logotipo superior */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-900/40">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-slate-100 font-bold text-sm tracking-tight">PARQUEADERO UNISISTEMAS</p>
            <p className="text-slate-500 text-xs">Campus Central Privado</p>
          </div>
        </div>

        {/* Contenido central */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-950/60 border border-sky-800/60 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-sky-400 text-xs font-semibold tracking-wide">Sistema Activo — Acceso Seguro</span>
          </div>

          <h2 className="text-4xl font-extrabold text-slate-100 leading-tight tracking-tight">
            Gestión Inteligente<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">de Parqueadero</span>
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed">
            Plataforma empresarial para el control de acceso, reservas, pagos y
            administración del parqueadero universitario en tiempo real.
          </p>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              'Control de acceso por código QR',
              'Reserva de espacios en tiempo real',
              'Gestión de pagos y comprobantes PDF',
              'Reportes administrativos y analítica',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-xs text-slate-400">
                <div className="w-4 h-4 rounded-md bg-sky-950/80 border border-sky-800/60 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-2.5 h-2.5 text-sky-400" />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Footer inferior */}
        <div className="relative z-10">
          <p className="text-slate-600 text-xs">
            Sistema Empresarial de Gestión — Versión 1.0 &copy; 2026
          </p>
        </div>
      </div>

      {/* Panel Derecho — Formulario */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 bg-slate-950">
        <div className="w-full max-w-sm space-y-7">
          {/* Encabezado mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-900/40">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-100 font-bold text-sm">PARQUEADERO UNISISTEMAS</p>
              <p className="text-slate-500 text-xs">Campus Central Privado</p>
            </div>
          </div>

          {/* Título del formulario */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Iniciar Sesión</h1>
            <p className="text-sm text-slate-400">
              Ingrese sus credenciales institucionales para acceder al sistema.
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-300 text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Campo Correo */}
            <div className="space-y-1.5">
              <label htmlFor="correo" className="block text-xs font-semibold text-slate-300 tracking-wide">
                Correo Electrónico Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="correo"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="usuario@parqueadero.edu.co"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`w-full bg-slate-900 border rounded-xl px-4 py-3 pl-10 text-slate-100 text-sm placeholder-slate-600 focus:outline-none transition-colors ${
                    error
                      ? 'border-red-700 focus:border-red-500'
                      : 'border-slate-700 focus:border-sky-500'
                  }`}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 tracking-wide">
                Contraseña de Acceso
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`w-full bg-slate-900 border rounded-xl px-4 py-3 pl-10 pr-11 text-slate-100 text-sm placeholder-slate-600 focus:outline-none transition-colors ${
                    error
                      ? 'border-red-700 focus:border-red-500'
                      : 'border-slate-700 focus:border-sky-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors rounded-md"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isSubmitting || !correo || !password}
              className="w-full mt-2 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-600 pt-2">
            Acceso restringido a personal autorizado.<br />
            Si olvidó su contraseña, contacte al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};
