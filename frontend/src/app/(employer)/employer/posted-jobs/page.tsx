'use client';

import { motion } from 'framer-motion';
import { MapPin, Briefcase, Users, Check, CheckCircle, Edit, Trash, ChevronDown, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PostedJobs() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', wage: 0, slots_required: 1 });
  const [acceptedWorkerPhone, setAcceptedWorkerPhone] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      fetchEmployerJobs(parsed.id);
    }
  }, []);

  const fetchEmployerJobs = async (employerId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/jobs/employer/${employerId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAccept = async (jobId: string, workerId: string) => {
    try {
      const res = await fetch('http://localhost:4000/api/jobs/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, worker_id: workerId })
      });
      const data = await res.json();
      if (res.ok) {
        setAcceptedWorkerPhone(data.worker.phone);
        if (user) fetchEmployerJobs(user.id);
      } else {
        alert(data.error || 'Failed to accept worker');
      }
    } catch (e) {
      alert('Error accepting worker');
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to mark this job as completed?')) return;
    try {
      const res = await fetch(`http://localhost:4000/api/jobs/${jobId}/complete`, { method: 'PUT' });
      if (res.ok) {
        if (user) fetchEmployerJobs(user.id);
      }
    } catch (e) {
      alert('Error completing job');
    }
  };

  const handleSaveEdit = async (jobId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingJob(null);
        if (user) fetchEmployerJobs(user.id);
      } else {
        alert('Failed to update job');
      }
    } catch (e) {
      alert('Error updating job');
    }
  };

  const ongoingJobs = jobs.filter(j => j.status !== 'COMPLETED');
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="text-neon-purple" /> Manage Posted Jobs
        </h1>
        <p className="text-sm text-gray-400 mt-1">Edit job details and select workers from your live queue.</p>
      </header>

      {/* Accepted Prompt */}
      {acceptedWorkerPhone && (
        <div className="bg-green-500/20 border border-green-500/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
            <Check size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Worker Accepted!</h2>
          <div className="text-2xl font-mono text-neon-blue tracking-wider bg-black/40 px-6 py-2 rounded-xl border border-neon-blue/30">
            {acceptedWorkerPhone}
          </div>
          <button 
            onClick={() => setAcceptedWorkerPhone(null)}
            className="mt-4 text-sm text-gray-400 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button 
          onClick={() => setActiveTab('ongoing')}
          className={`flex-1 py-4 text-center font-medium transition-all border-b-2 ${activeTab === 'ongoing' ? 'text-neon-purple border-neon-purple bg-neon-purple/5' : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}
        >
          Ongoing Jobs ({ongoingJobs.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-4 text-center font-medium transition-all border-b-2 ${activeTab === 'completed' ? 'text-green-400 border-green-400 bg-green-400/5' : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}
        >
          Completed Jobs ({completedJobs.length})
        </button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading jobs...</div>
        ) : activeTab === 'ongoing' && ongoingJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500 glass-card">No ongoing jobs.</div>
        ) : activeTab === 'completed' && completedJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500 glass-card">No completed jobs.</div>
        ) : (
          (activeTab === 'ongoing' ? ongoingJobs : completedJobs).map((job) => {
            const applications = job.applications || [];
            const accepted = applications.filter((a: any) => a.status === 'ACCEPTED');
            const pending = applications.filter((a: any) => a.status === 'PENDING' || a.status === 'QUEUED');
            const isEditing = editingJob === job.id;

            return (
              <div key={job.id} className={`glass-card relative overflow-hidden ${activeTab === 'completed' ? 'opacity-70' : ''}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  {isEditing ? (
                    <div className="flex-1 w-full space-y-3 bg-black/40 p-4 rounded-xl border border-neon-purple/30">
                      <input 
                        type="text" 
                        value={editForm.title} 
                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-neon-purple"
                        placeholder="Job Title"
                      />
                      <div className="flex gap-3">
                        <input 
                          type="number" 
                          value={editForm.wage} 
                          onChange={e => setEditForm({...editForm, wage: parseInt(e.target.value)})}
                          className="w-1/2 bg-black/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-neon-purple"
                          placeholder="Wage (₹)"
                        />
                        <input 
                          type="number" 
                          value={editForm.slots_required} 
                          onChange={e => setEditForm({...editForm, slots_required: parseInt(e.target.value)})}
                          className="w-1/2 bg-black/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-neon-purple"
                          placeholder="Workers Needed"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setEditingJob(null)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm">Cancel</button>
                        <button onClick={() => handleSaveEdit(job.id)} className="px-4 py-2 rounded-lg bg-neon-purple text-white text-sm flex items-center gap-1">
                          <Save size={16} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl">{job.title}</h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1 text-neon-blue"><Briefcase size={14} /> {job.category}</span>
                          <span className="flex items-center gap-1 text-green-400">₹{job.wage}</span>
                          <span className="flex items-center gap-1"><Users size={14} /> {accepted.length}/{job.slots_required} Filled</span>
                        </div>
                      </div>
                      {activeTab === 'ongoing' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingJob(job.id);
                              setEditForm({ title: job.title, wage: job.wage, slots_required: job.slots_required });
                            }}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                            title="Edit Job"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleCompleteJob(job.id)}
                            className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 text-sm font-medium transition-colors"
                          >
                            Mark Completed
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Applications Section */}
                <div className="bg-black/30 rounded-xl p-4 mt-4 border border-white/5">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Worker Queue & Roster</h4>
                  
                  {accepted.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-xs text-green-400 mb-2">Accepted Workers</h5>
                      <div className="space-y-2">
                        {accepted.map((app: any) => (
                          <div key={app.id} className="flex justify-between items-center bg-green-500/10 p-2 px-3 rounded-lg border border-green-500/20">
                            <span className="text-sm font-medium">{app.name}</span>
                            <span className="font-mono text-xs text-green-400">{app.phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'ongoing' && pending.length > 0 && (
                    <div>
                      <h5 className="text-xs text-yellow-400 mb-2">Pending Applications</h5>
                      <div className="space-y-2">
                        {pending.map((app: any) => (
                          <div key={app.id} className="flex justify-between items-center bg-white/5 p-2 px-3 rounded-lg border border-white/10">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{app.name}</span>
                              <span className="text-[10px] text-gray-400">Trust Score: {app.trust_score}</span>
                            </div>
                            <button 
                              onClick={() => handleAccept(job.id, app.worker_id)}
                              disabled={accepted.length >= job.slots_required}
                              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${accepted.length >= job.slots_required ? 'bg-gray-800 text-gray-500' : 'bg-neon-purple/20 text-neon-purple hover:bg-neon-purple hover:text-white'}`}
                            >
                              Accept
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {applications.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-2">No applications yet.</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
