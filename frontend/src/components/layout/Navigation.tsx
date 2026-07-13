'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Briefcase, Map, User, PlusCircle, Users, ClipboardList, Globe, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export const BottomNav = ({ role }: { role: 'seeker' | 'employer' }) => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const seekerLinks = [
    { name: t('nav_home'), href: '/seeker/dashboard', icon: Home },
    { name: t('nav_jobs'), href: '/seeker/jobs', icon: Briefcase },
    { name: t('nav_map'), href: '/seeker/map', icon: Map },
    { name: t('nav_profile'), href: '/seeker/profile', icon: User },
  ];

  const employerLinks = [
    { name: t('nav_dashboard'), href: '/employer/dashboard', icon: Home },
    { name: t('nav_posted_jobs'), href: '/employer/posted-jobs', icon: ClipboardList },
    { name: t('nav_post'), href: '/employer/post', icon: PlusCircle },
    { name: t('nav_workers'), href: '/employer/workers', icon: Users },
    { name: t('nav_profile'), href: '/employer/profile', icon: User },
  ];

  const links = role === 'seeker' ? seekerLinks : employerLinks;

  return (
    <nav className="fixed bottom-0 w-full md:hidden z-50 pb-safe"
      style={{
        background: 'linear-gradient(180deg, rgba(11,11,20,0.85) 0%, rgba(11,11,20,0.98) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(139,92,246,0.1)',
      }}
    >
      <ul className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <li key={link.name} className="flex-1">
              <Link href={link.href} className="flex flex-col items-center justify-center w-full h-full relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute -top-0.5 w-8 h-1 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #8B5CF6, #34D399)' }}
                  />
                )}
                <link.icon
                  size={22}
                  className={`relative z-10 transition-all duration-300 ${isActive ? 'text-violet' : 'text-text-muted'}`}
                  style={isActive ? { filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' } : {}}
                />
                <span className={`text-[10px] mt-1 relative z-10 font-medium ${isActive ? 'text-text-primary' : 'text-text-muted'}`}>
                  {link.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export const Sidebar = ({ role }: { role: 'seeker' | 'employer' }) => {
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();

  const seekerLinks = [
    { name: t('nav_dashboard'), href: '/seeker/dashboard', icon: Home },
    { name: t('nav_find_jobs'), href: '/seeker/jobs', icon: Briefcase },
    { name: t('nav_worker_radar'), href: '/seeker/map', icon: Map },
    { name: t('nav_my_profile'), href: '/seeker/profile', icon: User },
  ];

  const employerLinks = [
    { name: t('nav_dashboard'), href: '/employer/dashboard', icon: Home },
    { name: t('nav_posted_jobs'), href: '/employer/posted-jobs', icon: ClipboardList },
    { name: t('nav_post_job'), href: '/employer/post', icon: PlusCircle },
    { name: t('nav_worker_radar'), href: '/employer/workers', icon: Users },
    { name: t('nav_company_profile'), href: '/employer/profile', icon: User },
  ];

  const links = role === 'seeker' ? seekerLinks : employerLinks;

  return (
    <aside
      className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 z-50"
      style={{
        background: 'linear-gradient(180deg, rgba(11,11,20,0.95) 0%, rgba(21,20,31,0.98) 100%)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderRight: '1px solid rgba(42,41,56,0.5)',
      }}
    >
      {/* Brand */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #34D399 100%)' }}>
            <span className="text-white font-black text-sm">W</span>
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-text-primary tracking-tight">Workforce OS</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-mono">
              {role} Portal
            </p>
          </div>
        </div>
      </div>

      {/* Decorative line */}
      <div className="mx-6 h-px my-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }} />

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group"
                  style={isActive ? {
                    background: 'linear-gradient(90deg, rgba(139,92,246,0.12) 0%, transparent 100%)',
                  } : {}}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                      style={{ background: 'linear-gradient(180deg, #8B5CF6, #34D399)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <link.icon
                    size={20}
                    className={`relative z-10 transition-all duration-300 ${isActive ? 'text-violet' : 'text-text-muted group-hover:text-text-primary'}`}
                    style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.4))' } : {}}
                  />
                  <span className={`relative z-10 font-medium text-sm ${isActive ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`}>
                    {link.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-2">
        <div className="mx-2 h-px mb-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(42,41,56,0.8), transparent)' }} />
        
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-bg-surface-raised/50 transition-colors cursor-pointer">
          <Globe size={16} className="text-text-muted" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-sm text-text-muted focus:outline-none appearance-none cursor-pointer hover:text-text-primary transition-colors"
          >
            <option value="en" className="bg-bg-void">English</option>
            <option value="ta" className="bg-bg-void">தமிழ்</option>
            <option value="hi" className="bg-bg-void">हिंदी</option>
          </select>
        </div>
        
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 px-4 py-2.5 w-full text-left rounded-xl"
        >
          <LogOut size={16} />
          <span className="font-medium text-sm">{t('nav_logout')}</span>
        </button>
      </div>
    </aside>
  );
};
