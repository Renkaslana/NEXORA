import rawCatalog from "@/data/devices-catalog.json";

export interface DeviceRecord {
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
  Platform_Rekomendasi_Beli?: string;
  Status_Garansi_Resmi?: string;
  Rekomendasi_UseCase_Tag?: string;
  Pros_Kelebihan?: string;
  Cons_Kekurangan?: string;
  Link_Gambar?: string;
}

export interface SawWeights {
  c1_cpu_gpu: number;
  c2_ram: number;
  c3_storage: number;
  c4_display: number;
  c5_portability: number;
  c6_price: number;
}

export const PERSONA_WEIGHTS: Record<string, { name: string; weights: SawWeights }> = {
  informatika: {
    name: "Informatika / Ilmu Komputer / SI",
    weights: {
      c1_cpu_gpu: 0.35,
      c2_ram: 0.20,
      c3_storage: 0.15,
      c4_display: 0.05,
      c5_portability: 0.10,
      c6_price: 0.15,
    },
  },
  desain: {
    name: "Desain Komunikasi Visual (DKV) / Arsitektur",
    weights: {
      c1_cpu_gpu: 0.25,
      c2_ram: 0.15,
      c3_storage: 0.10,
      c4_display: 0.30,
      c5_portability: 0.05,
      c6_price: 0.15,
    },
  },
  gaming_teknik: {
    name: "Teknik Mesin / Sipil / Gaming 3D",
    weights: {
      c1_cpu_gpu: 0.40,
      c2_ram: 0.15,
      c3_storage: 0.15,
      c4_display: 0.10,
      c5_portability: 0.05,
      c6_price: 0.15,
    },
  },
  bisnis_data: {
    name: "Bisnis / Akuntansi / Manajemen / Sains Data",
    weights: {
      c1_cpu_gpu: 0.20,
      c2_ram: 0.25,
      c3_storage: 0.15,
      c4_display: 0.10,
      c5_portability: 0.15,
      c6_price: 0.15,
    },
  },
  medis: {
    name: "Kedokteran / Farmasi / Keperawatan",
    weights: {
      c1_cpu_gpu: 0.15,
      c2_ram: 0.15,
      c3_storage: 0.15,
      c4_display: 0.15,
      c5_portability: 0.25,
      c6_price: 0.15,
    },
  },
  umum: {
    name: "Dasar / Pelajar / Non-Teknik / Hukum",
    weights: {
      c1_cpu_gpu: 0.15,
      c2_ram: 0.15,
      c3_storage: 0.15,
      c4_display: 0.10,
      c5_portability: 0.15,
      c6_price: 0.30,
    },
  },
  pc_rakitan: {
    name: "PC Rakitan Hemat / Performa Maksimal",
    weights: {
      c1_cpu_gpu: 0.45,
      c2_ram: 0.20,
      c3_storage: 0.15,
      c4_display: 0.05,
      c5_portability: 0.00,
      c6_price: 0.15,
    },
  },
};

/** Ekstraksi skor mentah benefit dan cost untuk setiap laptop */
function extractRawMetrics(d: DeviceRecord) {
  // C1: CPU & GPU power
  const cpu = (d.Processor_CPU || "").toLowerCase();
  const gpu = (d.Kartu_Grafis_GPU || "").toLowerCase();
  let c1 = 40; // baseline

  if (cpu.includes("i9") || cpu.includes("ryzen 9") || cpu.includes("m3 pro") || cpu.includes("m3 max")) c1 += 35;
  else if (cpu.includes("i7") || cpu.includes("ryzen 7") || cpu.includes("m2") || cpu.includes("m3")) c1 += 28;
  else if (cpu.includes("i5") || cpu.includes("ryzen 5") || cpu.includes("m1")) c1 += 20;
  else if (cpu.includes("i3") || cpu.includes("ryzen 3") || cpu.includes("n100") || cpu.includes("n95")) c1 += 10;

  if (gpu.includes("rtx 4090") || gpu.includes("rtx 4080")) c1 += 25;
  else if (gpu.includes("rtx 4070") || gpu.includes("rtx 4060")) c1 += 20;
  else if (gpu.includes("rtx 4050") || gpu.includes("rtx 3050") || gpu.includes("rtx 2050")) c1 += 15;
  else if (gpu.includes("radeon 680m") || gpu.includes("radeon 780m")) c1 += 12;
  else if (gpu.includes("intel iris xe") || gpu.includes("radeon")) c1 += 8;

  // C2: RAM (GB) + upgradability bonus
  const ramNum = parseFloat(String(d.RAM_GB)) || 8;
  const isUpgradable = (d.Upgradeable_RAM || "").toLowerCase().includes("ya");
  const c2 = ramNum + (isUpgradable ? 2 : 0);

  // C3: Storage
  const storageStr = (d.Storage_GB_Tipe || "").toLowerCase();
  let c3 = 256;
  if (storageStr.includes("2tb")) c3 = 2048;
  else if (storageStr.includes("1tb") || storageStr.includes("1000gb")) c3 = 1024;
  else if (storageStr.includes("512gb") || storageStr.includes("500gb")) c3 = 512;
  else if (storageStr.includes("256gb")) c3 = 256;
  else if (storageStr.includes("128gb")) c3 = 128;

  // C4: Display Quality
  const disp = (d.Layar_Ukuran_Panel_ColorGamut || "").toLowerCase();
  let c4 = 50;
  if (disp.includes("oled") || disp.includes("retina")) c4 += 30;
  else if (disp.includes("ips")) c4 += 20;

  if (disp.includes("100% srgb") || disp.includes("dci-p3")) c4 += 20;
  else if (disp.includes("72% ntsc")) c4 += 15;
  else if (disp.includes("45% ntsc")) c4 += 5;

  // C5: Portability (1 / bobot_kg agar laptop ringan bernilai tinggi)
  const weight = parseFloat(String(d.Bobot_kg)) || 1.6;
  const c5 = weight > 0 ? Number((10 / weight).toFixed(2)) : 5;

  // C6: Price (Cost criteria)
  const price = parseFloat(String(d.Estimasi_Harga_Pasar_IDR)) || 10000000;
  const c6 = price;

  return { c1, c2, c3, c4, c5, c6 };
}

