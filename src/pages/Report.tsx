import React, { useState, useEffect, useCallback } from 'react';
import { FileText, AlertTriangle, AlertCircle, Lightbulb, Briefcase, Upload, RefreshCw } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { API_BASE, getAuthHeaders, uploadResume } from '../lib/api';
import { AnalysisResult } from '../types';

// ─── Report (Resume Analysis) Page ──────────────────────────────────────────

interface Analysis {
  result: AnalysisResult;
  analysis_id: string;
}

export default function Report() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);

  // Fix #7: load becomes a useCallback so we can call it after upload too
  const loadAnalysis = useCallback((rid: string) => {
    setLoading(true);
    fetch(`${API_BASE}/analysis/${rid}`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(res => { if (res.success) setAnalysis(res.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const rid = localStorage.getItem('selected_resume_id');
    if (!rid) { setLoading(false); return; }
    setResumeId(rid);
    loadAnalysis(rid);
  }, [loadAnalysis]);

  // Run AI analysis on the current resume
  const runAnalysis = async () => {
    if (!resumeId) return;
    setAnalysing(true);
    try {
      const res = await fetch(`${API_BASE}/analysis/analyze`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_id: resumeId }),
      }).then(r => r.json());
      if (res.success) {
        setAnalysis(res.data);
      } else {
        alert(res.detail || res.message || 'Analysis failed. Please try again.');
      }
    } catch (e) {
      alert('Could not reach the server. Is the backend running?');
    } finally {
      setAnalysing(false);
    }
  };

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
      } else {
        alert(res.message || 'Upload failed.');
      }
    } catch {
      alert('Could not reach the server. Is the backend running on port 8000?');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="ml-64 p-12 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-32" /><Skeleton className="h-64" /><Skeleton className="h-48" />
      </div>
    </div>
  );

  if (!analysis) return (
    <div className="ml-64 p-12 bg-surface min-h-screen flex flex-col items-center justify-center gap-6">
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
              <button
                onClick={runAnalysis}
                disabled={analysing}
                className="primary-gradient text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={analysing ? 'animate-spin' : ''} />
                {analysing ? 'Analysing…' : 'Run Analysis'}
              </button>
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

  const r = analysis.result;

  return (
    <div className="ml-64 p-12 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-12 flex items-end justify-between">
          <div>
            <span className="text-secondary font-bold tracking-widest text-xs uppercase mb-2 block">Deep Dive Analysis</span>
            <h2 className="font-headline text-6xl font-extrabold text-primary tracking-tight">
              Score: {r.ats_score}<span className="text-slate-300">/100</span>
            </h2>
            <p className="font-body text-slate-600 mt-4 max-w-xl leading-relaxed">{r.summary}</p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="px-8 py-6 bg-white rounded-2xl shadow-sm flex flex-col items-center border border-slate-100">
              <span className="text-secondary text-3xl font-black">{r.keywords_found?.length ?? 0}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Keywords Found</span>
            </div>
            <div className="px-8 py-6 bg-white rounded-2xl shadow-sm flex flex-col items-center border-l-4 border-tertiary border-y border-r border-slate-100">
              <span className="text-tertiary text-3xl font-black">{r.critical_fixes ?? 0}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Critical Fixes</span>
            </div>
            {/* Re-analyse button */}
            <button
              onClick={runAnalysis}
              disabled={analysing}
              className="px-6 py-3 bg-white border border-slate-100 shadow-sm rounded-2xl font-bold text-sm text-primary flex items-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={analysing ? 'animate-spin' : ''} />
              {analysing ? 'Re-analysing…' : 'Re-analyse'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="col-span-7 space-y-10">

            {/* Parsing Factors */}
            <section>
              <h3 className="font-headline text-xl font-bold text-primary mb-6">Parsing Success Factors</h3>
              <div className="grid grid-cols-3 gap-4">
                {r.parsing_factors && (Object.entries(r.parsing_factors) as [string, { status: 'passed' | 'warning' | 'failed'; note: string }][]).map(([key, val]) => (
                  <div
                    key={key}
                    className={`bg-white p-6 rounded-2xl border-l-4 ${
                      val.status === 'passed' ? 'border-secondary' : val.status === 'warning' ? 'border-yellow-400' : 'border-tertiary'
                    } shadow-sm border-y border-r border-slate-100`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Briefcase size={20} className={val.status === 'passed' ? 'text-secondary' : 'text-tertiary'} />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        val.status === 'passed' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'
                      }`}>
                        {val.status.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-primary capitalize">{key.replace('_', ' ')}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{val.note}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Strategic Improvements */}
            <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-2 mb-8">
                <AlertCircle className="text-tertiary" size={24} />
                <h3 className="font-headline text-xl font-bold text-primary">Strategic Improvements</h3>
              </div>
              <div className="space-y-4">
                {r.strategic_improvements?.length === 0 && (
                  <p className="text-slate-500 text-sm">No improvements needed — great work!</p>
                )}
                {r.strategic_improvements?.map((item, i) => (
                  <div key={i} className="group bg-white p-5 rounded-2xl flex gap-5 items-start transition-all hover:shadow-md border border-slate-100">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-tertiary/10 text-tertiary">
                      <Lightbulb size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary">{item.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                    <span className="ml-auto text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full shrink-0">
                      +{item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column — Keywords */}
          <div className="col-span-5">
            <div className="sticky top-24 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Keywords Found</span>
              </div>
              <div className="p-8 flex flex-wrap gap-2">
                {r.keywords_found?.map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-bold">{kw}</span>
                ))}
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-b border-slate-100">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Keywords Missing</span>
              </div>
              <div className="p-8 flex flex-wrap gap-2">
                {r.keywords_missing?.map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 bg-tertiary/10 text-tertiary rounded-full text-xs font-bold flex items-center gap-1">
                    <AlertTriangle size={10} />{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
