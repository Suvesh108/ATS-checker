import React, { useState, useEffect, useCallback } from 'react';
import { FileText, AlertTriangle, AlertCircle, Lightbulb, Briefcase, Upload, RefreshCw, Trash2 } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { API_BASE, getAuthHeaders, uploadResume } from '../lib/api';
import { AnalysisResult } from '../types';

// ─── Report (Resume Analysis) Page ──────────────────────────────────────────

interface Analysis {
  result: AnalysisResult;
  analysis_id: string;
}

interface ReportProps {
  setScreen: (s: any) => void;
}

export default function Report({ setScreen }: ReportProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);

  const handleDeleteResume = async () => {
    if (!resumeId) return;
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
            localStorage.removeItem('selected_resume_id');
            setScreen('dashboard');
            window.showToast('Resume deleted successfully.', 'success');
          } else {
            window.showToast(res.message || 'Delete failed.', 'error');
          }
        } catch {
          window.showToast('Could not reach the server. Is the backend running?', 'error');
        }
      }
    });
  };

  // Run AI analysis on the current resume
  const runAnalysis = useCallback(async (rid?: any) => {
    const activeRid = (typeof rid === 'string' ? rid : null) || resumeId;
    if (!activeRid) return;
    setAnalysing(true);
    try {
      const res = await fetch(`${API_BASE}/analysis/analyze`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_id: activeRid }),
      }).then(r => r.json());
      if (res.success) {
        setAnalysis(res.data);
        window.showToast('Analysis completed successfully!', 'success');
      } else {
        window.showToast(res.detail || res.message || 'Analysis failed. Please try again.', 'error');
      }
    } catch (e) {
      window.showToast('Could not reach the server. Is the backend running?', 'error');
    } finally {
      setAnalysing(false);
      setLoading(false);
    }
  }, [resumeId]);

  // Fix #7: load becomes a useCallback so we can call it after upload too
  const loadAnalysis = useCallback((rid: string) => {
    setLoading(true);
    fetch(`${API_BASE}/analysis/${rid}`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(res => { 
        if (res.success) {
          setAnalysis(res.data);
          setLoading(false);
        } else {
          runAnalysis(rid);
        }
      })
      .catch(() => {
        runAnalysis(rid);
      });
  }, [runAnalysis]);

  useEffect(() => {
    const rid = localStorage.getItem('selected_resume_id');
    if (!rid) { setLoading(false); return; }
    setResumeId(rid);
    loadAnalysis(rid);
  }, [loadAnalysis]);

  // Upload a new resume and auto-run analysis
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const res = await uploadResume(file);
      if (res.success) {
        const rid = res.data.resume_id;
        localStorage.setItem('selected_resume_id', rid);
        setResumeId(rid);
        setAnalysis(null);
        window.showToast('Resume uploaded successfully.', 'success');
      } else {
        window.showToast(res.message || 'Upload failed.', 'error');
      }
    } catch {
      window.showToast('Could not reach the server. Is the backend running on port 8000?', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="p-6 md:p-12 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-32" /><Skeleton className="h-64" /><Skeleton className="h-48" />
      </div>
    </div>
  );

  if (!analysis) return (
    <div className="p-6 md:p-12 bg-surface min-h-screen flex flex-col items-center justify-center gap-6">
      <input type="file" id="report-upload" className="hidden" accept=".pdf,.docx" onChange={handleFileUpload} />
      <EmptyState
        icon={FileText}
        title={resumeId ? 'No analysis yet' : 'No resume selected'}
        desc={resumeId
          ? 'Click "Run Analysis" to generate your detailed ATS report.'
          : 'Upload a resume from the Dashboard or use the button below.'}
        action={
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            {resumeId && (
              <>
                <button
                  onClick={() => runAnalysis()}
                  disabled={analysing}
                  className="primary-gradient text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={analysing ? 'animate-spin' : ''} />
                  {analysing ? 'Analysing…' : 'Run Analysis'}
                </button>
                <button
                  onClick={handleDeleteResume}
                  className="bg-white border border-slate-200 text-tertiary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-tertiary/5 hover:border-transparent transition-all"
                >
                  <Trash2 size={16} />
                  Delete Resume
                </button>
              </>
            )}
            <button
              onClick={() => document.getElementById('report-upload')?.click()}
              disabled={uploading}
              className="bg-slate-100 text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Upload size={16} />
              {uploading ? 'Uploading…' : 'Upload Resume'}
            </button>
          </div>
        }
      />
    </div>
  );

  const r = analysis?.result || {} as any;

  return (
    <div className="p-6 md:p-12 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-secondary font-bold tracking-widest text-xs uppercase mb-1 block">Deep Dive Analysis</span>
            <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tight">
              ATS Analysis Report
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Re-analyse button */}
            <button
              onClick={() => runAnalysis()}
              disabled={analysing}
              className="px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl font-bold text-sm text-primary flex items-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={analysing ? 'animate-spin' : ''} />
              {analysing ? 'Re-analysing…' : 'Re-analyse'}
            </button>
            {/* Delete button */}
            <button
              onClick={handleDeleteResume}
              className="px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl font-bold text-sm text-tertiary flex items-center gap-2 hover:bg-tertiary/5 hover:border-transparent transition-all"
              title="Delete Resume"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Radial Score Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="34" className="stroke-slate-100" strokeWidth="8" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-primary"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - (r.ats_score ?? 0) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xl font-black text-primary">{r.ats_score ?? 0}</span>
            </div>
            <div>
              <h3 className="font-bold text-primary text-base">ATS Score</h3>
              <p className="text-xs text-slate-500 mt-0.5">Overall resume optimization grade</p>
            </div>
          </div>

          {/* Keywords Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-black">{r.keywords_found?.length ?? 0}</span>
              <span className="text-[9px] uppercase font-bold tracking-wider -mt-1 font-headline">Found</span>
            </div>
            <div>
              <h3 className="font-bold text-primary text-base">Keywords Found</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Out of {((r.keywords_found?.length ?? 0) + (r.keywords_missing?.length ?? 0))} identified in the target JD
              </p>
            </div>
          </div>

          {/* Critical Fixes Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-14 h-14 bg-tertiary/10 text-tertiary rounded-2xl flex flex-col items-center justify-center shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-primary text-base">Critical Fixes</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="text-tertiary font-bold">{r.critical_fixes ?? 0} urgent issues</span> need immediate correction
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary Block */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <h2 className="font-headline text-lg font-bold text-primary mb-3">AI Executive Summary</h2>
          <p className="font-body text-slate-600 leading-relaxed text-sm max-w-5xl">{r.summary ?? 'No summary available.'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - 8span */}
          <div className="lg:col-span-8 space-y-8">

            {/* Parsing Success Factors */}
            <section>
              <h3 className="font-headline text-lg font-bold text-primary mb-4">Parsing Success Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {r.parsing_factors && (Object.entries(r.parsing_factors) as [string, any][]).map(([key, val]) => (
                  <div
                    key={key}
                    className={`bg-white p-5 rounded-2xl border-l-4 ${
                      val?.status === 'passed' ? 'border-secondary' : val?.status === 'warning' ? 'border-amber-400' : 'border-tertiary'
                    } shadow-sm border-y border-r border-slate-100 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <Briefcase size={18} className={val?.status === 'passed' ? 'text-secondary' : 'text-tertiary'} />
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          val?.status === 'passed' ? 'bg-secondary/10 text-secondary' : val?.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-tertiary/10 text-tertiary'
                        }`}>
                          {(val?.status || 'UNKNOWN').toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-primary capitalize">{key.replace('_', ' ')}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{val?.note || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Strategic Improvements */}
            <section className="bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="text-secondary" size={22} />
                <h3 className="font-headline text-lg font-bold text-primary">Strategic Improvements</h3>
              </div>
              <div className="space-y-4">
                {(!r.strategic_improvements || r.strategic_improvements.length === 0) && (
                  <p className="text-slate-500 text-sm">No improvements needed — great work!</p>
                )}
                {r.strategic_improvements?.map((item, i) => (
                  <div key={i} className="group bg-white p-5 rounded-2xl flex gap-4 items-start transition-all hover:shadow-md border border-slate-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-secondary/10 text-secondary">
                      <Lightbulb size={18} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-primary">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                    <span className="text-xs font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full shrink-0">
                      +{item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - 4span - Keywords */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-primary">Keywords Analysis</span>
              </div>
              
              {/* Found Keywords */}
              <div className="p-6 border-b border-slate-50">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-3">
                  Keywords Found ({r.keywords_found?.length ?? 0})
                </span>
                {(!r.keywords_found || r.keywords_found.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No keywords detected yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {r.keywords_found.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 bg-secondary/10 text-secondary rounded-lg text-xs font-bold">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Keywords */}
              <div className="p-6">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-3">
                  Keywords Missing ({r.keywords_missing?.length ?? 0})
                </span>
                {(!r.keywords_missing || r.keywords_missing.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No missing keywords! Excellent.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {r.keywords_missing.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 bg-tertiary/10 text-tertiary rounded-lg text-xs font-bold flex items-center gap-1">
                        <AlertTriangle size={11} className="shrink-0" />
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
