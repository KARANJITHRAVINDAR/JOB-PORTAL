'use client';

import { useState, useEffect } from 'react';
import { Mic, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function VoiceAssistant({ onIntentParsed }: { onIntentParsed: (category: string) => void }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusText, setStatusText] = useState('Listening...');

  const processTranscript = (text: string) => {
    // Basic local NLP mocking intent extraction to avoid API keys
    const lowerText = text.toLowerCase();
    
    // Map keywords to categories
    const categories: Record<string, string[]> = {
      'Electrician': ['electrician', 'electrical', 'wire', 'wiring', 'plugs', 'minn', 'vidyut', 'current'],
      'Plumber': ['plumber', 'plumbing', 'pipe', 'leak', 'water', 'tanni', 'paani', 'kuzhai'],
      'Construction': ['construction', 'build', 'cement', 'labor', 'kothanar', 'mazdoor', 'builder'],
      'Delivery': ['delivery', 'driver', 'bike', 'parcel', 'food', 'deliver'],
      'Agriculture': ['agriculture', 'farm', 'tractor', 'field', 'vivasayam', 'kheti']
    };

    let matchedCategory = '';
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        matchedCategory = category;
        break;
      }
    }

    if (matchedCategory) {
      setStatusText(`Found match: ${matchedCategory}`);
      setTimeout(() => {
        onIntentParsed(matchedCategory);
        setIsOpen(false);
      }, 1500);
    } else {
      setStatusText("Sorry, couldn't match a job category. Try again.");
      setTimeout(() => setStatusText('Listening...'), 2000);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Works for english, and often picks up transliterated tamil/hindi or native if spoken clearly. Or we can dynamically switch based on user preference.
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setStatusText('Listening...');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          setTranscript(event.results[i][0].transcript);
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
        processTranscript(finalTranscript);
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setStatusText('Error: ' + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          startListening();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-neon-purple/20 hover:bg-neon-purple/40 p-2 rounded-xl border border-neon-purple/50 text-neon-purple transition-colors flex items-center justify-center z-10"
        title="Voice Search"
      >
        <Mic size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4 pb-24"
          >
            <motion.div 
              initial={{ y: 100, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.9 }}
              className="glass-card w-full max-w-md p-8 rounded-3xl border border-neon-purple/50 relative overflow-hidden flex flex-col items-center text-center"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="text-xl font-bold mb-6 text-white">Voice Assistant</h2>
              
              <div className="relative mb-8">
                {isListening && (
                  <div className="absolute inset-0 bg-neon-purple/30 rounded-full animate-ping scale-150"></div>
                )}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(176,38,255,0.5)] transition-colors duration-500 ${isListening ? 'bg-neon-purple text-white' : 'bg-gray-800 text-gray-400'}`}>
                  <Mic size={48} />
                </div>
              </div>

              <div className="min-h-[60px] flex flex-col justify-center">
                <p className="text-lg font-medium text-gray-200 mb-1">"{transcript || '...'}"</p>
                <p className={`text-sm ${statusText.includes('Error') || statusText.includes('Sorry') ? 'text-red-400' : 'text-neon-purple'}`}>
                  {statusText}
                </p>
              </div>

              {!isListening && !statusText.includes('match') && (
                <button 
                  onClick={startListening}
                  className="mt-6 px-6 py-2 rounded-full border border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white transition-colors"
                >
                  Tap to speak again
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
