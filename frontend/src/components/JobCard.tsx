import React from 'react';
import { MapPin, Users, ArrowUpRight } from 'lucide-react';
import Button from './Button';

interface Job {
  id: string;
  title: string;
  category: string;
  wage: number;
  distance: number;
  slots_required?: number;
  negotiable?: boolean | number;
  urgency?: 'HIGH' | 'NORMAL';
}

interface JobCardProps {
  job: Job;
  isUrgent?: boolean;
  onApply: (jobId: string) => void;
  isApplied?: boolean;
}

export default function JobCard({
  job,
  isUrgent = false,
  onApply,
  isApplied = false,
}: JobCardProps) {
  const displayDistance = (job.distance / 1000).toFixed(1);
  const slots = job.slots_required || 1;
  const isNegotiable = job.negotiable === 1 || job.negotiable === true;
  const showUrgentTag = isUrgent || job.urgency === 'HIGH';

  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-400 hover:-translate-y-1"
      style={{
        background: showUrgentTag
          ? 'linear-gradient(135deg, rgba(242,169,59,0.4) 0%, rgba(28,27,41,0.3) 50%, rgba(28,27,41,0.3) 100%)'
          : 'linear-gradient(135deg, rgba(42,41,56,0.5) 0%, rgba(42,41,56,0.2) 100%)',
      }}
    >
      <div
        className="relative rounded-2xl p-5 flex flex-col gap-4 h-full"
        style={{
          background: 'linear-gradient(135deg, rgba(21,20,31,0.9) 0%, rgba(28,27,41,0.7) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Top gradient shine on hover */}
        <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: showUrgentTag
            ? 'linear-gradient(90deg, transparent, rgba(242,169,59,0.4), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)' }} />

        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs text-text-muted font-mono font-medium"
                style={{ background: 'rgba(42,41,56,0.5)', border: '1px solid rgba(42,41,56,0.6)' }}>
                {job.category}
              </span>
              {showUrgentTag && (
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase animate-pulse"
                  style={{ background: 'linear-gradient(135deg, #F2A93B, #f59e0b)', color: '#0B0B14' }}>
                  Urgent
                </span>
              )}
              {isNegotiable && (
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold"
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#8B5CF6' }}>
                  Negotiable
                </span>
              )}
            </div>
            <h3 className="font-display font-bold text-lg text-text-primary group-hover:text-violet transition-colors duration-300 flex items-center gap-1">
              {job.title}
              <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-violet -translate-y-0.5" />
            </h3>
          </div>
        </div>

        {/* Meta Row */}
        <div className="flex gap-4 items-center text-xs text-text-muted font-mono py-2.5 px-3 rounded-xl"
          style={{ background: 'rgba(11,11,20,0.4)', border: '1px solid rgba(42,41,56,0.3)' }}>
          <span className="flex items-center gap-1.5">
            <MapPin size={12} className="text-text-muted" />
            {displayDistance} km
          </span>
          <span className="w-1 h-1 rounded-full bg-line" />
          <span className="flex items-center gap-1.5">
            <Users size={12} className="text-text-muted" />
            {slots} {slots > 1 ? 'slots open' : 'slot open'}
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-auto pt-3" style={{ borderTop: '1px solid rgba(42,41,56,0.3)' }}>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-sans">Est. Wage</span>
            <span className="font-mono text-lg font-bold text-signal" style={{ textShadow: '0 0 20px rgba(52,211,153,0.15)' }}>
              ₹{job.wage}
            </span>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onApply(job.id);
            }}
            disabled={isApplied}
            variant={showUrgentTag ? 'marigold' : 'primary'}
            className="py-2 px-5 text-xs font-semibold"
          >
            {isApplied ? 'Applied ✓' : 'Apply Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}
