import React, { useState } from 'react';
import {
  LayoutDashboard, FileText, CheckSquare, Briefcase, Settings,
  HelpCircle, Zap, LogOut, Upload,
} from 'lucide-react';
import { uploadResume } from '../../lib/api';
import { Screen } from '../../types';
import logo from '../../assets/logo.png';

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'report', label: 'Resume Analysis', icon: FileText },
  { id: 'optimizer', label: 'Score Optimizer', icon: CheckSquare },
  { id: 'matches', label: 'Job Matches', icon: Briefcase },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export const Sidebar = ({ currentScreen, setScreen, onLogout }: SidebarProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadResume(file);
      if (res.success) {
        localStorage.setItem('selected_resume_id', res.data.resume_id);
        setScreen('report');
      } else {
        alert(`Upload failed: ${res.detail || res.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Upload network error:', err);
      alert('⚠️ Could not reach the backend server.\n\nMake sure the FastAPI server is running:\n  cd backend\n  uvicorn main:app --reload --port 8000');
    } finally {
      setUploading(false);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-50 border-r border-slate-100 flex flex-col p-6 z-40">
      <div className="mb-10 flex items-center gap-3">
        <img src={logo} alt="Curator Logo" className="w-10 h-10 rounded-xl object-contain shadow-md" />
        <div>
          <h1 className="text-xl font-extrabold font-headline tracking-tight text-primary">Curator</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Premium ATS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as Screen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-semibold transition-all ${
                isActive ? 'bg-white text-primary shadow-sm translate-x-1' : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-6 border-t border-slate-200/50">
        <input
          type="file"
          id="sidebar-resume-upload"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <button
          onClick={() => document.getElementById('sidebar-resume-upload')?.click()}
          disabled={uploading}
          className="w-full py-4 primary-gradient text-white rounded-xl font-headline font-bold text-sm tracking-wide shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Resume'}
        </button>
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-primary transition-colors font-headline text-sm font-semibold">
            <HelpCircle size={18} /><span>Support</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-primary transition-colors font-headline text-sm font-semibold"
          >
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
