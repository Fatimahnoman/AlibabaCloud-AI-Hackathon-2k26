'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Suggestion {
  category: string;
  severity: 'low' | 'medium' | 'high';
  originalText: string;
  suggestedText: string;
  explanation: string;
}

interface IntegrityCheck {
  flaggedClaims: string[];
  fakeIndicators: string[];
  integrityScore: number;
  warnings: string[];
}

interface AnalysisResult {
  id: string;
  documentType: string;
  overallScore: number;
  structureScore: number;
  clarityScore: number;
  grammarScore: number;
  relevanceScore: number;
  executiveSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  suggestions: Suggestion[];
  integrityCheck: IntegrityCheck;
  originalContent: string;
  targetInstitution?: string;
  targetProgram?: string;
  createdAt: string;
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? 'text-green-600 bg-emerald-500/10 border-green-200' : score >= 60 ? 'text-yellow-600 bg-yellow-500/10 border-yellow-200' : 'text-red-600 bg-red-500/10 border-red-200';
  return (
    <div className={`text-center p-4 rounded-xl border ${color}`}>
      <div className="text-3xl font-bold">{score}</div>
      <div className="text-sm mt-1 opacity-75">{label}</div>
    </div>
  );
}

import { apiClient } from '@/lib/api-client';

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      const data = await apiClient.get<{ data: AnalysisResult }>(`/api/documents/${id}`);
      setAnalysis(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);

  const handleDelete = async () => {
    if (!confirm('Delete this analysis?')) return;
    try {
      await apiClient.delete(`/api/documents/${id}`);
      router.push('/documents');
    } catch { /* empty */ }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading analysis...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!analysis) return <div className="p-8 text-center text-gray-500">Analysis not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.push('/documents')} className="text-emerald-600 hover:text-emerald-800 text-sm mb-2">&larr; Back to Document Intelligence</button>
          <h1 className="text-2xl font-bold capitalize">{analysis.documentType.replace(/_/g, ' ')} Analysis</h1>
          <p className="text-gray-500 text-sm mt-1">{new Date(analysis.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/documents')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Re-analyze</button>
          <button onClick={handleDelete}
            className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20">Delete</button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Scores</h2>
        <div className="grid grid-cols-5 gap-3">
          <ScoreCard label="Overall" score={analysis.overallScore} />
          <ScoreCard label="Structure" score={analysis.structureScore} />
          <ScoreCard label="Clarity" score={analysis.clarityScore} />
          <ScoreCard label="Grammar" score={analysis.grammarScore} />
          <ScoreCard label="Relevance" score={analysis.relevanceScore} />
        </div>
        <p className="text-sm text-gray-400 mt-4 bg-white/5 p-3 rounded">{analysis.executiveSummary}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-3">Strengths</h2>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-0.5">&#10003;</span><span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-3">Areas for Improvement</h2>
          <ul className="space-y-2">
            {analysis.areasForImprovement.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-yellow-500 mt-0.5">&#9888;</span><span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {analysis.suggestions.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-3">Suggestions ({analysis.suggestions.length})</h2>
          <div className="space-y-2">
            {analysis.suggestions.map((s, i) => (
              <div key={i} className="border border-white/10 rounded-lg overflow-hidden">
                <button onClick={() => setExpandedSuggestion(expandedSuggestion === i ? null : i)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      s.severity === 'high' ? 'bg-red-500/10 text-red-400' :
                      s.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-emerald-500/10 text-emerald-400'}`}>{s.severity}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400">{s.category}</span>
                  </div>
                  <span className="text-gray-400">{expandedSuggestion === i ? '-' : '+'}</span>
                </button>
                {expandedSuggestion === i && (
                  <div className="p-3 bg-white/5 border-t border-white/10 text-sm space-y-2">
                    {s.originalText && <div><span className="font-medium text-gray-500">Original:</span> <span className="line-through text-red-600">{s.originalText}</span></div>}
                    {s.suggestedText && <div><span className="font-medium text-gray-500">Suggested:</span> <span className="text-green-600">{s.suggestedText}</span></div>}
                    <p className="text-gray-400">{s.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`rounded-lg shadow-md p-6 ${analysis.integrityCheck.integrityScore >= 80 ? 'bg-emerald-500/10 border border-green-500/20' : analysis.integrityCheck.integrityScore >= 60 ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
        <h2 className="text-lg font-semibold mb-3">Integrity Check</h2>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl font-bold">{analysis.integrityCheck.integrityScore}/100</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            analysis.integrityCheck.integrityScore >= 80 ? 'bg-green-500/10 text-green-400' :
            analysis.integrityCheck.integrityScore >= 60 ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'}`}>
            {analysis.integrityCheck.integrityScore >= 80 ? 'Good' : analysis.integrityCheck.integrityScore >= 60 ? 'Review' : 'Concerns'}
          </span>
        </div>
        {analysis.integrityCheck.flaggedClaims.length > 0 && (
          <div className="mb-2"><p className="font-medium text-sm text-red-700">Flagged Claims:</p>
            <ul className="list-disc list-inside text-sm text-red-600">{analysis.integrityCheck.flaggedClaims.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
        )}
        {analysis.integrityCheck.fakeIndicators.length > 0 && (
          <div className="mb-2"><p className="font-medium text-sm text-red-700">Fake Indicators:</p>
            <ul className="list-disc list-inside text-sm text-red-600">{analysis.integrityCheck.fakeIndicators.map((f, i) => <li key={i}>{f}</li>)}</ul></div>
        )}
        {analysis.integrityCheck.warnings.length > 0 && (
          <div><p className="font-medium text-sm text-yellow-700">Warnings:</p>
            <ul className="list-disc list-inside text-sm text-yellow-600">{analysis.integrityCheck.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></div>
        )}
        {analysis.integrityCheck.flaggedClaims.length === 0 && analysis.integrityCheck.fakeIndicators.length === 0 && analysis.integrityCheck.warnings.length === 0 && (
          <p className="text-sm text-green-700">No integrity concerns detected.</p>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-3">Original Content</h2>
        <div className="bg-white/5 rounded p-4 text-sm whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">{analysis.originalContent}</div>
      </div>
    </div>
  );
}
