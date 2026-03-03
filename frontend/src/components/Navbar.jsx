import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <svg className="w-8 h-8 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-lg font-bold tracking-tight">DigitalBank</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-accent-400 transition-colors text-sm font-medium">
              Dashboard
            </Link>
            <Link to="/transfer" className="hover:text-accent-400 transition-colors text-sm font-medium">
              Transfer
            </Link>
            <Link to="/history" className="hover:text-accent-400 transition-colors text-sm font-medium">
              History
            </Link>
            <Link to="/insights" className="hover:text-accent-400 transition-colors text-sm font-medium">
              Insights
            </Link>
            <Link to="/literacy" className="hover:text-accent-400 transition-colors text-sm font-medium">
              Learn
            </Link>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-200 hidden sm:inline">
              {user?.fullName}
            </span>
            <button onClick={handleLogout} className="btn-secondary !py-1.5 !px-4 text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
