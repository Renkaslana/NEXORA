# NEXORA — Frontend PRD & UI/UX Design Specification

Oct 18, 2026 · @ren

Dokumen ini adalah blueprint frontend NEXORA: 6 halaman inti yang matang (Landing, Wizard, Profil Kebutuhan, Hasil, Detail, Komparasi), semuanya memakai mock data, dibangun dengan Next.js + TypeScript + Tailwind. Backend, API, database, dan perhitungan SAW sengaja di luar cakupan tahap ini.

## 1. Product Overview

NEXORA adalah Sistem Pendukung Keputusan (SPK) pemilihan laptop. Pengguna menjawab 5 pertanyaan singkat, sistem menerjemahkannya menjadi **profil spesifikasi minimum**, lalu menampilkan laptop yang paling cocok beserta alasan dan trade-off-nya.

**Nama produk.** Prompt memakai nama kerja *SpecMate*, sedangkan board Trello kelompok 7A memakai *NEXORA*. Rekomendasi: tetap **NEXORA** karena sudah menjadi identitas resmi proyek di board, SRS, dan komunikasi dengan dosen. Alternatif bila ingin nama yang lebih deskriptif:

| Nama | Kesan | Catatan |
| --- | --- | --- |
| NEXORA (rekomendasi) | Teknologi, cerdas | Sudah dipakai tim; tambah subjudul "Laptop Decision Assistant" agar fungsinya jelas |
| SpecMate | Ramah, teman memilih spek | Jelas, tapi kurang unik |
| Pas Laptop | Lokal, mudah diingat | Cocok untuk pasar mahasiswa Indonesia |
| Fitspec | Singkat, "spec yang pas" | Mudah jadi domain |

**Tagline.** Usulan utama: **"Jangan pilih laptop dari speknya. Pilih dari kebutuhanmu."** Alternatif: "Tahu dulu butuhnya, baru pilih laptopnya." · "Laptop yang pas, alasan yang jelas." · Versi Inggris: "Know what you need before you choose."

**Bahasa antarmuka.** Bahasa Indonesia sebagai default karena target pengguna mahasiswa Indonesia dan dataset laptop pasar Indonesia. Istilah teknis (RAM, SSD, GPU) tetap apa adanya, selalu disertai penjelasan awam.

## 2. Problem Statement

Masalah utamanya bukan "mencari laptop termurah", melainkan: **"Saya punya budget, tapi tidak tahu spesifikasi apa yang sebenarnya saya butuhkan."**

Contoh: mahasiswa Informatika dengan budget Rp8 juta tidak tahu apakah Ryzen 5 cukup, apakah RAM 8GB akan menghambat, atau apakah GPU dedicated perlu. Akibatnya ada dua kesalahan yang sering terjadi (dari kartu Problem Statement di Trello):

- Mahasiswa teknik membeli laptop tipis dengan pendingin dan RAM yang kurang untuk Docker, VM, atau Android Studio.
- Mahasiswa non-teknik membeli laptop gaming yang berat dan boros baterai, padahal kebutuhannya dokumen dan presentasi.

Toko online dan situs review hanya menjawab "laptop ini bagus", bukan "laptop ini cocok untukmu karena…".

## 3. Product Goal

1. **Memahamkan kebutuhan.** Pengguna keluar dengan pemahaman spesifikasi minimum yang ia butuhkan, beserta alasannya.
2. **Merekomendasikan dengan alasan.** Setiap laptop rekomendasi punya match score, alasan cocok, dan trade-off yang jujur.
3. **Memudahkan keputusan akhir.** Komparasi 2–3 laptop yang langsung menunjukkan mana yang terbaik untuk profil pengguna.

Ukuran keberhasilan untuk demo dosen: pengguna baru menyelesaikan wizard dalam waktu kurang dari 2 menit, dan bisa menjelaskan kembali kenapa laptop teratas direkomendasikan. Keduanya diuji di tahap UAT oleh Yesa.

## 4. Target Users

Pengguna primer: mahasiswa (S1/D3) di Indonesia dengan budget Rp5–20 juta yang membeli laptop pertama atau pengganti. Pengguna sekunder: karyawan pemula dan orang tua yang membelikan laptop untuk anaknya. Pengguna tersier: admin (anggota tim) yang mengelola data laptop.

Karakteristik umum: memakai HP sebagai perangkat utama untuk riset (desain mobile wajib bagus), terbiasa dengan marketplace, tidak paham istilah teknis, dan sensitif harga.

## 5. User Persona

Empat persona mengikuti kartu Persona di Trello:

| Persona | Contoh | Budget | Kebutuhan utama | Ketakutan |
| --- | --- | --- | --- | --- |
| Mahasiswa Teknik & Informatika | Raka, 19, Informatika | Rp8–12 juta | CPU multi-core, RAM 16GB, SSD 512GB untuk VS Code, Docker, Android Studio | Laptop lemot saat compile, RAM tidak bisa di-upgrade |
| Mahasiswa Desain, Multimedia & Arsitektur | Salsa, 20, DKV | Rp12–20 juta | Layar 100% sRGB/OLED, GPU dedicated untuk Blender, Premiere, AutoCAD | Warna layar tidak akurat, render lama |
| Mahasiswa Umum | Dinda, 18, Hukum | Rp5–8 juta | Bobot di bawah 1,4 kg, baterai di atas 8 jam, keyboard nyaman | Terlalu berat dibawa, terjebak beli laptop gaming |
| Karyawan & Profesional | Bima, 24, staf admin | Rp8–14 juta | Portabel, webcam FHD, port lengkap (HDMI, USB-C), baterai awet | Laptop terlihat murahan saat meeting, port kurang |

Persona dipakai di dua tempat: sebagai pilihan cepat di wizard (Step 2), dan sebagai dasar bobot kriteria SAW yang nanti dihitung backend.

## 6. User Journey

Perjalanan pengguna bergerak dari bingung ke yakin, dan Profil Kebutuhan adalah titik baliknya: pengguna melihat spesifikasi yang ia butuhkan sebelum melihat satu pun laptop.

&#91;embedded content: user journey MVP · 8 tahap\]

Dari Hasil, pengguna selalu bisa kembali ke Wizard untuk mengubah jawaban tanpa mengulang dari awal. Detail dan Komparasi saling terhubung dua arah.

**Perjalanan emosional:** Bingung ("spek apa yang saya butuh?") → Dipahami ("oh, ternyata saya butuh RAM 16GB karena…") → Terarah ("ada 8 laptop yang cocok") → Mengevaluasi ("yang ini lebih ringan, yang itu lebih kencang") → Yakin ("saya tahu kenapa memilih ini").

## 7. Information Architecture

NEXORA disusun dalam tiga lapisan informasi, dari yang paling sederhana ke yang paling detail (progressive disclosure):

1. **Lapisan kebutuhan.** Jawaban wizard dan Profil Kebutuhan. Bahasa awam, tanpa angka benchmark.
2. **Lapisan rekomendasi.** Kartu laptop dengan match score, 3 alasan utama, dan 1 trade-off. Cukup untuk memutuskan bagi kebanyakan pengguna.
3. **Lapisan bukti.** Spesifikasi lengkap, score breakdown per kriteria, dan tabel komparasi. Untuk pengguna yang ingin memverifikasi.

Objek inti yang muncul di semua halaman:

| Objek | Isi | Muncul di |
| --- | --- | --- |
| Profil Pengguna | Budget, jurusan, aktivitas, software, prioritas | Wizard, Profil Kebutuhan, Hasil (ringkasan di header) |
| Spesifikasi Minimum | CPU, RAM, SSD, GPU, layar, baterai + alasan | Profil Kebutuhan, Detail (indikator lolos/tidak) |
| Laptop | Spek, harga, gambar, pro/kontra | Hasil, Detail, Komparasi, Explore |
| Hasil Rekomendasi | Match score, breakdown, kategori (Best Value, dll.), alasan | Hasil, Detail |
| Daftar Komparasi | 2–3 laptop terpilih | Tray mengambang di semua halaman, Komparasi |

## 8. Sitemap

Rute mengikuti App Router Next.js. Yang bertanda **(MVP)** wajib untuk demo dosen.

- `/` Landing **(MVP)**
- `/rekomendasi` Wizard **(MVP)**
  - `/rekomendasi/budget`, `/jurusan`, `/aktivitas`, `/software`, `/prioritas` (5 langkah, state disimpan di satu store)
  - `/rekomendasi/profil` Profil Kebutuhan **(MVP)**
  - `/rekomendasi/analisis` layar proses **(MVP)**
  - `/rekomendasi/hasil` Hasil Rekomendasi **(MVP)**
