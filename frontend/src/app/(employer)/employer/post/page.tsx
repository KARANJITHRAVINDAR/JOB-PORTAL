'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Briefcase, Users, IndianRupee, MapPin, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PostJob() {
  const router = useRouter();
  const [voiceInput, setVoiceInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    slots_required: 1,
    wage: '',
    location: 'Current Location (GPS)',
  });

  const handleVoiceProcess = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is not supported in this browser.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setLoading(true);
    };

    recognition.onresult = async (event: any) => {
      const speechText = event.results[0][0].transcript;
      setVoiceInput(speechText);
      
      try {
        const res = await fetch('http://localhost:4000/api/ai/extract-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voice_text: speechText }),
        });
        const data = await res.json();
        
        setFormData(prev => ({
          ...prev,
          category: data.category || prev.category,
          wage: data.estimated_wage ? data.estimated_wage.toString() : prev.wage,
          title: `${data.category || 'Worker'} needed ${data.urgency === 'HIGH' ? 'urgently' : ''}`.trim(),
        }));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    recognition.onerror = (event: any) => {
      setLoading(false);
      alert('Voice error: ' + event.error);
    };
    
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem('user');
    if (!userStr) return alert("Please login first");
    const user = JSON.parse(userStr);

    try {
      const res = await fetch('http://localhost:4000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employer_id: user.id,
          title: formData.title,
          category: formData.category,
          slots_required: formData.slots_required,
          wage: parseInt(formData.wage),
          lat: user.lat || 11.6643,
          lng: user.lng || 78.1460,
          description: formData.title
        })
      });

      if (res.ok) {
        alert('Job posted successfully to nearby workers!');
        router.push('/employer/dashboard');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to post job');
      }
    } catch (e) {
      console.error(e);
      alert('Error posting job');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in pb-20">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="text-neon-purple" /> Post a New Request
        </h1>
        <p className="text-gray-400 mt-2">Hire nearby workers instantly</p>
      </header>

      <motion.div className="glass-card bg-neon-purple/5 border-neon-purple/20">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Zap className="text-neon-purple" /> AI Voice Assistant
        </h2>
        <p className="text-sm text-gray-400 mb-4">Just say what you need, and Gemini AI will fill the form for you.</p>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            value={voiceInput}
            onChange={(e) => setVoiceInput(e.target.value)}
            placeholder='Try: "Need 2 electricians urgently at Salem 4 roads"' 
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple/50"
          />
          <button 
            onClick={handleVoiceProcess}
            disabled={loading}
            className="bg-neon-purple/20 hover:bg-neon-purple/40 text-neon-purple border border-neon-purple/30 p-3 rounded-xl transition-colors shrink-0"
          >
            {loading ? <span className="animate-pulse">...</span> : <Mic size={24} />}
          </button>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="glass-card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
          <input 
            type="text" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><Briefcase size={16}/> Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue appearance-none"
            >
              <option value="">Select Category</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Construction">Construction Labor</option>
              <option value="Delivery">Delivery / Logistics</option>
              <option value="Agriculture">Agriculture</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><Users size={16}/> Workers Needed</label>
            <input 
              type="number" 
              min="1"
              value={formData.slots_required}
              onChange={e => setFormData({...formData, slots_required: parseInt(e.target.value)})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><IndianRupee size={16}/> Estimated Wage (₹)</label>
            <input 
              type="number" 
              value={formData.wage}
              onChange={e => setFormData({...formData, wage: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><MapPin size={16}/> Location</label>
            <input 
              type="text" 
              value={formData.location}
              disabled
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full btn-neon py-4 text-lg font-bold tracking-wider uppercase">
            Broadcast Job Now
          </button>
        </div>
      </form>
    </div>
  );
}
