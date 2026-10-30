# Catatan keputusan desain & teknis

Keputusan yang berlaku saat ini (Okt 2026), dikelompokkan per bagian. Sumber utama tetap [`PRD.md`](PRD.md); dokumen
ini mencatat hal yang tidak dijawab PRD atau sengaja berbeda darinya, beserta alasannya. Riwayat desain lama
(redesign "Live Spec" R1–R4, varian landing A/B/C) ada di [`archive/`](archive/) dan riwayat Git.

## Brand & visual

- **Nama produk di UI = SPECO** ("Spec for You"). Nama kode **NEXORA** tetap dipakai untuk repo, folder, dan kunci
  penyimpanan (`nexora-profile`, `nexora-compare`, `nexora-saved`) agar data pengguna tidak hilang.
- Aset brand: `public/brand/speco-logo.png` (navy, latar terang), `speco-logo-white.png` (latar gelap/kobalt),
  `app/icon.png`, `app/favicon.ico`. Warna brand: blue #2563FF, teal #14B8A6, dark #0B1F3B, latar #F7F5F0.
- Token desain di `app/globals.css` (`@theme`, Tailwind v4):
  - Landing: `canvas` #F7F5F0, `ink-strong` #111111, `ink-soft` #62625C, `canvas-line` #DCDAD2, `data-blue` #1238F5
    (data/skor/pilihan), `signal` kuning = **aksi utama**.
  - Halaman aplikasi: `primary` = kobalt (`--cobalt-600` #0034EB) dan ramp `blue-*` digeser ke kobalt, jadi semua
    halaman memakai satu biru. Di bidang kobalt aksi kedua memakai varian `inverse` dan focus ring kuning
    (`data-tone="cobalt"`).
- Font: Plus Jakarta Sans (teks) + JetBrains Mono (angka/spek; PRD menang atas aturan skill desain yang melarang
  monospace).
- Ikon: **Phosphor**, diimpor per ikon dari `@phosphor-icons/react/dist/ssr/<Nama>` (aman di Server Component).
  Peta konsep → ikon di `lib/icons.ts`. lucide-react sudah dilepas (PRD §30 masih menyebutnya).
- Motion: paket `motion`, token di CSS (`--motion-*`) dan `lib/motion.ts`. Hanya transform/opacity, sekali saat
  masuk viewport, dan selalu ada jalur `prefers-reduced-motion`.
- Aturan anti-slop (PRD §11): tanpa gradient/glow/glass/blob. **Pengecualian yang disetujui Fahren:** blur kaca +
  scrim tipis di navbar landing, scrim keterbacaan di atas foto (hero, CTA, intro Hasil), aksen radial biru sangat
  tipis di section "Satu budget" dan glow tipis di belakang laptop "SPECO bukan toko".

## Gambar

- **Render katalog** (ilustrasi AI, bukan foto produk): `public/images/laptops/{bentuk}-{warna}-{sudut}.webp`, latar
  diratakan ke `studio` #EEF0F4, 4:3. Mock laptop punya `image: { shape, color }`; manifest, cadangan sudut (warna
  tidak pernah ditukar), dan alt "Ilustrasi … bukan foto produk asli" di `lib/laptop-image.ts`. Render katalog
  selalu berlabel "Ilustrasi".
- **Foto editorial** (aset Fahren, dibuat dengan AI): hero (`public/images/laptops/premium/hero-*.webp`), section
  bukan toko, CTA akhir, intro Hasil. File mentah ada di `img/` dan `img-laptopherosection/` (di-ignore), diolah
  dengan Python + Pillow (perbesar Lanczos + penajaman halus, WebP q86–90).
- Ganti nama file bila isi gambar berubah: optimizer gambar Next dan browser meng-cache per URL.
- `next/image`: pakai `loading="eager"` + `fetchPriority` untuk gambar di atas lipatan (prop `priority` deprecated
  di Next 16). Kualitas yang dipakai harus terdaftar di `images.qualities` (`next.config.ts`).

## Landing `/`

Urutan section: hero → "Satu budget. Banyak kemungkinan." → Cara Kerja → pratinjau 5 pertanyaan → rekomendasi
(ter-pin) → transparansi bobot → "SPECO bukan toko" → CTA akhir. Data landing diambil di server lewat
`getLandingSample()` (`components/landing/sample-data.ts`, `"use cache"`), jadi `/` tetap prerender statis.

- **Navbar** (`landing-nav.tsx`): selebar layar, transparan di atas hero dengan scrim tipis, lalu putih hangat + blur
  + garis bawah setelah scroll 48 px (72 → 64 px). Nada teks mengikuti slide hero lewat `HeroToneProvider`.
