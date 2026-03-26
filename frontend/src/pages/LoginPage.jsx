import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required';
    // simple email regex
    const re = /^\S+@\S+\.\S+$/;
    return re.test(value) ? '' : 'Enter a valid email address';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const isFormValid = !fieldErrors.email && !fieldErrors.password && email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // final validation
    const emailErr = validateEmail(email);
    const pwdErr = validatePassword(password);
    setFieldErrors({ email: emailErr, password: pwdErr });
    if (emailErr || pwdErr) return;
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary-700 via-primary-400 to-primary-100 animate-fadeInUp">
      <div className="glass w-full max-w-md mx-4 p-8 md:p-10 flex flex-col items-center animate-fadeInUp shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4 shadow-soft">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold text-primary-900">Welcome Back</h1>
          <p className="text-gray-500 mt-1">Sign in to your digital banking account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-danger-100 border border-danger-400/30 text-danger-600 px-4 py-3 rounded-lg mb-6 text-sm animate-fadeInUp">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-800 mb-1">Email</label>
              <input
                id="email"
                type="email"
                className={`input-field bg-primary-50 ${fieldErrors.email ? 'border-danger-500' : ''}`}
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors((s) => ({ ...s, email: validateEmail(e.target.value) })); }}
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                required
              />
              {fieldErrors.email && <p id="email-error" className="text-sm text-danger-600 mt-1">{fieldErrors.email}</p>}
            </div>
          <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-800 mb-1">Password</label>
              <input
                id="password"
                type="password"
                className={`input-field bg-primary-50 ${fieldErrors.password ? 'border-danger-500' : ''}`}
                value={password}
                onChange={e => { setPassword(e.target.value); setFieldErrors((s) => ({ ...s, password: validatePassword(e.target.value) })); }}
                autoComplete="current-password"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                required
              />
              {fieldErrors.password && <p id="password-error" className="text-sm text-danger-600 mt-1">{fieldErrors.password}</p>}
          </div>
          <button
            type="submit"
            className="btn-primary w-full shadow-md"
            disabled={!isFormValid || submitting}
          >
            {submitting ? 'Signing In…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-primary-700 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-semibold">Create one</Link>
        </p>
      </div>
    </div>
  );
}
