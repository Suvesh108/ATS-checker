/// <reference types="vite/client" />

interface Window {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  showConfirm: (config: { title: string; message: string; onConfirm: () => void }) => void;
}
