'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Settings2 } from 'lucide-react';
import RadarMap from '@/components/Map';

export default function WorkerRadar() {
  const [center, setCenter] = useState<[number, number]>([11.6643, 78.1460]);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('All');

  const fetchWorkers = async (lat: number, lng: number, cat: string) => {
    setLoading(true);
    try {
      let url = `http://localhost:4000/api/auth/workers/nearby?lat=${lat}&lng=${lng}`;
      if (cat && cat !== 'All') {
        url += `&category=${encodeURIComponent(cat)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      const formatted = Array.isArray(data) ? data.map(w => ({
        id: w.id,
        position: [w.lat || lat + (Math.random() - 0.5)*0.05, w.lng || lng + (Math.random() - 0.5)*0.05],
        title: w.name,
        desc: `${w.category_sought || 'Worker'} (${w.trust_score}% Trust)`,
        distance: (w.distance / 1000).toFixed(1)
      })) : [];
      
      setWorkers(formatted);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    let finalCenter: [number, number] = [11.6643, 78.1460];
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.lat && user.lng) {
        finalCenter = [user.lat, user.lng];
      }
    }
    
    setCenter(finalCenter);
    fetchWorkers(finalCenter[0], finalCenter[1], category);
  }, [category]);

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col gap-4 animate-in fade-in">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-neon-blue" /> Live Worker Radar
          </h1>
          <p className="text-sm text-gray-400 mt-1">Discover and ping workers nearby</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-neon-blue appearance-none"
          >
            <option value="All">All Categories</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Construction">Construction Labor</option>
            <option value="Delivery">Delivery / Logistics</option>
            <option value="Agriculture">Agriculture</option>
          </select>
        </div>
      </header>

      <div className="flex-1 glass-card p-1 md:p-2 relative">
        {/* Overlay Stats */}
        <div className="absolute top-4 left-4 z-10 glass-card bg-black/60 p-4 border-neon-purple/30 max-w-[200px] pointer-events-none hidden md:block">
          <h3 className="text-sm font-semibold text-neon-blue">Current Area</h3>
          <p className="text-2xl font-bold mt-1">{workers.length}</p>
          <p className="text-xs text-gray-400">Total Workers Active</p>
        </div>

        {/* The Map Component */}
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-purple"></div>
          </div>
        ) : (
          <RadarMap markers={workers} center={center} />
        )}
      </div>
    </div>
  );
}
