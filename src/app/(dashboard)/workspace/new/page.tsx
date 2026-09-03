'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function NewWorkspacePage() {
  const router = useRouter();
  const [entityType, setEntityType] = useState<string>('university');
  const [title, setTitle] = useState('');
  const [programName, setProgramName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [country, setCountry] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<string>('medium');
  const [officialUrl, setOfficialUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setCreating(true);
    setError('');

    try {
      const wsRes = await apiClient.post<{ data: { id: string } }>('/api/workspace', {
        entityType,
        title: title.trim(),
        programName: programName.trim() || undefined,
        institutionName: institutionName.trim() || undefined,
        country: country.trim() || undefined,
        deadline: deadline || undefined,
        priority,
        officialUrl: officialUrl.trim() || undefined,
      });

      const workspaceId = wsRes.data.id;

      try {
        const defaultsRes = await apiClient.get<{ data: { items: { label: string; category: string; order: number }[] } }>(
          `/api/workspace/defaults?entityType=${entityType}`
        );

        for (const item of defaultsRes.data.items) {
          await apiClient.post(`/api/workspace/${workspaceId}/checklist`, {
            label: item.label,
            category: item.category,
          });
        }
      } catch {}

      router.push(`/workspace/${workspaceId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/workspace" className="text-emerald-600 hover:underline text-sm">Workspace</Link>
        <span className="text-gray-400 text-sm">/</span>
        <span className="text-sm text-gray-400">New Application</span>
      </div>

      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Create New Application</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Application Type *</label>
            <div className="grid grid-cols-3 gap-3">
              {(['university', 'scholarship', 'course'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEntityType(type)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                    entityType === type
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700'
                      : 'border-white/10 text-gray-400 hover:border-white/10'
                  }`}
                >
                  {type === 'university' && '🎓'}{' '}
                  {type === 'scholarship' && '🏆'}{' '}
                  {type === 'course' && '📚'}{' '}
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MIT Computer Science PhD"
              className="w-full input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Program Name</label>
              <input
                type="text"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Institution Name</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g. Massachusetts Institute of Technology"
                className="w-full input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States"
                className="w-full input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
            <div className="grid grid-cols-4 gap-3">
              {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`p-2 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                    priority === p
                      ? p === 'low' ? 'border-gray-500 bg-white/5 text-gray-300'
                      : p === 'medium' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : p === 'high' ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-white/10 text-gray-400 hover:border-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Official URL</label>
            <input
              type="url"
              value={officialUrl}
              onChange={(e) => setOfficialUrl(e.target.value)}
              placeholder="https://..."
              className="w-full input-field"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Application'}
            </button>
            <Link href="/workspace" className="text-gray-400 hover:text-gray-100 text-sm">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
