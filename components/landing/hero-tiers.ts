import type { BudgetPresetId } from "@/types"

// Visual hero kisaran budget (Okt 2026). Foto meja kerja bercahaya alami dari Fahren (mentah di
// img-laptopherosection/, di-ignore), diperbesar 1,5x (Lanczos + penajaman halus) ke WebP kualitas 90 di
// public/images/laptops/premium/. Laptop selalu di kanan; sisi kiri diberi scrim gelap di desktop agar teks
// putih lolos AA (diukur: 90% area teks ≥ 4,9:1). `paper` = warna rata-rata foto yang digelapkan, dipakai
// sebagai latar teks di mobile (teks di atas bidang solid, bukan di atas foto).

export interface HeroTier {
  /** Nama kelas laptop di kartu, mis. "Tipis & layar OLED". */
  kind: string
  src: string
  alt: string
  paper: string
  tone: "light" | "dark"
}

const ALT_SUFFIX = "bukan foto produk asli"

export const HERO_TIERS: Record<BudgetPresetId, HeroTier> = {
  "lt-6": {
    kind: "Hemat & cukup",
    src: "/images/laptops/premium/hero-lt-6.webp",
    alt: `Ilustrasi laptop abu-abu di meja kerja yang terkena cahaya matahari, ${ALT_SUFFIX}`,
    paper: "#21201c",
    tone: "dark",
  },
  "6-8": {
    kind: "Serba bisa",
    src: "/images/laptops/premium/hero-6-8.webp",
    alt: `Ilustrasi laptop silver di meja kerja dekat jendela, ${ALT_SUFFIX}`,
    paper: "#201e1c",
    tone: "dark",
  },
  "8-10": {
    kind: "Paling seimbang",
    src: "/images/laptops/premium/hero-8-10.webp",
    alt: `Ilustrasi laptop silver di meja belajar minimalis yang terang, ${ALT_SUFFIX}`,
    paper: "#2c2c26",
    tone: "dark",
  },
  "10-15": {
    kind: "Tipis & layar OLED",
    src: "/images/laptops/premium/hero-10-15.webp",
    alt: `Ilustrasi laptop tipis berlayar cerah di meja saat matahari terbenam, ${ALT_SUFFIX}`,
    paper: "#251c14",
    tone: "dark",
  },
  "15-plus": {
    kind: "Kreator & GPU",
    src: "/images/laptops/premium/hero-15-plus.webp",
    alt: `Ilustrasi laptop grafit di meja kerja dengan rak buku dan tanaman, ${ALT_SUFFIX}`,
    paper: "#2a2825",
    tone: "dark",
  },
}
