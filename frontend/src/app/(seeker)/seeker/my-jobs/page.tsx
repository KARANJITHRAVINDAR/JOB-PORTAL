'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, IndianRupee, AlertTriangle, Phone, CheckCircle, Clock } from 'lucide-react';
import ReportModal from '@/components/ReportModal';
import Link from 'next/link';

export default function MyJobs() {
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applied' | 'selected' | 'completed'>('applied');
  const [reportModal, setReportModal] = useState({ isOpen: false, reportedId: '', jobId: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      fetchMyApplications(parsed.id);
    }
  }, []);

  const fetchMyApplications = async (workerId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/jobs/seeker/${workerId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const appliedJobs = applications.filter(a => a.status === 'PENDING' || a.status === 'QUEUED');
  const selectedJobs = applications.filter(a => a.status === 'ACCEPTED' && a.job_status !== 'COMPLETED');
  const completedJobs = applications.filter(a => a.status === 'COMPLETED' || a.job_status === 'COMPLETED');

  const renderJobs = (jobsList: any[], type: 'applied' | 'selected' | 'completed') => {
    if (jobsList.length === 0) {
      return (
        <div className="text-center py-10 glass-card text-gray-500">
          No jobs found in this category.
        </div>
      );
    }

    return jobsList.map((app) => (
      <motion.div 
        key={app.application_id} 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-xl">{app.title}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
              <span className="flex items-center gap-1"><Briefcase size={14}/> {app.category}</span>
              <span className="flex items-center gap-1 text-green-400"><IndianRupee size={14}/> {app.wage}</span>
              {app.negotiable ? (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">Negotiable</span>
              ) : null}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {type === 'applied' && <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Clock size={12}/> Pending</span>}
            {type === 'selected' && <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><CheckCircle size={12}/> Selected</span>}
            {type === 'completed' && <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-lg text-xs font-semibold uppercase tracking-wider">Completed</span>}
            
            {(type === 'selected' || type === 'completed') && (
              <button
                onClick={() => setReportModal({ isOpen: true, reportedId: app.employer_id, jobId: app.job_id })}
                className="text-red-400/70 hover:text-red-400 transition-colors text-xs flex items-center gap-1"
              >
                <AlertTriangle size={14} /> Report Employer
              </button>
            )}
          </div>
        </div>

        {(type === 'selected' || type === 'completed') && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            <h4 className="text-sm font-semibold text-gray-300">Employer Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-white/5">
                <span className="text-gray-400 w-16">Name:</span> 
                <span className="font-medium">{app.employer_name}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-white/5">
                <span className="text-gray-400 w-16">Contact:</span> 
                <span className="font-mono text-neon-blue">{app.employer_phone}</span>
                <a href={`tel:${app.employer_phone}`} className="ml-auto text-green-400 hover:text-green-300 p-1">
                  <Phone size={14} />
                </a>
              </div>
              <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-white/5 md:col-span-2">
                <span className="text-gray-400 w-16 flex items-center gap-1"><MapPin size={14}/> Location:</span> 
                <span className="text-gray-300">Lat: {Number(app.latitude || 0).toFixed(4)}, Lng: {Number(app.longitude || 0).toFixed(4)}</span>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${app.latitude},${app.longitude}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-neon-purple hover:underline text-xs">
                  View on Map
                </a>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <p className="text-sm text-gray-400 mt-1">Track your applications and active tasks.</p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('applied')}
          className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === 'applied' ? 'text-neon-purple border-neon-purple bg-neon-purple/5' : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}
        >
          Applied ({appliedJobs.length})
        </button>
        <button 
          onClick={() => setActiveTab('selected')}
          className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === 'selected' ? 'text-green-400 border-green-400 bg-green-400/5' : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}
        >
          Selected ({selectedJobs.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === 'completed' ? 'text-gray-300 border-gray-400 bg-gray-500/5' : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}
        >
          Completed ({completedJobs.length})
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading your jobs...</div>
        ) : (
          <>
            {activeTab === 'applied' && renderJobs(appliedJobs, 'applied')}
            {activeTab === 'selected' && renderJobs(selectedJobs, 'selected')}
            {activeTab === 'completed' && renderJobs(completedJobs, 'completed')}
          </>
        )}
      </div>

      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false, reportedId: '', jobId: '' })}
        reporterId={user?.id || ''}
        reportedId={reportModal.reportedId}
        jobId={reportModal.jobId}
        targetType="employer"
      />
    </div>
  );
}
