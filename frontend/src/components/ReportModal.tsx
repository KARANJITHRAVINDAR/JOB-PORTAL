import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reporterId: string;
  reportedId: string;
  jobId?: string;
  targetType: 'worker' | 'employer';
}

export default function ReportModal({ isOpen, onClose, reporterId, reportedId, jobId, targetType }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return alert('Please provide a reason');
    
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:4000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporter_id: reporterId,
          reported_id: reportedId,
          job_id: jobId,
          reason
        })
      });

      if (res.ok) {
        alert('Report submitted successfully. We will review it shortly.');
        onClose();
        setReason('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting report');
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md relative rounded-2xl p-[1px]"
            style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(42,41,56,0.2) 100%)' }}
          >
            <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(21,20,31,0.95), rgba(28,27,41,0.9))' }}>
              <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-6 text-red-400">
                <AlertTriangle size={24} />
                <h2 className="text-xl font-display font-bold text-text-primary">Report {targetType === 'worker' ? 'Worker' : 'Employer'}</h2>
              </div>
              
              <p className="text-text-muted text-sm mb-4">
                Please describe the issue you faced with this {targetType}. This helps us maintain a safe community.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="What went wrong?"
                  className="w-full h-32 rounded-xl p-3 text-text-primary focus:outline-none resize-none text-sm placeholder:text-text-muted/50"
                  style={{ background: 'rgba(11,11,20,0.6)', border: '1px solid rgba(42,41,56,0.6)' }}
                  required
                />
                
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-surface-raised transition-colors text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-full transition-all text-sm font-semibold flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff', boxShadow: '0 4px 15px rgba(239,68,68,0.2)' }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
