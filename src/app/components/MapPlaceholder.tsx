import React from "react";
import { MapPin, Navigation, Info } from "lucide-react";

export interface MapMarker {
  id: string;
  lat: number; // roughly 0 to 100 as percentage
  lng: number; // roughly 0 to 100 as percentage
  title: string;
  type: "course" | "landmark";
  active?: boolean;
}

interface MapPlaceholderProps {
  markers?: MapMarker[];
  showRadius?: boolean;
  radiusCenter?: { lat: number; lng: number };
  className?: string;
}

export function MapPlaceholder({ markers = [], showRadius, radiusCenter, className = "" }: MapPlaceholderProps) {
  return (
    <div className={`relative bg-[#EBF4FA] overflow-hidden ${className}`}>
      {/* Abstract Map Background Elements */}
      {/* Mahakam River Simulation */}
      <svg className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M 0 60 Q 20 70 40 50 T 80 40 T 100 30 L 100 100 L 0 100 Z" fill="#D3E8F8" />
        <path d="M 0 62 Q 20 72 40 52 T 80 42 T 100 32 L 100 35 T 80 45 T 40 55 Q 20 75 0 65 Z" fill="#A8D0E6" opacity="0.6"/>
      </svg>
      
      {/* Roads Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M 20 0 L 30 100 M 0 30 L 100 40 M 60 0 L 50 100 M 0 70 L 100 60" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        <path d="M 25 0 L 35 100 M 0 35 L 100 45" stroke="#FFFFFF" strokeWidth="0.8" fill="none" strokeDasharray="2,2" />
      </svg>

      {/* Grid Pattern */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.3 }} />

      {/* Radius Circle (e.g. 500m around UMKT) */}
      {showRadius && radiusCenter && (
        <div 
          className="absolute rounded-full border-2 border-blue-500 bg-blue-500/10 animate-pulse-slow"
          style={{
            left: `${radiusCenter.lng}%`,
            top: `${radiusCenter.lat}%`,
            width: '30%', // Simulated 500m radius
            height: '30%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        >
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-600 rounded-full -translate-x-1/2 -translate-y-1/2 ring-4 ring-white shadow-sm" />
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-xs font-semibold text-blue-700 px-2 py-1 rounded shadow-sm border border-blue-100 whitespace-nowrap">
            Radius 500m
          </span>
        </div>
      )}

      {/* Markers */}
      {markers.map((marker) => (
        <div
          key={marker.id}
          className="absolute transform -translate-x-1/2 -translate-y-full group cursor-pointer"
          style={{ left: `${marker.lng}%`, top: `${marker.lat}%` }}
        >
          <div className="relative">
            {marker.type === "landmark" ? (
              <div className="flex flex-col items-center">
                <div className="bg-yellow-400 p-1.5 rounded-full shadow-md border-2 border-white relative z-10">
                  <Navigation className="w-4 h-4 text-slate-800" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className={`p-1.5 rounded-full shadow-md border-2 border-white relative z-10 transition-transform ${marker.active ? 'bg-blue-600 scale-125' : 'bg-green-600 group-hover:scale-110'}`}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            
            {/* Tooltip on hover / active */}
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-white rounded-lg shadow-lg border border-slate-100 p-2 text-center transition-all ${marker.active ? 'opacity-100 translate-y-0 z-20' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 z-20'}`}>
              <p className="text-xs font-bold text-slate-800 leading-tight">{marker.title}</p>
              {marker.type === 'course' && <p className="text-[10px] text-slate-500 mt-0.5">Tempat Les</p>}
              {marker.type === 'landmark' && <p className="text-[10px] text-yellow-600 font-medium mt-0.5">Landmark</p>}
              {/* Pointer arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-white" />
            </div>
          </div>
        </div>
      ))}

      {/* Map Controls (Fake) */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden flex flex-col">
          <button className="p-2 hover:bg-slate-50 text-slate-700 font-bold border-b border-slate-100">+</button>
          <button className="p-2 hover:bg-slate-50 text-slate-700 font-bold">-</button>
        </div>
        <button className="bg-white p-2 rounded-lg shadow-md border border-slate-200 hover:bg-slate-50 text-slate-700">
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      {/* Map Attribution (Fake) */}
      <div className="absolute bottom-1 left-1 bg-white/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-500">
        © LesMap Contributors • Data Samarinda
      </div>
    </div>
  );
}