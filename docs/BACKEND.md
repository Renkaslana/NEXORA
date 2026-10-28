# Panduan sambung backend SPECO

Dokumen ini untuk tim yang melanjutkan **backend** (API, database, perhitungan SAW). Frontend di repo ini
sudah selesai dan berjalan dengan **data contoh (mock)**. Tugas backend: menyediakan data yang sama bentuknya,
lalu mengganti isi fungsi di [`lib/api.ts`](../lib/api.ts) dengan panggilan ke API.

> Spesifikasi produk lengkap: [`PRD.md`](PRD.md) (model data §29, penjelasan skor §27, state kosong/error §26).
> Tipe data yang menjadi kontrak: [`types/index.ts`](../types/index.ts).

## 1. Prinsip arsitektur

```text
Komponen & halaman  ──►  lib/api.ts  ──►  (sekarang) data/*.ts mock
                                      └─►  (nanti)    REST API backend
```

- **Komponen tidak pernah membaca `data/` langsung.** Semua lewat `lib/api.ts`, jadi menyambung backend cukup
  mengubah satu file. Bentuk data yang dikembalikan **harus tetap sama** dengan tipe di `types/index.ts`.
- **Frontend tidak menghitung SAW.** Skor, bobot, peringkat, kategori, alasan, dan trade-off datang dari backend.
  Frontend hanya melakukan hal tampilan: menyaring merek, mengurutkan, membandingkan spek dengan ambang (≥ min),
  dan memberi label "paling ringan/hemat" lewat nilai maks/min biasa.
- **Tanpa login.** Jawaban pengguna disimpan di browser (lihat §6). Backend menerima profil lengkap di setiap
  permintaan, jadi API bisa stateless.

## 2. Pembagian tanggung jawab

| Dikerjakan backend | Dikerjakan frontend (sudah ada) |
| --- | --- |
| Profil Kebutuhan dari jawaban (spek minimum, alasan, peringatan budget, ambang `checks`) | Wizard 5 pertanyaan + menyimpan jawaban |
| Bobot kriteria dari prioritas (mode `rank`) atau memakai bobot pengguna (mode `weights`) | Menampilkan Profil Kebutuhan, kompromi, glosarium |
| Skor per kriteria 0–100, `matchScore` SAW, urutan, kategori (Best Match, dll.) | Halaman Hasil, Detail, Komparasi, animasi |
| `reasons`, `tradeOffs`, `summary`, `subScores` per laptop | Daftar periksa ✓/✕ dari `checks` (`lib/spec-check.ts`) |
| Katalog laptop (spek, harga, gambar) | Filter merek, urutan, simpan, pilih untuk dibandingkan |

## 3. Fungsi yang perlu disambungkan

Fungsi **async** di `lib/api.ts` adalah titik sambung utama. Endpoint di bawah hanya saran; nama bebas asal bentuk
respons sama.

| Fungsi di `lib/api.ts` | Endpoint yang disarankan | Request | Respons |
| --- | --- | --- | --- |
| `getRequirements(profile)` | `POST /api/requirements` | `UserProfile` | `RequirementProfile` |
| `getRecommendations(profile)` | `POST /api/recommendations` | `UserProfile` | `{ items: RecommendationItem[] }` (lihat §4.2) |
| `getLaptop(slug)` | `GET /api/laptops/:slug` | — | `Laptop`, atau **404** bila tidak ada |
| `getLaptops(ids)` | `GET /api/laptops?ids=lp-001,lp-002` | — | `Laptop[]` (urutan bebas, id tak dikenal diabaikan) |

Fungsi **sinkron** (konfigurasi statis, langsung dipakai saat render) boleh tetap di frontend, atau kelak diambil
sekali dari `GET /api/options` dan `GET /api/laptops`:

| Fungsi | Isi | Catatan |
| --- | --- | --- |
| `getWizardOptions()` | jurusan, aktivitas, software, prioritas, filter wajib, preset budget, label kriteria | Id-nya harus sama dengan yang dipakai backend (§5) |
| `getBudgetInsight()`, `getCatalogPreview()`, `getLaptopSlugs()` | ringkasan katalog | Dipakai slider budget, layar Analisis, dan `generateStaticParams` Detail |
| `getGlossary()`, `getLandingStoryContent()`, `getBudgetPreviewContent()` | teks & angka contoh landing | Boleh tetap mock |
| `getSampleProfile()`, `getMockIntegrityReport()` | khusus halaman QA `/dev` | Tidak perlu disambung |

