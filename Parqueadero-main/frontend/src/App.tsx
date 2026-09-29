import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { SpacesPage } from './pages/SpacesPage';
import { MovementsPage } from './pages/MovementsPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { TariffsPage } from './pages/TariffsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditPage } from './pages/AuditPage';

/** Ruta de inicio según el rol del usuario autenticado */
const getRoleHome = (role?: string): string => {
  switch (role) {
    case 'ADMIN':
      return '/dashboard';
    case 'VIGILANTE':
      return '/movements';
    case 'CAJERO':
      return '/payments';
    case 'USUARIO':
      return '/reservations';
    default:
      return '/login';
  }
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <svg className="w-5 h-5 animate-spin text-sky-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Cargando sesión...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol no tiene acceso, redirigir a la ruta de inicio de SU rol (no al dashboard general)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
};

/** Redirige al home del rol correspondiente una vez autenticado */
const RoleRedirect: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <svg className="w-5 h-5 animate-spin text-sky-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Cargando sesión...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleHome(user?.role)} replace />;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard: solo para ADMIN, VIGILANTE y CAJERO — NO para USUARIO */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'VIGILANTE', 'CAJERO']}>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <UsersPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/vehicles"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'VIGILANTE', 'USUARIO']}>
            <Layout>
              <VehiclesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/spaces"
        element={
          <ProtectedRoute>
            <Layout>
              <SpacesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/movements"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'VIGILANTE', 'CAJERO']}>
            <Layout>
              <MovementsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservations"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'USUARIO']}>
            <Layout>
              <ReservationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tariffs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <TariffsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}>
            <Layout>
              <PaymentsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AuditPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Ruta raíz y catch-all: redirige según el rol autenticado */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
