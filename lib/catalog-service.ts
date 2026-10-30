import rawCatalog from "@/data/devices-catalog.json";
import { supabase } from "@/lib/supabase";

export interface CatalogLaptop {
  ID_Perangkat: string;
  Kategori_Target: string;
  Target_Mahasiswa_Jurusan: string;
  Brand: string;
  Model_Seri: string;
  Tipe_Perangkat: string;
  Processor_CPU: string;
  Kartu_Grafis_GPU: string;
  RAM_GB: string | number;
  Upgradeable_RAM: string;
  Storage_GB_Tipe: string;
  Layar_Ukuran_Panel_ColorGamut: string;
  Bobot_kg: string | number;
  Estimasi_Harga_Pasar_IDR: string | number;
  Platform_Rekomendasi_Beli: string;
  Status_Garansi_Resmi: string;
  Rekomendasi_UseCase_Tag: string;
  Pros_Kelebihan: string;
  Cons_Kekurangan: string;
  Link_Gambar: string;
  // Computed fields
  numericPrice: number;
  numericRam: number;
  numericWeight: number;
  matchScore?: number;
  benchmarkScores?: {
    cpu: number;
    efficiency: number;
    display: number;
  };
}

/** Bentuk satu baris di data/devices-catalog.json, sebelum kolom numerik dihitung. */
export type RawCatalogItem = Omit<
  CatalogLaptop,
  "numericPrice" | "numericRam" | "numericWeight" | "matchScore" | "benchmarkScores"
>;

export const rawCatalogItems = rawCatalog as unknown as RawCatalogItem[];

// Parsing awal 450 laptop dengan data numerik terstandardisasi
export const catalogLaptops: CatalogLaptop[] = rawCatalogItems.map((item) => {
  const numericPrice = parseFloat(String(item.Estimasi_Harga_Pasar_IDR || "0").replace(/[^0-9.]/g, "")) || 0;
  const numericRam = parseInt(String(item.RAM_GB || "8").replace(/[^0-9]/g, ""), 10) || 8;
  const numericWeight = parseFloat(String(item.Bobot_kg || "1.5").replace(/[^0-9.]/g, "")) || 1.5;

  return {
    ...item,
    numericPrice,
    numericRam,
    numericWeight,
  };
});

/**
 * Filter dan Ranking laptop dengan algoritma SAW sesuai docs/ARCHITECTURE.md
 */
