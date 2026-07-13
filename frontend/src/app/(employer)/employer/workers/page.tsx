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

  const fetchWorkers = async (lat: number, lng: number, cat: string) => {
    setLoading(true);
    try {
      let url = `http://localhost:4000/api/auth/workers/nearby?lat=${lat}&lng=${lng}`;
      if (cat && cat !== 'All') url += `&category=${encodeURIComponent(cat)}`;
      const res = await fetch(url); const data = await res.json();
      const formatted = Array.isArray(data) ? data.map(w => ({ id: w.id, position: [w.lat || lat + (Math.random() - 0.5)*0.05, w.lng || lng + (Math.random() - 0.5)*0.05], title: w.name, desc: `${w.category_sought || 'Worker'} (${w.trust_score}% Trust)`, distance: (w.distance / 1000).toFixed(1) })) : [];
      setWorkers(formatted);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    let finalCenter: [number, number] = [11.6643, 78.1460];
    const userStr = localStorage.getItem('user');
    if (userStr) { const user = JSON.parse(userStr); if (user.lat && user.lng) finalCenter = [user.lat, user.lng]; }
    setCenter(finalCenter);
    fetchWorkers(finalCenter[0], finalCenter[1], category);
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
        className="flex-1 relative overflow-hidden rounded-2xl p-[1px] z-10"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(42,41,56,0.2) 100%)' }}>
        <div className="rounded-2xl h-full relative p-1 md:p-2" style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.9), rgba(28,27,41,0.7))' }}>
          {/* Overlay Stats */}
          <div className="absolute top-4 left-4 z-10 px-4 py-3 rounded-xl pointer-events-none hidden md:block"
            style={{ background: 'rgba(11,11,20,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(42,41,56,0.4)' }}>
            <h3 className="text-[10px] font-mono text-violet uppercase tracking-wider">Current Area</h3>
            <p className="text-2xl font-display font-extrabold text-text-primary mt-1">{workers.length}</p>
            <p className="text-[10px] text-text-muted">Workers Active</p>
          </div>

          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet" />
            </div>
          ) : (
            <RadarMap markers={workers} center={center} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
