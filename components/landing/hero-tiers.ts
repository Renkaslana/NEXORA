import type { BudgetPresetId } from "@/types"

// Visual hero "kartu budget yang membuka" (disetujui Fahren, Okt 2026): satu render premium per kisaran
// budget, kertas berwarna + cahaya keras. Dibuat dengan Gemini 3.1 Flash Image lewat Figma, diproses ke
// WebP di public/images/laptops/premium/. `paper` = warna kertas di sisi kiri render (diambil dari
// gambarnya), dipakai sebagai latar section agar foto menyatu. `tone` menentukan warna teks: tinta gelap
// lolos AA di kertas terang (4,7–7,4:1), putih di kobalt (10,6:1).

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
    src: "/images/laptops/premium/tier-lt-6.webp",
    alt: `Ilustrasi laptop 14 inci grafit di atas kertas hijau sage, ${ALT_SUFFIX}`,
    paper: "#99a790",
    tone: "light",
  },
  "6-8": {
    kind: "Serba bisa",
    src: "/images/laptops/premium/tier-6-8.webp",
    alt: `Ilustrasi laptop 14 inci silver di atas kertas abu batu, ${ALT_SUFFIX}`,
    paper: "#928c84",
    tone: "light",
  },
  "8-10": {
    kind: "Paling seimbang",
    src: "/images/laptops/premium/tier-8-10.webp",
    alt: `Ilustrasi laptop 14 inci navy di atas kertas warna pasir, ${ALT_SUFFIX}`,
    paper: "#ad8453",
    tone: "light",
  },
  "10-15": {
    kind: "Tipis & layar OLED",
    src: "/images/laptops/premium/tier-10-15.webp",
    alt: `Ilustrasi ultrabook tipis biru keabuan di atas kertas terakota, ${ALT_SUFFIX}`,
    paper: "#ad6f54",
    tone: "light",
  },
  "15-plus": {
    kind: "Kreator & GPU",
    src: "/images/laptops/premium/tier-15-plus.webp",
    alt: `Ilustrasi laptop kreator 16 inci grafit di atas kertas biru kobalt, ${ALT_SUFFIX}`,
    paper: "#014074",
    tone: "dark",
  },
}
