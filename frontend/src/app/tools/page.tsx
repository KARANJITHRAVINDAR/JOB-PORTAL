'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, MapPin, DollarSign, ShieldCheck, Search, Plus, X } from 'lucide-react';
import Navbar from '@/components/Navbar'; // or similar if exists, I'll just use basic layout
import Link from 'next/link';

export default function ToolsHub() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({ name: '', category: 'General', daily_rate: 50 });
  const [rentingId, setRentingId] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/tools');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTools(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handlePostTool = async () => {
    if (!user) return alert('Please login first');
    try {
      const res = await fetch('http://localhost:4000/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: user.id,
          name: postForm.name,
          category: postForm.category,
          daily_rate: postForm.daily_rate
        })
      });
      if (res.ok) {
        alert('Tool posted successfully!');
        setShowPostModal(false);
        fetchTools();
      }
    } catch (e) {
      alert('Failed to post tool');
    }
  };

  const handleRentTool = async (toolId: string) => {
    if (!user) return alert('Please login first');
    setRentingId(toolId);
    try {
      const res = await fetch('http://localhost:4000/api/tools/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_id: toolId, renter_id: user.id, days: 1 })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully rented! Escrow cost: ₹${data.cost}`);
        fetchTools();
      } else {
        alert(data.error || 'Failed to rent tool');
      }
    } catch (e) {
      alert('Failed to rent tool');
    }
    setRentingId(null);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 relative pb-24">
      {/* Back button */}
      <div className="max-w-5xl mx-auto mb-6">
        <Link href={user?.role === 'employer' ? "/employer/dashboard" : "/seeker/dashboard"} className="text-neon-blue hover:text-white transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="max-w-5xl mx-auto animate-in fade-in space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wrench className="text-neon-purple" /> Hardware Hub
            </h1>
            <p className="text-gray-400 mt-2">Rent tools from peers nearby instead of buying new ones.</p>
          </div>
          <button 
            onClick={() => setShowPostModal(true)}
            className="btn-neon flex items-center gap-2"
          >
            <Plus size={18} /> Post a Tool
          </button>
        </header>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading tools...</div>
        ) : tools.length === 0 ? (
          <div className="glass-card text-center py-10 text-gray-400">
            No tools available nearby right now. Be the first to post one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(tool => (
              <div key={tool.id} className="glass-card flex flex-col justify-between hover:border-white/30 transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg group-hover:text-neon-purple transition-colors">{tool.name}</h3>
                    <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs text-gray-300">
                      {tool.category}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p className="flex items-center gap-2">
                      <DollarSign size={16} className="text-green-400" /> 
                      <span className="text-green-400 font-bold">₹{tool.daily_rate}</span> / day
                    </p>
                    <p className="flex items-center gap-2">
                      Owner: {tool.owner_name}
                    </p>
                    <p className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-green-500" /> Trust Score: {tool.trust_score}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRentTool(tool.id)}
                  disabled={rentingId === tool.id || (user && user.id === tool.owner_id)}
                  className={`mt-4 w-full py-2 rounded-xl font-medium transition-colors ${user && user.id === tool.owner_id ? 'bg-gray-800 text-gray-500' : rentingId === tool.id ? 'bg-neon-blue/50 text-white' : 'bg-neon-blue/20 text-neon-blue hover:bg-neon-blue hover:text-white'}`}
                >
                  {user && user.id === tool.owner_id ? 'Your Tool' : rentingId === tool.id ? 'Renting...' : 'Rent Now'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 relative animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setShowPostModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Post a Tool for Rent</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400">Tool Name</label>
                <input 
                  type="text" 
                  value={postForm.name}
                  onChange={e => setPostForm({...postForm, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-neon-purple"
                  placeholder="e.g. Bosch Hammer Drill"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Category</label>
                <select 
                  value={postForm.category}
                  onChange={e => setPostForm({...postForm, category: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-neon-purple appearance-none"
                >
                  <option value="General">General</option>
                  <option value="Power Tools">Power Tools</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Daily Rent (₹)</label>
                <input 
                  type="number" 
                  value={postForm.daily_rate}
                  onChange={e => setPostForm({...postForm, daily_rate: parseInt(e.target.value)})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-neon-purple"
                />
              </div>
              <button 
                onClick={handlePostTool}
                className="w-full btn-neon py-3 mt-2"
              >
                Post Tool
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
