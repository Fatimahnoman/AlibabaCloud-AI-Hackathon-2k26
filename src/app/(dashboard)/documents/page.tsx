'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type AnalysisDocumentType = 'sop' | 'personal_statement' | 'recommendation_letter' | 'cv_resume' | 'cover_letter' | 'essay' | 'other';

interface Suggestion {
  category: string;
  severity: 'low' | 'medium' | 'high';
  originalText: string;
  suggestedText: string;
  explanation: string;
}

interface IntegrityCheck {
  flaggedClaims: string[];
  fakeIndicators: string[];
  integrityScore: number;
  warnings: string[];
}

interface AnalysisResult {
  id: string;
  documentType: string;
  detectedType?: string;
  documentTitle?: string;
  personName?: string;
  overallScore: number;
  structureScore: number;
  clarityScore: number;
  grammarScore: number;
  relevanceScore: number;
  executiveSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  suggestions: Suggestion[];
  integrityCheck: IntegrityCheck;
  originalContent: string;
  createdAt: string;
}

interface HistoryItem {
  id: string;
  documentType: string;
  overallScore: number;
  wordCount?: number;
  createdAt: string;
}

interface Guidelines {
  title: string;
  description: string;
  tips: string[];
}

const DOC_TYPES: { value: AnalysisDocumentType; label: string; icon: string; color: string }[] = [
  { value: 'sop', label: 'Statement of Purpose (SOP)', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-indigo-500 to-purple-500' },
  { value: 'personal_statement', label: 'Personal Statement', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'from-cyan-500 to-blue-500' },
  { value: 'recommendation_letter', label: 'Recommendation Letter', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'from-emerald-500 to-teal-500' },
  { value: 'cv_resume', label: 'CV / Resume', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'from-amber-500 to-orange-500' },
  { value: 'cover_letter', label: 'Cover Letter', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'from-rose-500 to-pink-500' },
  { value: 'essay', label: 'Essay', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'from-violet-500 to-purple-500' },
  { value: 'other', label: 'Other Document', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-slate-500 to-gray-500' },
];

function ScoreCircle({ label, score, delay }: { label: string; score: number; delay?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const step = score / 30;
      const interval = setInterval(() => {
        current += step;
        if (current >= score) { current = score; clearInterval(interval); }
        setAnimatedScore(Math.round(current));
      }, 15);
      return () => clearInterval(interval);
    }, delay || 0);
    return () => clearTimeout(timer);
  }, [score, delay]);

  const colorMap: Record<string, { ring: string; text: string; glow: string }> = {
    overall: { ring: 'from-indigo-500 via-purple-500 to-pink-500', text: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
    structure: { ring: 'from-cyan-500 to-blue-500', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
    clarity: { ring: 'from-emerald-500 to-teal-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    grammar: { ring: 'from-amber-500 to-orange-500', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
    relevance: { ring: 'from-rose-500 to-pink-500', text: 'text-rose-400', glow: 'shadow-rose-500/20' },
  };
  const key = label.toLowerCase();
  const c = colorMap[key] || colorMap.overall;
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 animate-scale-in" style={{ animationDelay: `${(delay || 0)}ms` }}>
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="4" />
          <circle cx="40" cy="40" r="38" fill="none" stroke={`url(#grad-${key})`} strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
          <defs>
            <linearGradient id={`grad-${key}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={key === 'overall' ? '#3b82f6' : key === 'structure' ? '#06b6d4' : key === 'clarity' ? '#10b981' : key === 'grammar' ? '#f59e0b' : '#f43f5e'} />
              <stop offset="100%" stopColor={key === 'overall' ? '#ec4899' : key === 'structure' ? '#3b82f6' : key === 'clarity' ? '#14b8a6' : key === 'grammar' ? '#f97316' : '#ec4899'} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${c.text}`}>{animatedScore}</span>
        </div>
      </div>
      <span className="text-xs font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{label}</span>
    </div>
  );
}

export default function DocumentsPage() {
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState<AnalysisDocumentType>('sop');
  const [targetInstitution, setTargetInstitution] = useState('');
  const [targetProgram, setTargetProgram] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [guidelines, setGuidelines] = useState<Record<string, Guidelines>>({});
  const [activeGuideline, setActiveGuideline] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'analyze' | 'history' | 'guidelines'>('analyze');
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/documents/history', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setHistory(data.data?.analyses || []); }
    } catch { /* empty */ }
  }, []);

  const fetchGuidelines = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/documents/guidelines', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setGuidelines(data.data?.guidelines || {}); }
    } catch { /* empty */ }
  }, []);

  useEffect(() => { fetchHistory(); fetchGuidelines(); }, [fetchHistory, fetchGuidelines]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleFile = (file: File) => {
    const allowed = ['.pdf', '.md', '.txt', '.docx', '.xlsx', '.xls'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) { setError('Unsupported file type.'); return; }
    setError('');
    setUploadedFile(file);
    if (ext === '.txt' || ext === '.md') {
      const reader = new FileReader();
      reader.onload = (e) => setContent(e.target?.result as string);
      reader.readAsText(file);
    } else { setContent(''); }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

  const handleAnalyze = async () => {
    if (!content.trim() && !uploadedFile) { setError('Please paste your document content or upload a file'); return; }
    setAnalyzing(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('accessToken');
      let res: Response;
      if (uploadedFile && !content.trim()) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('documentType', documentType);
        if (targetInstitution) formData.append('targetInstitution', targetInstitution);
        if (targetProgram) formData.append('targetProgram', targetProgram);
        if (additionalContext) formData.append('additionalContext', additionalContext);
        res = await fetch('/api/documents/analyze', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      } else {
        res = await fetch('/api/documents/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: content.trim(), documentType, targetInstitution, targetProgram, additionalContext }) });
      }
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || 'Analysis failed'); }
      const data = await res.json();
      setResult(data.data);
      fetchHistory();
    } catch (err) { setError(err instanceof Error ? err.message : 'Analysis failed'); }
    finally { setAnalyzing(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/documents/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setHistory(prev => prev.filter(h => h.id !== id));
      if (result?.id === id) setResult(null);
    } catch { /* empty */ }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <a href="/dashboard" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold gradient-text">Document Intelligence</h1>
          <p className="text-sm mt-1 text-cyan-400"><span className="text-blue-400 font-medium">AI-powered</span> analysis with <span className="text-indigo-400 font-medium">integrity checks</span></p>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
        {(['analyze', 'history', 'guidelines'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab ? 'gradient-bg text-white shadow-lg shadow-indigo-500/25' : 'text-cyan-400 hover:text-cyan-300 hover:bg-white/10'}`}>
            {tab === 'analyze' ? 'Analyze' : tab === 'history' ? 'History' : 'Guidelines'}
          </button>
        ))}
      </div>

      {activeTab === 'analyze' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-5">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              Document Content
            </h2>

            <div>
              <label className="block text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">Document Type</label>
              <div className="grid grid-cols-2 gap-2">
                {DOC_TYPES.map(dt => (
                  <button key={dt.value} onClick={() => setDocumentType(dt.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${documentType === dt.value ? `gradient-bg text-white shadow-lg ${dt.color}` : 'bg-white/[0.03] border border-white/10 text-cyan-400 hover:border-cyan-400/30 hover:text-cyan-300'}`}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={dt.icon} /></svg>
                    <span className="truncate">{dt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">Upload a file</label>
              <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02]' : 'border-white/10 hover:border-cyan-400/50 hover:bg-white/5'}`}>
                <input ref={fileInputRef} type="file" accept=".pdf,.md,.txt,.docx,.xlsx,.xls"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
                {uploadedFile ? (
                  <div className="space-y-2 animate-scale-in">
                    <div className="w-12 h-12 mx-auto rounded-xl gradient-bg-cool flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-sm font-medium gradient-text">{uploadedFile.name}</p>
                    <p className="text-xs text-cyan-400">{formatFileSize(uploadedFile.size)}</p>
                    <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setContent(''); }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove file</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))' }}>
                      <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    </div>
                    <p className="text-sm text-cyan-400">Drag & drop a file here, or click to browse</p>
                    <p className="text-xs text-violet-400">PDF, Markdown, Word, Excel, Text</p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 py-1 rounded-full text-violet-400" style={{ background: 'rgba(15, 23, 42, 0.9)' }}>or paste text below</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">Paste or type your document</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={12}
                className="w-full rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-gray-200 transition-all duration-300"
                style={{ background: 'rgba(11, 17, 32, 0.8)', border: '1.5px solid rgba(148, 163, 184, 0.15)' }}
                placeholder="Paste your SOP, personal statement, CV, or any document here..." />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-cyan-400">{content.split(/\s+/).filter(Boolean).length} words</p>
                {content.length > 0 && <span className="text-xs text-indigo-400 animate-pulse">Ready to analyze</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">Target Institution</label>
                <input value={targetInstitution} onChange={e => setTargetInstitution(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                  style={{ background: 'rgba(11, 17, 32, 0.8)', border: '1.5px solid rgba(148, 163, 184, 0.15)' }}
                  placeholder="e.g. MIT" />
              </div>
              <div>
                <label className="block text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">Target Program</label>
                <input value={targetProgram} onChange={e => setTargetProgram(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                  style={{ background: 'rgba(11, 17, 32, 0.8)', border: '1.5px solid rgba(148, 163, 184, 0.15)' }}
                  placeholder="e.g. Computer Science" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">Additional Context</label>
              <input value={additionalContext} onChange={e => setAdditionalContext(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                style={{ background: 'rgba(11, 17, 32, 0.8)', border: '1.5px solid rgba(148, 163, 184, 0.15)' }}
                placeholder="Any extra context for the analyzer..." />
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm text-red-300 animate-slide-up" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <button onClick={handleAnalyze} disabled={analyzing || (!content.trim() && !uploadedFile)}
              className="w-full btn-primary py-3.5 text-base font-semibold flex items-center justify-center gap-2">
              {analyzing ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />Analyzing...</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>Analyze Document</>
              )}
            </button>

            <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <span className="text-amber-400 font-semibold">Integrity Policy:</span>
              <span className="text-cyan-400"> Our AI analyzes and <span className="text-emerald-400">improves</span> your <span className="text-cyan-400">REAL writing</span> only. It will never fabricate achievements, grades, certificates, or experiences.</span>
            </div>
          </div>

          <div className="space-y-6">
            {result && (
              <>
                <div className="card animate-slide-up">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      {result.personName && <h3 className="text-xl font-bold gradient-text">{result.personName}</h3>}
                      {result.documentTitle && result.documentTitle !== result.personName && (
                        <p className="text-sm gradient-text mt-0.5">{result.documentTitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold gradient-bg-cool text-white">
                          {(result.detectedType || result.documentType).replace(/_/g, ' ')}
                        </span>
                        {result.detectedType && result.detectedType !== result.documentType && (
                          <span className="text-xs text-cyan-400">Auto-detected</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">Scores</h2>
                  <div className="grid grid-cols-5 gap-3">
                    <ScoreCircle label="Overall" score={result.overallScore} delay={0} />
                    <ScoreCircle label="Structure" score={result.structureScore} delay={100} />
                    <ScoreCircle label="Clarity" score={result.clarityScore} delay={200} />
                    <ScoreCircle label="Grammar" score={result.grammarScore} delay={300} />
                    <ScoreCircle label="Relevance" score={result.relevanceScore} delay={400} />
                  </div>
                  <p className="text-sm text-cyan-400 mt-5 p-3 rounded-xl" style={{ background: 'rgba(11, 17, 32, 0.5)' }}><span className="text-indigo-400">Summary:</span> {result.executiveSummary}</p>
                </div>

                <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>Strengths
                  </h2>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-emerald-500/5 transition-colors">
                        <span className="text-emerald-400 mt-0.5 text-lg">&#10003;</span>
                        <span className="text-emerald-400">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>Areas for Improvement
                  </h2>
                  <ul className="space-y-2">
                    {result.areasForImprovement.map((a, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-amber-500/5 transition-colors">
                        <span className="text-amber-400 mt-0.5 text-lg">&#9888;</span>
                        <span className="text-amber-400">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {result.suggestions.length > 0 && (
                  <div className="card animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <h2 className="text-lg font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span>Suggestions ({result.suggestions.length})
                    </h2>
                    <div className="space-y-2">
                      {result.suggestions.map((s, i) => (
                        <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                          <button onClick={() => setExpandedSuggestion(expandedSuggestion === i ? null : i)}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-all duration-300">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.severity === 'high' ? 'badge-danger' : s.severity === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                                {s.severity}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-xs bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{s.category}</span>
                            </div>
                            <span className="text-gray-400 transition-transform duration-300" style={{ transform: expandedSuggestion === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>&#9660;</span>
                          </button>
                          {expandedSuggestion === i && (
                            <div className="p-4 bg-white/5 text-sm space-y-2" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                              {s.originalText && (
                                <div className="p-2 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                                  <span className="font-medium text-violet-400 text-xs uppercase">Original: </span>
                                  <span className="line-through text-red-400">{s.originalText}</span>
                                </div>
                              )}
                              {s.suggestedText && (
                                <div className="p-2 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                                  <span className="font-medium text-violet-400 text-xs uppercase">Suggested: </span>
                                  <span className="text-emerald-400">{s.suggestedText}</span>
                                </div>
                              )}
                               <p className="text-cyan-400 pt-1"><span className="text-cyan-400">Key insight:</span> {s.explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card animate-slide-up" style={{ animationDelay: '400ms' }}>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: result.integrityCheck.integrityScore >= 80 ? '#10b981' : result.integrityCheck.integrityScore >= 60 ? '#f59e0b' : '#ef4444' }}></span>
                    Integrity Check
                  </h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-3xl font-bold" style={{ color: result.integrityCheck.integrityScore >= 80 ? '#34d399' : result.integrityCheck.integrityScore >= 60 ? '#fbbf24' : '#f87171' }}>
                      {result.integrityCheck.integrityScore}/100
                    </div>
                    <span className={`badge ${result.integrityCheck.integrityScore >= 80 ? 'badge-success' : result.integrityCheck.integrityScore >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                      {result.integrityCheck.integrityScore >= 80 ? 'Good' : result.integrityCheck.integrityScore >= 60 ? 'Review Needed' : 'Concerns Detected'}
                    </span>
                  </div>
                  {result.integrityCheck.flaggedClaims.length > 0 && (
                    <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                      <p className="font-medium text-sm text-red-400 mb-1">Flagged Claims:</p>
                      <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
                        {result.integrityCheck.flaggedClaims.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.integrityCheck.fakeIndicators.length > 0 && (
                    <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                      <p className="font-medium text-sm text-red-400 mb-1">Fake Indicators:</p>
                      <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
                        {result.integrityCheck.fakeIndicators.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.integrityCheck.warnings.length > 0 && (
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                      <p className="font-medium text-sm text-amber-400 mb-1">Warnings:</p>
                      <ul className="list-disc list-inside text-sm text-amber-300 space-y-1">
                        {result.integrityCheck.warnings.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.integrityCheck.flaggedClaims.length === 0 && result.integrityCheck.fakeIndicators.length === 0 && result.integrityCheck.warnings.length === 0 && (
                    <p className="text-sm text-emerald-400 p-3 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>No integrity concerns detected.</p>
                  )}
                </div>
              </>
            )}

            {!result && !analyzing && (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 gradient-bg animate-float">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-lg text-cyan-400">Paste your document and click <span className="text-indigo-400 font-medium">Analyze</span> to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card animate-fade-in">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">Analysis History</h2>
          {history.length === 0 ? (
            <p className="text-cyan-400 text-center py-12">No analyses yet. <span className="text-indigo-400 font-medium">Analyze</span> a document to see history here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <th className="text-left py-3 font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Type</th>
                    <th className="text-left py-3 font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Score</th>
                    <th className="text-left py-3 font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Date</th>
                    <th className="text-right py-3 font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                      <td className="py-3 gradient-text capitalize">{h.documentType.replace(/_/g, ' ')}</td>
                      <td className="py-3">
                        <span className={`badge ${h.overallScore >= 80 ? 'badge-success' : h.overallScore >= 60 ? 'badge-warning' : 'badge-danger'}`}>{h.overallScore}/100</span>
                      </td>
                      <td className="py-3 text-violet-400">{new Date(h.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => setActiveTab('analyze')} className="text-cyan-400 hover:text-cyan-300 text-xs mr-3 transition-colors">View</button>
                        <button onClick={() => handleDelete(h.id)} className="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'guidelines' && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-cyan-400">Understanding what makes a <span className="text-indigo-400 font-medium">strong document</span> for each type.</p>
          {Object.entries(guidelines).map(([key, g], idx) => (
            <div key={key} className="card overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <button onClick={() => setActiveGuideline(activeGuideline === key ? null : key)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-all duration-300">
                <div>
                  <h3 className="font-semibold gradient-text">{g.title}</h3>
                  <p className="text-sm text-cyan-400 mt-0.5">{g.description}</p>
                </div>
                <span className="text-gray-400 transition-transform duration-300" style={{ transform: activeGuideline === key ? 'rotate(180deg)' : 'rotate(0deg)' }}>&#9660;</span>
              </button>
              {activeGuideline === key && (
                <div className="p-4 bg-white/5" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <ul className="space-y-2">
                    {g.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <span className="text-indigo-400 mt-0.5 text-lg">&#8226;</span>
                         <span className="text-cyan-400"><span className="text-indigo-400">Tip:</span> {tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
