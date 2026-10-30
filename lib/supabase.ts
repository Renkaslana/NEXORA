import { createClient, SupabaseClient, type User } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SPECO_SUPABASE_URLSUPABASE_URL ||
  process.env.NEXT_PUBLIC_SPECO_SUPABASE_URL ||
  "https://jirpzpqnrnzcsgiecogm.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SPECO_SUPABASE_URLSUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SPECO_SUPABASE_URLSUPABASE_PUBLISHABLE_KEY ||
  process.env.SPECO_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SPECO_SUPABASE_ANON_KEY ||
  "";

/**
 * Supabase client instance (hanya aktif jika kredensial environment tersedia).
 * Mendukung akses langsung katalog laptop, otentikasi Google/email,
 * serta penyimpanan bookmark laptop favorit mahasiswa.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = Boolean(supabase);

export interface SupabaseLaptop {
  id: string;
  brand: string;
  model: string;
  series?: string;
  category: string;
  major_target?: string;
  cpu: string;
  gpu: string;
  ram_gb: number;
  ram_upgradable: boolean;
  storage: string;
  display: string;
  weight_kg: number;
  price_idr: number;
  image_url?: string;
  buy_url?: string;
  warranty?: string;
  usecase_tag?: string;
  pros?: string;
  cons?: string;
  device_type?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Mengambil daftar laptop dari Supabase (Direct Server Endpoint & No-Cache)
 */
export async function getLaptopsFromSupabase(): Promise<SupabaseLaptop[] | null> {
  try {
    // 1. Ambil dari server-side route dengan cache: no-store untuk memastikan data selalu aktual
    if (typeof window !== "undefined") {
      const res = await fetch(`/api/admin/laptops?_t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data as SupabaseLaptop[];
        }
      }
    }
  } catch (err) {
    console.warn("Server endpoint fetch error, fallback ke direct client:", err);
  }

  // 2. Fallback ke Supabase client langsung
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("laptops")
      .select("*")
      .order("price_idr", { ascending: true });

    if (error) {
      console.warn("Gagal mengambil data dari Supabase:", error.message);
      return null;
    }
    return data as SupabaseLaptop[];
  } catch (err) {
    console.warn("Kesalahan koneksi Supabase:", err);
    return null;
  }
}

/**
 * Insert laptop baru ke Supabase melalui secure server endpoint
 */
export async function insertLaptopToSupabase(laptop: Partial<SupabaseLaptop>) {
  const session = typeof window !== "undefined" ? localStorage.getItem("speco_admin_session") || "" : "";
  const res = await fetch("/api/admin/laptops", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-session": session,
    },
    body: JSON.stringify({ laptop }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gagal menambahkan laptop ke database.");
  }
  return json.data as SupabaseLaptop;
}

/**
 * Update data laptop di Supabase melalui secure server endpoint
 */
export async function updateLaptopInSupabase(id: string, updates: Partial<SupabaseLaptop>) {
  const session = typeof window !== "undefined" ? localStorage.getItem("speco_admin_session") || "" : "";
  const res = await fetch("/api/admin/laptops", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-session": session,
    },
    body: JSON.stringify({ id, updates }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gagal memperbarui data laptop di database.");
  }
  return json.data as SupabaseLaptop;
}

/**
 * Batch Merge update beberapa laptop sekaligus ke Supabase via server route
 */
export async function batchMergeLaptopsToSupabase(
  batch: Array<{ id: string; updates: Partial<SupabaseLaptop> }>
) {
  const session = typeof window !== "undefined" ? localStorage.getItem("speco_admin_session") || "" : "";
  const res = await fetch("/api/admin/laptops", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-session": session,
    },
    body: JSON.stringify({ batch }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gagal melakukan merge data ke database.");
  }
  return json;
}

/**
 * Hapus laptop dari Supabase melalui secure server endpoint
 */
export async function deleteLaptopFromSupabase(id: string) {
  const session = typeof window !== "undefined" ? localStorage.getItem("speco_admin_session") || "" : "";
  const res = await fetch(`/api/admin/laptops?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      "x-admin-session": session,
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gagal menghapus laptop dari database.");
  }
  return true;
}

/**
 * Autentikasi Pengguna
 */
export async function signInWithEmail(email: string, pass: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  return await supabase.auth.signInWithPassword({ email, password: pass });
}

export async function signUpWithEmail(email: string, pass: string, name?: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  return await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: { full_name: name || "" },
    },
  });
}

export async function signInWithGoogle(redirectTo?: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const targetUrl =
    redirectTo ||
    (typeof window !== "undefined" ? `${window.location.origin}/` : undefined);

  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: targetUrl,
    },
  });
}

export async function signOutUser() {
  if (!supabase) return;
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

/**
 * Memeriksa apakah user merupakan admin terotorisasi
 * Memanggil server route /api/admin/verify secara aman tanpa hardcode email
 */
export async function isAdminUser(user: User | null | undefined): Promise<boolean> {
  if (!user) return false;

  // 1. Cek cepat metadata lokal dari JWT session
  if (
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin"
  ) {
    return true;
  }

  // 2. Verifikasi ke server API route yang aman
  try {
    const sessionRes = await supabase?.auth.getSession();
    const token = sessionRes?.data.session?.access_token;

    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ token }),
    });

    if (res.ok) {
      const data = await res.json();
      return Boolean(data.authorized);
    }
  } catch {
    // ignore network error
  }

  return false;
}

/**
 * Verifikasi passkey melalui server route /api/admin/passkey (Zero Client Secret Exposure)
 */
export async function verifyPasskeyFromDatabase(passkey: string): Promise<boolean> {
  const cleanKey = (passkey || "").trim();
  if (!cleanKey) return false;

  try {
    const res = await fetch("/api/admin/passkey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey: cleanKey }),
    });

    if (res.ok) {
      const data = await res.json();
      return Boolean(data.valid);
    }
  } catch {
    // ignore network error
  }

  return false;
}
