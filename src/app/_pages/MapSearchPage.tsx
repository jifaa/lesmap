"use client";

import { useEffect, useState, useCallback } from "react";
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

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedRadius, setSelectedRadius] = useState("");

  // Active place (highlighted on map)
  const [activePlaceId, setActivePlaceId] = useState<number | null>(null);

  // Landmark filter (for centering map)
  const [selectedLandmark, setSelectedLandmark] = useState<string>("");

  // Landmark coordinates for map centering
  const landmarkCoords: Record<string, [number, number]> = {
    umkt: [-0.4612, 117.1496],
    bigmall: [-0.5025, 117.1496],
    taman: [-0.5132, 117.1418],
    islamic: [-0.4876, 117.1537],
  };

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [placesData, categoriesData, districtsData] = await Promise.all([
          fetchApprovedCoursePlaces(),
          fetchCategories(),
          fetchDistricts(),
        ]);
        setPlaces(placesData);
        setCategories(categoriesData);
        setDistricts(districtsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Apply filters
  const applyFilters = useCallback(async () => {
    setLoading(true);
    try {
      const filtered = await fetchFilteredCoursePlaces({
        category: selectedCategory || undefined,
        district: selectedDistrict || undefined,
        search: searchQuery || undefined,
      });
      setPlaces(filtered);
    } catch (error) {
      console.error("Error filtering data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedDistrict, searchQuery]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 400);
    return () => clearTimeout(timer);
  }, [applyFilters]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDistrict("");
    setSelectedRadius("");
    setSelectedLandmark("");
    setActivePlaceId(null);
    // Reload all approved places
    fetchApprovedCoursePlaces().then((data) => {
      setPlaces(data);
    });
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedDistrict ||
    selectedRadius ||
    selectedLandmark;

  // Determine map center based on landmark selection
  const mapCenter: [number, number] = selectedLandmark
    ? landmarkCoords[selectedLandmark] ?? [-0.5022, 117.1536]
    : [-0.5022, 117.1536];

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

          {/* Landmark Filter */}
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={selectedLandmark}
            onChange={(e) => setSelectedLandmark(e.target.value)}
          >
            <option value="">Pilih Landmark</option>
            <option value="umkt">UMKT</option>
            <option value="bigmall">Big Mall Samarinda</option>
            <option value="taman">Taman Samarendah</option>
            <option value="islamic">Islamic Center</option>
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
            onClick={applyFilters}
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
            places={places}
            activePlaceId={activePlaceId}
            onPlaceClick={(id) => setActivePlaceId(id)}
            showGeolocation={true}
            loading={loading}
            center={mapCenter}
            zoom={selectedLandmark ? 15 : 12}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
