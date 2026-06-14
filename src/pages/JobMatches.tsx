import { useState, useEffect } from 'react';
import {
  Briefcase, Filter, AlertTriangle, DollarSign, Clock, Sparkles,
} from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { API_BASE, getAuthHeaders } from '../lib/api';
import { Screen, JobMatch } from '../types';

// ─── Job Matches Page ────────────────────────────────────────────────────────

interface JobMatchesProps {
  setScreen: (s: Screen) => void;
}

export default function JobMatches({ setScreen }: JobMatchesProps) {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ remote_status: '' });

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams(filters as Record<string, string>);
    fetch(`${API_BASE}/jobs/matches?${params}`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(res => { if (res.success) setJobs(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="ml-64 p-8 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <section className="max-w-4xl">
          <h2 className="font-headline text-5xl font-extrabold tracking-tight text-primary mb-4">Job Matches</h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            AI-curated roles based on your resume's keyword profile and ATS score.
          </p>
        </section>

        {/* Filters */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Remote Status</label>
            <select
              value={filters.remote_status}
              onChange={e => setFilters(f => ({ ...f, remote_status: e.target.value }))}
              className="w-full bg-white border-none rounded-xl text-sm py-3 px-4 focus:ring-2 focus:ring-primary shadow-sm"
            >
              <option value="">Any</option>
              <option value="remote">Full Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
          <button
            onClick={load}
            className="primary-gradient text-white font-bold h-[46px] rounded-xl hover:opacity-90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 col-start-4"
          >
            <Filter size={18} /> Apply Filters
          </button>
        </section>

        {/* Job Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64" />)
          ) : jobs.length === 0 ? (
            <div className="col-span-2">
              <EmptyState
                icon={Briefcase}
                title="No job matches yet"
                desc="Upload a resume and run an analysis to generate AI-curated job recommendations."
                action={
                  <button onClick={() => setScreen('report')} className="primary-gradient text-white px-6 py-3 rounded-xl font-bold">
                    Get My ATS Score First
                  </button>
                }
              />
            </div>
          ) : jobs.map((job, i) => (
            <div
              key={i}
              className="group relative bg-white p-8 rounded-3xl shadow-sm border-l-4 border-secondary transition-all hover:shadow-xl hover:-translate-y-1 border-y border-r border-slate-100"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-primary group-hover:text-secondary transition-colors">
                    {job.job_title}
                  </h3>
                  <p className="text-slate-500 font-medium">{job.company_name} • {job.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-headline font-black text-secondary">{job.compatibility_score}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-tighter text-secondary/60">Compatibility</div>
                </div>
              </div>

              <div className="space-y-6">
                {job.missing_skills?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Key Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.missing_skills.map((skill, j) => (
                        <span key={j} className="px-3 py-1.5 bg-tertiary/10 text-tertiary rounded-full text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle size={12} />{skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><DollarSign size={14} />${job.salary_min}k—${job.salary_max}k</span>
                    <span className="flex items-center gap-1"><Clock size={14} />{job.posted_ago}</span>
                  </div>
                  <button className="primary-gradient text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Upgrade CTA */}
          {!loading && jobs.length > 0 && (
            <div className="primary-gradient p-10 rounded-3xl flex flex-col justify-center text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <Sparkles className="text-secondary mb-6" size={48} />
                <h3 className="font-headline text-4xl font-bold mb-4 leading-tight">Want better matches?</h3>
                <p className="mb-10 text-white/70 text-lg leading-relaxed">
                  Optimize your resume to unlock higher-compatibility roles tailored to your career goals.
                </p>
                <button
                  onClick={() => setScreen('optimizer')}
                  className="w-fit px-8 py-4 bg-secondary text-white font-bold rounded-xl hover:brightness-110 transition-all active:scale-95 shadow-lg"
                >
                  Optimize My Resume
                </button>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