- **Hero**: 5 kisaran budget dengan foto meja kerja; 6 detik/slide digerakkan `animationend` garis progres
  (jeda saat hover/fokus/tab tersembunyi), kelima foto ditumpuk agar tanpa kedipan. Semua tier `tone: "dark"`:
  teks putih di atas scrim kiri+bawah di desktop, di atas bidang `paper` gelap di mobile. Wadah foto wajib
  `isolate`; tanpa itu, saat skala scroll = 1 Motion menulis `transform: none` dan foto naik di atas scrim.
- **Satu budget**: slider Rp6–20 jt + chip kebutuhan → 3 kartu pratinjau. Kecocokan dari mock `budgetNeedFit`
  (angka skenario mock bila ada); komponen hanya menyaring harga ≤ budget + 10% lalu mengurutkan, **bukan SAW**.
  Gambar kartu dipaksa tiga bentuk berbeda per halaman (`assignRenders`) sebagai placeholder.
- **Cara Kerja**: 3 kolom dengan garis progres bersegmen, pola tablist (hover dengan jeda niat 140 ms / klik /
  panah), sorotan meluncur (`layoutId`), takik panel detail mengikuti langkah; mobile = timeline vertikal.
- **Rekomendasi ter-pin** hanya di varian `tall` (lg + tinggi ≥ 800 px + tanpa reduced motion). Di layar pendek
  memakai tata letak statis agar kartu tidak keluar section.
- **SPECO bukan toko**: Server Component; gerak di `not-a-store-visuals.tsx`. Prinsip berupa tautan ke bukti di
  halaman (#rekomendasi, #transparansi, #cara-kerja). Fakta = hal yang memang benar di produk (5 pertanyaan,
  jumlah kriteria, 1 tujuan), bukan statistik karangan.
- **CTA akhir** (`#mulai`): satu bidang foto, teks rata tengah di langit, tombol kuning. Laptop menyatu dengan
  foto, jadi paralaks/miring kursor diterapkan ke lapisan foto (`final-cta-scene.tsx`).
- `Reveal` varian clip memberi masker `pb-4 -mb-4` agar ekor huruf judul tidak terpotong. Elemen yang diamati
  `useInView` harus di luar elemen ber-clip-path/scale nol (IntersectionObserver tidak mendeteksinya).

## Wizard `/rekomendasi/[step]` (PRD §15)

- Route group `app/rekomendasi/(wizard)/` dengan `WizardShell` di layout (tetap terpasang antar langkah).
- Store `skipHydration` + `rehydrateProfile()`; isi langkah dirender `hidden` sampai terhidrasi.
- `answered[]` menentukan status "selesai" di stepper; `?budget=` / `?jurusan=` hanya mengisi langkah yang belum
  dijawab.
- Prioritas: mode `rank` (maks 3, `weight: null`, bobot urusan backend) atau `weights` ("Atur bobot detail",
  9 slider, rebalance proporsional di `lib/weights.ts`).
- Saran software hanya berdasarkan jurusan (`suggestedFor`).

## Profil Kebutuhan `/rekomendasi/profil` (PRD §16)

- Konten di-remount dengan `key` budget+jurusan+percobaan, jadi "Naikkan budget" dan "Coba lagi" memuat ulang.
- Kompromi disimpan di store (`compromises[]`); banner berubah jadi catatan yang bisa dibatalkan.
- Mock tambahan: Desain dengan budget < Rp10 jt mendapat peringatan GPU (saran naik ke Rp15 jt).
- Penjelasan istilah memakai `<details>` agar bisa dibuka dengan keyboard dan sentuhan (PRD menyebut tooltip).
- Alasan spek masih teks statis per persona.

## Analisis `/rekomendasi/analisis` (PRD §14, §25)

- 4 tahap selesai di 0,7/1,3/1,9/2,5 detik; tahap terakhir menunggu `getRecommendations()`, lalu
  `router.replace("/rekomendasi/hasil")` (Back dari Hasil kembali ke Profil).
- Hasil diserahkan lewat `store/results.ts` (memori, dicocokkan dengan `profileKey()`).
- Angka di teks tahap dari katalog mock (12 laptop), bukan "50 laptop" seperti copy PRD.
- `?hold=1` berhenti di tahap 3, `?hold=best` menampilkan Best Match tanpa redirect (untuk review).

## Hasil `/rekomendasi/hasil` (PRD §17, §26, §27)

- Alur: intro (foto + ringkasan jawaban + "Ubah kebutuhan" ke Wizard dengan jawaban tetap) → Best Match (gambar |
  info | skor + `subScores`) → alasan + trade-off → alternatif (pill merek maks 4 + "Lainnya", urutan
  skor/harga/performa/portabilitas) → CTA bandingkan → `CompareBar` menempel mulai 2 laptop dipilih.
