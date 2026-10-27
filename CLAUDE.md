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
- Tanpa gradient, glow, glassmorphism, blob, atau 3D dekoratif. Pengecualian (disetujui Fahren): blur kaca
  dan scrim gradien keterbacaan yang sangat tipis hanya di navbar landing.
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
  - [x] R3 Wizard/Profil/Analisis · [x] R4 Hasil/Detail/Komparasi (gaya kobalt, Okt 2026) · [ ] R5 Should have

Brand SPECO (27 Okt 2026, brief dari Fahren): nama produk di UI = **SPECO** ("Spec for You"), menggantikan
NEXORA. Nama repo, folder, kode, dan kunci penyimpanan (`nexora-profile`, `nexora-compare`, `nexora-saved`)
tetap agar data pengguna tidak hilang. Aset dari panduan brand Fahren: `public/brand/speco-logo.png` (navy,
latar terang), `speco-logo-white.png` (huruf putih, latar gelap/kobalt), `app/icon.png` + `app/favicon.ico`.
Warna brand: blue #2563FF, teal #14B8A6 (motif cincin: progres slide hero), dark #0B1F3B, latar #F7F5F0.
- Navbar landing (brief SPECO §4–10): selebar layar, transparan di atas hero dengan scrim tipis (terang di
  kisaran kertas, gelap tipis di kobalt), lalu putih hangat + blur + garis bawah tipis setelah scroll 48 px
  (72 → 64 px, 400 ms). Menu: Cara Kerja, Tentang (penanda aktif garis 1,5 px). Nada slide hero dibagi lewat
  `HeroToneProvider` (`components/landing/hero-tone.tsx`). Foto hero tetap render kertas; CTA tetap kuning.

Landing "Editorial Tech × Product Recommendation" (27 Okt 2026, brief dari Fahren, menggantikan landing di bawah):
- Palet landing: latar `canvas` #F7F5F0, teks `ink-strong` #171717 / `ink-soft` #62625C, garis `canvas-line`
  #DCDAD2, kuning `signal` #F3E91F = aksi utama, `data-blue` #1238F5 = data/skor/pilihan (bidang biru penuh hanya
  di CTA akhir). Foto jadi sumber warna. Halaman lain tetap gaya kobalt R4.
- `LandingNav`: navbar mengambang kaca (blur) di atas hero → putih hangat saat scroll, 72 → 64 px, nilai
  diturunkan dari scrollY (tanpa loncat). `Navbar` lama tidak dipakai lagi di `/`.
- Alur: hero slider kisaran budget → "Budget sama. Kebutuhan bisa berbeda." (demo Rp8 jt: Kuliah/Coding/Desain/
  Gaming/Kerja, ambang Profil Kebutuhan, jumlah laptop katalog yang lolos; bukan skor) → cara kerja 3 langkah →
  pratinjau 5 pertanyaan (opsi asli Wizard, `?budget=&jurusan=` ke Wizard) → rekomendasi sticky (lg+, skor naik
  ke Best Match mock) → transparansi bobot (breakdown mock + tooltip, tautan ke `ScoreExplainer`) → bukan toko
  (fakta produk, bukan statistik karangan) → CTA biru. Persona Raka/Salsa/Dinda/Bima dihapus dari landing.
- Hero: 6 detik/slide, digerakkan `animationend` garis progres di thumbnail aktif (jeda = animation-play-state);
  berhenti saat hover/fokus/tab tersembunyi lalu lanjut; kelima render ditumpuk (keluar 1→1,03 −20 px, masuk
  0,98 +20 px blur tipis, 800 ms). Paralaks + kursor ≤ 8 px hanya desktop. Copy memakai "budget, kuliah, dan
  aplikasi", bukan "skill" (Wizard tidak menanyakan skill).
- Section "Satu budget. Banyak kemungkinan." (Okt 2026, brief + 2 gambar referensi Fahren, menggantikan demo
  "Budget sama. Kebutuhan bisa berbeda."): kiri = slider budget Rp6–20 jt+ + chip kebutuhan (Coding/Desain/
  Gaming/Kuliah/Office) + CTA kuning ke Wizard (`?budget=&jurusan=`); kanan = panel pratinjau 3 kartu laptop
  (panah + titik halaman, maks 3 halaman; mobile geser horizontal). Data `getBudgetPreviewContent()`: kecocokan
  mock per laptop per kebutuhan (`budgetNeedFit`, angka dari skenario mock-results bila ada); komponen hanya
  menyaring harga ≤ budget + 10% lalu mengurutkan, bukan SAW. Skor < 80 di urutan teratas → catatan kompromi.
  Gambar kartu = render katalog sebagai placeholder, tiap halaman dipaksa tiga bentuk berbeda (`assignRenders`);
  ganti dengan foto produk asli nanti. Dua kolom mulai xl (1 : 1,05); di bawahnya bertumpuk. Pengecualian
  disetujui Fahren khusus section ini: aksen radial biru sangat tipis dan bayangan lembut panel.
