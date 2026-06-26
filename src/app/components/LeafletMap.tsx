"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { CoursePlace } from "@/lib/supabase/client";
import { Navigation, ExternalLink, MapPin, Loader2, Locate } from "lucide-react";
import "leaflet/dist/leaflet.css";

// ============================================================
// Samarinda defaults
// ============================================================
const SAMARINDA_CENTER: [number, number] = [-0.5022, 117.1536];
const DEFAULT_ZOOM = 12;

// ============================================================
// Fix Leaflet default icon for Next.js/Webpack environments.
//
// By replacing L.Icon.Default with a DivIcon that renders our own
// marker shape, we avoid the common "broken marker icon" issue
// that occurs when Leaflet can't resolve its bundled image paths.
// All Markers in this component use custom DivIcon, so this is
// a belt-and-suspenders fix for any third-party code that falls
// back to the default icon.
// ============================================================
function fixLeafletDefaultIcon() {
  
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path fill="#3b82f6" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9 12.5 28.5 12.5 28.5S25 21.5 25 12.5C25 5.6 19.4 0 12.5 0z"/><circle fill="white" cx="12.5" cy="12.5" r="5"/></svg>`),
    iconRetinaUrl:
      "data:image/svg+xml;base64," +
      btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path fill="#3b82f6" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9 12.5 28.5 12.5 28.5S25 21.5 25 12.5C25 5.6 19.4 0 12.5 0z"/><circle fill="white" cx="12.5" cy="12.5" r="5"/></svg>`),
    shadowUrl:
      "data:image/svg+xml;base64," +
      btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path fill="rgba(0,0,0,0.3)" d="M12.5 40c-4.4 0-8.5-4.1-8.5-12.5 0-7.2 10-25 8.5-25 1.5 0 8.5 17.8 8.5 25 0 8.4-4.1 12.5-8.5 12.5z"/></svg>`),
  });
}

// ============================================================
// Custom marker icons
// ============================================================
function createCourseIcon(isActive: boolean, isUserLocation = false): L.DivIcon {
  if (isUserLocation) {
    return L.divIcon({
      html: `
        <div style="
          width: 18px;
          height: 18px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(59,130,246,0.6);
          position: relative;
        ">
          <div style="
            position: absolute;
            inset: -6px;
            border: 2px solid rgba(59,130,246,0.4);
            border-radius: 50%;
          "></div>
        </div>
      `,
      className: "",
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }

  const bgColor = isActive ? "#2563eb" : "#16a34a";
  const scale = isActive ? "transform: scale(1.25);" : "";
  const shadow = isActive
    ? "box-shadow: 0 0 0 4px rgba(37,99,235,0.25), 0 4px 12px rgba(0,0,0,0.2);"
    : "box-shadow: 0 4px 12px rgba(0,0,0,0.2);";

  return L.divIcon({
    html: `
      <div style="
        width: 36px;
        height: 44px;
        display: flex;
        flex-direction: column;
        align-items: center;
        ${scale}
      ">
        <div style="
          width: 36px;
          height: 36px;
          background: ${bgColor};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          ${shadow}
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      </div>
    `,
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -48],
  });
}

// ============================================================
// Landmark icon (yellow)
// ============================================================
function createLandmarkIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <div style="
          width: 32px;
          height: 32px;
          background: #facc15;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        ">
          ★
        </div>
      </div>
    `,
    className: "",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -44],
  });
}

// ============================================================
// Map events handler (re-center on location)
// ============================================================
function RecenterOnLocation({
  userLocation,
}: {
  userLocation: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 15, { duration: 1 });
    }
  }, [userLocation, map]);

  return null;
}

