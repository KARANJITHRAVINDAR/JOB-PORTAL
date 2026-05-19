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
            className="glass-card w-full max-w-md relative bg-gray-900 border-red-500/20"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6 text-red-400">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-bold">Report {targetType === 'worker' ? 'Worker' : 'Employer'}</h2>
            </div>
            
            <p className="text-gray-300 text-sm mb-4">
              Please describe the issue you faced with this {targetType}. This helps us maintain a safe community.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What went wrong?"
                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 resize-none"
                required
              />
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-xl transition-colors text-sm font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
