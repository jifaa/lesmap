import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  const isValidRedirect = (url: string) => {
    return url.startsWith("/") && !url.startsWith("//");
  };

  const redirectTo = next && isValidRedirect(next) ? next : "/search";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }

    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(
      new URL("/auth/login?error=" + encodeURIComponent(error.message), requestUrl.origin)
    );
  }

  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}
