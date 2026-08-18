import { AIConfig, AIProvider } from '../types';

// ─── Dynamic API Base URL for Vercel Frontend & Render Backend ───────────────

export const API_BASE = (() => {
  if (typeof window === 'undefined') return 'http://localhost:8000/api';

  // 1. Explicit Render backend URL from Vercel build environment (VITE_API_URL)
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (envUrl) {
    const cleaned = envUrl.replace(/\/+$/, '');
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
  }

  // 2. Custom backend URL saved in browser storage
  const savedUrl = localStorage.getItem('ats_backend_url')?.trim();
  if (savedUrl) {
    const cleaned = savedUrl.replace(/\/+$/, '');
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
  }

  // 3. Local development default
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '0.0.0.0';
  if (isLocal) return 'http://localhost:8000/api';

  // 4. Production fallback relative route
  return '/api';
})();

const AI_CONFIG_KEY = 'ats_ai_config';

export const getAIConfig = (): AIConfig => {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    provider: 'auto',
    model: '',
    keys: {}
  };
};

export const saveAIConfig = (config: AIConfig) => {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent('aiConfigUpdated', { detail: config }));
};

export const getAIHeaders = (): Record<string, string> => {
  const config = getAIConfig();
  const headers: Record<string, string> = {
    'x-ai-provider': config.provider || 'auto',
  };
  if (config.model) {
    headers['x-ai-model'] = config.model;
  }
  if (config.keys) {
    headers['x-ai-keys'] = JSON.stringify(config.keys);
  }
  if (config.providerModels) {
    headers['x-ai-provider-models'] = JSON.stringify(config.providerModels);
  }
  return headers;
};

// ─── Auth & Request Headers ───────────────────────────────────────────────────

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token') || 'mock-token';
  return {
    Authorization: `Bearer ${token}`,
    ...getAIHeaders(),
  };
};

export const getJsonHeaders = (): Record<string, string> => ({
  ...getAuthHeaders(),
  'Content-Type': 'application/json',
});

// ─── API Helpers ──────────────────────────────────────────────────────────────

export const testAIKey = async (provider: AIProvider, apiKey: string, model?: string) => {
  try {
    const res = await fetch(`${API_BASE}/ai/test-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, api_key: apiKey, model }),
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, data: { success: false, message: `Server error: ${text.slice(0, 120)}` } };
    }
  } catch (err: any) {
    const offline = err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError');
    return {
      success: false,
      data: { success: false, message: offline ? '⚠️ Backend server is not running. Start it with: npm run dev:backend' : err.message }
    };
  }
};

export const fetchProviderModels = async (provider: AIProvider, apiKey: string) => {
  try {
    const res = await fetch(`${API_BASE}/ai/fetch-models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, api_key: apiKey }),
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, data: { message: `Server error: ${text.slice(0, 120)}` } };
    }
  } catch (err: any) {
    const offline = err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError');
    return {
      success: false,
      data: { message: offline ? '⚠️ Backend server is not running. Start it with: npm run dev:backend' : err.message }
    };
  }
};

export const uploadResume = async (file: File, jobDescription?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (jobDescription) formData.append('job_description', jobDescription);

  const res = await fetch(`${API_BASE}/resumes/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  return res.json();
};

export const getAppliedJobs = async () => {
  const res = await fetch(`${API_BASE}/applied-jobs`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const saveAppliedJob = async (jobData: any) => {
  const res = await fetch(`${API_BASE}/applied-jobs`, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify(jobData),
  });
  return res.json();
};

export const updateAppliedJob = async (jobId: string, updateData: { status?: string; notes?: string }) => {
  const res = await fetch(`${API_BASE}/applied-jobs/${jobId}`, {
    method: 'PATCH',
    headers: getJsonHeaders(),
    body: JSON.stringify(updateData),
  });
  return res.json();
};

export const deleteAppliedJob = async (jobId: string) => {
  const res = await fetch(`${API_BASE}/applied-jobs/${jobId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};


