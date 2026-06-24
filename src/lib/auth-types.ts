// Type definitions for LesMap Samarinda Auth System

export type UserRole = "user" | "admin";

// User profile from public.users table
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string | null;
}

// Auth state for client components
export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

// Login form data
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register form data
export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

// API Response types
export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: UserProfile;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  redirectTo?: string;
}
