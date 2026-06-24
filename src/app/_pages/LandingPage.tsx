"use client";

import { Search, BookOpen, MonitorPlay, Code, Music, PenTool, Map as MapIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { MapPlaceholder } from "../components/MapPlaceholder";

export function LandingPage() {
  const categories = [
    { name: "Bahasa Inggris", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Coding", icon: <Code className="w-5 h-5" /> },
    { name: "Bimbel", icon: <MonitorPlay className="w-5 h-5" /> },
    { name: "Musik", icon: <Music className="w-5 h-5" /> },
    { name: "Komputer", icon: <MonitorPlay className="w-5 h-5" /> },
    { name: "Desain Grafis", icon: <PenTool className="w-5 h-5" /> },
  ];

  const mapMarkers = [
    { id: "1", lat: 40, lng: 30, title: "UMKT", type: "landmark" as const },
    { id: "2", lat: 60, lng: 70, title: "Big Mall Samarinda", type: "landmark" as const },
    { id: "3", lat: 45, lng: 50, title: "Taman Samarendah", type: "landmark" as const },
    { id: "4", lat: 35, lng: 45, title: "Islamic Center Samarinda", type: "landmark" as const },
    { id: "5", lat: 42, lng: 35, title: "English Juanda Course", type: "course" as const, active: true },
    { id: "6", lat: 45, lng: 25, title: "UMKT English Corner", type: "course" as const },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0 bg-blue-50/50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Cari Tempat Les Terdekat di <span className="text-blue-600">Samarinda</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Temukan kursus bahasa Inggris, coding, musik, bimbel, komputer, dan desain grafis berdasarkan lokasi dan landmark dengan mudah.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white p-2 md:p-3 rounded-2xl shadow-lg border border-slate-200 flex flex-col md:flex-row items-center gap-3 max-w-2xl mx-auto">
              <div className="flex-1 flex items-center w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                <Search className="w-5 h-5 text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Cari les bahasa Inggris dekat UMKT 500 meter" 
                  className="w-full bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
              <Link href="/search" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors text-center whitespace-nowrap shadow-md shadow-blue-200">
                Cari Sekarang
              </Link>
            </div>
            
            {/* Category Chips */}
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button key={cat.name} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Preview & Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm mb-6">
              <MapIcon className="w-4 h-4" /> WebGIS Explorer
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Eksplorasi Peta Kursus Interaktif</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              LesMap memudahkan Anda mencari tempat kursus dengan radius tertentu dari lokasi Anda atau landmark populer di Samarinda. Lihat detail, bandingkan harga, dan temukan rute tercepat.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">8+</div>
                <div className="text-sm font-medium text-slate-500">Tempat Kursus</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-1">5</div>
                <div className="text-sm font-medium text-slate-500">Landmark</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">6</div>
                <div className="text-sm font-medium text-slate-500">Kategori</div>
              </div>
            </div>
            
            <Link href="/search" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
              Buka Peta Penuh <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-green-50 rounded-3xl transform rotate-3 scale-105" />
            <div className="relative bg-white p-2 rounded-3xl shadow-xl border border-slate-200 overflow-hidden h-[450px]">
              <MapPlaceholder markers={mapMarkers} className="w-full h-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}