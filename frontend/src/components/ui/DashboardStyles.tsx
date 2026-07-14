import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Award, TrendingUp, Zap } from 'lucide-react';
import Button from '@/components/Button';
import SignalPing from '@/components/SignalPing';

/* ─── 1. GradientStatusCard ─── */
interface GradientStatusCardProps {
  isLowTrust?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function GradientStatusCard({
  isLowTrust = false,
  className = '',
  children,
}: GradientStatusCardProps) {
  const accentColor = isLowTrust ? '#ef4444' : '#34D399';
  const accentColorDim = isLowTrust ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.12)';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-[1px] ${className}`}
      style={{
        background: isLowTrust
          ? 'linear-gradient(135deg, #ef4444 0%, #1C1B29 40%, #1C1B29 60%, #ef444480 100%)'
          : 'linear-gradient(135deg, #34D399 0%, #1C1B29 40%, #1C1B29 60%, #8B5CF680 100%)',
      }}
    >
      <div
        className="relative rounded-2xl p-6 flex flex-col gap-6 md:flex-row items-center justify-between overflow-hidden animate-fade-in"
        style={{
          background: `linear-gradient(135deg, ${accentColorDim} 0%, #15141F 30%, #15141F 70%, rgba(139,92,246,0.06) 100%)`,
        }}
      >
        {/* Subtle radial glow behind ring */}
        <div
          className="absolute -left-10 -top-10 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: accentColor }}
        />
        {children}
      </div>
    </div>
  );
}

/* ─── 2. TrustRing ─── */
interface TrustRingProps {
  score: number;
  label?: string;
  isLowTrust?: boolean;
  size?: number;
}

export function TrustRing({
  score,
  label = 'Trust',
  isLowTrust = false,
  size = 120,
}: TrustRingProps) {
  const accentColor = isLowTrust ? '#ef4444' : '#34D399';
  const radius = 42;
  const strokeWidth = 7;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full blur-md opacity-40"
        style={{ border: `3px solid ${accentColor}` }}
      />
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#2A2938"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.4s ease' }}
          filter={`drop-shadow(0 0 6px ${accentColor})`}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-black leading-none" style={{ color: accentColor }}>
          {score}
        </span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-text-muted mt-1 font-semibold">
          {label}
        </span>
      </div>
    </div>
  );
}

/* ─── 3. BadgePill ─── */
interface BadgePillProps {
  children: React.ReactNode;
}

export function BadgePill({ children }: BadgePillProps) {
  return (
    <span className="bg-violet/12 border border-violet/30 text-violet px-3 py-1 rounded-full text-[10px] font-bold font-sans tracking-wide">
      {children}
    </span>
  );
}

/* ─── 4. ProgressionBlock ─── */
interface ProgressionBlockProps {
  level: number;
  xp: number;
  badges?: string[] | string;
  badgeLabel?: string;
  emptyBadgeText?: string;
}

