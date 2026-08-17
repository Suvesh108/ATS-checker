import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HelpCircle, CheckSquare, AlertTriangle, Info } from 'lucide-react';

// ─── Firebase Auth
import { initAuthListener, logout } from './lib/firebase';

// ─── Layout
import { Navbar } from './components/layout/Navbar';

// ─── Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import Optimizer from './pages/Optimizer';
import JobMatches from './pages/JobMatches';
import AppliedJobs from './pages/AppliedJobs';
import Settings from './pages/Settings';

// ─── Types
import { Screen } from './types';

// ─── Custom UI Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-4 bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border-l-4 max-w-sm border-slate-100"
      style={{
        borderLeftColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
      }}
    >
      <div className={`p-2 rounded-xl ${
        type === 'success' ? 'bg-emerald-50 text-emerald-600' : type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
      }`}>
        {type === 'success' && <CheckSquare size={18} />}
        {type === 'error' && <AlertTriangle size={18} />}
        {type === 'info' && <Info size={18} />}
      </div>
      <div className="flex-grow">
        <p className="text-sm font-bold text-slate-800 leading-snug">{message}</p>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-headline font-bold text-xs p-1">✕</button>
    </motion.div>
  );
};

// ─── Custom UI Confirm Modal Component
const ConfirmModal = ({ title, message, onConfirm, onCancel }: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6"
      >
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-headline font-bold text-xl text-slate-800">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-5 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-500 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/10 transition-all"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Page title map
const PAGE_TITLES: Record<Screen, string> = {
  landing: '',
  dashboard: 'Dashboard Overview',
  report: 'Detailed Report',
  optimizer: 'Analysis Engine',
  matches: 'Job Matches',
  applied: 'Applied Jobs',
  settings: 'Settings',
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [authReady, setAuthReady] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    localStorage.setItem('token', 'mock-token');
    setAuthReady(true);

    window.showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setToast({ message, type });
    };

    window.showConfirm = (config: { title: string; message: string; onConfirm: () => void }) => {
      setConfirmConfig(config);
    };
  }, []);

  const handleLogout = async () => {
    setScreen('landing');
  };

  // Don't render anything until ready
  if (!authReady) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 primary-gradient rounded-2xl animate-pulse" />
          <p className="text-slate-400 font-headline font-bold text-sm">Loading Curator…</p>
        </div>
      </div>
    );
  }

  // Show landing
  if (screen === 'landing') {
    return <Landing onStart={(focusJd) => {
      localStorage.setItem('token', 'mock-token');
      if (focusJd) {
        localStorage.setItem('focus_jd', 'true');
      }
      setScreen('dashboard');
    }} />;
  }

  // Authenticated app shell
  return (
    <div className="min-h-screen bg-surface selection:bg-primary/10">
      <Navbar currentScreen={screen} setScreen={setScreen} onHome={handleLogout} />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {screen === 'dashboard' && <Dashboard setScreen={setScreen} />}
            {screen === 'report'    && <Report setScreen={setScreen} />}
            {screen === 'optimizer' && <Optimizer />}
            {screen === 'matches'   && <JobMatches setScreen={setScreen} />}
            {screen === 'applied'   && <AppliedJobs setScreen={setScreen} />}
            {screen === 'settings'  && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Custom Alert/Confirm UI Components */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        {confirmConfig && (
          <ConfirmModal
            title={confirmConfig.title}
            message={confirmConfig.message}
            onConfirm={() => {
              confirmConfig.onConfirm();
              setConfirmConfig(null);
            }}
            onCancel={() => setConfirmConfig(null)}
          />
        )}
      </AnimatePresence>

      {/* Floating Help Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="glass-panel w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border border-white/20 hover:scale-110 transition-transform">
          <HelpCircle className="text-primary" size={24} />
        </button>
      </div>
    </div>
  );
}
