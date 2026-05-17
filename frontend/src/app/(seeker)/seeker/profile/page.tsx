'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, Phone, Calendar, Upload, ShieldCheck } from 'lucide-react';

export default function SeekerProfile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) return <div className="p-8">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="text-neon-purple" /> My Profile
        </h1>
        <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors">
          Edit Profile
        </button>
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
            <button className="absolute bottom-0 inset-x-0 bg-black/60 py-1 text-xs text-white hover:bg-neon-blue transition-colors">
              <Upload size={12} className="mx-auto" />
            </button>
          </div>
          
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-neon-blue text-sm font-medium mt-1">{user.category_sought || 'Worker'}</p>
          
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
              <p className="font-medium">{user.phone}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                <Calendar size={12} /> Age
              </label>
              <p className="font-medium">{user.age || 'Not specified'} years old</p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                <MapPin size={12} /> Address / Location
              </label>
              <p className="font-medium">{user.address || 'Location not updated. Using GPS.'}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold border-b border-white/10 pb-2 mt-8">Work Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                <Briefcase size={12} /> Primary Skill
              </label>
              <p className="font-medium inline-flex px-3 py-1 rounded-md bg-white/5 border border-white/10">
                {user.category_sought || 'Open to all work'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Media Uploads Section */}
      <div className="glass-card">
        <h3 className="text-lg font-semibold mb-4">Media & Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <Upload className="mx-auto mb-2 text-neon-purple" />
            <p className="font-medium">Upload Video Intro</p>
            <p className="text-xs text-gray-400 mt-1">30-second skill demonstration</p>
          </div>
          <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <Upload className="mx-auto mb-2 text-neon-blue" />
            <p className="font-medium">Upload Audio Bio</p>
            <p className="text-xs text-gray-400 mt-1">Voice note in your native language</p>
          </div>
        </div>
      </div>
    </div>
  );
}
