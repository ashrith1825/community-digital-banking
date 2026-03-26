import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const isFormValid =
    fullName.trim().length >= 2 &&
    email.trim() !== '' &&
    password.length >= 8 &&
    password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await register(fullName, email, password, initialBalance ? Number(initialBalance) : undefined);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary-700 via-primary-400 to-primary-100 animate-fadeInUp">
      <div className="glass w-full max-w-md mx-4 p-8 md:p-10 flex flex-col items-center animate-fadeInUp shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4 shadow-soft">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold text-primary-900">Create Account</h1>
          <p className="text-gray-500 mt-1">Join the digital banking platform</p>
        </div>

        {error && (
          <div className="bg-danger-100 border border-danger-400/30 text-danger-600 px-4 py-3 rounded-lg mb-6 text-sm animate-fadeInUp">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-primary-800 mb-1">Full Name</label>
            <input
              id="fullName"
              type="text"
              className="input-field bg-primary-50"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary-800 mb-1">Email</label>
            <input
              id="email"
              type="email"
              className="input-field bg-primary-50"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-primary-800 mb-1">Password</label>
            <input
              id="password"
              type="password"
              className="input-field bg-primary-50"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-800 mb-1">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="input-field bg-primary-50"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label htmlFor="initialBalance" className="block text-sm font-medium text-primary-800 mb-1">Initial Balance (optional)</label>
            <input
              id="initialBalance"
              type="number"
              className="input-field bg-primary-50"
              value={initialBalance}
              onChange={e => setInitialBalance(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full shadow-md"
            disabled={!isFormValid || submitting}
          >
            {submitting ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-primary-700 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
