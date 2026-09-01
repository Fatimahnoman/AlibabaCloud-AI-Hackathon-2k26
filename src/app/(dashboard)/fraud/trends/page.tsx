'use client';

import { useState, useEffect } from 'react';

interface ScamTrend {
  id: string;
  name: string;
  nameUrdu: string;
  category: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  descriptionUrdu: string;
  examples: string[];
  reportedCount2024: number;
  reportedCount2025: number;
  trend: 'rising' | 'stable' | 'declining';
  preventionTips: string[];
}

interface ScamStat {
  year: number;
  country: string;
  totalReports: number;
  totalLosses: string;
  topCategory: string;
  averageLossPerCase: string;
  source: string;
}

const trendIcons: Record<string, string> = {
  rising: '📈',
  stable: '➡️',
  declining: '📉',
};

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export default function ScamTrendsPage() {
  const [trends, setTrends] = useState<ScamTrend[]>([]);
  const [stats, setStats] = useState<ScamStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTrend, setExpandedTrend] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/fraud/trends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTrends(data.data?.trends || []);
        setStats(data.data?.stats || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(trends.map((t) => t.category))];
  const filtered = selectedCategory === 'all' ? trends : trends.filter((t) => t.category === selectedCategory);
  const risingTrends = trends.filter((t) => t.trend === 'rising');

  const totalReports2025 = stats.find((s) => s.year === 2025 && s.country === 'Pakistan');

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <a href="/fraud" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Fraud Center
        </a>
        <h1 className="text-2xl font-bold text-gray-100">Scam Trends & Statistics</h1>
        <p className="text-gray-500 mt-1">Real-world fraud data, trends, and prevention guidance</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-5 skeleton rounded w-1/2" />
              <div className="h-4 skeleton rounded w-3/4" />
              <div className="h-4 skeleton rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="stat-label">Pakistan Reports (2025 H1)</div>
              <div className="stat-value text-2xl">{totalReports2025?.totalReports?.toLocaleString() || 'N/A'}</div>
              <div className="text-xs text-gray-500 mt-1">{totalReports2025?.source || ''}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Losses (2025 H1)</div>
              <div className="stat-value text-2xl">{totalReports2025?.totalLosses || 'N/A'}</div>
              <div className="text-xs text-gray-500 mt-1">Avg: {totalReports2025?.averageLossPerCase || 'N/A'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Top Category</div>
              <div className="stat-value text-lg">{totalReports2025?.topCategory || 'N/A'}</div>
              <div className="text-xs text-gray-500 mt-1">Most reported fraud type</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Rising Trends</div>
              <div className="stat-value text-2xl text-red-600">{risingTrends.length}</div>
              <div className="text-xs text-gray-500 mt-1">Scam types increasing</div>
            </div>
          </div>

          {/* Rising Trends Alert */}
          {risingTrends.length > 0 && (
            <div className="card bg-red-500/10 border border-red-500/30">
              <h2 className="text-lg font-semibold text-red-300 mb-3">Rising Scam Trends</h2>
              <div className="space-y-2">
                {risingTrends.map((t) => {
                  const change = t.reportedCount2024 > 0
                    ? Math.round(((t.reportedCount2025 - t.reportedCount2024) / t.reportedCount2024) * 100)
                    : 0;
                  return (
                    <div key={t.id} className="flex items-center gap-3">
                      <span className="text-lg">{trendIcons[t.trend]}</span>
                      <div className="flex-1">
                        <span className="font-medium text-red-300">{t.name}</span>
                        <span className="text-sm text-red-400 ml-2">
                          +{change}% ({t.reportedCount2024.toLocaleString()} → {t.reportedCount2025.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Trends List */}
          <div className="space-y-3">
            {filtered.map((trend) => {
              const change = trend.reportedCount2024 > 0
                ? Math.round(((trend.reportedCount2025 - trend.reportedCount2024) / trend.reportedCount2024) * 100)
                : 0;
              const isExpanded = expandedTrend === trend.id;

              return (
                <div key={trend.id} className="card cursor-pointer" onClick={() => setExpandedTrend(isExpanded ? null : trend.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-100">{trend.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${severityColors[trend.severity]}`}>
                          {trend.severity}
                        </span>
                        <span className="text-lg">{trendIcons[trend.trend]}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{trend.nameUrdu}</p>
                      <p className="text-sm text-gray-400">{trend.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{trend.reportedCount2025.toLocaleString()} reports in 2025</span>
                        <span className={change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : ''}>
                          {change > 0 ? '+' : ''}{change}% vs 2024
                        </span>
                        <span className="bg-white/5 px-2 py-0.5 rounded">{trend.category}</span>
                      </div>
                    </div>
                    <span className="text-gray-400 ml-2">{isExpanded ? '▲' : '▼'}</span>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-300 mb-1">Common Examples:</h4>
                        <ul className="space-y-1">
                          {trend.examples.map((ex, i) => (
                            <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                              <span className="text-red-400 mt-0.5">•</span>
                              <span className="font-mono bg-white/5 px-1 rounded">{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-300 mb-1">Prevention Tips:</h4>
                        <ul className="space-y-1">
                          {trend.preventionTips.map((tip, i) => (
                            <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                              <span className="text-green-500 mt-0.5">✓</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
