import { NextResponse } from "next/server";
import { signIn, getRedirectUrl } from "@/lib/auth-server";

/**
 * Login action route handler
 * POST /auth/login-action
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const next = formData.get("next") as string | null;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Attempt sign in
    const { user, error } = await signIn(email, password);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || "Login gagal" },
        { status: 401 }
      );
    }

    // Determine redirect URL based on role and next parameter
    let redirectTo = "/search"; // Default for user

    if (user.role === "admin") {
      // Admin goes to admin page
      redirectTo = getRedirectUrl(next, "/admin");
    } else {
      // Regular user
      redirectTo = getRedirectUrl(next, "/search");
    }

    return NextResponse.json({
      success: true,
      user,
      redirectTo,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
