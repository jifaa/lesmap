import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// ponytail: createBrowserClient reads auth from cookies, same source as server
export const supabase = createBrowserClient(supabaseUrl, supabasePublishableKey);

// Type definitions for course_places table
export interface CoursePlace {
  id: number;
  name: string;
  address: string;
  district: string;
  city: string;
  province: string;
  category: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  latitude: number;
  longitude: number;
  price_min: number | null;
  price_max: number | null;
  status: "pending" | "approved" | "rejected";
  owner_id: string;
  created_at: string;
  updated_at: string | null;
  image_url?: string;
  geometry_type?: "point" | "line" | "polygon";
  geometry_geojson?: {
    type: string;
    coordinates: unknown;
  } | null;
}

// Fetch approved course places (for public /search page)
export async function fetchApprovedCoursePlaces(): Promise<CoursePlace[]> {
  const { data, error } = await supabase
    .from("course_places")
    .select("*")
    .eq("status", "approved")
    .order("name");

  if (error) {
    console.error("Error fetching course places:", error);
    return [];
  }

  return data ?? [];
}


// Fetch a single course place by ID
export async function fetchCoursePlaceById(id: number): Promise<CoursePlace | null> {
  const { data, error } = await supabase
    .from("course_places")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching course place:", error);
    return null;
  }

  return data;
}

// Fetch course places with filters (for search page)
export async function fetchFilteredCoursePlaces(params: {
  category?: string;
  district?: string;
  search?: string;
}): Promise<CoursePlace[]> {
  let query = supabase
    .from("course_places")
    .select("*")
    .eq("status", "approved");

  if (params.category && params.category !== "all") {
    query = query.eq("category", params.category);
  }

  if (params.district && params.district !== "all") {
    query = query.eq("district", params.district);
  }

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  const { data, error } = await query.order("name");

  if (error) {
    console.error("Error fetching filtered course places:", error);
    return [];
  }

  return data ?? [];
}

// Fetch all districts for filter dropdown
export async function fetchDistricts(): Promise<string[]> {
  const { data, error } = await supabase
    .from("course_places")
    .select("district")
    .eq("status", "approved");

  if (error) {
    console.error("Error fetching districts:", error);
    return [];
  }

  // Get unique districts
  const uniqueDistricts = [...new Set(data?.map((d) => d.district).filter(Boolean))];
  return uniqueDistricts.sort();
}

// Fetch all categories for filter dropdown
export async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("course_places")
    .select("category")
    .eq("status", "approved");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  // Get unique categories
  const uniqueCategories = [...new Set(data?.map((d) => d.category).filter(Boolean))];
  return uniqueCategories.sort();
}