- `/laptop/[slug]` Detail Laptop **(MVP)**
- `/bandingkan?ids=a,b,c` Komparasi **(MVP)**
- `/jelajah` Explore Laptops (Should have)
- `/cara-kerja` How It Works (bisa jadi section di Landing saja)
- `/saya` Dashboard pengguna: tersimpan, riwayat (Should have)
- `/admin` Dashboard admin, `/admin/laptop`, `/admin/kriteria` (Nice to have untuk demo)

Komparasi memakai query string agar hasil komparasi bisa dibagikan sebagai link.

## 9. Design Research

Kesimpulan riset: produk sejenis yang paling dipercaya bukan yang paling ramai visualnya, melainkan yang **menunjukkan cara kerja dan alasan hasilnya**. NEXORA mengambil tiga pelajaran utama: pertanyaan bertahap yang pendek, hasil sedikit tapi beralasan, dan data spesifikasi yang tersusun rapi seperti tabel uji.

Riset dibagi ke empat kelompok sesuai prompt:

- **Premium technology product** (Apple, Framework). Produk menjadi pusat visual, spesifikasi disusun berjenjang, dan konfigurasi dibuat langkah demi langkah.
- **Recommendation & decision making** (Newegg Laptop Finder, N.N Laptop Finder, HP Smart Finder). Semua memakai kuis singkat (sekitar 5 pertanyaan) berisi kegunaan, budget, dan fitur wajib, lalu memberi peringkat.
- **Data & review** (RTINGS, Which?). Hasil uji disajikan sebagai tabel yang bisa difilter dan skor yang bisa diatur sendiri sesuai prioritas pengguna.
- **AI product UX** (Perplexity, Linear). Kepercayaan dibangun dengan menunjukkan sumber atau alasan di samping jawaban, bukan dengan visual "AI".

## 10. Reference Analysis

Pola analisis: Referensi → Yang dipelajari → Prinsip → Implementasi NEXORA. Yang diambil adalah prinsip, bukan tampilan.

