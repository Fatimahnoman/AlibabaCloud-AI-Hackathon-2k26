'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface CourseDetail {
  id: string;
  name: string;
  degree: string;
  duration: string | null;
  language: string | null;
  tuitionFee: number | null;
  currency: string | null;
  description: string | null;
  university: {
    id: string;
    name: string;
    country: string;
    city: string | null;
    website: string | null;
    type: string;
  };
  admissionRequirements: {
    id: string;
    requirementType: string;
    requirementValue: string;
    notes: string | null;
  }[];
}

const DEGREE_LABELS: Record<string, string> = {
  bachelor: 'Bachelor',
  master: 'Master',
  intermediate: 'Intermediate',
  secondary: 'Secondary',
  'higher-secondary': 'Higher Secondary',
  phd: 'PhD',
  certificate: 'Certificate',
  diploma: 'Diploma',
};

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiClient.get<{ data: { course: CourseDetail } }>(`/api/education/courses/${id}`)
      .then((res) => setCourse(res.data.course))
      .catch((err) => setError(err.message || 'Failed to load course'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post('/api/education/saved', { type: 'course', itemId: id });
      setSaved(true);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-3xl">
        <div className="h-6 skeleton rounded w-24" />
        <div className="h-8 skeleton rounded w-1/2" />
        <div className="h-4 skeleton rounded w-1/3" />
        <div className="h-48 skeleton rounded" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="card text-center py-12">
        <div className="text-4xl mb-3">📚</div>
        <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
        <button onClick={() => router.back()} className="btn-secondary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <button onClick={() => router.back()} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {DEGREE_LABELS[course.degree] || course.degree}
            </span>
            <h1 className="text-2xl font-bold gradient-text mt-2">{course.name}</h1>
            <Link href={`/education/universities/${course.university.id}`} className="text-emerald-600 hover:underline mt-1 inline-block">
              {course.university.name} — {course.university.city || ''}, {course.university.country}
            </Link>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${saved ? 'bg-green-500/10 text-green-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            {saved ? 'Saved' : saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {course.duration && (
          <div className="card text-center py-4">
            <p className="text-sm text-violet-400">Duration</p>
            <p className="font-semibold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{course.duration}</p>
          </div>
        )}
        {course.language && (
          <div className="card text-center py-4">
            <p className="text-sm text-violet-400">Language</p>
            <p className="font-semibold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{course.language}</p>
          </div>
        )}
        {course.tuitionFee && (
          <div className="card text-center py-4">
            <p className="text-sm text-violet-400">Tuition Fee</p>
            <p className="font-semibold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{course.currency} {Number(course.tuitionFee).toLocaleString()}/year</p>
          </div>
        )}
      </div>

      {course.description && (
        <div className="card">
          <h2 className="font-semibold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">About this course</h2>
          <p className="text-emerald-400 leading-relaxed">{course.description}</p>
        </div>
      )}

      {course.admissionRequirements.length > 0 && (
        <div className="card">
          <h2 className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">Admission Requirements</h2>
          <div className="space-y-3">
            {course.admissionRequirements.map((req) => (
              <div key={req.id} className="border-l-4 border-emerald-200 pl-3">
                <h3 className="font-medium bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent capitalize">{req.requirementType.replace(/_/g, ' ')}</h3>
                <p className="text-sm text-emerald-400 mt-0.5">{req.requirementValue}</p>
                {req.notes && <p className="text-xs text-violet-400 mt-0.5">{req.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
