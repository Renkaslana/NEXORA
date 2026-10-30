-- ==============================================================================
-- SPECO SUPABASE SCHEMA MIGRATION
-- Database: PostgreSQL (Supabase Cloud)
-- Proyek: SPECO - Laptop & Computer Advisor Mahasiswa
-- ==============================================================================

-- 1. Buat Tabel Utama: laptops (Katalog 450 Perangkat Laptop & Mini PC)
CREATE TABLE IF NOT EXISTS public.laptops (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    series TEXT,
    category TEXT NOT NULL,
    major_target TEXT,
    device_type TEXT DEFAULT 'Laptop',
    cpu TEXT NOT NULL,
    gpu TEXT NOT NULL,
    is_dedicated_gpu BOOLEAN DEFAULT false,
    ram_gb NUMERIC(5,1) NOT NULL DEFAULT 8.0,
    ram_upgradable BOOLEAN DEFAULT false,
    storage TEXT NOT NULL,
    display TEXT,
    weight_kg NUMERIC(4,2) DEFAULT 1.40,
    price_idr BIGINT NOT NULL,
    image_url TEXT,
    buy_url TEXT,
    warranty TEXT,
    usecase_tag TEXT,
    pros TEXT,
    cons TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pastikan kolom device_type tersedia
ALTER TABLE public.laptops ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'Laptop';

-- 2. Indeks untuk Query Pencarian & Filter Cepat
CREATE INDEX IF NOT EXISTS idx_laptops_brand ON public.laptops (brand);
CREATE INDEX IF NOT EXISTS idx_laptops_price ON public.laptops (price_idr);
CREATE INDEX IF NOT EXISTS idx_laptops_device_type ON public.laptops (device_type);

-- 3. Aktifkan Row Level Security (RLS) pada laptops
ALTER TABLE public.laptops ENABLE ROW LEVEL SECURITY;

-- Publik BACA SAJA seluruh katalog
DROP POLICY IF EXISTS "Izinkan publik membaca katalog laptop" ON public.laptops;
CREATE POLICY "Izinkan publik membaca katalog laptop"
ON public.laptops
FOR SELECT
TO public
USING (true);

-- Hanya admin terotentikasi yang boleh memodifikasi (Insert, Update, Delete)
DROP POLICY IF EXISTS "Izinkan admin mengelola katalog laptop" ON public.laptops;
DROP POLICY IF EXISTS "Hanya admin terotentikasi yang boleh mengubah data laptop" ON public.laptops;
CREATE POLICY "Hanya admin terotentikasi yang boleh mengubah data laptop"
ON public.laptops
FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'admin')
);

-- 4. Tabel Khusus: admin_users (Daftar Akun Otoritas Admin)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Pengguna terotentikasi hanya dapat membaca status admin miliknya sendiri
DROP POLICY IF EXISTS "User hanya bisa baca status admin sendiri" ON public.admin_users;
CREATE POLICY "User hanya bisa baca status admin sendiri"
ON public.admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. Tabel Khusus: admin_passkeys (Tersimpan Privat - Hanya diakses Server-Side via Service Role)
CREATE TABLE IF NOT EXISTS public.admin_passkeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passkey TEXT NOT NULL,
    label TEXT DEFAULT 'Passkey Otoritas',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_passkeys ENABLE ROW LEVEL SECURITY;
-- Catatan: Tabel admin_passkeys tidak memiliki policy untuk anon/public.
-- Verifikasi hanya dilakukan secara privat di server (Next.js API route) menggunakan Service Role Key.

-- 6. Tabel Pendukung: bookmarks (Simpan Laptop Favorit Mahasiswa)
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    laptop_id TEXT REFERENCES public.laptops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks (user_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pengguna dapat mengelola bookmark sendiri" ON public.bookmarks;
CREATE POLICY "Pengguna dapat mengelola bookmark sendiri"
ON public.bookmarks
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
