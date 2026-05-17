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

export default function RadarMap({ markers = [], center = [11.6643, 78.1460] }: any) {
  useEffect(() => {
    // Leaflet CSS needs to be loaded globally or here
    import('leaflet/dist/leaflet.css');
  }, []);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 z-0 relative isolate">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m: any, i: number) => (
          <Marker key={i} position={m.position}>
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
