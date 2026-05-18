'use client';

import { motion } from 'framer-motion';
import { MapPin, Briefcase, Zap, Users, ArrowRight, PlusCircle, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EmployerDashboard() {
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
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAccept = async (jobId: string, workerId: string) => {
    try {
      const res = await fetch('http://localhost:4000/api/jobs/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, worker_id: workerId })
      });
      const data = await res.json();
      if (res.ok) {
        setAcceptedWorkerPhone(data.worker.phone);
        // Refresh jobs to show updated status
        if (user) fetchEmployerJobs(user.id);
      } else {
        alert(data.error || 'Failed to accept worker');
      }
    } catch (e) {
      alert('Error accepting worker');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Contractor'}</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your workforce in real-time</p>
        </div>
        <Link href="/employer/post" className="btn-neon hidden md:flex items-center gap-2">
          Post New Request
        </Link>
      </header>

      {/* Prominent Match Alert */}
      {acceptedWorkerPhone && (
        <div className="bg-green-500/20 border border-green-500/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-in slide-in-from-top-4">
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
            <Check size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Worker Accepted!</h2>
          <p className="text-gray-300 mb-4">You can now contact your worker directly.</p>
          <div className="text-3xl font-mono text-neon-blue tracking-wider bg-black/40 px-6 py-3 rounded-xl border border-neon-blue/30">
            {acceptedWorkerPhone}
          </div>
          <button 
            onClick={() => setAcceptedWorkerPhone(null)}
            className="mt-6 text-sm text-gray-400 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Active Jobs', value: jobs.length.toString(), icon: Briefcase, color: 'text-neon-blue' },
          { title: 'Total Applicants', value: jobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0).toString(), icon: Users, color: 'text-neon-purple' },
          { title: 'Nearby Workers', value: '45', icon: MapPin, color: 'text-green-400' },
          { title: 'Escrow Held', value: '₹4,500', icon: Zap, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="text-neon-purple" /> Live Hiring Queue
            </h2>
            <Link href="/employer/posted-jobs" className="text-sm text-neon-blue hover:underline">
              Manage All Jobs
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading your jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="glass-card text-center py-10 text-gray-500">
              No jobs posted yet. <Link href="/employer/post" className="text-neon-purple underline">Post one now</Link>.
            </div>
          ) : (
            jobs.map((job, idx) => {
              const applications = job.applications || [];
              const accepted = applications.filter((a: any) => a.status === 'ACCEPTED').length;
              const pendingApps = applications.filter((a: any) => a.status === 'PENDING' || a.status === 'QUEUED');
              
              return (
                <motion.div 
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                        <MapPin size={14} /> ₹{job.wage} • {job.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Slots Filled</span>
                      <span className="font-mono text-neon-blue">{accepted} / {job.slots_required}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-neon-blue transition-all duration-500" style={{ width: `${Math.min((accepted/job.slots_required)*100, 100)}%` }}></div>
                    </div>
                    
                    {/* Applications Queue */}
                    {pendingApps.length > 0 && (
                      <div className="space-y-3 mt-6 border-t border-white/10 pt-4">
                        <h4 className="text-sm font-semibold text-gray-400">Waiting in Queue</h4>
                        {pendingApps.map((app: any, i: number) => (
                          <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden shrink-0">
                                {app.photo_url ? (
                                  <img src={app.photo_url} alt={app.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><User size={20} /></div>
                                )}
                              </div>
                              <div>
                                <h5 className="font-semibold text-sm">{app.name}</h5>
                                <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                  <ShieldCheck size={12} /> Trust Score: {app.trust_score}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleAccept(job.id, app.worker_id)}
                              disabled={accepted >= job.slots_required}
                              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${accepted >= job.slots_required ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-neon-purple/20 text-neon-purple hover:bg-neon-purple hover:text-white'}`}
                            >
                              Accept
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card bg-red-900/10 border-red-500/30">
            <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
              <Zap size={18} /> Emergency Broadcast
            </h3>
            <p className="text-sm text-gray-400 mb-4">Ping all workers within 10km immediately.</p>
            <button 
              onClick={() => alert("Emergency mode activated! Notifying nearby workers...")}
              className="w-full bg-red-500/20 text-red-300 border border-red-500/50 py-3 rounded-xl font-medium hover:bg-red-500/40 transition-colors"
            >
              Activate Mode
            </button>
          </div>

          <div className="glass-card">
            <h3 className="font-semibold mb-4">Nearby Availability</h3>
            <div className="relative h-48 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
              <div className="absolute w-32 h-32 border border-neon-purple/30 rounded-full animate-ping opacity-20"></div>
              <div className="text-center">
                <MapPin size={32} className="text-neon-purple mx-auto mb-2" />
                <span className="text-2xl font-bold text-white">45</span>
                <p className="text-xs text-gray-400">Workers in 5km</p>
              </div>
            </div>
            <Link href="/employer/workers" className="btn-neon w-full mt-4 flex items-center justify-center text-sm py-2">
              View Radar Map
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile Fab */}
      <Link href="/employer/post" className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-neon-purple rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(176,38,255,0.6)] z-50">
        <PlusCircle size={24} className="text-white" />
      </Link>
    </div>
  );
}
