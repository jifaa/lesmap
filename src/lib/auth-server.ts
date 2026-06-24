import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/auth-types";

/**
 * Get current user from session with profile
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  // Get user profile from public.users
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  return profile;
}

/**
 * Get current user or redirect to login
 */
export async function requireAuth(returnUrl?: string): Promise<UserProfile> {
  const user = await getCurrentUser();

  if (!user) {
    const loginUrl = returnUrl
      ? `/auth/login?next=${encodeURIComponent(returnUrl)}`
      : "/auth/login";
    redirect(loginUrl);
  }

  return user;
}

/**
 * Get current user if admin or redirect
 */
export async function requireAdmin(returnUrl?: string): Promise<UserProfile> {
  const user = await requireAuth(returnUrl);

  if (user.role !== "admin") {
    redirect("/auth/unauthorized");
  }

  return user;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return { user: profile, error: null };
}

/**
 * Sign up new user
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  role?: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || null,
        role: role || "user",
      },
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  // If email confirmation is not required, profile should be created by trigger
  // If confirmation is required, profile will be created on email confirmation callback
  if (data.user) {
    // Check if profile was created (might return null/fail due to RLS since we are unauthenticated)
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profile) {
      return { user: profile, error: null };
    }

    // Fallback: construct profile from input data to prevent false "Registration Failed" in UI
    const fallbackProfile: UserProfile = {
      id: data.user.id,
      email: data.user.email || email,
      full_name: fullName,
      phone: phone || null,
      role: (role as any) || "user",
      created_at: data.user.created_at || new Date().toISOString(),
      updated_at: null,
    };

    return { user: fallbackProfile, error: null };
  }

  return { user: null, error: null };
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
}

/**
 * Validate redirect URL to prevent open redirect vulnerabilities
 */
export function isValidRedirectUrl(url: string): boolean {
  // Only allow relative URLs starting with /
  if (url.startsWith("/") && !url.startsWith("//")) {
    return true;
  }
  return false;
}

/**
 * Get safe redirect URL
 */
export function getRedirectUrl(url: string | null, fallback: string): string {
  if (url && isValidRedirectUrl(url)) {
    return url;
  }
  return fallback;
}

