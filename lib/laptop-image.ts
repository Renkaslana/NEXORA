import type { LaptopAngle, LaptopColor, LaptopShape } from "@/types";

// Render ilustrasi laptop (REDESIGN §24, docs/archive/MIDJOURNEY_PROMPTS.md §0). File statis di
// public/images/laptops, latar sudah diratakan ke warna `studio` (#EEF0F4). Manifest ditulis di
// sini supaya tidak perlu cek ke server; tambahkan nama file baru saat render baru masuk.

export type LaptopImage = { shape: LaptopShape; color: LaptopColor };

const AVAILABLE = new Set<string>([
  "ultrabook-silver-34",
  "ultrabook-mist-34",
  "mainstream-silver-34",
  "mainstream-graphite-34",
  "mainstream-navy-34",
  "creator-navy-34",
  "creator-graphite-34",
  "mainstream-silver-front",
  "ultrabook-silver-side",
  "mainstream-silver-side",
  "mainstream-navy-side",
  "ultrabook-silver-ports",
  "mainstream-silver-ports",
  "mainstream-navy-ports",
]);

/** Semua render yang tersedia, urut seperti manifest (untuk halaman QA /dev/components). */
export const RENDER_MANIFEST: readonly string[] = [...AVAILABLE]

/** Ukuran asli semua render (4:3). */
export const RENDER_WIDTH = 2048;
export const RENDER_HEIGHT = 1536;

/**
 * Kotak layar pada render `front`, dalam persen dari lebar/tinggi gambar, untuk menempelkan
 * UI SPECO tepat di layar (REDESIGN §13 gerak 11). Diukur dari file hasil olahan.
 */
export const FRONT_SCREEN_RECT: Partial<Record<string, { left: number; top: number; width: number; height: number }>> = {
  "mainstream-silver-front": { left: 18.6, top: 14.52, width: 62.65, height: 52.73 },
};

const SHAPE_ORDER: LaptopShape[] = ["mainstream", "ultrabook", "creator"];

export const ANGLE_LABEL: Record<LaptopAngle, string> = {
  "34": "Tiga perempat",
  front: "Depan",
  side: "Samping",
  ports: "Port",
};

const SHAPE_LABEL: Record<LaptopShape, string> = {
  ultrabook: "tipis 14 inci",
  mainstream: "14 inci",
  creator: "performa 15,6 inci",
};

const COLOR_LABEL: Record<LaptopColor, string> = {
  silver: "perak",
  mist: "biru keabuan",
  graphite: "grafit",
  navy: "biru tua",
};

function key(shape: LaptopShape, color: LaptopColor, angle: LaptopAngle) {
  return `${shape}-${color}-${angle}`;
}

/**
 * Nama render untuk satu sudut: persis bentuk+warna, atau bentuk lain dengan warna sama.
 * Null bila tidak ada; warna tidak pernah ditukar karena pengguna menilai warna bodi.
 */
export function renderKey(image: LaptopImage, angle: LaptopAngle): string | null {
  const exact = key(image.shape, image.color, angle);
  if (AVAILABLE.has(exact)) return exact;
  for (const shape of SHAPE_ORDER) {
    const candidate = key(shape, image.color, angle);
    if (AVAILABLE.has(candidate)) return candidate;
  }
  return null;
}

export function renderSrc(name: string): string {
  return `/images/laptops/${name}.webp`;
}

/** Sudut yang punya file, untuk galeri Detail (sudut tanpa file disembunyikan). */
export function availableAngles(image: LaptopImage): LaptopAngle[] {
  return (["34", "front", "side", "ports"] as const).filter((angle) => renderKey(image, angle) !== null);
}

export function renderAlt(image: LaptopImage, angle: LaptopAngle = "34"): string {
  const view = angle === "34" ? "" : `, tampak ${ANGLE_LABEL[angle].toLowerCase()}`;
  return `Ilustrasi laptop ${SHAPE_LABEL[image.shape]} warna ${COLOR_LABEL[image.color]}${view}, bukan foto produk asli`;
}

/**
 * Render yang mewakili kelas laptop untuk persona + tier budget (panel Wizard, REDESIGN §17).
 * Hanya ilustrasi suasana; tidak menyiratkan laptop mana yang akan direkomendasikan.
 */
export function representativeRender(persona: string | null, tier: string): LaptopImage {
  if (persona === "desain") return { shape: "creator", color: "navy" };
  if (persona === "umum") return { shape: "ultrabook", color: "silver" };
  if (persona === "profesional") return { shape: "ultrabook", color: "mist" };
  const byTier: Record<string, LaptopImage> = {
    "lt-6": { shape: "mainstream", color: "graphite" },
    "6-8": { shape: "mainstream", color: "silver" },
    "8-10": { shape: "mainstream", color: "navy" },
    "10-15": { shape: "ultrabook", color: "mist" },
    "15-plus": { shape: "creator", color: "graphite" },
  };
  return byTier[tier] ?? byTier["8-10"];
}
