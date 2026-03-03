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
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/transfer" element={<PrivateRoute><TransferPage /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />
          <Route path="/insights" element={<PrivateRoute><InsightsPage /></PrivateRoute>} />
          <Route path="/literacy" element={<PrivateRoute><LiteracyPage /></PrivateRoute>} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}
