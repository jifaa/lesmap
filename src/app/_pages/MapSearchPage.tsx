"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Filter,
  MapPin,
  Navigation,
  Star,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { DynamicLeafletMap } from "../components/DynamicLeafletMap";
import {
  fetchApprovedCoursePlaces,
  fetchFilteredCoursePlaces,
  fetchCategories,
  fetchDistricts,
  type CoursePlace,
} from "@/lib/supabase/client";

export function MapSearchPage() {
  // Data state
  const [places, setPlaces] = useState<CoursePlace[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedRadius, setSelectedRadius] = useState("");

  // Active place (highlighted on map)
  const [activePlaceId, setActivePlaceId] = useState<number | null>(null);

  // Route-aware state
  const pathname = usePathname();
  const isSearchRoute = pathname === "/search";
  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);
  const lastFilterKeyRef = useRef("");

  // Map remount key for route re-entry
  const [mapKey, setMapKey] = useState(0);

  // Unified data loading function
  const loadData = useCallback(async (filters?: { category?: string; district?: string; search?: string }) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const hasFilters = filters?.category || filters?.district || filters?.search;
      const placesData = hasFilters
        ? await fetchFilteredCoursePlaces(filters)
        : await fetchApprovedCoursePlaces();

      if (!mountedRef.current) return;
      if (requestId !== requestIdRef.current) return;

      setPlaces(placesData);
    } catch (err) {
      if (!mountedRef.current) return;
      if (requestId !== requestIdRef.current) return;
      console.error("Error loading map data:", err);
      setPlaces([]);
      setError("Gagal memuat data peta kursus");
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
        setInitialLoaded(true);
      }
    }
  }, []);

  // Load initial options and data — route-aware
  useEffect(() => {
    mountedRef.current = true;

    if (!isSearchRoute) {
      requestIdRef.current += 1;
      setLoading(false);
      return;
    }

    let active = true;
    async function loadInitialOptions() {
      try {
        const [categoriesData, districtsData] = await Promise.all([
          fetchCategories(),
          fetchDistricts(),
        ]);
        if (!active || !mountedRef.current) return;
        setCategories(categoriesData);
        setDistricts(districtsData);
      } catch (err) {
        if (!active || !mountedRef.current) return;
        console.error("Error loading filter options:", err);
      }
    }

    setInitialLoaded(false);
    setMapKey((prev) => prev + 1);
    lastFilterKeyRef.current = JSON.stringify({
      category: selectedCategory || "",
      district: selectedDistrict || "",
      search: searchQuery || "",
    });

    loadInitialOptions();
    loadData({
      category: selectedCategory || undefined,
      district: selectedDistrict || undefined,
      search: searchQuery || undefined,
    });

    return () => {
      active = false;
      mountedRef.current = false;
      requestIdRef.current += 1;
      setLoading(false);
    };
  }, [isSearchRoute, loadData]);

  // Debounced search after initial load — route-aware
  useEffect(() => {
    if (!isSearchRoute) return;
    if (!initialLoaded) return;

    const currentFilterKey = JSON.stringify({
      category: selectedCategory || "",
      district: selectedDistrict || "",
      search: searchQuery || "",
    });

    if (currentFilterKey === lastFilterKeyRef.current) return;

    const timer = setTimeout(() => {
      lastFilterKeyRef.current = currentFilterKey;
      loadData({
        category: selectedCategory || undefined,
        district: selectedDistrict || undefined,
        search: searchQuery || undefined,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [isSearchRoute, initialLoaded, selectedCategory, selectedDistrict, searchQuery, loadData]);

  // Clear all filters
  const clearFilters = async () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDistrict("");
    setSelectedRadius("");
    setActivePlaceId(null);

    const emptyKey = JSON.stringify({
      category: "",
      district: "",
      search: "",
    });

    lastFilterKeyRef.current = emptyKey;
    await loadData();
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedDistrict ||
    selectedRadius;

  // Determine map center
  const mapCenter: [number, number] = [-0.5022, 117.1536];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 z-10 shadow-sm flex-shrink-0">
        <div className="max-w-full mx-auto flex flex-wrap gap-3 items-center">
          {/* Search Input */}
          <div className="flex-1 min-w-[250px] flex items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Cari nama tempat les..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="ml-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* District Filter */}
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="">Semua Kecamatan</option>
            {districts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>



          {/* Radius Filter */}
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={selectedRadius}
            onChange={(e) => setSelectedRadius(e.target.value)}
          >
            <option value="">Semua Jarak</option>
            <option value="500">≤ 500 m</option>
            <option value="1000">≤ 1 km</option>
            <option value="3000">≤ 3 km</option>
            <option value="5000">≤ 5 km</option>
          </select>

          {/* Filter Button */}
          <button
            onClick={() => loadData({
              category: selectedCategory || undefined,
              district: selectedDistrict || undefined,
              search: searchQuery || undefined,
            })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Filter className="w-4 h-4" /> Filter
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Split Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Results */}
        <div className="w-full md:w-[400px] bg-white border-r border-slate-200 flex flex-col h-full z-10 flex-shrink-0">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-semibold text-slate-800">Hasil Pencarian</h2>
            <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin inline" />
              ) : (
                `${places.length} Ditemukan`
              )}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 bg-white animate-pulse"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="h-4 w-20 bg-slate-200 rounded mb-2" />
                      <div className="h-5 w-40 bg-slate-200 rounded" />
                    </div>
                    <div className="h-4 w-8 bg-slate-200 rounded" />
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="h-3 w-full bg-slate-100 rounded" />
                    <div className="h-3 w-3/4 bg-slate-100 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-1/2 bg-slate-100 rounded-lg" />
                    <div className="h-8 w-1/2 bg-slate-100 rounded-lg" />
                  </div>
                </div>
              ))
            ) : error ? (
              // Error state
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-semibold text-slate-700 mb-1">
                  {error}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Silakan coba beberapa saat lagi atau klik tombol di bawah.
                </p>
                <button
                  onClick={() => loadData({
                    category: selectedCategory || undefined,
                    district: selectedDistrict || undefined,
                    search: searchQuery || undefined,
                  })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Coba Lagi
                </button>
              </div>
            ) : places.length === 0 ? (
              // Empty state
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-700 mb-1">
                  Tidak ada hasil
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Coba ubah filter atau kata kunci pencarian
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Reset semua filter
                  </button>
                )}
              </div>
            ) : (
              // Result cards
              places.map((place) => (
                <div
                  key={place.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                    activePlaceId === place.id
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                  }`}
                  onClick={() => setActivePlaceId(place.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded mb-1">
                        {place.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {place.name}
                      </h3>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold text-slate-700 ml-1">
                        -
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-slate-500 text-xs">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      <span className="truncate">
                        {place.address}
                        {place.district && `, ${place.district}`}
                      </span>
                    </div>
                    {place.price_min && place.price_max && (
                      <div className="text-sm font-semibold text-slate-700">
                        Rp{place.price_min.toLocaleString("id-ID")} –{" "}
                        Rp{place.price_max.toLocaleString("id-ID")}
                        <span className="text-xs font-normal text-slate-500">
                          {" "}
                          / bulan
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/detail/${place.id}`}
                      className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 rounded-lg text-center transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Detail
                    </Link>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg text-center transition-colors shadow-sm flex justify-center items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation className="w-3 h-3" /> Rute
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="hidden md:block flex-1 relative h-full bg-slate-100">
          <DynamicLeafletMap
            key={mapKey}
            places={places}
            activePlaceId={activePlaceId}
            onPlaceClick={(id) => setActivePlaceId(id)}
            showGeolocation={true}
            loading={loading}
            center={mapCenter}
            zoom={12}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