export function ProgressionBlock({
  level,
  xp,
  badges = [],
  badgeLabel = 'Earned Badges',
  emptyBadgeText = 'Complete your first job to earn a badge!',
}: ProgressionBlockProps) {
  const nextLevelXp = 100;
  const currentXpInLevel = xp % 100;
  const xpPercentage = Math.min((currentXpInLevel / nextLevelXp) * 100, 100);

  // Normalize badges
  let badgeList: string[] = [];
  if (badges) {
    if (Array.isArray(badges)) {
      badgeList = badges;
    } else if (typeof badges === 'string') {
      try {
        badgeList = JSON.parse(badges);
      } catch {
        badgeList = [badges];
      }
    }
  }

  return (
    <div className="flex-1 w-full max-w-sm flex flex-col gap-4 border-t border-line/30 pt-4 md:border-t-0 md:pt-0 md:pl-6 md:border-l md:border-l-line/30 relative z-10 font-sans">
      {/* Level chip + XP bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 font-mono">
            <Zap size={14} className="text-violet" />
            <span className="text-xs uppercase tracking-wider text-text-muted">
              Progression
            </span>
          </div>
          <span className="font-mono font-bold text-sm bg-violet/15 text-violet px-3 py-0.5 rounded-full border border-violet/25">
            Lvl {level}
          </span>
        </div>

        <div className="h-3 w-full bg-bg-void rounded-full overflow-hidden border border-line/60 relative">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out relative"
            style={{
              width: `${Math.max(xpPercentage, 2)}%`,
              background: 'linear-gradient(90deg, #8B5CF6 0%, #a78bfa 100%)',
              boxShadow: '0 0 12px rgba(139,92,246,0.4)',
            }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-text-muted">
          <span className="flex items-center gap-1">
            <TrendingUp size={10} /> {currentXpInLevel} XP
          </span>
          <span>
            {nextLevelXp} XP to Lvl {level + 1}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div>
        <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider mb-2 flex items-center gap-1.5">
          <Award size={12} className="text-violet" /> {badgeLabel}
        </span>
        {badgeList.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {badgeList.map((badge, idx) => (
              <BadgePill key={idx}>{badge}</BadgePill>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted/70 italic mt-1">{emptyBadgeText}</p>
        )}
      </div>
    </div>
  );
}

/* ─── 5. QuickLinkChip ─── */
interface QuickLinkChipProps {
  href: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  color: string;
}

export function QuickLinkChip({ href, icon: Icon, label, color }: QuickLinkChipProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-text-primary cursor-pointer transition-all duration-300 font-sans"
        style={{
          background: `linear-gradient(135deg, ${color}12, ${color}06)`,
          border: `1px solid ${color}25`,
        }}
      >
        <Icon size={16} style={{ color }} />
        {label}
      </motion.div>
    </Link>
  );
}

/* ─── 6. LiveStatusToggle ─── */
interface LiveStatusToggleProps {
  available: boolean;
  onToggle: () => void;
  disabled?: boolean;
  loadingText?: string;
  availableText?: string;
  busyText?: string;
}

export function LiveStatusToggle({
  available,
  onToggle,
  disabled = false,
  loadingText = 'Updating...',
  availableText = 'Available Now',
  busyText = 'Busy',
}: LiveStatusToggleProps) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <Button
        variant={available ? 'signal' : 'secondary'}
        onClick={onToggle}
        disabled={disabled}
        className="self-start sm:self-auto py-2.5 px-5 font-semibold text-xs border transition-all duration-300 font-sans"
      >
        <SignalPing color={available ? 'signal' : 'muted'} size="sm" />
        {disabled ? loadingText : available ? availableText : busyText}
      </Button>
    </motion.div>
  );
}

/* ─── 7. StatusTag ─── */
interface StatusTagProps {
  children: React.ReactNode;
  color?: 'signal' | 'violet' | 'marigold' | 'red' | 'muted';
}

export function StatusTag({ children, color = 'signal' }: StatusTagProps) {
  const colors = {
    signal: {
      bg: 'rgba(52,211,153,0.08)',
      border: '1px solid rgba(52,211,153,0.2)',
      text: 'text-signal',
    },
    violet: {
      bg: 'rgba(139,92,246,0.08)',
      border: '1px solid rgba(139,92,246,0.2)',
      text: 'text-violet',
    },
    marigold: {
      bg: 'rgba(242,169,59,0.08)',
      border: '1px solid rgba(242,169,59,0.2)',
      text: 'text-marigold',
    },
    red: {
      bg: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.2)',
      text: 'text-red-400',
    },
    muted: {
      bg: 'rgba(141,139,158,0.08)',
      border: '1px solid rgba(141,139,158,0.2)',
      text: 'text-text-muted',
    },
  };

  const activeColor = colors[color] || colors.signal;

  return (
    <span
      className={`text-[10px] ${activeColor.text} font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full`}
      style={{
        background: activeColor.bg,
        border: activeColor.border,
      }}
    >
      {children}
    </span>
  );
}
