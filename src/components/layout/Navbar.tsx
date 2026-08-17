import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, FileText, CheckSquare, Briefcase, BookmarkCheck,
  Settings, Upload, Sparkles, Home, Menu, X, Loader2, User, Key, LogOut, ChevronDown
} from 'lucide-react';
import { Screen, AIConfig } from '../../types';
import { API_BASE, getAuthHeaders, getAIConfig, uploadResume } from '../../lib/api';

interface NavbarProps {
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
  onHome: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'report', label: 'Resume Analysis', icon: FileText },
  { id: 'optimizer', label: 'Score Optimizer', icon: CheckSquare },
  { id: 'matches', label: 'Job Matches', icon: Briefcase },
  { id: 'applied', label: 'Applied Jobs', icon: BookmarkCheck },
] as const;

const PROVIDER_NAMES: Record<string, string> = {
  gemini: 'Gemini',
  anthropic: 'Claude',
  openai: 'OpenAI',
  xai: 'Grok',
  groq: 'Groq',
  deepseek: 'DeepSeek',
};

export const Navbar = ({ currentScreen, setScreen, onHome }: NavbarProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [initials, setInitials] = useState('U');
  const [uploading, setUploading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(getAIConfig());
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchProfile = () => {
    fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setAvatarUrl(res.data.avatar_url);
          setUserEmail(res.data.email || '');
          const first = res.data.first_name || '';
          const last = res.data.last_name || '';
          if (first || last) {
            setUserName(`${first} ${last}`.trim());
            setInitials(((first[0] || '') + (last[0] || '')).toUpperCase() || 'U');
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProfile();
    const handleAvatarUpdate = () => fetchProfile();
    const handleAIConfigUpdate = () => setAiConfig(getAIConfig());

    window.addEventListener('profileUpdated', handleAvatarUpdate);
    window.addEventListener('aiConfigUpdated', handleAIConfigUpdate);

    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('profileUpdated', handleAvatarUpdate);
      window.removeEventListener('aiConfigUpdated', handleAIConfigUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadResume(file);
      if (res.success) {
        localStorage.setItem('selected_resume_id', res.data.resume_id);
        setScreen('report');
        window.showToast?.('Resume uploaded and parsed successfully.', 'success');
      } else {
        window.showToast?.(`Upload failed: ${res.detail || res.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      console.error('Upload network error:', err);
      window.showToast?.('Could not reach backend server.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const hasConfiguredKeys = Object.values(aiConfig.keys || {}).some(k => !!k?.trim());
  const providerLabel = hasConfiguredKeys
    ? (aiConfig.provider === 'auto' ? 'Auto: Best AI' : (PROVIDER_NAMES[aiConfig.provider] || aiConfig.provider))
    : 'Configure AI Key';

  return (
    <header className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand & Navigation */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setScreen('dashboard')}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-9 h-9 rounded-xl primary-gradient flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-base font-headline">C</span>
              </div>
              <div>
                <span className="text-lg font-extrabold font-headline tracking-tight text-primary">Curator</span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ATS</span>
              </div>
            </button>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setScreen(item.id as Screen)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-headline font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                    }`}
                  >
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: AI Pill, Upload & Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* Active AI Status Pill */}
            <button
              onClick={() => setScreen('settings')}
              title="Configure AI Models & Keys"
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                hasConfiguredKeys
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Sparkles size={13} className={hasConfiguredKeys ? 'text-emerald-500' : 'text-amber-500'} />
              <span>{providerLabel}</span>
            </button>

            {/* Hidden File Input */}
            <input
              type="file"
              id="top-resume-upload"
              className="hidden"
              accept=".pdf,.docx,.png,.jpg,.jpeg,.webp"
              onChange={handleFileUpload}
              disabled={uploading}
            />

            {/* Quick Upload Button */}
            <button
              onClick={() => document.getElementById('top-resume-upload')?.click()}
              disabled={uploading}
              className="hidden sm:flex items-center gap-1.5 primary-gradient text-white px-4 py-2 rounded-xl font-headline font-bold text-xs shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              <span>{uploading ? 'Parsing…' : 'Upload Resume'}</span>
            </button>

            {/* Profile Dropdown Container */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200/60"
              >
                <div className="w-8 h-8 rounded-xl bg-primary text-white font-extrabold text-xs flex items-center justify-center overflow-hidden shadow-xs">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-bold text-sm text-primary leading-snug">{userName}</p>
                    <p className="text-xs text-slate-400 truncate">{userEmail || 'Local User'}</p>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setScreen('settings');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Key size={15} className="text-primary" />
                      <span>AI Models & API Keys</span>
                    </button>

                    <button
                      onClick={() => {
                        setScreen('settings');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Settings size={15} className="text-slate-500" />
                      <span>Settings & Preferences</span>
                    </button>

                    <button
                      onClick={() => {
                        setScreen('applied');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <BookmarkCheck size={15} className="text-secondary" />
                      <span>Applied Jobs Tracker</span>
                    </button>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onHome();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut size={15} />
                      <span>Exit to Landing Page</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-2">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setScreen(item.id as Screen);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-headline font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setScreen('settings');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-left font-headline font-bold text-xs text-slate-700 bg-slate-50 flex items-center gap-2"
              >
                <Settings size={16} />
                <span>AI & Profile Settings</span>
              </button>

              <button
                onClick={() => {
                  document.getElementById('top-resume-upload')?.click();
                  setMobileMenuOpen(false);
                }}
                disabled={uploading}
                className="w-full primary-gradient text-white py-2.5 rounded-xl font-headline font-bold text-xs flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                <span>Upload Resume</span>
              </button>

              <button
                onClick={onHome}
                className="w-full py-2 text-slate-500 font-headline font-bold text-xs flex items-center justify-center gap-2"
              >
                <Home size={16} />
                <span>Home Page</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
