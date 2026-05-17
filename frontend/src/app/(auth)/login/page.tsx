'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mic, ArrowRight } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Store token (in a real app, use HTTP-only cookies or NextAuth)
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
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
      <div className="absolute w-96 h-96 bg-neon-purple/20 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
            Workforce OS
          </h1>
          <p className="text-gray-400 text-sm mt-2">Enter your phone number to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-all"
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-neon flex items-center justify-center gap-2 py-3"
          >
            {loading ? 'Authenticating...' : 'Login Securely'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          New here? <Link href="/register" className="text-neon-blue hover:text-neon-purple transition-colors">Create an account</Link>
        </div>
      </motion.div>
    </div>
  );
}