| Referensi | Yang dipelajari | Relevansi untuk NEXORA | Yang tidak boleh ditiru |
| --- | --- | --- | --- |
| [Apple – Compare Mac models](https://www.apple.com/ge/mac/compare/) | Komparasi kolom berdampingan dengan baris spek yang sejajar dan gambar produk di kepala kolom | Pola dasar halaman Komparasi: header produk menempel saat scroll, baris spek sejajar | Layout dan gaya visual Apple; daftar spek yang sangat panjang tanpa konteks kebutuhan |
| [Framework Laptop 13 – configurator](https://frame.work/products/laptop-diy-13-gen-amd) | Konfigurasi bertahap per bagian (sistem, memori, storage) dengan status lengkap/belum di tiap bagian | Pola Wizard: tiap langkah punya status, ringkasan pilihan selalu terlihat | Nuansa toko (harga per opsi, keranjang) |
| [Framework – panduan memilih](https://frame.work/blog/the-best-framework-laptops-at-every-price-point) | Rekomendasi dikelompokkan per rentang harga dan kebutuhan | Kategori hasil "Best Value", "Best Performance" per budget | Gaya artikel blog panjang |
| [Newegg Laptop Finder](https://www.businesswire.com/news/home/20220809005270/en) | Kuis kegunaan utama, budget, dan fitur, lalu skor untuk meranking laptop; 5 kategori kegunaan | Bukti bahwa pola kuis + skor dipakai retailer besar | Ujungnya mendorong pembelian; NEXORA tetap netral |
| [N.N Laptop Finder](https://nnlaptops.com/find-my-laptop) | 5 pertanyaan, filter dulu lalu ranking, hanya 3 hasil teratas dengan alasan, "mulai ulang" untuk mengubah input | Sangat dekat dengan alur NEXORA (filter aturan + pemeringkatan); validasi bahwa Top 3–5 lebih berguna daripada 10+ | Tombol pesan via WhatsApp dan klaim garansi toko |
| [HP Smart Finder Quiz](https://outgrow.co/blog/?p=60902) | Kuis singkat yang dipersonalisasi untuk mengurangi kebingungan | Nada copywriting yang menenangkan di Landing dan Wizard | Hanya merekomendasikan satu merek |
| [RTINGS – Laptop Tools](https://www.rtings.com/laptop/tools) | Results Table Tool untuk filter dan sort, plus Custom Ratings: pengguna mengatur bobot sendiri | Inspirasi "Weight slider" di Step 5 dan Score Breakdown yang transparan | Kepadatan data tinggi yang membingungkan pengguna awam |
| [Which? – Laptop reviews](https://www.which.co.uk/reviews/laptops) | Skor uji, pro dan kontra singkat per produk, filter "minimal skor 4 untuk kriteria X" | Kartu laptop dengan pro/kontra satu baris; filter berbasis kebutuhan | Paywall dan lencana "Best Buy" yang terasa seperti iklan |
| [PCPartPicker (via panduan)](https://www.itechguides.com/how-to-use-pcpartpicker-to-plan-a-compatible-pc-build) | Pengecekan kompatibilitas real-time dan catatan peringatan yang menjelaskan masalah | Indikator "memenuhi / tidak memenuhi spek minimum" di Detail dan Komparasi | Antarmuka padat berbasis daftar komponen |
| [Perplexity (via TechTarget)](https://www.techtarget.com/searchEnterpriseAI/tutorial/How-to-use-Perplexity-AI-Tutorial-pros-and-cons) | Jawaban langsung yang selalu disertai sumber yang bisa diperiksa | Panel "Kenapa direkomendasikan": setiap klaim menunjuk ke data spek atau jawaban wizard | Tampilan chatbot; NEXORA bukan chat |
| Linear (tanpa halaman yang dibuka, dari pengetahuan umum) | Tipografi tegas, hierarki jelas, warna aksen hemat | Disiplin tipografi dan spacing di Design System | Tema gelap dan estetika SaaS developer |

**Prinsip yang diekstrak:**

1. *Apple → Produk adalah pusat.* Gambar laptop menjadi elemen terbesar di kartu hasil dan Detail; spek disusun dari yang paling relevan dengan profil pengguna.
2. *N.N Finder dan Newegg → Sedikit tapi beralasan.* Tampilkan 1 Best Match + 4 alternatif berkategori, bukan grid 20 laptop.
3. *RTINGS → Kendali di tangan pengguna.* Prioritas bisa diatur ulang dan hasil langsung berubah.
4. *PCPartPicker → Cocok atau tidak, dengan catatan.* Setiap spek dibandingkan dengan kebutuhan minimum, lengkap dengan catatan saat tidak memenuhi.
5. *Perplexity → Klaim selalu bisa diperiksa.* Setiap alasan rekomendasi bisa dibuka sampai ke datanya.

## 11. Anti-Design-Slop Guidelines

Aturan praktis yang dipakai saat review desain di Figma. Jika satu elemen melanggar dan tidak punya fungsi, hapus.

| Hindari | Ganti dengan | Alasan |
| --- | --- | --- |
| Gradient ungu-biru, mesh, blob | Latar putih/abu terang, satu warna aksen solid | Fokus ke data dan produk |
| Glassmorphism dan glow di setiap kartu | Kartu datar dengan border 1px; shadow hanya untuk elemen yang mengambang (tray, modal) | Hierarki dari kontras, bukan efek |
| Laptop 3D berputar sebagai dekorasi | Foto produk asli dengan latar netral | Lebih dipercaya, lebih ringan, mudah dibuat |
| Robot atau ikon "AI sparkle" | Ikon fungsional (Lucide) yang menggambarkan aksi | AI bukan label marketing |
| Section fitur dengan 3 kartu identik | Penjelasan "Cara kerja" yang memakai cuplikan UI asli | Menunjukkan, bukan mengklaim |
| Copy generik ("The Future of…") | Copy spesifik: "Budget Rp8 juta, kuliah Informatika? Kami tunjukkan spek yang kamu butuh." | Pengguna langsung paham manfaat |
| Gradient text, neon | Teks hitam pekat, bobot tebal untuk penekanan | Keterbacaan |
| Rounded berlebihan (pill di semua tempat) | Radius konsisten 8–12px; pill hanya untuk chip | Terlihat rapi dan dewasa |
| Warna sebagai satu-satunya penanda | Warna + ikon + teks ("Memenuhi", "Kurang") | Aksesibilitas |

Uji cepat: tutup logo NEXORA, lalu tanya "apakah ini bisa jadi landing page startup AI mana pun?" Jika ya, desain belum punya identitas.

## 12. Landing Page Concepts

Keputusan: **Concept D (Hybrid)** dengan foto laptop asli, bukan 3D. Hero menggabungkan value proposition, CTA, dan "preview interaktif" berupa kartu profil kebutuhan yang menunjukkan hasil yang akan didapat pengguna.

| Konsep | Gambaran | Kelebihan | Kekurangan | Skor (1–5) |
| --- | --- | --- | --- | --- |
| A. Premium Tech / 3D Laptop | Laptop 3D mengambang, chip info kecil di sekelilingnya | Berkesan, visual kuat | Butuh Three.js/R3F, berat di HP, mudah terasa gimmick, mengalihkan dari fungsi | 2 |
| B. Editorial / Product Intelligence | Tipografi besar, foto laptop, banyak ruang kosong | Elegan, kredibel, mudah dibuat | Kurang langsung mengajak bertindak | 3 |
| C. Interactive Consultation | "Berapa budget-mu?" langsung di hero | Langsung ke nilai inti, konversi tinggi | Kurang memberi konteks dan kepercayaan bagi pengunjung pertama | 3 |
| D. Hybrid (dipilih) | Headline + CTA di kiri, foto laptop + kartu "Profil Kebutuhan" contoh di kanan, preset budget di bawah CTA | Jelas fungsinya dalam 5 detik, tetap premium, bisa langsung mulai | Perlu disiplin agar tidak ramai | 5 |

**Kenapa bukan 3D.** Penilaian berdasarkan kriteria prompt:

- *Usability dan clarity:* objek 3D tidak menjelaskan apa yang dilakukan aplikasi. Kartu profil kebutuhan langsung menunjukkan output produk.
- *Feasibility:* React Three Fiber menambah ratusan KB JavaScript dan kurva belajar. Fahren bisa mengerjakan Concept D dengan Tailwind murni dalam 1–2 hari.
- *Credibility:* foto produk asli lebih dipercaya untuk keputusan membeli barang jutaan rupiah.
- *Target mahasiswa:* mayoritas membuka dari HP dengan koneksi tidak selalu cepat.

**Riset hero section:**

| Tipe hero | Kelebihan | Kekurangan | Cocok untuk NEXORA? |
| --- | --- | --- | --- |
| 3D laptop | Visual impact tinggi | Sulit dibuat, gimmick, berat | Tidak |
| Foto produk asli | Realistis, dipercaya, premium | Kurang unik bila art direction lemah | Ya, sebagai visual pendukung |
| Interactive ("Berapa budget-mu?") | Langsung ke inti | Kurang dramatis | Ya, sebagai preset budget di bawah CTA |
| Hybrid | Gabungan semua kelebihan | Perlu dijaga agar tidak padat | **Dipilih** |

## 13. Selected Visual Direction

Nama arah visual: **"Clear Spec"** — tenang seperti lembar spesifikasi yang rapi, hangat seperti teman yang paham laptop.

**Brand personality:** cerdas, jujur, praktis, membantu; teknis tapi ramah. Bukan futuristik, bukan main-main.

**Visual personality:** kombinasi *minimal + editorial + consumer-tech*. Latar terang, tipografi tegas, satu warna aksen, dan data yang disajikan seperti tabel uji (terinspirasi RTINGS dan Which?) tetapi dengan bahasa awam.

**Hero concept (yang dilihat pengguna pertama kali, desktop 1440px):**

- **Navbar** tipis: logo NEXORA di kiri; "Cara Kerja", "Jelajahi Laptop" di tengah; tombol "Mulai Rekomendasi" di kanan.
- **Kiri (6 kolom):** label kecil "Sistem pendukung keputusan laptop". Headline 56px: *"Jangan pilih laptop dari speknya. Pilih dari kebutuhanmu."* Subjudul: "Jawab 5 pertanyaan singkat tentang budget, kuliah, dan aplikasi yang kamu pakai. Kami tunjukkan spek yang kamu butuh dan laptop yang cocok, lengkap dengan alasannya." CTA utama "Cari Laptop yang Pas" + tautan sekunder "Lihat cara kerjanya". Di bawahnya chip preset budget ("< Rp6 jt", "Rp6–8 jt", "Rp8–10 jt", "Rp10–15 jt", "Rp15 jt+") yang langsung membuka Wizard dengan budget terisi.
- **Kanan (6 kolom):** foto laptop (tiga perempat, latar abu sangat muda). Di atasnya menempel satu kartu "Profil Kebutuhan" contoh: Budget Rp8 jt · Informatika · RAM 16 GB · SSD 512 GB, dengan badge "94% cocok" dan baris "Kenapa? RAM 16 GB untuk VS Code + Docker". Kartu ini satu-satunya elemen mengambang, dan isinya adalah output produk sebenarnya.
- **Di bawah lipatan:** "Cara kerja" 3 langkah memakai cuplikan UI asli (Wizard → Profil Kebutuhan → Hasil beralasan), lalu 4 persona sebagai pintu masuk cepat, lalu strip kepercayaan ("Kenapa NEXORA bukan toko": tidak menjual, tidak ada iklan, menjelaskan trade-off), lalu CTA penutup.

Pada mobile, foto + kartu pindah ke bawah headline, dan chip preset budget menjadi scroll horizontal.

## 14. Page-by-Page Specification

Setiap halaman MVP dijelaskan dengan 12 poin dari prompt. Ringkasannya ada di tabel ini; detail tiap halaman ada di bagian 15–19.

| Halaman | Tujuan | Primary CTA | Secondary CTA | Loading | Empty / Error | Mobile |
| --- | --- | --- | --- | --- | --- | --- |
| Landing `/` | Pengunjung paham fungsi NEXORA dalam 5 detik dan mulai | Cari Laptop yang Pas | Lihat cara kerjanya | Skeleton foto hero | — (statis) | Satu kolom; preset budget scroll horizontal |
| Wizard `/rekomendasi/*` | Mengumpulkan profil pengguna tanpa terasa seperti formulir | Lanjut | Kembali, Lewati (step 4 dan 5) | — | Validasi inline ("Pilih minimal 1 aktivitas") | Stepper jadi progress bar di atas; tombol menempel di bawah |
| Profil Kebutuhan `/rekomendasi/profil` | Menunjukkan spek minimum + alasan sebelum laptop | Lihat Laptop yang Cocok | Ubah Jawaban | — | Budget terlalu rendah untuk kebutuhan: banner peringatan + saran | Kartu spek ditumpuk vertikal |
| Analisis `/rekomendasi/analisis` | Memberi rasa bahwa sistem bekerja, menghubungkan input dan hasil | — (otomatis) | Batal | Animasi 4 tahap proses | Error: "Gagal membuat rekomendasi" + Coba lagi | Sama |
| Hasil `/rekomendasi/hasil` | Menampilkan Best Match + alternatif berkategori dengan alasan | Lihat Alasan Lengkap | Bandingkan, Simpan | Skeleton kartu | Tidak ada hasil: saran melonggarkan syarat | Kartu vertikal; tray komparasi jadi bar bawah |
| Detail `/laptop/[slug]` | Membuktikan kecocokan laptop dengan profil pengguna | Bandingkan | Simpan, Lihat di toko (link keluar, sekunder) | Skeleton | 404: "Laptop tidak ditemukan" + kembali ke hasil | Tab konten jadi accordion |
| Komparasi `/bandingkan` | Membantu memutuskan antara 2–3 laptop | Pilih Laptop Ini (simpan sebagai keputusan) | Tambah laptop, Hapus | Skeleton tabel | Kurang dari 2 laptop: ajakan memilih dari hasil | Kartu geser horizontal per laptop + baris spek sticky |

Target pengguna semua halaman: keempat persona; Admin hanya di `/admin`.

## 15. Recommendation Wizard UX

Wizard terasa seperti konsultasi: satu pertanyaan besar per layar, jawaban berupa kartu yang bisa diklik, dan ringkasan jawaban di samping yang terus bertambah.

**Kerangka layar (desktop):** stepper 5 titik di atas ("01 Budget … 05 Prioritas"); area pertanyaan 8 kolom di kiri; panel "Profil kamu sejauh ini" 4 kolom di kanan yang terisi setiap langkah selesai; tombol Kembali / Lanjut di bawah. Mobile: panel ringkasan jadi baris chip yang bisa dibuka.

**Urutan langkah.** Prompt menaruh Jurusan sebelum Aktivitas; urutan ini dipertahankan karena jurusan membantu menyaring pilihan aktivitas dan software (misalnya DKV langsung menyorot Figma, Photoshop, Premiere).

1. **Budget — "Berapa budget-mu?"**
   - Slider Rp3 juta–Rp30 juta+ dengan langkah Rp500 ribu, input angka manual, dan 5 chip preset (< Rp6 jt, Rp6–8 jt, Rp8–10 jt, Rp10–15 jt, Rp15 jt+).
   - Umpan balik langsung di bawah slider: "Di kisaran ini biasanya kamu dapat: Ryzen 5 / Core i5, RAM 16 GB, SSD 512 GB" dan "± 23 laptop di katalog" (angka dari mock data).
   - Toggle kecil: "Budget fleksibel ± 10%".
2. **Jurusan — "Kamu kuliah/bekerja di bidang apa?"**
   - Grid kartu ikon (pilih satu): Informatika, Sistem Informasi, Data Science, Desain Grafis/DKV, Arsitektur, Teknik (Sipil/Mesin/Elektro), Bisnis/Manajemen, Akuntansi, Umum/Kantor, Lainnya.
   - Setiap kartu memetakan ke salah satu dari 4 persona Trello; persona ditampilkan kecil di bawah nama ("Persona: Teknik & Informatika").
3. **Aktivitas — "Laptop ini akan dipakai untuk apa?"**
   - Kartu multi-pilih: Programming, UI/UX Design, Desain Grafis, Edit Video, 3D/Blender, Analisis Data, Office & Kuliah Online, Gaming, AI/Machine Learning.
   - Setelah memilih, minta tandai **satu aktivitas utama** (ikon bintang) agar sistem tahu prioritas.
4. **Software — "Aplikasi apa yang sering kamu pakai?"**
   - Kolom pencarian + kartu kecil berlogo teks (VS Code, Android Studio, Docker, Figma, Photoshop, Premiere Pro, Blender, AutoCAD, MATLAB, SPSS, Excel, Zoom). Disarankan sesuai jurusan dan aktivitas di urutan atas.
   - Setiap software menampilkan tag beban: "Ringan", "Sedang", "Berat" (dari mock data) agar pengguna belajar sambil memilih. Langkah ini boleh dilewati.
5. **Prioritas — "Apa yang paling penting buatmu?"**
   - Default: pilih dan urutkan 3 prioritas teratas dengan drag (Performa, Baterai, Ringan dibawa, Layar, Build quality, Storage, RAM, GPU, Harga hemat). Mobile memakai tombol naik/turun, bukan drag.
   - Mode lanjutan (tautan "Atur bobot detail"): slider bobot per kriteria yang jumlahnya selalu 100%, terinspirasi Custom Ratings RTINGS.
   - Checkbox syarat wajib dari kartu Modul 1 Trello: bobot di bawah 1,3 kg, baterai awet, port HDMI, layar akurat warna, RAM bisa di-upgrade. Ditandai sebagai **filter keras**: laptop yang tidak memenuhi tidak akan muncul.

**Aturan interaksi:**

- Jawaban tersimpan di store (Zustand + `sessionStorage`), sehingga refresh dan tombol Kembali tidak menghapus isian.
- Tombol Lanjut aktif hanya bila langkah valid; pesan validasi muncul di bawah pertanyaan, bukan di toast.
- Keyboard: Tab berpindah kartu, Spasi/Enter memilih, panah kiri/kanan menggeser slider.
- Target waktu penyelesaian: di bawah 2 menit (diuji di UAT).

## 16. Requirement Summary — "Profil Laptop Kamu"

Halaman pembeda NEXORA: pengguna melihat spesifikasi yang ia butuhkan, beserta alasannya, sebelum melihat laptop apa pun.

**Bagian atas — Ringkasan profil** (chip yang bisa diklik untuk mengedit langkah terkait): Budget Rp8.000.000 · Informatika · Utama: Programming · Tambahan: UI/UX Design · Prioritas: Performa + Ringan.

**Bagian tengah — Spesifikasi minimum yang disarankan** (6 kartu spek, mock):

| Komponen | Saran minimum | Alasan (ditampilkan di kartu) |
| --- | --- | --- |
| CPU | Ryzen 5 / Core i5 generasi terbaru atau setara | VS Code, Docker, dan emulator Android butuh banyak core saat compile |
| RAM | 16 GB | Browser, IDE, dan Docker berjalan bersamaan; 8 GB akan cepat penuh |
| Storage | SSD 512 GB | Android Studio + SDK + proyek bisa memakan lebih dari 100 GB |
| GPU | Integrated cukup, entry dedicated opsional | Programming dan Figma tidak membutuhkan GPU kuat |
| Layar | IPS Full HD, minimal 14 inci | Nyaman untuk coding berjam-jam; IPS menjaga warna untuk UI/UX |
| Baterai | 50 Wh ke atas | Prioritas "ringan dibawa" berarti sering kerja di kampus tanpa colokan |

Setiap kartu punya tingkat kepentingan: **Wajib**, **Disarankan**, atau **Opsional**, dengan ikon + teks (tidak hanya warna).

**Kondisi khusus:** bila budget tidak cukup untuk spek wajib, tampilkan banner "Budget Rp5 juta agak ketat untuk Docker + Android Studio" dengan dua pilihan: "Naikkan budget ke Rp7 juta" atau "Tetap lanjut dengan kompromi (RAM 8 GB yang bisa di-upgrade)".

**CTA:** "Lihat Laptop yang Cocok" (primary), "Ubah Jawaban" (secondary).

## 17. Recommendation Result

Header: **"Kami menemukan 8 laptop yang cocok dengan kebutuhanmu."** Di bawahnya baris profil ringkas + tombol "Ubah", serta switch persona cepat untuk demo (hasil langsung diurutkan ulang).

**Best Match (kartu besar, lebar penuh):**

- Kiri: foto laptop besar. Kanan: nama (ASUS Vivobook 14 — mock), harga Rp8.299.000 (ukuran teks sekunder, bukan judul), dan **skor kecocokan 94%** dalam bentuk ring.
- Empat sub-skor sebagai baris horizontal berlabel angka, bukan sekadar bar: Performa 94 · Nilai 92 · Portabilitas 88 · Sesuai budget 97.
- "Kenapa cocok" (3 poin teratas) dan "Perlu diketahui" (1 trade-off).
- CTA: "Lihat Alasan Lengkap" (primary), "Bandingkan" dan ikon simpan (secondary).

**Alternatif berkategori (grid 2 kolom desktop):** setiap kartu punya label kategori + satu kalimat alasan, bukan hanya label.

| Kategori | Contoh alasan (mock) |
| --- | --- |
| Performa Terbaik | CPU 8 core paling kencang di budget-mu, cocok bila sering compile proyek besar |
| Nilai Terbaik | Spek setara Best Match, Rp700 ribu lebih murah |
| Baterai Terawet | Baterai 75 Wh, sekitar 12 jam pemakaian ringan |
| Paling Ringan | 1,2 kg, paling nyaman dibawa ke kampus setiap hari |
| Paling Hemat | Memenuhi semua spek wajib di harga terendah |

Di bawahnya: daftar laptop lain yang lolos filter (ringkas, bisa disortir berdasarkan skor, harga, bobot). Filter samping hanya untuk mempersempit (merek, ukuran layar), bukan mengubah profil.

**Tray komparasi:** mengambang di bawah layar saat 1–3 laptop dipilih, berisi thumbnail + tombol "Bandingkan (2)".

## 18. Laptop Comparison

Komparasi 2–3 laptop (MVP; 4 sebagai stretch goal karena di layar 1280px kolom ke-4 menjadi sempit). Kolom pertama selalu "Kebutuhanmu" sebagai pembanding.

| Spesifikasi | Kebutuhanmu | Laptop A | Laptop B | Laptop C |
| --- | --- | --- | --- | --- |
| CPU | Ryzen 5 / i5 | Ryzen 5 7535HS ✓ | Core i5-1335U ✓ | Ryzen 7 7735HS ✓ unggul |
| RAM | 16 GB | 16 GB ✓ | 8 GB ✕ kurang | 16 GB ✓ |
| SSD | 512 GB | 512 GB ✓ | 512 GB ✓ | 1 TB ✓ unggul |
| GPU | Integrated | RTX 2050 | Integrated | RTX 3050 |
| Bobot | < 1,5 kg | 1,4 kg ✓ | 1,6 kg ✕ | 1,8 kg ✕ |
| Harga | ≤ Rp8 jt | Rp8,2 jt ≈ | Rp7,8 jt ✓ | Rp9,5 jt ✕ |
| Kecocokan | — | **94%** | 81% | 89% |

(Semua data contoh/mock.)

- Sel yang memenuhi kebutuhan diberi ✓ dan teks "Memenuhi"; yang tidak diberi ✕ dan "Kurang"; nilai terbaik di baris diberi label "unggul". Warna hijau/merah hanya pendukung.
- Toggle "Tampilkan hanya perbedaan" menyembunyikan baris yang nilainya sama.
- Di atas tabel: kotak **"Paling cocok untukmu: Laptop A"** dengan alasan 2 kalimat ("Satu-satunya yang memenuhi RAM 16 GB dan bobot di bawah 1,5 kg. Laptop C lebih kencang, tapi melewati budget Rp1,5 juta dan lebih berat.").
- Mobile: tidak memaksakan tabel lebar. Header laptop sticky di atas dengan scroll horizontal tersinkron, atau mode kartu per kriteria ("RAM: A 16 GB · B 8 GB · C 16 GB").

## 19. Laptop Detail

Halaman detail terasa dipersonalisasi: setiap bagian dikaitkan dengan profil pengguna.

Urutan konten:

1. **Hero:** galeri foto, nama, harga (sekunder), ring skor kecocokan, tombol Bandingkan dan Simpan. Link ke toko hanya tautan teks sekunder "Cek harga di toko" (sesuai batasan Trello: tidak ada transaksi in-app).
2. **"Berdasarkan kebutuhanmu":** ringkasan 2 kalimat + daftar periksa spek minimum vs laptop ini (✓/✕), pola PCPartPicker.
3. **Kenapa direkomendasikan** + **Trade-off** (lihat bagian 27).
4. **Score breakdown** per kriteria dengan bobot (lihat bagian 27).
5. **Spesifikasi kunci** dalam kartu: Performa, Layar, Baterai, Portabilitas, Upgradeability ("RAM bisa ditambah sampai 32 GB").
6. **Kelebihan dan kekurangan** (masing-masing 3–4 poin).
7. **Cocok untuk / Kurang cocok untuk:** chip aktivitas ("Programming, Office" vs "Edit video 4K, 3D berat").
8. **Spesifikasi lengkap** dalam tabel yang bisa dilipat.
9. **Alternatif serupa:** 3 kartu kecil dari hasil rekomendasi yang sama.

## 20. User Dashboard (Should have)

Dashboard pengguna ringan dan tanpa login di versi frontend: semua disimpan di `localStorage` (mock). Satu halaman `/saya` dengan 4 bagian:

1. **Rekomendasi terakhir:** kartu "ASUS Vivobook 14 · 94% cocok · Budget Rp8 jt · Programming + Design" dengan tombol "Lihat lagi" dan "Ulangi dengan budget lain".
2. **Laptop tersimpan:** grid kartu kecil dengan tombol hapus dan "Bandingkan yang dipilih".
3. **Daftar komparasi:** komparasi yang pernah dibuka, masing-masing bisa dibuka ulang via link.
4. **Riwayat rekomendasi:** daftar sesi (tanggal, budget, jurusan, Best Match).

Empty state: "Belum ada laptop tersimpan. Mulai rekomendasi untuk menemukan laptop yang pas." + CTA.

## 21. Admin Dashboard (Nice to have untuk demo)

Admin cukup untuk menunjukkan ke dosen bahwa data bisa dikelola. Tidak perlu fitur kompleks; semua operasi hanya mengubah state lokal (mock).

- **Ringkasan** (kartu metrik mock): Total laptop 50 · Merek 12 · Sesi rekomendasi 1.284 · Budget terpopuler Rp7–10 jt · Aktivitas terbanyak Programming.
- **Manajemen laptop:** tabel dengan pencarian, filter merek, sort harga; tombol Tambah/Edit membuka drawer form spek (field mengikuti skema data Modul 2 Trello).
- **Kriteria & kategori:** tabel kriteria SAW (nama, tipe Benefit/Cost, bobot default per persona) dan daftar software beserta tingkat bebannya. Ditandai "Hanya tampilan; perhitungan di backend".

Layout admin: sidebar kiri, konten tabel di kanan; gaya visual sama dengan aplikasi utama tetapi lebih padat.

## 22. Design System

Arah: *clean white + satu aksen biru kobalt*, netral abu zinc, tipografi Plus Jakarta Sans. Dipilih dari tiga opsi prompt karena biru membawa kesan dapat dipercaya, kontras tinggi di latar putih, dan tidak bertabrakan dengan warna status hijau/kuning/merah yang dipakai untuk "Memenuhi / Kurang". Dark mode masuk Nice to have.

**Warna (token Tailwind):**

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `bg` | `#FFFFFF` | Latar halaman |
| `surface` | `#F7F7F8` (zinc-50) | Latar section, foto produk |
| `border` | `#E4E4E7` (zinc-200) | Border kartu, pemisah tabel |
| `text` | `#18181B` (zinc-900) | Teks utama |
| `text-muted` | `#52525B` (zinc-600) | Teks sekunder (kontras 7:1 di putih) |
| `primary` | `#1D4ED8` (blue-700) | CTA, link, state terpilih, ring skor |
| `primary-soft` | `#EFF6FF` (blue-50) | Latar kartu terpilih |
| `success` | `#15803D` | Memenuhi, skor Excellent |
| `warning` | `#B45309` | Trade-off, skor Fair |
| `danger` | `#B91C1C` | Kurang/tidak memenuhi, error |

Aturan: maksimal satu warna aksen per layar selain warna status. Tidak ada gradient.

**Tipografi:**

- Heading dan body: **Plus Jakarta Sans** (Google Fonts, dibuat desainer Indonesia, menguatkan identitas lokal). Bobot 400, 500, 600, 700.
- Angka spek dan skor: **JetBrains Mono** 500 agar angka sejajar di tabel (atau `font-variant-numeric: tabular-nums` bila tidak ingin font kedua).

| Style | Ukuran / line-height | Bobot | Pemakaian |
| --- | --- | --- | --- |
| Display | 56 / 64 (mobile 36 / 44) | 700 | Headline hero |
| H1 | 40 / 48 (mobile 30 / 38) | 700 | Judul halaman |
| H2 | 28 / 36 | 600 | Judul section |
| H3 | 20 / 28 | 600 | Judul kartu |
| Body L | 18 / 28 | 400 | Subjudul, pertanyaan wizard |
| Body | 16 / 24 | 400 | Teks umum |
| Small | 14 / 20 | 500 | Label, chip, caption |
| Micro | 12 / 16 | 500 | Badge, keterangan tabel |

**Spacing:** basis 4px; token yang dipakai 4, 8, 12, 16, 24, 32, 48, 64, 96. Jarak antar section desktop 96px, mobile 64px. Grid 12 kolom, max-width 1200px, gutter 24px (tablet 8 kolom, mobile 4 kolom dengan margin 16px).

**Border radius:** tombol dan input 8px; kartu 12px; modal dan drawer 16px; chip/badge 999px (satu-satunya bentuk pill).

**Shadow:** hanya dua level. `shadow-sm` (0 1px 2px rgba(0,0,0,.06)) untuk hover kartu; `shadow-lg` (0 12px 32px rgba(0,0,0,.12)) untuk elemen mengambang: tray komparasi, modal, dropdown. Kartu diam memakai border, bukan shadow.

**Imagery:** foto produk laptop dengan latar transparan di atas `surface`, sudut tiga perempat yang sama untuk semua laptop. Ikon Lucide stroke 1.5px ukuran 20/24px. Tidak ada ilustrasi stok atau maskot.

**Motion:** durasi 150ms (hover), 200ms (perubahan state), 300ms (transisi langkah wizard); easing `ease-out`. Semua animasi dimatikan saat `prefers-reduced-motion`.

## 23. Component Inventory

Komponen dibuat sebagai Figma Component dengan Auto Layout, lalu dipetakan 1:1 ke komponen React di `components/`. Yang ditandai ★ adalah komponen khas NEXORA.

| Komponen | Variants / states (Figma) | Catatan React |
| --- | --- | --- |
| Button | Primary, Secondary, Ghost, Link · Default, Hover, Focus, Disabled, Loading · Size S/M/L | `Button` dengan prop `variant`, `size`, `loading` |
| Navbar | Desktop, Mobile (menu terbuka/tertutup), Transparent di hero | Sticky, latar putih saat scroll |
| Stepper ★ | 5 langkah · Done, Current, Upcoming · Desktop dots, Mobile progress bar | Bisa diklik untuk kembali ke langkah selesai |
| Select Card ★ | Single, Multi · Default, Hover, Selected, Disabled · dengan/tanpa ikon · badge "Utama" | Dipakai di Jurusan, Aktivitas, Software |
| Budget Slider ★ | Default, Dragging, Dengan preset chip, Dengan feedback | Radix Slider + format Rupiah |
| Priority Ranker ★ | Mode urut (drag), Mode bobot (slider 100%) | dnd-kit untuk drag; tombol naik/turun di mobile |
| Input / Search | Default, Focus, Error, Disabled · dengan ikon | Label selalu terlihat |
| Chip / Tag | Filter, Selected, Removable, Status (Memenuhi/Kurang) | — |
| Spec Requirement Card ★ | Wajib, Disarankan, Opsional | Halaman Profil Kebutuhan |
| Laptop Card ★ | Best Match (besar), Default, Compact · Default, Hover, Selected, Compared, Saved | Kategori label opsional |
| Score Ring ★ | Excellent (≥ 90), Good (75–89), Fair (< 75) · Size S/M/L | SVG; angka di tengah + label teks |
| Score Breakdown ★ | Horizontal bars berbobot, Requirement vs laptop | Lihat bagian 27 |
| Reason List ★ | Kenapa cocok (✓), Trade-off (⚠) | Setiap item bisa dibuka detail |
| Comparison Table ★ | 2 atau 3 kolom · Semua baris / Hanya perbedaan · Desktop / Mobile | Header sticky |
| Compare Tray ★ | 1, 2, 3 item · Collapsed / Expanded | Mengambang di bawah layar |
| Tabs / Accordion | Desktop tabs → mobile accordion | Radix Tabs |
| Modal / Drawer | Modal tengah, Drawer kanan (admin), Bottom sheet (mobile) | Radix Dialog |
| Tooltip | Atas/bawah · untuk istilah teknis ("Apa itu Wh?") | Juga bisa diakses dengan keyboard |
| Toast | Success, Error, Info | Untuk aksi simpan/hapus saja |
| Skeleton / Loading | Card, Table row, Text | — |
| Analyzing Steps ★ | 4 tahap · Pending, Active, Done | Layar Analisis |
| Empty / Error State | Ilustrasi ikon + judul + deskripsi + CTA | Satu komponen, isi via props |

## 24. Responsive Design

Desain dibuat **mobile-first** karena mayoritas mahasiswa riset dari HP. Frame Figma: Mobile 375, Tablet 768, Desktop 1440 (konten max 1200). Breakpoint Tailwind: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

| Elemen | Mobile (< 768) | Tablet (768–1023) | Desktop (≥ 1024) |
| --- | --- | --- | --- |
| Navbar | Logo + menu hamburger + CTA ikon | Logo + 2 link + CTA | Lengkap |
| Hero | Satu kolom, foto di bawah headline | Satu kolom, foto lebih besar | Dua kolom 6/6 |
| Wizard | Progress bar atas, ringkasan jadi chip yang bisa dibuka, tombol sticky bawah | Seperti mobile, grid kartu 3 kolom | Stepper titik + panel ringkasan kanan |
| Select Card grid | 2 kolom | 3 kolom | 3–4 kolom |
| Hasil | Kartu vertikal, Best Match foto di atas | Alternatif 2 kolom | Best Match horizontal, alternatif 2 kolom, filter samping |
| Compare Tray | Bar bawah lebar penuh | Bar bawah | Kotak mengambang kanan bawah |
| Komparasi | Header sticky + scroll horizontal tersinkron, atau mode kartu per kriteria | Tabel 3 kolom muat | Tabel penuh |
| Detail | Tabs jadi accordion, CTA sticky bawah | Dua kolom sebagian | Dua kolom: galeri kiri, info kanan |
| Admin | Tidak dioptimalkan (cukup bisa dibuka) | Sidebar tersembunyi | Sidebar + tabel |

Touch target minimal 44 × 44 px di semua ukuran.

## 25. Micro Interactions

Setiap animasi harus menjelaskan sesuatu. Daftar yang dipakai:

| Interaksi | Perilaku | Fungsi |
| --- | --- | --- |
| Ganti langkah wizard | Konten bergeser 16px + fade 300ms; garis stepper mengisi | Menunjukkan kemajuan |
| Pilih kartu | Border dan latar `primary-soft`, ikon centang muncul (150ms) | Status terpilih jelas |
| Geser slider budget | Angka Rupiah dan teks "biasanya kamu dapat…" berubah langsung; jumlah laptop dihitung ulang | Umpan balik real-time |
| Panel ringkasan | Item baru masuk dengan highlight singkat | Pengguna melihat profilnya terbentuk |
| Layar Analisis | 4 tahap dicentang bergantian: "Membaca profilmu" → "Menyaring 50 laptop sesuai budget" → "Menghitung kecocokan per kriteria" → "Menyusun alasan" (total ± 2,5 detik, mock) | Menghubungkan input dengan hasil; bukan spinner kosong |
| Hasil muncul | Ring skor menghitung dari 0 ke 94% (600ms), kartu muncul berurutan | Menarik perhatian ke skor |
| Tambah ke komparasi | Thumbnail "terbang" ke tray, angka tray bertambah | Memberi tahu letak item |
| Hover kartu laptop | Naik 2px + `shadow-sm` | Menandai bisa diklik |
| Toggle "Hanya perbedaan" | Baris yang sama melipat 200ms | Memusatkan perhatian |

Library: Framer Motion (`motion`) hanya untuk transisi wizard, ring skor, dan tray; sisanya cukup transisi CSS Tailwind.

## 26. Loading / Empty / Error States

Setiap state punya judul, penjelasan, dan tindakan alternatif.

| State | Lokasi | Copy | Tindakan |
| --- | --- | --- | --- |
| Loading | Analisis | "Menganalisis kebutuhanmu…" + 4 tahap | Batal |
| Loading | Hasil, Detail, Komparasi | Skeleton sesuai bentuk konten | — |
| No result | Hasil | "Belum ada laptop yang memenuhi semua syaratmu." + daftar syarat yang paling membatasi ("Bobot < 1,3 kg dan GPU dedicated jarang ada di bawah Rp10 jt") | "Longgarkan syarat ini" per item, "Naikkan budget ke Rp11 jt", "Ubah jawaban" |
| Budget terlalu rendah | Profil Kebutuhan | "Budget Rp5 juta agak ketat untuk Docker + Android Studio." | Naikkan budget / Lanjut dengan kompromi |
| Empty | Tersimpan | "Belum ada laptop tersimpan." | Mulai rekomendasi |
| Empty | Komparasi < 2 laptop | "Pilih minimal 2 laptop untuk dibandingkan." | Kembali ke hasil |
| Error | Analisis/Hasil | "Terjadi kesalahan saat membuat rekomendasi. Jawabanmu tetap tersimpan." | Coba lagi, Ubah jawaban |
| Not found | Detail | "Laptop tidak ditemukan atau sudah tidak tersedia." | Kembali ke hasil, Jelajahi laptop |
| Offline | Global | Banner "Koneksi terputus" | Otomatis hilang saat online |

Untuk demo, sediakan query `?mock=error` dan `?mock=empty` agar dosen bisa melihat setiap state tanpa mengubah kode.

## 27. Trust & Explainability

Setiap rekomendasi menjawab "kenapa laptop ini untuk saya?" dalam tiga lapis: ringkasan satu kalimat, alasan dan trade-off, lalu angka di balik skor. Semua angka di bawah adalah mock untuk prototype frontend; perhitungan asli dibuat backend dengan SAW.

**Lapis 1 — Ringkasan:** "**94% cocok.** Sangat sesuai untuk programming dan produktivitas harian."

**Lapis 2 — Kenapa cocok dan trade-off** (setiap poin menyebut sumbernya, pola Perplexity):

- ✓ Sesuai budget Rp8 juta — *harga Rp8,3 jt, masih dalam toleransi ±10%*
- ✓ RAM 16 GB memenuhi kebutuhan multitasking — *dari aktivitas Programming + software Docker*
- ✓ SSD 512 GB cukup untuk proyek dan SDK — *dari software Android Studio*
- ✓ Ringan untuk dibawa ke kampus — *1,4 kg, prioritas "Ringan" kamu*
- ⚠ GPU kurang ideal untuk 3D berat — *tidak masalah untuk profilmu, tapi perlu diperhatikan bila nanti belajar Blender*

**Lapis 3 — Score breakdown.** Visualisasi utama: **bar horizontal berbobot** — panjang bar = skor laptop di kriteria itu, tebal/label = bobot kriteria dari prioritas pengguna. Dengan begitu pengguna melihat kriteria mana yang paling memengaruhi skor total.

| Kriteria | Bobot (dari prioritasmu) | Skor laptop | Kontribusi |
| --- | --- | --- | --- |
| Performa | 35% | 94 | 32,9 |
| Sesuai budget | 25% | 96 | 24,0 |
| RAM | 15% | 100 | 15,0 |
| Storage | 10% | 92 | 9,2 |
| Portabilitas | 10% | 88 | 8,8 |
| Layar | 5% | 90 | 4,5 |
| **Total** | 100% | — | **94,4 ≈ 94%** |

Catatan: total sengaja dihitung konsisten (jumlah bobot × skor) agar mock data tidak membingungkan saat dosen bertanya. Skor total dibulatkan ke bilangan bulat terdekat.

**Alternatif visualisasi yang dipertimbangkan:**

| Visualisasi | Dipakai di | Alasan |
| --- | --- | --- |
| Ring skor | Kartu hasil, Detail | Satu angka yang langsung terbaca |
| Bar berbobot | Detail (breakdown) | Menunjukkan kontribusi tiap kriteria; lebih mudah dibaca daripada radar |
| Requirement vs laptop (✓/✕) | Detail, Komparasi | Pola PCPartPicker: memenuhi atau tidak |
| Radar chart | Tidak dipakai di MVP | Sulit dibaca awam, sulit diakses screen reader; boleh untuk Nice to have di komparasi |

**Prinsip kepercayaan lain:**

- NEXORA tidak menjual: tidak ada label "promo", "diskon", atau countdown. Harga ditampilkan sebagai informasi, bukan judul.
- Setiap halaman hasil dan detail punya tautan "Bagaimana skor dihitung?" yang membuka modal penjelasan metode SAW dalam 4 langkah sederhana. Ini juga berguna untuk presentasi ke dosen.
- Label "Data contoh (demo)" tampil kecil di footer selama memakai mock data.

## 28. Accessibility

Target: WCAG 2.2 level AA.

- **Kontras:** teks utama zinc-900 di putih (sekitar 17:1), teks sekunder zinc-600 (sekitar 7:1), tombol primary putih di blue-700 (sekitar 6,7:1). Semua di atas 4,5:1.
- **Tidak hanya warna:** status selalu ikon + teks (✓ Memenuhi, ✕ Kurang, ⚠ Trade-off).
- **Keyboard:** semua kartu pilihan memakai elemen `button` atau `input` asli; urutan Tab logis; Esc menutup modal; fokus kembali ke pemicu.
- **Focus state:** ring 2px `primary` + offset 2px, tidak pernah dihilangkan.
- **Label:** setiap input punya label terlihat; slider punya `aria-valuetext` dalam Rupiah ("8 juta rupiah").
- **Screen reader:** ring skor punya teks "Kecocokan 94 persen"; perubahan jumlah laptop di slider diumumkan lewat `aria-live="polite"`.
- **Pesan error** spesifik dan di dekat field ("Pilih minimal satu aktivitas").
- **Touch target** minimal 44 × 44 px; jarak antar kartu minimal 8px.
- **Gerak:** hormati `prefers-reduced-motion`.
- **Istilah teknis** punya tooltip yang bisa dibuka dengan keyboard ("Wh = kapasitas baterai").

## 29. Mock Data Structure

Mock data berisi 12 laptop untuk MVP (cukup untuk semua kategori hasil dan state kosong), ditandai `isMock: true`. Merek dan model nyata boleh dipakai agar realistis, tetapi harga dan skor adalah **data contoh, bukan harga aktual**. Field mengikuti skema kartu Modul 2 Trello supaya nanti tinggal disambung ke API Affif.

| Entitas | Field utama | File |
| --- | --- | --- |
| Laptop | `id`, `slug`, `brand`, `model`, `priceIdr`, `cpu {name, cores, threads, benchScore}`, `gpu {type: integrated/dedicated, name, vramGb}`, `ram {gb, type, upgradeable, maxGb}`, `storage {gb, type}`, `display {inch, resolution, panel, srgbPercent, refreshHz}`, `batteryWh`, `weightKg`, `ports[]`, `useCases[]`, `targetPersonas[]`, `pros[]`, `cons[]`, `imageUrl`, `marketplaceUrl` | `data/laptops.ts` |
| Pilihan wizard | `majors[]` (id, label, icon, persona), `activities[]`, `software[]` (id, label, load: ringan/sedang/berat), `priorities[]`, `hardFilters[]` | `data/options.ts` |
| UserProfile | `budget {min, max, flexible}`, `major`, `activities[]`, `primaryActivity`, `software[]`, `priorities[] {criterion, weight}`, `hardFilters[]` | store (Zustand) |
| RequirementProfile | `specs[] {component, minimum, level: wajib/disarankan/opsional, reason}`, `warnings[]` | `data/mock-requirements.ts` |
| RecommendationResult | `laptopId`, `matchScore`, `category` (best-match, best-performance, best-value, best-battery, lightest, cheapest), `subScores {performance, value, portability, budgetFit}`, `breakdown[] {criterion, weight, score}`, `reasons[] {text, source}`, `tradeOffs[]` | `data/mock-results.ts` |
| SavedLaptop / Comparison / History | `laptopId`, `savedAt`; `laptopIds[]`, `createdAt`; `profile`, `bestMatchId`, `createdAt` | `localStorage` |

Contoh satu laptop (mock):

```json
{
  "id": "lp-001",
  "slug": "asus-vivobook-14-m1405",
  "brand": "ASUS",
  "model": "Vivobook 14 (M1405)",
  "priceIdr": 8299000,
  "cpu": { "name": "Ryzen 5 7535HS", "cores": 6, "threads": 12, "benchScore": 78 },
  "gpu": { "type": "integrated", "name": "Radeon 660M", "vramGb": 0 },
  "ram": { "gb": 16, "type": "DDR5", "upgradeable": true, "maxGb": 32 },
  "storage": { "gb": 512, "type": "NVMe SSD" },
  "display": { "inch": 14, "resolution": "1920x1200", "panel": "IPS", "srgbPercent": 100, "refreshHz": 60 },
  "batteryWh": 50,
  "weightKg": 1.4,
  "ports": ["USB-C", "USB-A", "HDMI", "Audio"],
  "useCases": ["programming", "office", "uiux"],
  "targetPersonas": ["teknik", "umum"],
  "pros": ["RAM 16 GB bisa di-upgrade", "Ringan untuk ukurannya"],
  "cons": ["GPU tidak cocok untuk 3D berat"],
  "imageUrl": "/images/laptops/lp-001.webp",
  "marketplaceUrl": "https://example.com",
  "isMock": true
}
```

**Lapisan service.** Komponen tidak pernah membaca file mock langsung. Semua lewat `lib/api.ts` dengan fungsi `getRequirements(profile)`, `getRecommendations(profile)`, `getLaptop(slug)`, `getLaptops(ids)`. Saat ini fungsi mengembalikan mock dengan jeda 600–2500 ms (agar state loading terlihat); nanti isinya diganti `fetch` ke REST API tanpa mengubah komponen. Mock hasil boleh berupa beberapa skenario statis per persona, karena prompt melarang implementasi SAW di frontend.

## 30. Frontend Technical Considerations

Stack sesuai kartu Trello: Next.js (App Router) + React + TypeScript + Tailwind CSS. Tidak ada kode di dokumen ini; berikut keputusan teknis yang memengaruhi desain.

| Kebutuhan | Pilihan | Alasan |
| --- | --- | --- |
| Komponen dasar aksesibel | shadcn/ui (Radix) | Dialog, Tabs, Slider, Tooltip sudah aksesibel; disalin ke repo, bisa dikustom |
| Ikon | lucide-react | Konsisten dan ringan |
| State wizard | Zustand + persist ke `sessionStorage` | Sederhana, jawaban tidak hilang saat refresh |
| Animasi | Framer Motion (`motion`) | Hanya untuk wizard, ring skor, tray |
| Drag prioritas | dnd-kit | Mendukung keyboard |
| Grafik | SVG manual untuk ring dan bar | Recharts belum perlu untuk MVP; pakai bila radar chart masuk Nice to have |
| Font | `next/font` (Plus Jakarta Sans, JetBrains Mono) | Tanpa layout shift |
| Gambar | `next/image`, format WebP | Hero dan kartu tetap cepat di HP |
| 3D | Tidak dipakai | Lihat bagian 12 |

**Struktur folder yang disarankan** (untuk kartu Setup Repositori Fahren):

```text
app/
  page.tsx                 # Landing
  rekomendasi/
    [step]/page.tsx        # budget | jurusan | aktivitas | software | prioritas
    profil/page.tsx
    analisis/page.tsx
    hasil/page.tsx
  laptop/[slug]/page.tsx
  bandingkan/page.tsx
  saya/page.tsx
  admin/...
components/
  ui/                      # shadcn: button, dialog, slider, tabs...
  wizard/                  # Stepper, SelectCard, BudgetSlider, PriorityRanker
  results/                 # LaptopCard, ScoreRing, ScoreBreakdown, ReasonList, CompareTray
  compare/                 # ComparisonTable
data/                      # laptops.ts, options.ts, mock-*.ts
lib/
  api.ts                   # lapisan service (mock -> API)
  format.ts                # formatRupiah, dll.
store/
  profile.ts               # Zustand
types/
  index.ts                 # Laptop, UserProfile, RecommendationResult
```

## 31. MVP Scope

Lebih baik 6 halaman yang matang daripada 15 halaman setengah jadi.

| Prioritas | Isi | Catatan |
| --- | --- | --- |
| **Must have** | Landing → Wizard 5 langkah → Profil Kebutuhan → Analisis → Hasil → Detail → Komparasi (2–3 laptop); semua state loading/empty/error; responsive mobile | Sesuai kartu "MVP Core Deliverables" Trello, plus Profil Kebutuhan sebagai pembeda |
| **Should have** | Simpan laptop, riwayat rekomendasi, dashboard `/saya`, Explore Laptops | `localStorage`, tanpa login |
| **Nice to have** | Admin (tampilan), mode bobot detail, radar chart, dark mode, komparasi 4 laptop | Untuk nilai tambah saat demo |
| **Future** | Harga real-time, integrasi marketplace, pelacak harga, chatbot konsultan (Gemini API, dari kartu Roadmap Trello), analisis sentimen review | Setelah backend dan API siap |

## 32. Future Enhancement

- **Konsultan AI kontekstual**, bukan chatbot tempelan: tombol "Tanya soal laptop ini" di Detail yang menjawab berdasarkan profil dan data spek, dengan sumber.
- **Price History Tracker** dan notifikasi turun harga.
- **Review sentimen komunitas** (Reddit/YouTube) sebagai lapisan bukti tambahan di Detail.
- **Akun pengguna** agar riwayat tersinkron lintas perangkat.
- **Data otomatis** dari sumber spesifikasi resmi agar katalog selalu terbaru.

## 33. UX Risks

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Wizard terasa panjang (5 langkah) | Pengguna berhenti di tengah | Satu pertanyaan per layar, langkah 4–5 bisa dilewati, progress jelas, target < 2 menit |
| Pengguna tidak paham istilah (Wh, sRGB, IPS) | Ragu atau salah pilih | Tooltip awam di setiap istilah; Profil Kebutuhan menjelaskan dengan bahasa sehari-hari |
| Match score dianggap mutlak | Kepercayaan turun bila tidak sesuai harapan | Selalu tampilkan trade-off dan breakdown; modal "Bagaimana skor dihitung?" |
| Mock data tidak konsisten (skor tidak cocok dengan breakdown) | Dosen mempertanyakan logika | Semua mock dihitung konsisten (bobot × skor) dan diverifikasi sebelum demo |
| Terlihat seperti toko online | Tujuan SPK kabur | Harga sebagai info sekunder, link toko hanya teks, tanpa promo |
| Hasil kosong di budget rendah | Frustrasi | State "no result" dengan saran melonggarkan syarat per item |
| Tabel komparasi sulit di HP | Fitur inti tidak terpakai di mobile | Header sticky + scroll tersinkron, atau mode kartu per kriteria |

## 34. Final Design Recommendation

**Design direction: "Clear Spec"** — latar terang, satu aksen biru kobalt, Plus Jakarta Sans, foto produk asli, dan data yang disajikan seperti lembar uji yang mudah dibaca.

**Design principles:**

1. **Kebutuhan dulu, laptop kemudian.** Profil Kebutuhan selalu tampil sebelum daftar laptop.
2. **Setiap angka punya alasan.** Tidak ada skor tanpa penjelasan dan trade-off.
3. **Sedikit tapi tepat.** 1 Best Match + 4 alternatif berkategori, bukan grid panjang.
4. **Memandu, bukan menjual.** Harga dan link toko adalah informasi, bukan fokus.
5. **Sederhana untuk dibangun.** Setiap elemen visual bisa dibuat dengan Tailwind dan SVG oleh satu frontend developer.

**Visual language:** Typography Plus Jakarta Sans 700/600 untuk judul, 400 untuk teks, JetBrains Mono untuk angka. Color putih + zinc + blue-700, status hijau/kuning/merah. Spacing kelipatan 4px, section 96px. Components kartu ber-border, radius 8/12/16. Imagery foto produk sudut seragam, ikon Lucide. Motion singkat dan fungsional, 150–300ms.

**UX principle (dari bingung ke yakin):** Bingung soal laptop → *Wizard* memahami kebutuhan → *Profil Kebutuhan* menunjukkan spek yang cocok → *Hasil* menampilkan pilihan dengan alasan → *Komparasi* menunjukkan trade-off → *Detail* memastikan → keputusan yang yakin.

**Self-review (Design Quality Checklist):**

| Pertanyaan | Jawaban |
| --- | --- |
| Terlihat seperti template AI? | Tidak: tanpa gradient, glow, robot, atau 3D dekoratif |
| Terlalu banyak kartu/rounded? | Kartu hanya untuk objek yang bisa dipilih atau dibandingkan; radius konsisten |
| Pengguna langsung paham fungsinya? | Ya: headline + kartu Profil Kebutuhan contoh di hero |
| Tahu sedang di langkah berapa? | Ya: stepper/progress bar + panel ringkasan |
| Alasan rekomendasi jelas? | Ya: tiga lapis penjelasan, setiap alasan menyebut sumbernya |
| Berbeda dari marketplace? | Ya: tidak ada promo, harga sekunder, tanpa keranjang |
| AI bagian dari pengalaman, bukan tempelan? | Ya: kecerdasan terlihat dari Profil Kebutuhan dan penjelasan, bukan label "AI" |
| Mobile tetap baik? | Ya: mobile-first, komparasi punya mode khusus |

## Rencana kerja frontend (Fahren)

Urutan pengerjaan yang disarankan, mengikuti kartu Trello kamu (tenggat setup 19 Oktober 2026 pukul 09.00 WIB):

- [ ] Setup repo GitHub + Next.js, TypeScript, Tailwind, shadcn/ui; undang Affif, Zakky, Yesa
- [ ] Pasang token desain (warna, font, radius, shadow) di konfigurasi Tailwind
- [ ] Buat struktur folder + `types/index.ts` + `lib/api.ts` (mock)
- [ ] Buat 12 laptop mock + opsi wizard + 4 skenario hasil per persona
- [ ] Komponen dasar: Button, SelectCard, Stepper, BudgetSlider, ScoreRing, LaptopCard
- [ ] Halaman Landing
- [ ] Wizard 5 langkah + store Zustand
- [ ] Profil Kebutuhan + layar Analisis
- [ ] Hasil + Compare Tray
- [ ] Detail + Score Breakdown
- [ ] Komparasi (desktop + mobile)
- [ ] Semua state loading/empty/error + `?mock=` untuk demo
- [ ] Cek aksesibilitas (keyboard, kontras) dan responsive di 375/768/1440
- [ ] Tautkan link GitHub ke kartu Struktur Tim di Trello

Sebelum mulai coding, samakan dulu dengan Yesa: dokumen ini dan mockup Figma-nya harus memakai komponen dan token yang sama.

## Sources

- [Apple – Compare Mac models](https://www.apple.com/ge/mac/compare/)
- [Framework Laptop 13 – halaman produk dan konfigurasi](https://frame.work/products/laptop-diy-13-gen-amd)
- [Framework – The best Framework Laptops at every price point](https://frame.work/blog/the-best-framework-laptops-at-every-price-point)
- [Business Wire – Newegg Deploys Laptop Finder](https://www.businesswire.com/news/home/20220809005270/en)
- [N.N Laptops – AI Laptop Finder](https://nnlaptops.com/find-my-laptop)
- [Outgrow – HP Smart Finder Quiz](https://outgrow.co/blog/?p=60902)
- [RTINGS – Laptop Tools](https://www.rtings.com/laptop/tools)
- [Which? – Laptop reviews](https://www.which.co.uk/reviews/laptops)
- [iTechGuides – How to use PCPartPicker](https://www.itechguides.com/how-to-use-pcpartpicker-to-plan-a-compatible-pc-build)
- [TechTarget – How to use Perplexity AI](https://www.techtarget.com/searchEnterpriseAI/tutorial/How-to-use-Perplexity-AI-Tutorial-pros-and-cons)
- Board Trello "7A NEXORA" (ekspor JSON dari kamu): persona, batasan MVP, skema data, test case
