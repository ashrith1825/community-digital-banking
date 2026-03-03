import { useEffect, useState } from 'react';
import api from '../services/api';

const CATEGORIES = ['ALL', 'BUDGETING', 'SAVING', 'CREDIT', 'FRAUD_AWARENESS'];

export default function LiteracyPage() {
  const [modules, setModules] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchModules();
  }, [filter]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL' ? '/literacy' : `/literacy/category/${filter}`;
      const { data } = await api.get(url);
      setModules(data);
    } catch (err) {
      console.error('Failed to load literacy modules', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Literacy</h1>
        <p className="text-gray-500 mt-1">Learn essential money management skills</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Module Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : modules.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No modules available in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((mod) => (
            <div key={mod.id} className="card cursor-pointer hover:shadow-lg transition-shadow"
                 onClick={() => setExpandedId(expandedId === mod.id ? null : mod.id)}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700 mb-2">
                    {mod.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">{mod.title}</h3>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedId === mod.id ? 'rotate-180' : ''
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {expandedId === mod.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-gray-600 leading-relaxed whitespace-pre-line">
                  {mod.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
