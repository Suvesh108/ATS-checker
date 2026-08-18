import React, { useState, useEffect } from 'react';
import {
  Sparkles, Zap, Eye, EyeOff, CheckCircle2, XCircle,
  ExternalLink, RefreshCw, Search, Briefcase, TrendingUp,
  Bell, AlertCircle, Cpu, Server, Globe,
} from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { API_BASE, getAuthHeaders, getAIConfig, saveAIConfig, testAIKey, fetchProviderModels } from '../lib/api';
import { UserProfile, AIConfig, AIProvider } from '../types';

// ─── Notification items ───────────────────────────────────────────────────────

const notificationItems = [
  { title: 'Job Match Alerts', desc: 'Instant notification when a job perfectly fits your resume profile.', icon: Briefcase },
  { title: 'Analysis Reports', desc: 'Weekly summaries of your resume performance and score trends.', icon: TrendingUp },
  { title: 'Newsletter & Updates', desc: 'Stay informed about new ATS features and career advice.', icon: Bell },
];

// ─── AI Provider Definitions ──────────────────────────────────────────────────

const AI_PROVIDERS: {
  id: AIProvider;
  name: string;
  badge: string;
  badgeColor: string;
  defaultModel: string;
  models: { id: string; name: string }[];
  freeModels: { id: string; name: string; tag?: string }[];
  paidModels: { id: string; name: string; tag?: string }[];
  keyUrl: string;
  placeholder: string;
}[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Generous Free Tier',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    defaultModel: 'gemini-2.0-flash',
    freeModels: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Recommended) ★', tag: '⚡ Free' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: '⚡ Free' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: '⚡ Free' },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B (Ultra Fast)', tag: '⚡ Free' },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', tag: '⚡ Free' },
    ],
    paidModels: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Deep Intelligence)', tag: '💎 Paid' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (2M Context)', tag: '💎 Paid' },
    ],
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    ],
    keyUrl: 'https://aistudio.google.com/app/apikey',
    placeholder: 'AIzaSy...',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    badge: '100% Free Open Models',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    defaultModel: 'llama-3.3-70b-versatile',
    freeModels: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Flagship) ★', tag: '⚡ Free' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Ultra Fast)', tag: '⚡ Free' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B (Reasoning)', tag: '⚡ Free' },
      { id: 'gemma2-9b-it', name: 'Google Gemma 2 9B', tag: '⚡ Free' },
      { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B', tag: '⚡ Free' },
    ],
    paidModels: [
      { id: 'llama-3.3-70b-specdec', name: 'Llama 3.3 70B Speculative Decoding', tag: '💎 Paid' },
    ],
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
      { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B' },
    ],
    keyUrl: 'https://console.groq.com/keys',
    placeholder: 'gsk_...',
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    badge: 'Industry Standard',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    defaultModel: 'gpt-4o-mini',
    freeModels: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Budget Friendly) ★', tag: '⚡ Low Cost' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Legacy)', tag: '⚡ Free Tier' },
    ],
    paidModels: [
      { id: 'gpt-4o', name: 'GPT-4o (Flagship Omni)', tag: '💎 Paid' },
      { id: 'o3-mini', name: 'o3-mini (High Reasoning)', tag: '💎 Paid' },
      { id: 'o1-mini', name: 'o1-mini (Reasoning)', tag: '💎 Paid' },
      { id: 'o1', name: 'o1 (Advanced Reasoning)', tag: '💎 Paid' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', tag: '💎 Paid' },
    ],
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'o3-mini', name: 'o3-mini' },
    ],
    keyUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-proj-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    badge: 'Top Tier Accuracy',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    defaultModel: 'claude-3-5-haiku-20241022',
    freeModels: [
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Fast & Starter) ★', tag: '⚡ Low Cost' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', tag: '⚡ Low Cost' },
    ],
    paidModels: [
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet (Hybrid Reasoning)', tag: '💎 Paid' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', tag: '💎 Paid' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', tag: '💎 Paid' },
    ],
    models: [
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
    ],
    keyUrl: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-api03-...',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    badge: 'Code & Math Specialist',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    defaultModel: 'deepseek-chat',
    freeModels: [
      { id: 'deepseek-chat', name: 'DeepSeek V3 (Chat & Coding) ★', tag: '⚡ Free/Ultra Low' },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1 (Math & Reasoning)', tag: '⚡ Free/Ultra Low' },
    ],
    paidModels: [],
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3' },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1' },
    ],
    keyUrl: 'https://platform.deepseek.com/api_keys',
    placeholder: 'sk-...',
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    badge: 'Advanced Reasoning',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    defaultModel: 'grok-2-latest',
    freeModels: [
      { id: 'grok-2-mini', name: 'Grok 2 Mini (Budget Tier)', tag: '⚡ Budget' },
    ],
    paidModels: [
      { id: 'grok-2-latest', name: 'Grok-2 (Flagship) ★', tag: '💎 Paid' },
      { id: 'grok-beta', name: 'Grok Beta', tag: '💎 Paid' },
    ],
    models: [
      { id: 'grok-2-latest', name: 'Grok-2' },
      { id: 'grok-2-mini', name: 'Grok 2 Mini' },
      { id: 'grok-beta', name: 'Grok Beta' },
    ],
    keyUrl: 'https://console.x.ai/',
    placeholder: 'xai-...',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (Unified Hub)',
    badge: '200+ Models (Free & Paid)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    freeModels: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free) ★', tag: '⚡ Free' },
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 Reasoning (Free)', tag: '⚡ Free' },
      { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek V3 Chat (Free)', tag: '⚡ Free' },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', tag: '⚡ Free' },
      { id: 'google/gemini-2.0-flash-thinking-exp:free', name: 'Gemini 2.0 Flash Thinking (Free)', tag: '⚡ Free' },
      { id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder 32B (Free)', tag: '⚡ Free' },
      { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', tag: '⚡ Free' },
    ],
    paidModels: [
      { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet (Anthropic)', tag: '💎 Paid' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Anthropic)', tag: '💎 Paid' },
      { id: 'openai/gpt-4o', name: 'GPT-4o (OpenAI)', tag: '💎 Paid' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (OpenAI)', tag: '💎 Paid' },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Full Quality)', tag: '💎 Paid' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (Full Quality)', tag: '💎 Paid' },
    ],
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)' },
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)' },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)' },
      { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet' },
      { id: 'openai/gpt-4o', name: 'GPT-4o' },
    ],
    keyUrl: 'https://openrouter.ai/keys',
    placeholder: 'sk-or-v1-...',
  },
];

