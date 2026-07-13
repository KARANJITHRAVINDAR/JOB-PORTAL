'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, RefreshCw } from 'lucide-react';
import RadarMap from '@/components/Map';
import { FloatingOrbs, fadeUp, PageHeader } from '@/components/DesignSystem';

export default function SeekerMap() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([11.6643, 78.1460]);

  const fetchJobs = async (userData: any) => {
    setLoading(true);
    try {
      const lat = userData?.lat || 11.6643; const lng = userData?.lng || 78.1460;
      setMapCenter([lat, lng]);
      let url = `http://localhost:4000/api/jobs/nearby?lat=${lat}&lng=${lng}`;
      if (userData?.category_sought) url += `&category=${encodeURIComponent(userData.category_sought)}`;
      const res = await fetch(url); const data = await res.json();
      const formatted = Array.isArray(data) ? data.map(j => ({ id: j.id, position: [j.latitude || lat + (Math.random() - 0.5)*0.05, j.longitude || lng + (Math.random() - 0.5)*0.05], title: j.title, desc: `₹${j.wage} • ${j.category}`, distance: (j.distance / 1000).toFixed(1) })) : [];
      setJobs(formatted);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    const userDataStr = localStorage.getItem('user');
    fetchJobs(userDataStr ? JSON.parse(userDataStr) : null);
  }, []);

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col gap-4 relative">
      <FloatingOrbs />
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative z-10 flex justify-between items-center shrink-0">
        <PageHeader icon={MapIcon} title="Live Job Radar" subtitle="Discover nearby job opportunities" />
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => { const user = JSON.parse(localStorage.getItem('user') || '{}'); fetchJobs(user); }}
          className="p-2.5 rounded-xl transition-all"
          style={{ background: 'rgba(42,41,56,0.3)', border: '1px solid rgba(42,41,56,0.4)' }}>
          <RefreshCw size={18} className={`text-text-muted ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 relative overflow-hidden rounded-2xl p-[1px] z-10"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(42,41,56,0.2) 100%)' }}>
        <div className="rounded-2xl h-full relative p-1 md:p-2" style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.9), rgba(28,27,41,0.7))' }}>
          <div className="absolute top-4 left-4 z-10 px-4 py-3 rounded-xl pointer-events-none hidden md:block"
            style={{ background: 'rgba(11,11,20,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(42,41,56,0.4)' }}>
            <h3 className="text-[10px] font-mono text-violet uppercase tracking-wider">Current Area</h3>
            <p className="text-2xl font-display font-extrabold text-text-primary mt-1">{jobs.length}</p>
            <p className="text-[10px] text-text-muted">Jobs Active</p>
          </div>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet" />
            </div>
          ) : (
            <RadarMap markers={jobs} center={mapCenter} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
