'use client';

import { useState } from 'react';
import { VerificationBadge } from '@/components/ui/verification-badge';

interface DomainResult {
  domain: string;
  data: Record<string, unknown>[];
  confidence: number;
  source: string;
}

interface OrchestrationResponse {
  result: {
    query: string;
    domains: DomainResult[];
    confidence: number;
    processedAt: string;
  };
  formattedMessage: string;
  isMultiDomain: boolean;
  confidence: number;
}

const EXAMPLE_PROMPTS = [
  'I want to study CS in Germany with a scholarship and limited budget',
  'Help me plan my education abroad with financial aid',
  'Find me universities, scholarships, and a study plan',
  'Complete education plan for UK',
  'Education roadmap with budget',
];

export default function EducationPlanPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrchestrationResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to process your request');
      }

      const data: OrchestrationResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <a href="/education" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Education Center
        </a>
        <h1 className="text-2xl font-bold text-gray-100">Education Planner</h1>
        <p className="text-gray-500 mt-1">
          Describe your education goals and get a comprehensive plan covering universities, scholarships, budget, and roadmap.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
            Describe your education goals
          </label>
          <textarea
            id="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. I want to study CS in Germany with a scholarship and limited budget"
            className="input-field"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={!message.trim() || loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Planning...' : 'Plan My Education'}
        </button>
      </form>

      {loading && (
        <div className="card space-y-4">
          <div className="h-6 skeleton rounded w-1/3 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 skeleton rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="card border-red-200 bg-red-500/10">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-100">🎯 Target Degree</h2>
              <span className="text-xs text-gray-400">
                Confidence: {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {result.isMultiDomain
                ? 'Multi-domain query detected — analyzing across education, scholarships, budget, and career.'
                : 'Single domain query detected.'}
            </p>
          </div>

          {result.result.domains.map((domain) => (
            <div key={domain.domain} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-100 capitalize">
                  {domain.domain === 'education' && '🏫 University Shortlist'}
                  {domain.domain === 'scholarship' && '🎁 Scholarship Matches'}
                  {domain.domain === 'budget' && '💰 Budget Estimate'}
                  {domain.domain === 'career' && '💼 Career Paths'}
                  {domain.domain === 'visa' && '✈️ Visa Requirements'}
                  {domain.domain === 'university' && '🏫 Universities'}
                </h3>
                <VerificationBadge
                  status={domain.confidence > 0.7 ? 'verified' : 'needs_review'}
                />
              </div>
              <div className="text-sm text-gray-400 space-y-2">
                <p>
                  <span className="font-medium">Source:</span> {domain.source === 'database' ? '✅ Verified Database' : '⚠️ AI-Generated'}
                </p>
                <p>
                  <span className="font-medium">Confidence:</span> {(domain.confidence * 100).toFixed(0)}%
                </p>
                {domain.data.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {domain.data.map((item, idx) => (
                      <li key={idx}>{JSON.stringify(item)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">No verified data available for this domain yet.</p>
                )}
              </div>
            </div>
          ))}

          <div className="card">
            <h3 className="text-base font-semibold text-gray-100 mb-3">📋 Documents Checklist</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Valid passport</li>
              <li>• Academic transcripts</li>
              <li>• English proficiency test score (IELTS/TOEFL)</li>
              <li>• Statement of Purpose</li>
              <li>• Letters of Recommendation</li>
              <li>• Financial proof / bank statement</li>
              <li>• Scholarship application (if applicable)</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-base font-semibold text-gray-100 mb-3">🗓 Roadmap</h3>
            <div className="text-sm text-gray-400 space-y-3">
              <div className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <p>Research universities and shortlist 3-5 options based on your field and budget.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <p>Check eligibility and scholarship deadlines for each shortlisted university.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <p>Prepare documents: transcripts, test scores, SOP, and recommendation letters.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-primary-600">4.</span>
                <p>Submit applications and scholarship forms before deadlines.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-primary-600">5.</span>
                <p>Evaluate offers and prepare visa application.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-base font-semibold text-gray-100 mb-3">➡ Next Actions</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Review the detected domains and refine your query if needed.</li>
              <li>• Connect verified university and scholarship data for better results.</li>
              <li>• Set up a budget tracker to monitor education expenses.</li>
              <li>• Start preparing documents listed above.</li>
            </ul>
          </div>

          <div className="card bg-white/[0.02] border-dashed">
            <h3 className="text-base font-semibold text-gray-100 mb-2">💬 Raw AI Context</h3>
            <pre className="text-xs text-gray-500 whitespace-pre-wrap font-mono">
              {result.formattedMessage}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
