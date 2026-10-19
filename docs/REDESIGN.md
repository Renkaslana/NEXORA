# NEXORA — Frontend Redesign Plan + UI/UX Design Specification

Okt 2026 · Redesign frontend yang sudah berjalan (Next.js 16 · TypeScript · Tailwind v4 · shadcn/ui · Motion).
Dokumen ini adalah blueprint; **belum ada kode yang diubah**. Keputusan §30 sudah disetujui Fahren
(19 Okt 2026); render laptop dibuat dengan AI (Gemini; prompt dan status di `docs/MIDJOURNEY_PROMPTS.md`). Rute, alur, mock data, store, dan
`lib/api.ts` dipertahankan. Yang dirombak: visual, layout, motion, interaksi, ikon, warna, hierarki.

Rujukan: `docs/PRD.md` (spesifikasi produk). Bila dokumen ini bertentangan dengan PRD, bagian
**§30 Keputusan yang perlu disetujui** mencatatnya secara eksplisit.

---

## Ringkasan dalam satu halaman

| | Sekarang | Setelah redesign |
| --- | --- | --- |
| Rasa | Rapi tapi datar, seperti lembar formulir | Rapi, berlapis, terasa "bekerja untukmu" |
| Signature visual | Tidak ada; kotak abu-abu 4:3 jadi elemen terbesar | **Garis Kebutuhan**: meter spek dengan penanda kebutuhanmu, dipakai di semua halaman |
| Produk | Placeholder abu | Render laptop AI bergaya seragam (3 bentuk, sudut 3/4, latar studio `#EEF0F4`) + foto suasana CC0 dengan treatment seragam |
| Warna | Putih + satu biru | Ramp biru 50–950 + tinta gelap untuk "momen analisis" + bidang studio di belakang setiap laptop |
| Motion | Hampir nol | 10 gerak inti + 5 gerak gambar (Motion/Framer Motion): reveal hero, cerita scroll ter-pin dengan render berganti sudut, isi meter, count-up skor, transisi langkah, tray, reveal foto |
| Interaksi | Hover warna saja | Press, hover dengan elevasi, pilih dengan pop, slider yang menggerakkan meter secara langsung |
| Ikon | Lucide garis tipis tanpa wadah | Phosphor duotone di dalam "tile" berwarna sesuai kategori spek; Phosphor bold untuk ikon aksi |

**Arah visual:** *Live Spec* — lembar spesifikasi yang hidup dan menjawabmu.

---

## 1. Current Design Audit

Diambil dari aplikasi yang berjalan (desktop 1440 dan mobile 375): Landing, Wizard (Aktivitas),
Profil Kebutuhan, Hasil, Detail, Komparasi.

| Area | Temuan | Dampak |
| --- | --- | --- |
| Hero landing | Elemen terbesar di layar adalah **kotak abu kosong** bertuliskan "Foto laptop". Kartu Profil Kebutuhan menutupi sebagian kotak itu. | Visual anchor berupa kekosongan; kesan "belum selesai". |
| Headline | 56px, tiga baris, bobot 700, warna hitam; tidak ada skala kedua yang kontras. | Hierarki datar: headline, subjudul, dan chip terasa setara. |
| Warna | Hampir seluruh layar putih/zinc-50; biru hanya di tombol dan chip terpilih. | Tidak ada ritme; seluruh halaman satu "suhu". |
| Kartu | Semua kartu = border 1px + radius 12 + latar putih. Tidak ada variasi tingkat. | Kartu laptop, kartu spek, dan kartu pilihan terlihat sama penting. |
| Ikon | Lucide 1.5px, abu, ukuran 20–24, tanpa wadah. | Ikon tenggelam; terasa generik. |
| Scroll | Section muncul begitu saja; tidak ada keterkaitan antar section. | "Cara kerja" terbaca sebagai 3 kolom statis, bukan cerita. |
| Wizard | Kartu pilihan hanya berganti border/latar; panel ringkasan berisi teks. | Tidak ada rasa progres atau "profil sedang terbentuk". |
| Profil Kebutuhan | 6 kartu teks dengan badge Wajib/Disarankan. | Informasi benar, tapi pengguna harus membaca semua untuk paham. |
| Analisis | Daftar 4 tahap dengan ikon kecil di layar putih. | Momen yang seharusnya paling "cerdas" terasa seperti loading biasa. |
| Hasil | Best Match memang lebih besar, tapi separuhnya placeholder abu; ring skor kecil di pojok. | Payoff tidak terasa sebagai hadiah. |
| Komparasi | Tabel fungsional, chip ✓/✕ kecil. | Pemenang tidak "melompat" ke mata. |

## 2. Main UX Problems

1. **Tidak ada benang merah visual dari kebutuhan ke laptop.** Profil Kebutuhan memakai teks,
   Detail memakai daftar periksa, Komparasi memakai chip. Pengguna harus menerjemahkan tiga bahasa visual.
2. **Progres tidak terasa.** Wizard menghitung langkah, tapi tidak memperlihatkan bahwa jawaban
   *mengubah sesuatu*. Panel "Profil kamu" hanya mengulang teks jawaban.
3. **Payoff datar.** Skor 94% muncul sekaligus dengan semua elemen lain; tidak ada urutan reveal
   yang mengarahkan mata: skor → alasan → trade-off.
4. **Interaksi tanpa umpan balik fisik.** Tombol dan kartu tidak bereaksi saat ditekan; pada layar
   sentuh, pengguna tidak yakin sentuhannya terbaca.
5. **Cerita produk tidak terlihat.** Landing menjelaskan alur dengan teks dan cuplikan kecil; alur
   "bingung → paham → yakin" (PRD §6) tidak dialami saat scroll.

## 3. Main Visual Problems

- Kekosongan dijadikan elemen terbesar (placeholder) alih-alih skala, warna, atau objek produk.
- Satu tingkat permukaan: semua di atas putih, dipisah garis 1px. Tidak ada lapisan.
- Tipografi aman: satu ukuran display, sisanya 14–18px; angka (skor, harga) tidak diberi panggung.
- Warna status (hijau/merah) hanya muncul sebagai chip kecil; tidak dipakai untuk menjelaskan.
- Ikon tidak punya wadah, ukuran, atau warna yang membedakan kategori spek.

## 4. Design Slop Diagnosis

| Gejala slop | Ada sekarang? | Catatan |
| --- | --- | --- |
| Gradient ungu-biru, glow, glass, blob | Tidak | Pertahankan. |
| Kartu identik berulang | **Ya** | Kartu spek, kartu pilihan, kartu laptop memakai resep visual yang sama. |
| Kekosongan tanpa makna | **Ya** | Placeholder hero dan galeri. |
| Ikon generik tanpa sistem | **Ya** | Ikon dipakai sebagai hiasan, bukan bahasa. |
| Copy generik | Sebagian kecil | Copy sudah spesifik (bagus); beberapa label seperti "Cara kerja" masih standar. |
| Animasi dekoratif | Tidak | Masalahnya kebalikan: hampir tidak ada motion. |

Kesimpulan: desain saat ini **tidak terlihat AI-generated karena ornamen**, tapi karena **tidak
mengambil keputusan**: semua elemen sama berat, tidak ada signature, tidak ada momen. Redesign
menjawabnya dengan satu ide visual yang kuat dan dipakai konsisten, bukan dengan menambah hiasan.

## 5. Design Research

Riset dilakukan lewat kunjungan langsung ke situs (browser) dan pengetahuan desain produk-produk
berikut. Yang diambil adalah **prinsip**, bukan tampilan.

**A. Premium technology** — Apple (MacBook Air, Compare), Framework, Nothing.
**B. Interaksi web** — Linear, Stripe, Vercel, Raycast.
**C. Rekomendasi & keputusan** — RTINGS, Versus, PCPartPicker, N.N Laptop Finder, Newegg Laptop Finder.
**D. AI product UX** — Perplexity.

Catatan jujur: halaman RTINGS dan Versus menolak/404 saat diambil otomatis, dan beberapa halaman
memakai animasi yang tidak tertangkap screenshot. Analisis untuk situs tersebut berasal dari pola
desain yang sudah dikenal publik, bukan pengukuran baru.

## 6. Reference Analysis

