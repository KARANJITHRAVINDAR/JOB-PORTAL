'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, RefreshCw, Search, Mic } from 'lucide-react';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import { StatusTag } from '@/components/ui/DashboardStyles';
import { FloatingOrbs, staggerContainer, fadeUp, PageHeader, inputStyle, inputBg } from '@/components/DesignSystem';
import JobCard from '@/components/JobCard';

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
        ...j,
        description: j.description || 'No detailed description provided by the employer.'
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
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingOrbs />

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="relative z-10 flex flex-col gap-6 flex-1 max-w-5xl mx-auto">
        <motion.div variants={fadeUp}>
          <PageHeader icon={Briefcase} title="Find Opportunities" subtitle="Discover urgent jobs and apply instantly" />
        </motion.div>

        {/* Search Bar & Voice */}
        <motion.div variants={fadeUp} className="flex gap-3">
          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(52,211,153,0.1))' }} />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-violet z-10" size={20} />
            <input
              type="text"
              placeholder="Search by job title, category, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full rounded-2xl pl-12 pr-4 py-4 text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-violet/40 transition-all duration-400 font-sans shadow-lg"
              style={{
                background: 'rgba(21,20,31,0.9)',
                border: '1px solid rgba(42,41,56,0.6)',
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVoiceSearch}
            className="px-5 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
            style={{
              background: isListening ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))' : 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
              border: `1px solid ${isListening ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.3)'}`,
              color: isListening ? '#ef4444' : '#8B5CF6',
            }}
          >
            <Mic size={24} className={isListening ? 'animate-pulse' : ''} />
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
            <EmptyState
              title="No jobs found"
              description="Try widening your search queries or change your category filter."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job, idx) => (
                <motion.div
                  key={job.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="h-full"
                >
                  <JobCard
                    job={job}
                    onApply={handleApply}
                    isUrgent={idx === 0 && searchQuery === ''}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
