# Dokumentasi Arsitektur Backend & Integrasi SPECO

Dokumen ini mendokumentasikan implementasi backend, integrasi database, dan mesin algoritma Sistem Pendukung Keputusan (SPK) pada platform SPECO.

> **Status Implementasi:** SELESAI & TERINTEGRASI PENUH (ACCEPTED & IMPLEMENTED).  
> Seluruh fungsionalitas yang sebelumnya dirancang pada Laravel 12 telah berhasil dikonversi ke **Next.js 16 Route Handlers Full-Stack** dan terhubung ke **Supabase Cloud (PostgreSQL Managed)**.

---

## 1. Arsitektur Terpadu (Unified Modern Serverless)

Sistem beroperasi dengan topologi *serverless* terpadu tanpa memerlukan dedicated VPS atau server mandiri:

```text
Browser Client (Next.js 16 UI)
  │
  ├───► Next.js Route Handlers (app/api/*)
  │       ├─── /api/recommendation   (Algoritma SPK SAW Multi-Kriteria)
  │       ├─── /api/laptops          (Katalog Publik 450 Laptop)
  │       ├─── /api/admin/laptops    (CRUD & Batch Merge Excel via Service Role)
  │       ├─── /api/admin/passkey    (Verifikasi Passkey Tim dari Database)
  │       └─── /api/admin/verify     (Verifikasi Token Google OAuth Admin)
  │
  └───► Supabase Cloud PostgreSQL (AWS Singapore ap-southeast-1)
          ├─── public.laptops        (450 Data Perangkat Lengkap)
          ├─── public.admin_users    (Otoritas Akun Admin)
          ├─── public.admin_passkeys (Passkey Terenkripsi)
          └─── PgBouncer Pooler      (Port 6543, Transaksi Konkuren)
```

---

## 2. Alasan Strategis Transisi dari Laravel ke Next.js + Supabase

1. **Efisiensi Deployment & Biaya Operasional**:
   - Backend Laravel memerlukan sewa Dedicated Server atau VPS Linux dengan konfigurasi manual: Nginx, PHP-FPM 8.4, supervisord, Certbot SSL, dan MariaDB lokal.
   - Solusi Next.js 16 Full-Stack + Supabase Cloud dapat langsung di-deploy secara *serverless* ke platform edge (Vercel / Cloudflare) dengan biaya $0 dan garansi ketersediaan 99.9%.
2. **Ketiadaan Latensi CORS & Beban Runtime Ganda**:
   - Menghilangkan *cross-origin network round-trip* antara domain frontend dan backend.
   - Menyatukan *toolchain* dan pengujian ke dalam satu ekosistem TypeScript murni.
3. **Keandalan Database**:
   - Supabase Cloud menyediakan PostgreSQL 15 terkelola dengan koneksi pooler PgBouncer bawaan, isolasi Row Level Security (RLS), dan automasi pencadangan data.

---

## 3. Spesifikasi Endpoint API (Route Handlers)

### 3.1 Rekomendasi SPK SAW (`POST /api/recommendation`)
Menghitung skor kecocokan matematis menggunakan metode Simple Additive Weighting (SAW) berdasarkan jawaban kuesioner pengguna.

* **Request Body**:
  ```json
  {
    "budget": 12000000,
    "major": "Informatika",
    "software": ["vscode", "docker", "android-studio"],
    "priorities": ["performa", "ram", "portabilitas"]
  }
  ```
* **Respons**:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Rekomendasi laptop berhasil dihitung",
    "data": {
      "best_match": { "id": "LP206", "model": "...", "score": 94.2 },
      "alternatives": [ ... ]
    }
  }
  ```

---

### 3.2 Katalog Publik (`GET /api/laptops`)
Mengambil daftar perangkat dari dataset katalog dengan dukungan filter query parameter.

* **Query Parameters**:
  - `brand` (string, opsional): Filter merek (misal `asus`, `lenovo`).
  - `search` (string, opsional): Pencarian nama model, prosesor, atau kartu grafis.
  - `minPrice` & `maxPrice` (number, opsional): Rentang harga pasar.
  - `limit` (number, default: 50): Jumlah data per halaman.

---

### 3.3 Konsol Admin & Batch Merge (`/api/admin/laptops`)
Endpoint aman khusus staf untuk operasi manipulasi database dengan proteksi `SPECO_SUPABASE_SERVICE_ROLE_KEY`.

* **`GET /api/admin/laptops`**: Mengambil seluruh 450 data terkini dari Supabase Cloud dengan header `cache: no-store`.
* **`PUT /api/admin/laptops`**: Memperbarui spesifikasi laptop tunggal (pros, cons, image_url, harga, dll.).
* **`POST /api/admin/laptops` (Mode Single Upsert)**: Menambahkan unit baru ke katalog.
* **`POST /api/admin/laptops` (Mode Batch Merge)**:
  - Menerima payload `{ batch: [{ id, updates }] }` hasil *parsing* berkas Excel (.xlsx).
  - Mengeksekusi merge secara non-destruktif dalam *chunk* paralel (15 mutasi per batch).
  - Hanya memperbarui kolom yang memiliki isi baru tanpa menimpa data lama yang sudah tersimpan.
* **`DELETE /api/admin/laptops?id=LPxxx`**: Menghapus perangkat dari database.

---

### 3.4 Otentikasi Staf (`/api/admin/passkey` & `/api/admin/verify`)
* **`POST /api/admin/passkey`**:
  - Memverifikasi passkey staf secara langsung terhadap tabel `public.admin_passkeys` di Supabase.
  - Memeriksa kesesuaian terhadap variabel lingkungan privat `SPECO_ADMIN_PASSKEY`.
* **`POST /api/admin/verify`**:
  - Memvalidasi token JWT pengguna Google OAuth.
  - Memeriksa hak akses pada metadata pengguna dan tabel `public.admin_users`.

---

## 4. Variabel Lingkungan Wajib (`.env.local`)

```env
# URL Akses Publik
NEXT_PUBLIC_SUPABASE_URL="https://jirpzpqnrnzcsgiecogm.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<public-anon-key>"

# Kredensial Privat Server (Never exposed to browser bundle)
SPECO_SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
SPECO_ADMIN_PASSKEY="speco-admin-2026"
```

---

<p align="center">
  <strong>TIM SPECO (Kelompok 7A) - Universitas Harkat Negeri</strong>
</p>
