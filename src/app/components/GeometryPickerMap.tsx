"use client";

// GeometryPickerMap — client-only. Import via DynamicGeometryPickerMap (ssr:false).
//
// Root-cause audit (why draw results didn't appear):
// 1. `require("leaflet-draw")` at module top ran during SSR eval → L.Draw undefined on mount.
// 2. toGeoJSON() returns a GeoJSON *Feature* ({type:"Feature",geometry:{...}}),
//    but onChange received the whole Feature instead of just the geometry object.
//    → isValidGeometry() in parent always returned false → geometry cleared on every draw.
// 3. Mode-switch effect ran before FeatureGroup was initialised (race condition).
//
// Fix: lazy-load leaflet-draw inside useEffect, extract .geometry from toGeoJSON(),
//      use a single imperative map instance (no react-leaflet hooks needed here).

import { useEffect, useRef } from "react";
import type { GeometryType, GeoJSONGeometry } from "@/lib/geometry";

// Samarinda center
const SAMARINDA_LAT = -0.5022;
const SAMARINDA_LNG = 117.1536;

// Path-options for drawn shapes
const DRAW_STYLE = { color: "#2563eb", weight: 3, fillColor: "#2563eb", fillOpacity: 0.15 };

export interface GeometryPickerMapProps {
  mode: GeometryType;
  initialGeojson?: GeoJSONGeometry | null;
  onChange: (geojson: GeoJSONGeometry | null) => void;
  className?: string;
}

