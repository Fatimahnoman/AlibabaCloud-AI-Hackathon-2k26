'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
  dueDate?: string;
  category?: string;
  notes?: string;
  order: number;
}

interface WorkspaceData {
  id: string;
  entityType: string;
  title: string;
  programName?: string;
  institutionName?: string;
  country?: string;
  deadline?: string;
  status: string;
  priority: string;
  notes?: string;
  officialUrl?: string;
  documentsJson: string;
  requirementsJson: string;
  checklistItems: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  researching: 'bg-emerald-500/10 text-emerald-400',
  preparing: 'bg-yellow-500/10 text-yellow-400',
  documents_ready: 'bg-purple-500/10 text-purple-400',
  submitted: 'bg-indigo-500/10 text-indigo-400',
  under_review: 'bg-orange-500/10 text-orange-400',
  accepted: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
  waitlisted: 'bg-white/5 text-gray-200',
  deferred: 'bg-amber-500/10 text-amber-400',
  withdrawn: 'bg-white/5 text-gray-200',
};

const priorityColors: Record<string, string> = {
  low: 'bg-white/5 text-gray-400',
  medium: 'bg-emerald-500/10 text-emerald-400',
  high: 'bg-orange-500/10 text-orange-400',
  urgent: 'bg-red-500/10 text-red-400',
};

const statusLabels: Record<string, string> = {
  researching: 'Researching',
  preparing: 'Preparing',
  documents_ready: 'Documents Ready',
  submitted: 'Submitted',
  under_review: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
  deferred: 'Deferred',
  withdrawn: 'Withdrawn',
};

const timelineSteps = ['researching', 'preparing', 'documents_ready', 'submitted', 'under_review'];
const terminalStatuses = ['accepted', 'rejected'];

const categoryLabels: Record<string, string> = {
  research: 'Research',
  documents: 'Documents',
  submission: 'Submission',
  financial: 'Financial',
  visa: 'Visa',
  logistics: 'Logistics',
};

