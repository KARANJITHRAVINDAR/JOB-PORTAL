'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, Phone, Calendar, Upload, ShieldCheck, Check, X, Users, Zap, TrendingUp } from 'lucide-react';
import { StatusTag } from '@/components/ui/DashboardStyles';

import { FloatingOrbs, staggerContainer, fadeUp } from '@/components/DesignSystem';

export default function SeekerProfile() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setFormData(parsed);
      
      fetch(`http://localhost:4000/api/auth/user/${parsed.id}`)
        .then(res => res.json())
        .then(latestUser => {
          if (!latestUser.error) {
            setUser(latestUser);
            setFormData(latestUser);
            localStorage.setItem('user', JSON.stringify(latestUser));
          }
        })
        .catch(e => console.error('Failed to fetch latest user data', e));
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setUser(formData);
        localStorage.setItem('user', JSON.stringify(formData));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
    setSaving(false);
  };

  if (!user) return (
    <div className="p-8 flex justify-center items-center h-full text-violet font-mono animate-pulse">
      Loading Profile...
    </div>
  );

  const trustScore = user.trust_score || 100;
  const isLowTrust = trustScore < 35;
  const accentColor = isLowTrust ? '#ef4444' : '#34D399';

  const inputStyle = "w-full rounded-xl px-3 py-2 text-sm focus:outline-none transition-all duration-300";
  const inputBg = { background: 'rgba(11,11,20,0.6)', border: '1px solid rgba(42,41,56,0.5)' };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 relative min-h-screen">
      <FloatingOrbs />

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="relative z-10 space-y-6">
        <motion.header variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-text-primary leading-[1.1] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: '1px solid rgba(139,92,246,0.2)' }}>
                <User size={20} className="text-violet" />
              </div>
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6, #34D399)' }}>
                My Profile
              </span>
            </h1>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => { setFormData(user); setIsEditing(false); }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-[1.02]"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(52,211,153,0.1)]"
                style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399' }}
              >
                {saving ? 'Saving...' : <><Check size={16} /> Save Changes</>}
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: '1px solid rgba(139,92,246,0.3)', color: '#F1F0F6' }}
            >
              <User size={16} /> Edit Profile
            </motion.button>
          )}
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Card */}
          <motion.div
            variants={fadeUp}
            className="group relative overflow-hidden rounded-2xl p-[1px] md:col-span-1 transition-all duration-400 hover:-translate-y-1"
            style={{ background: `linear-gradient(135deg, ${accentColor}40 0%, rgba(42,41,56,0.5) 100%)` }}
          >
            <div className="rounded-2xl p-8 flex flex-col items-center text-center h-full relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95) 0%, rgba(28,27,41,0.8) 100%)', backdropFilter: 'blur(8px)' }}>
              
              {/* Glow behind avatar */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40" style={{ background: accentColor }} />
              
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

              <div className="w-28 h-28 rounded-2xl overflow-hidden relative mb-5 z-10 transition-transform duration-500 group-hover:scale-105"
                style={{ border: `2px solid ${accentColor}40`, boxShadow: `0 0 30px ${accentColor}15` }}>
                {user.photo_url ? (
                  <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(42,41,56,0.5)' }}>
                    <User size={40} className="text-text-muted" />
                  </div>
                )}
                <button
                  onClick={() => alert("Profile photo upload coming soon!")}
                  className="absolute bottom-0 inset-x-0 py-1.5 text-xs text-white transition-all duration-300 opacity-0 hover:opacity-100"
                  style={{ background: 'rgba(11,11,20,0.8)', backdropFilter: 'blur(4px)' }}
                >
                  <Upload size={12} className="mx-auto" />
                </button>
              </div>

              {isEditing ? (
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`${inputStyle} text-center font-bold text-xl mb-2`}
                  style={inputBg}
                />
              ) : (
                <h2 className="text-xl font-display font-bold text-text-primary group-hover:text-violet transition-colors">{user.name}</h2>
              )}

              {isEditing ? (
                <input type="text" value={formData.category_sought}
                  onChange={(e) => setFormData({...formData, category_sought: e.target.value})}
                  className={`${inputStyle} text-center text-sm mt-1`}
                  style={{ ...inputBg, color: '#8B5CF6' }}
                />
              ) : (
                <p className="text-violet text-sm font-medium mt-1">{user.category_sought || 'Worker'}</p>
              )}

              <div className="mt-6 flex flex-col items-center gap-4 w-full">
                {/* Level */}
                <span className="font-mono font-bold text-sm px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6' }}>
                  <Zap size={14} /> LEVEL {user.level || 1}
                </span>

                {/* XP Bar */}
                <div className="w-full max-w-[200px] space-y-1.5 mt-2">
                  <div className="flex justify-between text-[10px] text-text-muted font-mono tracking-wider">
                    <span className="flex items-center gap-1"><TrendingUp size={10} /> XP</span>
                    <span>{user.xp || 0} / {((user.level || 1) * 100)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(11,11,20,0.8)', border: '1px solid rgba(42,41,56,0.5)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(((user.xp || 0) % 100), 2)}%`,
                        background: 'linear-gradient(90deg, #8B5CF6, #34D399)',
                        boxShadow: '0 0 10px rgba(139,92,246,0.4)',
                      }} />
                  </div>
                </div>

                <div className="mt-2">
                  <StatusTag color={isLowTrust ? 'red' : 'signal'}>
                    TRUST: {trustScore}
                  </StatusTag>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Details Card */}
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-[1px] md:col-span-2 group transition-all duration-400 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(42,41,56,0.3) 100%)' }}>
            <div className="rounded-2xl p-6 md:p-8 h-full relative"
              style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95) 0%, rgba(28,27,41,0.8) 100%)', backdropFilter: 'blur(8px)' }}>
              
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }} />

              <h3 className="text-lg font-display font-semibold pb-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(42,41,56,0.4)' }}>
                <User size={18} className="text-violet" /> Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-1.5 p-3 rounded-xl transition-colors hover:bg-bg-surface-raised/40" style={{ border: '1px solid transparent', hover: { borderColor: 'rgba(139,92,246,0.2)' } }}>
                  <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                    <Phone size={10} /> Contact Number
                  </label>
                  {isEditing ? (
                    <input type="text" value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={inputStyle} style={inputBg}
                    />
                  ) : (
                    <p className="font-medium text-text-primary text-base">{user.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5 p-3 rounded-xl transition-colors hover:bg-bg-surface-raised/40">
                  <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                    <Calendar size={10} /> Age
                  </label>
                  {isEditing ? (
                    <input type="number" value={formData.age || ''}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className={inputStyle} style={inputBg}
                    />
                  ) : (
                    <p className="font-medium text-text-primary text-base">{user.age || 'Not specified'} years old</p>
                  )}
                </div>

                <div className="space-y-1.5 md:col-span-2 p-3 rounded-xl transition-colors hover:bg-bg-surface-raised/40">
                  <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                    <MapPin size={10} /> Address / Location
                  </label>
                  {isEditing ? (
                    <input type="text" value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className={inputStyle} style={inputBg}
                    />
                  ) : (
                    <p className="font-medium text-text-primary text-base">{user.address || 'Location not updated. Using GPS.'}</p>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-display font-semibold pb-3 mt-8 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(42,41,56,0.4)' }}>
                <Briefcase size={18} className="text-violet" /> Work Preferences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-1.5 p-3 rounded-xl transition-colors hover:bg-bg-surface-raised/40">
                  <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                    <Briefcase size={10} /> Primary Skill
                  </label>
                  {isEditing ? (
                    <select value={formData.category_sought || ''}
                      onChange={(e) => setFormData({...formData, category_sought: e.target.value})}
                      className={`${inputStyle} appearance-none`} style={inputBg}
                    >
                      <option value="">Select Category</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Construction">Construction</option>
                      <option value="Daily Wage">Daily Wage</option>
                      <option value="IT Job">IT Job</option>
                    </select>
                  ) : (
                    <p className="font-medium inline-flex px-3 py-1.5 rounded-lg text-sm transition-all"
                      style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                      {user.category_sought || 'Open to all work'}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 p-3 rounded-xl transition-colors hover:bg-bg-surface-raised/40">
                  <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                    <ShieldCheck size={10} /> Preferred Language
                  </label>
                  {isEditing ? (
                    <select value={formData.preferred_language || 'English'}
                      onChange={(e) => setFormData({...formData, preferred_language: e.target.value})}
                      className={`${inputStyle} appearance-none`} style={inputBg}
                    >
                      <option value="English">English</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  ) : (
                    <p className="font-medium inline-flex px-3 py-1.5 rounded-lg text-sm"
                      style={{ background: 'rgba(42,41,56,0.3)', border: '1px solid rgba(42,41,56,0.4)' }}>
                      {user.preferred_language || 'English'}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2 p-3 pt-5 mt-2 rounded-xl transition-colors hover:bg-bg-surface-raised/40" style={{ borderTop: '1px solid rgba(42,41,56,0.2)' }}>
                  <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                    <Users size={10} /> Squad Size (Team Hiring)
                  </label>
                  {isEditing ? (
                    <div className="flex items-center gap-4 mt-2">
                      <input type="range" min="1" max="10"
                        value={formData.squad_size || 1}
                        onChange={(e) => setFormData({...formData, squad_size: parseInt(e.target.value)})}
                        className="flex-1 accent-violet"
                      />
                      <span className="px-4 py-2 font-mono text-violet font-bold rounded-xl"
                        style={inputBg}>
                        {formData.squad_size || 1}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <StatusTag color="violet">
                        {user.squad_size > 1 ? `Squad of ${user.squad_size}` : 'Individual (1)'}
                      </StatusTag>
                    </div>
                  )}
                  <p className="text-xs text-text-muted mt-2 font-sans italic">If you lead a team of workers, increase your squad size.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Badges Section */}
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-[1px] group transition-all duration-400 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, rgba(242,169,59,0.3) 0%, rgba(42,41,56,0.3) 100%)' }}>
            <div className="rounded-2xl p-6 md:p-8 h-full relative"
              style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95) 0%, rgba(28,27,41,0.8) 100%)', backdropFilter: 'blur(8px)' }}>
              
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(242,169,59,0.5), transparent)' }} />
                
              <h3 className="text-lg font-display font-semibold mb-5 pb-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(42,41,56,0.4)' }}>
                <ShieldCheck size={18} className="text-marigold" /> Earned Skill Badges
              </h3>
              {user.badges && user.badges.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {user.badges.map((badge: string, i: number) => (
                    <motion.div key={i} whileHover={{ scale: 1.05, y: -2 }}
                      className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(242,169,59,0.1), rgba(242,169,59,0.02))',
                        border: '1px solid rgba(242,169,59,0.3)',
                        color: '#F2A93B',
                        boxShadow: '0 0 15px rgba(242,169,59,0.1)',
                      }}>
                      <Check size={14} /> {badge}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-text-muted text-sm text-center py-6 rounded-xl font-sans"
                  style={{ background: 'rgba(11,11,20,0.3)', border: '1px dashed rgba(42,41,56,0.5)' }}>
                  Complete jobs and get reviewed by employers to earn skill badges!
                </div>
              )}
            </div>
          </motion.div>

          {/* Media Uploads */}
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-[1px] group transition-all duration-400 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.3) 0%, rgba(42,41,56,0.3) 100%)' }}>
            <div className="rounded-2xl p-6 md:p-8 h-full relative"
              style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95) 0%, rgba(28,27,41,0.8) 100%)', backdropFilter: 'blur(8px)' }}>
              
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)' }} />
                
              <h3 className="text-lg font-display font-semibold mb-5 pb-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(42,41,56,0.4)' }}>
                 <Upload size={18} className="text-signal" /> Media & Verification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Video Intro', sub: '30s demonstration', accept: 'video/*', color: '#8B5CF6' },
                  { label: 'Audio Bio', sub: 'Voice note in native lang', accept: 'audio/*', color: '#34D399' },
                ].map((item, idx) => (
                  <label key={idx} className="rounded-xl p-5 text-center cursor-pointer group/btn transition-all duration-300 hover:scale-[1.03]"
                    style={{
                      border: `1px dashed rgba(42,41,56,0.6)`,
                      background: 'rgba(11,11,20,0.5)',
                    }}>
                    <input type="file" accept={item.accept} className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const btn = e.target.parentElement;
                          if (btn) {
                            btn.innerHTML = `<div class="animate-pulse flex flex-col items-center justify-center h-full" style="color:${item.color}"><p class="font-medium text-sm">Uploading...</p></div>`;
                            setTimeout(() => {
                              btn.innerHTML = '<div class="flex flex-col items-center justify-center h-full" style="color:#34D399"><p class="font-medium text-sm flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Uploaded</p></div>';
                            }, 2000);
                          }
                        }
                      }}
                    />
                    <Upload className="mx-auto mb-2 group-hover/btn:scale-110 transition-transform" style={{ color: item.color }} size={20} />
                    <p className="font-semibold text-text-primary text-sm">{item.label}</p>
                    <p className="text-[10px] text-text-muted mt-1 font-sans">{item.sub}</p>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