- **Tidak ada persona contoh** (switch persona dihapus); halaman memakai jawaban pengguna sendiri.
- Label breakdown mengikuti data: `budgetFit` = "Sesuai budget".
- Badge alternatif = kategori hasil + satu keunggulan relatif (maks/min biasa: paling ringan, paling hemat,
  baterai terbesar, CPU tertinggi), bukan SAW.
- CTA bandingkan tanpa pilihan = Best Match + 2 alternatif teratas.
- `?mock=empty`: saran dari `getNoResultSuggestions()`; tombol "Longgarkan/Naikkan budget" mengubah store.

## Detail `/laptop/[slug]` (PRD §19, §27)

- Laporan rekomendasi personal, bukan halaman toko. Hero ringkas (info | galeri | panel skor) → "Cocok untuk
  kebutuhanmu" + trade-off → "Kebutuhanmu vs laptop ini" (tabel di md+, kartu di mobile) + "Kenapa skornya X%?"
  (breakdown berbobot + penjelasan buka-tutup) → spesifikasi + dialog lengkap → kelebihan/kekurangan →
  alternatif → CTA bandingkan.
- Galeri: 1 gambar + panah (hanya bila ada sebelum/sesudah) + thumbnail + panah keyboard, crossfade, tanpa autoplay.
- Daftar periksa memakai `checks` di Profil Kebutuhan dan `lib/spec-check.ts` (nilai ≥ min). Tanpa ambang =
  "Tidak dicek".
- `generateStaticParams` dari `getLaptopSlugs()`; slug tak dikenal → "Laptop tidak ditemukan".
- Laptop di luar hasil: tanpa skor, daftar periksa tetap tampil. Profil kosong: ajakan isi Wizard.

## Komparasi `/bandingkan?ids=` (PRD §18)

- `lib/compare-rows.ts` menyusun baris (status ✓/✕ dari spec-check + budget; "Unggul" = nilai terbaik per baris
  lewat maks/min biasa, bukan SAW). Desktop tabel dengan header sticky; mobile kartu per kriteria.
- "Pilih laptop ini" disimpan sebagai `decision` di `store/saved.ts`.

## Data & lapisan API

- Semua data lewat `lib/api.ts`; komponen tidak mengimpor `data/*`. Kontrak untuk backend: [`BACKEND.md`](BACKEND.md).
- Fungsi konfigurasi (`getWizardOptions`, `getBudgetInsight`, dll.) sinkron; fungsi data async dengan jeda palsu
  600–2500 ms agar state loading terlihat. `?mock=error|empty` memaksa state error/kosong (PRD §26).
- Skor mock harus konsisten: `matchScore = round(Σ bobot × skor / 100)`, dicek `lib/mock-check.ts` di `/dev/components`.
- Simpan, bandingkan, dan keputusan memakai umpan balik inline/aria-live, tanpa toast.

## Hal teknis yang mudah terlewat

- Next.js 16 dengan `cacheComponents`. Baca `node_modules/next/dist/docs/` sebelum memakai API yang belum familiar.
- Varian Tailwind kustom dengan media query majemuk harus memakai bentuk blok `@custom-variant x { @media … { @slot; } }`;
  bentuk singkat tidak menghasilkan utility.
- Tailwind v4 memakai properti CSS `translate`/`scale` untuk utilitas transform, bukan `transform`.
- Saat menambah komponen shadcn, jawab "tidak" bila diminta menimpa `components/ui/button.tsx` (sudah kustom).

## Arsitektur: Transisi dari Laravel ke Next.js Full-Stack + Supabase Cloud (ADR-001)

- **Keputusan**: Mengonversi backend dari PHP Laravel 12 (DDEV / MariaDB) menjadi arsitektur terpadu Next.js 16 Route Handlers (`app/api/*`) dengan managed database Supabase Cloud PostgreSQL.
- **Rasional**:
  1. Menghilangkan kebutuhan mengelola VPS / dedicated server fisik dengan konfigurasi OS Linux manual (Nginx, PHP-FPM, supervisord, SSL).
  2. Memungkinkan deployment serverless terpadu (Vercel / Cloudflare) dengan biaya $0 dan reliabilitas tinggi tanpa resiko server crash.
  3. Menghilangkan latensi jaringan lintas domain (CORS) antara server frontend dan backend terpisah.
  4. Database 450 laptop terkelola aman pada Supabase Cloud kawasan Asia Tenggara dengan connection pooler PgBouncer dan Row Level Security (RLS).
  5. Fitur audit data null, live image preview, filter kelengkapan, dan batch merge Excel berjalan langsung via serverless endpoint `/api/admin/laptops`.
