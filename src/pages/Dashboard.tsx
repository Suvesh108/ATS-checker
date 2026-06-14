import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Search, Zap, TrendingUp, Upload } from 'lucide-react';
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
  }, [fetchDashboardData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-uploaded
    e.target.value = '';

    setUploading(true);
    try {
      const res = await uploadResume(file);
      if (res.success) {
        localStorage.setItem('selected_resume_id', res.data.resume_id);
        fetchDashboardData();
        setScreen('report');
      } else {
        alert(res.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Could not reach the server. Is the backend running on port 8000?');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="ml-64 p-8 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <section className="flex justify-between items-end">
          <div>
            <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tight">Welcome back</h1>
            <p className="text-slate-500 mt-2 text-lg">Here's your ATS performance overview.</p>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)
          ) : (
            <>
              <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-primary">
                <p className="text-slate-500 font-headline text-sm font-bold mb-4 uppercase tracking-wider">Average Match Score</p>
                <div className="flex items-end gap-2">
                  <span className="font-headline text-5xl font-black text-primary">{stats?.avg_score ?? '—'}</span>
                  <span className="text-slate-400 font-bold mb-1">/100</span>
                </div>
                {stats?.avg_score && (
                  <div className="mt-6 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${stats.avg_score}%` }} />
                  </div>
                )}
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-secondary">
                <p className="text-slate-500 font-headline text-sm font-bold mb-4 uppercase tracking-wider">Resumes Analyzed</p>
                <div className="flex items-center gap-4">
                  <span className="font-headline text-5xl font-black text-primary">{stats?.resumes_count ?? '—'}</span>
                  <div className="p-3 bg-secondary/10 rounded-xl"><FileText className="text-secondary" size={24} /></div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-slate-200">
                <p className="text-slate-500 font-headline text-sm font-bold mb-4 uppercase tracking-wider">Job Matches Found</p>
                <div className="flex items-center gap-4">
                  <span className="font-headline text-5xl font-black text-primary">{stats?.job_matches_count ?? '—'}</span>
                  <div className="p-3 bg-slate-100 rounded-xl"><Search className="text-primary" size={24} /></div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Hidden file input */}
        <input
          type="file"
          id="dashboard-resume-upload"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleFileUpload}
        />

        {/* Recent Resumes + CTA */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-xl font-bold text-primary">Recently Analyzed</h3>
              <button onClick={() => setScreen('report')} className="text-sm font-bold text-primary hover:underline uppercase tracking-wider">
                View All
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
            ) : resumes.length === 0 ? (
              <EmptyState icon={FileText} title="No resumes yet" desc="Upload your first resume to get an ATS score instantly." />
            ) : (
              <div className="space-y-3">
                {resumes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      localStorage.setItem('selected_resume_id', r.id);
                      setScreen('report');
                    }}
                    className="bg-white p-5 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary">{r.filename}</h4>
                        <p className="text-xs text-slate-400 font-medium">Last scanned: {r.uploaded_at}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      (r.latest_score ?? 0) >= 80 ? 'text-secondary bg-secondary/10' : 'text-tertiary bg-tertiary/10'
                    }`}>
                      Match {r.latest_score ?? 'Pending'}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* Smart Recommendation Card */}
            <div className="primary-gradient text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Zap size={16} className="text-secondary fill-secondary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Smart Recommendation</span>
                </div>
                <h4 className="font-headline text-xl font-bold mb-3 leading-tight">Upload a resume to get started</h4>
                <p className="text-sm text-white/70 mb-8 leading-relaxed">
                  Curator's AI will analyze your resume and generate your personalized ATS score in seconds.
                </p>
                <button
                  onClick={() => document.getElementById('dashboard-resume-upload')?.click()}
                  disabled={uploading}
                  className="w-full bg-secondary text-white py-4 rounded-xl font-headline font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Now'} <TrendingUp size={18} />
                </button>
              </div>
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
            </div>

            {/* Quick Upload */}
            <div
              onClick={() => !uploading && document.getElementById('dashboard-resume-upload')?.click()}
              className={`bg-slate-50 border-2 border-dashed border-slate-200 p-10 rounded-3xl text-center group hover:border-primary transition-all cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="text-primary" size={28} />
              </div>
              <h4 className="font-bold text-primary mb-1">Quick Upload</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {uploading ? 'Processing your resume…' : 'Click to upload a PDF or DOCX resume'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
