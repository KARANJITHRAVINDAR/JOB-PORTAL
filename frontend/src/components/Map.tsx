'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function RadarMap({ markers = [], center = [11.6643, 78.1460], userPosition = null }: any) {
  useEffect(() => {
    // Leaflet CSS needs to be loaded globally or here
    import('leaflet/dist/leaflet.css');
  }, []);

  let customIcon: any = null;
  let userIcon: any = null;
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    customIcon = L.divIcon({
      className: 'bg-transparent border-none',
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute inset-0 bg-violet rounded-full blur-md opacity-50 animate-pulse"></div>
          <div class="relative w-4 h-4 bg-violet rounded-full border-2 border-white shadow-[0_0_15px_rgba(139,92,246,0.8)]"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
    userIcon = L.divIcon({
      className: 'bg-transparent border-none',
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute inset-0 bg-signal rounded-full blur-md opacity-60 animate-ping"></div>
          <div class="relative w-5 h-5 bg-signal rounded-full border-[3px] border-white shadow-[0_0_20px_rgba(52,211,153,0.9)]"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 z-0 relative isolate">
      <MapContainer 
        center={userPosition || center} 
        zoom={13} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userPosition && (
          <Marker position={userPosition} icon={userIcon || undefined}>
            <Popup>
              <div className="text-black p-1 font-sans">
                <h3 className="font-bold text-signal">You are here</h3>
                <p className="text-xs text-text-muted">Live Location</p>
              </div>
            </Popup>
          </Marker>
        )}
        {markers.map((m: any, i: number) => (
          <Marker key={i} position={m.position} icon={customIcon || undefined}>
            <Popup>
              <div className="text-black p-1">
                <h3 className="font-bold">{m.title}</h3>
                <p className="text-sm">{m.desc}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
