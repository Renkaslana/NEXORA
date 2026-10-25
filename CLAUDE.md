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
- Stack: Next.js App Router, TypeScript, Tailwind, shadcn/ui, Phosphor (`@phosphor-icons/react`; lucide-react
  sedang dilepas bertahap), Zustand,
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
- Commit hanya atas nama Fahren: **jangan** tambahkan baris `Co-Authored-By` (termasuk Claude)
  atau atribusi AI lain di pesan commit maupun deskripsi PR.
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
- [x] Profil Kebutuhan `/rekomendasi/profil` (PRD §16).
- [x] Layar Analisis `/rekomendasi/analisis` (PRD §14, §25).
- [x] Hasil `/rekomendasi/hasil` + Compare Tray (PRD §17).
- [x] Detail `/laptop/[slug]` + Score Breakdown (PRD §19, §27).
- [x] Komparasi `/bandingkan?ids=` (PRD §18). **MVP §31 Must have selesai.**
- [x] QA akhir: alur demo Landing → Wizard → Profil → Analisis → Hasil → Detail → Komparasi
  lolos; anti-slop & akses data dicek; tautan `/jelajah` disembunyikan sampai halamannya ada.
- [x] Push ke GitHub: https://github.com/Renkaslana/NEXORA (branch `main`).
- [ ] Should have: `/jelajah`, `/saya` (data simpanan & keputusan sudah ada di `store/saved.ts`).
- [ ] Redesign "Live Spec" (`docs/REDESIGN.md`, keputusan §30 disetujui Fahren):
  - [x] R1 Fondasi: token, Phosphor + `IconTile`, `NeedMeter`, `LaptopRender` (dipakai di Hasil, hero,
    Detail), `MoodPhoto`, Button/SelectCard baru, semua di `/dev/components`.
  - [x] R2 Landing: hero hybrid + callout meter, "Spek saja tidak menjawab", cerita ter-pin, persona
    berfoto, band gelap, CTA dengan render.
  - [ ] R3 Wizard/Profil/Analisis · [ ] R4 Hasil/Detail/Komparasi · [ ] R5 Should have

Redesign "Kalimat terbelah" (Okt 2026, disetujui Fahren; menggantikan tampilan R2 landing + Analisis R3):
- Palet: bidang kobalt `--cobalt-600` #0034EB (hero, Analisis, CTA) + kuning `--signal` #E9E34A hanya untuk
  aksi utama (Button `signal`); di bidang kobalt aksi kedua `inverse`, focus ring kuning (`data-tone="cobalt"`).
  Navbar/FlowHeader punya `tone="cobalt"`. Halaman lain belum ikut (R4).
- Landing: hero = kalimat "Laptop buat kuliahmu, / pas di budget-mu." dibelah bingkai studio (h1 sr-only,
  belahan visual aria-hidden). Interaksi utama "Laptop buat ___" (`getSoftwareNeeds()`, mock
  `softwareLoadNeeds` di data/landing.ts: filter ≥ ambang, bukan SAW). CTA penutup = kalimat dengan isian.
- Foto suasana `scene-*` dibuat dengan Gemini 3.1 Flash Image lewat Figma `generate_image` (kredit AI Figma
  akun Kevin), berwarna asli, selalu berlabel "Ilustrasi AI" (`MoodPhoto label`).
- Analisis: kartu profil tercetak → garis budget kuning menyapu katalog → hasil diurutkan skor (layout
  animation) → Best Match mengisi bingkai (`HIGHLIGHT_MS` 1000). `?hold=1` berhenti di tahap 3, `?hold=best`
  menampilkan Best Match tanpa redirect.

Redesign R2 Landing (REDESIGN §15–16), keputusan Fahren:
- Section "Garis kebutuhanmu" digabung ke hero: preset budget menggerakkan render (crossfade), garis
  kebutuhan di 3 callout (CPU/RAM/SSD), dan kartu Profil. Callout melayang hanya di lg+; di bawahnya
  meter masuk ke kartu (CPU tampil mulai md).
- Profil kelima preset, kasus, dan persona diambil di server (`getLandingSample()`, `"use cache"`), jadi
  hero tanpa skeleton dan `/` tetap statis. Kasus & kebutuhan khas persona di `data/landing.ts`
  (`getLandingContent()`); meter dikirim sebagai `MeterRowData` (skala lewat id, bisa diserialisasi).
