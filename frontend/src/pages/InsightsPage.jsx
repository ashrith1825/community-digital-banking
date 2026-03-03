import { useState } from 'react';
import api from '../services/api';

export default function InsightsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const fetchInsight = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/insights/monthly', { params: { year, month } });
      setInsight(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Monthly Financial Insights</h1>

      {/* Date Picker */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select className="input-field w-28" value={year} onChange={(e) => setYear(+e.target.value)}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select className="input-field w-40" value={month} onChange={(e) => setMonth(+e.target.value)}>
              {monthNames.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
            </select>
          </div>
          <button onClick={fetchInsight} disabled={loading} className="btn-primary">
            {loading ? 'Loading…' : 'Get Insights'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-danger-400/10 border border-danger-400/30 text-danger-600 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Insights Cards */}
      {insight && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <p className="text-sm text-gray-500 font-medium">Total Income</p>
              <p className="text-3xl font-bold text-accent-600 mt-2">
                ₹{insight.totalIncome?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500 font-medium">Total Expenses</p>
              <p className="text-3xl font-bold text-danger-600 mt-2">
                ₹{insight.totalExpenses?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500 font-medium">Net Savings</p>
              <p className={`text-3xl font-bold mt-2 ${
                insight.netSavings >= 0 ? 'text-accent-600' : 'text-danger-600'
              }`}>
                ₹{insight.netSavings?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {insight.spendingAlert && (
            <div className={`card border-l-4 ${
              insight.spendingAlert.includes('⚠')
                ? 'border-l-yellow-500 bg-yellow-50'
                : 'border-l-accent-500 bg-accent-400/5'
            }`}>
              <p className="text-gray-700">{insight.spendingAlert}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
