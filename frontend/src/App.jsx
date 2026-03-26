import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TransferPage from './pages/TransferPage';
import TransactionHistory from './pages/TransactionHistory';
import InsightsPage from './pages/InsightsPage';
import LiteracyPage from './pages/LiteracyPage';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading…</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-50 via-white to-primary-100 animate-fadeInUp">
      {isAuthenticated && <Navbar />}

      {/* Full width container */}
      <main className="w-full px-4 sm:px-6 lg:px-10 py-10 md:py-14">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/transfer" element={<PrivateRoute><TransferPage /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />
          <Route path="/insights" element={<PrivateRoute><InsightsPage /></PrivateRoute>} />
          <Route path="/literacy" element={<PrivateRoute><LiteracyPage /></PrivateRoute>} />

          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}