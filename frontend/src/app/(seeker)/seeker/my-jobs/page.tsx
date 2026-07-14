'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, IndianRupee, AlertTriangle, Phone, CheckCircle, Clock } from 'lucide-react';
import ReportModal from '@/components/ReportModal';
import Link from 'next/link';
import { FloatingOrbs, staggerContainer, fadeUp, PageHeader } from '@/components/DesignSystem';
import EmptyState from '@/components/EmptyState';
import { StatusTag } from '@/components/ui/DashboardStyles';

export default function MyJobs() {
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applied' | 'selected' | 'completed'>('applied');
  const [reportModal, setReportModal] = useState({ isOpen: false, reportedId: '', jobId: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) { const parsed = JSON.parse(userData); setUser(parsed); fetchMyApplications(parsed.id); }
  }, []);

  const fetchMyApplications = async (workerId: string) => {
    setLoading(true);
    try { const res = await fetch(`http://localhost:4000/api/jobs/seeker/${workerId}`); const data = await res.json(); if (Array.isArray(data)) setApplications(data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const appliedJobs = applications.filter(a => a.status === 'PENDING' || a.status === 'QUEUED');
  const selectedJobs = applications.filter(a => a.status === 'ACCEPTED' && a.job_status !== 'COMPLETED');
  const completedJobs = applications.filter(a => a.status === 'COMPLETED' || a.job_status === 'COMPLETED');

  const tabs = [
    { key: 'applied' as const, label: 'Applied', count: appliedJobs.length, color: '#F2A93B' },
    { key: 'selected' as const, label: 'Selected', count: selectedJobs.length, color: '#34D399' },
    { key: 'completed' as const, label: 'Completed', count: completedJobs.length, color: '#8D8B9E' },
  ];

  const getJobsList = () => {
    if (activeTab === 'applied') return appliedJobs;
    if (activeTab === 'selected') return selectedJobs;
    return completedJobs;
  };

  const statusBadge = (type: string) => {
    if (type === 'applied') return <StatusTag color="marigold">Pending</StatusTag>;
    if (type === 'selected') return <StatusTag color="signal">Selected</StatusTag>;
    return <StatusTag color="muted">Completed</StatusTag>;
  };


  return (
    <div className="relative min-h-screen pb-20">
      <FloatingOrbs />
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="relative z-10 max-w-4xl mx-auto space-y-6">

        <motion.div variants={fadeUp}>
          <PageHeader icon={Briefcase} title="My Jobs" subtitle="Track your applications and active tasks." />
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} className="flex rounded-xl overflow-hidden overflow-x-auto no-scrollbar"
          style={{ background: 'rgba(21,20,31,0.6)', border: '1px solid rgba(42,41,56,0.4)' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3.5 text-center font-medium text-sm transition-all relative whitespace-nowrap px-4 ${activeTab === tab.key ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
              style={activeTab === tab.key ? { background: `${tab.color}0A` } : {}}>
              {activeTab === tab.key && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full" style={{ background: tab.color }} />}
              {tab.label} ({tab.count})
            </button>
          ))}
        </motion.div>

        {/* Job Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-text-muted font-mono text-sm animate-pulse">Loading your jobs...</div>
          ) : getJobsList().length === 0 ? (
            <EmptyState
              title="No jobs found"
              description={`You have no jobs listed under the "${activeTab}" status right now.`}
              onEnableAlerts={() => window.location.href = '/seeker/jobs'}
            />
          ) : getJobsList().map((app) => (
            <motion.div key={app.application_id} variants={fadeUp} className="glass-card relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-display font-bold text-xl text-text-primary">{app.title}</h3>
                  <div className="flex items-center gap-3 text-sm mt-1.5">
                    <span className="flex items-center gap-1 text-violet font-mono text-xs"><Briefcase size={12} /> {app.category}</span>
                    <span className="flex items-center gap-1 text-signal font-mono text-xs"><IndianRupee size={12} /> {app.wage}</span>
                    {app.negotiable && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium"
                        style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#8B5CF6' }}>Negotiable</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {statusBadge(activeTab)}
                  {(activeTab === 'selected' || activeTab === 'completed') && (
                    <button onClick={() => setReportModal({ isOpen: true, reportedId: app.employer_id, jobId: app.job_id })}
                      className="text-xs flex items-center gap-1 transition-all" style={{ color: 'rgba(248,113,113,0.6)' }}>
                      <AlertTriangle size={12} /> Report
                    </button>
                  )}
                </div>
              </div>

              {(activeTab === 'selected' || activeTab === 'completed') && (
                <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid rgba(42,41,56,0.3)' }}>
                  <h4 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider font-mono">Employer Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl"
                      style={{ background: 'rgba(11,11,20,0.4)', border: '1px solid rgba(42,41,56,0.3)' }}>
                      <span className="text-text-muted text-xs w-14">Name:</span>
                      <span className="font-medium text-text-primary">{app.employer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl"
                      style={{ background: 'rgba(11,11,20,0.4)', border: '1px solid rgba(42,41,56,0.3)' }}>
                      <span className="text-text-muted text-xs w-14">Contact:</span>
                      <span className="font-mono text-violet text-xs">{app.employer_phone}</span>
                      <a href={`tel:${app.employer_phone}`} className="ml-auto text-signal hover:text-signal/80 p-1"><Phone size={13} /></a>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl md:col-span-2"
                      style={{ background: 'rgba(11,11,20,0.4)', border: '1px solid rgba(42,41,56,0.3)' }}>
                      <span className="text-text-muted text-xs flex items-center gap-1"><MapPin size={11} /> Location:</span>
                      <span className="text-text-muted text-xs">Lat: {Number(app.latitude || 0).toFixed(4)}, Lng: {Number(app.longitude || 0).toFixed(4)}</span>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${app.latitude},${app.longitude}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-violet hover:underline text-xs font-mono">
                        View Map
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <ReportModal isOpen={reportModal.isOpen} onClose={() => setReportModal({ isOpen: false, reportedId: '', jobId: '' })} reporterId={user?.id || ''} reportedId={reportModal.reportedId} jobId={reportModal.jobId} targetType="employer" />
      </motion.div>
    </div>
  );
}
