'use client';

import { motion } from 'framer-motion';
import { MapPin, Briefcase, Zap, Users, PlusCircle, Check, User, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NotificationBanner from '@/components/NotificationBanner';
import { useLanguage } from '@/context/LanguageContext';
import Button from '@/components/Button';
import { FloatingOrbs, staggerContainer, fadeUp, PageHeader } from '@/components/DesignSystem';

import TrustCard from '@/components/TrustCard';
import EmptyState from '@/components/EmptyState';

export default function EmployerDashboard() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptedWorkerPhone, setAcceptedWorkerPhone] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      fetchEmployerJobs(parsed.id);
    }
  }, []);

  const fetchEmployerJobs = async (employerId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/jobs/employer/${employerId}`);
      const data = await res.json();
      if (Array.isArray(data)) setJobs(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAccept = async (jobId: string, workerId: string) => {
    try {
      const res = await fetch('http://localhost:4000/api/jobs/accept', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, worker_id: workerId })
      });
      const data = await res.json();
      if (res.ok) { setAcceptedWorkerPhone(data.worker.phone); if (user) fetchEmployerJobs(user.id); }
      else alert(data.error || 'Failed to accept worker');
    } catch { alert('Error accepting worker'); }
  };

  const handleReject = async (jobId: string, workerId: string) => {
    try {
      const res = await fetch('http://localhost:4000/api/jobs/reject', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, worker_id: workerId })
      });
      if (res.ok) { if (user) fetchEmployerJobs(user.id); }
      else { const data = await res.json(); alert(data.error || 'Failed to reject'); }
    } catch { alert('Error rejecting worker'); }
  };

  const stats = [
    { title: t('active_jobs'), value: jobs.length.toString(), icon: Briefcase, color: '#8B5CF6' },
    { title: t('total_applicants'), value: jobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0).toString(), icon: Users, color: '#34D399' },
    { title: t('nearby_workers'), value: '45', icon: MapPin, color: '#F2A93B' },
    { title: t('escrow_held'), value: '₹4,500', icon: Zap, color: '#00f0ff' },
  ];

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingOrbs />
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="relative z-10 space-y-8 animate-fade-in">
        {user && <NotificationBanner userId={user.id} />}

        <motion.div variants={fadeUp}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-text-primary leading-[1.1]">
                {t('welcome_back')}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6, #F2A93B)' }}>
                  {user?.name || 'Contractor'}
                </span>
              </h1>
              <p className="text-sm text-text-muted mt-2">{t('manage_workforce')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/tools">
                <Button variant="secondary" className="px-4 py-2.5 text-xs hidden md:flex">
                  🛠️ Rent Tools
                </Button>
              </Link>
              <Link href="/employer/post">
                <Button variant="primary" className="px-5 py-2.5 text-xs">
                  <PlusCircle size={16} /> {t('post_new_request')}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Hero Card for Employer */}
        <motion.div variants={fadeUp}>
          {user && <TrustCard user={user} />}
        </motion.div>

        {/* Accepted Worker Alert */}
        {acceptedWorkerPhone && (
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-[1px]"
            style={{ background: 'linear-gradient(135deg, #34D399 0%, #1C1B29 40%, #1C1B29 60%, #34D39980 100%)' }}>
            <div className="rounded-2xl p-6 flex flex-col items-center justify-center text-center"
              style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, #15141F 30%, #15141F 100%)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <Check size={28} className="text-signal" />
              </div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Worker Accepted!</h2>
              <p className="text-text-muted mb-4">Contact your worker directly.</p>
              <span className="text-3xl font-mono text-violet tracking-wider px-6 py-3 rounded-xl"
                style={{ background: 'rgba(28,27,41,0.8)', border: '1px solid rgba(42,41,56,0.6)' }}>
                {acceptedWorkerPhone}
              </span>
              <button onClick={() => setAcceptedWorkerPhone(null)} className="mt-4 text-sm text-text-muted hover:text-text-primary underline">
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {/* Stat Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -3, scale: 1.01 }}
              className="relative overflow-hidden rounded-2xl p-[1px]"
              style={{ background: `linear-gradient(135deg, ${stat.color}30 0%, rgba(42,41,56,0.2) 100%)` }}>
              <div className="rounded-2xl p-5 h-full relative"
                style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.9), rgba(28,27,41,0.7))' }}>
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${stat.color}30, transparent)` }} />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-text-muted text-xs font-mono uppercase tracking-wider">{stat.title}</p>
                    <h3 className="text-3xl font-display font-extrabold mt-2 text-text-primary">{stat.value}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}25` }}>
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-display font-extrabold flex items-center gap-2.5 text-text-primary">
                <Zap size={18} className="text-violet" /> {t('live_hiring_queue')}
              </h2>
              <Link href="/employer/posted-jobs" className="text-sm font-semibold text-violet hover:text-violet-dim transition-colors flex items-center gap-1">
                {t('manage_all_jobs')} →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-10 text-text-muted font-mono text-sm animate-pulse">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <EmptyState
                title={t('no_jobs_posted') || 'No jobs posted yet'}
                description={t('post_one_now') || 'Get started by creating your first job request.'}
                onEnableAlerts={() => window.location.href = '/employer/post'}
              />
            ) : jobs.map((job, idx) => {
              const applications = job.applications || [];
              const accepted = applications.filter((a: any) => a.status === 'ACCEPTED').length;
              const pendingApps = applications.filter((a: any) => a.status === 'PENDING' || a.status === 'QUEUED');

              return (
                <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }} className="glass-card relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-text-primary">{job.title}</h3>
                      <p className="text-text-muted text-sm flex items-center gap-2 mt-1 font-mono">
                        <MapPin size={13} /> ₹{job.wage} • {job.category}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: 'rgba(11,11,20,0.4)', border: '1px solid rgba(42,41,56,0.3)' }}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-muted font-sans">{t('slots_filled')}</span>
                      <span className="font-mono text-violet font-bold">{accepted} / {job.slots_required}</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(42,41,56,0.4)', border: '1px solid rgba(42,41,56,0.3)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((accepted / job.slots_required) * 100, 100)}%`, background: 'linear-gradient(90deg, #8B5CF6, #a78bfa)', boxShadow: '0 0 10px rgba(139,92,246,0.3)' }} />
                    </div>

                    {pendingApps.length > 0 && (
                      <div className="space-y-2.5 mt-5 pt-4" style={{ borderTop: '1px solid rgba(42,41,56,0.3)' }}>
                        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('waiting_in_queue')}</h4>
                        {pendingApps.map((app: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-3 rounded-xl"
                            style={{ background: 'rgba(42,41,56,0.2)', border: '1px solid rgba(42,41,56,0.3)' }}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
                                style={{ background: 'rgba(42,41,56,0.5)' }}>
                                {app.photo_url ? <img src={app.photo_url} alt={app.name} className="w-full h-full object-cover" /> : <User size={18} className="text-text-muted" />}
                              </div>
                              <div>
                                <h5 className="font-semibold text-sm text-text-primary">{app.name}</h5>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] flex items-center gap-1" style={{ color: '#34D399' }}>
                                    <ShieldCheck size={10} /> Trust: {app.trust_score}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                    style={app.is_available !== 0
                                      ? { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399' }
                                      : { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }
                                    }>
                                    {app.is_available !== 0 ? '● Available' : '● Busy'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => handleAccept(job.id, app.worker_id)} disabled={accepted >= job.slots_required}
                                variant="primary" className="px-3 py-1.5 text-xs">{t('accept')}</Button>
                              <button onClick={() => handleReject(job.id, app.worker_id)}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                                {t('reject')}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={fadeUp} className="space-y-6">
            <div className="glass-card" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2" style={{ color: '#f87171' }}>
                <Zap size={16} /> {t('emergency_broadcast')}
              </h3>
              <p className="text-sm text-text-muted mb-4">{t('emergency_desc')}</p>
              <button onClick={() => alert("Emergency mode activated!")}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                {t('activate_mode')}
              </button>
            </div>

            <div className="glass-card">
              <h3 className="font-display font-semibold mb-4 text-text-primary">{t('nearby_availability')}</h3>
              <div className="relative h-48 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ background: 'rgba(11,11,20,0.4)', border: '1px solid rgba(42,41,56,0.3)' }}>
                <div className="absolute w-32 h-32 rounded-full animate-ping opacity-10" style={{ border: '1px solid #8B5CF6' }} />
                <div className="text-center">
                  <MapPin size={28} className="text-violet mx-auto mb-2" style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.4))' }} />
                  <span className="text-3xl font-display font-extrabold text-text-primary">45</span>
                  <p className="text-xs text-text-muted mt-1">{t('workers_in_5km')}</p>
                </div>
              </div>
              <Link href="/employer/workers">
                <Button variant="primary" className="w-full mt-4 text-sm py-2.5">{t('view_radar_map')}</Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <Link href="/employer/post" className="md:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center z-50"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D4FC4)', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>
          <PlusCircle size={24} className="text-white" />
        </Link>
      </motion.div>
    </div>
  );
}
