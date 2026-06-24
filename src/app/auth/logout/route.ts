import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Logout route handler
 * POST /auth/logout
 * Signs out on server side and clears auth cookies via response headers.
 */
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Logout error:", error);
  }

  // Return response that clears Supabase auth cookies
  const response = NextResponse.json({ success: true, redirectTo: "/" });
  // Clear all Supabase auth-related cookies
  const supabaseCookieNames = [
    "sb-access-token",
    "sb-refresh-token",
    `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`,
  ];
  supabaseCookieNames.forEach((name) => {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  });
  return response;
}

/**
 * Also support GET for simple logout links
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Logout error:", error);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const response = NextResponse.redirect(new URL("/", siteUrl));
  const supabaseCookieNames = [
    "sb-access-token",
    "sb-refresh-token",
    `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`,
  ];
  supabaseCookieNames.forEach((name) => {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  });
  return response;
}