## 4. Bentuk data penting

### 4.1 `UserProfile` (request)

```json
{
  "budget": { "min": 7000000, "max": 8000000, "flexible": true },
  "major": "informatika",
  "activities": ["programming", "uiux"],
  "primaryActivity": "programming",
  "software": ["vscode", "docker", "android-studio", "figma"],
  "priorityMode": "rank",
  "priorities": [
    { "criterion": "performa", "rank": 1, "weight": null },
    { "criterion": "portabilitas", "rank": 2, "weight": null }
  ],
  "hardFilters": []
}
```

- `budget.max` = nilai slider; `flexible: true` berarti toleransi ±10%.
- `priorityMode: "rank"` → `weight` selalu `null`, **backend yang menentukan bobot**. `"weights"` → pengguna
  mengatur sendiri, Σ `weight` = 100.

### 4.2 Respons rekomendasi

```json
{
  "items": [
    {
      "laptop": { "id": "lp-001", "slug": "asus-vivobook-14-m1405", "brand": "ASUS", "model": "Vivobook 14 (M1405)", "priceIdr": 8299000, "...": "lihat Laptop" },
      "result": {
        "laptopId": "lp-001",
        "matchScore": 94,
        "category": "best-match",
        "summary": "Sangat sesuai untuk programming dan produktivitas harian.",
        "subScores": { "performance": 94, "value": 92, "portability": 88, "budgetFit": 97 },
        "breakdown": [{ "criterion": "performa", "weight": 30, "score": 94 }],
        "reasons": [{ "text": "Sesuai budget Rp8 juta", "source": "Harga Rp8,3 jt, masih dalam toleransi ±10%" }],
        "tradeOffs": [{ "text": "GPU kurang ideal untuk 3D berat", "source": "Perlu diperhatikan bila nanti belajar Blender" }]
      }
    }
  ]
}
```

Aturan yang dipakai UI:

- `items` **sudah terurut**; indeks 0 = **Best Match**. Daftar kosong = tampilan "tidak ada hasil" (PRD §26).
- `matchScore = round(Σ weight × score / 100)` dan Σ `weight` = 100. Halaman Detail menampilkan rumus ini,
  jadi angkanya harus konsisten (cek otomatis untuk data mock: `lib/mock-check.ts`, tampil di `/dev/components`).
- `subScores` (0–100) tampil sebagai 4 bar: Sesuai budget, Performa, Portabilitas, Nilai harga.
- `category` opsional: `best-match`, `best-performance`, `best-value`, `best-battery`, `lightest`, `cheapest`.
- `reasons` sebaiknya 3–4 butir; `source` menjelaskan dari mana klaim itu (jawaban pengguna atau spek).
- Mock saat ini juga mengirim `scenarioId`, `persona`, `personaName`, `title`, `profile`. Halaman pengguna
  **tidak** memakainya (hanya halaman QA `/dev`), jadi boleh dihilangkan dari API.

### 4.3 `RequirementProfile`

Berisi `summary`, `specs[]` (komponen `cpu|ram|storage|gpu|layar|baterai`, teks `minimum`, `level`, `reason`),
`warnings[]` (peringatan budget + aksi `raise-budget|compromise|edit`), dan **`checks`**: ambang terstruktur per
komponen, misalnya `{ "ram": { "metric": "ramGb", "min": 16 } }`. Frontend memakai `checks` untuk daftar periksa
"Kebutuhanmu vs laptop ini": laptop memenuhi bila nilai metriknya ≥ `min`. Komponen tanpa ambang tampil "Tidak dicek".

Metrik yang dikenal: `cpuBench`, `ramGb`, `ramMaxGb`, `storageGb`, `gpuDedicated` (0/1), `srgbPercent`,
`screenInch`, `batteryWh`. `cpu.benchScore` di `Laptop` memakai skala 0–100 yang sama dengan `cpuBench`.

