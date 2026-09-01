'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';

interface Homework {
  id: string;
  subject: string;
  topic: string;
  grade: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
}

export default function TeacherHomeworkPage() {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formSubject, setFormSubject] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formGrade, setFormGrade] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDueDays, setFormDueDays] = useState('7');

  async function fetchHomework() {
    try {
      const res = await fetch('/api/teacher/homework');
      if (res.ok) {
        const data = await res.json();
        setHomeworkList(data.homework || data || []);
      } else {
        setError('Failed to load homework');
      }
    } catch {
      setError('Failed to load homework');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchHomework();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/teacher/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formSubject,
          topic: formTopic,
          grade: formGrade,
          title: formTitle,
          description: formDescription,
          dueDays: parseInt(formDueDays),
        }),
      });
      if (res.ok) {
        await fetchHomework();
        setShowForm(false);
        setFormSubject('');
        setFormTopic('');
        setFormGrade('');
        setFormTitle('');
        setFormDescription('');
        setFormDueDays('7');
      }
    } catch {
      setError('Failed to create homework');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/teacher/homework/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHomeworkList((prev) => prev.filter((h) => h.id !== id));
      }
    } catch {
      setError('Failed to delete homework');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/teacher" className="text-blue-600 hover:text-blue-800 text-sm font-medium">&larr; Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Homework</h1>
          <p className="text-gray-500 mt-1">Create and manage homework assignments</p>
        </div>
      </div>

      <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Create New'}</Button>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
              <input
                type="text"
                required
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="input-field"
                placeholder="e.g. English"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Topic</label>
              <input
                type="text"
                required
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                className="input-field"
                placeholder="e.g. Essay Writing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Grade Level</label>
              <input
                type="text"
                required
                value={formGrade}
                onChange={(e) => setFormGrade(e.target.value)}
                className="input-field"
                placeholder="e.g. 10th"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="input-field"
                placeholder="Assignment title"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Assignment details and instructions"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Due in (days)</label>
              <input
                type="number"
                min="1"
                required
                value={formDueDays}
                onChange={(e) => setFormDueDays(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <Button type="submit" isLoading={submitting}>Create Homework</Button>
        </form>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : homeworkList.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-500">No homework assignments yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Grade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Due Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {homeworkList.map((hw) => {
                const isOverdue = new Date(hw.dueDate) < new Date();
                return (
                  <tr key={hw.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="text-gray-100 font-medium">{hw.title}</p>
                      {hw.description && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{hw.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{hw.subject}</td>
                    <td className="px-4 py-3 text-gray-400">{hw.grade}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                        {new Date(hw.dueDate).toLocaleDateString()}
                        {isOverdue && ' (overdue)'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(hw.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
