'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface Topic {
  id: string;
  subject: string;
  topic: string;
  masteryLevel: number;
  priority: 'low' | 'medium' | 'high';
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-green-500/10 text-green-400',
  medium: 'bg-yellow-500/10 text-yellow-400',
  high: 'bg-red-500/10 text-red-400',
};

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formSubject, setFormSubject] = useState('');
  const [formName, setFormName] = useState('');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');

  async function fetchTopics() {
    try {
      const data = await apiClient.get<{ data: Topic[] }>('/api/study/topics');
      setTopics(data.data || []);
    } catch {
      setError('Failed to load topics');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTopics();
  }, []);

  async function handleAddTopic(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/api/study/topics', {
        subject: formSubject,
        topic: formName,
        priority: formPriority,
      });
      await fetchTopics();
      setShowForm(false);
      setFormSubject('');
      setFormName('');
      setFormPriority('medium');
    } catch {
      setError('Failed to add topic');
    } finally {
      setSubmitting(false);
    }
  }

  const groupedBySubject = topics.reduce<Record<string, Topic[]>>((acc, topic) => {
    if (!acc[topic.subject]) acc[topic.subject] = [];
    acc[topic.subject].push(topic);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/study-planner" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">&larr; Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Study Topics</h1>
          <p className="text-gray-500 mt-1">Track your mastery of individual topics</p>
        </div>
      </div>

      <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add Topic'}</Button>

      {showForm && (
        <form onSubmit={handleAddTopic} className="card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Topic Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="input-field"
                placeholder="e.g. Quadratic Equations"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <Button type="submit" isLoading={submitting}>Save Topic</Button>
        </form>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : topics.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-500">No topics yet. Add one to start tracking!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBySubject).map(([subject, subjectTopics]) => (
            <div key={subject}>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">{subject}</h2>
              <div className="card divide-y divide-white/10">
                {subjectTopics.map((topic) => (
                  <div key={topic.id} className="px-4 py-3 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-100 truncate">{topic.topic}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PRIORITY_STYLES[topic.priority] || PRIORITY_STYLES.medium}`}>
                          {topic.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/5 rounded-full h-2">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all"
                            style={{ width: `${topic.masteryLevel}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 w-10 text-right">{topic.masteryLevel}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
