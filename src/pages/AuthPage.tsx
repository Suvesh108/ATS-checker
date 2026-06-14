import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { loginWithEmail, signupWithEmail } from '../lib/firebase';
import { API_BASE } from '../lib/api';

// ─── Auth Page (Login + Signup) ──────────────────────────────────────────────

interface AuthPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AuthPage({ onSuccess, onBack }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string, val: string) => {
    setError('');
    setForm(f => ({ ...f, [field]: val }));
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      await loginWithEmail(form.email, form.password);
      // token is stored by the onAuthStateChanged listener in App.tsx
      // Give it 300ms to settle before navigating
      setTimeout(() => onSuccess(), 300);
    } catch (e: any) {
      const msg = e?.code === 'auth/invalid-credential' || e?.code === 'auth/wrong-password'
        ? 'Invalid email or password.'
        : e?.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : e?.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later.'
        : 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!form.email || !form.password || !form.first_name || !form.last_name) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      // 1. Create user via backend (handles Firebase Admin + Firestore)
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
        }),
      }).then(r => r.json());

      if (!res.success) {
        throw new Error(res.detail || res.message || 'Signup failed');
      }

      // 2. Log in on the client side to establish the session
      await loginWithEmail(form.email, form.password);
      
      setTimeout(() => onSuccess(), 300);
    } catch (e: any) {
      console.error('Signup error:', e);
      const msg = e.message?.toLowerCase().includes('already in use')
        ? 'An account with this email already exists. Try logging in.'
        : e.message || 'Signup failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') handleLogin();
    else handleSignup();
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

          {/* Header stripe */}
          <div className="primary-gradient px-10 pt-10 pb-8">
            <button onClick={onBack} className="text-white/60 hover:text-white text-sm font-bold mb-6 flex items-center gap-1 transition-colors">
              ← Back
            </button>
            <h1 className="font-headline text-3xl font-extrabold text-white">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-white/70 mt-2">
              {mode === 'login'
                ? 'Sign in to access your ATS dashboard.'
                : 'Get your first ATS score in under 60 seconds.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-10 py-8 space-y-5">

            {/* Name fields (signup only) */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">First Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="John"
                      value={form.first_name}
                      onChange={e => update('first_name', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Last Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Doe"
                      value={form.last_name}
                      onChange={e => update('last_name', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-4 bg-tertiary/10 rounded-xl text-tertiary text-sm font-medium">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 primary-gradient text-white font-headline font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg disabled:opacity-50 mt-2"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} /></>
              }
            </button>

            {/* Toggle mode */}
            <p className="text-center text-sm text-slate-500">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="font-bold text-primary hover:underline"
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