export function getRecommendedForSimulator(
  budget: number,
  workloadId: string = "coding",
  campusFilters: {
    ramUpgradeable?: boolean;
    oledOrSrgb?: boolean;
    dedicatedGpu?: boolean;
    warranty2Plus?: boolean;
  } = {},
  brandFilter?: string
): CatalogLaptop[] {
  // 1. Bobot Kriteria SAW berdasarkan Jurusan / Workload
  const weights = getWorkloadWeights(workloadId);

  // 2. Filter Mutlak (Harga <= budget * 1.15)
  const maxBudget = budget * 1.15;
  const minBudget = budget * 0.55;

  let candidates = catalogLaptops.filter((l) => {
    if (l.numericPrice <= 0) return false;
    if (l.numericPrice > maxBudget) return false;
    // Berikan kelonggaran jika budget tinggi
    if (l.numericPrice < minBudget) return false;

    // Filter Brand opsional
    if (brandFilter && brandFilter !== "all") {
      if (l.Brand.toLowerCase() !== brandFilter.toLowerCase()) return false;
    }

    // Filter Tambahan Kebutuhan Kampus
    if (campusFilters.ramUpgradeable && !String(l.Upgradeable_RAM).toLowerCase().includes("ya")) {
      return false;
    }
    if (campusFilters.oledOrSrgb) {
      const displayStr = String(l.Layar_Ukuran_Panel_ColorGamut).toLowerCase();
      if (!displayStr.includes("oled") && !displayStr.includes("srgb") && !displayStr.includes("100%")) {
        return false;
      }
    }
    if (campusFilters.dedicatedGpu) {
      const gpuStr = String(l.Kartu_Grafis_GPU).toLowerCase();
      if (!gpuStr.includes("rtx") && !gpuStr.includes("gtx") && !gpuStr.includes("radeon rx") && !gpuStr.includes("intel arc")) {
        return false;
      }
    }
    if (campusFilters.warranty2Plus) {
      const warStr = String(l.Status_Garansi_Resmi).toLowerCase();
      if (!warStr.includes("2") && !warStr.includes("3")) {
        return false;
      }
    }

    return true;
  });

  // Jika terlalu sedikit karena filter ketat, ambil kandidat terdekat dengan budget
  if (candidates.length < 3) {
    candidates = catalogLaptops
      .filter((l) => l.numericPrice > 0 && Math.abs(l.numericPrice - budget) < budget * 0.5)
      .slice(0, 15);
  }

  if (candidates.length === 0) {
    candidates = catalogLaptops.slice(0, 10);
  }

  // 3. Normalisasi Matriks & SAW Preference Value
  // Hitung min dan max untuk setiap kriteria
  const maxRam = Math.max(...candidates.map((c) => c.numericRam), 16);
  const minPrice = Math.min(...candidates.map((c) => c.numericPrice), 4000000);
  const minWeight = Math.min(...candidates.map((c) => c.numericWeight), 1.0);

  const scored = candidates.map((item) => {
    // Estimasi performa CPU berdasarkan nama prosesor (1-100)
    const cpuBench = estimateCpuScore(item.Processor_CPU);
    const rCpu = cpuBench / 100;

    // Normalisasi RAM (Benefit)
    const rRam = item.numericRam / maxRam;

    // Normalisasi Display (Benefit)
    const isOled = item.Layar_Ukuran_Panel_ColorGamut.toLowerCase().includes("oled");
    const is100srgb = item.Layar_Ukuran_Panel_ColorGamut.toLowerCase().includes("100% srgb");
    const rDisplay = isOled ? 1.0 : is100srgb ? 0.9 : 0.75;

    // Normalisasi Harga (Cost: minPrice / price)
    const rPrice = minPrice / item.numericPrice;

    // Normalisasi Bobot (Cost: minWeight / weight)
    const rWeight = minWeight / Math.max(item.numericWeight, 0.9);

    // Nilai Preferensi Vi = sum(wj * rij)
    const preference =
      weights.cpu * rCpu +
      weights.value * rPrice +
      weights.ram * rRam +
      weights.display * rDisplay +
      weights.portability * rWeight;

    // Match score 75% - 98%
    const matchScore = Math.min(99, Math.max(78, Math.round(preference * 100)));

    const benchmarkScores = {
      cpu: Math.min(98, Math.max(65, Math.round(rCpu * 96))),
      efficiency: Math.min(96, Math.max(70, Math.round(rWeight * 92))),
      display: Math.round(rDisplay * 95),
    };

    return {
      ...item,
      matchScore,
      benchmarkScores,
    };
  });

  // Urutkan dari match score tertinggi
  return scored.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

function getWorkloadWeights(workload: string) {
  switch (workload) {
    case "coding":
      return { cpu: 0.35, value: 0.25, ram: 0.16, display: 0.14, portability: 0.10 };
    case "desain":
      return { cpu: 0.25, value: 0.20, ram: 0.15, display: 0.30, portability: 0.10 };
    case "bisnis":
      return { cpu: 0.20, value: 0.25, ram: 0.25, display: 0.15, portability: 0.15 };
    case "teknik":
      return { cpu: 0.40, value: 0.20, ram: 0.15, display: 0.15, portability: 0.10 };
    case "medis":
      return { cpu: 0.15, value: 0.30, ram: 0.15, display: 0.15, portability: 0.25 };
    default:
      return { cpu: 0.30, value: 0.25, ram: 0.15, display: 0.15, portability: 0.15 };
  }
}

function estimateCpuScore(cpu: string): number {
  const str = (cpu || "").toLowerCase();
  if (str.includes("core ultra 9") || str.includes("ryzen 9") || str.includes("i9")) return 98;
  if (str.includes("core ultra 7") || str.includes("ryzen 7") || str.includes("i7") || str.includes("m3") || str.includes("m2")) return 90;
  if (str.includes("core ultra 5") || str.includes("ryzen 5") || str.includes("i5")) return 82;
  if (str.includes("core i3") || str.includes("ryzen 3")) return 70;
  if (str.includes("n100") || str.includes("n200") || str.includes("celeron")) return 58;
  return 75;
}

/**
 * Pencarian instan untuk modal ⌘K (Command Palette)
 */
export function searchCatalog(query: string, limit: number = 20): CatalogLaptop[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return catalogLaptops.slice(0, limit);
  }

  // Filter teks multi-kolom
  const results = catalogLaptops.filter((item) => {
    return (
      item.Brand.toLowerCase().includes(q) ||
      item.Model_Seri.toLowerCase().includes(q) ||
      item.Processor_CPU.toLowerCase().includes(q) ||
      item.Kartu_Grafis_GPU.toLowerCase().includes(q) ||
      item.Target_Mahasiswa_Jurusan.toLowerCase().includes(q) ||
      item.Rekomendasi_UseCase_Tag.toLowerCase().includes(q)
    );
  });

  return results.slice(0, limit);
}

/**
 * Data showcase untuk 5 tier hero
 */
