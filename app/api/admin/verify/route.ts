import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SPECO_SUPABASE_URL ||
  "https://jirpzpqnrnzcsgiecogm.supabase.co";

const serviceRoleKey =
  process.env.SPECO_SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let token = "";

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      const body = await req.json().catch(() => ({}));
      token = body.token || "";
    }

    if (!token) {
      return NextResponse.json(
        { authorized: false, message: "Token autentikasi tidak ditemukan." },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { authorized: false, message: "Service role belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    // 1. Verifikasi Token dengan Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { authorized: false, message: "Sesi login tidak valid atau telah kedaluwarsa." },
        { status: 401 }
      );
    }

    // 2. Periksa apakah user memiliki role admin dari metadata atau tabel admin_users
    const isAppAdmin =
      user.app_metadata?.role === "admin" ||
      user.user_metadata?.role === "admin";

    if (isAppAdmin) {
      return NextResponse.json({
        authorized: true,
        user: {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin",
          email: user.email,
          role: "admin",
        },
      });
    }

    // 3. Periksa keberadaan user di tabel public.admin_users
    const { data: adminRecord } = await supabaseAdmin
      .from("admin_users")
      .select("role, full_name")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminRecord) {
      return NextResponse.json({
        authorized: true,
        user: {
          id: user.id,
          name: adminRecord.full_name || user.user_metadata?.full_name || "Admin",
          email: user.email,
          role: "admin",
        },
      });
    }

    // Cek juga berdasarkan email jika user_id belum tertaut
    if (user.email) {
      const { data: emailRecord } = await supabaseAdmin
        .from("admin_users")
        .select("role, full_name")
        .eq("email", user.email.toLowerCase())
        .eq("role", "admin")
        .maybeSingle();

      if (emailRecord) {
        // Tautkan user_id ke tabel admin_users jika belum
        await supabaseAdmin
          .from("admin_users")
          .update({ user_id: user.id })
          .eq("email", user.email.toLowerCase());

        return NextResponse.json({
          authorized: true,
          user: {
            id: user.id,
            name: emailRecord.full_name || user.user_metadata?.full_name || "Admin",
            email: user.email,
            role: "admin",
          },
        });
      }
    }

    return NextResponse.json(
      { authorized: false, message: "Pengguna tidak memiliki hak akses administrator." },
      { status: 403 }
    );
  } catch (err) {
    return NextResponse.json(
      { authorized: false, message: (err instanceof Error ? err.message : "") || "Kesalahan internal server." },
      { status: 500 }
    );
  }
}
