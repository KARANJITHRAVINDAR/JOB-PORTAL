import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { GradientStatusCard, TrustRing, ProgressionBlock } from './ui/DashboardStyles';

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
  const isLowTrust = trustScore < 35;

  const ShieldIcon = isLowTrust ? ShieldAlert : ShieldCheck;
  const accentColor = isLowTrust ? '#ef4444' : '#34D399';

  return (
    <GradientStatusCard isLowTrust={isLowTrust} className={className}>
      {/* Left: Trust Score Ring */}
      <div className="flex items-center gap-5 relative z-10 font-sans">
        <TrustRing score={trustScore} isLowTrust={isLowTrust} />

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
      <ProgressionBlock
        level={user.level || 1}
        xp={user.xp || 0}
        badges={user.badges}
      />
    </GradientStatusCard>
  );
}
