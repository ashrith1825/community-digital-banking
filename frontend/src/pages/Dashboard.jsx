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
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">Here's your financial overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white col-span-1 md:col-span-2">
          <p className="text-primary-200 text-sm font-medium">Current Balance</p>
          <p className="text-4xl font-bold mt-2">
            ₹{account?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-primary-200 text-sm mt-3">
            Account: {account?.accountNumber}
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/transfer" className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              Send Money
            </Link>
            <Link to="/insights" className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              View Insights
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Quick Actions</h3>
          <div className="mt-4 space-y-3">
            <Link to="/transfer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-accent-400/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Transfer Funds</span>
            </Link>
            <Link to="/history" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary-400/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">View History</span>
            </Link>
            <Link to="/literacy" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Financial Literacy</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No transactions yet. Start by sending money!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Type</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">From / To</th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">Amount</th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => {
                  const isOutgoing = txn.sourceAccountNumber === account?.accountNumber;
                  return (
                    <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          isOutgoing ? 'bg-danger-400/10 text-danger-600' : 'bg-accent-400/10 text-accent-600'
                        }`}>
                          {isOutgoing ? 'Sent' : 'Received'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-700">
                        {isOutgoing ? txn.targetAccountNumber : txn.sourceAccountNumber}
                      </td>
                      <td className={`py-3 px-2 text-right font-medium ${
                        isOutgoing ? 'text-danger-600' : 'text-accent-600'
                      }`}>
                        {isOutgoing ? '-' : '+'}₹{txn.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-400">
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
