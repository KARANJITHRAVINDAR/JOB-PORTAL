'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Upload, Check, X, Briefcase, Globe } from 'lucide-react';
import { FloatingOrbs, staggerContainer, fadeUp, PageHeader, inputStyle, inputBg } from '@/components/DesignSystem';

export default function EmployerProfile() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) { const parsed = JSON.parse(userData); setUser(parsed); setFormData(parsed); }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      if (res.ok) { setUser(formData); localStorage.setItem('user', JSON.stringify(formData)); setIsEditing(false); alert('Profile updated!'); }
      else { const data = await res.json(); alert(data.error || 'Failed to update'); }
    } catch { alert('Failed to update profile'); }
    setSaving(false);
  };

  if (!user) return <div className="p-8 flex justify-center items-center h-full text-violet font-mono animate-pulse">Loading Profile...</div>;

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingOrbs />
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="relative z-10 max-w-4xl mx-auto space-y-6">

        <motion.div variants={fadeUp}>
          <PageHeader icon={Briefcase} title="Company Profile">
            {isEditing ? (
              <div className="flex gap-2">
                <button onClick={() => { setFormData(user); setIsEditing(false); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}>
                  <X size={14} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399' }}>
                  {saving ? 'Saving...' : <><Check size={14} /> Save</>}
                </button>
              </div>
            ) : (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(42,41,56,0.4)', border: '1px solid rgba(42,41,56,0.6)', color: '#F1F0F6' }}>
                Edit Profile
              </motion.button>
            )}
          </PageHeader>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Card */}
          <motion.div variants={fadeUp}
            className="group relative overflow-hidden rounded-2xl p-[1px] md:col-span-1 transition-all duration-400 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(42,41,56,0.5) 100%)' }}>
            <div className="rounded-2xl p-8 flex flex-col items-center text-center h-full relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95) 0%, rgba(28,27,41,0.8) 100%)', backdropFilter: 'blur(8px)' }}>
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-15 blur-3xl transition-opacity duration-500 group-hover:opacity-30" style={{ background: '#8B5CF6' }} />
              
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)` }} />

              <div className="w-28 h-28 rounded-2xl overflow-hidden relative mb-5 z-10 transition-transform duration-500 group-hover:scale-105"
                style={{ border: '2px solid rgba(139,92,246,0.4)', boxShadow: '0 0 30px rgba(139,92,246,0.15)' }}>
                {user.photo_url ? (
                  <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(42,41,56,0.5)' }}>
                    <User size={40} className="text-text-muted" />
                  </div>
                )}
                <button onClick={() => alert("Logo upload coming soon!")}
                  className="absolute bottom-0 inset-x-0 py-1.5 text-xs text-white opacity-0 hover:opacity-100 transition-all"
                  style={{ background: 'rgba(11,11,20,0.8)', backdropFilter: 'blur(4px)' }}>
                  <Upload size={12} className="mx-auto" />
                </button>
              </div>

              {isEditing ? (
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`${inputStyle} text-center font-bold text-xl mb-2`} style={inputBg} />
              ) : (
                <h2 className="text-xl font-display font-bold text-text-primary group-hover:text-violet transition-colors">{user.name}</h2>
              )}
              <p className="text-violet text-sm font-medium mt-1">Employer</p>
            </div>
          </motion.div>

          {/* Details Card */}
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-[1px] md:col-span-2 group transition-all duration-400 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(42,41,56,0.3) 100%)' }}>
            <div className="rounded-2xl p-6 md:p-8 h-full relative"
              style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95) 0%, rgba(28,27,41,0.8) 100%)', backdropFilter: 'blur(8px)' }}>
              
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }} />

              <h3 className="text-lg font-display font-semibold pb-3 flex items-center gap-2 text-text-primary" style={{ borderBottom: '1px solid rgba(42,41,56,0.4)' }}>
                <Briefcase size={18} className="text-violet" /> Company Information
              </h3>

              <div className="grid grid-cols-1 gap-6 mt-6">
                <div className="space-y-1.5 p-3 rounded-xl transition-colors hover:bg-bg-surface-raised/40" style={{ border: '1px solid transparent', hover: { borderColor: 'rgba(139,92,246,0.2)' } }}>
                  <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                    <Phone size={10} /> Contact Number
                  </label>
                  {isEditing ? (
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={inputStyle} style={inputBg} />
                  ) : (
                    <p className="font-medium text-text-primary text-base">{user.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5 p-3 rounded-xl transition-colors hover:bg-bg-surface-raised/40">
                  <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                    <MapPin size={10} /> Company Address / Main Location
                  </label>
                  {isEditing ? (
                    <input type="text" value={formData.address || ''} onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className={inputStyle} style={inputBg} />
                  ) : (
                    <p className="font-medium text-text-primary text-base">{user.address || 'Location not specified.'}</p>
                  )}
                </div>

                <div className="space-y-1.5 p-3 rounded-xl transition-colors hover:bg-bg-surface-raised/40">
                  <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                    <Globe size={10} /> Preferred Language
                  </label>
                  {isEditing ? (
                    <select value={formData.preferred_language || 'English'} onChange={(e) => setFormData({...formData, preferred_language: e.target.value})}
                      className={`${inputStyle} appearance-none`} style={inputBg}>
                      <option value="English">English</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  ) : (
                    <p className="font-medium inline-flex px-3 py-1.5 rounded-lg text-sm text-text-primary transition-all"
                      style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                      {user.preferred_language || 'English'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
