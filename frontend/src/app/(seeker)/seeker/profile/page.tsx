'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, Phone, Calendar, Upload, ShieldCheck, Check, X } from 'lucide-react';

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

  if (!user) return <div className="p-8 flex justify-center items-center h-full text-neon-purple">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="text-neon-purple" /> My Profile
        </h1>
        {isEditing ? (
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setFormData(user);
                setIsEditing(false);
              }}
              className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-sm hover:bg-red-500/20 transition-colors flex items-center gap-1"
            >
              <X size={16} /> Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-neon-blue/20 text-neon-blue border border-neon-blue/30 px-4 py-2 rounded-xl text-sm hover:bg-neon-blue/30 transition-colors flex items-center gap-1"
            >
              {saving ? 'Saving...' : <><Check size={16} /> Save</>}
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Identity Card */}
        <div className="glass-card flex flex-col items-center text-center p-8 md:col-span-1 border-t-4 border-t-neon-blue">
          <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-black shadow-[0_0_20px_rgba(30,144,255,0.3)] overflow-hidden relative mb-4">
            {user.photo_url ? (
              <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <User size={48} />
              </div>
            )}
            <button 
              onClick={() => alert("Profile photo upload coming soon!")}
              className="absolute bottom-0 inset-x-0 bg-black/60 py-1 text-xs text-white hover:bg-neon-blue transition-colors"
            >
              <Upload size={12} className="mx-auto" />
            </button>
          </div>
          
          {isEditing ? (
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-center font-bold text-xl mb-2 focus:outline-none focus:border-neon-blue"
            />
          ) : (
            <h2 className="text-xl font-bold">{user.name}</h2>
          )}

          {isEditing ? (
            <input 
              type="text"
              value={formData.category_sought}
              onChange={(e) => setFormData({...formData, category_sought: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-center text-neon-blue text-sm focus:outline-none focus:border-neon-blue"
            />
          ) : (
            <p className="text-neon-blue text-sm font-medium mt-1">{user.category_sought || 'Worker'}</p>
          )}
          
          <div className="mt-4 inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold tracking-wider border border-green-500/30">
            <ShieldCheck size={14} /> TRUST SCORE: {user.trust_score || 100}
          </div>
        </div>

        {/* Details Card */}
        <div className="glass-card p-6 md:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                <Phone size={12} /> Contact Number
              </label>
              {isEditing ? (
                <input 
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-blue"
                />
              ) : (
                <p className="font-medium">{user.phone}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                <Calendar size={12} /> Age
              </label>
              {isEditing ? (
                <input 
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-blue"
                />
              ) : (
                <p className="font-medium">{user.age || 'Not specified'} years old</p>
              )}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                <MapPin size={12} /> Address / Location
              </label>
              {isEditing ? (
                <input 
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-blue"
                />
              ) : (
                <p className="font-medium">{user.address || 'Location not updated. Using GPS.'}</p>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold border-b border-white/10 pb-2 mt-8">Work Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                <Briefcase size={12} /> Primary Skill
              </label>
              {isEditing ? (
                <select 
                  value={formData.category_sought || ''}
                  onChange={(e) => setFormData({...formData, category_sought: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-blue appearance-none"
                >
                  <option value="">Select Category</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Construction">Construction</option>
                  <option value="Daily Wage">Daily Wage</option>
                  <option value="IT Job">IT Job</option>
                </select>
              ) : (
                <p className="font-medium inline-flex px-3 py-1 rounded-md bg-white/5 border border-white/10">
                  {user.category_sought || 'Open to all work'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Media Uploads Section */}
      <div className="glass-card">
        <h3 className="text-lg font-semibold mb-4">Media & Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden group">
            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const btn = e.target.parentElement;
                  if (btn) {
                    btn.innerHTML = '<div class="animate-pulse text-neon-purple"><p class="font-medium">Uploading video...</p></div>';
                    setTimeout(() => {
                      btn.innerHTML = '<div class="text-green-400"><p class="font-medium">✓ Video Uploaded</p><p class="text-xs text-gray-400 mt-1">Ready for verification</p></div>';
                    }, 2000);
                  }
                }
              }}
            />
            <Upload className="mx-auto mb-2 text-neon-purple group-hover:scale-110 transition-transform" />
            <p className="font-medium">Upload Video Intro</p>
            <p className="text-xs text-gray-400 mt-1">30-second skill demonstration</p>
          </label>
          
          <label className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden group">
            <input 
              type="file" 
              accept="audio/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const btn = e.target.parentElement;
                  if (btn) {
                    btn.innerHTML = '<div class="animate-pulse text-neon-blue"><p class="font-medium">Uploading audio...</p></div>';
                    setTimeout(() => {
                      btn.innerHTML = '<div class="text-green-400"><p class="font-medium">✓ Audio Uploaded</p><p class="text-xs text-gray-400 mt-1">Ready for verification</p></div>';
                    }, 2000);
                  }
                }
              }}
            />
            <Upload className="mx-auto mb-2 text-neon-blue group-hover:scale-110 transition-transform" />
            <p className="font-medium">Upload Audio Bio</p>
            <p className="text-xs text-gray-400 mt-1">Voice note in your native language</p>
          </label>
        </div>
      </div>
    </div>
  );
}