// ─── Settings Page ────────────────────────────────────────────────────────────

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState<AIConfig>(getAIConfig());
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingKey, setTestingKey] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [aiSavedNotice, setAiSavedNotice] = useState(false);
  const [dynamicModels, setDynamicModels] = useState<Record<string, { freeModels: { id: string; name: string; tag?: string }[]; paidModels: { id: string; name: string; tag?: string }[] }>>({});
  const [fetchingModels, setFetchingModels] = useState<Record<string, boolean>>({});
  const [customModelInputs, setCustomModelInputs] = useState<Record<string, string>>({});
  const [showCustomInput, setShowCustomInput] = useState<Record<string, boolean>>({});
  const [customServerUrl, setCustomServerUrl] = useState(localStorage.getItem('ats_backend_url') || '');
  const [serverStatus, setServerStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');
  const [serverPingMsg, setServerPingMsg] = useState('');

  const checkServerStatus = async (overrideUrl?: string) => {
    setServerStatus('checking');
    const targetUrl = overrideUrl !== undefined ? overrideUrl : (customServerUrl.trim() || API_BASE);
    const base = targetUrl.replace(/\/api$/, '').replace(/\/+$/, '');
    try {
      const res = await fetch(`${base}/health`, { method: 'GET' });
      const data = await res.json();
      if (res.ok && data?.status === 'ok') {
        setServerStatus('online');
        setServerPingMsg(`Online: ${data.service || 'Curator ATS API'}`);
      } else {
        setServerStatus('offline');
        setServerPingMsg('Received non-OK response from server.');
      }
    } catch (err: any) {
      setServerStatus('offline');
      setServerPingMsg(err?.message || 'Cannot reach backend server.');
    }
  };

  const handleSaveBackendUrl = () => {
    const trimmed = customServerUrl.trim();
    if (trimmed) {
      localStorage.setItem('ats_backend_url', trimmed);
      window.showToast?.('Backend URL saved. Re-checking connection...', 'success');
    } else {
      localStorage.removeItem('ats_backend_url');
      window.showToast?.('Reset to default backend routing.', 'success');
    }
    checkServerStatus(trimmed);
  };

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setProfile(res.data);
          setForm({ first_name: res.data.first_name, last_name: res.data.last_name });
          setAvatarPreview(res.data.avatar_url);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    setAiConfig(getAIConfig());
    checkServerStatus();
  }, []);

  const persistAI = (next: AIConfig) => {
    setAiConfig(next);
    saveAIConfig(next);
    setAiSavedNotice(true);
    setTimeout(() => setAiSavedNotice(false), 2000);
  };

  const handleKeyChange = (provider: AIProvider, value: string) => {
    persistAI({ ...aiConfig, keys: { ...aiConfig.keys, [provider]: value } });
  };

  const handleProviderModeChange = (provider: 'auto' | AIProvider) => {
    const defaultModel = provider === 'auto' ? '' : (AI_PROVIDERS.find(p => p.id === provider)?.defaultModel || '');
    persistAI({ ...aiConfig, provider, model: defaultModel });
  };

  const handleModelChange = (model: string) => {
    persistAI({ ...aiConfig, model });
  };

  const handleProviderModelChange = (provider: AIProvider, model: string) => {
    persistAI({
      ...aiConfig,
      providerModels: { ...(aiConfig.providerModels || {}), [provider]: model },
      model: aiConfig.provider === provider ? model : aiConfig.model,
    });
  };

  const testKeyConnection = async (provider: AIProvider) => {
    const key = aiConfig.keys[provider];
    if (!key) { window.showToast?.(`Enter an API key for ${provider} first.`, 'error'); return; }
    const chosenModel = aiConfig.providerModels?.[provider] || AI_PROVIDERS.find(p => p.id === provider)?.defaultModel;
    setTestingKey(prev => ({ ...prev, [provider]: true }));
    try {
      const res = await testAIKey(provider, key, chosenModel);
      const isSuccess = res.success || res.data?.success;
      const detectedModel = res.data?.model || chosenModel;
      const message = res.data?.message || (isSuccess ? 'Connected!' : 'Connection failed.');
      setTestResults(prev => ({ ...prev, [provider]: { success: !!isSuccess, message } }));
      if (isSuccess) {
        persistAI({
          ...aiConfig,
          provider,
          model: detectedModel || '',
          providerModels: { ...(aiConfig.providerModels || {}), [provider]: detectedModel || '' },
        });
        window.showToast?.(`✅ Connected to ${provider.toUpperCase()} (${detectedModel})!`, 'success');
      } else {
        window.showToast?.(message, 'error');
      }
    } catch (err: any) {
      setTestResults(prev => ({ ...prev, [provider]: { success: false, message: err.message || 'Network error.' } }));
    } finally {
      setTestingKey(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleSearchModels = async (provider: AIProvider) => {
    const key = aiConfig.keys[provider];
    if (!key) { window.showToast?.(`Enter an API key for ${provider} first.`, 'error'); return; }
    setFetchingModels(prev => ({ ...prev, [provider]: true }));
    try {
      const res = await fetchProviderModels(provider, key);
      if (res.success && res.data) {
        const free = (res.data.free_models || []).map((m: any) => ({ id: m.id, name: m.name || m.id, tag: '⚡ Free' }));
        const paid = (res.data.paid_models || []).map((m: any) => ({ id: m.id, name: m.name || m.id, tag: '💎 Paid' }));
        setDynamicModels(prev => ({ ...prev, [provider]: { freeModels: free, paidModels: paid } }));
        const activeModel = res.data.verified_active_model || free[0]?.id || paid[0]?.id;
        if (activeModel) {
          handleProviderModelChange(provider, activeModel);
        }
        window.showToast?.(`✅ Verified ${free.length + paid.length} active models! Selected: ${activeModel}`, 'success');
      } else {
        window.showToast?.(res.data?.message || 'Could not fetch models.', 'error');
      }
    } catch (err: any) {
      window.showToast?.(err.message || 'Error fetching models.', 'error');
    } finally {
      setFetchingModels(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const saveProfile = async () => {
    setSaved('saving'); setSaving(true);
    try {
      const fd = new FormData();
      fd.append('first_name', form.first_name);
      fd.append('last_name', form.last_name);
      if (avatarFile) fd.append('photo', avatarFile);
      const res = await fetch(`${API_BASE}/auth/profile`, { method: 'PUT', headers: getAuthHeaders(), body: fd }).then(r => r.json());
      if (res.success) {
        setProfile(res.data);
        setAvatarFile(null);
        if (res.data?.avatar_url) setAvatarPreview(res.data.avatar_url);
        window.dispatchEvent(new Event('profileUpdated'));
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

  const isDirty = profile ? (form.first_name !== profile.first_name || form.last_name !== profile.last_name || avatarFile !== null) : false;
  const showSaveBar = isDirty || saved !== 'idle';
  const activeKeysCount = Object.values(aiConfig.keys).filter(k => !!k?.trim()).length;

  return (
    <div className="p-6 md:p-8 bg-surface min-h-screen">
      <div className="max-w-5xl mx-auto p-4 md:p-12 space-y-12">

        {/* ─── AI Model & Multi-Provider API Keys ─── */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-headline text-xs font-bold mb-2">
                <Cpu size={14} /> AI Intelligence Center
              </div>
              <h3 className="text-3xl font-headline font-extrabold text-primary tracking-tight">AI Models & API Keys</h3>
              <p className="text-slate-500 text-base mt-1">Configure your own API keys. All keys stay securely in your browser.</p>
            </div>
            <div className="flex items-center gap-2">
              {aiSavedNotice && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Saved
                </span>
              )}
              <div className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
                {activeKeysCount} / {AI_PROVIDERS.length} Keys Configured
              </div>
            </div>
          </div>

          {/* Model Routing Strategy Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-headline font-bold text-lg text-primary">Model Routing Strategy</h4>
                  <span className="text-[11px] font-extrabold bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full">Intelligent</span>
                </div>
                <p className="text-xs text-slate-500 max-w-xl">
                  Choose <strong>Auto</strong> to automatically route to the best configured model with free-tier fallback, or pin a specific provider.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleProviderModeChange('auto')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    aiConfig.provider === 'auto' ? 'primary-gradient text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Sparkles size={14} /> Auto: Best Model
                </button>
                {AI_PROVIDERS.map(p => {
                  const hasKey = !!aiConfig.keys[p.id]?.trim();
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProviderModeChange(p.id)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        aiConfig.provider === p.id
                          ? 'bg-primary text-white shadow-md'
                          : hasKey
                            ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                            : 'bg-slate-50/50 text-slate-400 border border-dashed border-slate-200'
                      }`}
                    >
                      {p.name.split(' ')[0]}
                      {hasKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {aiConfig.provider !== 'auto' && (
              <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Active {AI_PROVIDERS.find(p => p.id === aiConfig.provider)?.name} Model:
                  </label>
                  <span className="text-[11px] text-slate-400">Auto-falls back to free tier if quota requires</span>
                </div>
                <select
                  value={aiConfig.model || AI_PROVIDERS.find(p => p.id === aiConfig.provider)?.defaultModel}
                  onChange={e => handleModelChange(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-sm max-w-xs"
                >
                  <option value="">⚡ Auto-Detect Best Free/Active Model</option>
                  {AI_PROVIDERS.find(p => p.id === aiConfig.provider)?.models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Provider Keys Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AI_PROVIDERS.map(prov => {
              const currentKey = aiConfig.keys[prov.id] || '';
              const isVisible = showKeys[prov.id] || false;
              const isTesting = testingKey[prov.id] || false;
              const isFetching = fetchingModels[prov.id] || false;
              const testResult = testResults[prov.id];
              const isConfigured = !!currentKey.trim();
              const isCustom = showCustomInput[prov.id] || false;
              const dynData = dynamicModels[prov.id];
              const currentFreeModels = dynData?.freeModels?.length ? dynData.freeModels : prov.freeModels;
              const currentPaidModels = dynData?.paidModels?.length ? dynData.paidModels : prov.paidModels;
              const activeSelectedModel = aiConfig.providerModels?.[prov.id] || prov.defaultModel;

              return (
                <div
                  key={prov.id}
                  className={`bg-white rounded-3xl p-6 shadow-sm border transition-all duration-200 space-y-4 ${
                    isConfigured ? 'border-emerald-200 shadow-md ring-1 ring-emerald-500/10' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-headline font-bold text-base text-primary">{prov.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${prov.badgeColor}`}>
                          {prov.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Default: <code className="text-slate-600 font-semibold">{prov.defaultModel}</code>
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      isConfigured ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isConfigured ? <CheckCircle2 size={11} /> : null}
                      {isConfigured ? 'Connected' : 'No Key'}
                    </span>
                  </div>

                  {/* Model Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Select Model:</label>
                      <button
                        type="button"
                        onClick={() => handleSearchModels(prov.id)}
                        disabled={!isConfigured || isFetching}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-40"
                        title="Query provider API to list all active models"
                      >
                        <Search size={10} className={isFetching ? 'animate-spin' : ''} />
                        <span>{isFetching ? 'Searching...' : 'Auto-Search Models'}</span>
                      </button>
                    </div>

                    <select
                      value={isCustom ? '__custom__' : activeSelectedModel}
                      onChange={e => {
                        if (e.target.value === '__custom__') {
                          setShowCustomInput(prev => ({ ...prev, [prov.id]: true }));
                        } else {
                          setShowCustomInput(prev => ({ ...prev, [prov.id]: false }));
                          handleProviderModelChange(prov.id, e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    >
                      <optgroup label="⚡ FREE TIER MODELS">
                        {currentFreeModels.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </optgroup>
                      {currentPaidModels.length > 0 && (
                        <optgroup label="💎 PAID / PREMIUM MODELS">
                          {currentPaidModels.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="⚙️ CUSTOM">
                        <option value="__custom__">✏️ Enter Custom Model ID...</option>
                      </optgroup>
                    </select>

                    {isCustom && (
                      <input
                        type="text"
                        placeholder={`e.g. ${prov.defaultModel}`}
                        value={customModelInputs[prov.id] || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomModelInputs(prev => ({ ...prev, [prov.id]: val }));
                          handleProviderModelChange(prov.id, val);
                        }}
                        className="w-full bg-white border border-primary/40 rounded-xl px-3 py-1.5 text-xs font-mono text-primary placeholder:text-slate-300 focus:ring-2 focus:ring-primary"
                      />
                    )}
                  </div>

                  {/* API Key Input */}
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={isVisible ? 'text' : 'password'}
                        placeholder={prov.placeholder}
                        value={currentKey}
                        onChange={e => handleKeyChange(prov.id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono text-primary placeholder:text-slate-300 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, [prov.id]: !prev[prov.id] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {/* Test result message */}
                    {testResult && (
                      <p className={`text-[11px] font-medium flex items-center gap-1 ${testResult.success ? 'text-emerald-600' : 'text-red-500'}`}>
                        {testResult.success ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {testResult.message}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={prov.keyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-primary hover:text-white text-slate-700 border border-slate-200/60 transition-all shrink-0"
                      >
                        <span>Get {prov.name.split(' ')[0]} Key</span>
                        <ExternalLink size={12} />
                      </a>

                      <button
                        type="button"
                        disabled={!isConfigured || isTesting}
                        onClick={() => testKeyConnection(prov.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary hover:text-white text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
                      >
                        {isTesting ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                        <span>{isTesting ? 'Testing…' : 'Test Key'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Backend Server Connection ─── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <Server size={20} />
                </div>
                <h3 className="text-2xl font-headline font-extrabold text-primary tracking-tight">Backend Server Connection</h3>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Connected to your Render Python backend API for resume parsing, ATS scoring & job matches.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                serverStatus === 'online'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : serverStatus === 'checking'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : serverStatus === 'offline'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  serverStatus === 'online' ? 'bg-emerald-500 animate-pulse' : serverStatus === 'checking' ? 'bg-amber-500 animate-ping' : 'bg-red-500'
                }`} />
                {serverStatus === 'online' ? 'Backend Live' : serverStatus === 'checking' ? 'Checking…' : serverStatus === 'offline' ? 'Offline' : 'Unchecked'}
              </span>
              <button
                type="button"
                onClick={() => checkServerStatus()}
                disabled={serverStatus === 'checking'}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-primary hover:bg-slate-50 transition-all text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                title="Ping Server Health"
              >
                <RefreshCw size={14} className={serverStatus === 'checking' ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://curator-ats-backend.onrender.com (or leave blank for auto)"
                  value={customServerUrl}
                  onChange={e => setCustomServerUrl(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-primary placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveBackendUrl}
                className="px-6 py-3 rounded-xl bg-primary text-white font-headline font-bold text-xs shadow-md hover:bg-primary/90 transition-all shrink-0 cursor-pointer"
              >
                Save Backend URL
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 px-1">
              <span>Active Endpoint: <strong className="font-mono text-slate-600">{API_BASE}</strong></span>
              {serverPingMsg && <span className="text-slate-500 font-medium">{serverPingMsg}</span>}
            </div>
          </div>
        </section>

        {/* ─── Account Information ─── */}
        <section className="space-y-8">
          <div>
            <h3 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Account Information</h3>
            <p className="text-slate-500 text-lg">Manage your public profile and personal details.</p>
          </div>
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
            {loading ? (
              <div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
            ) : (
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-28 h-28 rounded-full border-4 border-slate-100 shadow-md overflow-hidden bg-slate-50 flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-slate-400">
                        {((form.first_name?.[0] || '') + (form.last_name?.[0] || '')).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <input type="file" id="settings-avatar-upload" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                  <button
                    type="button"
                    onClick={() => document.getElementById('settings-avatar-upload')?.click()}
                    className="px-4 py-2 text-xs font-bold text-primary hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm"
                  >
                    Change Photo
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-6 w-full">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">First Name</label>
                    <input
                      className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-sm"
                      type="text" value={form.first_name}
                      onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Last Name</label>
                    <input
                      className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-sm"
                      type="text" value={form.last_name}
                      onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Email Address</label>
                    <input
                      className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-primary font-medium shadow-sm opacity-70 cursor-not-allowed"
                      type="email" value={profile?.email ?? ''} readOnly
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Notifications ─── */}
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
        {showSaveBar && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-fit px-10 py-5 glass-panel rounded-3xl shadow-2xl flex items-center gap-10 z-50 border border-white/20">
            <span className={`text-sm font-bold flex items-center gap-2 ${
              saved === 'saved' ? 'text-secondary' : saved === 'error' ? 'text-red-500' : 'text-primary'
            }`}>
              <AlertCircle size={18} />
              {saved === 'saved' ? 'Changes saved!' : saved === 'error' ? 'Save failed — try again' : 'Unsaved changes'}
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (profile) { setForm({ first_name: profile.first_name, last_name: profile.last_name }); setAvatarFile(null); setAvatarPreview(profile.avatar_url); }
                }}
                className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors"
              >Discard</button>
              <button
                onClick={saveProfile} disabled={saving}
                className="primary-gradient text-white px-10 py-3 rounded-xl font-headline font-bold text-sm shadow-xl hover:scale-105 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
        <div className="h-24" />
      </div>
    </div>
  );
}
