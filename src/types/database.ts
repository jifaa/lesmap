// Database type definitions for Supabase
// This is a simplified version - in production, you would generate this from Supabase

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: "user" | "admin";
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "user" | "admin";
          updated_at?: string | null;
        };
      };
      course_places: {
        Row: {
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
        };
        Insert: {
          name: string;
          address: string;
          district: string;
          city?: string;
          province?: string;
          category: string;
          description?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          website?: string | null;
          instagram?: string | null;
          latitude: number;
          longitude: number;
          price_min?: number | null;
          price_max?: number | null;
          status?: "pending" | "approved" | "rejected";
          owner_id: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          name?: string;
          address?: string;
          district?: string;
          city?: string;
          province?: string;
          category?: string;
          description?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          website?: string | null;
          instagram?: string | null;
          latitude?: number;
          longitude?: number;
          price_min?: number | null;
          price_max?: number | null;
          status?: "pending" | "approved" | "rejected";
          owner_id?: string;
          updated_at?: string | null;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          icon?: string | null;
        };
      };
      fasilitas: {
        Row: {
          id: number;
          name: string;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          icon?: string | null;
        };
      };
      course_fasilitas: {
        Row: {
          course_id: number;
          fasilitas_id: number;
        };
        Insert: {
          course_id: number;
          fasilitas_id: number;
        };
        Update: {
          course_id?: number;
          fasilitas_id?: number;
        };
      };
      reviews: {
        Row: {
          id: number;
          course_id: number;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          course_id: number;
          user_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
      };
    };
  };
}

// Re-export auth types
export type { UserProfile, UserRole } from "@/lib/auth-types";

// Re-export CoursePlace from the canonical source
export type { CoursePlace } from "@/lib/supabase/client";

// Shared types
export interface Category {
  id: number;
  name: string;
  icon: string | null;
}

export interface Fasilitas {
  id: number;
  name: string;
  icon: string | null;
}
