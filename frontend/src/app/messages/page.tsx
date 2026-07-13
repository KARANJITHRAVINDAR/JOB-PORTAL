'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Image as ImageIcon, Languages, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Messages() {
  const [role, setRole] = useState<'seeker' | 'employer'>('seeker');
  const [messages, setMessages] = useState<{text: string, isMe: boolean, translated?: string}[]>([
    { text: 'I need 2 workers for unloading a truck. It will take 3 hours.', isMe: false, translated: 'எனக்கு 2 தொழிலாளர்கள் தேவை...' },
    { text: 'I am available! Where is the location?', isMe: true },
    { text: 'New bus stand, near the big grocery shop.', isMe: false, translated: 'புதிய பஸ் நிலையம்...' }
  ]);
  const [input, setInput] = useState('');
  const [isTranslating, setIsTranslating] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role) setRole(user.role.toLowerCase() as any);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, isMe: true }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { text: 'Ok, see you soon.', isMe: false, translated: 'சரி, விரைவில் சந்திப்போம்.' }]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto md:border-x" style={{ background: '#0B0B14', borderColor: 'rgba(42,41,56,0.4)' }}>
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 z-10"
        style={{ background: 'rgba(11,11,20,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(42,41,56,0.4)' }}>
        <div className="flex items-center gap-3">
          <Link href={role === 'employer' ? '/employer/dashboard' : '/seeker/dashboard'} className="md:hidden text-text-muted hover:text-text-primary">
            <ArrowLeft size={22} />
          </Link>
          <div className="w-10 h-10 rounded-xl overflow-hidden relative"
            style={{ border: '2px solid rgba(139,92,246,0.3)' }}>
            <img src="https://i.pravatar.cc/150?u=a042581f4" alt="avatar" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
              style={{ background: '#34D399', border: '2px solid #0B0B14' }} />
          </div>
          <div>
            <h2 className="font-display font-semibold text-sm text-text-primary">{role === 'employer' ? 'Kumar (Electrician)' : 'Senthil Kumar (Contractor)'}</h2>
            <p className="text-[10px] text-signal font-mono">Online</p>
          </div>
        </div>

        <button onClick={() => setIsTranslating(!isTranslating)}
          className="p-2 rounded-xl transition-all"
          style={isTranslating ? { background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#8B5CF6' } : { background: 'rgba(42,41,56,0.3)', color: '#8D8B9E' }}
          title="Toggle Auto-Translate">
          <Languages size={18} />
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-[10px] text-text-muted mb-6 font-mono px-4 py-2 mx-auto rounded-full w-fit"
          style={{ background: 'rgba(42,41,56,0.3)', border: '1px solid rgba(42,41,56,0.3)' }}>
          Job: Factory Electrical Wiring • Escrow: ₹1,500
        </div>

        {!isAccepted ? (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-text-primary">Chat Locked</h3>
              <p className="text-text-muted text-sm max-w-xs mt-1">
                You can only message after the employer has <strong className="text-text-primary">ACCEPTED</strong> your request.
              </p>
            </div>
            <button onClick={() => setIsAccepted(true)} className="text-xs text-violet mt-4 underline opacity-50 hover:opacity-100 font-mono">
              (Demo: Click to Accept)
            </button>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%] rounded-2xl p-3.5"
                style={msg.isMe ? {
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(109,79,196,0.3))',
                  border: '1px solid rgba(139,92,246,0.3)',
                  borderTopRightRadius: '4px',
                } : {
                  background: 'rgba(21,20,31,0.8)',
                  border: '1px solid rgba(42,41,56,0.4)',
                  borderTopLeftRadius: '4px',
                }}>
                <p className="text-sm text-text-primary">{msg.text}</p>
                {isTranslating && !msg.isMe && msg.translated && (
                  <div className="mt-2 pt-2 text-xs font-medium" style={{ borderTop: '1px solid rgba(42,41,56,0.4)', color: '#34D399' }}>
                    {msg.translated}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </main>

      {/* Input Footer */}
      <footer className={`p-4 transition-opacity ${!isAccepted ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ background: 'rgba(11,11,20,0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(42,41,56,0.4)' }}>
        <div className="flex items-end gap-2">
          <button className="p-3 text-text-muted hover:text-text-primary transition-colors shrink-0" disabled={!isAccepted}>
            <ImageIcon size={22} />
          </button>

          <div className="flex-1 rounded-2xl overflow-hidden relative"
            style={{ background: 'rgba(42,41,56,0.3)', border: '1px solid rgba(42,41,56,0.4)' }}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..." rows={1} disabled={!isAccepted}
              className="w-full bg-transparent p-3 pr-12 text-text-primary placeholder:text-text-muted/50 focus:outline-none resize-none max-h-32 text-sm" />
            {input.length === 0 && (
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors text-violet hover:bg-violet/10" disabled={!isAccepted}>
                <Mic size={18} />
              </button>
            )}
          </div>

          {input.length > 0 && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleSend} disabled={!isAccepted}
              className="p-3 rounded-full shrink-0 text-white"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D4FC4)', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
              <Send size={18} className="ml-0.5" />
            </motion.button>
          )}
        </div>
      </footer>
    </div>
  );
}
