import React from 'react';
import { ShieldCheck, ShieldAlert, Award, TrendingUp, Zap } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  trust_score: number;
  badges?: string[] | string;
}

interface TrustCardProps {
  user: UserProfile;
  className?: string;
}

export default function TrustCard({ user, className = '' }: TrustCardProps) {
  const trustScore = user.trust_score !== undefined ? user.trust_score : 100;
  const level = user.level || 1;
  const xp = user.xp || 0;
  const nextLevelXp = 100;
  const currentXpInLevel = xp % 100;
  const xpPercentage = Math.min((currentXpInLevel / nextLevelXp) * 100, 100);

  const isLowTrust = trustScore < 35;

  // SVG config
  const radius = 42;
  const strokeWidth = 7;
  const svgSize = 120;
  const center = svgSize / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (trustScore / 100) * circumference;

  // Normalize badges
  let badgeList: string[] = [];
  if (user.badges) {
    if (Array.isArray(user.badges)) {
      badgeList = user.badges;
    } else if (typeof user.badges === 'string') {
      try { badgeList = JSON.parse(user.badges); } catch { badgeList = [user.badges]; }
    }
  }

  const ShieldIcon = isLowTrust ? ShieldAlert : ShieldCheck;
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
        className="relative rounded-2xl p-6 flex flex-col gap-6 md:flex-row items-center justify-between overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accentColorDim} 0%, #15141F 30%, #15141F 70%, rgba(139,92,246,0.06) 100%)`,
        }}
      >
        {/* Subtle radial glow behind ring */}
        <div
          className="absolute -left-10 -top-10 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: accentColor }}
        />

        {/* Left: Trust Score Ring */}
        <div className="flex items-center gap-5 relative z-10">
          <div className="relative flex items-center justify-center shrink-0" style={{ width: svgSize, height: svgSize }}>
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full blur-md opacity-40"
              style={{ border: `3px solid ${accentColor}` }}
            />
            <svg width={svgSize} height={svgSize} className="transform -rotate-90">
              {/* Track */}
              <circle
                cx={center} cy={center} r={radius}
                fill="none"
                stroke="#2A2938"
                strokeWidth={strokeWidth}
              />
              {/* Progress arc */}
              <circle
                cx={center} cy={center} r={radius}
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
                {trustScore}
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-text-muted mt-1 font-semibold">
                Trust
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-xl flex items-center gap-2" style={{ color: isLowTrust ? '#fca5a5' : '#F1F0F6' }}>
              <ShieldIcon size={22} style={{ color: accentColor }} />
              {isLowTrust ? 'Low Trust' : 'Verified Profile'}
            </h3>
            <p className="text-sm text-text-muted leading-relaxed max-w-[260px]">
              {isLowTrust
                ? 'Complete more jobs on time to raise your score.'
                : 'Calculated from completed check-ins & punctuality.'}
            </p>
          </div>
        </div>

        {/* Right: Level, XP, Badges */}
        <div className="flex-1 w-full max-w-sm flex flex-col gap-4 border-t border-line/30 pt-4 md:border-t-0 md:pt-0 md:pl-6 md:border-l md:border-l-line/30 relative z-10">

          {/* Level chip + XP bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-violet" />
                <span className="text-xs uppercase tracking-wider text-text-muted font-mono">Progression</span>
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
              <span>{nextLevelXp} XP to Lvl {level + 1}</span>
            </div>
          </div>

          {/* Badges */}
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider mb-2 font-sans flex items-center gap-1.5">
              <Award size={12} className="text-violet" /> Earned Badges
            </span>
            {badgeList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {badgeList.map((badge, idx) => (
                  <span
                    key={idx}
                    className="bg-violet/12 border border-violet/30 text-violet px-3 py-1 rounded-full text-[10px] font-bold font-sans tracking-wide"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted/70 italic mt-1">
                Complete your first job to earn a badge!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
