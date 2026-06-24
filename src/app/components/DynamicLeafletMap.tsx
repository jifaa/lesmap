"use client";

import dynamic from "next/dynamic";
import type { LeafletMapProps } from "./LeafletMap";

// LeafletMap is SSR-safe via "use client" and dynamic import.
// Dynamic import with ssr: false prevents server-side rendering,
// which avoids "window is not defined" errors since Leaflet
// requires the DOM.
const LeafletMap = dynamic(
  () => import("./LeafletMap").then((mod) => mod.LeafletMap),
  {
    ssr: false,
    // Show a loading skeleton while the map JS chunks load
    loading: () => (
      <div
        className="w-full h-full rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
          minHeight: "500px",
        }}
      >
        <div
          className="flex flex-col items-center justify-center h-full"
          style={{ gap: "16px" }}
        >
          {/* Simulated map grid lines */}
          <svg
            width="200"
            height="120"
            viewBox="0 0 200 120"
            style={{ opacity: 0.2 }}
          >
            <line
              x1="0"
              y1="40"
              x2="200"
              y2="50"
              stroke="#64748b"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="80"
              x2="200"
              y2="70"
              stroke="#64748b"
              strokeWidth="1"
            />
            <line
              x1="60"
              y1="0"
              x2="70"
              y2="120"
              stroke="#64748b"
              strokeWidth="1"
            />
            <line
              x1="130"
              y1="0"
              x2="120"
              y2="120"
              stroke="#64748b"
              strokeWidth="1"
            />
          </svg>

          {/* Loading indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#64748b",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "14px",
            }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                border: "2px solid #cbd5e1",
                borderTopColor: "#2563eb",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Memuat peta...
          </div>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    ),
  }
);

export function DynamicLeafletMap(props: LeafletMapProps) {
  return <LeafletMap {...props} />;
}
