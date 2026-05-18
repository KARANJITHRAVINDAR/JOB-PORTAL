'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'WORKER',
    age: '',
    address: '',
    category_sought: '',
    photo_url: '',
    lat: 0,
    lng: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role === 'EMPLOYER') {
          router.push('/employer/dashboard');
        } else {
          router.push('/seeker/dashboard');
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-2">Join the Hyperlocal Workforce</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
            <input 
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
              <input 
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Job Category</label>
              <select 
                value={formData.category_sought}
                onChange={(e) => setFormData({...formData, category_sought: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue appearance-none"
              >
                <option value="">Select Category</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Construction">Construction</option>
                <option value="Daily Wage">Daily Wage</option>
                <option value="IT Job">IT Job</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-300">Address & Location</label>
              <button 
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        
                        let displayAddress = formData.address;
                        
                        try {
                          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
                          const data = await res.json();
                          if (data && data.city) {
                            displayAddress = `${data.city}, ${data.principalSubdivision}`;
                          } else {
                            displayAddress = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                          }
                        } catch (e) {
                          console.error('Reverse geocoding failed', e);
                          displayAddress = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                        }

                        setFormData({
                          ...formData,
                          lat,
                          lng,
                          address: displayAddress
                        });
                      },
                      (error) => alert('Unable to detect location: ' + error.message)
                    );
                  } else {
                    alert('Geolocation is not supported by this browser.');
                  }
                }}
                className="text-xs text-neon-blue bg-neon-blue/10 px-2 py-1 rounded hover:bg-neon-blue/20 transition-colors"
              >
                Detect My Location
              </button>
            </div>
            <textarea 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="e.g. 123 Main St, City (or click Detect)"
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">I want to...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'WORKER'})}
                className={`py-3 rounded-xl border text-sm font-medium transition-colors ${formData.role === 'WORKER' ? 'bg-neon-blue/20 border-neon-blue text-neon-blue' : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'}`}
              >
                Find Work
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'EMPLOYER'})}
                className={`py-3 rounded-xl border text-sm font-medium transition-colors ${formData.role === 'EMPLOYER' ? 'bg-neon-purple/20 border-neon-purple text-neon-purple' : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'}`}
              >
                Hire Workers
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-neon py-3 mt-4"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account? <Link href="/login" className="text-neon-purple hover:text-white transition-colors">Login</Link>
        </div>
      </motion.div>
    </div>
  );
}
