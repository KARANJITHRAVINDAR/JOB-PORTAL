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

  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const fetchJobs = async (lat: number, lng: number, userData: any) => {
    setLoading(true);
    try {
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
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserPos([lat, lng]);
          if (userData) {
            userData.lat = lat;
            userData.lng = lng;
            localStorage.setItem('user', JSON.stringify(userData));
          }
          fetchJobs(lat, lng, userData);
        },
        (err) => {
          console.warn("Geolocation failed", err);
          const fallbackLat = userData?.lat || 11.6643;
          const fallbackLng = userData?.lng || 78.1460;
          fetchJobs(fallbackLat, fallbackLng, userData);
        }
      );
    } else {
      const fallbackLat = userData?.lat || 11.6643;
      const fallbackLng = userData?.lng || 78.1460;
      fetchJobs(fallbackLat, fallbackLng, userData);
    }
  }, []);

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col gap-4 relative">
      <FloatingOrbs />
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative z-10 flex justify-between items-center shrink-0">
        <PageHeader icon={MapIcon} title="Live Job Radar" subtitle="Discover nearby job opportunities" />
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => { 
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => fetchJobs(pos.coords.latitude, pos.coords.longitude, user),
                () => fetchJobs(user.lat || 11.6643, user.lng || 78.1460, user)
              );
            } else {
              fetchJobs(user.lat || 11.6643, user.lng || 78.1460, user);
            }
          }}
          className="p-2.5 rounded-xl transition-all"
          style={{ background: 'rgba(42,41,56,0.3)', border: '1px solid rgba(42,41,56,0.4)' }}>
          <RefreshCw size={18} className={`text-text-muted ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 relative overflow-hidden rounded-2xl p-[1px] z-10 transition-all duration-400 group"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(42,41,56,0.4) 100%)' }}>
        <div className="rounded-2xl h-full relative p-1 md:p-2 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95), rgba(28,27,41,0.8))', backdropFilter: 'blur(8px)' }}>
          {/* Top gradient shine */}
          <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)' }} />

          <div className="absolute top-4 left-4 z-20 px-5 py-4 rounded-xl pointer-events-none hidden md:block"
            style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95) 0%, rgba(28,27,41,0.85) 100%)', backdropFilter: 'blur(12px)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <h3 className="text-xs font-mono text-violet uppercase tracking-wider font-semibold">Current Area</h3>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-4xl font-display font-extrabold text-text-primary leading-none">{jobs.length}</p>
              <p className="text-[10px] text-text-muted mb-1 font-mono uppercase tracking-wider">Jobs Active</p>
            </div>
            <div className="w-full h-1 mt-4 rounded-full opacity-50" style={{ background: 'linear-gradient(90deg, #8B5CF6, transparent)' }} />
          </div>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet" />
                <div className="absolute inset-0 bg-violet blur-xl opacity-20 rounded-full" />
              </div>
            </div>
          ) : (
            <RadarMap markers={jobs} center={mapCenter} userPosition={userPos} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
