import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [balanceRes, recentRes] = await Promise.all([
          api.get('/account/balance'),
          api.get('/transaction/recent'),
        ]);
        setAccount(balanceRes.data);
        setTransactions(recentRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-fadeInUp">
      {/* Welcome */}
      <div className="mb-2">
        <h1 className="text-4xl font-display font-bold text-primary-900 mb-1">
          Welcome back, {user?.fullName?.split(' ')[0]}
        </h1>
        <p className="text-primary-700 text-lg">Here's your financial overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="card-hero col-span-1 md:col-span-2 flex flex-col justify-between min-h-[220px]">
          <p className="text-primary-100 text-lg font-medium mb-2">Current Balance</p>
          <p className="text-5xl font-bold tracking-tight mb-2">
            ₹{account?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-primary-200 text-base mb-4">
            Account: <span className="font-mono tracking-wider">{account?.accountNumber}</span>
          </p>
          <div className="mt-auto flex gap-4">
            <Link to="/transfer" className="btn-accent shadow-md">Send Money</Link>
            <Link to="/insights" className="btn-secondary">View Insights</Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card flex flex-col gap-4 justify-between">
          <h3 className="text-base font-semibold text-primary-700 uppercase tracking-wide mb-2">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link to="/transfer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center group-hover:bg-accent-200">
                <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-base font-medium text-primary-900">Transfer Funds</span>
            </Link>
            <Link to="/history" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-base font-medium text-primary-900">View History</span>
            </Link>
            <Link to="/literacy" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gold-100 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center group-hover:bg-gold-400">
                <svg className="w-5 h-5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-base font-medium text-primary-900">Financial Literacy</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary-900">Recent Transactions</h2>
          <Link to="/history" className="text-base text-primary-600 hover:text-primary-800 font-semibold">View All →</Link>
        </div>

        {transactions.length === 0 ? (
          <p className="text-primary-400 text-center py-12">No transactions yet. Start by sending money!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-primary-100">
                  <th className="text-left py-3 px-2 text-primary-700 font-semibold">Type</th>
                  <th className="text-left py-3 px-2 text-primary-700 font-semibold">From / To</th>
                  <th className="text-right py-3 px-2 text-primary-700 font-semibold">Amount</th>
                  <th className="text-right py-3 px-2 text-primary-700 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => {
                  const isOutgoing = txn.sourceAccountNumber === account?.accountNumber;
                  return (
                    <tr key={txn.id} className="border-b border-primary-50 hover:bg-primary-50 transition-colors">
                      <td className="py-3 px-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          isOutgoing ? 'bg-danger-100 text-danger-600' : 'bg-accent-100 text-accent-600'
                        }`}>
                          {isOutgoing ? 'Sent' : 'Received'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-primary-900">
                        {isOutgoing ? txn.targetAccountNumber : txn.sourceAccountNumber}
                      </td>
                      <td className={`py-3 px-2 text-right font-bold ${
                        isOutgoing ? 'text-danger-600' : 'text-accent-600'
                      }`}>
                        {isOutgoing ? '-' : '+'}₹{txn.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-2 text-right text-primary-400">
                        {new Date(txn.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
