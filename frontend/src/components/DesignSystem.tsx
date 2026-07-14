import React from 'react';

/** Floating background orbs for dynamic aesthetic — use at the top of every page */
export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="absolute w-[500px] h-[500px] rounded-full animate-float"
        style={{
          top: '-10%', right: '-5%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full animate-float-delayed"
        style={{
          bottom: '10%', left: '-10%',
          background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full animate-glow-pulse"
        style={{
          top: '40%', right: '20%',
          background: 'radial-gradient(circle, rgba(242,169,59,0.04) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

/** Stagger container for framer-motion */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/** Fade-up animation variant */
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

/** Page header with gradient icon */
export function PageHeader({ icon: Icon, title, subtitle, children }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
      <div>
        <h1 className="text-2xl font-display font-extrabold flex items-center gap-2.5 text-text-primary">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Icon size={16} className="text-violet" />
          </div>
          {title}
        </h1>
        {subtitle && <p className="text-sm text-text-muted mt-1.5">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

/** Shared inline styles for form inputs */
export const inputStyle = "w-full rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none transition-all duration-300 placeholder:text-text-muted/50";
export const inputBg = { background: 'rgba(11,11,20,0.6)', border: '1px solid rgba(42,41,56,0.5)' };
export const inputFocus = "focus:border-violet/40";

/** Gradient-bordered card wrapper */
export function GradientCard({ children, className = '', accentColor = '#8B5CF6' }: {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-[1px] ${className}`}
      style={{ background: `linear-gradient(135deg, ${accentColor}40 0%, rgba(28,27,41,0.3) 50%, rgba(28,27,41,0.3) 100%)` }}>
      <div className="rounded-2xl h-full"
        style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95) 0%, rgba(21,20,31,0.98) 100%)' }}>
        {children}
      </div>
    </div>
  );
}

/** Modal overlay wrapper */
export function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(11,11,20,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {children}
    </div>
  );
}