### 4.4 `Laptop`

Lihat tipe lengkap di `types/index.ts`. Catatan:

- **Gambar.** Saat ini `image: { shape, color }` memilih render ilustrasi di `public/images/laptops/`, dan
  `lib/laptop-image.ts` menyusun URL per sudut (`34`, `front`, `side`, `ports`). Untuk foto produk asli, tambahkan
  field misalnya `images: { angle, url }[]`, lalu ubah `lib/laptop-image.ts` dan `components/ui/laptop-render.tsx`
  agar memakai URL itu. Galeri Detail sudah siap untuk 1–4 gambar.
- `pros`, `cons`, dan `useCases` tampil apa adanya di Detail.
- `marketplaceUrl` sudah tersedia di tipe (SPECO bukan toko; belum ditampilkan).

## 5. Id yang harus disepakati

Id berikut dikirim frontend di `UserProfile` dan harus dikenali backend. Daftarnya ada di `data/options.ts`:

- Jurusan (`major`): `informatika`, `sistem-informasi`, `data-science`, `dkv`, `arsitektur`, `teknik`, `bisnis`,
  `akuntansi`, `umum`, `lainnya`.
- Aktivitas (`ActivityId`): `programming`, `uiux`, `desain-grafis`, `video`, `3d`, `data`, `office`, `gaming`, `ai-ml`.
- Kriteria (`CriterionId`): `performa`, `budget`, `ram`, `storage`, `gpu`, `layar`, `baterai`, `portabilitas`, `build`.
- Filter wajib (`HardFilterId`): `bobot-1-3`, `baterai-awet`, `port-hdmi`, `layar-akurat`, `ram-upgrade`.
- Software: lihat `software` di `data/options.ts` (mis. `vscode`, `docker`, `figma`, `blender`).

## 6. Data yang disimpan di browser

| Kunci | Penyimpanan | Isi |
| --- | --- | --- |
| `nexora-profile` | sessionStorage | Jawaban Wizard + kompromi (`store/profile.ts`) |
| `nexora-compare` | sessionStorage | Maks. 3 laptop yang dipilih untuk dibandingkan (`store/compare.ts`) |
| `nexora-saved` | localStorage | Laptop tersimpan + keputusan akhir (`store/saved.ts`) |
| — (memori) | `store/results.ts` | Hasil terakhir agar Hasil tidak memuat ulang setelah Analisis |

Nama kunci memakai nama kode lama (NEXORA) dan sengaja tidak diganti agar data pengguna tidak hilang.

## 7. Contoh mengganti satu fungsi

```ts
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getRecommendations(profile: UserProfile, options?: ApiOptions): Promise<RecommendationSet> {
  if (!API_URL || options?.mock) return mockGetRecommendations(profile, options) // tetap bisa demo ?mock=
  const res = await fetch(`${API_URL}/api/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  })
  if (!res.ok) throw new ApiError()
  return res.json()
}
```

- Lempar `ApiError` saat gagal: UI otomatis menampilkan pesan error + "Coba lagi" (PRD §26).
- `getLaptop` harus mengembalikan `null` untuk 404 agar halaman Detail menampilkan "Laptop tidak ditemukan".
- Pertahankan dukungan `?mock=error` dan `?mock=empty` agar state demo tetap bisa diuji.
- Isi `NEXT_PUBLIC_API_URL` di `.env.local` (contoh di `.env.example`).

## 8. Daftar periksa integrasi

- [ ] Endpoint §3 mengembalikan bentuk data yang sama dengan `types/index.ts`.
- [ ] `matchScore` konsisten dengan `breakdown` (Σ bobot = 100).
- [ ] `items` terurut dan Best Match di indeks 0; daftar kosong untuk "tidak ada hasil".
- [ ] `checks` terisi untuk komponen yang ingin diperiksa ✓/✕.
- [ ] Id jurusan, aktivitas, kriteria, dan filter wajib cocok dengan `data/options.ts`.
- [ ] `npm run build` lolos, alur Landing → Wizard → Profil → Analisis → Hasil → Detail → Komparasi diuji ulang.
