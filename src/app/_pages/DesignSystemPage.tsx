"use client";

import { MapPin, Navigation, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export function DesignSystemPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Design System</h1>
          <p className="text-slate-500">Panduan gaya dan komponen UI untuk LesMap Samarinda.</p>
        </div>

        {/* Colors */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-blue-600 shadow-sm"></div>
              <div className="text-sm font-bold text-slate-900">Primary Blue</div>
              <div className="text-xs text-slate-500">#2563EB (blue-600)</div>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-green-600 shadow-sm"></div>
              <div className="text-sm font-bold text-slate-900">Success Green</div>
              <div className="text-xs text-slate-500">#16A34A (green-600)</div>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-slate-900 shadow-sm"></div>
              <div className="text-sm font-bold text-slate-900">Text Dark</div>
              <div className="text-xs text-slate-500">#0F172A (slate-900)</div>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-slate-50 border border-slate-200 shadow-sm"></div>
              <div className="text-sm font-bold text-slate-900">Background</div>
              <div className="text-xs text-slate-500">#F8FAFC (slate-50)</div>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-yellow-400 shadow-sm"></div>
              <div className="text-sm font-bold text-slate-900">Warning</div>
              <div className="text-xs text-slate-500">#FACC15 (yellow-400)</div>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-red-600 shadow-sm"></div>
              <div className="text-sm font-bold text-slate-900">Danger</div>
              <div className="text-xs text-slate-500">#DC2626 (red-600)</div>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-slate-500 shadow-sm"></div>
              <div className="text-sm font-bold text-slate-900">Muted Text</div>
              <div className="text-xs text-slate-500">#64748B (slate-500)</div>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-slate-200 shadow-sm"></div>
              <div className="text-sm font-bold text-slate-900">Border</div>
              <div className="text-xs text-slate-500">#E2E8F0 (slate-200)</div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">Typography (Inter)</h2>
          <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200">
            <div>
              <div className="text-xs text-slate-400 mb-1">Heading 1 (text-4xl, font-extrabold)</div>
              <h1 className="text-4xl font-extrabold text-slate-900">Cari Tempat Les Terdekat</h1>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Heading 2 (text-2xl, font-bold)</div>
              <h2 className="text-2xl font-bold text-slate-900">Eksplorasi Peta Kursus</h2>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Heading 3 (text-lg, font-bold)</div>
              <h3 className="text-lg font-bold text-slate-900">English Juanda Course</h3>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Body Text (text-base, text-slate-600)</div>
              <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                Temukan kursus bahasa Inggris, coding, musik, bimbel, komputer, dan desain grafis berdasarkan lokasi dan landmark dengan mudah.
              </p>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Small Text (text-sm, font-medium)</div>
              <p className="text-sm font-medium text-slate-500">350 meter dari UMKT</p>
            </div>
          </div>
        </section>

        {/* Buttons & Inputs */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">Buttons & Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-700 text-sm mb-4">Buttons</h3>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm">
                Primary Button
              </button>
              
              <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-3 px-6 rounded-xl transition-colors">
                Secondary Button
              </button>

              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm">
                Success Button
              </button>
            </div>

            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-700 text-sm mb-4">Inputs</h3>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Standard Input</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="Placeholder text..." />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Search Input</label>
                <div className="flex items-center w-full px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <input type="text" className="w-full bg-transparent border-none outline-none text-sm text-slate-700" placeholder="Search..." />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Badges & Markers */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">Badges & Map Markers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-700 text-sm mb-4">Status & Category Badges</h3>
              
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Bahasa Inggris</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">Coding</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">Desain Grafis</span>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
                  <CheckCircle className="w-3 h-3" /> Approved
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-md">
                  <AlertCircle className="w-3 h-3" /> Pending
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-md">
                  <XCircle className="w-3 h-3" /> Rejected
                </span>
              </div>
            </div>

            <div className="space-y-4 bg-[#EBF4FA] p-6 rounded-2xl border border-slate-200 relative overflow-hidden">
              <h3 className="font-bold text-slate-700 text-sm mb-4 relative z-10">Map Markers</h3>
              
              <div className="flex gap-8 items-end h-24 relative z-10">
                <div className="flex flex-col items-center">
                  <div className="bg-green-600 p-1.5 rounded-full shadow-md border-2 border-white">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium mt-2">Course (Normal)</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-blue-600 p-1.5 rounded-full shadow-md border-2 border-white scale-125">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium mt-3">Course (Active)</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-yellow-400 p-1.5 rounded-full shadow-md border-2 border-white">
                    <Navigation className="w-4 h-4 text-slate-800" />
                  </div>
                  <span className="text-xs font-medium mt-2">Landmark</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}