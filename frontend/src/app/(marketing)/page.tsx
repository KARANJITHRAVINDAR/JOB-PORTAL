'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  MapPin,
  Users,
  ShieldCheck,
  Mic,
  Wrench,
  Globe,
  Lock,
  UserCheck,
  KeyRound,
  Award,
  Zap,
  Briefcase,
  Send,
  ChevronRight,
} from 'lucide-react';
import SignalFieldFallback from '@/components/landing/SignalFieldFallback';

/* ─── Lazy-load the R3F scene (no SSR, no blocking first paint) ─── */
const SignalFieldScene = dynamic(
  () => import('@/components/landing/SignalFieldScene'),
  { ssr: false, loading: () => null }
);

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Hook: detect mobile / reduced motion ─── */
function useCanvasAllowed() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isMobile = window.innerWidth < 768;
    setAllowed(!mql.matches && !isMobile);

    const handler = () => {
      const isMob = window.innerWidth < 768;
      setAllowed(!mql.matches && !isMob);
    };
    window.addEventListener('resize', handler);
    mql.addEventListener('change', handler);
    return () => {
      window.removeEventListener('resize', handler);
      mql.removeEventListener('change', handler);
    };
  }, []);
  return allowed;
}

/* ─── Hook: hero visibility for mounting/unmounting canvas ─── */
function useHeroVisible() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/* ─── Signal Ping (inline version for landing page) ─── */
function SignalPingAccent() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-violet/20 animate-ping-pulse motion-reduce:animate-none motion-reduce:opacity-20"
          style={{ animationDelay: `${i * 0.9}s` }}
        />
      ))}
      <div className="w-2.5 h-2.5 rounded-full bg-violet shadow-[0_0_12px_rgba(139,92,246,0.6)] relative z-10" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION: HERO
   ═══════════════════════════════════════════════════════ */
