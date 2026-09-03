'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface TodaySummary {
  totalMinutes: number;
  sessionCount: number;
}

const DEFAULT_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Computer Science', 'Urdu', 'Islamiat', 'Pakistan Studies',
  'Economics', 'Accounting', 'Business Studies', 'History',
  'Political Science', 'Psychology', 'Sociology', 'Law',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Medical Science', 'Pharmacy', 'Art & Design', 'Music',
];

export default function StudyTimerPage() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);
  const [savedSession, setSavedSession] = useState(false);
  const [saving, setSaving] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTodaySummary = useCallback(async () => {
    try {
      const data = await apiClient.get<{ data: { sessions: { durationMin: number; startTime: string }[] } }>('/api/study/sessions');
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = (data.data?.sessions || []).filter((s) => {
        const sessionDate = new Date(s.startTime).toISOString().split('T')[0];
        return sessionDate === today;
      });
      setTodaySummary({
        totalMinutes: todaySessions.reduce((sum, s) => sum + s.durationMin, 0),
        sessionCount: todaySessions.length,
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchTodaySummary();
  }, [fetchTodaySummary]);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const data = await apiClient.get<{ data: { subject: string }[] }>('/api/study/topics');
        const topicList = data.data || [];
        const userSubjects = [...new Set(topicList.map((t) => t.subject))] as string[];
        // Merge user subjects with defaults, no duplicates
        const allSubjects = [...new Set([...userSubjects, ...DEFAULT_SUBJECTS])];
        setSubjects(allSubjects);
      } catch {
        // Use defaults if API fails
        setSubjects(DEFAULT_SUBJECTS);
      }
    }
    loadSubjects();
  }, []);

  function startTimer() {
    if (!subject) return;
    setIsRunning(true);
    setSavedSession(false);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }

  async function stopTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setSaving(true);

    try {
      await apiClient.post('/api/study/sessions', {
        subject,
        topic,
        durationMin: Math.max(1, Math.round(elapsedSeconds / 60)),
        startTime: new Date().toISOString(),
      });
      setSavedSession(true);
      fetchTodaySummary();
    } catch {
      // handle silently
    } finally {
      setSaving(false);
    }
  }

  function resetTimer() {
    setElapsedSeconds(0);
    setSavedSession(false);
    setTopic('');
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/study-planner" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">&larr; Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Study Timer</h1>
          <p className="text-gray-500 mt-1">Focus timer with automatic session logging</p>
        </div>
      </div>

      <div className="card">
        <div className="max-w-md mx-auto space-y-6">
          {!isRunning && !savedSession && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                <div className="flex gap-2">
                  <select
                    value={subjects.includes(subject) ? subject : ''}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex-1 input-field"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="self-center text-xs text-gray-400">or</span>
                  <input
                    type="text"
                    value={subjects.includes(subject) ? '' : subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex-1 input-field"
                    placeholder="Type subject name"
                  />
                </div>
                {subject && <p className="text-xs text-gray-400 mt-1">Studying: <span className="font-medium text-gray-400">{subject}</span></p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Topic (optional)</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full input-field"
                  placeholder="What are you studying?"
                />
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-5xl font-mono font-bold text-gray-100 mb-2">
              {pad(hours)}:{pad(minutes)}:{pad(seconds)}
            </p>
            <p className="text-sm text-gray-500">
              {isRunning ? `Studying: ${subject}` : savedSession ? 'Session saved!' : 'Ready to start'}
            </p>
          </div>

          <div className="flex justify-center gap-3">
            {!isRunning && !savedSession && (
              <Button onClick={startTimer} disabled={!subject} className="px-8">
                Start Timer
              </Button>
            )}
            {isRunning && (
              <Button onClick={stopTimer} variant="danger" isLoading={saving} className="px-8">
                Stop & Save
              </Button>
            )}
            {savedSession && (
              <Button onClick={resetTimer} className="px-8">
                New Session
              </Button>
            )}
          </div>

          {savedSession && (
            <div className="bg-emerald-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <p className="text-sm text-green-400">
                Session logged: {Math.max(1, Math.round(elapsedSeconds / 60))} minute{Math.round(elapsedSeconds / 60) !== 1 ? 's' : ''} of {subject}
              </p>
            </div>
          )}
        </div>
      </div>

      {todaySummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="stat-card text-center">
            <p className="text-2xl font-bold text-emerald-600">{todaySummary.totalMinutes}</p>
            <p className="text-sm text-gray-500">Minutes Today</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-2xl font-bold text-emerald-600">{todaySummary.sessionCount}</p>
            <p className="text-sm text-gray-500">Sessions Today</p>
          </div>
        </div>
      )}
    </div>
  );
}
