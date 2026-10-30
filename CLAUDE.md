# SPECO (kode: NEXORA) — Laptop Decision Assistant

@AGENTS.md

Proyek RPL Kelompok 7A. SPECO ("Spec for You") adalah sistem pendukung keputusan (SPK) pemilihan laptop
berdasarkan budget, jurusan, aktivitas, software, dan prioritas pengguna. Pengguna menjawab 5 pertanyaan, melihat
**Profil Kebutuhan** (spek minimum + alasan), lalu rekomendasi laptop dengan skor kecocokan, alasan, dan trade-off.

Repo ini **frontend**, dikerjakan oleh Fahren (frontend developer). Semua data adalah mock. Backend, API, database,
dan perhitungan SAW dikerjakan terpisah; kontraknya ada di `docs/BACKEND.md`.

## Dokumen

| Dokumen | Isi |
| --- | --- |
| `docs/PRD.md` | Spesifikasi utama produk & desain (sumber kebenaran) |
| `docs/BACKEND.md` | Kontrak API untuk tim backend: fungsi `lib/api.ts` → endpoint, bentuk data |
| `docs/DECISIONS.md` | Keputusan desain & teknis yang berlaku per halaman (yang tidak dijawab PRD) |
| `docs/archive/` | Riwayat proses desain (redesign "Live Spec", prompt render). Bukan acuan aktif |

Bagian PRD yang paling sering dipakai: §6–8 alur & rute · §11 anti-design-slop (wajib) · §15–19 Wizard, Profil,
Hasil, Komparasi, Detail · §22–23 design system · §26–28 state, explainability, aksesibilitas · §29 model data.

## Aturan tetap

- Frontend saja di repo ini. **Jangan** membuat backend, API route, database, atau perhitungan SAW kecuali tim
  backend memutuskan lain (lihat `docs/BACKEND.md`).
- Stack: Next.js App Router, TypeScript, Tailwind v4, shadcn/ui, Phosphor (`@phosphor-icons/react`), Zustand,
  Motion (paket `motion`, seperlunya). Jangan menambah library lain tanpa bertanya.
- Semua data dari mock di `data/`, diakses **hanya** lewat `lib/api.ts`. Komponen dan halaman tidak boleh mengimpor
  `@/data/*` secara langsung.
- UI berbahasa Indonesia. Mobile-first. Aksesibel: keyboard, focus ring, kontras AA, `prefers-reduced-motion`.
- Tanpa gradient, glow, glassmorphism, blob, atau 3D dekoratif. Pengecualian yang disetujui Fahren tercatat di
  `docs/DECISIONS.md` (bagian Brand & visual).
- Setelah tiap tahap: jalankan `npm run lint` dan `npm run build`, perbaiki error, lalu ringkas apa yang berubah.

## Cara kerja

- Setiap mengerjakan sesuatu, sebutkan bagian PRD yang diikuti.
- Kalau PRD tidak menjawab sesuatu, **tanya Fahren**, jangan menebak. Catat keputusan baru di `docs/DECISIONS.md`.
- Jangan menimpa atau menghapus file tanpa bertanya.
- Commit setiap penambahan penting (pesan commit jelas). Jangan push tanpa izin.
- Commit hanya atas nama Fahren: **jangan** tambahkan baris `Co-Authored-By` (termasuk Claude) atau atribusi AI lain
  di pesan commit maupun deskripsi PR.
- Halaman QA ada di `/dev` dan `/dev/components` (bukan halaman final).

## Catatan teknis singkat

- Next.js 16 dengan `cacheComponents` aktif. Baca `node_modules/next/dist/docs/` sebelum memakai API Next yang
  belum familiar.
- Tailwind v4: token desain ada di `app/globals.css` (`@theme`), bukan `tailwind.config`.
- `lib/api.ts` memberi jeda palsu 600–2500 ms. Profil pengguna hidup di store Zustand + `sessionStorage`
  (`store/profile.ts`); panggilan dari klien memakai hook `lib/use-api.ts`.
- Skor mock harus konsisten: `matchScore = round(Σ bobot × skor / 100)`; diverifikasi `lib/mock-check.ts` dan
  ditampilkan di `/dev/components`.
- Hal teknis yang mudah terlewat (Reveal clip, varian `tall`, `isolate` di hero, cache gambar): lihat bagian akhir
  `docs/DECISIONS.md`.

## Status

- [x] MVP PRD §31 Must have: Landing, Wizard, Profil Kebutuhan, Analisis, Hasil, Detail, Komparasi.
- [x] Brand SPECO + redesign landing, Hasil, dan Detail (Okt 2026).
- [x] Repo dirapikan untuk fork backend: `docs/BACKEND.md`, `docs/DECISIONS.md`, arsip desain, kode warisan dihapus.
- [ ] Should have: `/jelajah`, `/saya` (data simpanan & keputusan sudah ada di `store/saved.ts`).
- [ ] Sambung ke backend sungguhan (`lib/api.ts`, lihat `docs/BACKEND.md`).
- [ ] Foto produk asli menggantikan render ilustrasi (`lib/laptop-image.ts`, `components/ui/laptop-render.tsx`).
