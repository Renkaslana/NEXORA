import type { PersonaId } from "@/types"

// Foto suasana (REDESIGN §24): hanya untuk suasana, tidak pernah disajikan sebagai produk NEXORA,
// pengguna asli, atau testimoni. Semua sudah diberi duotone seragam (biru-950 → kertas) saat ekspor.

export type MoodPhotoId = `persona-${PersonaId}` | "band-desk"

export interface MoodPhotoMeta {
  src: string
  width: number
  height: number
  alt: string
  credit: { title: string; author: string; source: string; url?: string; license: string }
}

const STOCKSNAP = "StockSnap"

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
}