// ============================================================
// Map view controller to handle dynamic center and zoom changes
// ============================================================
function ChangeMapView({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

// ============================================================
// Invalidate map size after mount
// ============================================================
function InvalidateMapSize() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// ============================================================
// Geolocation button
// ============================================================
function GeolocationControl({
  onLocate,
  isLocating,
}: {
  onLocate: () => void;
  isLocating: boolean;
}) {
  return (
    <div
      className="leaflet-top leaflet-right"
      style={{ top: "10px", right: "10px", zIndex: 1000 }}
    >
      <div
        className="leaflet-control"
        style={{
          background: "white",
          border: "none",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        <button
          onClick={onLocate}
          disabled={isLocating}
          title="Gunakan Lokasi Saya"
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: isLocating ? "wait" : "pointer",
            color: "#2563eb",
            transition: "background 150ms",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#eff6ff")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {isLocating ? (
            <Loader2
              className="w-5 h-5 animate-spin"
              style={{ color: "#2563eb" }}
            />
          ) : (
            <Locate className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Google Maps URL builder
// ============================================================
function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

// ============================================================
// Marker popup component
// ============================================================
function MarkerPopupContent({ place }: { place: CoursePlace }) {
  const gmapsUrl = getGoogleMapsUrl(place.latitude, place.longitude);

  return (
    <div
      style={{
        minWidth: "220px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Category badge */}
      <div style={{ marginBottom: "8px" }}>
        <span
          style={{
            display: "inline-block",
            background: "#dbeafe",
            color: "#2563eb",
            fontSize: "11px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "6px",
          }}
        >
          {place.category}
        </span>
      </div>

      {/* Name */}
      <h3
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "#030213",
          margin: "0 0 6px 0",
          lineHeight: 1.3,
        }}
      >
        {place.name}
      </h3>

      {/* Address */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "6px",
          marginBottom: "6px",
        }}
      >
        <MapPin
          style={{ width: "13px", height: "13px", color: "#717182", flexShrink: 0, marginTop: "2px" }}
        />
        <span
          style={{
            fontSize: "12px",
            color: "#475569",
            lineHeight: 1.4,
          }}
        >
          {place.address}
          {place.district && (
            <span style={{ color: "#717182" }}> · {place.district}</span>
          )}
        </span>
      </div>

      {/* Price */}
      {place.price_min && place.price_max && (
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#030213",
            marginBottom: "10px",
          }}
        >
          Rp{place.price_min.toLocaleString("id-ID")} –{" "}
          Rp{place.price_max.toLocaleString("id-ID")}
          <span style={{ fontWeight: 400, color: "#717182", fontSize: "11px" }}>
            {" "}
            / bulan
          </span>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
        <a
          href={`/detail/${place.id}`}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            padding: "7px 10px",
            background: "#f8fafc",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#030213",
            textDecoration: "none",
            transition: "background 150ms",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#f1f5f9")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#f8fafc")
          }
        >
          <ExternalLink style={{ width: "12px", height: "12px" }} />
          Detail
        </a>
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            padding: "7px 10px",
            background: "#2563eb",
            border: "none",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            color: "white",
            textDecoration: "none",
            transition: "background 150ms",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#1d4ed8")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#2563eb")
          }
        >
          <Navigation style={{ width: "12px", height: "12px" }} />
          Rute
        </a>
      </div>
    </div>
  );
}


// ============================================================
// Main LeafletMap component props
// ============================================================
export interface LeafletMapProps {
  /** Course places to display as markers */
  places: CoursePlace[];
  /** ID of the active/selected place (highlights that marker) */
  activePlaceId?: number | null;
  /** Callback when a marker is clicked */
  onPlaceClick?: (placeId: number) => void;
  /** Show geolocation button */
  showGeolocation?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom center (overrides default Samarinda) */
  center?: [number, number];
  /** Custom zoom (overrides default 12) */
  zoom?: number;
  /** CSS class for the map container */
  className?: string;
  /** Height of the map (default handled by CSS) */
  height?: string;
}

// ============================================================
// Main LeafletMap component
// ============================================================
export function LeafletMap({
  places,
  activePlaceId,
  onPlaceClick,
  showGeolocation = true,
  loading = false,
  center,
  zoom = DEFAULT_ZOOM,
  className = "",
  height,
}: LeafletMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [isLocating, setIsLocating] = useState(false);

  // Fix Leaflet icon paths on client
  useEffect(() => {
    fixLeafletDefaultIcon();
  }, []);

  // Browser Geolocation API
  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung oleh browser ini.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        let message = "Tidak dapat mendapatkan lokasi.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Izin lokasi ditolak. Silakan aktifkan di pengaturan browser.";
        }
        alert(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  const mapCenter: [number, number] = center ?? SAMARINDA_CENTER;

  // Landmark positions (fixed for Samarinda landmarks)
  const landmarks = [
    { id: "lm1", name: "UMKT", lat: -0.4612, lng: 117.1496 },
    {
      id: "lm2",
      name: "Big Mall Samarinda",
      lat: -0.5025,
      lng: 117.1496,
    },
    { id: "lm3", name: "Taman Samarendah", lat: -0.5132, lng: 117.1418 },
    {
      id: "lm4",
      name: "Islamic Center Samarinda",
      lat: -0.4876,
      lng: 117.1537,
    },
  ];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ height: height ?? "100%" }}
    >
      {/* Sleek, non-intrusive floating loading indicator at the top-center */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(4px)",
            padding: "8px 16px",
            borderRadius: "9999px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 1000,
            fontSize: "13px",
            color: "#475569",
            fontWeight: 500,
            pointerEvents: "none",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Loader2
            className="animate-spin"
            style={{
              width: "16px",
              height: "16px",
              color: "#2563eb",
            }}
          />
          <span>
            {places.length === 0 ? "Memuat data..." : "Memperbarui data..."}
          </span>
        </div>
      )}


      {/* Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "inherit",
          zIndex: 1,
        }}
        zoomControl={true}
        attributionControl={true}
      >
          <InvalidateMapSize />

          {/* Dynamic view updater */}
          <ChangeMapView center={mapCenter} zoom={zoom} />

          {/* OpenStreetMap tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Re-center on user location */}
          <RecenterOnLocation userLocation={userLocation} />

          {/* Geolocation button */}
          {showGeolocation && (
            <GeolocationControl
              onLocate={handleLocate}
              isLocating={isLocating}
            />
          )}

          {/* User location marker */}
          {userLocation && (
            <Marker position={userLocation} icon={createCourseIcon(false, true)}>
              <Popup>
                <div
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#030213",
                    textAlign: "center",
                    padding: "4px 0",
                  }}
                >
                  📍 Lokasi Anda
                </div>
              </Popup>
            </Marker>
          )}

          {/* Landmark markers */}
          {/*{landmarks.map((lm) => (
            <Marker
              key={lm.id}
              position={[lm.lat, lm.lng]}
              icon={createLandmarkIcon()}
            >
              <Popup>
                <div
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#030213",
                    }}
                  >
                    {lm.name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#ca8a04",
                      marginTop: "2px",
                    }}
                  >
                    Landmark
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}*/}

          {/* Course place geometries (point / line / polygon) */}
          {places.map((place) => {
            const isActive = activePlaceId === place.id;
            const geojson = place.geometry_geojson;
            const gtype = place.geometry_type ?? "point";

            // ── Line (LineString) ──────────────────────────────────────────
            if (gtype === "line" && geojson?.type === "LineString" && Array.isArray(geojson.coordinates)) {
              const positions = (geojson.coordinates as number[][]).map(
                (c) => [c[1], c[0]] as [number, number]
              );
              return (
                <Polyline
                  key={place.id}
                  positions={positions}
                  pathOptions={{
                    color: isActive ? "#2563eb" : "#16a34a",
                    weight: isActive ? 5 : 3,
                    opacity: 0.9,
                  }}
                  eventHandlers={{ click: () => onPlaceClick?.(place.id) }}
                >
                  <Popup><MarkerPopupContent place={place} /></Popup>
                </Polyline>
              );
            }

            // ── Polygon ────────────────────────────────────────────────────
            if (gtype === "polygon" && geojson?.type === "Polygon" && Array.isArray(geojson.coordinates)) {
              const ring = ((geojson.coordinates as number[][][])[0] ?? []).map(
                (c) => [c[1], c[0]] as [number, number]
              );
              return (
                <Polygon
                  key={place.id}
                  positions={ring}
                  pathOptions={{
                    color: isActive ? "#2563eb" : "#16a34a",
                    weight: isActive ? 3 : 2,
                    fillColor: isActive ? "#2563eb" : "#16a34a",
                    fillOpacity: 0.15,
                  }}
                  eventHandlers={{ click: () => onPlaceClick?.(place.id) }}
                >
                  <Popup><MarkerPopupContent place={place} /></Popup>
                </Polygon>
              );
            }

            // ── Point (default fallback) ────────────────────────────────────
            return (
              <Marker
                key={place.id}
                position={[place.latitude, place.longitude]}
                icon={createCourseIcon(isActive)}
                eventHandlers={{ click: () => onPlaceClick?.(place.id) }}
              >
                <Popup><MarkerPopupContent place={place} /></Popup>
              </Marker>
            );
          })}
        </MapContainer>

      {/* CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
        .leaflet-container {
          font-family: Inter, system-ui, sans-serif;
        }
        .leaflet-control-attribution {
          font-size: 10px !important;
          background: rgba(255,255,255,0.8) !important;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
}
