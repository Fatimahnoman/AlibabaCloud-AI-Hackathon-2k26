'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface CareerDetail {
  _id: string;
  title: string;
  slug: string;
  field: string;
  description: string;
  skills: string[];
  entryRoles: string[];
  furtherStudyOptions: string[];
  certifications: string[];
  relatedCourses: { _id: string; name: string; university: { name: string } }[];
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export default function CareerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [career, setCareer] = useState<CareerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get<{ data: { careerPath: CareerDetail } }>(`/api/education/career-paths/${slug}`)
      .then((res) => {
        const cp = res.data.careerPath;
        setCareer(
          cp
            ? {
                ...cp,
                skills: toArray(cp.skills),
                entryRoles: toArray(cp.entryRoles),
                furtherStudyOptions: toArray(cp.furtherStudyOptions),
                certifications: toArray(cp.certifications),
              }
            : null
        );
      })
      .catch((err) => setError(err.message || 'Failed to load career path'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 skeleton rounded w-1/3" />
        <div className="h-4 skeleton rounded w-2/3" />
        <div className="h-48 skeleton rounded" />
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Career path not found'}</p>
        <button onClick={() => router.back()} className="btn-secondary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <button onClick={() => router.back()} className="text-sm text-primary-600 hover:text-primary-700">&larr; Back</button>

      <div className="card">
        <h1 className="text-2xl font-bold gradient-text">{career.title}</h1>
        <p className="text-violet-400 mt-1">{career.field}</p>
        {career.description && (
          <p className="text-sm text-emerald-400 mt-4 whitespace-pre-line">{career.description}</p>
        )}
      </div>

      {(career.skills?.length ?? 0) > 0 && (
        <div className="card">
          <h2 className="font-semibold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {career.skills.map((s, i) => (
              <span key={i} className="text-sm bg-primary-500/10 text-primary-400 px-3 py-1 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}

      {(career.entryRoles?.length ?? 0) > 0 && (
        <div className="card">
          <h2 className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">Entry-Level Roles</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-emerald-400">
            {career.entryRoles.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      {(career.furtherStudyOptions?.length ?? 0) > 0 && (
        <div className="card">
          <h2 className="font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3">Further Study Options</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-emerald-400">
            {career.furtherStudyOptions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {(career.certifications?.length ?? 0) > 0 && (
        <div className="card">
          <h2 className="font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-3">Recommended Certifications</h2>
          <div className="flex flex-wrap gap-2">
            {career.certifications.map((c, i) => (
              <span key={i} className="text-sm bg-white/5 text-gray-300 px-3 py-1 rounded-full">{c}</span>
            ))}
          </div>
        </div>
      )}

      {career.relatedCourses?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">Related Courses</h2>
          <div className="divide-y divide-gray-100">
            {career.relatedCourses.map((c) => (
              <Link key={c._id} href={`/education/courses/${c._id}`} className="block py-3 hover:bg-white/5 -mx-2 px-2 rounded transition-colors">
                <p className="text-sm font-medium text-emerald-400">{c.name}</p>
                <p className="text-xs text-violet-400">{c.university?.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
