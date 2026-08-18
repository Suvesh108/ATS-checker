import React from 'react';

interface LogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
  textColor?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 36,
  className = '',
  showText = false,
  textColor = 'text-primary'
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="50%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#312E81" />
          </linearGradient>
          <linearGradient id="logoDocGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
          <linearGradient id="logoCheckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="logoScanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </linearGradient>
          <filter id="logoShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Base Squircle */}
        <rect width="512" height="512" rx="128" fill="url(#logoBgGrad)" />
        <rect x="16" y="16" width="480" height="480" rx="112" fill="none" stroke="#6366F1" strokeWidth="3" strokeOpacity="0.25" />

        {/* Resume Card */}
        <g filter="url(#logoShadow)">
          <rect x="116" y="96" width="280" height="320" rx="32" fill="url(#logoDocGrad)" />
          <path d="M336 96 L396 156 L348 156 C341.373 156 336 150.627 336 144 Z" fill="#CBD5E1" />
          
          <circle cx="166" cy="156" r="20" fill="#6366F1" />
          <rect x="198" y="144" width="110" height="12" rx="6" fill="#334155" />
          <rect x="198" y="162" width="70" height="8" rx="4" fill="#94A3B8" />

          <rect x="150" y="202" width="212" height="10" rx="5" fill="#64748B" fillOpacity="0.35" />
          <rect x="150" y="226" width="180" height="10" rx="5" fill="#64748B" fillOpacity="0.35" />
          <rect x="150" y="250" width="140" height="10" rx="5" fill="#64748B" fillOpacity="0.35" />
        </g>

        {/* Laser Scan Beam */}
        <rect x="110" y="240" width="292" height="4" rx="2" fill="url(#logoScanGrad)" />

        {/* Checkpoint Verified Badge */}
        <circle cx="344" cy="344" r="72" fill="#0F172A" stroke="#1E293B" strokeWidth="4" />
        <circle cx="344" cy="344" r="60" fill="url(#logoCheckGrad)" />
        <path d="M314 344 L334 364 L374 324" fill="none" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`text-lg font-extrabold tracking-tight font-headline ${textColor}`}>
              Checkpoint
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              ATS
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