- Cara Kerja (Okt 2026, brief + referensi Fahren): judul tengah + 3 langkah 01 → 02 → 03 dengan garis penghubung
  (horizontal md+, timeline vertikal di mobile), tanpa gambar/mockup. Hover menyorot langkah; klik/fokus/panah
  memilih langkah (pola tablist) dan panel detail di bawah berganti isi (mobile: detail di dalam langkah).
  Garis terisi biru sampai langkah aktif. Animasi masuk sekali: langkah → garis → langkah berikutnya.
- Hero: wadah foto wajib `isolate` agar scrim selalu di atas foto; tanpa itu, saat skala scroll = 1 Motion
  menulis `transform: none` dan foto aktif (z-2) naik di atas scrim (sisi kiri terang tidak konsisten).
- Mock Gaming (disetujui Fahren): `gamingRequirement` di data/landing.ts (CPU ≥ 75, RAM ≥ 16, SSD ≥ 512, GPU
  terpisah wajib); di Rp8 jt 0 lolos + catatan kompromi. Data landing: `getLandingStoryContent()`,
  `components/landing/sample-data.ts`. Arsip /dev/landing-a|b memakai `archive-sample.ts`.

Redesign "Kalimat terbelah" (Okt 2026, disetujui Fahren; menggantikan tampilan R2 landing + Analisis R3):
- Palet: bidang kobalt `--cobalt-600` #0034EB (hero, Analisis, CTA) + kuning `--signal` #E9E34A hanya untuk
  aksi utama (Button `signal`); di bidang kobalt aksi kedua `inverse`, focus ring kuning (`data-tone="cobalt"`).
  Navbar/FlowHeader punya `tone="cobalt"`.
- R4 (disetujui Fahren): `--primary` dan ramp `blue-*` digeser ke kobalt, jadi semua halaman memakai satu biru.
  Wizard = band kobalt (FlowHeader, Stepper `tone="cobalt"`, pertanyaan); Profil = kartu karakter kobalt;
  Hasil = Best Match di bidang kobalt (`ScoreRing tone="cobalt"`); Detail = hero band kobalt; Komparasi =
  banner + header tabel kobalt. Kuning tetap hanya untuk aksi utama di bidang kobalt.
- Semua ikon Lucide di luar `/dev` sudah diganti Phosphor (arsip `/dev/*` masih memakai Lucide).
- Landing hero (Okt 2026, menggantikan "kalimat terbelah"): 5 kartu kisaran budget dengan render premium
  kertas berwarna + cahaya keras (`components/landing/hero-tiers.ts`, `public/images/laptops/premium/`,
  Gemini via Figma). Kartu tumbuh dari posisinya jadi latar penuh (lg+), crossfade di layar kecil; kelima
  render ditumpuk sekali agar tanpa kedipan. Berganti tiap 3 detik tanpa garis progres dan tanpa tombol
  jeda; berhenti permanen setelah pengguna memilih, sementara saat hover/fokus/tab tersembunyi, mati saat
  reduced motion. Warna latar = warna kertas render; warna teks berganti di pertengahan transisi. Tanpa
  label "Ilustrasi" (keterangan AI di alt + footer).
  Okt 2026: render kertas diganti foto meja kerja bercahaya alami dari Fahren (mentah di
  `img-laptopherosection/`, di-ignore; diperbesar 1,5x + penajaman halus, WebP q90). Semua tier `tone: "dark"`:
  teks putih di atas scrim gelap kiri+bawah di desktop (90% area teks ≥ 4,9:1), di mobile di atas bidang
  `paper` gelap. Pemetaan foto → tier ada di `hero-tiers.ts`.
- Interaksi utama "Laptop buat ___" (`getSoftwareNeeds()`, mock `softwareLoadNeeds` di data/landing.ts:
  filter ≥ ambang, bukan SAW). CTA penutup = kalimat dengan isian.
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
- Render katalog selalu di bidang `bg-studio`, berlabel "Ilustrasi" (kecuali render premium hero landing). `next/image` memakai `loading="eager"` +
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
