'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/Button';
import { FloatingOrbs, inputStyle, inputBg } from '@/components/DesignSystem';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push(data.user.role === 'EMPLOYER' ? '/employer/dashboard' : '/seeker/dashboard');
      } else alert(data.error);
    } catch { alert('Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#0B0B14' }}>
      <FloatingOrbs />

      {/* Central glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)', filter: 'blur(60px)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10">
        {/* Card with gradient border */}
        <div className="relative overflow-hidden rounded-2xl p-[1px]"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(42,41,56,0.2) 40%, rgba(52,211,153,0.15) 100%)' }}>
          <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.97), rgba(28,27,41,0.95))' }}>

            {/* Brand */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #34D399 100%)', boxShadow: '0 8px 24px rgba(139,92,246,0.25)' }}>
                <span className="text-white font-black text-xl">W</span>
              </div>
              <h1 className="text-3xl font-display font-extrabold bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6, #34D399)' }}>
                Workforce OS
              </h1>
              <p className="text-text-muted text-sm mt-2">Enter your phone number to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-2 block">Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className={inputStyle} style={inputBg} placeholder="+91 98765 43210" required />
              </div>

              <Button type="submit" disabled={loading} variant="primary" className="w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2">
                {loading ? 'Authenticating...' : 'Login Securely'} <ArrowRight size={16} />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-text-muted">
              New here? <Link href="/register" className="text-violet hover:text-violet-dim transition-colors font-medium">Create an account</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
