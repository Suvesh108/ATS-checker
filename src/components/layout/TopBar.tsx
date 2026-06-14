import { Search, Zap, HelpCircle } from 'lucide-react';

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  title: string;
}

export const TopBar = ({ title }: TopBarProps) => (
  <header className="sticky top-0 w-full z-30 flex justify-between items-center px-8 h-16 ml-64 bg-white/80 backdrop-blur-md border-b border-slate-100">
    <span className="font-headline text-lg font-extrabold text-primary">{title}</span>
    <div className="flex items-center gap-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search resumes or jobs..."
          className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-slate-200 w-64 transition-all"
        />
      </div>
      <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"><Zap size={20} /></button>
      <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"><HelpCircle size={20} /></button>
      <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-100 shadow-sm" />
    </div>
  </header>
);
