# NEXORA — Laptop Decision Assistant

@AGENTS.md

Proyek RPL Kelompok 7A. NEXORA adalah sistem pendukung keputusan (SPK) pemilihan
laptop berdasarkan budget, jurusan, aktivitas, software, dan prioritas pengguna.
Pengguna menjawab 5 pertanyaan, melihat **Profil Kebutuhan** (spek minimum + alasan),
lalu rekomendasi laptop dengan skor kecocokan, alasan, dan trade-off.

Repo ini **frontend saja**, dikerjakan oleh Fahren (frontend developer). Semua data
adalah mock. Backend, API, database, dan perhitungan SAW dikerjakan anggota lain.

## Sumber utama: `docs/PRD.md`

PRD adalah spesifikasi utama dan batasan desain (bukan desain final; tidak ada Figma).
Komposisi baru boleh diusulkan selama token warna, font, radius, shadow, dan aturan
anti-slop dipatuhi. Bagian yang paling sering dipakai:

| Bagian | Isi |
| --- | --- |
| §6–8 | User journey, information architecture, sitemap/rute |
| §11 | Anti-design-slop (wajib dipatuhi) |
| §12–13 | Konsep landing, arah visual "Clear Spec" |
| §15–19 | Wizard, Profil Kebutuhan, Hasil, Komparasi, Detail |
| §22–23 | Design system, inventaris komponen |
| §26–28 | State loading/empty/error, explainability, aksesibilitas |
| §29–30 | Struktur mock data, keputusan teknis, struktur folder |
| §34 | Checklist kualitas desain |

## Aturan tetap

- Frontend saja. **Jangan** buat backend, API route, database, atau perhitungan SAW.
- Stack: Next.js App Router, TypeScript, Tailwind, shadcn/ui, lucide-react, Zustand,
  Framer Motion (paket `motion`, seperlunya). Jangan menambah library lain tanpa bertanya.
- Semua data dari mock di `data/`, diakses **hanya** lewat `lib/api.ts`. Komponen dan
  halaman tidak boleh mengimpor `@/data/*` secara langsung.
- UI berbahasa Indonesia. Mobile-first. Aksesibel: keyboard, focus ring, kontras AA.
- Tanpa gradient, glow, glassmorphism, blob, atau 3D dekoratif.
- Setelah tiap tahap: jalankan `npm run lint` dan `npm run build`, perbaiki error,
  lalu ringkas apa yang berubah.

## Cara kerja

- Setiap mengerjakan sesuatu, sebutkan bagian PRD yang diikuti.
- Kalau PRD tidak menjawab sesuatu, **tanya Fahren**, jangan menebak.
- Jangan menimpa atau menghapus file tanpa bertanya.
- Commit setiap penambahan penting (pesan commit jelas). Jangan push tanpa izin.
- Halaman eksplorasi/QA ada di `/dev/*` (bukan halaman final).

## Catatan teknis

- Next.js 16 dengan `cacheComponents` aktif. Baca `node_modules/next/dist/docs/`
  sebelum memakai API Next yang belum familiar.
- Tailwind v4: token desain ada di `app/globals.css` (`@theme`), bukan `tailwind.config`.
- `lib/api.ts` memberi jeda palsu 600–2500 ms. Profil pengguna hidup di store Zustand +
  `sessionStorage` (`store/profile.ts`); panggilan dari klien memakai hook `lib/use-api.ts`.
- Skor mock harus konsisten: `matchScore = round(Σ bobot × skor / 100)`; diverifikasi
  oleh `lib/mock-check.ts` dan ditampilkan di `/dev/components`.

## Status

- [x] Tahap 0 — scaffold + CLAUDE.md
- [x] Tahap 1 — fondasi (token, tipe, mock data, `lib/api.ts`, komponen, `/dev/components`)
- [x] Tahap 2 — tiga varian landing di `/dev/landing-a|b|c`
- [x] Landing final di `/`: varian A (Hybrid) + preview langsung dari C, dipilih Fahren.
  Varian `/dev/landing-*` disimpan sebagai arsip; indeks dev di `/dev`.
- [x] Wizard `/rekomendasi/budget|jurusan|aktivitas|software|prioritas` + store.
- [ ] Berikutnya: Profil Kebutuhan `/rekomendasi/profil` (tunggu persetujuan rencana Fahren).

Wizard (PRD §15):
- Route group `app/rekomendasi/(wizard)/` dengan `WizardShell` di layout (tetap terpasang antar
  langkah). `params` di-await di dalam `<Suspense>` dan metadata statis, mengikuti validasi
  instant navigation Next 16. Profil/Analisis/Hasil nanti di luar group ini.
- Store `skipHydration` + `rehydrateProfile()`; isi langkah dirender tapi `hidden` sampai terhidrasi.
- `answered[]` menentukan status "selesai" di stepper; `?budget=`/`?jurusan=` hanya mengisi
  langkah yang belum dijawab.
- Prioritas: mode "rank" (tombol naik/turun, maks 3, `weight: null` — bobot urusan backend) atau
  "weights" ("Atur bobot detail", 9 slider, mulai rata, rebalance proporsional di `lib/weights.ts`).
- Saran software hanya berdasarkan jurusan (`suggestedFor`); data software belum punya pemetaan aktivitas.

Landing final: chip preset mengubah kartu Profil Kebutuhan (persona Informatika); badge skor
94% hanya di tier Rp8–10 jt (satu-satunya tier dengan skenario hasil), tier lain menampilkan
jumlah laptop di katalog. CTA membawa `?budget=` (dan `&jurusan=` dari baris persona) ke Wizard.

Catatan keputusan:
- `type-display-xl` (96px desktop) adalah token tambahan khusus varian B, bukan bagian PRD §22.
- `lib/api.ts`: `getWizardOptions()` dan `getBudgetInsight()` sinkron (konfigurasi statis & umpan
  balik slider real-time); fungsi data lain async dengan jeda 600–2500 ms.
- Landing A/B mengambil data lewat `lib/api.ts` di server dengan `"use cache"` (prerender statis);
  C memanggil API di klien dan meng-cache 5 preset sekaligus.
- Skill `design-taste-frontend` melarang monospace, border 1px, dan label kecil di atas judul;
  di proyek ini PRD menang (JetBrains Mono, kartu ber-border, label hero §13).