const categoryColors: Record<string, string> = {
  research: 'bg-emerald-500/10 text-emerald-700',
  documents: 'bg-purple-500/10 text-purple-700',
  submission: 'bg-indigo-500/10 text-indigo-700',
  financial: 'bg-emerald-500/10 text-green-700',
  visa: 'bg-orange-500/10 text-orange-400',
  logistics: 'bg-white/5 text-gray-300',
};

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newCategory, setNewCategory] = useState('research');
  const [notesValue, setNotesValue] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: WorkspaceData }>(`/api/workspace/${workspaceId}`);
      setWorkspace(res.data);
      setNotesValue(res.data.notes || '');
    } catch {
      setError('Failed to load workspace');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  async function handleToggleItem(itemId: string, current: boolean) {
    try {
      await apiClient.patch(`/api/workspace/${workspaceId}/checklist/${itemId}`, {
        isCompleted: !current,
      });
      setWorkspace((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          checklistItems: prev.checklistItems.map((item) =>
            item.id === itemId ? { ...item, isCompleted: !current } : item
          ),
        };
      });
    } catch {}
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    try {
      const res = await apiClient.post<{ data: ChecklistItem }>(
        `/api/workspace/${workspaceId}/checklist`,
        { label: newLabel, dueDate: newDueDate || null, category: newCategory }
      );
      setWorkspace((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          checklistItems: [...prev.checklistItems, res.data],
        };
      });
      setNewLabel('');
      setNewDueDate('');
    } catch {}
  }

  async function handleDeleteItem(itemId: string) {
    try {
      await apiClient.delete(`/api/workspace/${workspaceId}/checklist/${itemId}`);
      setWorkspace((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          checklistItems: prev.checklistItems.filter((item) => item.id !== itemId),
        };
      });
    } catch {}
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      await apiClient.patch(`/api/workspace/${workspaceId}`, { notes: notesValue });
    } catch {} finally {
      setSavingNotes(false);
    }
  }

  async function handleDeleteWorkspace() {
    if (!confirm('Are you sure you want to delete this workspace?')) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/workspace/${workspaceId}`);
      router.push('/workspace');
    } catch {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card p-6 animate-pulse space-y-4">
          <div className="h-6 skeleton rounded w-1/3" />
          <div className="h-4 skeleton rounded w-1/4" />
          <div className="h-4 skeleton rounded w-1/2" />
        </div>
        <div className="card p-6 animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 skeleton rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="card p-6 text-center">
        <p className="text-red-600 mb-4">{error || 'Workspace not found'}</p>
        <Link href="/workspace" className="text-emerald-600 hover:underline">Back to workspace</Link>
      </div>
    );
  }

  const completedCount = workspace.checklistItems.filter((i) => i.isCompleted).length;
  const totalCount = workspace.checklistItems.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const groupedItems: Record<string, ChecklistItem[]> = {};
  for (const item of workspace.checklistItems) {
    const cat = item.category || 'research';
    if (!groupedItems[cat]) groupedItems[cat] = [];
    groupedItems[cat].push(item);
  }

  const daysLeft = workspace.deadline
    ? Math.ceil((new Date(workspace.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const documents = workspace.documentsJson ? JSON.parse(workspace.documentsJson) : [];
  const requirements = workspace.requirementsJson ? JSON.parse(workspace.requirementsJson) : [];

  const currentStatusIndex = timelineSteps.indexOf(workspace.status);
  const isTerminal = terminalStatuses.includes(workspace.status);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/workspace" className="text-emerald-600 hover:underline text-sm">Workspace</Link>
        <span className="text-gray-400 text-sm">/</span>
        <span className="text-sm text-gray-400 truncate">{workspace.title}</span>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{workspace.title}</h1>
            {workspace.institutionName && (
              <p className="text-gray-400 mt-1">{workspace.institutionName}</p>
            )}
            {workspace.programName && (
              <p className="text-sm text-gray-500">{workspace.programName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full ${statusColors[workspace.status] || 'bg-white/5 text-gray-400'}`}>
              {statusLabels[workspace.status] || workspace.status}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full capitalize ${priorityColors[workspace.priority] || 'bg-white/5 text-gray-400'}`}>
              {workspace.priority}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="capitalize">{workspace.entityType}</span>
          {workspace.country && <span>{workspace.country}</span>}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Status Timeline</h2>
        <div className="flex items-center">
          {isTerminal ? (
            <div className="flex items-center w-full">
              {timelineSteps.map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        index <= currentStatusIndex || (workspace.status === 'accepted' && index < timelineSteps.length)
                          ? 'bg-green-500 text-white'
                          : workspace.status === 'rejected' && index <= currentStatusIndex
                          ? 'bg-red-500 text-white'
                          : 'bg-white/5 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                      {statusLabels[step] || step}
                    </span>
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 ${
                      index < currentStatusIndex || (workspace.status === 'accepted' && index < timelineSteps.length - 1)
                        ? 'bg-green-500'
                        : 'bg-white/5'
                    }`} />
                  )}
                </div>
              ))}
              <div className="flex flex-col items-center ml-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  workspace.status === 'accepted' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {workspace.status === 'accepted' ? '✓' : '✗'}
                </div>
                <span className="text-xs text-gray-500 mt-1">{statusLabels[workspace.status]}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center w-full">
              {timelineSteps.map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        index <= currentStatusIndex
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/5 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                      {statusLabels[step] || step}
                    </span>
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 ${
                      index < currentStatusIndex ? 'bg-emerald-500' : 'bg-white/5'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Checklist</h2>
          <span className="text-sm text-gray-500">{completedCount} of {totalCount} completed</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2 mb-6">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <form onSubmit={handleAddItem} className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-white/5 rounded-lg">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-400 mb-1">Label</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Add checklist item..."
              className="w-full input-field"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Due Date</label>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="input-field"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors">
            Add
          </button>
        </form>

        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 px-2 py-1 rounded inline-block ${categoryColors[category] || 'bg-white/5 text-gray-300'}`}>
                {categoryLabels[category] || category}
              </h3>
              <div className="space-y-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 group">
                    <button
                      onClick={() => handleToggleItem(item.id, item.isCompleted)}
                      className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        item.isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-white/10 hover:border-emerald-400'
                      }`}
                    >
                      {item.isCompleted && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-100'}`}>
                        {item.label}
                      </p>
                      {item.dueDate && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {workspace.checklistItems.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No checklist items yet. Add one above.</p>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Key Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {workspace.deadline && (
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-xs font-medium text-gray-500 uppercase">Deadline</p>
              <p className="text-sm font-semibold text-gray-100 mt-1">
                {new Date(workspace.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {daysLeft !== null && (
                <p className={`text-xs mt-1 ${daysLeft <= 0 ? 'text-red-600' : daysLeft <= 7 ? 'text-orange-600' : 'text-gray-500'}`}>
                  {daysLeft <= 0 ? 'Deadline passed' : `${daysLeft} days remaining`}
                </p>
              )}
            </div>
          )}
          {workspace.officialUrl && (
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-xs font-medium text-gray-500 uppercase">Official Website</p>
              <a
                href={workspace.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-600 hover:underline mt-1 block truncate"
              >
                {workspace.officialUrl}
              </a>
            </div>
          )}
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Notes</label>
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            rows={4}
            className="w-full input-field"
            placeholder="Add notes about this application..."
          />
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="mt-2 btn-secondary"
          >
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Documents</h2>
          <div className="space-y-2">
            {documents.map((doc: { name: string; status: string }, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-sm text-gray-100">{doc.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  doc.status === 'uploaded' ? 'bg-green-500/10 text-green-400' :
                  doc.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {requirements.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Requirements</h2>
          <div className="space-y-2">
            {requirements.map((req: { type: string; description: string; mandatory: boolean }, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-100">{req.type}</p>
                  <p className="text-xs text-gray-500">{req.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  req.mandatory ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-gray-400'
                }`}>
                  {req.mandatory ? 'Required' : 'Optional'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <button
          onClick={handleDeleteWorkspace}
          disabled={deleting}
          className="text-red-600 text-sm hover:underline disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete this workspace'}
        </button>
      </div>
    </div>
  );
}