export function GeometryPickerMap({
  mode,
  initialGeojson,
  onChange,
  className = "",
}: GeometryPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // We store imperative Leaflet references here so React re-renders don't recreate them
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);          // L.Map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drawnRef = useRef<any>(null);        // L.FeatureGroup (drawn items)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlRef = useRef<any>(null);      // L.Control.Draw
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlerRef = useRef<any>(null);      // active draw handler
  const modeRef = useRef<GeometryType>(mode);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange; // always fresh

  // ── 1. Mount map & load leaflet-draw lazily (once) ──────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let destroyed = false;

    async function init() {
      // Dynamic import keeps leaflet-draw out of SSR bundle entirely
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      await import("leaflet-draw/dist/leaflet.draw.css");
      await import("leaflet-draw");

      if (destroyed || !containerRef.current) return;

      // Fix default marker icon
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:
          "data:image/svg+xml;base64," +
          btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path fill="#2563eb" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9 12.5 28.5 12.5 28.5S25 21.5 25 12.5C25 5.6 19.4 0 12.5 0z"/><circle fill="white" cx="12.5" cy="12.5" r="5"/></svg>`),
        iconRetinaUrl:
          "data:image/svg+xml;base64," +
          btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path fill="#2563eb" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9 12.5 28.5 12.5 28.5S25 21.5 25 12.5C25 5.6 19.4 0 12.5 0z"/><circle fill="white" cx="12.5" cy="12.5" r="5"/></svg>`),
        shadowUrl: "",
      });

      // Create map
      const map = L.map(containerRef.current!, {
        center: [SAMARINDA_LAT, SAMARINDA_LNG],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // FeatureGroup that holds drawn items
      const drawn = new L.FeatureGroup();
      drawn.addTo(map);
      drawnRef.current = drawn;

      // Draw control (edit toolbar only; draw tools added imperatively per-mode)
      const control = new (L as any).Control.Draw({
        edit: { featureGroup: drawn },
        draw: false,
      });
      control.addTo(map);
      controlRef.current = control;

      // ── draw:created — THE critical handler ─────────────────────────────────
      map.on((L as any).Draw.Event.CREATED, (e: any) => {
        const layer = e.layer;

        // 1. Clear old drawn layer
        drawn.clearLayers();

        // 2. Add new layer to FeatureGroup so it appears on map immediately
        drawn.addLayer(layer);

        // 3. Extract geometry (toGeoJSON returns a Feature; we want .geometry)
        const feature = layer.toGeoJSON?.();
        const geojson: GeoJSONGeometry | null = feature?.geometry ?? null;

        // 4. Notify parent
        onChangeRef.current(geojson);
      });

      map.on((L as any).Draw.Event.DELETED, () => {
        if (drawn.getLayers().length === 0) onChangeRef.current(null);
      });

      map.on((L as any).Draw.Event.EDITED, () => {
        const layers = drawn.getLayers();
        if (!layers.length) { onChangeRef.current(null); return; }
        const feature = (layers[0] as any).toGeoJSON?.();
        const geojson: GeoJSONGeometry | null = feature?.geometry ?? null;
        onChangeRef.current(geojson);
      });

      mapRef.current = map;

      // Load initial geometry after map is ready
      loadGeometry(L, drawn, initialGeojson ?? null);

      // Activate the current mode
      activateMode(L, map, modeRef.current);
    }

    init();

    return () => {
      destroyed = true;
      if (handlerRef.current) {
        try { handlerRef.current.disable(); } catch { /* noop */ }
        handlerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        drawnRef.current = null;
        controlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-only

  // ── 2. React to mode changes ─────────────────────────────────────────────────
  useEffect(() => {
    modeRef.current = mode;
    if (!mapRef.current) return; // map not ready yet; init() will call activateMode
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    import("leaflet").then(({ default: L }) => {
      activateMode(L, mapRef.current, mode);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ── 3. Load initial/updated geometry from parent ─────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !drawnRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    import("leaflet").then(({ default: L }) => {
      loadGeometry(L, drawnRef.current, initialGeojson ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialGeojson]);

  return (
    <div className={`relative ${className}`} style={{ minHeight: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <style>{`
        .leaflet-draw-toolbar a { border-radius: 6px !important; }
        .leaflet-container { font-family: Inter, system-ui, sans-serif; }
        /* Ensure draw tooltip visible */
        .leaflet-draw-tooltip { font-size: 12px; }
      `}</style>
    </div>
  );
}

// ── Helpers (module-level, no closure) ────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadGeometry(L: any, drawn: any, geojson: GeoJSONGeometry | null) {
  if (!drawn) return;
  drawn.clearLayers();
  if (!geojson) return;
  try {
    const layer = L.geoJSON(geojson, {
      style: DRAW_STYLE,
      pointToLayer: (_: unknown, latlng: unknown) =>
        L.circleMarker(latlng, {
          radius: 8,
          fillColor: "#2563eb",
          color: "white",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }),
    });
    layer.eachLayer((l: unknown) => drawn.addLayer(l));
  } catch {
    // malformed geojson — ignore
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function activateMode(L: any, map: any, mode: GeometryType) {
  // Cancel any running handler first
  if (handlerRef_global.current) {
    try { handlerRef_global.current.disable(); } catch { /* noop */ }
    handlerRef_global.current = null;
  }
  if (!map || !(L as any).Draw) return;

  let handler: any = null;

  if (mode === "point") {
    handler = new (L as any).Draw.Marker(map, {
      icon: L.divIcon({
        html: `<div style="width:22px;height:22px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(37,99,235,0.5)"></div>`,
        className: "",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    });
  } else if (mode === "line") {
    handler = new (L as any).Draw.Polyline(map, {
      shapeOptions: { color: "#2563eb", weight: 3, opacity: 0.9 },
    });
  } else if (mode === "polygon") {
    handler = new (L as any).Draw.Polygon(map, {
      shapeOptions: { color: "#2563eb", weight: 2, fillColor: "#2563eb", fillOpacity: 0.15 },
    });
  }

  if (handler) {
    handlerRef_global.current = handler;
    handler.enable();
  }
}

// Module-level ref to track the active draw handler across React renders
// (cannot use useRef here since this is a plain function, not a component)
// ponytail: global module ref — safe because only one map instance exists at a time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlerRef_global = { current: null as any };
