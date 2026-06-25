import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const adminAuth = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function getAdminSession() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single<{ role: string }>();
  if (profile?.role !== "admin") return null;
  return user;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { full_name, email, phone, role } = body;

    const supabaseAdmin = adminAuth();
    if (email) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(params.id, { email });
      if (authError) throw authError;
    }
    const { error: dbError } = await supabaseAdmin.from("users").update({ full_name, email, phone, role }).eq("id", params.id);
    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.id === params.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

    const supabaseAdmin = adminAuth();
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(params.id);
    if (authError) throw authError;
    await supabaseAdmin.from("users").delete().eq("id", params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
