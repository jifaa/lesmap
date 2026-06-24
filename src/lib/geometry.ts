// ponytail: small pure helpers for GeoJSON geometry — no class, no abstraction layer

export type GeometryType = "point" | "line" | "polygon";

export interface GeoJSONGeometry {
  type: string;
  coordinates: unknown;
}

/** Simple average centroid of all coordinate pairs in a GeoJSON geometry */
export function getGeometryCenter(
  geojson: GeoJSONGeometry
): { lat: number; lng: number } | null {
  try {
    const coords = flattenCoords(geojson);
    if (coords.length === 0) return null;
    const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
    const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
    return { lat, lng };
  } catch {
    return null;
  }
}

/** Derive lat/lng fallback from geometry (for existing lat/lng columns) */
export function geometryToLatLng(
  geojson: GeoJSONGeometry
): { lat: number; lng: number } | null {
  return getGeometryCenter(geojson);
}

/** Validate that the geometry has enough coordinates for its type */
export function isValidGeometry(
  type: GeometryType,
  geojson: GeoJSONGeometry | null | undefined
): boolean {
  if (!geojson) return false;
  try {
    const coords = flattenCoords(geojson);
    if (type === "point") return coords.length === 1;
    if (type === "line") return coords.length >= 2;
    if (type === "polygon") return coords.length >= 3;
    return false;
  } catch {
    return false;
  }
}

// ─── internal ───────────────────────────────────────────────────────────────

/** Flatten any GeoJSON coordinate structure to an array of [lng, lat] pairs */
function flattenCoords(geojson: GeoJSONGeometry): [number, number][] {
  const raw = geojson.coordinates;
  if (!raw) return [];

  // Point: [lng, lat]
  if (
    Array.isArray(raw) &&
    raw.length === 2 &&
    typeof raw[0] === "number"
  ) {
    return [[raw[0] as number, raw[1] as number]];
  }

  // LineString: [[lng, lat], ...]
  if (
    Array.isArray(raw) &&
    Array.isArray(raw[0]) &&
    typeof (raw[0] as unknown[])[0] === "number"
  ) {
    return (raw as number[][]).map((c) => [c[0], c[1]]);
  }

  // Polygon: [[[lng, lat], ...]]
  if (
    Array.isArray(raw) &&
    Array.isArray(raw[0]) &&
    Array.isArray((raw[0] as unknown[])[0])
  ) {
    return ((raw as number[][][])[0]).map((c) => [c[0], c[1]]);
  }

  return [];
}
