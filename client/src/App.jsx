import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import WatchlistPage from './pages/WatchlistPage';
import AlertFormPage from './pages/AlertFormPage';
import AlertManagementPage from './pages/AlertManagementPage';
import NotificationPreferencesPage from './pages/NotificationPreferencesPage';
import NotificationHistoryPage from './pages/NotificationHistoryPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--pr-bg-soft)' }}>
      <Navbar />
      <main className="flex-grow-1">
        <ErrorBoundary>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          {import.meta.env.DEV && <Route path="/dev/diagnostics" element={<DiagnosticsPage />} />}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <WatchlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts/new"
            element={
              <ProtectedRoute>
                <AlertFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts/:alertId/edit"
            element={
              <ProtectedRoute>
                <AlertFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AlertManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/notifications"
            element={
              <ProtectedRoute>
                <NotificationPreferencesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
