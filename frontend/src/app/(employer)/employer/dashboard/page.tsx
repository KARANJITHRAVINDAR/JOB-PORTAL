'use client';

import { motion } from 'framer-motion';
import { MapPin, Briefcase, Zap, Users, ArrowRight, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EmployerDashboard() {
  const [pulse, setPulse] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Contractor</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your workforce in real-time</p>
        </div>
        <Link href="/employer/post" className="btn-neon hidden md:flex items-center gap-2">
          Post New Request
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Active Jobs', value: '3', icon: Briefcase, color: 'text-neon-blue' },
          { title: 'Pending Applicants', value: '12', icon: Users, color: 'text-neon-purple' },
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
          </div>

          {/* Dummy Jobs */}
          {[
            { title: 'Need 2 Electricians', location: 'Salem Town', slots: 2, pending: 2, queued: 5, urgent: true },
            { title: 'Construction Helpers', location: 'Omalur', slots: 5, pending: 3, queued: 0, urgent: false },
          ].map((job, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass-card relative overflow-hidden ${job.urgent ? 'border-red-500/30' : ''}`}
            >
              {job.urgent && (
                <div className="absolute top-0 right-0 bg-red-500/20 text-red-400 text-[10px] px-3 py-1 rounded-bl-lg font-bold tracking-widest uppercase">
                  Emergency
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {job.location}
                  </p>
                </div>
              </div>
              
              <div className="bg-black/30 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Slots Filled</span>
                  <span className="font-mono text-neon-blue">{job.pending} / {job.slots}</span>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-blue transition-all duration-500" style={{ width: `${(job.pending/job.slots)*100}%` }}></div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {/* Dummy Avatars */}
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border border-black bg-gray-800 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${idx * 10 + i}`} alt="avatar" />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border border-black bg-neon-purple/20 flex items-center justify-center text-xs text-neon-purple font-medium">
                      +{job.queued} Q
                    </div>
                  </div>
                  
                  <Link href="/employer/workers" className="text-sm text-neon-blue hover:text-white flex items-center gap-1 transition-colors">
                    Manage <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="glass-card bg-red-900/10 border-red-500/30">
            <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
              <Zap size={18} /> Emergency Broadcast
            </h3>
            <p className="text-sm text-gray-400 mb-4">Ping all workers within 10km immediately.</p>
            <button className="w-full bg-red-500/20 text-red-300 border border-red-500/50 py-3 rounded-xl font-medium hover:bg-red-500/40 transition-colors">
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
