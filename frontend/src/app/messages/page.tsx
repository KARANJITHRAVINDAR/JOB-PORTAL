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
  const [isAccepted, setIsAccepted] = useState(false); // Default to false to show the lock logic

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role) {
      setRole(user.role.toLowerCase() as any);
    }
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, isMe: true }]);
    setInput('');
    
    // Simulate reply
    setTimeout(() => {
      setMessages(prev => [...prev, { text: 'Ok, see you soon.', isMe: false, translated: 'சரி, விரைவில் சந்திப்போம்.' }]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-deep-black text-white max-w-2xl mx-auto md:border-x border-white/10">
      <header className="bg-black/60 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-10 pt-safe">
        <div className="flex items-center gap-3">
          <Link href={role === 'employer' ? '/employer/dashboard' : '/seeker/dashboard'} className="md:hidden">
            <ArrowLeft size={24} />
          </Link>
          <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-neon-purple overflow-hidden relative">
            <img src="https://i.pravatar.cc/150?u=a042581f4" alt="avatar" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
          </div>
          <div>
            <h2 className="font-semibold">{role === 'employer' ? 'Kumar (Electrician)' : 'Senthil Kumar (Contractor)'}</h2>
            <p className="text-xs text-neon-blue">Online</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsTranslating(!isTranslating)}
          className={`p-2 rounded-full transition-colors ${isTranslating ? 'bg-neon-purple/20 text-neon-purple' : 'bg-white/5 text-gray-400'}`}
          title="Toggle Auto-Translate"
        >
          <Languages size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="text-center text-xs text-gray-500 mb-6 font-mono">
          Job: Factory Electrical Wiring • Escrow: ₹1,500
        </div>
        
        {!isAccepted ? (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Chat Locked</h3>
              <p className="text-gray-400 text-sm max-w-xs mt-1">
                You can only message the employer after they have <strong>ACCEPTED</strong> your work request.
              </p>
            </div>
            <button onClick={() => setIsAccepted(true)} className="text-xs text-neon-blue mt-4 underline opacity-50 hover:opacity-100">
              (Demo: Click to Accept)
            </button>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-3 ${msg.isMe ? 'bg-neon-purple/80 text-white rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm border border-white/10'}`}>
                <p className="text-sm">{msg.text}</p>
                {isTranslating && !msg.isMe && msg.translated && (
                  <div className="mt-2 pt-2 border-t border-white/20 text-xs text-neon-blue font-medium">
                    {msg.translated}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </main>

      <footer className={`bg-black/80 backdrop-blur-xl border-t border-white/10 p-4 pb-safe transition-opacity ${!isAccepted ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        <div className="flex items-end gap-2">
          <button className="p-3 text-gray-400 hover:text-white transition-colors shrink-0" disabled={!isAccepted}>
            <ImageIcon size={24} />
          </button>
          
          <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-transparent p-3 pr-12 text-white focus:outline-none resize-none max-h-32"
              rows={1}
              disabled={!isAccepted}
            />
            {input.length === 0 ? (
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neon-purple hover:bg-neon-purple/10 rounded-full transition-colors" disabled={!isAccepted}>
                <Mic size={20} />
              </button>
            ) : null}
          </div>

          {input.length > 0 ? (
            <button 
              onClick={handleSend}
              disabled={!isAccepted}
              className="p-3 bg-neon-purple text-white rounded-full hover:bg-neon-purple/80 transition-colors shrink-0 shadow-[0_0_15px_rgba(176,38,255,0.4)]"
            >
              <Send size={20} className="ml-1" />
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
