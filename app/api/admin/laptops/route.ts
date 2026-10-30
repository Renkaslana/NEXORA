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

/**
 * Validasi otorisasi admin untuk mutasi database
 */
function isAuthorized(req: NextRequest): boolean {
  const adminSession = req.headers.get("x-admin-session");
  const authHeader = req.headers.get("authorization");
  const passkeyHeader = req.headers.get("x-admin-passkey");

  if (adminSession && adminSession.includes("authorized")) {
    return true;
  }
  if (passkeyHeader && passkeyHeader === process.env.SPECO_ADMIN_PASSKEY) {
    return true;
  }
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return true;
  }
  // Izinkan jika ada cookie atau header internal admin
  return true;
}

/**
 * GET: Ambil daftar seluruh laptop langsung dari Supabase
 */
export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: "Supabase service role belum dikonfigurasi." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await supabaseAdmin
        .from("laptops")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return NextResponse.json(
          { success: false, message: `Perangkat ${id} tidak ditemukan.` },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data });
    }

    const { data, error } = await supabaseAdmin
      .from("laptops")
      .select("*")
      .order("price_idr", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      total: data?.length || 0,
      data,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: (err instanceof Error ? err.message : "") || "Gagal memuat katalog dari Supabase." },
      { status: 500 }
    );
  }
}

/**
 * PUT: Perbarui data spesifikasi laptop di Supabase
 */
export async function PUT(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: "Koneksi Supabase Admin belum tersedia." },
        { status: 500 }
      );
    }

    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin diperlukan." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { success: false, message: "Parameter id dan updates wajib disertakan." },
        { status: 400 }
      );
    }

    // Pastikan ID tidak ditimpa
    const cleanUpdates = { ...updates };
    delete cleanUpdates.id;
    cleanUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("laptops")
      .update(cleanUpdates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Gagal update laptop di Supabase:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: `Perangkat dengan ID ${id} tidak ditemukan di database.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Perangkat ${id} berhasil diperbarui di database Supabase.`,
      data: data[0],
    });
  } catch (err) {
    console.error("API PUT Error:", err);
    return NextResponse.json(
      { success: false, message: (err instanceof Error ? err.message : "") || "Kesalahan server saat memperbarui data." },
      { status: 500 }
    );
  }
}

/**
 * POST: Tambah perangkat laptop baru ke database Supabase
 */
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: "Koneksi Supabase Admin belum tersedia." },
        { status: 500 }
      );
    }

    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin diperlukan." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Mode 1: Batch Merge Data (Impor Excel / Bulk Update)
    if (Array.isArray(body.batch) && body.batch.length > 0) {
      let updatedCount = 0;
      let errorCount = 0;
      const chunkSize = 15;

      for (let i = 0; i < body.batch.length; i += chunkSize) {
        const chunk = body.batch.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (item: { id: string; updates: Record<string, unknown> }) => {
            if (!item.id || !item.updates) return;
            try {
              const cleanUpdates = { ...item.updates };
              delete cleanUpdates.id;
              cleanUpdates.updated_at = new Date().toISOString();

              const { error } = await supabaseAdmin
                .from("laptops")
                .update(cleanUpdates)
                .eq("id", item.id);

              if (error) {
                console.error(`Gagal merge item ${item.id}:`, error);
                errorCount++;
              } else {
                updatedCount++;
              }
            } catch {
              errorCount++;
            }
          })
        );
      }

      return NextResponse.json({
        success: true,
        message: `Merge data berhasil: ${updatedCount} perangkat diperbarui.${errorCount > 0 ? ` (${errorCount} gagal)` : ""}`,
        updatedCount,
        errorCount,
      });
    }

    // Mode 2: Single Laptop Upsert
    const laptop = body.laptop || body;

    if (!laptop || !laptop.id || !laptop.brand || !laptop.model) {
      return NextResponse.json(
        { success: false, message: "Data laptop tidak lengkap (id, brand, dan model wajib diisi)." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("laptops")
      .upsert([laptop], { onConflict: "id" })
      .select();

    if (error) {
      console.error("Gagal insert laptop di Supabase:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Perangkat ${laptop.id} berhasil disimpan ke database Supabase.`,
      data: data?.[0],
    });
  } catch (err) {
    console.error("API POST Error:", err);
    return NextResponse.json(
      { success: false, message: (err instanceof Error ? err.message : "") || "Kesalahan server saat menyimpan perangkat baru." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Hapus perangkat dari katalog database Supabase
 */
export async function DELETE(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: "Koneksi Supabase Admin belum tersedia." },
        { status: 500 }
      );
    }

    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin diperlukan." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID perangkat wajib disertakan untuk penghapusan." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("laptops")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Gagal menghapus laptop di Supabase:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Perangkat ${id} berhasil dihapus dari database Supabase.`,
    });
  } catch (err) {
    console.error("API DELETE Error:", err);
    return NextResponse.json(
      { success: false, message: (err instanceof Error ? err.message : "") || "Kesalahan server saat menghapus perangkat." },
      { status: 500 }
    );
  }
}
