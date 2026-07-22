'use client';

import { motion } from 'framer-motion';
import { MapPin, Briefcase, Zap, Search, Mic, Map, ShieldCheck, CheckCircle, Clock, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import NotificationBanner from '@/components/NotificationBanner';
import { useLanguage } from '@/context/LanguageContext';
import VoiceAssistant from '@/components/VoiceAssistant';
import QRScanner from '@/components/QRScanner';

import Button from '@/components/Button';
import SignalPing from '@/components/SignalPing';
import JobCard from '@/components/JobCard';
import TrustCard from '@/components/TrustCard';
import EmptyState from '@/components/EmptyState';
import { LiveStatusToggle, QuickLinkChip, StatusTag } from '@/components/ui/DashboardStyles';
import { FloatingOrbs, staggerContainer, fadeUp } from '@/components/DesignSystem';

export default function SeekerDashboard() {
  const { t } = useLanguage();
  const [available, setAvailable] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningJobId, setScanningJobId] = useState<string | null>(null);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setAvailable(parsed.is_available !== undefined ? !!parsed.is_available : true);
      fetchJobs(parsed);
      fetchApplications(parsed.id);

      const fetchLatestUser = () => {
        fetch(`http://localhost:4000/api/auth/user/${parsed.id}`)
          .then(res => res.json())
          .then(latestUser => {
            if (!latestUser.error) {
              setUser(latestUser);
              setAvailable(latestUser.is_available !== undefined ? !!latestUser.is_available : true);
              localStorage.setItem('user', JSON.stringify(latestUser));
            }
          })
          .catch(e => console.error('Failed to fetch latest user data', e));
      };

      fetchLatestUser();

      window.addEventListener('refreshUserData', fetchLatestUser);
      return () => {
        window.removeEventListener('refreshUserData', fetchLatestUser);
      };
    }
  }, []);

  const handleToggleAvailability = async () => {
    if (!user || togglingAvailability) return;
    const newAvailable = !available;
    setTogglingAvailability(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, is_available: newAvailable }),
      });
      if (res.ok) {
        setAvailable(newAvailable);
        const updatedUser = { ...user, is_available: newAvailable };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        console.error('Failed to update availability');
      }
    } catch (e) {
      console.error('Error updating availability', e);
    }
    setTogglingAvailability(false);
  };

  const fetchJobs = async (userData: any) => {
    try {
      const lat = userData.lat || 11.6643;
      const lng = userData.lng || 78.1460;

      let url = `http://localhost:4000/api/jobs/nearby?lat=${lat}&lng=${lng}`;
      if (userData.category_sought) {
        url += `&category=${encodeURIComponent(userData.category_sought)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchApplications = async (workerId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/jobs/seeker/${workerId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:4000/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, worker_id: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Applied successfully! Status: ' + data.status);
        fetchJobs(user);
        fetchApplications(user.id);
      } else {
        alert(data.error || 'Failed to apply');
      }
    } catch (e) {
      alert('Error applying to job');
    }
  };

  const handleClockIn = async (qrData: string) => {
    try {
      const data = JSON.parse(qrData);
      const res = await fetch('http://localhost:4000/api/jobs/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: data.jobId, worker_id: user.id })
      });
      const responseData = await res.json();
      if (res.ok) {
        alert('Successfully Clocked In!');
        setScanningJobId(null);
        fetchApplications(user.id);
      } else {
        alert(responseData.error || 'Failed to clock in');
        setScanningJobId(null);
      }
    } catch (e) {
      alert('Invalid QR Code');
      setScanningJobId(null);
    }
  };

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingOrbs />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 space-y-8"
      >
        {user && <NotificationBanner userId={user.id} />}

        {/* Hero Header */}
        <motion.header variants={fadeUp} className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <motion.h1
                className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-text-primary leading-[1.1]"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
              >
                {t('welcome_back')}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6, #34D399)' }}>
                  {user?.name || 'Worker'}
                </span>
              </motion.h1>
              <p className="text-sm text-text-muted mt-2 font-sans max-w-md">
                Check your active signals and nearby gig options.
              </p>
            </div>

            <LiveStatusToggle
              available={available}
              onToggle={handleToggleAvailability}
              disabled={togglingAvailability}
            />
          </div>
        </motion.header>

        {/* Trust Score Card */}
        <motion.div variants={fadeUp}>
          {user && <TrustCard user={user} />}
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={fadeUp} className="relative group">
          <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(52,211,153,0.1))' }} />
          <input
            type="text"
            placeholder="What kind of work are you looking for?"
            className="relative w-full bg-bg-surface border border-line rounded-2xl py-4 pl-12 pr-16 text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-violet/40 transition-all duration-400 font-sans"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)' }}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-violet" size={20} />
          <VoiceAssistant
            onIntentParsed={(category) => {
              const updatedUser = { ...user, category_sought: category };
              setUser(updatedUser);
              fetchJobs(updatedUser);
              fetch('http://localhost:4000/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, category_sought: category })
              }).catch(e => console.error(e));
            }}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
          <QuickLinkChip href="/seeker/my-jobs" icon={Briefcase} label={t('my_jobs')} color="#8B5CF6" />
          <QuickLinkChip href="/seeker/profile" icon={ShieldCheck} label={t('nav_my_profile')} color="#34D399" />
          <QuickLinkChip href="/tools" icon={Sparkles} label="Rent Tools" color="#F2A93B" />
        </motion.div>

        {/* Accepted Applications */}
        {applications.filter(a => a.status === 'ACCEPTED' || a.status === 'IN_PROGRESS').map(app => (
          <motion.div
            key={app.application_id}
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl p-[1px]"
            style={{ background: 'linear-gradient(135deg, #34D399 0%, #1C1B29 40%, #1C1B29 60%, #8B5CF680 100%)' }}
          >
            <div className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between"
              style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, #15141F 30%, #15141F 100%)' }}>
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <CheckCircle size={28} className="text-signal" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-extrabold text-text-primary mb-1">
                    {app.status === 'IN_PROGRESS' ? 'Job in Progress!' : 'You got the job!'}
                  </h2>
                  <p className="text-text-muted text-sm font-sans">
                    Employer: <span className="text-text-primary font-semibold">{app.employer_name}</span> ({app.title})
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2">
                <StatusTag color="signal">
                  {app.status === 'IN_PROGRESS' ? 'Currently Clocked In' : 'Travel Advance Sent via UPI'}
                </StatusTag>
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-sans">Contact Employer</span>
                <span className="text-xl font-mono text-violet tracking-wider px-5 py-2 rounded-xl"
                  style={{ background: 'rgba(28,27,41,0.8)', border: '1px solid rgba(42,41,56,0.6)' }}>
                  {app.employer_phone}
                </span>
                {app.status === 'ACCEPTED' && (
                  <Button onClick={() => setScanningJobId(app.job_id)} variant="primary" className="text-xs py-2 px-4 mt-1">
                    Scan QR to Clock In
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Pending Applications */}
        {applications.filter(a => a.status === 'PENDING' || a.status === 'QUEUED').length > 0 && (
          <motion.div variants={fadeUp} className="glass-card space-y-4">
            <h3 className="font-display font-bold text-lg text-text-primary flex items-center gap-2">
              <Clock size={18} className="text-marigold" />
              Pending Applications
            </h3>
            <div className="grid gap-3">
              {applications.filter(a => a.status === 'PENDING' || a.status === 'QUEUED').map(app => (
                <div key={app.application_id} className="flex gap-4 items-center p-4 rounded-xl transition-all duration-300 hover:bg-bg-surface-raised/60"
                  style={{ background: 'rgba(28,27,41,0.4)', border: '1px solid rgba(42,41,56,0.4)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(242,169,59,0.08)', border: '1px solid rgba(242,169,59,0.2)' }}>
                    <Clock className="text-marigold" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-text-primary truncate font-sans">{app.title}</h4>
                    <p className="text-xs text-text-muted mt-1 flex items-center gap-2 font-sans">
                      Status: <StatusTag color="marigold">{app.status}</StatusTag> — Waiting for employer response.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Jobs Feed */}
        <motion.div variants={fadeUp} className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-display font-extrabold flex items-center gap-2.5 text-text-primary">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Map size={16} className="text-violet" />
              </div>
              {t('find_nearby_jobs')}
            </h2>
            <Link href="/seeker/jobs" className="text-sm font-semibold text-violet hover:text-violet-dim transition-colors font-sans flex items-center gap-1">
              {t('view_radar_map')}
              <span className="text-lg">→</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-text-muted">
              <SignalPing color="violet" size="md" />
              <span className="font-mono text-sm tracking-wider animate-pulse">Searching active signals...</span>
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No active signals found"
              description="No regular jobs found matching your category. Try widening your search radius or enable alerts to be notified."
              onWidenRadius={() => alert('Radar radius widened to 25km!')}
              onEnableAlerts={() => alert('Alerts enabled for ' + (user?.category_sought || 'any job') + '!')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                >
                  <JobCard
                    job={job}
                    isUrgent={idx === 0}
                    onApply={handleApply}
                    isApplied={applications.some(a => a.job_id === job.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* QR Scanner Modal */}
        {scanningJobId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(11,11,20,0.85)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md p-6 relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(21,20,31,0.95), rgba(28,27,41,0.9))',
                border: '1px solid rgba(42,41,56,0.6)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.05)',
              }}
            >
              <button
                onClick={() => setScanningJobId(null)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-surface-raised"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-display font-bold mb-2 text-text-primary">Scan Employer's QR Code</h3>
              <p className="text-sm text-text-muted mb-4 font-sans">
                Point your camera at the employer's device to clock in securely.
              </p>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(42,41,56,0.6)' }}>
                <QRScanner onScanSuccess={handleClockIn} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