| Reference | Design principle | Relevansi | Implementasi di NEXORA | Yang tidak ditiru |
| --- | --- | --- | --- | --- |
| [Apple – MacBook Air](https://www.apple.com/macbook-air/) | Produk sebagai objek tunggal di atas **bidang warna yang diambil dari produk itu sendiri**; reveal terjadi saat scroll | Hero kita butuh objek, bukan kotak | Render laptop 3/4 di atas bidang studio yang menyatu dengan latar render | Skala produksi foto Apple, copy marketing |
| [Apple – Compare Mac](https://www.apple.com/mac/compare/) | Kolom sejajar, header produk menempel, nilai spek dengan ikon fungsional | Halaman Komparasi | Header kolom sticky dengan render kecil; baris memakai meter Garis Kebutuhan | Daftar spek tanpa konteks kebutuhan |
| [Framework](https://frame.work/) | Konfigurasi bertahap dengan ringkasan pilihan yang selalu terlihat | Wizard | Panel "Profil kamu terbentuk" berisi meter kecil yang terisi tiap langkah | Nuansa toko (harga per opsi) |
| [Nothing](https://nothing.tech/) | Identitas dari **satu motif konsisten** (dot-matrix), monokrom, angka diberi panggung | Brand kita butuh motif | Motif Garis Kebutuhan + angka skor besar bertipe tabular | Dot-matrix itu sendiri, palet monokrom murni |
| [Linear](https://linear.app/) | UI produk asli sebagai visual utama; aksen hemat; section punya ritme judul–tagline–cuplikan | Landing "Cara kerja" | Cerita scroll memakai layar NEXORA asli, bukan ilustrasi abstrak | Tema gelap penuh, estetika SaaS developer |
| [Stripe](https://stripe.com/) | Kedalaman dari **lapisan UI yang saling tumpang** dan gerak yang menjelaskan alur data | Hero & Analisis | Layar laptop berisi Profil Kebutuhan, dengan callout spek yang "ditarik" keluar dari layar | Gradient mesh khas Stripe |
| [Vercel](https://vercel.com/) | Demo "langsung": angka dan status berubah di depan mata | Momen interaktif landing | Slider budget di hero menggerakkan meter dan callout secara real time | Grid garis dan monokrom ekstrem |
| [Raycast](https://www.raycast.com/) | Satu objek metafora (keyboard) jadi hero; tidak ada animasi pada aksi yang sering | Batas motion | Tidak menganimasikan aksi keyboard berulang (pindah fokus, chip) | Glass backdrop |
| [RTINGS](https://www.rtings.com/laptop) | Skor per **kegunaan**, bobot yang bisa diatur, hasil uji sebagai bukti | Breakdown skor | Breakdown berbobot jadi bar dengan tebal = bobot; mode "Atur bobot detail" tetap | Kepadatan tabel tinggi |
| [Versus](https://versus.com/) | "Kenapa A lebih baik": daftar alasan dengan angka, bar per properti | Hasil & Komparasi | Setiap alasan menyebut angka + sumber; pemenang tiap baris diberi penanda "Unggul" yang terlihat | Iklan, skor agregat tanpa konteks |
| [PCPartPicker](https://pcpartpicker.com/) | Cek kompatibilitas real-time dengan catatan | Daftar periksa | Garis Kebutuhan = cek kompatibilitas visual: lolos/kurang terlihat dari posisi fill terhadap garis | Antarmuka daftar komponen yang padat |
| [Perplexity](https://www.perplexity.ai/) | Proses terlihat bertahap, setiap klaim punya sumber | Analisis & alasan | Analisis menampilkan katalog yang tersaring nyata (12 → 9); alasan selalu punya baris sumber | Bentuk chat, sparkle AI |
| [N.N Laptop Finder](https://nnlaptops.com/find-my-laptop) / [Newegg](https://www.businesswire.com/news/home/20220809005270/en) | Kuis singkat, sedikit hasil yang beralasan | Validasi alur | Pertahankan 5 langkah + 1 Best Match + 4 alternatif | Ajakan beli/WhatsApp |

## 7. Extracted Design Principles

1. **Satu motif, dipakai di mana-mana.** Garis Kebutuhan adalah bahasa visual untuk "cukup/kurang".
2. **Produk adalah objek, bukan kotak.** Selalu ada laptop yang terlihat, walau berupa ilustrasi.
3. **Angka diberi panggung.** Skor, harga, RAM tampil besar, tabular, dan muncul dengan count-up sekali.
4. **Gerak menjelaskan perubahan.** Setiap animasi menjawab "apa yang baru berubah?"; tidak ada gerak hias berulang.
5. **Lapisan, bukan garis.** Kedalaman dari tint, tinta gelap, dan elevasi saat interaksi, bukan border di semua tempat.
6. **Sentuhan selalu dibalas.** Setiap elemen yang bisa ditekan punya hover (pointer halus), press, fokus, dan status terpilih.

## 8. Redesign Goals

| Tujuan | Ukuran keberhasilan |
| --- | --- |
| Hero memorable | Dalam 5 detik pengunjung bisa menyebut "ini membantu menentukan spek yang kubutuh" (uji 5 orang) |
| Progres terasa | Di Wizard, panel kanan berubah visual setiap langkah (bukan hanya teks) |
| Payoff | Urutan reveal Hasil: skor → meter → alasan, total ≤ 1,6 detik, bisa dilewati scroll |
| Konsistensi | Garis Kebutuhan muncul di Landing, Wizard, Profil, Hasil, Detail, Komparasi |
| Tetap aksesibel | AA kontras, fokus terlihat, `prefers-reduced-motion` mematikan semua gerak posisi |
| Tetap ringan | Tanpa Three.js/GSAP/Lenis; JS tambahan < 10 KB gzip di luar ikon |

## 9. New Visual Direction — *Live Spec*

**Visual direction:** *Live Spec* — lembar spesifikasi yang hidup. Tenang dan presisi seperti lembar
teknis, tapi setiap angka bereaksi pada kebutuhanmu.

**Brand personality:** cerdas, jujur, sigap, ramah. Seperti teman yang paham hardware dan menjelaskan
dengan gambar, bukan jargon.

**Design principles:** lihat §7.

**Signature: Garis Kebutuhan (Need Line).**

```text
RAM                                   Butuh 16 GB
├────────────────────────┃──────┤
████████████████████████▌            16 GB  ✓ Memenuhi
                         ↑ garis kebutuhanmu
```

- Track = rentang wajar komponen (mis. RAM 4–32 GB, skala log untuk storage).
- **Garis vertikal tegas** = minimum kebutuhanmu (dari Profil Kebutuhan).
- Fill = nilai laptop. Melewati garis → fill biru + ✓; kurang → fill berhenti sebelum garis, ujung
  berwarna danger + ✕ dan label "kurang 8 GB".
- Pada Profil Kebutuhan (sebelum ada laptop), meter hanya menampilkan garis dan zona "cukup" yang
  diarsir halus — "inilah yang kamu cari".
- Pada Komparasi, satu track bisa memuat 2–3 penanda laptop (A/B/C) terhadap satu garis.

Ini bukan perhitungan SAW: posisi hanya memetakan angka spek dan ambang mock yang sudah ada
(`lib/spec-check.ts`) ke panjang bar.

## 10. Color System

Prinsip: **1 identitas biru + fondasi netral + satu "tinta" untuk momen penting + warna status untuk makna.**
Tidak ada hue baru di luar status. Kekayaan datang dari ramp, bidang studio, dan section gelap.

### Primary — Cobalt (identitas)

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `blue-50` | `#EFF5FF` | Latar terpilih, bidang hero di luar render |
| `blue-100` | `#DCE8FF` | Zona "cukup" di meter, hover kartu pilihan |
| `blue-200` | `#BFD4FF` | Track meter aktif, border terpilih ringan |
| `blue-400` | `#5E8BFF` | Fill meter di atas tinta gelap |
| `blue-600` | `#2152E8` | Hover tombol primary |
| `blue-700` | `#1D4ED8` | **Primary** (tetap dari PRD): CTA, fokus, fill meter |
| `blue-800` | `#1A3FB0` | Active/pressed |
| `blue-950` | `#0E1F55` | Teks di atas tint, bayangan duotone foto suasana |

### Neutral — Ink & Paper

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `ink-950` | `#0A0F1C` | **Section gelap** (Analisis, band "Kenapa bukan toko"), teks tertinggi |
| `ink-900` | `#111827` | Kartu di atas section gelap |
| `ink-700` | `#374151` | Border di section gelap |
| `zinc-900` | `#18181B` | Teks utama (tetap) |
| `zinc-600` | `#52525B` | Teks sekunder (tetap, AA 7:1) |
| `zinc-300` | `#D4D4D8` | Border kuat |
| `zinc-200` | `#E4E4E7` | Border lembut, track meter |
| `studio` | `#EEF0F4` | **Bidang di belakang render laptop** (sama persis dengan latar render, jadi tanpa sambungan) |
| `paper-100` | `#F4F5F7` | Section alternatif |
| `paper-50` | `#F9FAFB` | Latar halaman di area produk |
| `white` | `#FFFFFF` | Kartu, latar dasar |

### Semantic

| Token | Hex | Di atas putih | Pemakaian |
| --- | --- | --- | --- |
| `success-600` | `#15803D` | 5,0 : 1 | ✓ Memenuhi, skor Excellent |
| `warning-600` | `#B45309` | 5,0 : 1 | Trade-off, ≈ Mendekati |
| `danger-600` | `#B91C1C` | 6,5 : 1 | ✕ Kurang, error |
| `info-600` | `#0369A1` | 5,9 : 1 | Catatan, penjelasan istilah |

Setiap status punya pasangan `-50` untuk latar dan ikon wajib (✓ ⚠ ✕ ⓘ), tidak hanya warna.

### Kategori spek (tile ikon)

Tidak menambah hue: tile memakai **tingkat biru berbeda + netral** agar kategori terbedakan lewat
bentuk ikon dan kecerahan, bukan pelangi.

| Kategori | Tile | Ikon |
| --- | --- | --- |
| Performa (CPU/GPU) | `blue-700` solid, ikon putih | chip |
| Memori (RAM/Storage) | `blue-100`, ikon `blue-800` | memory / drive |
| Layar | `paper-100`, ikon `zinc-900` | monitor |
| Mobilitas (Baterai/Bobot) | `ink-950`, ikon putih | battery / backpack |

### Aturan

- Maksimal **satu** section gelap per layar penuh; tidak ada gradient.
- Render laptop selalu duduk di bidang `studio`; latar render sudah di-bake ke warna ini, jadi bidang
  tidak boleh diganti warna lain. Variasi grid hasil datang dari hierarki kartu, bukan warna bidang.
- Kontras semua teks ≥ 4,5 : 1; teks di atas `ink-950` memakai `white` / `zinc-300`.

## 11. Typography System

Tetap **Plus Jakarta Sans** (identitas lokal, sudah terpasang) dan **JetBrains Mono** hanya untuk
nilai spek dan skor. Yang berubah: skala lebih berani, bobot 800 untuk display, tracking rapat.

| Style | Desktop | Mobile | Bobot / tracking | Pemakaian |
| --- | --- | --- | --- | --- |
| Display XL | 80 / 80 | 44 / 46 | 800 / −0,035em | Headline hero |
| Display | 56 / 60 | 36 / 40 | 800 / −0,03em | Judul payoff ("94% cocok") |
| H1 | 40 / 46 | 30 / 36 | 700 / −0,02em | Judul halaman |
| H2 | 28 / 34 | 24 / 30 | 700 / −0,015em | Judul section |
| H3 | 20 / 28 | 18 / 26 | 600 | Judul kartu |
| Body L | 18 / 28 | 17 / 26 | 400 | Lead, pertanyaan wizard |
| Body | 16 / 24 | 16 / 24 | 400 | Teks umum |
| Small | 14 / 20 | 14 / 20 | 500 | Label, chip |
| Micro | 12 / 16 | 12 / 16 | 600 / +0,02em | Badge, legenda meter |
| **Numeric XL** | 96 / 96 | 64 / 64 | Mono 500, tabular | Skor kecocokan di payoff |
| Numeric | 20–32 | 18–24 | Mono 500, tabular | Nilai spek, harga di kartu |

Aturan: maksimal 2 keluarga font. Angka tidak pernah memakai font proporsional di tabel/meter.

## 12. Icon System

Masalah: Lucide 1,5px tanpa wadah terasa tipis dan acak.

**Keputusan (disetujui):** **Phosphor Icons** (`@phosphor-icons/react`, MIT) bobot **duotone** untuk
ikon kategori dan **bold** untuk ikon aksi. Satu keluarga dengan 6 bobot memberi karakter tanpa ikon
custom, duotone memberi kedalaman yang cocok dengan tile, dan bisa di-tree-shake. Impor dari
`@phosphor-icons/react/dist/ssr` di Server Component. Lucide dilepas bertahap per fase; di akhir R4
tidak ada lagi impor `lucide-react` (dependency dihapus setelah ditanyakan ke Fahren).

| Konsep | Ikon (Phosphor) | Konteks |
| --- | --- | --- |
| CPU | `Cpu` | Kartu spek, meter, komparasi |
| RAM | `Memory` | |
| Storage | `HardDrives` | |
| GPU | `GraphicsCard` | |
| Layar | `Monitor` | |
| Baterai | `BatteryHigh` | |
| Bobot / portabilitas | `Backpack` | |
| Harga / budget | `Wallet` | |
| Bandingkan | `ArrowsLeftRight` | |
| Simpan | `BookmarkSimple` (fill saat tersimpan) | |
| Kecocokan | `Target` | |
| Trade-off | `Warning` | |

**Tile:** 40×40 (kartu) / 32×32 (baris), radius 10, warna sesuai §10 "Kategori spek". Ikon 20/24px.
Ikon aksi di tombol tidak memakai tile.

## 13. Motion System

Prinsip: *motion menjelaskan perubahan, hierarki, atau interaksi*. Semua memakai **Motion**
(paket `motion`, nama baru Framer Motion, sudah terpasang; impor dari `motion/react`) atau transisi CSS. Aksi yang diulang puluhan kali (pindah fokus keyboard, membuka chip
filter) **tidak dianimasikan**.

### Token

| Token | Durasi | Easing | Untuk |
| --- | --- | --- | --- |
| `motion-fast` | 140 ms | `cubic-bezier(0.23, 1, 0.32, 1)` | Press, hover warna, check pop |
| `motion-medium` | 240 ms | `cubic-bezier(0.23, 1, 0.32, 1)` | Kartu masuk, panel buka, transisi langkah |
| `motion-slow` | 560 ms | `cubic-bezier(0.77, 0, 0.175, 1)` | Reveal hero, isi meter, payoff |
| `motion-count` | 700 ms | ease-out | Count-up angka (sekali per tampilan) |
| `spring-soft` | — | `{ type: "spring", duration: 0.5, bounce: 0.15 }` | Tilt laptop hero, check badge |
| `stagger` | 60 ms antar item, maks 6 item | — | Kartu, alasan, baris meter |

Exit selalu lebih cepat dari enter (≈ 60%). Tidak ada animasi dari `scale(0)`; minimal `0.95` + opacity.

### 10 gerak inti

| # | Gerak | Tujuan |
| --- | --- | --- |
| 1 | Hero reveal: laptop naik 24px + fade, lalu callout spek "keluar" dari layar satu per satu | Memperkenalkan produk dan output |
| 2 | Tilt laptop hero mengikuti pointer (spring, ±6°), hanya pointer halus | Kedalaman tanpa 3D library |
| 3 | Cerita scroll ter-pin "Cara kerja": layar laptop berganti Wizard → Profil → Hasil sesuai progres scroll | Storytelling alur produk |
| 4 | Isi meter Garis Kebutuhan saat masuk viewport (fill dari 0) | Menjelaskan cukup/kurang |
| 5 | Slider budget menggerakkan meter & callout secara langsung (tanpa delay) | Umpan balik real-time |
| 6 | Transisi langkah Wizard: konten geser 24px sesuai arah (maju/mundur) | Orientasi spasial |
| 7 | Panel "Profil kamu terbentuk": meter mini terisi saat langkah dijawab | Progres terasa |
| 8 | Analisis: 12 kartu laptop mini tersaring (yang tak lolos memudar & mengecil ke 0.95) | Proses terlihat jujur |
| 9 | Payoff Hasil: kartu → count-up skor → ring mengisi → meter stagger → alasan | Hasil terasa sebagai hadiah |
| 10 | "Bandingkan": thumbnail terbang ke tray (shared layout `layoutId`) + angka tray naik | Memberi tahu letak item |

### 5 gerak gambar (ditambahkan setelah keputusan render + foto)

Gambar membuat halaman terasa hidup hanya bila ia ikut bercerita. Kelima gerak ini memakai Motion
dan semuanya terikat ke render laptop atau foto suasana, bukan ke dekorasi.

| # | Gerak | Tujuan | Teknik |
| --- | --- | --- | --- |
| 11 | **Putar sudut saat scroll**: di cerita ter-pin (section 3), render berganti 3/4 → depan saat langkah "Profil" aktif, lalu UI NEXORA muncul pas di area layar render `front` | Laptop "menghadap" pengguna tepat saat profilnya terbentuk | Dua `motion.img` bertumpuk, `opacity` dari `useTransform(scrollYProgress)`; UI layar diposisikan dengan `screenRect` per render |
| 12 | **Reveal foto**: foto suasana terbuka dari `clip-path: inset(12% 12% 12% 12% round 24px)` ke `inset(0 round 24px)` sambil `scale 1.06 → 1` | Foto "dibuka" seperti jendela, bukan sekadar muncul | `whileInView`, `once: true`, `motion-slow` |
| 13 | **Render masuk kartu Hasil**: render naik 16px + fade **sebelum** count-up skor (bagian dari payoff gerak 9) | Mata melihat laptopnya dulu, lalu angkanya | Tambahan satu langkah di sequence payoff (total tetap ≤ 1,8 detik) |
| 14 | **Galeri Detail bisa digeser**: swipe/drag horizontal antar sudut (3/4, depan, samping, port), indikator thumbnail meluncur | Sentuhan terasa langsung di HP | `drag="x"` + `dragConstraints` + snap ke indeks; indikator `layoutId`; tombol panah tetap ada untuk keyboard |
| 15 | **Kedalaman pointer pada render hero**: render bergeser ±6px di dalam bidang studio, berlawanan arah dengan callout spek yang bergeser ±3px (melengkapi tilt gerak 2) | Dua lapis (laptop + callout) memberi kesan 3D tanpa model 3D | `useMotionValue` + `useSpring` dibagi dua layer; render diberi ruang 12px di dalam bidang agar tepinya tidak terlihat; hanya `pointer: fine` |

Tetap dilarang: parallax foto di lebih dari satu section, Ken Burns berulang, gambar yang bergerak
terus tanpa input, dan efek yang membuat teks bergeser saat dibaca.

Ditambah umpan balik dasar (bukan "gerak" naratif): press `scale(0.97)`, hover kartu naik 2px +
shadow-sm (hanya `@media (hover:hover)`).

### Reduced motion

`useReducedMotion()` / `prefers-reduced-motion`: semua translate/scale/tilt dimatikan; count-up
langsung ke nilai akhir; fill meter tanpa animasi; transisi diganti opacity 120 ms. Cerita scroll
ter-pin diganti tiga blok statis berurutan. Gerak gambar 11–15: render langsung di sudut akhir,
foto tampil penuh tanpa clip-path, galeri tetap bisa digeser tetapi tanpa animasi snap.

## 14. Interaction System

| Komponen | Default | Hover (pointer halus) | Press | Focus | Selected / aktif | Disabled / loading |
| --- | --- | --- | --- | --- | --- | --- |
| Button primary | `blue-700` | `blue-600`, ikon panah geser 3px | `scale(0.97)`, `blue-800` | Ring 2px + offset 2px | — | 50% opacity; loading = spinner + label tetap |
| Button secondary | Putih, border `zinc-200` | Latar `paper-100`, border `zinc-300` | `scale(0.97)` | Ring | Pressed: border `blue-700`, tint `blue-50` | 50% |
| Select card | Putih, tile ikon netral | Border `zinc-300`, tile berubah `blue-100` | `scale(0.98)` | Ring | Border `blue-700`, latar `blue-50`, check pop (spring), tile `blue-700` | 50%, cursor not-allowed |
| Laptop card | Bidang studio + konten | Naik 2px, shadow-sm, render skala 1.03, CTA "Kenapa cocok →" muncul | — | Ring pada kartu (link nama) | Compared: badge "Di banding" + border biru; Saved: bookmark terisi | — |
| Chip preset | Pill putih | Border `zinc-300` | `scale(0.97)` | Ring | `blue-700` solid, teks putih | — |
| Meter | Track + garis | Tooltip nilai muncul (pointer); tap = sama di mobile | — | Fokus pada baris (bisa Tab) membacakan nilai | — | — |
| Slider budget | Thumb putih ring biru | Thumb membesar 1.1 | Thumb `scale(1.15)` + label nilai menempel di atas thumb | Ring | — | — |

Semua hover dibatasi `@media (hover: hover) and (pointer: fine)`; di layar sentuh, umpan balik
datang dari press dan selected.

## 15. Landing Page Redesign

### Hero — Option C (Hybrid), tanpa 3D library

Kenapa bukan 3D: (1) kita tidak punya model 3D laptop berkualitas; model murah justru menurunkan
kepercayaan (PRD §12); (2) React Three Fiber menambah ratusan KB untuk pengguna mahasiswa yang
membuka dari HP; (3) kedalaman yang dibutuhkan bisa dicapai dengan **render AI di bidang studio**
(§24) + CSS 3D transform + spring tilt + callout yang bergeser berlawanan (gerak 15).

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ NEXORA                         Cara kerja   Persona          [Mulai →]    │
├───────────────────────────────┬──────────────────────────────────────────┤
│ Sistem pendukung keputusan     │        ┌─ CPU  Ryzen 5 ─────┐            │
│ laptop                         │        │ ███████▌┃   ✓      │            │
│                                │   ┌────┴──────────────────────┐          │
│ Jangan pilih laptop            │   │  [layar: Profil          │ 94%       │
│ dari speknya.                  │   │   Kebutuhan asli]        │ cocok     │
│ Pilih dari kebutuhanmu.        │   │                          │  ◔        │
│                                │   └──────────────────────────┘           │
│ Budget-mu?                     │    ╲______keyboard deck______╱           │
│ [<6] [6–8] [8–10●] [10–15] [15+]│   RAM 16 GB ████████▌┃ ✓                │
│                                │   SSD 512 GB ███████┃  ✓                 │
│ [Cari Laptop yang Pas →]       │                                          │
│  Lihat cara kerjanya           │  (bidang studio #EEF0F4, radius 24)      │
└───────────────────────────────┴──────────────────────────────────────────┘
```

- **Kiri (5 kolom):** label kecil, headline Display XL dua baris + satu baris tambahan
  dengan bobot 800, subjudul satu kalimat, **preset budget sebagai kontrol utama** (dipindah dari bawah
  CTA ke atas karena ini "live thing"), CTA primary lg dengan ikon panah bergerak saat hover.
- **Kanan (7 kolom):** bidang `studio` dengan radius 24; **render laptop 3/4**
  (`creator-navy-34` untuk preset tinggi, `ultrabook-silver-34` untuk preset menengah,
  `mainstream-graphite-34` untuk preset rendah; berganti dengan crossfade 240 ms saat preset diganti).
  Layar render 3/4 dibiarkan kaca gelap; **kartu Profil Kebutuhan mini** melayang menimpa sudut kiri
  bawah laptop. Tiga **callout spek** (CPU, RAM, SSD) menempel ke laptop dengan garis penunjuk tipis;
  masing-masing berisi meter Garis Kebutuhan. Badge "94% cocok" (ring kecil) di sudut layar laptop.
  Label kecil "Ilustrasi" di bawah render.
- **Live thing:** memilih preset budget menggerakkan callout: nilai minimum berubah, meter bergeser,
  dan untuk Rp<6 jt satu callout berubah ⚠ "kompromi". Data dari `getRequirements()` yang sudah ada.
- **Mobile:** headline 44px, preset jadi baris scroll horizontal, laptop di bawah dengan dua callout
  saja (RAM, SSD) menumpuk di bawah render; tilt dimatikan; render memakai `sizes` agar HP hanya
  mengunduh versi ±800px.

## 16. Scroll Experience

Urutan section mengikuti perjalanan emosi PRD §6 (*bingung → dipahami → terarah → yakin*):

| # | Section | Komposisi | Motion |
| --- | --- | --- | --- |
| 1 | Hero | §15 | Gerak 1, 2, 5 |
| 2 | **"Spek saja tidak menjawab"** | Dua kartu kasus nyata berdampingan: *Raka beli laptop tipis RAM 8 GB* vs *Dinda beli laptop gaming 2,4 kg*. Tiap kartu menampilkan meter yang **gagal** terhadap garis kebutuhan mereka | Meter terisi saat masuk viewport; bagian yang kurang/berlebih berkedip satu kali (bukan loop) |
| 3 | **"Ceritakan kebutuhanmu"** (cerita ter-pin) | Kiri: 3 langkah teks yang aktif bergantian. Kanan: render laptop besar menempel (sticky); render berputar 3/4 → depan, lalu layarnya berganti Wizard → Profil → Hasil sesuai `scrollYProgress` | Gerak 3 & 11; crossfade layar 240 ms (tanpa blur) |
| 4 | **"Garis kebutuhanmu"** | Satu baris meter besar dengan slider budget mini: pengunjung bisa merasakan bagaimana garis bergerak | Gerak 4 & 5 |
| 5 | Persona | Kartu persona besar bergeser horizontal (scroll-snap). Tiap kartu: **foto suasana CC0** di atas (§24), tint, dan 3 meter kebutuhan khasnya | Kartu masuk stagger; foto gerak 12; tidak ada parallax |
| 6 | **Band gelap** "Kenapa NEXORA bukan toko" | Latar `ink-950` dengan foto meja gelap (treatment gelap §24) di separuh kanan, tiga janji dengan angka besar ("0 iklan", "0 komisi", "1 trade-off di setiap hasil") | Teks masuk clip-reveal dari bawah, sekali; foto gerak 12 |
| 7 | CTA penutup | Headline + tombol, render `ultrabook-mist-side` (profil tipis) muncul dari bawah | Fade-up |

Aturan scroll: tidak ada smooth-scroll hijack (tanpa Lenis); tidak ada parallax di lebih dari satu
section; semua efek scroll memakai `whileInView` dengan `once: true` kecuali section 3 yang memang
terikat progres scroll.

## 17. Recommendation Wizard Redesign

Wizard = **konsultasi terpandu**, bukan formulir.

```text
┌──────────────────────────────────────────┬──────────────────────────────┐
│ 03 / 05   ●●●○○                            │  PROFIL KAMU TERBENTUK        │
│                                            │  [laptop mini, layar berubah] │
│ Laptop ini akan dipakai untuk apa?         │  Budget   Rp8 jt     ✓        │
│ Pilih semua yang sesuai, tandai satu utama.│  Jurusan  Informatika ✓       │
│                                            │  CPU   ████▌┃                 │
│ [⬛ Programming ✓★] [⬛ UI/UX ✓] [▢ Desain] │  RAM   ██████┃  ← terisi      │
│ [▢ Video] [▢ 3D] [▢ Data] ...              │  SSD   ███┃                    │
│                                            │                              │
│ 💬 "Programming + UI/UX: kita butuh RAM     │                              │
│     16 GB supaya IDE dan Figma lancar."    │                              │
│                                            │                              │
│ [← Kembali]                    [Lanjut →]  │                              │
└──────────────────────────────────────────┴──────────────────────────────┘
```

- **Penghitung "03 / 05"** besar (Numeric) + progress dots yang mengisi dengan gerak 6.
- **Kartu pilihan:** tile ikon kategori (§12), judul, deskripsi satu baris; terpilih = check pop
  spring + tile berubah biru solid + badge "Utama" bintang.
- **Umpan balik kontekstual** (baris "💬" di sketsa, tanpa emoji di implementasi; memakai ikon
  `ChatCircleText`): satu kalimat yang dirangkai dari **data statis per opsi** di `data/options.ts`
  (mis. teks per aktivitas), bukan generasi AI. Contoh: *"Dengan Rp8 jt, biasanya kamu dapat Ryzen 5,
  RAM 16 GB, SSD 512 GB."* (sudah ada di `getBudgetInsight`).
- **Panel kanan:** laptop mini + meter kebutuhan yang terisi bertahap seiring jawaban (gerak 7).
  Isi meter mengikuti `getRequirements()` untuk persona+budget saat ini.
- **Budget:** angka besar count-up saat slider digeser (tanpa delay), preset chip, toggle ±10%.
- **Mobile:** panel kanan jadi strip atas berisi meter mini horizontal + tombol buka ringkasan;
  tombol Lanjut menempel di bawah.

## 18. Requirement Summary Redesign

```text
┌───────────────────────── ink-950 ─────────────────────────────┐
│ PROFIL LAPTOP KAMU                                              │
│ Mahasiswa Informatika · Budget Rp8–10 jt                        │
│ Programming + UI/UX · Prioritas: Performa, Ringan                │
│                                                                  │
│ Performa ██████████░░  Tinggi    Mobilitas ███████░░░  Sedang   │
└──────────────────────────────────────────────────────────────────┘

Yang sebenarnya kamu butuhkan
┌────────────────────────────────────────────────────────────────┐
│ [⬛] CPU      Ryzen 5 / Core i5          ├──────────┃░░░░┤  Wajib │
│      Kenapa ini penting? ▾                                       │
│ [▣] RAM      16 GB                       ├────────────┃░░┤ Wajib │
│ [▣] SSD      512 GB                      ├───────┃░░░░░┤  Wajib  │
│ [▢] GPU      Integrated cukup            ├┃░░░░░░░░░░░┤ Opsional │
│ [▢] Layar    IPS FHD 14"                 ├─────┃░░░░░░┤ Disarankan│
│ [⬛] Baterai  50 Wh+                      ├──────┃░░░░░┤ Disarankan│
└────────────────────────────────────────────────────────────────┘
```

- **Kartu profil gelap** (satu-satunya section gelap di halaman): ringkasan persona + dua meter
  "karakter" (Performa, Mobilitas). Nilainya *bukan hitungan*: dipetakan dari prioritas & aktivitas
  yang dipilih (tabel pemetaan statis di mock).
- **Daftar spek sebagai baris meter**, bukan 6 kartu: kolom ikon tile → komponen → minimum (Numeric)
  → meter dengan **zona cukup** diarsir di kanan garis → badge tingkat.
- **"Kenapa ini penting?"** membuka panel inline (Accordion Radix, gerak 240 ms) berisi alasan +
  penjelasan istilah (glosarium yang sudah ada).
- Banner budget ketat tetap, tapi diberi meter: garis kebutuhan vs "yang terjangkau budget-mu".
- Meter terisi stagger saat halaman siap (gerak 4).

## 19. Recommendation Result Redesign

Hasil = **momen payoff**.

```text
Kami menemukan 8 laptop yang cocok.
Berdasarkan budget, jurusan, dan aktivitasmu.        [Ubah]  [Persona ▾]

┌─────────────────────────── BEST MATCH ─────────────────────────────┐
│ ┌────────── tint blue-50 ──────────┐   ASUS Vivobook 14 (M1405)     │
│ │      [render laptop besar]       │   Programming · Produktivitas   │
│ │                                  │                                 │
│ │                       ◔ 94%      │   94% cocok  (Numeric XL)       │
│ └──────────────────────────────────┘   Rp8.299.000                   │
│                                                                      │
│  CPU ███████▌┃ ✓   RAM ████████┃ ✓   SSD ███████┃ ✓   Bobot ████┃ ✓ │
│                                                                      │
│  Kenapa cocok                         Perlu diketahui                │
│  ✓ RAM 16 GB untuk Docker  (sumber)    ⚠ GPU kurang untuk 3D berat   │
│  ✓ Sesuai budget Rp8 jt                                              │
│                                                                      │
│  [Lihat alasan lengkap →]  [⇄ Bandingkan]  [🔖]                      │
└──────────────────────────────────────────────────────────────────────┘

Alternatif   [Merek ▾] [Layar ▾] [Urutkan: Skor ▾]
┌ Performa Terbaik ┐ ┌ Nilai Terbaik ┐  (grid 2 kolom, kartu §20)
```

Urutan reveal (gerak 9, total ± 1,6 detik, berhenti bila pengguna scroll):

1. Kartu Best Match fade-up (240 ms)
2. Angka 0 → 94 (700 ms) bersamaan ring mengisi
3. Empat meter mengisi stagger 60 ms
4. Alasan & trade-off fade-in
5. Kartu alternatif masuk stagger

Best Match adalah satu-satunya kartu dengan Numeric XL dan meter penuh; alternatif memakai skor
Numeric biasa. Hierarki ini membuat "mana yang utama" tidak perlu dibaca.

## 20. Laptop Card Redesign

```text
┌─────────────────────────────────────┐
│ [🔖]                     [◔ 92%]    │  ← save kiri atas, skor kanan atas
│      ┌─ bidang studio ┐              │
│      │ [render 3/4]   │              │
│      └────────────────┘              │
│ PERFORMA TERBAIK                     │  ← label kategori (micro, biru)
│ Lenovo IdeaPad Slim 5 14             │
│ Programming · Desain · Data          │
│ Rp8.799.000                          │
│ [⬛16 GB] [▣512 GB] [▢1,46 kg]       │  ← spec trio dengan tile mini
│ CPU 8 core paling kencang di budget-mu│ ← alasan kategori
│ Kenapa cocok →        [⇄ Bandingkan] │
└─────────────────────────────────────┘
```

**Variants (Figma):** Best Match / Default / Compact × Default / Hover / Selected / Compared / Saved.
Hover: render skala 1.03 dan naik 4px (bayangan tetap), kartu naik 2px + shadow-sm, skor badge berubah dari putih ke biru solid,
"Kenapa cocok →" bergeser 3px. Compared: border `blue-700` + badge. Saved: bookmark terisi + pop.

## 21. Comparison Redesign

- Header kolom sticky: render 3/4 kecil, nama, harga, skor ring, tombol "Pilih laptop ini" (Trophy).
- Kolom pemenang (skor tertinggi) diberi latar `blue-50` penuh dari header sampai bawah.
- Setiap baris memakai **satu track meter dengan penanda A/B/C** terhadap garis kebutuhan, sehingga
  selisih terlihat tanpa membaca angka; angka tetap ada di bawah track.
- "Unggul" menjadi penanda bintang kecil di ujung fill terbaik.
- Tambah/hapus kolom memakai layout animation (kolom lain menggeser halus 240 ms).
- Toggle "Hanya perbedaan": baris yang sama melipat (height + opacity, 200 ms).
- Mobile: tetap mode kartu per kriteria, tiap kartu berisi track meter dengan A/B/C.

## 22. Laptop Detail Redesign

- Hero dua kolom: galeri render (3/4, depan, samping, port) yang bisa digeser (gerak 14), transisi
  crossfade + geser 8px saat ganti sudut, label "Ilustrasi"; kanan nama, harga, skor Numeric XL, CTA.
  Sudut yang belum ada filenya disembunyikan dari galeri (bukan ditampilkan kosong).
- "Berdasarkan kebutuhanmu" = **daftar meter Garis Kebutuhan** (pengganti daftar ✓/✕ teks).
- Score breakdown: bar berbobot (sudah ada) diberi isi bertahap dan tooltip kontribusi.
- Tabs Spesifikasi kunci / Kelebihan & kekurangan / Cocok untuk / Spesifikasi lengkap: indikator
  tab aktif meluncur di bawah tab (shared layout), bukan sekadar ganti warna.

## 23. Dashboard Redesign (Should have, `/saya`)

Ringkas: header "Keputusanmu" (laptop yang dipilih di Komparasi dengan render + skor), grid
laptop tersimpan (kartu Compact), dan riwayat rekomendasi sebagai timeline. Memakai data yang sudah
ada di `store/saved.ts`. Dikerjakan setelah MVP redesign.

## 24. Responsive Design

| Elemen | Mobile < 768 | Tablet 768–1023 | Desktop ≥ 1024 |
| --- | --- | --- | --- |
| Hero | Satu kolom; laptop di bawah; 2 callout; tanpa tilt | Satu kolom; laptop lebih besar; 3 callout | 5/7 kolom; tilt pointer |
| Cerita ter-pin | Tiga blok berurutan (tanpa pin) | Pin aktif | Pin aktif |
| Wizard | Strip meter atas + tombol menempel bawah | Seperti mobile, grid 3 kolom | Panel kanan penuh |
| Meter | Label di atas track | Label kiri | Label kiri + nilai kanan |
| Hasil | Kartu vertikal | Alternatif 2 kolom | Best Match horizontal |
| Komparasi | Kartu per kriteria | Tabel 3 kolom | Tabel + kolom pemenang |

Semua hover dibatasi pointer halus; target sentuh ≥ 44px; tidak ada interaksi yang hanya ada saat hover.

### Visual asset (imagery)

Keputusan Fahren: **render laptop dibuat dengan AI** (rencana awal Midjourney; yang dipakai hasil
Gemini) dan **foto suasana memakai foto CC0 dengan treatment seragam**. Tidak ada ilustrasi vektor.

**1. Render laptop (produk)** — prompt, alur kerja, dan status per file di `docs/MIDJOURNEY_PROMPTS.md`.

Status 19 Okt 2026: **14 render sudah ada** di `public/images/laptops/` — sudut `34` untuk ketujuh
kombinasi, `front` silver, `side` (2 silver, 1 navy), `ports` (2 silver, 1 navy). Belum ada: `front`
untuk 6 kombinasi lain, serta `side`/`ports` untuk graphite, mist, dan creator.

- 3 bentuk (*ultrabook 14"*, *mainstream 14"*, *creator 15,6"*) × 2–3 warna bodi × 4 sudut
  (`34`, `front`, `side`, `ports`) = 28 file. Setiap laptop di mock dipetakan ke satu bentuk + warna.
- Tanpa logo merek; diberi label "Ilustrasi" (alt text: "Ilustrasi laptop {bentuk} warna {warna},
  bukan foto produk asli"). Footer: "Gambar laptop adalah ilustrasi."
- File: `public/images/laptops/{bentuk}-{warna}-{sudut}.webp`, 2048×1536, 18–54 KB, **latar studio
  `#EEF0F4` yang sudah diratakan** (bukan transparan: memotong latar laptop silver di atas latar abu
  merusak tepinya). Ditampilkan dengan `next/image` (`sizes` per konteks) di atas bidang `studio`.
- Data: mock laptop mendapat field `image: { shape, color }`; URL disusun di `lib/laptop-image.ts`.
  Field `imageUrl` yang sudah ada (PRD §29) tetap dipakai dan diarahkan ke render `34`, jadi bentuk
  data untuk backend tidak berubah.
  Render `front` mencatat `screenRect` (persentase kotak layar) agar UI NEXORA bisa ditempel tepat.
- **Sudut yang belum ada**: `LaptopRender` memakai urutan cadangan (sudut yang sama dari bentuk lain
  dengan warna sama → sudut `34` kombinasi itu); galeri Detail hanya menampilkan sudut yang filenya
  ada. Siluet netral (bidang studio + ikon Phosphor `Laptop` duotone) hanya bila tidak ada file sama
  sekali. Daftar file yang tersedia ditulis di satu manifest (`lib/laptop-image.ts`), tanpa cek ke server.

**2. Foto suasana (CC0)** — hanya untuk suasana, tidak pernah disajikan sebagai produk NEXORA,
pengguna asli, atau testimoni. Logo merek pada laptop di foto dipotong atau tidak terlihat.

| Foto | Sumber | Dipakai di |
| --- | --- | --- |
| "Office Work" — tangan di laptop dengan gambar teknik | [StockSnap 42H3JH8QI5](https://stocksnap.io/photo/office-work-42H3JH8QI5), energepic.com · CC0 | Kartu persona Teknik/Informatika (`persona-teknik`) |
| "Man Work" — meja putih dari atas, laptop, buku catatan | [StockSnap DZ7DC58DSV](https://stocksnap.io/photo/man-work-DZ7DC58DSV), Burst · CC0 | Kartu persona Umum (`persona-umum`) |
| Meja desain (cat air, sketsa motif, tablet gambar) | Render AI Gemini, dibuat Fahren | Kartu persona Desain (`persona-desain`) |
| Meja profesional (grafik, laporan, kartu nama) | Render AI Gemini, dibuat Fahren | Kartu persona Profesional (`persona-profesional`) |
| "Macbook Laptop" — meja kayu gelap, kopi, kacamata | [StockSnap DWLWL9USBG](https://stocksnap.io/photo/macbook-laptop-DWLWL9USBG), Lia Leslie · CC0 | Band gelap landing (`band-desk`, potongan 4:3 digeser ke kanan) |

Keputusan Fahren (19 Okt 2026): campuran Gemini + CC0. Kandidat lain (ILQA1VXXOJ, BR2IU3WKMP) tidak
dipakai; 13UNSPJHCZ (terlalu kosong) dan UNB7V2H5L4 (bokeh biru terasa glow) ditolak. Foto CC0 hanya
tersedia 960px, cukup untuk kartu (±400px) dan band yang digelapkan. Metadata alt + kredit ada di
`lib/mood-photos.ts`; kredit tampil di `/dev/components` dan nanti di footer: "Foto suasana: StockSnap
(CC0)".

**Treatment seragam** (di-bake saat ekspor agar tidak membebani browser):

- Terang: grayscale 100%, kontras +5%, lalu diberi nada `blue-950` lewat duotone (bayangan
  `#0E1F55`, sorotan `#F4F5F7`). Hasilnya foto biru-abu yang menyatu dengan ramp warna §10.
- Gelap (band `ink-950`): duotone yang sama + kecerahan −35%; teks tidak pernah diletakkan di atas
  bagian foto yang ramai.
- Potongan 4:3; radius 24; WebP maks. 1600w kualitas 75 (hasil 7–119 KB).
- File: `public/images/mood/{nama}.webp`.

## 25. Accessibility

- Kontras: semua pasangan di §10 diverifikasi ≥ 4,5 : 1 (teks) dan ≥ 3 : 1 (ikon, garis meter).
- Meter bukan sekadar gambar: setiap baris punya teks "RAM 16 GB, butuh 16 GB, memenuhi" (sr-only)
  dan role `meter` dengan `aria-valuenow/min/max`.
- Status selalu ikon + teks (✓ Memenuhi, ✕ Kurang 8 GB, ⚠ Trade-off).
- Fokus: ring 2px biru + offset 2px tetap; di section gelap ring memakai `blue-400`.
- Cerita scroll ter-pin punya struktur heading biasa; konten tetap terbaca tanpa scroll animation.
- `prefers-reduced-motion` sesuai §13. Count-up diumumkan sekali (nilai akhir), bukan tiap frame.

## 26. Frontend Technical Implementation Plan

| Aspek | Keputusan | Alasan |
| --- | --- | --- |
| Animasi | **Motion** (sudah terpasang) + transisi CSS | Cukup untuk whileInView, useScroll, layoutId, spring |
| Scroll storytelling | `useScroll` + `useTransform` Motion, `position: sticky` | Tidak perlu GSAP ScrollTrigger |
| Smooth scroll | **Tidak** (tanpa Lenis) | Menghindari hijack scroll & masalah aksesibilitas |
| 3D | **Tidak** (tanpa Three.js/R3F) | CSS `perspective` + `rotateX/Y` + spring cukup |
| Ikon | Phosphor duotone/bold (disetujui) | Lihat §12 |
| Gambar | Render AI + foto CC0 lewat `next/image` dari `public/` | Optimasi ukuran & `sizes` otomatis; tanpa layanan luar |
| Token | Tambah ramp warna, tipe, motion ke `@theme` di `globals.css` | Satu sumber kebenaran |
| Data | Tidak berubah; tambah data statis kecil: teks umpan balik per opsi, peta "karakter" persona, `image: { shape, color }` per laptop | Tetap lewat `lib/api.ts` |

Komponen baru: `NeedMeter`, `NeedMeterGroup`, `LaptopRender`, `MoodPhoto`, `SpecCallout`, `IconTile`,
`CountUp`, `ScrollStory`, `RevealOnView`, `RenderGallery`, `ProfileForming` (panel wizard). Komponen yang dirombak: `Button`,
`SelectCard`, `LaptopCard`, `ScoreRing`, `RequirementCard`, `CompareTray`, `Stepper`.

## 27. Animation Implementation Plan

| Gerak | Teknik | Catatan performa |
| --- | --- | --- |
| Reveal hero | `motion.div` `initial/animate`, `transform` string | Hardware-accelerated |
| Tilt pointer | `useMotionValue` + `useSpring`, `rotateX/Y` dengan `perspective: 1200px` | Hanya `pointer: fine`; pause saat tab tak terlihat |
| Cerita ter-pin | Wrapper `height: 300vh`, anak `sticky top-0`, `useScroll({ target })` → indeks layar | Tanpa re-render per frame: pakai `useMotionValueEvent` untuk ganti indeks |
| Isi meter | `scaleX` dari 0→nilai, `transform-origin: left` | Tidak menganimasikan `width` |
| Count-up | `animate(0, value)` + `onUpdate` (sudah dipakai `ScoreRing`) | Sekali per mount |
| Transisi langkah | `AnimatePresence mode="popLayout"` + `custom` arah | Exit 150 ms |
| Filter Analisis | `motion.li` dengan `animate={{ opacity, scale }}` per laptop | 12 item, aman |
| Fly-to-tray | `layoutId` pada thumbnail kartu dan item tray | Fallback: pop-in bila elemen di luar viewport |
| Tab indicator | `layoutId="tab-indicator"` | — |
| Hover/press | CSS `transition: transform 140ms var(--ease-out)` | Bukan Motion, agar off-main-thread |
| Putar sudut render (11) | Dua `motion.img` bertumpuk, `opacity` = `useTransform(scrollYProgress, [a, b], [1, 0])` | Kedua gambar dimuat dulu (`priority` untuk 3/4); tanpa ganti `src` saat scroll |
| Reveal foto (12) | `motion.div` dengan `clipPath` + `scale` di `whileInView`, `viewport={{ once: true, amount: 0.4 }}` | `clip-path` inset murah; hanya satu foto beranimasi per viewport |
| Render masuk kartu (13) | Variants induk `staggerChildren` di payoff: render → skor → ring → meter → alasan | Total ≤ 1,8 detik; skip bila kembali dari Detail |
| Galeri geser (14) | `drag="x"`, `dragElastic: 0.15`, `onDragEnd` → indeks berdasar `offset.x` + `velocity.x`; `animate` ke `-index × width` | Tombol ← → dan panah keyboard memanggil fungsi yang sama |
| Kedalaman pointer (15) | `useMotionValue` x/y → dua `useSpring`; render `x * 6`, callout `x * -3` | Matikan saat `pointer: coarse` dan reduced motion |

## 28. Component Changes (Figma-oriented)

```text
Frames: Desktop 1440 (12 kol, max 1200, gutter 24) · Tablet 768 (8 kol) · Mobile 375 (4 kol, margin 16)

Button
├── Primary / Secondary / Ghost / Link
├── Size S · M · L · Icon
└── State Default · Hover · Pressed · Focus · Disabled · Loading

IconTile
├── Category Performa · Memori · Layar · Mobilitas
└── Size 32 · 40

NeedMeter                          ← komponen signature
├── Mode Requirement (garis + zona) · Laptop (fill vs garis) · Compare (A/B/C)
├── Status Met · Short · Near · Unchecked
└── Size Compact · Default · Large

SelectCard
├── Single · Multi
├── State Default · Hover · Pressed · Selected · Disabled
└── Primary badge on/off

LaptopCard
├── Best Match · Default · Compact
└── State Default · Hover · Selected · Compared · Saved

ScoreRing
├── Excellent · Good · Fair
└── Size S · M · L · XL (payoff)

LaptopRender
├── Shape Ultrabook · Mainstream · Creator
├── Color Silver · Mist · Graphite · Navy
├── Angle 3/4 · Front · Side · Ports
├── Screen (front saja) Profile · Result · Blank
└── State Loaded · Fallback (siluet)

MoodPhoto
├── Tone Light · Dark
└── Ratio 4:3 · 3:4

SpecCallout   ProfileForming   CompareTray (1·2·3 · Collapsed/Expanded)
```

Auto Layout: semua kartu memakai padding 20/24, gap 12/16; meter = horizontal auto layout
(label 120 fixed, track fill, nilai hug). Color & text styles mengikuti §10–11; motion notes
ditulis di deskripsi komponen memakai token §13.

## 29. Before vs After

| Before | After | Why |
| --- | --- | --- |
| Kotak abu 4:3 sebagai elemen terbesar hero | Render laptop 3/4 + callout spek bermeter | Objek produk + output produk dalam satu pandang |
| Chip preset di bawah CTA | Preset budget sebagai kontrol utama yang menggerakkan visual | "Live thing" yang langsung menunjukkan nilai |
| 3 kolom "Cara kerja" statis | Cerita scroll ter-pin dengan layar yang berganti | Alur dialami, bukan dibaca |
| Kartu spek teks × 6 | Baris Garis Kebutuhan dengan zona cukup | Satu pandang = paham |
| Panel ringkasan wizard berupa teks | Render mini + meter yang terisi tiap jawaban | Progres terasa |
| Analisis = daftar centang | Katalog 12 laptop yang tersaring nyata + 4 tahap | Proses terlihat jujur |
| Skor muncul sekaligus | Urutan reveal payoff 1,6 detik | Hasil terasa sebagai hadiah |
| Semua kartu satu resep | Hierarki Best Match / Default / Compact + bidang studio | Mana yang utama tidak perlu dibaca |
| Ikon garis tipis tanpa wadah | Tile kategori + satu keluarga ikon tebal | Ikon jadi bahasa |
| Putih + satu biru | Ramp biru + tinta gelap + status bermakna | Ritme dan kedalaman tanpa warna acak |
| Tidak ada foto | Foto suasana CC0 dengan duotone biru seragam | Konteks manusia tanpa memalsukan produk |

Target: **lebih hidup, tidak lebih ramai.**

## 30. MVP Redesign Scope

| Fase | Isi | Estimasi |
| --- | --- | --- |
| **R1 — Fondasi** | Token warna/tipe/motion, `@phosphor-icons/react` + `IconTile`, `NeedMeter`, `LaptopRender` (dengan siluet fallback), `MoodPhoto` + 5 foto ber-treatment, field `image` di mock, Button/SelectCard baru | 1 sesi |
| **R2 — Landing** | Hero hybrid + live preset, section 2–7, cerita ter-pin | 1–2 sesi |
| **R3 — Alur** | Wizard (umpan balik, ProfileForming), Profil Kebutuhan (kartu gelap + meter), Analisis (filter katalog) | 1–2 sesi |
| **R4 — Payoff** | Hasil (reveal), LaptopCard baru, fly-to-tray, Detail (meter + galeri), Komparasi (meter A/B/C) | 1–2 sesi |
| R5 — Should have | `/saya`, `/jelajah` dengan sistem baru | Setelah MVP |

Render yang belum lengkap tidak memblokir R1–R4: `LaptopRender` memakai cadangan sudut (§24).

### Keputusan (penyimpangan dari PRD/aturan proyek) — disetujui Fahren, 19 Okt 2026

1. ✅ **Ikon Phosphor duotone** (dependency baru `@phosphor-icons/react`), Lucide dilepas bertahap.
2. ✅ **Section gelap `ink-950`** di Profil (kartu), Analisis, dan satu band landing. PRD §11/§13
   menyebut latar terang; dibatasi **maksimal satu per layar**.
3. ✅ **Render laptop AI** (bukan vektor) sebagai pengganti placeholder, diberi label
   "Ilustrasi" (PRD §22 menyebut foto produk asli). Fahren yang membuat render (Gemini).
4. ✅ **Foto suasana CC0** dengan treatment duotone seragam (§24).
5. ✅ **Animasi lebih kaya dengan Motion/Framer Motion**: 10 gerak inti + 5 gerak gambar (§13).
6. **Ramp warna diperluas** (biru 50–950, ink, info) dan **Display XL 80px & Numeric XL 96px** —
   di atas PRD §22; ikut arah visual, konfirmasi akhir saat review R1.
7. **Shadow**: tetap hanya `sm` (hover) dan `lg` (mengambang) sesuai PRD; tidak ada perubahan.

## 31. Final Design Checklist

- [ ] Garis Kebutuhan muncul di Landing, Wizard, Profil, Hasil, Detail, Komparasi
- [ ] Tidak ada placeholder abu di layar mana pun (siluet fallback hanya sampai render masuk)
- [ ] Semua render berlabel "Ilustrasi"; foto CC0 tercantum kreditnya; tidak ada logo merek di render
- [ ] Setiap elemen yang bisa ditekan punya hover (pointer), press, fokus, selected
- [ ] Hanya 10 gerak inti + 5 gerak gambar (§13); tidak ada loop dekoratif
- [ ] Semua gerak posisi mati saat reduced motion; konten tetap lengkap
- [ ] Maksimal satu section gelap per layar; tanpa gradient, glow, glass, blob
- [ ] Kontras AA di terang dan gelap; status = ikon + teks
- [ ] Mobile 375: tanpa overflow, tanpa hover-only, target ≥ 44px
- [ ] Tidak ada library baru selain yang disetujui di §30
- [ ] Routing, store, mock, dan `lib/api.ts` tidak berubah perilakunya
- [ ] `npm run lint` dan `npm run build` lolos tiap fase

---

## Lampiran — Design rationale untuk perubahan besar

| Perubahan | Problem | Decision | Reason | UX benefit | Technical feasibility |
| --- | --- | --- | --- | --- | --- |
| Garis Kebutuhan | Tiga bahasa visual untuk "cukup/kurang" | Satu komponen meter dengan penanda kebutuhan | Motif tunggal = identitas + pemahaman cepat | Paham tanpa membaca angka | `NeedMeter` berbasis `scaleX`; data dari `spec-check.ts` |
| Hero hybrid | Visual anchor kosong | Render + callout + preset live | Produk dan output terlihat bersamaan | Fungsi jelas < 5 detik | `next/image` + Motion; data `getRequirements()` |
| Cerita ter-pin | "Cara kerja" statis | Sticky scroll 3 layar | Storytelling sesuai PRD §6 | Alur dialami | `useScroll` + sticky; fallback statis |
| Payoff reveal | Hasil terasa biasa | Urutan reveal 1,6 detik | Mengarahkan mata ke skor lalu alasan | Hasil terasa layak dipercaya | `ScoreRing` sudah punya count-up; tambah stagger |
| Analisis tersaring | Loading biasa | Visual katalog 12 → 9 → skor | Proses jujur, bukan teater | Kepercayaan naik | 12 `motion.li` dengan data mock |
| Tile ikon | Ikon tenggelam | Ikon tebal di tile kategori | Ikon jadi pengelompok visual | Pemindaian lebih cepat | `IconTile` + 1 keluarga ikon |

## Lampiran — Self-critique (1–10)

Putaran pertama konsep (sebelum Garis Kebutuhan dijadikan motif tunggal):

| Aspek | Skor | Kekurangan |
| --- | --- | --- |
| Visual quality | 7 | Mengandalkan tint dan motion; belum ada objek produk |
| UX clarity | 8 | — |
| Brand identity | 6 | Tanpa motif khas, masih bisa tertukar dengan produk lain |
| Interaction quality | 8 | — |
| Motion quality | 7 | Daftar gerak terlalu banyak, beberapa dekoratif |
| Information hierarchy | 7 | Best Match belum cukup dominan |
| Accessibility | 8 | — |
| Mobile experience | 7 | Cerita ter-pin berat di HP |
| Technical feasibility | 9 | — |
| Anti-slop | 8 | — |

Revisi yang dilakukan: (1) Garis Kebutuhan dijadikan signature di semua halaman (brand → 8);
(2) objek laptop menggantikan placeholder (visual → 8; kemudian diputuskan memakai render AI
+ foto CC0, target visual 9 bila render lolos daftar tolak);
(3) gerak dipangkas menjadi tepat 10 dengan tujuan tertulis (motion → 8), lalu ditambah 5 gerak gambar
yang masing-masing terikat ke render atau foto; (4) Best Match satu-satunya
pemakai Numeric XL dan meter penuh (hierarki → 8); (5) cerita ter-pin dimatikan di mobile dan
diganti tiga blok berurutan (mobile → 8).

| Aspek | Skor akhir |
| --- | --- |
| Visual quality | 8 |
| UX clarity | 9 |
| Brand identity | 8 |
| Interaction quality | 8 |
| Motion quality | 8 |
| Information hierarchy | 8 |
| Accessibility | 8 |
| Mobile experience | 8 |
| Technical feasibility | 9 |
| Anti-design-slop | 9 |

Risiko yang tersisa: (1) **konsistensi render AI** antar sudut dan warna. Set pertama sudah
konsisten; render tambahan harus lolos daftar tolak di `MIDJOURNEY_PROMPTS.md` §5 dan diproses
dengan skrip yang sama. Desain silver mirip MacBook; aman karena tanpa logo dan berlabel "Ilustrasi".
(2) Foto CC0 bisa terasa "stok" bila dipakai mentah, karena itu treatment duotone wajib dan foto
tidak pernah jadi elemen terbesar di layar.
