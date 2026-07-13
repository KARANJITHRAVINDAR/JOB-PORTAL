'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Briefcase, Users, IndianRupee, MapPin, Zap, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { FloatingOrbs, staggerContainer, fadeUp, PageHeader, inputStyle, inputBg } from '@/components/DesignSystem';

export default function PostJob() {
  const router = useRouter();
  const [voiceInput, setVoiceInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [surgeData, setSurgeData] = useState<{ is_high_demand: boolean; surge_multiplier: number } | null>(null);
  const [formData, setFormData] = useState({ title: '', category: '', slots_required: 1, wage: '', location: 'Current Location (GPS)', negotiable: false });

  useEffect(() => { if (formData.category) checkSurgePricing(formData.category); }, [formData.category]);

  const checkSurgePricing = async (category: string) => {
    const userStr = localStorage.getItem('user'); if (!userStr) return;
    const user = JSON.parse(userStr);
    try {
      const lat = user.lat || 11.6643; const lng = user.lng || 78.1460;
      const res = await fetch(`http://localhost:4000/api/jobs/surge-estimate?lat=${lat}&lng=${lng}&category=${category}`);
      const data = await res.json(); if (res.ok) setSurgeData(data);
    } catch (e) { console.error(e); }
  };

  const handleVoiceProcess = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Voice not supported'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; recognition.interimResults = false;
    recognition.onstart = () => setLoading(true);
    recognition.onresult = async (event: any) => {
      const speechText = event.results[0][0].transcript; setVoiceInput(speechText);
      try {
        const res = await fetch('http://localhost:4000/api/ai/extract-job', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voice_text: speechText }) });
        const data = await res.json();
        setFormData(prev => ({ ...prev, category: data.category || prev.category, wage: data.estimated_wage ? data.estimated_wage.toString() : prev.wage, slots_required: data.workers_needed || prev.slots_required, title: `${data.category || 'Worker'} needed ${data.urgency === 'HIGH' ? 'urgently' : ''}`.trim() }));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    recognition.onerror = (event: any) => { setLoading(false); alert('Voice error: ' + event.error); };
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem('user'); if (!userStr) return alert("Login first");
    const user = JSON.parse(userStr);
    try {
      const res = await fetch('http://localhost:4000/api/jobs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employer_id: user.id, title: formData.title, category: formData.category, slots_required: formData.slots_required, wage: parseInt(formData.wage), lat: user.lat || 11.6643, lng: user.lng || 78.1460, description: formData.title, negotiable: formData.negotiable })
      });
      if (res.ok) { alert('Job posted!'); router.push('/employer/dashboard'); }
      else { const data = await res.json(); alert(data.error || 'Failed'); }
    } catch { alert('Error posting job'); }
  };

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingOrbs />
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="relative z-10 max-w-3xl mx-auto space-y-8">

        <motion.div variants={fadeUp}>
          <PageHeader icon={Briefcase} title="Post a New Request" subtitle="Hire nearby workers instantly" />
        </motion.div>

        {/* AI Voice Card */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-[1px]"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(28,27,41,0.3) 100%)' }}>
          <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.04) 0%, rgba(21,20,31,0.95) 100%)' }}>
            <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-3 text-text-primary">
              <Zap className="text-violet" size={18} /> AI Voice Assistant
            </h2>
            <p className="text-sm text-text-muted mb-4">Say what you need, and AI will fill the form for you.</p>
            <div className="flex gap-2">
              <input type="text" value={voiceInput} onChange={(e) => setVoiceInput(e.target.value)}
                placeholder='Try: "Need 2 electricians urgently at Salem"'
                className={`flex-1 ${inputStyle}`} style={inputBg} />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleVoiceProcess} disabled={loading}
                className="p-3 rounded-xl shrink-0 transition-all"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#8B5CF6' }}>
                {loading ? <span className="animate-pulse text-sm">...</span> : <Mic size={22} />}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Surge Warning */}
        {surgeData?.is_high_demand && (
          <motion.div variants={fadeUp} className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="p-2 rounded-lg mt-0.5" style={{ background: 'rgba(239,68,68,0.08)' }}>
              <TrendingUp size={18} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-red-400 font-display font-bold text-sm">High Demand Zone</h3>
              <p className="text-sm text-text-muted mt-1">
                More jobs than workers for <span className="font-semibold text-text-primary">{formData.category}</span>. Increase wage by <span className="font-bold text-red-400">{surgeData.surge_multiplier}x</span> to attract faster.
              </p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.form variants={fadeUp} onSubmit={handleSubmit} className="glass-card space-y-6">
          <div>
            <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-2 block">Job Title</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} style={inputBg} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-2 flex items-center gap-1.5"><Briefcase size={10} /> Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={`${inputStyle} appearance-none`} style={inputBg}>
                <option value="">Select Category</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Construction">Construction Labor</option>
                <option value="Delivery">Delivery / Logistics</option>
                <option value="Agriculture">Agriculture</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-2 flex items-center gap-1.5"><Users size={10} /> Workers Needed</label>
              <input type="number" min="1" value={formData.slots_required} onChange={e => setFormData({...formData, slots_required: parseInt(e.target.value)})} className={inputStyle} style={inputBg} required />
            </div>

            <div>
              <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-2 flex items-center gap-1.5"><IndianRupee size={10} /> Estimated Wage (₹)</label>
              <input type="number" value={formData.wage} onChange={e => setFormData({...formData, wage: e.target.value})} className={inputStyle} style={inputBg} required />
            </div>

            <div>
              <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-2 flex items-center gap-1.5"><MapPin size={10} /> Location</label>
              <input type="text" value={formData.location} disabled className={`${inputStyle} cursor-not-allowed opacity-60`} style={inputBg} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl" style={inputBg}>
              <label className="text-sm text-text-muted">Job Negotiable</label>
              <button type="button" onClick={() => setFormData({...formData, negotiable: !formData.negotiable})}
                className="w-12 h-6 rounded-full relative flex items-center transition-all"
                style={{ background: formData.negotiable ? 'rgba(139,92,246,0.3)' : 'rgba(42,41,56,0.5)', border: `1px solid ${formData.negotiable ? 'rgba(139,92,246,0.4)' : 'rgba(42,41,56,0.4)'}` }}>
                <div className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${formData.negotiable ? 'right-1 bg-violet' : 'left-1 bg-text-muted'}`} />
              </button>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" variant="primary" className="w-full py-4 text-lg font-bold tracking-wider uppercase">
              Broadcast Job Now
            </Button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
