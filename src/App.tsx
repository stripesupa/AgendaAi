import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';

// Components
import AuthLayout from './components/layouts/AuthLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import PublicLayout from './components/layouts/PublicLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SubscriptionPage from './pages/auth/SubscriptionPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ServicesPage from './pages/dashboard/ServicesPage';
import WorkingHoursPage from './pages/dashboard/WorkingHoursPage';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import BookingPage from './pages/public/BookingPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { isInitialized, isLoading, initialize } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/subscription" element={
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Dashboard Routes */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/working-hours" element={<WorkingHoursPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
      </Route>

      {/* Public Booking Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/:shopSlug" element={<BookingPage />} />
      </Route>

      {/* Redirect to login from root */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;