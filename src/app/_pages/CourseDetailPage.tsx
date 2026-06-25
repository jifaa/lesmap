"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  MapPin,
  Navigation,
  Star,
  MessageCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Wifi,
  Wind,
  Car,
  CreditCard,
  Heart,
  Share2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { DynamicLeafletMap } from "../components/DynamicLeafletMap";
import { fetchCoursePlaceById } from "@/lib/supabase/client";
import type { CoursePlace } from "@/types/database";

export function CourseDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [place, setPlace] = useState<CoursePlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlace() {
      if (!id || isNaN(id)) {
        setError("ID tempat les tidak valid.");
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await fetchCoursePlaceById(id);
      setLoading(false);

      if (!data) {
        setError("Tempat les tidak ditemukan.");
      } else {
        setPlace(data);
      }
    }

    loadPlace();
  }, [id]);

  // WhatsApp link builder
  const getWhatsAppLink = (phone: string | null | undefined) => {
    const cleanPhone = phone?.replace(/[^0-9]/g, "") ?? "";
    const message = encodeURIComponent(
      `Halo, saya tertarik dengan ${place?.name}. Bisa info lebih lanjut?`
    );
    return cleanPhone ? `https://wa.me/${cleanPhone}?text=${message}` : "#";
  };

  // Google Maps direction URL
  const getGoogleMapsUrl = () => {
    if (!place) return "#";
    return `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  };

  // Share handler
  const handleShare = () => {
    if (navigator.share && place) {
      navigator.share({
        title: place.name,
        text: `Lihat ${place.name} di LesMap Samarinda`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link berhasil disalin!");
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Memuat detail tempat les...</p>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {error ?? "Tempat les tidak ditemukan"}
          </h1>
          <p className="text-slate-500 mb-6">
            Maaf, kami tidak dapat menemukan tempat les yang Anda cari.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Peta
          </Link>
        </div>
      </div>
    );
  }

  // Status badge
  const statusConfig = {
    approved: {
      label: "Approved",
      bg: "bg-green-100",
      text: "text-green-700",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    pending: {
      label: "Pending",
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: <AlertCircle className="w-3 h-3" />,
    },
    rejected: {
      label: "Rejected",
      bg: "bg-red-100",
      text: "text-red-700",
      icon: <AlertCircle className="w-3 h-3" />,
    },
  };
  const status = statusConfig[place.status] ?? statusConfig.pending;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Link
            href="/search"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Peta
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header & Image */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  {place.category}
                </span>
                <span
                  className={`px-3 py-1 ${status.bg} ${status.text} text-xs font-bold rounded-full flex items-center gap-1`}
                >
                  {status.icon} {status.label}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                {place.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-slate-700 ml-1">-</span>
                  <span className="ml-1 text-slate-400">(ulasan)</span>
                </div>
                {place.district && (
                  <div className="flex items-center text-slate-500">
                    <MapPin className="w-4 h-4 mr-1" /> {place.district}
                  </div>
                )}
              </div>

              {/* Course image */}
              {place.image_url ? (
                <div className="rounded-2xl overflow-hidden mb-6 h-[300px] md:h-[400px] relative">
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden mb-6 h-[300px] md:h-[400px] relative bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-blue-300 mx-auto mb-3" />
                    <p className="text-blue-400 font-medium">
                      Tidak ada foto tersedia
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              {place.description ? (
                <>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">
                    Tentang Tempat Les
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    {place.description}
                  </p>
                </>
              ) : (
                <p className="text-slate-400 italic">
                  Deskripsi belum tersedia.
                </p>
              )}
            </div>

            {/* Fasilitas */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Fasilitas
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-700 text-sm">
                    Free WiFi
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Wind className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-700 text-sm">
                    Ruang AC
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Car className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-700 text-sm">
                    Parkir Luas
                  </span>
                </div>
              </div>
            </div>

            {/* Map Preview */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Lokasi di Peta
                </h2>
                {/* Geometry type label */}
                {(() => {
                  const gtype = place.geometry_type ?? "point";
                  const labels: Record<string, { label: string; color: string; bg: string }> = {
                    point:   { label: "Titik Lokasi", color: "#2563eb", bg: "#dbeafe" },
                    line:    { label: "Jalur / Akses", color: "#16a34a", bg: "#dcfce7" },
                    polygon: { label: "Area Tempat Les", color: "#ca8a04", bg: "#fef9c3" },
                  };
                  const cfg = labels[gtype] ?? labels.point;
                  return (
                    <span
                      style={{
                        background: cfg.bg,
                        color: cfg.color,
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      {cfg.label}
                    </span>
                  );
                })()}
              </div>
              <div className="rounded-2xl overflow-hidden h-[350px]">
                <DynamicLeafletMap
                  places={[place]}
                  activePlaceId={place.id}
                  showGeolocation={true}
                  center={[place.latitude, place.longitude]}
                  zoom={16}
                  className="w-full h-full"
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {place.address}
                {place.district && `, ${place.district}`}
              </p>
            </div>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 sticky top-24">
              <h3 className="font-bold text-lg text-slate-900 mb-6 pb-4 border-b border-slate-100">
                Informasi Detail
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-0.5">
                      Alamat
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {place.address}
                      {place.district && (
                        <span className="text-slate-500">
                          {" "}
                          · {place.district}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-0.5">
                      Koordinat
                    </p>
                    <p className="text-xs font-medium text-blue-600">
                      {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                    </p>
                    {place.geometry_type && place.geometry_type !== "point" && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {place.geometry_type === "line" ? "Jalur / Akses" : "Area Tempat Les"}
                      </p>
                    )}
                  </div>
                </div>

                {(place.price_min || place.price_max) && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">
                        Biaya (Per Bulan)
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {place.price_min && place.price_max
                          ? `Rp${place.price_min.toLocaleString(
                              "id-ID"
                            )} – Rp${place.price_max.toLocaleString("id-ID")}`
                          : place.price_min
                          ? `Rp${place.price_min.toLocaleString("id-ID")}`
                          : `Up to Rp${place.price_max?.toLocaleString(
                              "id-ID"
                            )}`}
                      </p>
                    </div>
                  </div>
                )}

                {place.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-slate-400 mt-0.5 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">
                        Telepon / WhatsApp
                      </p>
                      <a
                        href={getWhatsAppLink(place.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {place.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-3">
                {/* WhatsApp Button */}
                <a
                  href={getWhatsAppLink(place.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-green-200"
                >
                  <MessageCircle className="w-5 h-5" /> Hubungi WhatsApp
                </a>

                {/* Google Maps Button */}
                <a
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-200"
                >
                  <Navigation className="w-5 h-5" /> Lihat Rute di Peta
                </a>

                {/* Save & Share */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Heart className="w-4 h-4" /> Simpan
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
