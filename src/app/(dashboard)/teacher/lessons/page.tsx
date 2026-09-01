'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';

interface LessonPlan {
  id: string;
  subject: string;
  topic: string;
  grade: string;
  durationMin: number;
  content: string;
  createdAt: string;
}

export default function TeacherLessonsPage() {
  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const [formSubject, setFormSubject] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formGrade, setFormGrade] = useState('');
  const [formDuration, setFormDuration] = useState('45');

  async function fetchLessons() {
    try {
      const res = await fetch('/api/teacher/lessons');
      if (res.ok) {
        const data = await res.json();
        setLessons(data.lessonPlans || data || []);
      } else {
        setError('Failed to load lesson plans');
      }
    } catch {
      setError('Failed to load lesson plans');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLessons();
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/teacher/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formSubject,
          topic: formTopic,
          grade: formGrade,
          durationMin: parseInt(formDuration),
        }),
      });
      if (res.ok) {
        await fetchLessons();
        setShowForm(false);
        setFormSubject('');
        setFormTopic('');
        setFormGrade('');
        setFormDuration('45');
      }
    } catch {
      setError('Failed to generate lesson plan');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/teacher/lessons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLessons((prev) => prev.filter((l) => l.id !== id));
        if (viewingId === id) setViewingId(null);
      }
    } catch {
      setError('Failed to delete lesson plan');
    }
  }

  const viewingLesson = lessons.find((l) => l.id === viewingId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/teacher" className="text-blue-600 hover:text-blue-800 text-sm font-medium">&larr; Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Lesson Plans</h1>
          <p className="text-gray-500 mt-1">Generate and manage AI-powered lesson plans</p>
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
                className="input-field"
                placeholder="e.g. Mathematics"
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
                placeholder="e.g. Fractions"
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
                placeholder="e.g. 8th"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="5"
                required
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <Button type="submit" isLoading={submitting}>Generate Lesson Plan</Button>
        </form>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error}</div>
      )}

      {viewingLesson && (
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-100">{viewingLesson.topic}</h2>
              <p className="text-sm text-gray-500">{viewingLesson.subject} &middot; Grade {viewingLesson.grade} &middot; {viewingLesson.durationMin} min</p>
            </div>
            <button onClick={() => setViewingId(null)} className="text-gray-400 hover:text-gray-400 text-sm">&times; Close</button>
          </div>
          <div className="prose prose-sm max-w-none text-gray-300 whitespace-pre-wrap">{viewingLesson.content}</div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : lessons.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-500">No lesson plans yet. Generate one to get started!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Topic</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Grade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Duration</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-gray-100 font-medium">{lesson.topic}</td>
                  <td className="px-4 py-3 text-gray-400">{lesson.subject}</td>
                  <td className="px-4 py-3 text-gray-400">{lesson.grade}</td>
                  <td className="px-4 py-3 text-gray-400">{lesson.durationMin} min</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(lesson.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => setViewingId(lesson.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                    <button onClick={() => handleDelete(lesson.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
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
