# NEXORA — Laptop Decision Assistant

Sistem pendukung keputusan (SPK) pemilihan laptop untuk mahasiswa Indonesia. Pengguna menjawab
5 pertanyaan (budget, jurusan, aktivitas, software, prioritas), melihat **Profil Kebutuhan**
(spek minimum + alasannya), lalu rekomendasi laptop dengan skor kecocokan, alasan, trade-off,
dan komparasi.

Proyek RPL Kelompok 7A. Repo ini berisi **frontend saja** dengan **data contoh (mock)**.
Backend, API, database, dan perhitungan SAW dikerjakan terpisah; frontend tinggal disambungkan
lewat `lib/api.ts`.

> Spesifikasi lengkap: [`docs/PRD.md`](docs/PRD.md). Aturan kerja untuk kontributor dan AI
> assistant: [`CLAUDE.md`](CLAUDE.md).

## Menjalankan

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Buka <http://localhost:3000>. Perintah lain:

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi (juga memeriksa TypeScript) |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint |

## Halaman

| Rute | Isi | PRD |
| --- | --- | --- |
| `/` | Landing: preview Profil Kebutuhan per budget, cara kerja, persona, CTA | §12–13 |
| `/rekomendasi/budget` … `/prioritas` | Wizard 5 langkah, jawaban tersimpan di `sessionStorage` | §15 |
| `/rekomendasi/profil` | Profil Kebutuhan: 6 spek minimum, peringatan budget, kompromi | §16 |
| `/rekomendasi/analisis` | Layar proses 4 tahap, lalu otomatis ke Hasil | §14, §25 |
| `/rekomendasi/hasil` | Best Match, alternatif berkategori, filter, switch persona, Compare Tray | §17 |
| `/laptop/[slug]` | Detail: daftar periksa spek, alasan, score breakdown, spesifikasi | §19, §27 |
| `/bandingkan?ids=a,b,c` | Komparasi 2–3 laptop dengan kolom "Kebutuhanmu" | §18 |
| `/dev`, `/dev/components` | Halaman QA: semua komponen, cek konsistensi skor mock, arsip varian landing | — |

### Tips demo

- Tambahkan `?mock=error` atau `?mock=empty` di Profil, Analisis, Hasil, Detail, atau Komparasi
  untuk melihat state error dan "tidak ada hasil" (PRD §26).
- Di halaman Hasil, gunakan **"Lihat contoh persona"** untuk menukar hasil ke persona lain
  (Raka, Salsa, Dinda, Bima) tanpa mengubah jawaban.
- Dari landing, chip budget dan tombol "Mulai seperti …" mengisi Wizard lewat `?budget=` dan
  `?jurusan=`.
- `/dev/components` menampilkan verifikasi bahwa setiap skor mock = round(Σ bobot × skor / 100).

## Teknologi

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) ·
lucide-react · Zustand · Motion (Framer Motion). Font: Plus Jakarta Sans + JetBrains Mono.

## Struktur

```text
app/                 Rute (App Router)
components/
  ui/                shadcn/ui yang disesuaikan ke token PRD (button, dialog, tabs, ...)
  landing/ wizard/ profile/ results/ laptop/ compare/ layout/
data/                Mock: 12 laptop, opsi wizard, profil kebutuhan, 4 skenario hasil, glosarium
lib/                 api.ts (satu-satunya akses ke data), format, spec-check, compare-rows, ...
store/               Zustand: profil (sessionStorage), komparasi, simpanan (localStorage), hasil
types/               Tipe domain sesuai PRD §29
docs/PRD.md          Spesifikasi produk dan desain
```

## Menyambungkan ke backend

Komponen tidak pernah membaca `data/` secara langsung. Ganti isi fungsi async di
[`lib/api.ts`](lib/api.ts) (`getRequirements`, `getRecommendations`, `getLaptop`, `getLaptops`)
dengan `fetch` ke REST API, dengan bentuk data yang sama seperti `types/index.ts`.

## Catatan

- Semua harga, spek, dan skor adalah **data contoh**, bukan data aktual. Foto laptop masih placeholder.
- Halaman Should have (`/jelajah`, `/saya`) dan Nice to have (`/admin`, dark mode) belum dibuat.
