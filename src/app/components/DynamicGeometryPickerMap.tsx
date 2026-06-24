"use client";

import dynamic from "next/dynamic";
import type { GeometryPickerMapProps } from "./GeometryPickerMap";

// SSR-safe wrapper — prevents "window is not defined" from leaflet-draw
const GeometryPickerMap = dynamic(
  () => import("./GeometryPickerMap").then((m) => m.GeometryPickerMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-xl overflow-hidden flex items-center justify-center bg-slate-100"
        style={{ height: "100%" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontFamily: "Inter, system-ui, sans-serif", fontSize: "14px" }}>
          <div style={{ width: "18px", height: "18px", border: "2px solid #cbd5e1", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          Memuat peta...
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
  }
);

export function DynamicGeometryPickerMap(props: GeometryPickerMapProps) {
  return <GeometryPickerMap {...props} />;
}
