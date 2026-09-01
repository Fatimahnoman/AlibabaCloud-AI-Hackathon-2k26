'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';

interface Assessment {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  questions: string;
  createdAt: string;
}

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard'];

export default function TeacherAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const [formSubject, setFormSubject] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('medium');
  const [formCount, setFormCount] = useState('10');

  async function fetchAssessments() {
    try {
      const res = await fetch('/api/teacher/assessments');
      if (res.ok) {
        const data = await res.json();
        setAssessments(data.assessments || data || []);
      } else {
        setError('Failed to load assessments');
      }
    } catch {
      setError('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAssessments();
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/teacher/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formSubject,
          topic: formTopic,
          difficulty: formDifficulty,
          questionCount: parseInt(formCount),
        }),
      });
      if (res.ok) {
        await fetchAssessments();
        setShowForm(false);
        setFormSubject('');
        setFormTopic('');
        setFormDifficulty('medium');
        setFormCount('10');
      }
    } catch {
      setError('Failed to generate assessment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/teacher/assessments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAssessments((prev) => prev.filter((a) => a.id !== id));
        if (viewingId === id) setViewingId(null);
      }
    } catch {
      setError('Failed to delete assessment');
    }
  }

  const viewingAssessment = assessments.find((a) => a.id === viewingId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/teacher" className="text-blue-600 hover:text-blue-800 text-sm font-medium">&larr; Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Assessments</h1>
          <p className="text-gray-500 mt-1">Generate and manage AI-powered assessments</p>
        </div>
      </div>

      <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Generate New'}</Button>

      {showForm && (
        <form onSubmit={handleGenerate} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
              <input
                type="text"
                required
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="w-full input-field"
                placeholder="e.g. Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Topic</label>
              <input
                type="text"
                required
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                className="w-full input-field"
                placeholder="e.g. Photosynthesis"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value)}
                className="w-full input-field"
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d} className="capitalize">{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Number of Questions</label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={formCount}
                onChange={(e) => setFormCount(e.target.value)}
                className="w-full input-field"
              />
            </div>
          </div>
          <Button type="submit" isLoading={submitting}>Generate Assessment</Button>
        </form>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error}</div>
      )}

      {viewingAssessment && (
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-100">{viewingAssessment.topic}</h2>
              <p className="text-sm text-gray-500">
                {viewingAssessment.subject} &middot; {viewingAssessment.difficulty} &middot; {viewingAssessment.questionCount} questions
              </p>
            </div>
            <button onClick={() => setViewingId(null)} className="text-gray-400 hover:text-gray-400 text-sm">&times; Close</button>
          </div>
          <div className="prose prose-sm max-w-none text-gray-300 whitespace-pre-wrap">{viewingAssessment.questions}</div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : assessments.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-500">No assessments yet. Generate one to get started!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Topic</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Difficulty</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Questions</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assessments.map((assess) => (
                <tr key={assess.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-gray-100 font-medium">{assess.topic}</td>
                  <td className="px-4 py-3 text-gray-400">{assess.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      assess.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                      assess.difficulty === 'hard' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {assess.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{assess.questionCount}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(assess.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => setViewingId(assess.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                    <button onClick={() => handleDelete(assess.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
