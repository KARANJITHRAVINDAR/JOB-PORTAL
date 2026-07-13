'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, RefreshCw, Search, Mic } from 'lucide-react';
import Button from '@/components/Button';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

export default function SeekerJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCat, setUserCat] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const fetchJobs = async (userData: any) => {
    setLoading(true);
    try {
      const lat = userData?.lat || 11.6643;
      const lng = userData?.lng || 78.1460;
      
      let url = `http://localhost:4000/api/jobs/nearby?lat=${lat}&lng=${lng}`;
      if (userData?.category_sought) {
        url += `&category=${encodeURIComponent(userData.category_sought)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      const formatted = Array.isArray(data) ? data.map(j => ({
        id: j.id,
        title: j.title,
        desc: `₹${j.wage} • ${j.category}`,
        distance: (j.distance / 1000).toFixed(1),
        full_description: j.description || 'No detailed description provided by the employer.'
      })) : [];
      
      setJobs(formatted);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleApply = async (jobId: string) => {
    const userDataStr = localStorage.getItem('user');
    if (!userDataStr) return alert("Please login first");
    const user = JSON.parse(userDataStr);
    
    try {
      const res = await fetch('http://localhost:4000/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, worker_id: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Applied successfully! Status: ${data.status}`);
        fetchJobs(user);
      } else {
        alert(data.error || 'Failed to apply');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to apply');
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setSearchQuery(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onspeechend = () => recognition.stop();
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
      alert('Error occurred in voice recognition: ' + event.error);
    };
    recognition.start();
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

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-4rem)] flex flex-col gap-6 pb-20 relative">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[400px] h-[400px] rounded-full animate-float"
          style={{ top: '-5%', right: '-8%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full animate-float-delayed"
          style={{ bottom: '15%', left: '-5%', background: 'radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="relative z-10 flex flex-col gap-6 flex-1">
        <motion.header variants={fadeUp}>
          <h1 className="text-2xl font-display font-extrabold flex items-center gap-2.5 text-text-primary">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: '1px solid rgba(139,92,246,0.2)' }}>
              <Briefcase size={16} className="text-violet" />
            </div>
            Find Opportunities
          </h1>
          <p className="text-sm text-text-muted mt-1.5">Discover urgent jobs and apply instantly</p>
        </motion.header>

        {/* Search Bar & Voice */}
        <motion.div variants={fadeUp} className="flex gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-violet" size={18} />
            <input
              type="text"
              placeholder="Search by job title, category, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-3 text-text-primary placeholder:text-text-muted/60 focus:outline-none transition-all duration-300"
              style={{
                background: 'rgba(21,20,31,0.8)',
                border: '1px solid rgba(42,41,56,0.5)',
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVoiceSearch}
            className="px-4 py-3 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: isListening ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.08)',
              border: `1px solid ${isListening ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.2)'}`,
              color: isListening ? '#ef4444' : '#8B5CF6',
            }}
          >
            <Mic size={22} className={isListening ? 'animate-pulse' : ''} />
          </motion.button>
        </motion.div>

        {userCat && (
          <motion.div variants={fadeUp}
            className="text-sm px-4 py-3 rounded-xl flex justify-between items-center"
            style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', color: '#34D399' }}>
            <span>Filtering by: <strong>{userCat}</strong></span>
            <button
              onClick={() => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                fetchJobs(user);
              }}
              className="text-text-muted hover:text-signal transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </motion.div>
        )}

        <div className="flex-1 flex flex-col gap-4">
          {loading ? (
            <div className="w-full py-20 flex flex-col items-center justify-center text-text-muted gap-3">
              <RefreshCw className="animate-spin text-violet" size={28} />
              <span className="font-mono text-sm">Searching nearby...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center text-text-muted mt-10 p-10 glass-card">
              No jobs found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-400 hover:-translate-y-1"
                  style={{ background: 'linear-gradient(135deg, rgba(42,41,56,0.5) 0%, rgba(42,41,56,0.2) 100%)' }}
                >
                  <div className="rounded-2xl p-5 flex flex-col h-full relative"
                    style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.9) 0%, rgba(28,27,41,0.7) 100%)', backdropFilter: 'blur(8px)' }}>
                    {/* Hover shine */}
                    <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)' }} />

                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display font-bold text-lg text-text-primary group-hover:text-violet transition-colors">{job.title}</h3>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg font-mono shrink-0"
                        style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399' }}>
                        {job.desc.split(' • ')[0]}
                      </span>
                    </div>

                    <span className="text-xs text-text-muted mb-3 inline-block px-2.5 py-1 rounded-lg font-mono"
                      style={{ background: 'rgba(42,41,56,0.3)', border: '1px solid rgba(42,41,56,0.3)' }}>
                      {job.desc.split(' • ')[1]}
                    </span>

                    <p className="text-sm text-text-muted flex-1 mb-4 leading-relaxed">
                      {job.full_description}
                    </p>

                    <div className="mt-auto pt-3 flex justify-between items-center" style={{ borderTop: '1px solid rgba(42,41,56,0.3)' }}>
                      <span className="text-xs flex items-center gap-1.5 font-mono" style={{ color: '#8B5CF6' }}>
                        <MapPin size={13} /> {job.distance} km
                      </span>
                      <Button
                        onClick={() => handleApply(job.id)}
                        variant="primary"
                        className="py-2 px-5 text-xs"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
