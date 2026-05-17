'use client';

import { useState, useEffect } from 'react';
import { MapPin, Briefcase, RefreshCw } from 'lucide-react';
import RadarMap from '@/components/Map';

export default function SeekerJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCat, setUserCat] = useState('');
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
      
      // Map API data to Map format
      const formatted = Array.isArray(data) ? data.map(j => ({
        id: j.id,
        // Since we didn't fetch lat/lng from API response directly yet, we will mock nearby coords
        position: [lat + (Math.random() - 0.5)*0.05, lng + (Math.random() - 0.5)*0.05],
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
      setUserCat(parsedData.category_sought || '');
    }
    fetchJobs(parsedData);
  }, []);

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col gap-4 animate-in fade-in">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="text-neon-purple" /> Find Opportunities
          </h1>
          <p className="text-sm text-gray-400 mt-1">Discover urgent and nearby jobs</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 lg:w-2/3 glass-card p-1 md:p-2 relative min-h-[300px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <RefreshCw className="animate-spin text-neon-purple" size={32} />
            </div>
          ) : (
            <RadarMap markers={jobs} center={mapCenter} />
          )}
        </div>

        <div className="lg:w-1/3 flex flex-col gap-4 overflow-y-auto">
          {userCat && (
            <div className="text-sm text-neon-blue bg-neon-blue/10 px-4 py-2 rounded-xl border border-neon-blue/20">
              Filtering by your preference: <strong>{userCat}</strong>
            </div>
          )}
          
          {loading ? (
            <div className="text-center text-gray-500 mt-10">Searching nearby...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No jobs found nearby for your category.</div>
          ) : (
            jobs.map((job, idx) => (
              <div key={idx} className="glass-card hover:-translate-y-1 hover:border-neon-purple/50 cursor-pointer transition-all">
                <h3 className="font-bold text-lg">{job.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{job.desc}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-neon-blue flex items-center gap-1"><MapPin size={12} /> {job.distance} km away</span>
                  <button className="bg-neon-purple/20 text-neon-purple px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-neon-purple hover:text-white transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
