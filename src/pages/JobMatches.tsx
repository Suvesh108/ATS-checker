import { useState, useEffect } from 'react';
import {
  Briefcase, Filter, AlertTriangle, DollarSign, Clock, Sparkles,
  ExternalLink, Bookmark, CheckCircle2, BookmarkCheck, Building2, MapPin
} from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { API_BASE, getAuthHeaders, saveAppliedJob } from '../lib/api';
import { Screen, JobMatch } from '../types';

// ─── Job Matches Page ────────────────────────────────────────────────────────

interface JobMatchesProps {
  setScreen: (s: Screen) => void;
}

const PLATFORM_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Naukri.com': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Indeed': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'LinkedIn': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  'Internshala': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Glassdoor': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};

export default function JobMatches({ setScreen }: JobMatchesProps) {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ remote_status: '', platform: '' });
  const [savedJobUrls, setSavedJobUrls] = useState<Record<string, boolean>>({});

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.remote_status) params.append('remote_status', filters.remote_status);
    if (filters.platform) params.append('industry', filters.platform);

    fetch(`${API_BASE}/jobs/matches?${params.toString()}`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(res => { if (res.success && Array.isArray(res.data)) setJobs(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApply = (job: JobMatch) => {
    if (job.job_url) {
      window.open(job.job_url, '_blank', 'noopener,noreferrer');
      // Automatically save to Applied Jobs
      saveAppliedJob({
        ...job,
        status: 'Applied',
        platform: job.platform || 'Indeed',
        job_url: job.job_url,
      }).then(() => {
        setSavedJobUrls(prev => ({ ...prev, [job.job_url || '']: true }));
      });
    }
  };

  const handleSaveToTracker = async (job: JobMatch) => {
    try {
      const res = await saveAppliedJob({
        ...job,
        status: 'Saved',
        platform: job.platform || 'Indeed',
        job_url: job.job_url || 'https://www.google.com/search?q=jobs',
      });
      if (res.success) {
        setSavedJobUrls(prev => ({ ...prev, [job.job_url || '']: true }));
        window.showToast?.(`Saved "${job.job_title}" to Applied Tracker!`, 'success');
      }
    } catch {
      window.showToast?.('Could not save job to tracker', 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary font-headline text-xs font-bold mb-2">
              <Sparkles size={14} /> Multi-Platform Job Matches
            </div>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-primary">
              AI Job Recommendations
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Live roles scraped across <strong>Naukri.com</strong>, <strong>Indeed</strong>, <strong>LinkedIn</strong>, and <strong>Internshala</strong>.
            </p>
          </div>

          <button
            onClick={() => setScreen('applied')}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-all"
          >
            <Bookmark size={15} className="text-primary" />
            <span>View Applied & Saved Jobs →</span>
          </button>
        </section>

        {/* Filters */}
        <section className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 items-end bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Work Mode</label>
            <select
              value={filters.remote_status}
              onChange={e => setFilters(f => ({ ...f, remote_status: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs py-2.5 px-3 focus:ring-2 focus:ring-primary shadow-xs font-medium"
            >
              <option value="">All Locations</option>
              <option value="remote">Full Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Platform</label>
            <select
              value={filters.platform}
              onChange={e => setFilters(f => ({ ...f, platform: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs py-2.5 px-3 focus:ring-2 focus:ring-primary shadow-xs font-medium"
            >
              <option value="">All Job Boards</option>
              <option value="naukri">Naukri.com</option>
              <option value="indeed">Indeed</option>
              <option value="linkedin">LinkedIn</option>
              <option value="internshala">Internshala</option>
              <option value="glassdoor">Glassdoor</option>
            </select>
          </div>

          <button
            onClick={load}
            className="primary-gradient text-white font-bold h-[38px] rounded-xl hover:opacity-90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-xs"
          >
            <Filter size={15} /> Apply Filters
          </button>
        </section>

        {/* Job Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)
          ) : jobs.length === 0 ? (
            <div className="col-span-2">
              <EmptyState
                icon={Briefcase}
                title="No job matches found"
                desc="Upload a resume or adjust your filters to view fresh job matches."
                action={
                  <button onClick={() => setScreen('report')} className="primary-gradient text-white px-6 py-3 rounded-xl font-bold">
                    Scan Resume First
                  </button>
                }
              />
            </div>
          ) : jobs.map((job, i) => {
            const platformName = job.platform || 'Indeed';
            const style = PLATFORM_STYLES[platformName] || PLATFORM_STYLES.Indeed;
            const isSaved = !!savedJobUrls[job.job_url || ''];

            return (
              <div
                key={i}
                className="group relative bg-white p-7 rounded-3xl shadow-sm border transition-all hover:shadow-xl hover:-translate-y-0.5 border-slate-100 flex flex-col justify-between space-y-5"
              >
                <div>
                  {/* Top row: Platform badge + Score */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
                      {platformName}
                    </span>

                    <div className="text-right">
                      <div className="text-2xl font-headline font-black text-secondary">{job.compatibility_score}%</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Match Score</div>
                    </div>
                  </div>

                  {/* Title & Company */}
                  <h3 className="font-headline text-xl font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1">
                    {job.job_title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                    <Building2 size={13} className="text-slate-400" />
                    <span className="font-semibold">{job.company_name}</span>
                    <span>•</span>
                    <MapPin size={13} className="text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="space-y-4">
                  {job.missing_skills && job.missing_skills.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Missing ATS Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {job.missing_skills.map((skill, j) => (
                          <span key={j} className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <AlertTriangle size={11} />{skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer metadata and actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                      {job.salary_min && (
                        <span className="flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                          ${job.salary_min}k - ${job.salary_max}k
                        </span>
                      )}
                      <span className="flex items-center gap-1"><Clock size={12} />{job.posted_ago}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveToTracker(job)}
                        title={isSaved ? 'Saved to Tracker' : 'Save to Applied Jobs Tracker'}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isSaved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-500 hover:text-primary border-slate-200'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>

                      <button
                        onClick={() => handleApply(job)}
                        className="primary-gradient text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                      >
                        <span>Apply on {platformName.split('.')[0]}</span>
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
