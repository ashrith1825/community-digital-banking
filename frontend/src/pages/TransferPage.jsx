import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TransferPage() {
  const [targetAccountNumber, setTargetAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const isFormValid = targetAccountNumber.trim().length === 10 && parseFloat(amount) > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setSubmitting(true);

    try {
      const { data } = await api.post('/transaction/transfer', {
        targetAccountNumber,
        amount: parseFloat(amount),
        description: description || undefined,
      });
      setSuccess(data);
      setTargetAccountNumber('');
      setAmount('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transfer Funds</h1>

      <div className="card">
        {/* Success Message */}
        {success && (
          <div className="bg-accent-400/10 border border-accent-400/30 text-accent-600 px-4 py-3 rounded-lg mb-6 text-sm">
            <p className="font-medium">Transfer Successful!</p>
            <p className="mt-1">
              ₹{success.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} sent to{' '}
              {success.targetAccountNumber}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-3 text-accent-700 hover:text-accent-800 font-medium text-sm underline"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-danger-400/10 border border-danger-400/30 text-danger-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="targetAccount" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Account Number
            </label>
            <input
              id="targetAccount"
              type="text"
              className="input-field"
              placeholder="10-digit account number"
              maxLength={10}
              value={targetAccountNumber}
              onChange={(e) => setTargetAccountNumber(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="input-field"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <input
              id="description"
              type="text"
              className="input-field"
              placeholder="e.g. Payment for groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Processing…' : 'Send Money'}
          </button>
        </form>
      </div>
    </div>
  );
}
