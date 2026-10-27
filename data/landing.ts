import type { CriterionId, LandingActivity, LandingCase, LandingMeterRef, PersonaId, RequirementProfile, SoftwareLoad } from "@/types";

// Konten landing redesign (REDESIGN §16), disetujui Fahren. Data contoh, bukan testimoni:
// angka laptop diambil dari data/laptops.ts dan ambang dari Profil Kebutuhan mock.
// Jangan diimpor dari komponen: akses lewat `lib/api.ts`.

/** Batas bobot persona Umum, dari kebutuhan "Bobot di bawah 1,4 kg" di data/options.ts. */
const UMUM_MAX_KG = 1.4;

export const landingCases: LandingCase[] = [
  {
    id: "raka-tipis",
    persona: "teknik",
    personaName: "Raka",
    majorLabel: "Informatika",
    laptopId: "lp-009",
    title: "Laptop paling tipis, tapi sesak untuk coding",
    story: "Raka memilih yang paling ringan dan tampak premium. Saat Docker dan Android Studio jalan bersamaan, RAM 8 GB langsung penuh.",
    rows: [
      { kind: "spec", component: "ram" },
      { kind: "spec", component: "cpu" },
    ],
  },
  {
    id: "dinda-gaming",
    persona: "umum",
    personaName: "Dinda",
    majorLabel: "Hukum",
    laptopId: "lp-012",
    title: "Spek paling kencang, salah kebutuhan",
    story: "Dinda hampir membeli laptop gaming karena angkanya paling tinggi. Padahal ia membawanya ke kampus setiap hari.",
    rows: [
      { kind: "spec", component: "cpu" },
      { kind: "weight", maxKg: UMUM_MAX_KG },
    ],
  },
];

/** Tiga kebutuhan khas tiap persona, untuk kartu persona di landing. */
export const personaHighlights: Record<PersonaId, LandingMeterRef[]> = {
  teknik: [
    { kind: "spec", component: "cpu" },
    { kind: "spec", component: "ram" },
    { kind: "spec", component: "storage" },
  ],
  desain: [
    { kind: "spec", component: "layar" },
    { kind: "spec", component: "ram" },
    { kind: "spec", component: "cpu" },
  ],
  umum: [
    { kind: "weight", maxKg: UMUM_MAX_KG },
    { kind: "spec", component: "baterai" },
    { kind: "spec", component: "ram" },
  ],
  profesional: [
    { kind: "spec", component: "baterai" },
    { kind: "spec", component: "ram" },
    { kind: "spec", component: "cpu" },
  ],
};

/**
 * Interaksi landing "Laptop buat ___" (redesign "Kalimat terbelah", Okt 2026). Kebutuhan minimum
 * kasar per beban software, memakai skala yang sama dengan ambang Profil Kebutuhan mock
 * (cpuBench 0–100, RAM/SSD dalam GB). Angka contoh untuk demo, bukan perhitungan SAW.
 */
export const softwareLoadNeeds: Record<SoftwareLoad, { cpuBench: number; ramGb: number; storageGb: number }> = {
  ringan: { cpuBench: 40, ramGb: 8, storageGb: 256 },
  sedang: { cpuBench: 55, ramGb: 16, storageGb: 512 },
  berat: { cpuBench: 70, ramGb: 16, storageGb: 512 },
};

/** Tambahan CPU bila dua software berat dipakai bersamaan (mis. Docker + Android Studio). */
export const heavyComboCpuBonus = 10;

/** Software yang butuh GPU terpisah. */
export const gpuSoftware = ["blender", "premiere"];

/** Pilihan awal kalimat "Laptop buat ___". */
export const softwareSentenceDefault = ["docker", "figma"];

// ---------------------------------------------------------------- Redesign landing "Editorial Tech" (Okt 2026)

/** Budget tetap untuk demo "Budget sama, kebutuhan berbeda". */
export const demoBudget = 8_000_000;