function HeroSection() {
  const canvasAllowed = useCanvasAllowed();
  const { ref: heroRef, visible: heroVisible } = useHeroVisible();

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#0B0B14' }}
    >
      {/* 3D background — only on desktop with no reduced-motion */}
      {canvasAllowed && heroVisible ? <SignalFieldScene /> : <SignalFieldFallback />}

      {/* Vignette overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 50%, transparent 0%, rgba(11,11,20,0.7) 100%)',
        }}
      />

      {/* Hero content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-4xl mx-auto px-6"
      >
        {/* Eyebrow */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-6">
          <SignalPingAccent />
          <span
            className="font-mono text-[11px] tracking-[0.25em] uppercase"
            style={{ color: '#8B5CF6' }}
          >
            Hyperlocal work, matched in real time
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight"
        >
          <span className="text-text-primary">The OS for</span>
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #34D399 50%, #F2A93B 100%)',
            }}
          >
            India&apos;s Workforce
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          variants={fadeUp}
          className="text-text-muted text-lg sm:text-xl mt-6 max-w-2xl mx-auto leading-relaxed font-sans"
        >
          Post a gig. Find workers within walking distance. Pay securely through escrow.
          All from your phone.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <Link href="/login">
            <button className="group rounded-full py-3.5 px-8 font-semibold text-sm text-text-primary flex items-center gap-2.5 transition-all duration-300 hover:scale-[1.03] active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                boxShadow: '0 4px 24px rgba(139,92,246,0.3), 0 0 0 1px rgba(139,92,246,0.1)',
              }}
            >
              <MapPin size={16} />
              Find work near you
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>

          <Link href="/login">
            <button className="rounded-full py-3.5 px-8 font-semibold text-sm text-text-primary flex items-center gap-2.5 transition-all duration-300 hover:scale-[1.03] active:scale-95 hover:border-violet/60"
              style={{
                background: 'rgba(21,20,31,0.6)',
                border: '1px solid rgba(42,41,56,0.8)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Briefcase size={16} />
              Post a job
            </button>
          </Link>
        </motion.div>

        {/* Live stat strip */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10"
        >
          {/* TODO: Wire to real API data */}
          {[
            { value: '2,400+', label: 'active workers' },
            { value: '180', label: 'jobs posted today' },
            { value: '₹12L+', label: 'paid via escrow' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-text-primary">{stat.value}</span>
              <span className="text-text-muted text-xs font-sans">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-text-muted text-[10px] font-mono uppercase tracking-widest">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: '1px solid rgba(141,139,158,0.3)' }}
        >
          <div className="w-1 h-1.5 rounded-full bg-text-muted" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION: HOW IT WORKS
   ═══════════════════════════════════════════════════════ */
function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      num: '01',
      icon: Send,
      title: 'Post or Apply',
      desc: 'Employers post gigs with location & wage. Workers browse or voice-search for nearby jobs that match their skills.',
      accent: '#8B5CF6',
    },
    {
      num: '02',
      icon: MapPin,
      title: 'Match by Radius',
      desc: 'Our spatial engine finds workers within walking distance. No commute stress — work is hyperlocal.',
      accent: '#34D399',
    },
    {
      num: '03',
      icon: Lock,
      title: 'Escrow-secured Payout',
      desc: 'Wages are locked in escrow before work starts. Workers get paid on OTP-verified job completion.',
      accent: '#F2A93B',
    },
  ];

  return (
    <section
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: '#0B0B14' }}
    >
      {/* Section heading */}
      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className="max-w-6xl mx-auto px-6"
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-violet">
            Simple by design
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-text-primary mt-3">
            How It Works
          </h2>
        </motion.div>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              className="group relative rounded-2xl p-[1px] overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${step.accent}30 0%, rgba(42,41,56,0.15) 100%)`,
              }}
            >
              <div
                className="rounded-2xl p-7 sm:p-8 h-full relative transition-all duration-500"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(21,20,31,0.95), rgba(28,27,41,0.9))',
                }}
              >
                {/* Top line accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${step.accent}50, transparent)`,
                  }}
                />

                {/* Step number */}
                <span
                  className="font-mono text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: step.accent }}
                >
                  Step {step.num}
                </span>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mt-4 mb-5"
                  style={{
                    background: `${step.accent}12`,
                    border: `1px solid ${step.accent}25`,
                  }}
                >
                  <step.icon size={22} style={{ color: step.accent }} />
                </div>

                <h3 className="font-display font-bold text-xl text-text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed font-sans">{step.desc}</p>

                {/* Connecting arrow (not on last card) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full items-center justify-center"
                    style={{
                      background: 'rgba(21,20,31,0.95)',
                      border: '1px solid rgba(42,41,56,0.6)',
                    }}
                  >
                    <ChevronRight size={14} className="text-text-muted" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION: TRUST & SAFETY
   ═══════════════════════════════════════════════════════ */
function TrustSafetySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const badges = [
    { icon: Lock, label: 'Escrow Protected', desc: 'Wages held securely until job completion' },
    { icon: UserCheck, label: 'Verified Profiles', desc: 'Trust scores built from real job history' },
    { icon: KeyRound, label: 'OTP Job Completion', desc: 'Both parties verify work is done' },
    { icon: Award, label: 'Trust Score System', desc: 'Badges & XP reward reliable workers' },
  ];

  return (
    <section
      ref={ref}
      className="relative py-20 sm:py-24 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(11,11,20,1) 0%, rgba(21,20,31,0.6) 50%, rgba(11,11,20,1) 100%)',
      }}
    >
      {/* Subtle line separators */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(42,41,56,0.5), transparent)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(42,41,56,0.5), transparent)' }}
      />

      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className="max-w-5xl mx-auto px-6"
      >
        <motion.div variants={fadeUp} className="text-center mb-12">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-signal">
            Built on trust
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary mt-3">
            Safety at Every Step
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {badges.map((badge) => (
            <motion.div
              key={badge.label}
              variants={fadeUp}
              className="group flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-400"
              style={{
                background: 'rgba(21,20,31,0.5)',
                border: '1px solid rgba(42,41,56,0.4)',
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: 'rgba(52,211,153,0.08)',
                  border: '1px solid rgba(52,211,153,0.2)',
                }}
              >
                <badge.icon size={24} className="text-signal" />
              </div>
              <h4 className="font-display font-bold text-sm text-text-primary mb-1.5">
                {badge.label}
              </h4>
              <p className="text-text-muted text-xs leading-relaxed font-sans">{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION: FEATURE GRID
   ═══════════════════════════════════════════════════════ */
function FeatureGridSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const features = [
    {
      icon: MapPin,
      title: 'Spatial Job Matching',
      desc: 'GPS-powered radius search finds gigs within walking distance.',
      color: '#8B5CF6',
    },
    {
      icon: Users,
      title: 'Squad Hiring',
      desc: 'Hire a team of workers in one go — they apply as a squad.',
      color: '#34D399',
    },
    {
      icon: ShieldCheck,
      title: 'Gamified Trust & XP',
      desc: 'Workers earn XP, level up, and unlock trust badges from employers.',
      color: '#F2A93B',
    },
    {
      icon: Mic,
      title: 'AI Voice Job Posting',
      desc: 'Speak your job description in any language — AI does the rest.',
      color: '#8B5CF6',
    },
    {
      icon: Wrench,
      title: 'Tool Rentals',
      desc: 'Rent construction tools from nearby owners. No upfront cost.',
      color: '#34D399',
    },
    {
      icon: Globe,
      title: 'Multilingual Chat',
      desc: 'Chat auto-translates between Tamil, Hindi, and English.',
      color: '#F2A93B',
    },
  ];

  return (
    <section ref={ref} className="relative py-24 sm:py-32" style={{ background: '#0B0B14' }}>
      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className="max-w-6xl mx-auto px-6"
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-marigold">
            Everything you need
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-text-primary mt-3">
            Built for the Real World
          </h2>
          <p className="text-text-muted mt-4 max-w-xl mx-auto text-sm sm:text-base font-sans">
            Every feature is designed for workers and employers who rely on their phones, not laptops.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="group glass-card cursor-default"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `${feature.color}12`,
                  border: `1px solid ${feature.color}25`,
                }}
              >
                <feature.icon size={20} style={{ color: feature.color }} />
              </div>
              <h3 className="font-display font-bold text-base text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed font-sans">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION: FINAL CTA
   ═══════════════════════════════════════════════════════ */
function FinalCTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to login with prefilled phone
    window.location.href = `/login`;
  };

  return (
    <section
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: '#0B0B14' }}
    >
      {/* Background glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className="relative z-10 max-w-md mx-auto px-6"
      >
        <motion.div variants={fadeUp} className="text-center mb-8">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary">
            Ready to start?
          </h2>
          <p className="text-text-muted text-sm mt-3 font-sans">
            Join thousands of workers and employers already on the platform.
          </p>
        </motion.div>

        {/* Login card — mirrors existing login screen design */}
        <motion.div variants={fadeUp}>
          <div
            className="relative overflow-hidden rounded-2xl p-[1px]"
            style={{
              background:
                'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(42,41,56,0.2) 40%, rgba(52,211,153,0.15) 100%)',
            }}
          >
            <div
              className="rounded-2xl p-8"
              style={{
                background: 'linear-gradient(135deg, rgba(21,20,31,0.97), rgba(28,27,41,0.95))',
              }}
            >
              {/* Brand mark */}
              <div className="text-center mb-6">
                <div
                  className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #34D399 100%)',
                    boxShadow: '0 8px 24px rgba(139,92,246,0.25)',
                  }}
                >
                  <span className="text-white font-black text-lg">W</span>
                </div>
                <h3
                  className="text-2xl font-display font-extrabold bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6, #34D399)' }}
                >
                  Workforce OS
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-2 block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none transition-all duration-300 placeholder:text-text-muted/50 focus:border-violet/40"
                    style={{
                      background: 'rgba(11,11,20,0.6)',
                      border: '1px solid rgba(42,41,56,0.5)',
                    }}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full py-3.5 text-sm font-semibold text-text-primary flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    boxShadow: '0 4px 24px rgba(139,92,246,0.3)',
                  }}
                >
                  Login Securely <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-5 text-center text-sm text-text-muted font-sans">
                New here?{' '}
                <Link
                  href="/register"
                  className="text-violet hover:text-violet-dim transition-colors font-medium"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION: FOOTER
   ═══════════════════════════════════════════════════════ */
