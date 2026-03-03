import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [accountNumber, setAccountNumber] = useState('');

  const PAGE_SIZE = 15;

  useEffect(() => {
    fetchTransactions();
    api.get('/account/balance').then((res) => setAccountNumber(res.data.accountNumber));
  }, []);

  const fetchTransactions = async (pageNum = 0) => {
    setLoading(true);
    try {
      const { data } = await api.get('/transaction/history', {
        params: { page: pageNum, size: PAGE_SIZE },
      });
      if (pageNum === 0) {
        setTransactions(data);
      } else {
        setTransactions((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h1>

      <div className="card">
        {transactions.length === 0 && !loading ? (
          <p className="text-gray-400 text-center py-12">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">ID</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Type</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">From</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">To</th>
                  <th className="text-right py-3 px-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Description</th>
                  <th className="text-right py-3 px-3 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => {
                  const isOutgoing = txn.sourceAccountNumber === accountNumber;
                  return (
                    <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3 text-gray-400">#{txn.id}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          isOutgoing ? 'bg-danger-400/10 text-danger-600' : 'bg-accent-400/10 text-accent-600'
                        }`}>
                          {isOutgoing ? 'Sent' : 'Received'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-700 font-mono text-xs">{txn.sourceAccountNumber}</td>
                      <td className="py-3 px-3 text-gray-700 font-mono text-xs">{txn.targetAccountNumber}</td>
                      <td className={`py-3 px-3 text-right font-medium ${
                        isOutgoing ? 'text-danger-600' : 'text-accent-600'
                      }`}>
                        {isOutgoing ? '-' : '+'}₹{txn.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-gray-500 max-w-[150px] truncate">{txn.description}</td>
                      <td className="py-3 px-3 text-right text-gray-400 whitespace-nowrap">
                        {new Date(txn.timestamp).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Load More */}
        {hasMore && transactions.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={() => fetchTransactions(page + 1)}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Loading…' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
