"use client";

// GeometryPickerMap — inner component (must only run client-side, no SSR)
// Uses leaflet-draw for Point / Line / Polygon drawing.
// Import via DynamicGeometryPickerMap to avoid "window is not defined".

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("leaflet-draw");
import type { GeometryType, GeoJSONGeometry } from "@/lib/geometry";

// leaflet-draw layers expose toGeoJSON — typed via this local interface
type GeoJSONLayer = L.Layer & { toGeoJSON?: () => GeoJSONGeometry };

// ─── Samarinda defaults ──────────────────────────────────────────────────────
const SAMARINDA: [number, number] = [-0.5022, 117.1536];

// ─── Fix Leaflet default icon (same as LeafletMap.tsx) ─────────────────────
function fixLeafletDefaultIcon() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path fill="#2563eb" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9 12.5 28.5 12.5 28.5S25 21.5 25 12.5C25 5.6 19.4 0 12.5 0z"/><circle fill="white" cx="12.5" cy="12.5" r="5"/></svg>`
      ),
    iconRetinaUrl:
      "data:image/svg+xml;base64," +
      btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path fill="#2563eb" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9 12.5 28.5 12.5 28.5S25 21.5 25 12.5C25 5.6 19.4 0 12.5 0z"/><circle fill="white" cx="12.5" cy="12.5" r="5"/></svg>`
      ),
    shadowUrl: "",
  });
}

// ─── Draw controller inner component ────────────────────────────────────────
interface DrawControlProps {
  mode: GeometryType;
  initialGeojson?: GeoJSONGeometry | null;
  onChange: (geojson: GeoJSONGeometry | null) => void;
}

function DrawControl({ mode, initialGeojson, onChange }: DrawControlProps) {
  const map = useMap();
  const drawnLayersRef = useRef<L.FeatureGroup | null>(null);
  const drawHandlerRef = useRef<L.Draw.Feature | null>(null);

  // Initialise feature group once
  useEffect(() => {
    if (drawnLayersRef.current) return;
    const fg = new L.FeatureGroup();
    fg.addTo(map);
    drawnLayersRef.current = fg;

    // Load initial geometry if provided
    if (initialGeojson) {
      try {
        const layer = L.geoJSON(initialGeojson as Parameters<typeof L.geoJSON>[0]);
        layer.eachLayer((l) => fg.addLayer(l));
      } catch {
        // ignore malformed initial geojson
      }
    }

    // Listen for drawn shapes
    map.on(L.Draw.Event.CREATED, (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      fg.clearLayers();
      fg.addLayer(event.layer);
      const geojson = (event.layer as GeoJSONLayer).toGeoJSON?.();
      onChange(geojson ?? null);
    });

    map.on(L.Draw.Event.DELETED, () => {
      if (fg.getLayers().length === 0) onChange(null);
    });

    map.on(L.Draw.Event.EDITED, () => {
      const layers = fg.getLayers();
      if (layers.length === 0) {
        onChange(null);
        return;
      }
      const geojson = (layers[0] as GeoJSONLayer).toGeoJSON?.();
      onChange(geojson ?? null);
    });

    // Edit toolbar
    new L.Control.Draw({
      edit: { featureGroup: fg },
      draw: { circle: false, circlemarker: false, rectangle: false, marker: false, polyline: false, polygon: false },
    }).addTo(map);

    return () => {
      map.removeLayer(fg);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start drawing when mode changes
  useEffect(() => {
    // Cancel any active handler first
    if (drawHandlerRef.current) {
      try { drawHandlerRef.current.disable(); } catch { /* noop */ }
      drawHandlerRef.current = null;
    }

    const fg = drawnLayersRef.current;
    if (!fg) return;

    let handler: L.Draw.Feature | null = null;

    if (mode === "point") {
      handler = new L.Draw.Marker(map as L.DrawMap, {
        icon: L.divIcon({
          html: `<div style="width:20px;height:20px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(37,99,235,0.5)"></div>`,
          className: "",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      });
    } else if (mode === "line") {
      handler = new L.Draw.Polyline(map as L.DrawMap, {
        shapeOptions: { color: "#2563eb", weight: 3 },
      });
    } else if (mode === "polygon") {
      handler = new L.Draw.Polygon(map as L.DrawMap, {
        shapeOptions: { color: "#2563eb", weight: 2, fillColor: "#2563eb", fillOpacity: 0.15 },
      });
    }

    if (handler) {
      drawHandlerRef.current = handler;
      handler.enable();
    }

    return () => {
      if (handler) {
        try { handler.disable(); } catch { /* noop */ }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return null;
}

// ─── Public component props ──────────────────────────────────────────────────
export interface GeometryPickerMapProps {
  mode: GeometryType;
  initialGeojson?: GeoJSONGeometry | null;
  onChange: (geojson: GeoJSONGeometry | null) => void;
  className?: string;
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function GeometryPickerMap({
  mode,
  initialGeojson,
  onChange,
  className = "",
}: GeometryPickerMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fixLeafletDefaultIcon();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <MapContainer
        center={SAMARINDA}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <DrawControl
          mode={mode}
          initialGeojson={initialGeojson}
          onChange={onChange}
        />
      </MapContainer>

      <style>{`
        .leaflet-draw-toolbar a {
          border-radius: 6px !important;
        }
        .leaflet-draw-section {
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .leaflet-container {
          font-family: Inter, system-ui, sans-serif;
        }
      `}</style>
    </div>
  );
}
