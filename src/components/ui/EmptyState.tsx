import React from 'react';

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, desc, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
      <Icon size={28} className="text-slate-400" />
    </div>
    <h3 className="font-headline font-bold text-xl text-primary">{title}</h3>
    <p className="text-slate-500 max-w-xs leading-relaxed">{desc}</p>
    {action}
  </div>
);
