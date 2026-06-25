"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  LogOut,
  MapPin,
  Loader2,
  Phone,
  Mail,
  Globe,
  Instagram,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Save,
  Edit,
  Eye,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { DynamicGeometryPickerMap } from "../components/DynamicGeometryPickerMap";
import {
  getGeometryCenter,
  isValidGeometry,
  type GeometryType,
  type GeoJSONGeometry,
} from "@/lib/geometry";
import { StatusBadge } from "../components/StatusBadge";
import { StatCard } from "../components/StatCard";
import type { CoursePlace, Category } from "@/types/database";

// District list for Samarinda
const districts = [
  "Samarinda Utara",
  "Samarinda Ilir",
  "Samarinda Kota",
  "Samarinda Seberang",
  "Samarinda Ulu",
  "Samarinda Barat",
  "Sungai Kunjang",
  "Sungai Pinang",
  "Palaran",
  "Samratulangi",
];

export function OwnerDashboardPage() {
  const { user, signOut, isLoading: authLoading } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<"dashboard" | "add" | "list">("dashboard");
  const [places, setPlaces] = useState<CoursePlace[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingPlace, setEditingPlace] = useState<CoursePlace | null>(null);

  // GIS geometry state (separate from formData to keep serialisable)
  const [geometryType, setGeometryType] = useState<GeometryType>("point");
  const [geometryGeojson, setGeometryGeojson] = useState<GeoJSONGeometry | null>(null);
  const [geometryError, setGeometryError] = useState<string | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    address: "",
    district: "",
    city: "Samarinda",
    province: "Kalimantan Timur",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    instagram: "",
    price_min: "",
    price_max: "",
  });

  // Fetch user's places
  const fetchPlaces = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("course_places")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlaces(data || []);
    } catch (error) {
      console.error("Error fetching places:", error);
      toast.error("Gagal memuat data tempat les");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPlaces();
      fetchCategories();
    }
  }, [user, fetchPlaces, fetchCategories]);

  // Calculate stats
  const stats = {
    total: places.length,
    pending: places.filter(p => p.status === "pending").length,
    approved: places.filter(p => p.status === "approved").length,
    rejected: places.filter(p => p.status === "rejected").length,
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      address: "",
      district: "",
      city: "Samarinda",
      province: "Kalimantan Timur",
      phone: "",
      whatsapp: "",
      email: "",
      website: "",
      instagram: "",
      price_min: "",
      price_max: "",
    });
    setGeometryType("point");
    setGeometryGeojson(null);
    setGeometryError(null);
    setEditingPlace(null);
  };

  // Handle add new place
  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate geometry
    if (!isValidGeometry(geometryType, geometryGeojson)) {
      setGeometryError("Silakan tandai lokasi tempat les di peta.");
      return;
    }
    setGeometryError(null);

    // Derive lat/lng from geometry
    const center = getGeometryCenter(geometryGeojson!);
    const lat = center?.lat ?? 0;
    const lng = center?.lng ?? 0;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("course_places").insert({
        name: formData.name,
        category: formData.category,
        description: formData.description || null,
        address: formData.address,
        district: formData.district,
        city: formData.city,
        province: formData.province,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        website: formData.website || null,
        instagram: formData.instagram || null,
        price_min: formData.price_min ? parseInt(formData.price_min) : null,
        price_max: formData.price_max ? parseInt(formData.price_max) : null,
        latitude: lat,
        longitude: lng,
        geometry_type: geometryType,
        geometry_geojson: geometryGeojson,
        owner_id: user.id,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Tempat les berhasil diajukan! Menunggu verifikasi admin.");
      resetForm();
      setActiveTab("list");
      fetchPlaces();
    } catch (error) {
      console.error("Error adding place:", error);
      toast.error("Gagal menambahkan tempat les");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit place — populate form + geometry state
  const handleEditPlace = (place: CoursePlace) => {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      category: place.category,
      description: place.description || "",
      address: place.address,
      district: place.district,
      city: place.city,
      province: place.province,
      phone: place.phone || "",
      whatsapp: place.whatsapp || "",
      email: place.email || "",
      website: place.website || "",
      instagram: place.instagram || "",
      price_min: place.price_min?.toString() || "",
      price_max: place.price_max?.toString() || "",
    });

    // Restore geometry state; fallback to Point from lat/lng if no geojson
    const savedType = place.geometry_type ?? "point";
    const savedGeojson: GeoJSONGeometry | null = place.geometry_geojson ??
      (place.latitude && place.longitude ? {
        type: "Point",
        coordinates: [place.longitude, place.latitude],
      } : null);
    setGeometryType(savedType);
    setGeometryGeojson(savedGeojson);
    setGeometryError(null);
    setActiveTab("add");
  };

  // Handle update place
  const handleUpdatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace || !user) return;

    // Validate geometry
    if (!isValidGeometry(geometryType, geometryGeojson)) {
      setGeometryError("Silakan tandai lokasi tempat les di peta.");
      return;
    }
    setGeometryError(null);

    // Derive lat/lng from geometry
    const center = getGeometryCenter(geometryGeojson!);
    const lat = center?.lat ?? editingPlace.latitude;
    const lng = center?.lng ?? editingPlace.longitude;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("course_places")
        .update({
          name: formData.name,
          category: formData.category,
          description: formData.description || null,
          address: formData.address,
          district: formData.district,
          city: formData.city,
          province: formData.province,
          phone: formData.phone || null,
          whatsapp: formData.whatsapp || null,
          email: formData.email || null,
          website: formData.website || null,
          instagram: formData.instagram || null,
          price_min: formData.price_min ? parseInt(formData.price_min) : null,
          price_max: formData.price_max ? parseInt(formData.price_max) : null,
          latitude: lat,
          longitude: lng,
          geometry_type: geometryType,
          geometry_geojson: geometryGeojson,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingPlace.id)
        .eq("owner_id", user.id); // Ensure user owns this place

      if (error) throw error;

      toast.success("Tempat les berhasil diperbarui!");
      resetForm();
      setActiveTab("list");
      fetchPlaces();
    } catch (error) {
      console.error("Error updating place:", error);
      toast.error("Gagal memperbarui tempat les");
    } finally {
      setSubmitting(false);
    }
  };



  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Ditolak</h2>
        <p className="text-slate-600 mb-4">Silakan login terlebih dahulu.</p>
        <Link href="/auth/login?next=/owner" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              Pemilik Les
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">{user?.email}</p>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => { setActiveTab("dashboard"); resetForm(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button
            onClick={() => { setActiveTab("add"); resetForm(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "add" && !editingPlace
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <PlusCircle className="w-5 h-5" /> Tambah Tempat Les
          </button>
          <button
            onClick={() => { setActiveTab("list"); resetForm(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "list"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <List className="w-5 h-5" /> Daftar Tempat Les
          </button>
        </div>

        <div className="p-4 border-t border-slate-100">
          <Link
            href="/"
            className="w-full flex items-center gap-3 text-slate-600 hover:bg-slate-50 px-4 py-3 rounded-xl font-medium transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5" /> Kembali
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Pemilik Les
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola informasi tempat les Anda di LesMap Samarinda.
          </p>
        </div>

        {/* Dashboard View */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Tempat Les" value={stats.total} />
              <StatCard 
                title="Pending" 
                value={stats.pending} 
                colorClass="text-yellow-600" 
                progressPercentage={stats.total ? (stats.pending / stats.total) * 100 : 0}
                progressBgClass="bg-yellow-100"
                progressFillClass="bg-yellow-400"
              />
              <StatCard 
                title="Approved" 
                value={stats.approved} 
                colorClass="text-green-600" 
                progressPercentage={stats.total ? (stats.approved / stats.total) * 100 : 0}
                progressBgClass="bg-green-100"
                progressFillClass="bg-green-400"
              />
              <StatCard 
                title="Rejected" 
                value={stats.rejected} 
                colorClass="text-red-600" 
                progressPercentage={stats.total ? (stats.rejected / stats.total) * 100 : 0}
                progressBgClass="bg-red-100"
                progressFillClass="bg-red-400"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Aksi Cepat</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveTab("add")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition-colors"
                >
                  <PlusCircle className="w-5 h-5" /> Tambah Tempat Les Baru
                </button>
                <button
                  onClick={() => setActiveTab("list")}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-medium transition-colors"
                >
                  <List className="w-5 h-5" /> Lihat Semua Tempat Les
                </button>
              </div>
            </div>
          </>
        )}

        {/* Add/Edit Form */}
        {activeTab === "add" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              {editingPlace ? "Edit Tempat Les" : "Tambah Tempat Les Baru"}
            </h2>

            <form onSubmit={editingPlace ? handleUpdatePlace : handleAddPlace} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Informasi Dasar</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nama Tempat Les <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Cth: Global English Course"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Pilih Kategori...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Jelaskan tentang tempat les Anda..."
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Lokasi</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Alamat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Cth: Jl. Sudirman No. 123"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Kecamatan <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Pilih Kecamatan...</option>
                      {districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kota</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Provinsi</label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* ─── GIS Geometry Section ─────────────────────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-slate-700">
                    Lokasi GIS Tempat Les
                  </h3>
                  <span className="text-red-500 text-sm">*</span>
                </div>

                {/* Helper text */}
                <p className="text-xs text-slate-500">
                  Gunakan <strong>Point</strong> untuk lokasi tunggal, <strong>Line</strong> untuk jalur akses, atau <strong>Polygon</strong> untuk area tempat les.
                </p>

                {/* Geometry type selector */}
                <div className="flex gap-2 flex-wrap">
                  {(
                    [
                      { type: "point",   label: "📍 Point",   desc: "Titik lokasi" },
                      { type: "line",    label: "〰️ Line",    desc: "Jalur / akses" },
                      { type: "polygon", label: "⬡ Polygon",  desc: "Area tempat les" },
                    ] as const
                  ).map(({ type, label, desc }) => {
                    const isActive = geometryType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setGeometryType(type);
                          setGeometryGeojson(null);
                          setGeometryError(null);
                        }}
                        className={`flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all ${
                          isActive
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-slate-50"
                        }`}
                        style={{ minWidth: "110px" }}
                      >
                        <span className="text-sm font-semibold">{label}</span>
                        <span className="text-[11px] mt-0.5 opacity-70">{desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Instructions per mode */}
                <div className={`text-xs rounded-lg px-3 py-2 border flex items-start gap-2 ${
                  geometryGeojson
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-blue-50 border-blue-100 text-blue-600"
                }`}>
                  <span className="text-base leading-none mt-0.5">
                    {geometryGeojson ? "✓" : "ℹ️"}
                  </span>
                  <span>
                    {geometryGeojson
                      ? "Geometri berhasil ditambahkan. Anda bisa menggambar ulang jika perlu."
                      : geometryType === "point"
                        ? "Klik tombol marker (📍) di toolbar peta, lalu klik titik lokasi."
                        : geometryType === "line"
                          ? "Klik tombol polyline (—) di toolbar peta, lalu klik minimal 2 titik. Klik ganda untuk selesai."
                          : "Klik tombol polygon (⬡) di toolbar peta, lalu klik minimal 3 titik. Klik titik awal untuk menutup area."
                    }
                  </span>
                </div>

                {/* Map */}
                <div
                  style={{ height: "380px" }}
                  className={`w-full rounded-xl overflow-hidden border-2 transition-colors ${
                    geometryError
                      ? "border-red-400"
                      : geometryGeojson
                        ? "border-green-400"
                        : "border-slate-200"
                  }`}
                >
                  <DynamicGeometryPickerMap
                    mode={geometryType}
                    initialGeojson={editingPlace?.geometry_geojson ?? (
                      editingPlace?.latitude && editingPlace?.longitude
                        ? { type: "Point", coordinates: [editingPlace.longitude, editingPlace.latitude] }
                        : null
                    )}
                    onChange={(geojson) => {
                      setGeometryGeojson(geojson);
                      if (geojson) setGeometryError(null);
                    }}
                    className="w-full h-full"
                  />
                </div>

                {/* Error state */}
                {geometryError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {geometryError}
                  </div>
                )}
              </div>


              {/* Contact */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Kontak</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Telepon
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0541-123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="081234567890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="info@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="www.example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Instagram className="w-4 h-4 inline mr-1" />
                      Instagram
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Biaya</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Biaya Minimum (per bulan)
                    </label>
                    <input
                      type="number"
                      name="price_min"
                      value={formData.price_min}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="150000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Biaya Maksimum (per bulan)
                    </label>
                    <input
                      type="number"
                      name="price_max"
                      value={formData.price_max}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="500000"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {editingPlace ? "Simpan Perubahan" : "Ajukan Verifikasi"}
                </button>
                <button
                  type="button"
                  onClick={() => { resetForm(); setActiveTab("dashboard"); }}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-6 rounded-xl transition-colors"
                >
                  Batal
                </button>
              </div>

              {!editingPlace && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Tempat les baru akan berstatus &quot;Pending&quot; dan menunggu persetujuan admin.
                </p>
              )}
            </form>
          </div>
        )}

        {/* List View */}
        {activeTab === "list" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Daftar Tempat Les Anda</h2>
              <button
                onClick={() => setActiveTab("add")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Tambah
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Belum Ada Tempat Les</h3>
                <p className="text-slate-500 mb-4">Tambahkan tempat les pertama Anda</p>
                <button
                  onClick={() => setActiveTab("add")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                >
                  Tambah Tempat Les
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Nama Tempat</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Harga</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {places.map((place) => (
                      <tr key={place.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">{place.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {place.address}, {place.district}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">
                            {place.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={place.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {place.price_min && place.price_max ? (
                            `Rp${place.price_min.toLocaleString("id-ID")} - Rp${place.price_max.toLocaleString("id-ID")}`
                          ) : place.price_min ? (
                            `Rp${place.price_min.toLocaleString("id-ID")}`
                          ) : place.price_max ? (
                            ` hingga Rp${place.price_max.toLocaleString("id-ID")}`
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditPlace(place)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/detail/${place.id}`}
                              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Lihat di Maps"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
