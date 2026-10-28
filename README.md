# SPECO — Spec for You

Sistem pendukung keputusan (SPK) pemilihan laptop untuk mahasiswa Indonesia. Pengguna menjawab **5 pertanyaan**
(budget, jurusan, aktivitas, software, prioritas), melihat **Profil Kebutuhan** (spek minimum + alasannya), lalu
mendapat rekomendasi laptop dengan **skor kecocokan, alasan, dan trade-off**, serta bisa membandingkan 2–3 laptop.

Proyek RPL Kelompok 7A. Nama kode repo: **NEXORA**.

> **Status:** frontend selesai dan berjalan dengan **data contoh (mock)**. Backend (API, database, perhitungan SAW)
> belum ada dan dikerjakan terpisah. Mau melanjutkan backend? Mulai dari **[`docs/BACKEND.md`](docs/BACKEND.md)**.

## Menjalankan

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Buka <http://localhost:3000>.

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi (juga memeriksa TypeScript) |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint |

Variabel lingkungan: salin `.env.example` menjadi `.env.local`. Selama memakai mock, tidak ada yang wajib diisi.

## Halaman

| Rute | Isi | PRD |
| --- | --- | --- |
| `/` | Landing: hero kisaran budget, pratinjau rekomendasi per budget, cara kerja, transparansi skor | §12–13 |
| `/rekomendasi/budget` … `/prioritas` | Wizard 5 langkah; jawaban tersimpan di `sessionStorage` | §15 |
| `/rekomendasi/profil` | Profil Kebutuhan: spek minimum, peringatan budget, kompromi | §16 |
| `/rekomendasi/analisis` | Layar proses 4 tahap, lalu otomatis ke Hasil | §14, §25 |
| `/rekomendasi/hasil` | Best Match + alasan, alternatif (filter & urutan), pilih untuk dibandingkan | §17 |
| `/laptop/[slug]` | Detail: kenapa cocok, kebutuhan vs laptop, rincian skor, spesifikasi, alternatif | §19, §27 |
| `/bandingkan?ids=a,b,c` | Komparasi 2–3 laptop dengan kolom "Kebutuhanmu" | §18 |
| `/dev`, `/dev/components` | Halaman QA: katalog komponen + cek konsistensi skor mock | — |

**Tips demo:** tambahkan `?mock=error` atau `?mock=empty` di Profil, Analisis, Hasil, Detail, atau Komparasi untuk
melihat state error dan "tidak ada hasil" (PRD §26).

## Struktur folder

```text
app/                    Rute (Next.js App Router)
components/
  landing/              Section halaman utama
  wizard/ profile/      Wizard 5 pertanyaan dan Profil Kebutuhan
  results/              Analisis, Hasil, kartu laptop, skor, bar bandingkan
  laptop/               Halaman Detail
  compare/              Halaman Komparasi
  layout/               Navbar, header alur, footer
  ui/                   Komponen dasar (shadcn/ui yang disesuaikan)
data/                   Data mock: 12 laptop, opsi wizard, profil kebutuhan, skenario hasil, glosarium
lib/
  api.ts                ★ Satu-satunya akses ke data. Titik sambung backend
  spec-check.ts         Daftar periksa spek ≥ ambang (bukan SAW)
  compare-rows.ts       Penyusun baris tabel Komparasi
  laptop-image.ts       URL & alt gambar laptop per sudut
  mock-check.ts         Cek konsistensi skor mock
  format.ts motion.ts …  Utilitas kecil
store/                  Zustand: profil (sessionStorage), komparasi, simpanan (localStorage), hasil terakhir
types/index.ts          Tipe domain (kontrak data, PRD §29)
public/                 Logo, render ilustrasi laptop, foto editorial
docs/                   Dokumentasi (lihat di bawah)
```

## Dokumentasi

| Dokumen | Untuk siapa | Isi |
| --- | --- | --- |
| [`docs/PRD.md`](docs/PRD.md) | Semua | Spesifikasi produk & desain (sumber kebenaran) |
| [`docs/BACKEND.md`](docs/BACKEND.md) | Tim backend | Kontrak API, bentuk data, cara menyambung `lib/api.ts` |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Developer frontend | Keputusan desain & teknis per halaman |
| [`docs/diagrams/`](docs/diagrams) | Semua | Activity diagram (draw.io + PNG) |
| [`docs/archive/`](docs/archive) | Arsip | Riwayat proses desain, bukan acuan aktif |
| [`CLAUDE.md`](CLAUDE.md) | Kontributor & AI assistant | Aturan kerja di repo ini |

## Menyambungkan ke backend (ringkas)

Komponen tidak pernah membaca `data/` secara langsung. Ganti isi fungsi async di [`lib/api.ts`](lib/api.ts)
(`getRequirements`, `getRecommendations`, `getLaptop`, `getLaptops`) dengan `fetch` ke REST API, dengan bentuk data
yang sama seperti [`types/index.ts`](types/index.ts). Frontend **tidak** menghitung SAW: skor, bobot, peringkat,
alasan, dan trade-off datang dari backend. Detail lengkap, contoh JSON, dan daftar periksa ada di
[`docs/BACKEND.md`](docs/BACKEND.md).

## Teknologi

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) ·
Phosphor Icons · Zustand · Motion. Font: Plus Jakarta Sans + JetBrains Mono.

## Catatan aset

Gambar laptop di katalog adalah **render ilustrasi AI**, bukan foto produk asli, dan selalu berlabel "Ilustrasi".
Foto suasana di landing, Hasil, dan CTA juga dibuat dengan AI. File mentah tidak di-commit (`img/`). Harga, spek,
dan skor adalah data contoh.
