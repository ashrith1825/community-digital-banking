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
    <nav className="glass shadow-lg py-2 px-0 mb-6 sticky top-0 z-30 animate-fadeInUp">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <svg className="w-8 h-8 text-accent-500 group-hover:text-accent-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-xl font-display font-bold tracking-tight text-primary-900 group-hover:text-accent-600 transition-colors">DigitalBank</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            <Link to="/dashboard" className="hover:text-accent-500 transition-colors text-base font-medium px-2 py-1 rounded-lg focus:bg-primary-100 focus:text-primary-800">
              Dashboard
            </Link>
            <Link to="/transfer" className="hover:text-accent-500 transition-colors text-base font-medium px-2 py-1 rounded-lg focus:bg-primary-100 focus:text-primary-800">
              Transfer
            </Link>
            <Link to="/history" className="hover:text-accent-500 transition-colors text-base font-medium px-2 py-1 rounded-lg focus:bg-primary-100 focus:text-primary-800">
              History
            </Link>
            <Link to="/insights" className="hover:text-accent-500 transition-colors text-base font-medium px-2 py-1 rounded-lg focus:bg-primary-100 focus:text-primary-800">
              Insights
            </Link>
            <Link to="/literacy" className="hover:text-accent-500 transition-colors text-base font-medium px-2 py-1 rounded-lg focus:bg-primary-100 focus:text-primary-800">
              Learn
            </Link>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            <span className="text-base text-primary-700 font-medium hidden sm:inline">
              {user?.fullName}
            </span>
            <button onClick={handleLogout} className="btn-secondary !py-2 !px-6 text-base font-semibold">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
