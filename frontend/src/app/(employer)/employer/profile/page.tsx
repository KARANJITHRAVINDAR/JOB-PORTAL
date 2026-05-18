'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Upload, Check, X, Briefcase } from 'lucide-react';

export default function EmployerProfile() {
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
          <Briefcase className="text-neon-purple" /> Company Profile
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
              onClick={() => alert("Logo upload coming soon!")}
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
          
          <p className="text-neon-blue text-sm font-medium mt-1">Employer</p>
        </div>

        {/* Details Card */}
        <div className="glass-card p-6 md:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Company Information</h3>
          
          <div className="grid grid-cols-1 gap-6">
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
                <MapPin size={12} /> Company Address / Main Location
              </label>
              {isEditing ? (
                <input 
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-blue"
                />
              ) : (
                <p className="font-medium">{user.address || 'Location not specified.'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
