'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, DollarSign, ShieldCheck, Plus, X } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/Button';
import { FloatingOrbs, staggerContainer, fadeUp, PageHeader, inputStyle, inputBg } from '@/components/DesignSystem';

export default function ToolsHub() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({ name: '', category: 'General', daily_rate: 50 });
  const [rentingId, setRentingId] = useState<string | null>(null);

  useEffect(() => { const userData = localStorage.getItem('user'); if (userData) setUser(JSON.parse(userData)); fetchTools(); }, []);

  const fetchTools = async () => {
    setLoading(true);
    try { const res = await fetch('http://localhost:4000/api/tools'); const data = await res.json(); if (Array.isArray(data)) setTools(data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handlePostTool = async () => {
    if (!user) return alert('Please login first');
    try {
      const res = await fetch('http://localhost:4000/api/tools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ owner_id: user.id, name: postForm.name, category: postForm.category, daily_rate: postForm.daily_rate }) });
      if (res.ok) { alert('Tool posted!'); setShowPostModal(false); fetchTools(); }
    } catch { alert('Failed to post tool'); }
  };

  const handleRentTool = async (toolId: string) => {
    if (!user) return alert('Please login first');
    setRentingId(toolId);
    try {
      const res = await fetch('http://localhost:4000/api/tools/rent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool_id: toolId, renter_id: user.id, days: 1 }) });
      const data = await res.json();
      if (res.ok) { alert(`Rented! Escrow cost: ₹${data.cost}`); fetchTools(); }
      else alert(data.error || 'Failed');
    } catch { alert('Failed to rent'); }
    setRentingId(null);
  };

  return (
    <div className="min-h-screen p-6 relative pb-24" style={{ background: '#0B0B14' }}>
      <FloatingOrbs />
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="relative z-10 max-w-5xl mx-auto space-y-8">
        <Link href={user?.role === 'employer' ? "/employer/dashboard" : "/seeker/dashboard"} className="text-violet hover:text-violet-dim transition-colors text-sm font-medium">
          ← Back to Dashboard
        </Link>

        <motion.div variants={fadeUp}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <PageHeader icon={Wrench} title="Hardware Hub" subtitle="Rent tools from peers nearby instead of buying new ones." />
            <Button variant="primary" onClick={() => setShowPostModal(true)} className="px-5 py-2.5 text-xs">
              <Plus size={16} /> Post a Tool
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-10 text-text-muted font-mono text-sm animate-pulse">Loading tools...</div>
        ) : tools.length === 0 ? (
          <div className="glass-card text-center py-10 text-text-muted">No tools available nearby. Be the first to post!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, idx) => (
              <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                className="group relative overflow-hidden rounded-2xl p-[1px] hover:-translate-y-1 transition-all duration-400"
                style={{ background: 'linear-gradient(135deg, rgba(242,169,59,0.2) 0%, rgba(42,41,56,0.2) 100%)' }}>
                <div className="rounded-2xl p-5 flex flex-col justify-between h-full"
                  style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.9), rgba(28,27,41,0.7))' }}>
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(242,169,59,0.4), transparent)' }} />
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-display font-bold text-lg text-text-primary group-hover:text-marigold transition-colors">{tool.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono text-text-muted"
                        style={{ background: 'rgba(42,41,56,0.5)', border: '1px solid rgba(42,41,56,0.6)' }}>{tool.category}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <DollarSign size={14} className="text-signal" />
                        <span className="text-signal font-mono font-bold">₹{tool.daily_rate}</span>
                        <span className="text-text-muted">/ day</span>
                      </p>
                      <p className="flex items-center gap-2 text-text-muted text-xs">Owner: {tool.owner_name}</p>
                      <p className="flex items-center gap-2 text-xs">
                        <ShieldCheck size={13} className="text-signal" />
                        <span className="text-text-muted">Trust: {tool.trust_score}</span>
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleRentTool(tool.id)} disabled={rentingId === tool.id || (user && user.id === tool.owner_id)}
                    variant={user && user.id === tool.owner_id ? 'secondary' : 'primary'} className="mt-4 w-full py-2 text-xs">
                    {user && user.id === tool.owner_id ? 'Your Tool' : rentingId === tool.id ? 'Renting...' : 'Rent Now'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Post Tool Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,11,20,0.85)', backdropFilter: 'blur(12px)' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-6 relative rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95), rgba(28,27,41,0.9))', border: '1px solid rgba(42,41,56,0.6)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
            <button onClick={() => setShowPostModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1"><X size={18} /></button>
            <h2 className="text-xl font-display font-bold mb-4 text-text-primary">Post a Tool for Rent</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-1.5 block">Tool Name</label>
                <input type="text" value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})}
                  className={inputStyle} style={inputBg} placeholder="e.g. Bosch Hammer Drill" />
              </div>
              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-1.5 block">Category</label>
                <select value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}
                  className={`${inputStyle} appearance-none`} style={inputBg}>
                  <option value="General">General</option>
                  <option value="Power Tools">Power Tools</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-mono mb-1.5 block">Daily Rent (₹)</label>
                <input type="number" value={postForm.daily_rate} onChange={e => setPostForm({...postForm, daily_rate: parseInt(e.target.value)})}
                  className={inputStyle} style={inputBg} />
              </div>
              <Button onClick={handlePostTool} variant="primary" className="w-full py-3 mt-2">Post Tool</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