export interface RecommendationQuery {
  budgetMax?: number;
  budgetMin?: number;
  persona?: string;
  major?: string;
  needs?: string[];
  limit?: number;
}

export interface ScoredLaptop {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  display: string;
  weight: string;
  price: number;
  imageUrl?: string;
  scorePercent: number;
  rawScore: number;
  rank: number;
  category: string;
  pros: string;
  cons: string;
  warranty: string;
  buyUrl: string;
}

/**
 * Kalkulasi Sistem Pendukung Keputusan (SPK) SAW murni 100% di server Next.js.
 * Memproses 450 unit laptop real time dengan normalisasi Benefit vs Cost.
 */
export function calculateSawRecommendations(query: RecommendationQuery = {}): ScoredLaptop[] {
  const catalog = (rawCatalog as DeviceRecord[]) || [];
  if (catalog.length === 0) return [];

  const personaKey = query.persona && PERSONA_WEIGHTS[query.persona] ? query.persona : "informatika";
  const { weights } = PERSONA_WEIGHTS[personaKey];

  // Filter awal berdasarkan budget
  const budgetMax = query.budgetMax ? query.budgetMax * 1.15 : 999999999; // toleransi 15%
  const budgetMin = query.budgetMin ? query.budgetMin * 0.85 : 0;

  let candidates = catalog.filter((d) => {
    const p = parseFloat(String(d.Estimasi_Harga_Pasar_IDR)) || 0;
    return p >= budgetMin && p <= budgetMax;
  });

  if (candidates.length < 5) {
    // Jika filter terlalu ketat, buka ke seluruh katalog
    candidates = catalog;
  }

  // Langkah 1: Ekstraksi metrik semua kandidat
  const metricsList = candidates.map((item) => ({
    item,
    metrics: extractRawMetrics(item),
  }));

  // Langkah 2: Tentukan nilai Max dan Min untuk setiap kriteria
  let maxC1 = -Infinity, maxC2 = -Infinity, maxC3 = -Infinity, maxC4 = -Infinity, maxC5 = -Infinity;
  let minC6 = Infinity;

  for (const { metrics } of metricsList) {
    if (metrics.c1 > maxC1) maxC1 = metrics.c1;
    if (metrics.c2 > maxC2) maxC2 = metrics.c2;
    if (metrics.c3 > maxC3) maxC3 = metrics.c3;
    if (metrics.c4 > maxC4) maxC4 = metrics.c4;
    if (metrics.c5 > maxC5) maxC5 = metrics.c5;
    if (metrics.c6 < minC6) minC6 = metrics.c6;
  }

  // Langkah 3 & 4: Normalisasi Matriks & Perkalian Bobot
  const scored = metricsList.map(({ item, metrics }) => {
    // Normalisasi Benefit: r = x / max
    const r1 = maxC1 > 0 ? metrics.c1 / maxC1 : 0;
    const r2 = maxC2 > 0 ? metrics.c2 / maxC2 : 0;
    const r3 = maxC3 > 0 ? metrics.c3 / maxC3 : 0;
    const r4 = maxC4 > 0 ? metrics.c4 / maxC4 : 0;
    const r5 = maxC5 > 0 ? metrics.c5 / maxC5 : 0;

    // Normalisasi Cost: r = min / x
    const r6 = metrics.c6 > 0 ? minC6 / metrics.c6 : 0;

    // Nilai Preferensi SAW: V = sum(w * r)
    const v =
      weights.c1_cpu_gpu * r1 +
      weights.c2_ram * r2 +
      weights.c3_storage * r3 +
      weights.c4_display * r4 +
      weights.c5_portability * r5 +
      weights.c6_price * r6;

    const scorePercent = Math.min(99, Math.max(65, Math.round(v * 100)));

    return {
      id: item.ID_Perangkat,
      name: `${item.Brand} ${item.Model_Seri}`,
      brand: item.Brand,
      model: item.Model_Seri,
      type: item.Tipe_Perangkat,
      cpu: item.Processor_CPU,
      gpu: item.Kartu_Grafis_GPU,
      ram: `${item.RAM_GB} GB ${item.Upgradeable_RAM === "Ya" ? "(Upgradable)" : ""}`,
      storage: item.Storage_GB_Tipe,
      display: item.Layar_Ukuran_Panel_ColorGamut,
      weight: `${item.Bobot_kg} kg`,
      price: parseFloat(String(item.Estimasi_Harga_Pasar_IDR)) || 0,
      imageUrl: item.Link_Gambar || undefined,
      scorePercent,
      rawScore: Number(v.toFixed(4)),
      rank: 0,
      category: item.Kategori_Target,
      pros: item.Pros_Kelebihan || "Performa seimbang di kelasnya",
      cons: item.Cons_Kekurangan || "Ketersediaan stok berkala",
      warranty: item.Status_Garansi_Resmi || "Garansi Resmi 1 Tahun",
      buyUrl: item.Platform_Rekomendasi_Beli || "https://www.tokopedia.com",
    };
  });

  // Urutkan berdasarkan skor tertinggi
  scored.sort((a, b) => b.rawScore - a.rawScore);

  // Berikan ranking
  scored.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  const limit = query.limit || 12;
  return scored.slice(0, limit);
}
