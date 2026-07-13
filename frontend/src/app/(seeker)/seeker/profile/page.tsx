'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, Phone, Calendar, Upload, ShieldCheck, Check, X, Users, Zap, TrendingUp } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

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
    <div className="max-w-4xl mx-auto space-y-6 pb-20 relative">
      {/* Floating background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[400px] h-[400px] rounded-full animate-float"
          style={{ top: '-5%', right: '-8%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="relative z-10 space-y-6">
        {/* Header */}
        <motion.header variants={fadeUp} className="flex justify-between items-center">
          <h1 className="text-2xl font-display font-extrabold flex items-center gap-2.5 text-text-primary">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: '1px solid rgba(139,92,246,0.2)' }}>
              <User size={16} className="text-violet" />
            </div>
            My Profile
          </h1>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => { setFormData(user); setIsEditing(false); }}
                className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all duration-300 hover:scale-[1.02]"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all duration-300 hover:scale-[1.02]"
                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399' }}
              >
                {saving ? 'Saving...' : <><Check size={14} /> Save</>}
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
              style={{ background: 'rgba(42,41,56,0.4)', border: '1px solid rgba(42,41,56,0.6)', color: '#F1F0F6' }}
            >
              Edit Profile
            </motion.button>
          )}
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Card */}
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl p-[1px] md:col-span-1"
            style={{ background: `linear-gradient(180deg, ${accentColor}40 0%, rgba(28,27,41,0.3) 50%, rgba(139,92,246,0.2) 100%)` }}
          >
            <div className="rounded-2xl p-8 flex flex-col items-center text-center h-full relative"
              style={{ background: 'linear-gradient(180deg, rgba(21,20,31,0.95) 0%, rgba(21,20,31,0.98) 100%)' }}>
              {/* Glow behind avatar */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: accentColor }} />

              <div className="w-28 h-28 rounded-2xl overflow-hidden relative mb-4 z-10"
                style={{ border: `2px solid ${accentColor}30`, boxShadow: `0 0 30px ${accentColor}10` }}>
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
                <h2 className="text-xl font-display font-bold text-text-primary">{user.name}</h2>
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

              <div className="mt-5 flex flex-col items-center gap-3 w-full">
                {/* Level */}
                <span className="font-mono font-bold text-sm px-4 py-1 rounded-full"
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#8B5CF6' }}>
                  <Zap size={12} className="inline mr-1" />LEVEL {user.level || 1}
                </span>

                {/* XP Bar */}
                <div className="w-full max-w-[200px] space-y-1">
                  <div className="flex justify-between text-[10px] text-text-muted font-mono">
                    <span><TrendingUp size={10} className="inline mr-0.5" /> XP</span>
                    <span>{user.xp || 0} / {((user.level || 1) * 100)}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(11,11,20,0.6)', border: '1px solid rgba(42,41,56,0.4)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(((user.xp || 0) % 100), 2)}%`,
                        background: 'linear-gradient(90deg, #8B5CF6, #a78bfa)',
                        boxShadow: '0 0 10px rgba(139,92,246,0.3)',
                      }} />
                  </div>
                </div>

                {/* Trust Score */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider"
                  style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}25`, color: accentColor }}>
                  <ShieldCheck size={14} /> TRUST: {trustScore}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Details Card */}
          <motion.div variants={fadeUp} className="glass-card p-6 md:col-span-2 space-y-6">
            <h3 className="text-lg font-display font-semibold pb-2" style={{ borderBottom: '1px solid rgba(42,41,56,0.4)' }}>Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                  <Phone size={10} /> Contact Number
                </label>
                {isEditing ? (
                  <input type="text" value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={inputStyle} style={inputBg}
                  />
                ) : (
                  <p className="font-medium text-text-primary">{user.phone}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                  <Calendar size={10} /> Age
                </label>
                {isEditing ? (
                  <input type="number" value={formData.age || ''}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className={inputStyle} style={inputBg}
                  />
                ) : (
                  <p className="font-medium text-text-primary">{user.age || 'Not specified'} years old</p>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                  <MapPin size={10} /> Address / Location
                </label>
                {isEditing ? (
                  <input type="text" value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className={inputStyle} style={inputBg}
                  />
                ) : (
                  <p className="font-medium text-text-primary">{user.address || 'Location not updated. Using GPS.'}</p>
                )}
              </div>
            </div>

            <h3 className="text-lg font-display font-semibold pb-2 mt-6" style={{ borderBottom: '1px solid rgba(42,41,56,0.4)' }}>Work Preferences</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
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
                  <p className="font-medium inline-flex px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: 'rgba(42,41,56,0.3)', border: '1px solid rgba(42,41,56,0.4)' }}>
                    {user.category_sought || 'Open to all work'}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
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

              <div className="space-y-1.5 md:col-span-2 mt-2 pt-4" style={{ borderTop: '1px solid rgba(42,41,56,0.2)' }}>
                <label className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-[0.15em] font-mono">
                  <Users size={10} /> Squad Size (Team Hiring)
                </label>
                {isEditing ? (
                  <div className="flex items-center gap-4">
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
                  <p className="font-medium inline-flex px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                    {user.squad_size > 1 ? `Squad of ${user.squad_size}` : 'Individual (1)'}
                  </p>
                )}
                <p className="text-xs text-text-muted mt-1">If you lead a team of workers, increase your squad size.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Badges Section */}
        <motion.div variants={fadeUp} className="glass-card">
          <h3 className="text-lg font-display font-semibold mb-4 pb-2 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(42,41,56,0.4)' }}>
            <ShieldCheck size={18} className="text-marigold" /> Earned Skill Badges
          </h3>
          {user.badges && user.badges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {user.badges.map((badge: string, i: number) => (
                <motion.div key={i} whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(242,169,59,0.08), rgba(242,169,59,0.03))',
                    border: '1px solid rgba(242,169,59,0.2)',
                    color: '#F2A93B',
                    boxShadow: '0 0 15px rgba(242,169,59,0.05)',
                  }}>
                  <Check size={14} /> {badge}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-text-muted text-sm text-center py-6 rounded-xl"
              style={{ background: 'rgba(11,11,20,0.3)', border: '1px solid rgba(42,41,56,0.3)' }}>
              Complete jobs and get reviewed by employers to earn skill badges!
            </div>
          )}
        </motion.div>

        {/* Media Uploads */}
        <motion.div variants={fadeUp} className="glass-card">
          <h3 className="text-lg font-display font-semibold mb-4">Media & Verification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Upload Video Intro', sub: '30-second skill demonstration', accept: 'video/*', color: '#8B5CF6' },
              { label: 'Upload Audio Bio', sub: 'Voice note in your native language', accept: 'audio/*', color: '#34D399' },
            ].map((item, idx) => (
              <label key={idx} className="rounded-xl p-6 text-center cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
                style={{
                  border: `1px dashed rgba(42,41,56,0.6)`,
                  background: 'rgba(21,20,31,0.4)',
                }}>
                <input type="file" accept={item.accept} className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const btn = e.target.parentElement;
                      if (btn) {
                        btn.innerHTML = `<div class="animate-pulse" style="color:${item.color}"><p class="font-medium">Uploading...</p></div>`;
                        setTimeout(() => {
                          btn.innerHTML = '<div style="color:#34D399"><p class="font-medium">✓ Uploaded</p><p class="text-xs mt-1" style="color:#8D8B9E">Ready for verification</p></div>';
                        }, 2000);
                      }
                    }
                  }}
                />
                <Upload className="mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: item.color }} />
                <p className="font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-muted mt-1">{item.sub}</p>
              </label>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
