import React from 'react';

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  key?: React.Key;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);
