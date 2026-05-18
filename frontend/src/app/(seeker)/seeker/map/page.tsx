'use client';

import { useState, useEffect } from 'react';
import { Map as MapIcon, RefreshCw, Settings2 } from 'lucide-react';
import RadarMap from '@/components/Map';

export default function SeekerMap() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([11.6643, 78.1460]);

  const fetchJobs = async (userData: any) => {
    setLoading(true);
    try {
      const lat = userData?.lat || 11.6643;
      const lng = userData?.lng || 78.1460;
      setMapCenter([lat, lng]);
      
      let url = `http://localhost:4000/api/jobs/nearby?lat=${lat}&lng=${lng}`;
      if (userData?.category_sought) {
        url += `&category=${encodeURIComponent(userData.category_sought)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      const formatted = Array.isArray(data) ? data.map(j => ({
        id: j.id,
        position: [j.latitude || lat + (Math.random() - 0.5)*0.05, j.longitude || lng + (Math.random() - 0.5)*0.05],
        title: j.title,
        desc: `₹${j.wage} • ${j.category}`,
        distance: (j.distance / 1000).toFixed(1)
      })) : [];
      
      setJobs(formatted);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    const userDataStr = localStorage.getItem('user');
    let parsedData = null;
    if (userDataStr) {
      parsedData = JSON.parse(userDataStr);
    }
    fetchJobs(parsedData);
  }, []);

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col gap-4 animate-in fade-in">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapIcon className="text-neon-purple" /> Live Job Radar
          </h1>
          <p className="text-sm text-gray-400 mt-1">Discover nearby job opportunities</p>
        </div>
        <button 
          onClick={() => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            fetchJobs(user);
          }}
          className="bg-white/5 border border-white/10 p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="flex-1 glass-card p-1 md:p-2 relative">
        <div className="absolute top-4 left-4 z-10 glass-card bg-black/60 p-4 border-neon-purple/30 max-w-[200px] pointer-events-none hidden md:block">
          <h3 className="text-sm font-semibold text-neon-blue">Current Area</h3>
          <p className="text-2xl font-bold mt-1">{jobs.length}</p>
          <p className="text-xs text-gray-400">Total Jobs Active</p>
        </div>
        
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <RefreshCw className="animate-spin text-neon-purple" size={32} />
          </div>
        ) : (
          <RadarMap markers={jobs} center={mapCenter} />
        )}
      </div>
    </div>
  );
}