export const HERO_SHOWCASE_MODELS = [
  {
    tierId: "lt-6",
    id: "LP002",
    brand: "Axioo",
    name: "Hype 5 AMD",
    subtitle: "Raja Budget Mahasiswa",
    price: 4999000,
    cpu: "AMD Ryzen 5 5500U (6C/12T)",
    ram: "8GB DDR4 (Upgradeable)",
    storage: "SSD 256GB NVMe",
    display: "14 inci Full HD IPS",
    battery: "Baterai 45Wh (6 Jam)",
    matchScore: 94,
    matchReason: "Prosesor 6 Core termurah di Indonesia dengan slot RAM yang bisa ditambah sendiri saat semester atas.",
    image: "/images/laptops/premium/hero-lt-6.webp",
    defaultBudget: 5500000,
  },
  {
    tierId: "6-8",
    id: "LP001",
    brand: "Advan",
    name: "Workplus 14",
    subtitle: "Serba Bisa & Layar 16:10",
    price: 6999000,
    cpu: "AMD Ryzen 5 6600H (45W TDP)",
    ram: "16GB LPDDR5 Dual-Channel",
    storage: "SSD 512GB PCIe 4.0",
    display: "14 inci FHD+ IPS 100% sRGB",
    battery: "Baterai 60Wh (8 Jam)",
    matchScore: 96,
    matchReason: "Performa prosesor kelas workstation H-Series di bawah 7 juta dengan layar 100% sRGB untuk desain grafis.",
    image: "/images/laptops/premium/hero-6-8.webp",
    defaultBudget: 7500000,
  },
  {
    tierId: "8-10",
    id: "LP003",
    brand: "Lenovo",
    name: "IdeaPad Slim 3 14ABR8",
    subtitle: "Paling Seimbang & Awet",
    price: 8499000,
    cpu: "AMD Ryzen 7 7730U (8C/16T)",
    ram: "16GB DDR4 3200MHz",
    storage: "SSD 512GB M.2 NVMe",
    display: "14 inci IPS Anti-Glare 300 nits",
    battery: "Baterai 47Wh Rapid Charge",
    matchScore: 95,
    matchReason: "Keyboard Lenovo legendaris nyaman untuk coding maraton dengan efisiensi daya dingin dan garansi resmi 2 tahun.",
    image: "/images/laptops/premium/hero-8-10.webp",
    defaultBudget: 9000000,
  },
  {
    tierId: "10-15",
    id: "LP024",
    brand: "ASUS",
    name: "Zenbook 14 OLED UX3405",
    subtitle: "Layar Mewah & Ultra Portabel",
    price: 14999000,
    cpu: "Intel Core Ultra 5 125H (NPU AI)",
    ram: "16GB LPDDR5X Onboard",
    storage: "SSD 1TB PCIe 4.0",
    display: "14 inci Lumina OLED 2.8K 120Hz",
    battery: "Baterai 75Wh (12 Jam Aktif)",
    matchScore: 97,
    matchReason: "Layar OLED 2.8K 120Hz tertipis dan terakurat di kelasnya, bobot hanya 1.2 kg dengan chip Intel AI NPU.",
    image: "/images/laptops/premium/hero-10-15.webp",
    defaultBudget: 13500000,
  },
  {
    tierId: "15-plus",
    id: "LP088",
    brand: "ASUS",
    name: "ROG Zephyrus G14",
    subtitle: "Kreator 3D & AI Training",
    price: 18999000,
    cpu: "AMD Ryzen 9 8945HS (Ryzen AI)",
    ram: "32GB LPDDR5X 7500MHz",
    storage: "SSD 1TB PCIe Gen4",
    display: "14 inci 3K OLED 120Hz 0.2ms",
    battery: "Baterai 73Wh Power Delivery",
    matchScore: 98,
    matchReason: "GPU NVIDIA RTX 4060 dengan VRAM 8GB untuk rendering Blender, pelatihan PyTorch, dan tugas akhir Teknik.",
    image: "/images/laptops/premium/hero-15-plus.webp",
    defaultBudget: 19000000,
  },
];

/**
 * Fallback gambar laptop berkualitas tinggi jika url eksternal bermasalah
 */
export function getLaptopImage(item: CatalogLaptop): string {
  if (item.Link_Gambar && item.Link_Gambar.startsWith("http")) {
    return item.Link_Gambar;
  }
  const gpu = (item.Kartu_Grafis_GPU || "").toLowerCase();
  const model = (item.Model_Seri || "").toLowerCase();
  if (gpu.includes("rtx") || gpu.includes("gtx") || model.includes("gaming") || model.includes("rog")) {
    return "/images/laptops/creator-graphite-34.webp";
  }
  if (model.includes("zenbook") || model.includes("slim") || model.includes("swift") || model.includes("air")) {
    return "/images/laptops/ultrabook-silver-34.webp";
  }
  return "/images/laptops/mainstream-silver-34.webp";
}
