'use client';

import { motion } from 'framer-motion';
import { MapPin, Briefcase, Zap, Search, Mic, Map, ShieldCheck, CheckCircle, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import NotificationBanner from '@/components/NotificationBanner';
import { useLanguage } from '@/context/LanguageContext';
import VoiceAssistant from '@/components/VoiceAssistant';
import QRScanner from '@/components/QRScanner';

export default function SeekerDashboard() {
  const { t } = useLanguage();
  const [available, setAvailable] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningJobId, setScanningJobId] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      fetchJobs(parsed);
      fetchApplications(parsed.id);

      const fetchLatestUser = () => {
        fetch(`http://localhost:4000/api/auth/user/${parsed.id}`)
          .then(res => res.json())
          .then(latestUser => {
            if (!latestUser.error) {
              setUser(latestUser);
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
        // Remove from feed
        setJobs(jobs.filter(j => j.id !== jobId));
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

  const urgentJob = jobs.length > 0 ? jobs[0] : null;
  const regularJobs = jobs.slice(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {user && <NotificationBanner userId={user.id} />}
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('welcome_back')}{user?.name || 'Worker'}</h1>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
              <ShieldCheck size={14} className="text-green-400" /> {t('trust_score')}: {user?.trust_score || 100}/100
            </p>
          </div>

          <button
            onClick={() => setAvailable(!available)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 flex items-center gap-2 ${available ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-gray-800 border-gray-600 text-gray-400'
              }`}
          >
            <span className={`w-2 h-2 rounded-full ${available ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></span>
            {available ? 'Available Now' : 'Busy'}
          </button>
        </div>

        {/* AI Voice Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="What kind of work are you looking for?"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-16 text-white focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

          <VoiceAssistant 
            onIntentParsed={(category) => {
              // Update user preference and refresh jobs
              const updatedUser = { ...user, category_sought: category };
              setUser(updatedUser);
              fetchJobs(updatedUser);
              
              // Optionally update DB
              fetch('http://localhost:4000/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, category_sought: category })
              }).catch(e => console.error(e));
            }} 
          />
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-4">
          <Link href="/seeker/my-jobs" className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-colors">
            <Briefcase size={18} className="text-neon-purple" /> {t('my_jobs')}
          </Link>
          <Link href="/seeker/profile" className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-colors">
            <ShieldCheck size={18} className="text-green-400" /> {t('nav_my_profile')}
          </Link>
          <Link href="/tools" className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-colors">
            <span className="text-neon-blue">🛠️</span> Rent Tools
          </Link>
        </div>
      </header>

      {/* Accepted Applications Prompts */}
      {applications.filter(a => a.status === 'ACCEPTED').map(app => (
        <div key={app.application_id} className="bg-green-500/20 border border-green-500/50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between text-left shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">You got the job!</h2>
              <p className="text-gray-300 text-sm">Employer: <span className="text-white font-medium">{app.employer_name}</span> ({app.title})</p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <p className="text-xs text-green-400 font-bold mb-2 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              Travel Advance Sent via UPI
            </p>
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-widest">Contact Employer Now</p>
            <div className="text-2xl font-mono text-neon-blue tracking-wider bg-black/40 px-6 py-2 rounded-xl border border-neon-blue/30 mb-2">
              {app.employer_phone}
            </div>
            {app.status === 'ACCEPTED' ? (
              <button 
                onClick={() => setScanningJobId(app.job_id)}
                className="text-xs px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors flex items-center gap-1"
              >
                Scan QR to Clock In
              </button>
            ) : app.status === 'IN_PROGRESS' ? (
              <span className="text-xs px-4 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg">CLOCKED IN</span>
            ) : null}
          </div>
        </div>
      ))}

      {/* Status Tracker for Pending */}
      {applications.filter(a => a.status === 'PENDING' || a.status === 'QUEUED').length > 0 && (
        <div className="glass-card space-y-4">
          <h3 className="font-semibold mb-2">Pending Applications</h3>
          {applications.filter(a => a.status === 'PENDING' || a.status === 'QUEUED').map(app => (
            <div key={app.application_id} className="flex gap-4 items-center bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">
                <Clock className="text-yellow-400" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-sm">{app.title}</h4>
                <p className="text-xs text-gray-400">Status: {app.status}. Waiting for employer to accept.</p>
              </div>
            </div>
          ))}
        </div>
      )}



      {/* Regular Jobs Feed */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Map className="text-neon-blue" /> {t('find_nearby_jobs')}
          </h2>
          <Link href="/seeker/jobs" className="text-sm text-neon-blue hover:text-white transition-colors">
            {t('view_radar_map')}
          </Link>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-400 py-4">Searching for jobs...</div>
          ) : regularJobs.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No regular jobs found matching your category.</div>
          ) : (
            regularJobs.map((job, idx) => (
              <div key={job.id} className="glass-card hover:-translate-y-1 hover:border-white/30 cursor-pointer flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{job.title}</h3>
                    <div className="flex gap-3 text-sm text-gray-400 mt-2">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {(job.distance / 1000).toFixed(1)} km</span>
                      <span className="flex items-center gap-1 text-green-400"><Briefcase size={14} /> ₹{job.wage}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                    {job.category}
                  </span>
                </div>
                <button
                  onClick={() => handleApply(job.id)}
                  className="bg-neon-purple/20 text-neon-purple hover:bg-neon-purple hover:text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm w-max"
                >
                  Apply Now
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {scanningJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 relative">
            <button 
              onClick={() => setScanningJobId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">Scan Employer's QR Code</h3>
            <p className="text-sm text-gray-400 mb-4">
              Point your camera at the employer's device to clock in securely.
            </p>
            <QRScanner 
              onScanSuccess={handleClockIn}
            />
          </div>
        </div>
      )}
    </div>
  );
}
