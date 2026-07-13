'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import Button from '@/components/Button';
import { FloatingOrbs, inputStyle, inputBg } from '@/components/DesignSystem';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', phone: '', role: 'WORKER', age: '', address: '', category_sought: '', photo_url: '', lat: 0, lng: 0 });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (res.ok) { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); router.push(data.user.role === 'EMPLOYER' ? '/employer/dashboard' : '/seeker/dashboard'); }
      else alert(data.error);
    } catch { alert('Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#0B0B14' }}>
      <FloatingOrbs />
      <div className="absolute w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 60%)', filter: 'blur(60px)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10">
        <div className="relative overflow-hidden rounded-2xl p-[1px]"
          style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.2) 0%, rgba(42,41,56,0.2) 40%, rgba(139,92,246,0.2) 100%)' }}>
          <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.97), rgba(28,27,41,0.95))' }}>

            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #34D399 0%, #8B5CF6 100%)', boxShadow: '0 8px 24px rgba(52,211,153,0.2)' }}>
                <span className="text-white font-black text-xl">W</span>
              </div>
              <h1 className="text-2xl font-display font-extrabold text-text-primary">Create Account</h1>
              <p className="text-text-muted text-sm mt-2">Join the Hyperlocal Workforce</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-1.5 block">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputStyle} style={inputBg} required />
              </div>

              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-1.5 block">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={inputStyle} style={inputBg} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-1.5 block">Age</label>
                  <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className={inputStyle} style={inputBg} />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-1.5 block">Job Category</label>
                  <select value={formData.category_sought} onChange={(e) => setFormData({...formData, category_sought: e.target.value})} className={`${inputStyle} appearance-none`} style={inputBg}>
                    <option value="">Select</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Construction">Construction</option>
                    <option value="Daily Wage">Daily Wage</option>
                    <option value="IT Job">IT Job</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono">Address & Location</label>
                  <button type="button" onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(async (position) => {
                        const lat = position.coords.latitude; const lng = position.coords.longitude;
                        let displayAddress = formData.address;
                        try {
                          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
                          const data = await res.json();
                          displayAddress = data?.city ? `${data.city}, ${data.principalSubdivision}` : `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                        } catch { displayAddress = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`; }
                        setFormData({ ...formData, lat, lng, address: displayAddress });
                      }, (error) => alert('Unable to detect: ' + error.message));
                    }
                  }}
                    className="text-[10px] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                    style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', color: '#34D399' }}>
                    <MapPin size={10} /> Detect Location
                  </button>
                </div>
                <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="e.g. 123 Main St, City" rows={2}
                  className={`${inputStyle} resize-none`} style={inputBg} />
              </div>

              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-2 block">I want to...</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { role: 'WORKER', label: 'Find Work', color: '#34D399' },
                    { role: 'EMPLOYER', label: 'Hire Workers', color: '#8B5CF6' },
                  ].map(opt => (
                    <motion.button key={opt.role} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({...formData, role: opt.role})}
                      className="py-3 rounded-xl text-sm font-semibold transition-all"
                      style={formData.role === opt.role ? { background: `${opt.color}12`, border: `1px solid ${opt.color}40`, color: opt.color, boxShadow: `0 0 15px ${opt.color}10` } : { background: 'rgba(42,41,56,0.3)', border: '1px solid rgba(42,41,56,0.4)', color: '#8D8B9E' }}>
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={loading} variant="primary" className="w-full py-3.5 mt-4 text-sm font-semibold">
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-text-muted">
              Already have an account? <Link href="/login" className="text-violet hover:text-violet-dim transition-colors font-medium">Login</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
