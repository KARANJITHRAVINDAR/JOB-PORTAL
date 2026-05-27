'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Briefcase, Map, MessageSquare, User, PlusCircle, Users, ClipboardList, Globe } from 'lucide-react';
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
    <nav className="fixed bottom-0 w-full md:hidden bg-deep-black/80 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
      <ul className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <li key={link.name} className="flex-1">
              <Link href={link.href} className="flex flex-col items-center justify-center w-full h-full relative">
                {isActive && (
                  <motion.div 
                    layoutId="nav-pill" 
                    className="absolute inset-0 bg-neon-purple/20 rounded-xl m-1" 
                  />
                )}
                <link.icon 
                  size={24} 
                  className={`relative z-10 transition-colors ${isActive ? 'text-neon-purple drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]' : 'text-gray-500'}`} 
                />
                <span className={`text-[10px] mt-1 relative z-10 ${isActive ? 'text-white' : 'text-gray-500'}`}>
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
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-deep-black/60 backdrop-blur-xl border-r border-white/10 z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple tracking-wider">
          Workforce OS
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{role} {t('nav_portal')}</p>
      </div>

      <nav className="flex-1 px-4 mt-6">
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <li key={link.name}>
                <Link 
                  href={link.href} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active" 
                      className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-transparent border-l-2 border-neon-purple" 
                    />
                  )}
                  <link.icon 
                    size={20} 
                    className={`relative z-10 transition-colors ${isActive ? 'text-neon-purple' : 'text-gray-400 group-hover:text-white'}`} 
                  />
                  <span className={`relative z-10 font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                    {link.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10 flex flex-col gap-4">
        <div className="flex items-center gap-3 px-4 py-2">
          <Globe size={18} className="text-gray-400" />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-sm text-gray-300 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="en" className="bg-deep-black">English</option>
            <option value="ta" className="bg-deep-black">தமிழ்</option>
            <option value="hi" className="bg-deep-black">हिंदी</option>
          </select>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors px-4 py-2 w-full text-left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span className="font-medium">{t('nav_logout')}</span>
        </button>
      </div>
    </aside>
  );
};