- Kasus Dinda memakai meter bobot arah "maks" (`WEIGHT_SCALE`, batas 1,4 kg dari kebutuhan persona).
- Cerita ter-pin: wrapper 300vh + sticky di md+, dipilih lewat CSS (`md:` / `motion-reduce:`) agar
  tanpa beda server/klien; mobile & reduced motion = tiga blok statis. UI asli diskalakan ke
  `FRONT_SCREEN_RECT`.
- `Reveal` mengamati elemen luar; varian "clip" memakai masker overflow + translateY. Elemen yang
  tersembunyi lewat clip-path/scale nol tidak terdeteksi IntersectionObserver.
- Reveal hero memakai keyframe CSS (tw-animate-css) agar render tampil sebelum hidrasi (LCP).
- `type-display-xl` 64px di lg, 80px baru di xl agar "kebutuhanmu." muat di setengah kolom.

Redesign R1 (REDESIGN §9–14, §24), keputusan Fahren:
- Render laptop dibuat Fahren dengan Gemini (mentah di `img/`, di-ignore). Diproses di luar repo
  (Python + Pillow): latar diratakan ke `studio` #EEF0F4, 4:3, WebP → `public/images/laptops/
  {bentuk}-{warna}-{sudut}.webp`. Status per sudut: `docs/MIDJOURNEY_PROMPTS.md` §0.
- Mock laptop punya `image: { shape, color }`; `imageUrl` = render `34`. Manifest, cadangan sudut
  (warna tidak pernah ditukar), dan alt "Ilustrasi … bukan foto produk asli" di `lib/laptop-image.ts`.
- Render selalu di bidang `bg-studio`, berlabel "Ilustrasi". `next/image` memakai `loading="eager"` +
  `fetchPriority` (prop `priority` deprecated di Next 16).
- Foto suasana: campuran CC0 StockSnap + Gemini, duotone biru-950 seragam, `public/images/mood/`,
  metadata + kredit di `lib/mood-photos.ts`.
- Ikon Phosphor diimpor per ikon dari `@phosphor-icons/react/dist/ssr/<Nama>` (aman di Server Component,
  tanpa barrel). Peta konsep → ikon/kategori di `lib/icons.ts`.
- `NeedMeter` mengamati track dengan `useInView` (bukan `whileInView` pada fill ber-scaleX(0), yang
  tidak terdeteksi IntersectionObserver). Status near = dalam 10% di bawah kebutuhan.
- Token motion di CSS var (`--motion-*`, `ease-out`) dan `lib/motion.ts` untuk Motion.

Komparasi (PRD §18): `lib/compare-rows.ts` menyusun baris (status ✓/✕ dari spec-check + budget,
"Unggul" = nilai terbaik per baris lewat maks/min biasa, bukan SAW). Desktop tabel dengan header
sticky; mobile mode kartu per kriteria. "Pilih laptop ini" disimpan sebagai `decision` di
`store/saved.ts` (localStorage, versi 2).

Detail (PRD §19, §27, §14), keputusan Fahren:
- `generateStaticParams` dari `getLaptopSlugs()`; slug tak dikenal → `not-found.tsx` (copy §26).
- Daftar periksa ✓/✕ memakai ambang terstruktur di mock (`checks` pada RequirementProfile,
  `specChecks` di data/mock-requirements.ts) dan `lib/spec-check.ts` yang hanya membandingkan
  nilai ≥ min. Komponen tanpa ambang = "Tidak dicek".
- Bagian 5–8 (Spesifikasi kunci, Kelebihan & kekurangan, Cocok untuk, Spesifikasi lengkap) =
  tabs di ≥ md, accordion di mobile (`components/ui/tabs.tsx`, `accordion.tsx`, shadcn disesuaikan).
- Laptop di luar hasil profil: tanpa skor/breakdown, daftar periksa tetap tampil. Profil kosong:
  ajakan isi Wizard.
- Mobile: bar CTA (Bandingkan, Simpan) menempel di bawah; `CompareTray raised` menumpuk di atasnya.

Hasil (PRD §17, §26, §27), keputusan Fahren:
- Data dari `store/results.ts` bila `profileKey` cocok; selain itu `getRecommendations()` + skeleton.
- Switch persona hanya mengganti tampilan (jawaban di store tidak berubah).
- Bar filter (merek, ukuran layar, urutan) di atas alternatif; Best Match selalu tampil.
- Simpan: `store/saved.ts` (localStorage, §20) dengan umpan balik inline/aria-live, tanpa toast.
- Compare Tray: `store/compare.ts` (sessionStorage, maks 3, ringkasan laptop disimpan);
  mobile bar bawah tertutup default, desktop kotak kanan bawah. "Bandingkan (N)" ke
  `/bandingkan?ids=` aktif mulai 2 laptop. Efek "terbang" ke tray belum dibuat.
- Modal "Bagaimana skor dihitung?" memakai `components/ui/dialog.tsx` (shadcn, disesuaikan:
  tanpa blur, radius modal 16px, label Indonesia). Menampilkan contoh breakdown Best Match.
- `?mock=empty`: saran dari `getNoResultSuggestions()` (filter keras + preset berikutnya);
  Longgarkan/Naikkan budget mengubah store lalu menghapus `?mock`.
- Saat menambah komponen shadcn, jawab "tidak" bila diminta menimpa `button.tsx` (kustom).

Analisis (PRD §14, §25, §26):
- 4 tahap (`AnalyzingSteps`) selesai di 0,7/1,3/1,9/2,5 detik; tahap terakhir menunggu
  `getRecommendations()`. Lalu `router.replace("/rekomendasi/hasil")`, jadi Back dari Hasil ke Profil.
- Hasil diserahkan lewat `store/results.ts` (memori saja, `profileKey()` untuk mencocokkan profil).
  Hasil harus memakai data itu bila key cocok, dan memuat ulang dengan skeleton bila tidak ada.
- Angka di teks tahap dari katalog mock (12 laptop), bukan "50 laptop" seperti copy PRD (disetujui Fahren).
- `?mock=error` menampilkan error §26; `?mock=empty` diteruskan ke `/rekomendasi/hasil?mock=empty`.
- `StateMessage` (`components/ui/state-message.tsx`) dan `firstMissingStep()` dipakai bersama
  Profil dan Analisis.
- Selama `/rekomendasi/hasil` belum dibuat, URL itu ditangkap rute dinamis `[step]` dan menjadi 404.

Profil Kebutuhan (PRD §16, §26):
- `ProfileView` di luar route group Wizard; header bersama `FlowHeader`. `?mock=error` didukung.
- Konten di-remount dengan `key` budget+jurusan+percobaan, jadi "Naikkan budget" dan "Coba lagi"
  memuat ulang lewat `getRequirements()`. CTA hanya tampil setelah profil berhasil dimuat.
- Kompromi disimpan di store (`compromises[]`, persist versi 3); banner berubah jadi catatan
  yang bisa dibatalkan. Fokus keyboard dipindah ke tombol pengganti / ringkasan baru.
- Mock tambahan disetujui Fahren: Desain dengan budget < Rp10 jt mendapat peringatan GPU
  (batas mengikuti tier preset; saran naik ke Rp15 jt sesuai katalog mock).
- Penjelasan istilah (`data/glossary.ts`, `getGlossary()`) memakai `<details>` agar bisa dibuka
  dengan keyboard dan sentuhan; PRD menyebutnya tooltip.
- Alasan spek masih teks statis per persona (belum disesuaikan dengan software pilihan).

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
- `type-display-xl` sekarang 44/64/80px sesuai REDESIGN §11 (dulu 96px untuk varian B; arsip B ikut berubah).
- `lib/api.ts`: `getWizardOptions()` dan `getBudgetInsight()` sinkron (konfigurasi statis & umpan
  balik slider real-time); fungsi data lain async dengan jeda 600–2500 ms.
- Landing A/B mengambil data lewat `lib/api.ts` di server dengan `"use cache"` (prerender statis);
  C memanggil API di klien dan meng-cache 5 preset sekaligus.
- Skill `design-taste-frontend` melarang monospace, border 1px, dan label kecil di atas judul;
  di proyek ini PRD menang (JetBrains Mono, kartu ber-border, label hero §13).
