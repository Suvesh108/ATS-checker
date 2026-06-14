import { useState, useEffect } from 'react';
import { Zap, CheckSquare, TrendingUp, Copy, Check } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { API_BASE, getAuthHeaders, getJsonHeaders } from '../lib/api';
import { ActionItem } from '../types';

// ─── Optimizer Page ──────────────────────────────────────────────────────────

export default function Optimizer() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bullet, setBullet] = useState('');
  const [rewritten, setRewritten] = useState('');
  const [rewriting, setRewriting] = useState(false);
  const [copied, setCopied] = useState(false);

  const resumeId = localStorage.getItem('selected_resume_id');

  useEffect(() => {
    if (!resumeId) { setLoading(false); return; }

    fetch(`${API_BASE}/optimizer/action-items/${resumeId}`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(res => { if (res.success) setItems(res.data); })
      .finally(() => setLoading(false));
  }, [resumeId]);

  // Fix #5: Toggle action item completion and persist to backend
  const toggleItem = async (itemId: string, currentCompleted: boolean) => {
    if (!resumeId) return;
    const newCompleted = !currentCompleted;

    // Optimistic UI update
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, completed: newCompleted } : i));

    try {
      await fetch(`${API_BASE}/optimizer/action-items/${resumeId}/${itemId}`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ completed: newCompleted }),
      });
    } catch {
      // Revert on error
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, completed: currentCompleted } : i));
    }
  };

  const rewriteBullet = async () => {
    if (!bullet.trim()) return;
    setRewriting(true);
    try {
      const res = await fetch(`${API_BASE}/optimizer/rewrite-bullet`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({ bullet_text: bullet }),
      }).then(r => r.json());
      if (res.success) setRewritten(res.data.rewritten);
      else alert(res.detail || 'Rewrite failed. Please try again.');
    } catch {
      alert('Could not reach the server. Is the backend running?');
    } finally {
      setRewriting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rewritten);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ml-64 p-12 bg-surface min-h-screen">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h2 className="text-5xl font-extrabold font-headline tracking-tight text-primary mb-4 leading-tight">
            Refine Your Professional Narrative.
          </h2>
          <p className="text-lg text-slate-600 font-body leading-relaxed">
            Follow the AI-curated guide below to maximize your ATS score.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Action Items */}
          <div className="lg:col-span-6 space-y-6">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold font-headline flex items-center gap-2">
                  <Zap size={20} className="text-secondary fill-secondary" />Action Items
                </h3>
                {items.length > 0 && (
                  <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                    {items.filter(i => i.completed).length}/{items.length} done
                  </span>
                )}
              </div>

              {loading ? (
                <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
              ) : items.length === 0 ? (
                <EmptyState
                  icon={CheckSquare}
                  title="No action items yet"
                  desc="Run an analysis on a resume first to generate your personalized optimization checklist."
                />
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id, item.completed)}
                      className={`flex items-center gap-5 p-5 bg-slate-50 rounded-xl border-l-4 cursor-pointer ${
                        item.priority === 'critical' ? 'border-tertiary' : 'border-primary'
                      } ${item.completed ? 'opacity-60' : 'hover:bg-slate-100'} transition-all`}
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 transition-all ${
                        item.completed ? 'bg-secondary' : 'border-2 border-slate-300'
                      }`}>
                        {item.completed && <Check size={14} className="text-white" />}
                      </div>
                      <div className="flex-grow">
                        <p className={`font-bold text-primary ${item.completed ? 'line-through opacity-50' : ''}`}>
                          {item.title}
                        </p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-slate-200 text-primary text-[10px] font-bold rounded-full shrink-0">
                        +{item.points} PTS
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* AI Bullet Rewriter */}
          <div className="lg:col-span-4 sticky top-24">
            <section className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 primary-gradient rounded-lg flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold font-headline text-primary">AI Bullet Rewriter</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Powered by Gemini</p>
                </div>
              </div>

              <textarea
                value={bullet}
                onChange={e => setBullet(e.target.value)}
                placeholder="Paste a resume bullet point here..."
                className="w-full h-28 bg-white rounded-xl p-4 text-sm border border-slate-200 focus:ring-2 focus:ring-primary resize-none mb-4"
              />
              <button
                onClick={rewriteBullet}
                disabled={rewriting || !bullet.trim()}
                className="w-full py-3 primary-gradient text-white rounded-xl font-headline font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {rewriting ? 'Rewriting...' : 'Rewrite with AI'}
              </button>

              {rewritten && (
                <div className="mt-6 glass-panel p-4 rounded-xl text-sm font-medium text-primary border-l-4 border-secondary shadow-sm">
                  <p className="text-[10px] font-bold text-secondary mb-2 flex items-center gap-1">
                    <TrendingUp size={12} /> Optimized Version:
                  </p>
                  <p className="leading-relaxed">{rewritten}</p>
                  <button
                    onClick={handleCopy}
                    className="mt-3 text-[10px] font-bold text-primary flex items-center gap-1 hover:underline uppercase tracking-wider"
                  >
                    {copied ? <><Check size={10} /> COPIED!</> : <><Copy size={10} /> COPY</>}
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
