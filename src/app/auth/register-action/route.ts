import { NextResponse } from "next/server";
import { signUp } from "@/lib/auth-server";

/**
 * Register action route handler
 * POST /auth/register-action
 *
 * Creates new user account with 'user' role
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full_name") as string;
    const phone = formData.get("phone") as string | null;
    // Always force role to "user" — admin registration is disabled
    const requestedRole = formData.get("role") as string | null;
    if (requestedRole === "admin") {
      return NextResponse.json(
        { success: false, error: "Pendaftaran akun admin tidak diizinkan" },
        { status: 403 }
      );
    }
    const role = "user";

    // Validate inputs
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: "Email, password, dan nama wajib diisi" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Attempt sign up
    const { user, error } = await signUp(email, password, fullName, phone || undefined, role);

    if (error || !user) {
      console.error("Registrasi gagal. Error:", error, "User:", user);
      return NextResponse.json(
        { success: false, error: error || "Registrasi gagal" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      message: "Akun berhasil dibuat. Silakan login.",
      redirectTo: "/auth/login",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
