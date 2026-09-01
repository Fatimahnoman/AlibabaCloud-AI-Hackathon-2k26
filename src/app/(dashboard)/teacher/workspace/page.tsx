'use client';

import { useState, useEffect, useCallback } from 'react';

interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade?: string;
  description?: string;
  inviteCode: string;
  isActive: boolean;
  enrolledStudents: number;
  resourceCount: number;
  createdAt: string;
}

interface EnrolledStudent {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  status: string;
  joinedAt: string;
}

interface StudentData {
  studentId: string;
  studentName: string;
  studyTopics: { subject: string; topic: string; masteryLevel: number }[];
  recentQuizzes: { subject: string; topic: string; score: number; date: string }[];
  overallMastery: number;
  totalStudyMinutes: number;
}

interface Dashboard {
  totalClassrooms: number;
  activeClassrooms: number;
  totalStudents: number;
  totalResources: number;
  recentClassrooms: Classroom[];
}

type View = 'dashboard' | 'classrooms' | 'classroom-detail' | 'student-data';

export default function TeacherWorkspacePage() {
  const [view, setView] = useState<View>('dashboard');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', subject: '', grade: '', description: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/teacher/workspace', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setDashboard(data.data);
      }
    } catch { /* empty */ }
  }, []);

  const fetchClassrooms = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/teacher/classrooms', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setClassrooms(data.data || []);
      }
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchClassrooms()]).finally(() => setLoading(false));
  }, [fetchDashboard, fetchClassrooms]);

  const handleCreateClassroom = async () => {
    if (!createForm.name || !createForm.subject) return;
    const token = localStorage.getItem('accessToken');
    const res = await fetch('/api/teacher/classrooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(createForm),
    });
    if (res.ok) {
      setSuccessMsg('Classroom created!');
      setShowCreateForm(false);
      setCreateForm({ name: '', subject: '', grade: '', description: '' });
      fetchClassrooms();
      fetchDashboard();
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleDeleteClassroom = async (id: string) => {
    if (!confirm('Delete this classroom?')) return;
    const token = localStorage.getItem('accessToken');
    await fetch(`/api/teacher/classrooms/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setClassrooms(prev => prev.filter(c => c.id !== id));
    if (selectedClassroom?.id === id) { setView('classrooms'); setSelectedClassroom(null); }
    fetchDashboard();
  };

  const openClassroom = async (classroom: Classroom) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`/api/teacher/classrooms/${classroom.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setSelectedClassroom(data.data);
      setStudents(data.data.enrollments || []);
      setView('classroom-detail');
    }
  };

  const openStudentData = async (studentId: string) => {
    if (!selectedClassroom) return;
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`/api/teacher/classrooms/${selectedClassroom.id}/students/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setStudentData(data.data);
      setView('student-data');
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedClassroom) return;
    if (!confirm('Remove this student from the classroom?')) return;
    const token = localStorage.getItem('accessToken');
    await fetch(`/api/teacher/classrooms/${selectedClassroom.id}/students/${studentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setStudents(prev => prev.filter(s => s.studentId !== studentId));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading teacher workspace...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Teacher Workspace</h1>
          <p className="text-amber-600 text-sm mt-1 bg-amber-500/10 inline-block px-2 py-1 rounded">Student data is only accessible after explicit classroom enrollment</p>
        </div>
        <div className="flex gap-2">
          {view === 'dashboard' && (
            <button onClick={() => { setView('classrooms'); fetchClassrooms(); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">My Classrooms</button>
          )}
          {view !== 'dashboard' && (
            <button onClick={() => { setView('dashboard'); fetchDashboard(); }}
              className="px-4 py-2 btn-secondary">Dashboard</button>
          )}
        </div>
      </div>

      {successMsg && <div className="bg-emerald-500/10 border border-green-200 text-green-700 p-3 rounded-lg text-sm">{successMsg}</div>}

      {view === 'dashboard' && dashboard && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Classrooms', value: dashboard.totalClassrooms, color: 'blue' },
              { label: 'Total Students', value: dashboard.totalStudents, color: 'green' },
              { label: 'Total Resources', value: dashboard.totalResources, color: 'purple' },
              { label: 'Active Classes', value: dashboard.activeClassrooms, color: 'yellow' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <div className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-3">Recent Classrooms</h2>
            {dashboard.recentClassrooms.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No classrooms yet. Create one to get started.</p>
            ) : (
              <div className="space-y-2">
                {dashboard.recentClassrooms.map(c => (
                  <div key={c.id} onClick={() => openClassroom(c)}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer">
                    <div>
                      <span className="font-medium">{c.name}</span>
                      <span className="text-sm text-gray-500 ml-2">{c.subject}</span>
                      {c.grade && <span className="text-xs bg-white/5 px-2 py-0.5 rounded ml-2">{c.grade}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{c.enrolledStudents} students</span>
                      <span>{c.resourceCount} resources</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {view === 'classrooms' && (
        <>
          <div className="flex gap-2">
            <button onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              {showCreateForm ? 'Cancel' : 'New Classroom'}
            </button>
          </div>

          {showCreateForm && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Create Classroom</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Class Name *</label>
                  <input value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full input-field" placeholder="e.g. Grade 10 Math" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subject *</label>
                  <input value={createForm.subject} onChange={e => setCreateForm(p => ({ ...p, subject: e.target.value }))}
                    className="w-full input-field" placeholder="e.g. Mathematics" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Grade</label>
                  <input value={createForm.grade} onChange={e => setCreateForm(p => ({ ...p, grade: e.target.value }))}
                    className="w-full input-field" placeholder="e.g. 10th" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <input value={createForm.description} onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full input-field" placeholder="Optional description" />
                </div>
              </div>
              <button onClick={handleCreateClassroom}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Create</button>
            </div>
          )}

          <div className="space-y-3">
            {classrooms.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">No classrooms yet.</div>
            ) : classrooms.map(c => (
              <div key={c.id} className="card p-4 flex items-center justify-between">
                <div className="cursor-pointer flex-1" onClick={() => openClassroom(c)}>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-gray-500">{c.subject} {c.grade ? `| ${c.grade}` : ''}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>Students: {c.enrolledStudents}</span>
                    <span>Resources: {c.resourceCount}</span>
                    <span className="font-mono bg-white/5 px-2 py-0.5 rounded">Code: {c.inviteCode}</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteClassroom(c.id)}
                  className="text-red-500 hover:text-red-700 text-sm ml-4">Delete</button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'classroom-detail' && selectedClassroom && (
        <>
          <div className="flex items-center gap-3">
            <button onClick={() => { setView('classrooms'); fetchClassrooms(); }}
              className="text-blue-600 hover:text-blue-800 text-sm">&larr; Back</button>
            <h2 className="text-xl font-bold">{selectedClassroom.name}</h2>
            <span className="text-sm text-gray-500">{selectedClassroom.subject}</span>
          </div>

          <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800"><strong>Invite Code:</strong> <span className="font-mono text-lg">{selectedClassroom.inviteCode}</span></p>
            <p className="text-xs text-blue-600 mt-1">Share this code with students so they can join your classroom</p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3">Enrolled Students ({students.length})</h3>
            {students.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No students enrolled yet. Share the invite code above.</p>
            ) : (
              <div className="space-y-2">
                {students.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5">
                    <div>
                      <span className="font-medium">{s.studentName || 'Unknown'}</span>
                      <span className="text-sm text-gray-500 ml-2">{s.studentEmail}</span>
                      <span className="text-xs text-gray-400 ml-2">Joined: {new Date(s.joinedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openStudentData(s.studentId)}
                        className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded text-xs hover:bg-blue-500/20">View Data</button>
                      <button onClick={() => handleRemoveStudent(s.studentId)}
                        className="px-3 py-1 bg-red-500/10 text-red-400 rounded text-xs hover:bg-red-500/20">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3">Classroom Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Grade:</span> {selectedClassroom.grade || 'N/A'}</div>
              <div><span className="text-gray-500">Status:</span> {selectedClassroom.isActive ? 'Active' : 'Inactive'}</div>
              <div><span className="text-gray-500">Resources:</span> {selectedClassroom.resourceCount}</div>
              <div><span className="text-gray-500">Created:</span> {new Date(selectedClassroom.createdAt).toLocaleDateString()}</div>
            </div>
            {selectedClassroom.description && (
              <p className="mt-3 text-sm text-gray-400">{selectedClassroom.description}</p>
            )}
          </div>
        </>
      )}

      {view === 'student-data' && studentData && selectedClassroom && (
        <>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('classroom-detail')}
              className="text-blue-600 hover:text-blue-800 text-sm">&larr; Back to {selectedClassroom.name}</button>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold">{studentData.studentName}</h2>
            <p className="text-sm text-gray-500">Overall Mastery: {studentData.overallMastery}% | Study Minutes: {studentData.totalStudyMinutes}</p>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-3">Study Topics</h3>
            {studentData.studyTopics.length === 0 ? (
              <p className="text-gray-400 text-sm">No study topics tracked yet.</p>
            ) : (
              <div className="space-y-2">
                {studentData.studyTopics.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-sm"><strong>{t.subject}</strong> / {t.topic}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-white/5 rounded-full h-2">
                        <div className={`h-2 rounded-full ${t.masteryLevel >= 80 ? 'bg-green-500' : t.masteryLevel >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${t.masteryLevel}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{t.masteryLevel}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-3">Recent Quiz Scores</h3>
            {studentData.recentQuizzes.length === 0 ? (
              <p className="text-gray-400 text-sm">No quizzes taken yet.</p>
            ) : (
              <div className="space-y-2">
                {studentData.recentQuizzes.map((q, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-sm">{q.subject} / {q.topic}</span>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        q.score >= 80 ? 'bg-green-500/10 text-green-400' :
                        q.score >= 50 ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>{q.score}%</span>
                      <span className="text-xs text-gray-400">{new Date(q.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
