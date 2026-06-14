import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HelpCircle } from 'lucide-react';

// ─── Firebase Auth
import { initAuthListener, logout } from './lib/firebase';

// ─── Layout
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// ─── Pages
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import Optimizer from './pages/Optimizer';
import JobMatches from './pages/JobMatches';
import Settings from './pages/Settings';

// ─── Types
import { Screen } from './types';

// ─── Page title map
const PAGE_TITLES: Record<Screen, string> = {
  landing: '',
  dashboard: 'Dashboard Overview',
  report: 'Detailed Report',
  optimizer: 'Analysis Engine',
  matches: 'Job Matches',
  settings: 'Settings',
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Listen for Firebase auth state — keeps token fresh automatically
  useEffect(() => {
    const unsub = initAuthListener((user) => {
      setAuthReady(true);
      if (!user) {
        // User logged out — go back to landing
        setScreen('landing');
        setShowAuth(false);
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await logout();
    setScreen('landing');
    setShowAuth(false);
  };

  // Don't render anything until Firebase has checked auth state
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
  if (screen === 'landing' && !showAuth) {
    return <Landing onStart={() => setShowAuth(true)} />;
  }

  // Show login/signup
  if (showAuth && screen === 'landing') {
    return (
      <AuthPage
        onSuccess={() => { setShowAuth(false); setScreen('dashboard'); }}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  // Authenticated app shell
  return (
    <div className="min-h-screen bg-surface selection:bg-primary/10">
      <Sidebar currentScreen={screen} setScreen={setScreen} onLogout={handleLogout} />
      <TopBar title={PAGE_TITLES[screen]} />
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
            {screen === 'report'    && <Report />}
            {screen === 'optimizer' && <Optimizer />}
            {screen === 'matches'   && <JobMatches setScreen={setScreen} />}
            {screen === 'settings'  && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Help Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="glass-panel w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border border-white/20 hover:scale-110 transition-transform">
          <HelpCircle className="text-primary" size={24} />
        </button>
      </div>
    </div>
  );
}
