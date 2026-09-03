'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { VerificationBadge } from '@/components/ui/verification-badge';

interface SchemeRequirement {
  requirementType: string;
  requirementValue: string;
  isRequired: boolean;
}

interface SchemeDocument {
  documentName: string;
  description: string;
  isRequired: boolean;
}

interface Scheme {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  eligibilityCriteria: string;
  applicationProcess: string;
  deadline: string;
  amount: number;
  currency: string;
  website: string;
  province: string;
  targetAudience: string;
  status: string;
  verificationStatus: string;
  requirements: SchemeRequirement[];
  documents: SchemeDocument[];
}

const categoryLabels: Record<string, string> = {
  scholarship: 'Scholarship',
  loan: 'Youth Loan',
  training: 'Training Program',
  stipend: 'Stipend',
  housing: 'Housing',
  digital: 'Digital/Laptop',
  financial_aid: 'Financial Aid',
  sports: 'Sports',
  health: 'Health',
};

export default function SchemeDetailPage() {
  const params = useParams();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchScheme() {
      try {
        const res = await apiClient.get<{ data: Scheme }>(`/api/education/schemes/${params.id}`);
        setScheme(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scheme');
      } finally {
        setLoading(false);
      }
    }
    fetchScheme();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card animate-pulse space-y-3">
          <div className="h-6 skeleton rounded w-3/4" />
          <div className="h-4 skeleton rounded w-1/2" />
          <div className="h-4 skeleton rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="card bg-red-500/10 border-red-200">
        <p className="text-sm text-red-700">{error || 'Scheme not found'}</p>
        <Link href="/education/schemes" className="text-sm text-primary-600 hover:underline mt-2 inline-block">Back to Schemes</Link>
      </div>
    );
  }

  const daysLeft = scheme.deadline ? Math.ceil((new Date(scheme.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/education/schemes" className="text-sm text-primary-600 hover:underline">&larr; Back to Schemes</Link>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{scheme.name}</h1>
            <p className="text-gray-400 mt-1">{scheme.provider}</p>
          </div>
          <VerificationBadge status={scheme.verificationStatus === 'verified' ? 'verified' : 'unverified'} />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full">
            {categoryLabels[scheme.category] || scheme.category}
          </span>
          {scheme.province && scheme.province !== 'all' && (
            <span className="text-xs bg-white/5 text-gray-400 px-3 py-1 rounded-full capitalize">{scheme.province}</span>
          )}
          {scheme.province === 'all' && (
            <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full">All Pakistan</span>
          )}
          {scheme.amount > 0 && (
            <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full font-medium">
              {scheme.currency} {Number(scheme.amount).toLocaleString()}
            </span>
          )}
          {daysLeft !== null && (
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${daysLeft <= 14 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
              {daysLeft <= 0 ? 'Application deadline passed' : daysLeft <= 90 ? `Application: ${daysLeft} days left` : `Application deadline: ${new Date(scheme.deadline!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </span>
          )}
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-gray-100 mb-2">About This Scheme</h2>
          <p className="text-gray-300 leading-relaxed">{scheme.description}</p>
        </div>

        {scheme.targetAudience && (
          <div className="mt-4">
            <h2 className="font-semibold text-gray-100 mb-2">Target Audience</h2>
            <p className="text-gray-300">{scheme.targetAudience}</p>
          </div>
        )}
      </div>

      {scheme.deadline && (
        <div className={`card ${daysLeft !== null && daysLeft <= 14 && daysLeft > 0 ? 'border-red-300 bg-red-500/10' : ''}`}>
          <h2 className="font-semibold text-gray-100 mb-2">Application Deadline</h2>
          <p className="text-sm text-gray-300">{new Date(scheme.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          {daysLeft !== null && (
            <p className={`text-sm font-medium mt-1 ${daysLeft <= 0 ? 'text-gray-500' : daysLeft <= 14 ? 'text-red-600' : 'text-green-600'}`}>
              {daysLeft <= 0 ? 'This application deadline has passed. Check the official website for next cycle dates.' : daysLeft <= 14 ? `Only ${daysLeft} days left to submit your application!` : `${daysLeft} days remaining to submit your application.`}
            </p>
          )}
          {daysLeft !== null && daysLeft > 90 && (
            <p className="text-xs text-amber-600 mt-2">⚠ This is an estimated deadline based on previous years. Please verify the exact deadline with the scheme provider.</p>
          )}
        </div>
      )}

      {scheme.eligibilityCriteria && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Eligibility Criteria</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line">{scheme.eligibilityCriteria}</div>
        </div>
      )}

      {scheme.requirements.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Requirements</h2>
          <div className="space-y-2">
            {scheme.requirements.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${r.isRequired ? 'bg-red-500' : 'bg-[#475569]'}`} />
                <div>
                  <span className="font-medium text-gray-100 capitalize">{r.requirementType}: </span>
                  <span className="text-gray-300">{r.requirementValue}</span>
                  {!r.isRequired && <span className="text-xs text-gray-500 ml-1">(Recommended)</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {scheme.documents.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Required Documents</h2>
          <div className="space-y-2">
            {scheme.documents.map((d, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${d.isRequired ? 'bg-red-500' : 'bg-[#475569]'}`} />
                <div>
                  <span className="font-medium text-gray-100">{d.documentName}</span>
                  {d.description && <span className="text-gray-400 ml-1">— {d.description}</span>}
                  {!d.isRequired && <span className="text-xs text-gray-500 ml-1">(Optional)</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {scheme.applicationProcess && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">How to Apply</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line">{scheme.applicationProcess}</div>
        </div>
      )}

      {scheme.website && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-2">Official Website</h2>
          <a href={scheme.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
            {scheme.website}
          </a>
        </div>
      )}
    </div>
  );
}
