'use client';

import { motion } from 'framer-motion';
import { MapPin, Briefcase, Users, Check, CheckCircle, Edit, Save, X, AlertTriangle, QrCode, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReportModal from '@/components/ReportModal';
import { QRCodeSVG } from 'qrcode.react';
import Button from '@/components/Button';
import { FloatingOrbs, staggerContainer, fadeUp, PageHeader, inputStyle, inputBg } from '@/components/DesignSystem';

export default function PostedJobs() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', wage: 0, slots_required: 1 });
  const [acceptedWorkerPhone, setAcceptedWorkerPhone] = useState<string | null>(null);
  const [reportModal, setReportModal] = useState({ isOpen: false, reportedId: '', jobId: '' });
  const [completeModal, setCompleteModal] = useState<{ isOpen: boolean, jobId: string, selectedBadges: string[] }>({ isOpen: false, jobId: '', selectedBadges: [] });
  const [qrModal, setQrModal] = useState<{ isOpen: boolean, jobId: string }>({ isOpen: false, jobId: '' });

  const availableBadges = ['Punctual', 'Skilled', 'Safety First', 'Brought Tools', 'Hard Worker'];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) { const parsed = JSON.parse(userData); setUser(parsed); fetchEmployerJobs(parsed.id); }
  }, []);

  const fetchEmployerJobs = async (employerId: string) => {
    setLoading(true);
    try { const res = await fetch(`http://localhost:4000/api/jobs/employer/${employerId}`); const data = await res.json(); if (Array.isArray(data)) setJobs(data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAccept = async (jobId: string, workerId: string) => {
    try {
      const res = await fetch('http://localhost:4000/api/jobs/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_id: jobId, worker_id: workerId }) });
      const data = await res.json();
      if (res.ok) { setAcceptedWorkerPhone(data.worker.phone); if (user) fetchEmployerJobs(user.id); }
      else alert(data.error || 'Failed');
    } catch { alert('Error'); }
  };

  const handleReject = async (jobId: string, workerId: string) => {
    try {
      const res = await fetch('http://localhost:4000/api/jobs/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_id: jobId, worker_id: workerId }) });
      if (res.ok && user) fetchEmployerJobs(user.id);
    } catch { alert('Error'); }
  };

  const handleCompleteJob = async () => {
    if (!completeModal.jobId) return;
    try {
      const res = await fetch(`http://localhost:4000/api/jobs/${completeModal.jobId}/complete`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ badges: completeModal.selectedBadges }) });
      if (res.ok) { setCompleteModal({ isOpen: false, jobId: '', selectedBadges: [] }); if (user) fetchEmployerJobs(user.id); }
    } catch { alert('Error completing job'); }
  };

  const toggleBadge = (badge: string) => {
    setCompleteModal(prev => ({ ...prev, selectedBadges: prev.selectedBadges.includes(badge) ? prev.selectedBadges.filter(b => b !== badge) : [...prev.selectedBadges, badge] }));
  };

  const handleSaveEdit = async (jobId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/jobs/${jobId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
      if (res.ok) { setEditingJob(null); if (user) fetchEmployerJobs(user.id); }
      else alert('Failed to update');
    } catch { alert('Error'); }
  };

  const ongoingJobs = jobs.filter(j => j.status !== 'COMPLETED');
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingOrbs />
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="relative z-10 max-w-5xl mx-auto space-y-8">

        <motion.div variants={fadeUp}>
          <PageHeader icon={Briefcase} title="Manage Posted Jobs" subtitle="Edit job details and select workers from your live queue." />
        </motion.div>

        {/* Accepted Prompt */}
        {acceptedWorkerPhone && (
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-[1px]"
            style={{ background: 'linear-gradient(135deg, #34D399 0%, #1C1B29 40%, #1C1B29 100%)' }}>
            <div className="rounded-2xl p-6 flex flex-col items-center text-center"
              style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, #15141F 30%)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <Check size={24} className="text-signal" />
              </div>
              <h2 className="text-xl font-display font-bold text-text-primary mb-2">Worker Accepted!</h2>
              <span className="text-2xl font-mono text-violet tracking-wider px-6 py-2 rounded-xl mb-2"
                style={{ background: 'rgba(28,27,41,0.8)', border: '1px solid rgba(42,41,56,0.6)' }}>{acceptedWorkerPhone}</span>
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full mt-2"
                style={{ background: 'rgba(242,169,59,0.08)', border: '1px solid rgba(242,169,59,0.2)', color: '#F2A93B' }}>
                <DollarSign size={12} /> 10% Travel Advance sent
              </span>
              <button onClick={() => setAcceptedWorkerPhone(null)} className="mt-3 text-xs text-text-muted hover:text-text-primary underline">Dismiss</button>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div variants={fadeUp} className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(21,20,31,0.6)', border: '1px solid rgba(42,41,56,0.4)' }}>
          {(['ongoing', 'completed'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-center font-medium text-sm transition-all relative ${activeTab === tab ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
              style={activeTab === tab ? { background: tab === 'ongoing' ? 'rgba(139,92,246,0.08)' : 'rgba(52,211,153,0.08)' } : {}}>
              {activeTab === tab && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full" style={{ background: tab === 'ongoing' ? '#8B5CF6' : '#34D399' }} />}
              {tab === 'ongoing' ? `Ongoing Jobs (${ongoingJobs.length})` : `Completed Jobs (${completedJobs.length})`}
            </button>
          ))}
        </motion.div>

        {/* Job List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-10 text-text-muted font-mono text-sm animate-pulse">Loading jobs...</div>
          ) : (activeTab === 'ongoing' ? ongoingJobs : completedJobs).length === 0 ? (
            <div className="text-center py-10 text-text-muted glass-card">No {activeTab} jobs.</div>
          ) : (
            (activeTab === 'ongoing' ? ongoingJobs : completedJobs).map((job) => {
              const applications = job.applications || [];
              const accepted = applications.filter((a: any) => a.status === 'ACCEPTED' || a.status === 'IN_PROGRESS');
              const pending = applications.filter((a: any) => a.status === 'PENDING' || a.status === 'QUEUED');
              const filledSlots = accepted.reduce((sum: number, app: any) => sum + (app.slots_taken || 1), 0);
              const isEditing = editingJob === job.id;

              return (
                <motion.div key={job.id} variants={fadeUp}
                  className={`glass-card relative overflow-hidden ${activeTab === 'completed' ? 'opacity-70' : ''}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    {isEditing ? (
                      <div className="flex-1 w-full space-y-3 p-4 rounded-xl" style={{ background: 'rgba(11,11,20,0.5)', border: '1px solid rgba(139,92,246,0.2)' }}>
                        <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className={inputStyle} style={inputBg} placeholder="Job Title" />
                        <div className="flex gap-3">
                          <input type="number" value={editForm.wage} onChange={e => setEditForm({...editForm, wage: parseInt(e.target.value)})} className={inputStyle} style={inputBg} placeholder="Wage (₹)" />
                          <input type="number" value={editForm.slots_required} onChange={e => setEditForm({...editForm, slots_required: parseInt(e.target.value)})} className={inputStyle} style={inputBg} placeholder="Workers" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="secondary" onClick={() => setEditingJob(null)} className="text-xs py-1.5 px-3">Cancel</Button>
                          <Button variant="primary" onClick={() => handleSaveEdit(job.id)} className="text-xs py-1.5 px-3"><Save size={14} /> Save</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-xl text-text-primary">{job.title}</h3>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-violet font-mono"><Briefcase size={13} /> {job.category}</span>
                            <span className="flex items-center gap-1 text-signal font-mono">₹{job.wage}</span>
                            <span className="flex items-center gap-1 text-text-muted font-mono"><Users size={13} /> {filledSlots}/{job.slots_required}</span>
                          </div>
                        </div>
                        {activeTab === 'ongoing' && (
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => { setEditingJob(job.id); setEditForm({ title: job.title, wage: job.wage, slots_required: job.slots_required }); }}
                              className="p-2 rounded-xl transition-all" style={{ background: 'rgba(42,41,56,0.3)', border: '1px solid rgba(42,41,56,0.4)' }}><Edit size={16} className="text-text-muted" /></button>
                            {accepted.length > 0 && (
                              <Button variant="secondary" onClick={() => setQrModal({ isOpen: true, jobId: job.id })} className="text-xs py-2 px-3">
                                <QrCode size={14} /> Show QR
                              </Button>
                            )}
                            <button onClick={() => setCompleteModal({ isOpen: true, jobId: job.id, selectedBadges: [] })}
                              className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                              style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399' }}>
                              Mark Completed
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="rounded-xl p-4 mt-2" style={{ background: 'rgba(11,11,20,0.4)', border: '1px solid rgba(42,41,56,0.3)' }}>
                    <h4 className="text-[10px] font-semibold text-text-muted mb-3 uppercase tracking-[0.15em] font-mono">Worker Queue & Roster</h4>

                    {accepted.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-[10px] text-signal mb-2 uppercase tracking-wider font-mono">Accepted Workers</h5>
                        <div className="space-y-2">
                          {accepted.map((app: any) => (
                            <div key={app.id} className="flex justify-between items-center p-2.5 px-3 rounded-xl"
                              style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.12)' }}>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-text-primary flex items-center gap-2">
                                  {app.name}
                                  {app.slots_taken > 1 && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399' }}>Squad of {app.slots_taken}</span>}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-mono text-xs text-signal">{app.phone}</span>
                                  {app.status === 'IN_PROGRESS' && <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#8B5CF6' }}>CLOCKED IN</span>}
                                </div>
                              </div>
                              <button onClick={() => setReportModal({ isOpen: true, reportedId: app.worker_id, jobId: job.id })} className="text-red-400/50 hover:text-red-400 p-1"><AlertTriangle size={14} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'ongoing' && pending.length > 0 && (
                      <div>
                        <h5 className="text-[10px] text-marigold mb-2 uppercase tracking-wider font-mono">Pending Applications</h5>
                        <div className="space-y-2">
                          {pending.map((app: any) => (
                            <div key={app.id} className="flex justify-between items-center p-2.5 px-3 rounded-xl"
                              style={{ background: 'rgba(42,41,56,0.2)', border: '1px solid rgba(42,41,56,0.3)' }}>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-text-primary flex items-center gap-2">
                                  {app.name}
                                  {app.slots_taken > 1 && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#8B5CF6' }}>Squad of {app.slots_taken}</span>}
                                </span>
                                <span className="text-[10px] text-text-muted font-mono">Trust: {app.trust_score}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => handleAccept(job.id, app.worker_id)} disabled={filledSlots + (app.slots_taken || 1) > job.slots_required} variant="primary" className="px-3 py-1.5 text-xs">Accept</Button>
                                <button onClick={() => handleReject(job.id, app.worker_id)} className="px-3 py-1.5 rounded-xl text-xs font-medium"
                                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}>Reject</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {applications.length === 0 && <p className="text-xs text-text-muted text-center py-2">No applications yet.</p>}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <ReportModal isOpen={reportModal.isOpen} onClose={() => setReportModal({ isOpen: false, reportedId: '', jobId: '' })} reporterId={user?.id || ''} reportedId={reportModal.reportedId} jobId={reportModal.jobId} targetType="worker" />

        {/* Complete Job Modal */}
        {completeModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,11,20,0.85)', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full p-6 space-y-5 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95), rgba(28,27,41,0.9))', border: '1px solid rgba(42,41,56,0.6)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-display font-bold flex items-center gap-2 text-text-primary"><CheckCircle className="text-signal" size={20} /> Complete Job</h2>
                <button onClick={() => setCompleteModal({ isOpen: false, jobId: '', selectedBadges: [] })} className="text-text-muted hover:text-text-primary p-1"><X size={18} /></button>
              </div>
              <p className="text-sm text-text-muted">Award skill badges to the worker(s):</p>
              <div className="flex flex-wrap gap-2">
                {availableBadges.map(badge => (
                  <button key={badge} onClick={() => toggleBadge(badge)}
                    className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                    style={completeModal.selectedBadges.includes(badge) ? { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#8B5CF6', boxShadow: '0 0 10px rgba(139,92,246,0.15)' } : { background: 'rgba(42,41,56,0.3)', border: '1px solid rgba(42,41,56,0.4)', color: '#8D8B9E' }}>
                    {badge}
                  </button>
                ))}
              </div>
              <Button onClick={handleCompleteJob} variant="primary" className="w-full py-3">Confirm Completion</Button>
            </motion.div>
          </div>
        )}

        {/* QR Modal */}
        {qrModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,11,20,0.85)', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-w-sm w-full p-8 space-y-5 flex flex-col items-center text-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95), rgba(28,27,41,0.9))', border: '1px solid rgba(42,41,56,0.6)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
              <div className="w-full flex justify-between items-center">
                <h2 className="text-xl font-display font-bold flex items-center gap-2 text-text-primary"><QrCode className="text-violet" size={18} /> Smart Clock-In</h2>
                <button onClick={() => setQrModal({ isOpen: false, jobId: '' })} className="text-text-muted hover:text-text-primary p-1"><X size={18} /></button>
              </div>
              <p className="text-sm text-text-muted">Ask workers to scan this QR code to clock in.</p>
              <div className="bg-white p-4 rounded-xl"><QRCodeSVG value={JSON.stringify({ jobId: qrModal.jobId, timestamp: Date.now() })} size={200} bgColor="#ffffff" fgColor="#000000" level="H" /></div>
              <p className="text-xs text-violet font-mono animate-pulse">Awaiting scans...</p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
