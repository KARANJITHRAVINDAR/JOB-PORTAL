'use client';

import { useState, useEffect } from 'react';
import { MapPin, Briefcase, RefreshCw, Search, Mic } from 'lucide-react';

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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job_id: jobId,
          worker_id: user.id
        })
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

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setSearchQuery(speechResult);
      setIsListening(false);
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

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
    <div className="min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-4rem)] flex flex-col gap-6 animate-in fade-in pb-20">
      <header className="shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="text-neon-purple" /> Find Opportunities
        </h1>
        <p className="text-sm text-gray-400 mt-1">Discover urgent jobs and apply instantly</p>
      </header>

      {/* Search Bar & Voice */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by job title, category, or keywords..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-neon-purple/50"
          />
        </div>
        <button 
          onClick={handleVoiceSearch}
          className={`px-4 py-3 rounded-xl border transition-colors flex items-center justify-center ${isListening ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-neon-purple/20 border-neon-purple/30 text-neon-purple hover:bg-neon-purple/40'}`}
        >
          <Mic size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {userCat && (
          <div className="text-sm text-neon-blue bg-neon-blue/10 px-4 py-3 rounded-xl border border-neon-blue/20 flex justify-between items-center">
            <span>Filtering by your preference: <strong>{userCat}</strong></span>
            <button 
              onClick={() => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                fetchJobs(user);
              }}
              className="text-white hover:text-neon-blue"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-gray-500">
            <RefreshCw className="animate-spin text-neon-purple mb-4" size={32} />
            Searching nearby...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 p-10 glass-card">
            No jobs found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job, idx) => (
              <div key={idx} className="glass-card hover:-translate-y-1 hover:border-neon-purple/50 transition-all flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{job.title}</h3>
                  <span className="bg-neon-blue/10 text-neon-blue text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap">
                    {job.desc.split(' • ')[0]}
                  </span>
                </div>
                
                <span className="text-xs text-gray-400 mb-3 inline-block bg-white/5 px-2 py-1 rounded">
                  {job.desc.split(' • ')[1]}
                </span>
                
                <p className="text-sm text-gray-300 flex-1 mb-4">
                  {job.full_description}
                </p>
                
                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs text-neon-blue flex items-center gap-1">
                    <MapPin size={14} /> {job.distance} km away
                  </span>
                  <button 
                    onClick={() => handleApply(job.id)}
                    className="bg-neon-purple/20 text-neon-purple px-6 py-2 rounded-full text-sm font-semibold hover:bg-neon-purple hover:text-white transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
