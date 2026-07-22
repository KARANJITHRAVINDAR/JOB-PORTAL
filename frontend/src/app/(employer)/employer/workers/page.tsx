'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import RadarMap from '@/components/Map';
import { FloatingOrbs, fadeUp, PageHeader, inputStyle, inputBg } from '@/components/DesignSystem';

export default function WorkerRadar() {
  const [center, setCenter] = useState<[number, number]>([11.6643, 78.1460]);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('All');

  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const fetchWorkers = async (lat: number, lng: number, cat: string) => {
    setLoading(true);
    try {
      setCenter([lat, lng]);
      let url = `http://localhost:4000/api/auth/workers/nearby?lat=${lat}&lng=${lng}`;
      if (cat && cat !== 'All') url += `&category=${encodeURIComponent(cat)}`;
      const res = await fetch(url); const data = await res.json();
      const formatted = Array.isArray(data) ? data.map(w => ({ id: w.id, position: [w.lat || lat + (Math.random() - 0.5)*0.05, w.lng || lng + (Math.random() - 0.5)*0.05], title: w.name, desc: `${w.category_sought || 'Worker'} (${w.trust_score}% Trust)`, distance: (w.distance / 1000).toFixed(1) })) : [];
      setWorkers(formatted);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    let fallbackLat = user?.lat || 11.6643;
    let fallbackLng = user?.lng || 78.1460;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserPos([lat, lng]);
          if (user) {
            user.lat = lat;
            user.lng = lng;
            localStorage.setItem('user', JSON.stringify(user));
          }
          fetchWorkers(lat, lng, category);
        },
        (err) => {
          console.warn("Geolocation failed", err);
          fetchWorkers(fallbackLat, fallbackLng, category);
        }
      );
    } else {
      fetchWorkers(fallbackLat, fallbackLng, category);
    }
  }, [category]);

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col gap-4 relative">
      <FloatingOrbs />
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative z-10 shrink-0">
        <div className="flex justify-between items-center">
          <PageHeader icon={Users} title="Live Worker Radar" subtitle="Discover and ping workers nearby" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className={`${inputStyle} w-auto appearance-none`} style={inputBg}>
            <option value="All">All Categories</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Construction">Construction Labor</option>
            <option value="Delivery">Delivery / Logistics</option>
            <option value="Agriculture">Agriculture</option>
          </select>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 relative overflow-hidden rounded-2xl p-[1px] z-10 transition-all duration-400 group"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(42,41,56,0.4) 100%)' }}>
        <div className="rounded-2xl h-full relative p-1 md:p-2 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95), rgba(28,27,41,0.8))', backdropFilter: 'blur(8px)' }}>
          {/* Top gradient shine */}
          <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)' }} />

          {/* Overlay Stats */}
          <div className="absolute top-4 left-4 z-20 px-5 py-4 rounded-xl pointer-events-none hidden md:block"
            style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95) 0%, rgba(28,27,41,0.85) 100%)', backdropFilter: 'blur(12px)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <h3 className="text-xs font-mono text-violet uppercase tracking-wider font-semibold">Current Area</h3>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-4xl font-display font-extrabold text-text-primary leading-none">{workers.length}</p>
              <p className="text-[10px] text-text-muted mb-1 font-mono uppercase tracking-wider">Workers Active</p>
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
            <RadarMap markers={workers} center={center} userPosition={userPos} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
