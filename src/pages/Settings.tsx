import { useState, useEffect } from 'react';
import { Verified, Lock, ShieldCheck, Briefcase, BarChart3, Bell, AlertCircle } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { API_BASE, getAuthHeaders } from '../lib/api';
import { UserProfile } from '../types';

// ─── Settings Page ───────────────────────────────────────────────────────────

const notificationItems = [
  { title: 'Job Match Alerts', desc: 'Instant notification when a job perfectly fits your resume profile.', icon: Briefcase },
  { title: 'Analysis Reports', desc: 'Weekly summaries of your resume performance and score trends.', icon: BarChart3 },
  { title: 'Newsletter & Updates', desc: 'Stay informed about new ATS features and career advice.', icon: Bell },
];

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '' });
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setProfile(res.data);
          setForm({ first_name: res.data.first_name, last_name: res.data.last_name });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaved('saving');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('first_name', form.first_name);
      fd.append('last_name', form.last_name);
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: fd,
      }).then(r => r.json());

      if (res.success) {
        setProfile(res.data);
        setSaved('saved');
        setTimeout(() => setSaved('idle'), 3000);
      } else {
        setSaved('error');
        setTimeout(() => setSaved('idle'), 4000);
      }
    } catch {
      setSaved('error');
      setTimeout(() => setSaved('idle'), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ml-64 p-8 bg-surface min-h-screen">
      <div className="max-w-5xl mx-auto p-12 space-y-12">

        {/* Account Information */}
        <section className="space-y-8">
          <div>
            <h3 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Account Information</h3>
            <p className="text-slate-500 text-lg">Manage your public profile and personal details.</p>
          </div>
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
            {loading ? (
              <div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">First Name</label>
                  <input
                    className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-sm"
                    type="text"
                    value={form.first_name}
                    onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Last Name</label>
                  <input
                    className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-sm"
                    type="text"
                    value={form.last_name}
                    onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Email Address</label>
                  <div className="relative">
                    <input
                      className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-primary font-medium shadow-sm"
                      type="email"
                      value={profile?.email ?? ''}
                      readOnly
                    />
                    <Verified size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-secondary" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Security */}
        <section className="space-y-8">
          <div>
            <h3 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Security</h3>
            <p className="text-slate-500 text-lg">Protect your account with advanced authentication settings.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-10 shadow-sm border-l-4 border-primary border-y border-r border-slate-100">
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-1">
                  <h4 className="font-headline font-bold text-xl text-primary">Password</h4>
                  <p className="text-sm text-slate-400 font-medium">Managed via Firebase Auth</p>
                </div>
                <Lock className="text-primary opacity-20" size={32} />
              </div>
              <button className="w-full py-4 px-6 border-2 border-slate-100 rounded-xl text-sm font-bold text-primary hover:bg-slate-50 transition-all">
                Change Password
              </button>
            </div>
            <div className="bg-white rounded-3xl p-10 shadow-sm border-l-4 border-secondary border-y border-r border-slate-100">
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-1">
                  <h4 className="font-headline font-bold text-xl text-primary">Two-Factor Auth</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <p className="text-sm font-bold text-secondary uppercase tracking-wider">Firebase Protected</p>
                  </div>
                </div>
                <ShieldCheck className="text-secondary opacity-20" size={32} />
              </div>
              <button className="w-full py-4 px-6 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-400 hover:bg-tertiary/5 hover:text-tertiary hover:border-transparent transition-all">
                Manage 2FA
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="space-y-8">
          <div>
            <h3 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Notification Preferences</h3>
            <p className="text-slate-500 text-lg">Control how and when you receive updates.</p>
          </div>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            {notificationItems.map((item, i) => (
              <div key={i} className={`flex items-center justify-between p-8 transition-colors hover:bg-slate-50 ${i !== notificationItems.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div className="flex gap-6 items-start">
                  <div className="p-4 rounded-2xl bg-slate-100 text-primary"><item.icon size={24} /></div>
                  <div>
                    <h5 className="font-bold text-primary text-lg">{item.title}</h5>
                    <p className="text-sm text-slate-500 mt-1 max-w-md leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary shadow-inner" />
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Floating Save Bar */}
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-fit px-10 py-5 glass-panel rounded-3xl shadow-2xl flex items-center gap-10 z-50 border border-white/20">
          <span className={`text-sm font-bold flex items-center gap-2 ${
            saved === 'saved' ? 'text-secondary' : saved === 'error' ? 'text-tertiary' : 'text-primary'
          }`}>
            <AlertCircle size={18} />
            {saved === 'saved' ? 'Changes saved!' : saved === 'error' ? 'Save failed — try again' : 'Unsaved changes'}
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (profile) setForm({ first_name: profile.first_name, last_name: profile.last_name });
              }}
              className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors"
            >
              Discard
            </button>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="primary-gradient text-white px-10 py-3 rounded-xl font-headline font-bold text-sm shadow-xl hover:scale-105 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        <div className="h-24" />
      </div>
    </div>
  );
}
