'use client';

import { motion } from 'framer-motion';
import { MapPin, Users, Settings2 } from 'lucide-react';
import RadarMap from '@/components/Map';

export default function WorkerRadar() {
  const dummyMarkers = [
    { position: [11.6643, 78.1460], title: 'Suresh', desc: 'Electrician (98% Trust)' },
    { position: [11.6600, 78.1500], title: 'Ramesh', desc: 'Plumber' },
    { position: [11.6700, 78.1400], title: 'Gopal', desc: 'Construction Helper' },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col gap-4 animate-in fade-in">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-neon-blue" /> Live Worker Radar
          </h1>
          <p className="text-sm text-gray-400 mt-1">Discover and ping workers nearby</p>
        </div>
        <button className="bg-white/5 border border-white/10 p-2 rounded-xl text-gray-400 hover:text-white transition-colors">
          <Settings2 size={20} />
        </button>
      </header>

      <div className="flex-1 glass-card p-1 md:p-2 relative">
        {/* Overlay Stats */}
        <div className="absolute top-4 left-4 z-10 glass-card bg-black/60 p-4 border-neon-purple/30 max-w-[200px] pointer-events-none hidden md:block">
          <h3 className="text-sm font-semibold text-neon-blue">Current Area</h3>
          <p className="text-2xl font-bold mt-1">45</p>
          <p className="text-xs text-gray-400">Total Workers Active</p>
        </div>
        
        {/* The Map Component */}
        <RadarMap markers={dummyMarkers} center={[11.6643, 78.1460]} />
      </div>
    </div>
  );
}
