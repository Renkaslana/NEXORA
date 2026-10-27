import type { PersonaId } from "@/types"

// Foto suasana (REDESIGN §24): hanya untuk suasana, tidak pernah disajikan sebagai produk SPECO,
// pengguna asli, atau testimoni. Foto lama (persona-*, band-desk) ber-duotone; foto "scene-*" berwarna asli,
// dibuat dengan Gemini 3.1 Flash Image lewat Figma (redesign "Kalimat terbelah", Okt 2026).

export type SceneId = "mall" | "kos" | "studio-dkv" | "krl" | "spec-card" | "kopi"
export type MoodPhotoId = `persona-${PersonaId}` | "band-desk" | `scene-${SceneId}`

export interface MoodPhotoMeta {
  src: string
  width: number
  height: number
  alt: string
  credit: { title: string; author: string; source: string; url?: string; license: string }
}

const STOCKSNAP = "StockSnap"
const SCENE_CREDIT = { author: "CariSpek (Gemini via Figma)", source: "Ilustrasi AI", license: "Milik proyek" }

const scene = (id: SceneId, title: string, alt: string): MoodPhotoMeta => ({
  src: `/images/mood/scene-${id}.webp`,
  width: 1200,
  height: 896,
  alt,
  credit: { title, ...SCENE_CREDIT },
})

export const MOOD_PHOTOS: Record<MoodPhotoId, MoodPhotoMeta> = {
  "persona-teknik": {
    src: "/images/mood/persona-teknik.webp",
    width: 960,
    height: 720,
    alt: "Tangan mengetik di laptop di samping gambar denah teknik",
    credit: { title: "Office Work", author: "energepic.com", source: STOCKSNAP, url: "https://stocksnap.io/photo/office-work-42H3JH8QI5", license: "CC0" },
  },
  "persona-umum": {
    src: "/images/mood/persona-umum.webp",
    width: 853,
    height: 640,
    alt: "Meja putih dari atas: laptop, buku catatan, dan ponsel",
    credit: { title: "Man Work", author: "Burst", source: STOCKSNAP, url: "https://stocksnap.io/photo/man-work-DZ7DC58DSV", license: "CC0" },
  },
  "persona-desain": {
    src: "/images/mood/persona-desain.webp",
    width: 1600,
    height: 1200,
    alt: "Meja desain dengan laptop, palet cat air, sketsa motif, dan tablet gambar",
    credit: { title: "Meja desain", author: "Fahren (Gemini)", source: "Ilustrasi AI", license: "Milik proyek" },
  },
  "persona-profesional": {
    src: "/images/mood/persona-profesional.webp",
    width: 1600,
    height: 1200,
    alt: "Meja kerja dengan laptop berisi grafik, laporan cetak, kopi, dan kartu nama",
    credit: { title: "Meja profesional", author: "Fahren (Gemini)", source: "Ilustrasi AI", license: "Milik proyek" },
  },
  "band-desk": {
    src: "/images/mood/band-desk.webp",
    width: 850,
    height: 638,
    alt: "Meja kayu gelap dengan laptop, kopi, dan kacamata",
    credit: { title: "Macbook Laptop", author: "Lia Leslie", source: STOCKSNAP, url: "https://stocksnap.io/photo/macbook-laptop-DWLWL9USBG", license: "CC0" },
  },
  "scene-mall": scene(
    "mall",
    "Lorong mal komputer",
    "Ilustrasi: mahasiswa membandingkan laptop di etalase mal komputer, kartu spek tulisan tangan di setiap laptop"
  ),
  "scene-kos": scene("kos", "Kamar kos", "Ilustrasi: mahasiswa informatika menulis kode di laptop di kamar kos pada malam hari"),
  "scene-studio-dkv": scene(
    "studio-dkv",
    "Studio DKV",
    "Ilustrasi: mahasiswi DKV menyunting poster di laptop dengan tablet gambar di studio kampus"
  ),
  "scene-krl": scene("krl", "Kereta komuter", "Ilustrasi: mahasiswi hukum berdiri di KRL sambil memeluk laptop tipis"),
  "scene-spec-card": scene(
    "spec-card",
    "Kartu spek etalase",
    "Ilustrasi: tangan memegang kartu spek dan harga tulisan tangan di depan etalase laptop"
  ),
  "scene-kopi": scene("kopi", "Kedai kopi", "Ilustrasi: pekerja muda mengerjakan spreadsheet di laptop di kedai kopi"),
}