function FooterSection() {
  return (
    <footer
      className="relative py-12 sm:py-16"
      style={{
        background: 'linear-gradient(180deg, #0B0B14 0%, #0a0a0f 100%)',
        borderTop: '1px solid rgba(42,41,56,0.3)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Brand */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #34D399)' }}
              >
                <span className="text-white font-black text-sm">W</span>
              </div>
              <span className="font-display font-bold text-lg text-text-primary tracking-tight">
                Workforce OS
              </span>
            </div>
            <p className="text-text-muted text-xs max-w-[240px] leading-relaxed font-sans">
              Built for India&apos;s workforce — connecting workers and employers within walking
              distance.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 sm:gap-20">
            <div>
              <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-muted mb-4">
                Product
              </h5>
              <ul className="space-y-2.5">
                {['Find Jobs', 'Post a Gig', 'Tool Rentals', 'Trust Scores'].map((item) => (
                  <li key={item}>
                    <Link
                      href="/login"
                      className="text-sm text-text-muted hover:text-text-primary transition-colors font-sans"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-muted mb-4">
                Company
              </h5>
              <ul className="space-y-2.5">
                {['About', 'Safety', 'Contact', 'Blog'].map((item) => (
                  <li key={item}>
                    <Link
                      href="/login"
                      className="text-sm text-text-muted hover:text-text-primary transition-colors font-sans"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3"
          style={{ borderTop: '1px solid rgba(42,41,56,0.3)' }}
        >
          <span className="text-text-muted text-xs font-sans">
            © 2026 Workforce OS. All rights reserved.
          </span>
          <span className="text-text-muted/50 text-[10px] font-mono tracking-wider">
            BUILT FOR INDIA&apos;S WORKFORCE 🇮🇳
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
export default function MarketingPage() {
  return (
    <main className="bg-bg-void min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <TrustSafetySection />
      <FeatureGridSection />
      <FinalCTASection />
      <FooterSection />
    </main>
  );
}
