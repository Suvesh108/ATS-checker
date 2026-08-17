import React, { useState, useEffect } from 'react';
import {
  Briefcase, CheckCircle2, Clock, ExternalLink, Trash2, Search,
  Filter, Calendar, Building2, MapPin, DollarSign, Sparkles, MessageSquare, ChevronDown
} from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { getAppliedJobs, updateAppliedJob, deleteAppliedJob } from '../lib/api';
import { AppliedJob, Screen } from '../types';

interface AppliedJobsProps {
  setScreen: (s: Screen) => void;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  Applied: { label: 'Applied', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Interviewing: { label: 'Interviewing', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Offer: { label: 'Offer Received', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Rejected: { label: 'Archived', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  Saved: { label: 'Saved for Later', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export default function AppliedJobs({ setScreen }: AppliedJobsProps) {
  const [jobs, setJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadAppliedJobs = async () => {
    setLoading(true);
    try {
      const res = await getAppliedJobs();
      if (res.success && Array.isArray(res.data)) {
        setJobs(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppliedJobs();
  }, []);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const res = await updateAppliedJob(jobId, { status: newStatus });
      if (res.success) {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus as any } : j));
        window.showToast?.(`Status updated to ${newStatus}`, 'success');
      }
    } catch {
      window.showToast?.('Could not update status', 'error');
    }
  };

  const handleDelete = async (jobId: string) => {
    window.showConfirm?.({
      title: 'Remove Job',
      message: 'Remove this job from your application tracking list?',
      onConfirm: async () => {
        try {
          const res = await deleteAppliedJob(jobId);
          if (res.success) {
            setJobs(prev => prev.filter(j => j.id !== jobId));
            window.showToast?.('Job removed', 'info');
          }
        } catch {
          window.showToast?.('Could not remove job', 'error');
        }
      }
    });
  };

  const filteredJobs = jobs.filter(j => {
    const matchesStatus = filterStatus === 'all' || j.status === filterStatus;
    const matchesSearch = !searchTerm ||
      j.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const appliedCount = jobs.filter(j => j.status === 'Applied').length;
  const interviewingCount = jobs.filter(j => j.status === 'Interviewing').length;
  const offerCount = jobs.filter(j => j.status === 'Offer').length;

  return (
    <div className="p-6 md:p-8 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ─── Header & Key Metrics ─── */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-headline text-xs font-bold mb-2">
              <Briefcase size={14} /> Career Pipeline
            </div>
            <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tight">
              Applied & Saved Jobs
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Track your application lifecycle, interviews, and direct platform application links.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                {appliedCount}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Applied</p>
                <p className="text-xs font-bold text-slate-700">Submissions</p>
              </div>
            </div>

            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                {interviewingCount}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Interviews</p>
                <p className="text-xs font-bold text-slate-700">In Progress</p>
              </div>
            </div>

            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                {offerCount}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Offers</p>
                <p className="text-xs font-bold text-slate-700">Received</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Search & Status Filters ─── */}
        <section className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['all', 'Applied', 'Interviewing', 'Offer', 'Saved', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === status
                    ? 'primary-gradient text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {status === 'all' ? `All Jobs (${jobs.length})` : `${status} (${jobs.filter(j => j.status === status).length})`}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by title or company..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-inner"
            />
          </div>
        </section>

        {/* ─── Jobs Grid ─── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase size={28} />
            </div>
            <h3 className="font-headline font-bold text-xl text-primary">No tracked jobs in this view</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Find live matches on Naukri, Indeed, LinkedIn, and Internshala in Job Matches and click "Apply & Save" to track them here.
            </p>
            <button
              onClick={() => setScreen('matches')}
              className="primary-gradient text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-all"
            >
              Browse Job Matches →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const statusBadge = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied;
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between group space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header: Platform & Status */}
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {job.platform || 'Job Board'}
                      </span>

                      {/* Status Selector Dropdown */}
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1 rounded-xl border appearance-none pr-7 relative cursor-pointer focus:ring-2 focus:ring-primary ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offer">Offer Received</option>
                        <option value="Saved">Saved for Later</option>
                        <option value="Rejected">Archived</option>
                      </select>
                    </div>

                    {/* Job Title & Company */}
                    <div>
                      <h3 className="font-headline font-bold text-lg text-primary group-hover:text-secondary transition-colors line-clamp-1">
                        {job.job_title}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                        <Building2 size={13} className="text-slate-400 shrink-0" />
                        <span className="font-semibold">{job.company_name}</span>
                      </div>
                    </div>

                    {/* Meta badges: Location & Salary */}
                    <div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-500">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                        <MapPin size={12} className="text-slate-400" />
                        {job.location}
                      </span>
                      {job.salary_min && job.salary_max && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold font-mono">
                          <DollarSign size={12} />
                          ${job.salary_min}k - ${job.salary_max}k
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <a
                      href={job.job_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 primary-gradient text-white py-2.5 px-4 rounded-xl font-headline font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Open on {job.platform || 'Platform'}</span>
                      <ExternalLink size={13} />
                    </a>

                    <button
                      onClick={() => handleDelete(job.id)}
                      title="Remove from tracking"
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