/** Aktivitas demo, dipetakan ke Profil Kebutuhan persona yang sudah ada (disetujui Fahren). */
export const landingActivities: LandingActivity[] = [
  {
    id: "kuliah",
    label: "Kuliah",
    persona: "umum",
    factors: ["Bobot ringan untuk dibawa tiap hari", "Baterai tahan seharian", "RAM 8 GB cukup untuk dokumen & browser"],
  },
  {
    id: "coding",
    label: "Coding",
    persona: "teknik",
    factors: ["CPU multi-core untuk compile", "RAM 16 GB untuk IDE + Docker", "SSD 512 GB untuk proyek & emulator"],
  },
  {
    id: "desain",
    label: "Desain",
    persona: "desain",
    factors: ["Layar akurat 100% sRGB", "GPU terpisah untuk render", "RAM 16 GB untuk file besar"],
  },
  {
    id: "gaming",
    label: "Gaming",
    factors: ["GPU terpisah untuk game modern", "CPU kencang agar frame stabil", "RAM 16 GB dan SSD 512 GB"],
  },
  {
    id: "kerja",
    label: "Kerja",
    persona: "profesional",
    factors: ["Baterai untuk rapat seharian", "RAM 16 GB untuk banyak aplikasi", "Bodi kokoh untuk dibawa"],
  },
];

/**
 * Mock kebutuhan gaming (disetujui Fahren, Okt 2026). Skala sama dengan ambang Profil Kebutuhan lain
 * (cpuBench 0–100). Di katalog mock, laptop dengan GPU terpisah mulai Rp15 jt, jadi di Rp8 jt tidak
 * ada yang lolos: itu memang pesannya.
 */
export const gamingRequirement: RequirementProfile = {
  id: "req-gaming",
  persona: "teknik",
  summary: "Game modern butuh GPU terpisah, CPU kencang, dan RAM 16 GB.",
  specs: [
    { component: "gpu", minimum: "GPU terpisah (RTX 3050 ke atas)", level: "wajib", reason: "Game 3D modern berat di GPU terintegrasi." },
    { component: "cpu", minimum: "Ryzen 5 / Core i5 seri H", level: "wajib", reason: "Menjaga frame tetap stabil." },
    { component: "ram", minimum: "16 GB", level: "wajib", reason: "Game dan aplikasi latar berjalan bersamaan." },
    { component: "storage", minimum: "SSD 512 GB", level: "wajib", reason: "Satu game modern bisa 60–100 GB." },
  ],
  warnings: [],
  checks: {
    cpu: { metric: "cpuBench", min: 75 },
    ram: { metric: "ramGb", min: 16 },
    storage: { metric: "storageGb", min: 512 },
    gpu: { metric: "gpuDedicated", min: 1 },
  },
  isMock: true,
};

/** Catatan bila tidak ada laptop yang lolos di budget demo. */
export const gamingNote =
  "Di Rp8 jt, game berat perlu kompromi: main di setting rendah dengan GPU terintegrasi, atau naikkan budget. Laptop dengan GPU terpisah di katalog contoh mulai Rp15 jt.";

/** Penjelasan singkat tiap kriteria penilaian, untuk tooltip section transparansi. */
export const criterionHints: Record<CriterionId, string> = {
  performa: "Seberapa baik laptop menangani kebutuhan performa dari aktivitas dan aplikasimu.",
  budget: "Seberapa dekat harga laptop dengan budget-mu, termasuk toleransi bila kamu fleksibel.",
  ram: "Apakah RAM cukup untuk aplikasi yang kamu pakai bersamaan, dan bisa ditambah atau tidak.",
  storage: "Kapasitas SSD untuk file, proyek, dan aplikasi yang kamu pasang.",
  gpu: "Kemampuan grafis untuk render, editing, atau game.",
  layar: "Ukuran, ketajaman, dan akurasi warna layar.",
  baterai: "Berapa lama laptop bertahan tanpa colokan.",
  portabilitas: "Bobot dan ukuran, penting kalau laptop dibawa setiap hari.",
  build: "Kekokohan bodi dan engsel.",
};
