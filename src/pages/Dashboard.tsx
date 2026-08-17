import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Search, Zap, TrendingUp, Upload, Briefcase, Trash2, RefreshCw } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { API_BASE, getAuthHeaders, uploadResume } from '../lib/api';
import { Screen, Resume, UserProfile } from '../types';

// ─── Dashboard Page ──────────────────────────────────────────────────────────

interface DashboardProps {
  setScreen: (s: Screen) => void;
}

export default function Dashboard({ setScreen }: DashboardProps) {
  const [stats, setStats] = useState<UserProfile['stats'] | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});
  const jdRef = useRef<HTMLTextAreaElement>(null);

  // Fix #8: use useCallback so the function reference is stable across renders
  const fetchDashboardData = useCallback(() => {
    setLoading(true);
    const headers = getAuthHeaders();
    Promise.all([
      fetch(`${API_BASE}/auth/me`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/resumes`, { headers }).then(r => r.json()),
    ]).then(([me, res]) => {
      if (me.success) setStats(me.data.stats);
      if (res.success) setResumes(res.data.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDashboardData();
    if (localStorage.getItem('focus_jd') === 'true') {
      localStorage.removeItem('focus_jd');
      setTimeout(() => {
        jdRef.current?.focus();
      }, 300);
    }
  }, [fetchDashboardData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-uploaded
    e.target.value = '';

    setUploading(true);
    try {
      const res = await uploadResume(file, jobDescription);
      if (res.success) {
        localStorage.setItem('selected_resume_id', res.data.resume_id);
        fetchDashboardData();
        setScreen('report');
      } else {
        window.showToast(res.message || 'Upload failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      window.showToast('Could not reach the server. Is the backend running on port 8000?', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleJdFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setJobDescription(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteResume = async (e: React.MouseEvent, resumeId: string) => {
    e.stopPropagation();
    window.showConfirm({
      title: 'Delete Resume',
      message: 'Are you sure you want to permanently delete this resume?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/resumes/${resumeId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          }).then(r => r.json());
          if (res.success) {
            fetchDashboardData();
            if (localStorage.getItem('selected_resume_id') === resumeId) {
              localStorage.removeItem('selected_resume_id');
            }
            window.showToast('Resume deleted successfully.', 'success');
          } else {
            window.showToast(res.message || 'Delete failed. Please try again.', 'error');
          }
        } catch {
          window.showToast('Could not reach the server. Is the backend running?', 'error');
        }
      }
    });
  };

  const handleReanalyze = async (e: React.MouseEvent, resumeId: string) => {
    e.stopPropagation();
    setAnalyzingIds(prev => ({ ...prev, [resumeId]: true }));
    window.showToast('Re-analyzing resume with AI...', 'info');
    try {
      const res = await fetch(`${API_BASE}/analysis/analyze`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_id: resumeId }),
      }).then(r => r.json());
      if (res.success) {
        window.showToast('Analysis completed successfully!', 'success');
        fetchDashboardData();
      } else {
        window.showToast(res.detail || res.message || 'Analysis failed.', 'error');
      }
    } catch {
      window.showToast('Could not reach the server. Is the backend running?', 'error');
    } finally {
      setAnalyzingIds(prev => ({ ...prev, [resumeId]: false }));
    }
  };

  return (
    <div className="p-4 md:p-6 bg-surface min-h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col gap-4">

        {/* ─── Compact Header & Stat Badges ─── */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100/80">
          <div>
            <h1 className="font-headline text-2xl md:text-3xl font-black text-primary tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Monitor your resume ATS compatibility and instant AI recommendations.
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Score</p>
                <p className="text-sm font-black text-primary leading-none">75 / 100</p>
              </div>
            </div>

            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="p-1.5 bg-secondary/10 text-secondary rounded-lg">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scanned</p>
                <p className="text-sm font-black text-primary leading-none">{stats?.resumes_count ?? '0'}</p>
              </div>
            </div>

            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Search size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Matches</p>
                <p className="text-sm font-black text-primary leading-none">{stats?.job_matches_count ?? '0'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Hidden file input */}
        <input
          type="file"
          id="dashboard-resume-upload"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleFileUpload}
        />

        {/* ─── Two-Column Interactive Workstation ─── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
          
          {/* Left: Recently Analyzed Resumes */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg text-primary">
                  <FileText size={16} />
                </div>
                <h3 className="font-headline text-base font-bold text-primary">Recently Analyzed Resumes</h3>
              </div>
              <button
                onClick={() => setScreen('report')}
                className="text-xs font-bold text-primary hover:underline"
              >
                View Full Report →
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-2.5 max-h-[340px] pr-1">
              {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)
              ) : resumes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <FileText size={32} className="text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">No resumes analyzed yet</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Upload your resume on the right panel to get an instant AI score and actionable feedback.
                  </p>
                </div>
              ) : (
                resumes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      localStorage.setItem('selected_resume_id', r.id);
                      setScreen('report');
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md transition-all cursor-pointer border border-slate-100 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/60 shadow-xs flex items-center justify-center text-primary shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-primary truncate max-w-[180px] sm:max-w-[240px]">
                          {r.filename}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">{r.uploaded_at}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide ${
                        (r.latest_score ?? 0) >= 80
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {r.latest_score ? `${r.latest_score}% Match` : 'Processing'}
                      </span>
                      <button
                        onClick={(e) => handleReanalyze(e, r.id)}
                        disabled={analyzingIds[r.id]}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-200/50 rounded-lg transition-all"
                        title="Re-analyze"
                      >
                        <RefreshCw size={14} className={analyzingIds[r.id] ? 'animate-spin' : ''} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteResume(e, r.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Tip */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>💡 Tip: Click any resume to open its in-depth ATS breakdown.</span>
            </div>
          </div>

          {/* Right: Upload & Instant Match Engine */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-secondary/10 text-secondary rounded-lg">
                  <Zap size={16} />
                </div>
                <h3 className="font-headline text-base font-bold text-primary">Analyze New Resume</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                AI Compatibility Engine
              </span>
            </div>

            {/* Target Job Description Box */}
            <div className="space-y-1.5 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Target Job Description (Optional)
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <input
                    type="file"
                    id="jd-file-upload"
                    className="hidden"
                    accept=".txt"
                    onChange={handleJdFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('jd-file-upload')?.click()}
                    className="text-primary font-bold hover:underline"
                  >
                    Upload .txt
                  </button>
                </div>
              </div>
              <textarea
                ref={jdRef}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the target job description or requirements to tailor ATS scoring specifically to this role..."
                className="w-full flex-1 min-h-[90px] max-h-[120px] bg-slate-50 rounded-2xl p-3 text-xs border border-slate-200 focus:ring-2 focus:ring-primary focus:bg-white resize-none transition-all shadow-inner font-sans placeholder:text-slate-400"
              />
            </div>

            {/* Drag / Click Upload Area */}
            <div
              onClick={() => !uploading && document.getElementById('dashboard-resume-upload')?.click()}
              className={`bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary p-4 rounded-2xl text-center group transition-all cursor-pointer ${
                uploading ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              <div className="w-10 h-10 bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Upload className="text-primary" size={18} />
              </div>
              <h4 className="font-bold text-xs text-primary mb-0.5">
                {uploading ? 'Analyzing resume with AI...' : 'Upload PDF or DOCX Resume'}
              </h4>
              <p className="text-[10px] text-slate-400">
                Click to browse file and run instant multi-provider ATS analysis
              </p>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
