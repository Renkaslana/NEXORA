import type { RequirementProfile, RequirementWarning, SpecCheck, SpecComponent, SpecRequirement } from "@/types";

// Profil Kebutuhan mock (PRD §16). Statis per persona; persona teknik punya varian
// per tier budget (dipakai preview landing C). Bukan hasil perhitungan.
// Jangan diimpor dari komponen: akses lewat `lib/api.ts`.

const teknikBase: SpecRequirement[] = [
  {
    component: "cpu",
    minimum: "Ryzen 5 / Core i5 generasi terbaru atau setara",
    level: "wajib",
    reason: "VS Code, Docker, dan emulator Android butuh banyak core saat compile",
  },
  {
    component: "ram",
    minimum: "16 GB",
    level: "wajib",
    reason: "Browser, IDE, dan Docker berjalan bersamaan; 8 GB akan cepat penuh",
  },
  {
    component: "storage",
    minimum: "SSD 512 GB",
    level: "wajib",
    reason: "Android Studio + SDK + proyek bisa memakan lebih dari 100 GB",
  },
  {
    component: "gpu",
    minimum: "Integrated cukup, entry dedicated opsional",
    level: "opsional",
    reason: "Programming dan Figma tidak membutuhkan GPU kuat",
  },
  {
    component: "layar",
    minimum: "IPS Full HD, minimal 14 inci",
    level: "disarankan",
    reason: "Nyaman untuk coding berjam-jam; IPS menjaga warna untuk UI/UX",
  },
  {
    component: "baterai",
    minimum: "50 Wh ke atas",
    level: "disarankan",
    reason: "Prioritas \"ringan dibawa\" berarti sering kerja di kampus tanpa colokan",
  },
];

function withSpec(base: SpecRequirement[], changes: Partial<Record<SpecRequirement["component"], Partial<SpecRequirement>>>) {
  return base.map((spec) => ({ ...spec, ...changes[spec.component] }));
}

const desainBase: SpecRequirement[] = [
      {
        component: "cpu",
        minimum: "Core i5 / Ryzen 5 seri H",
        level: "wajib",
        reason: "Export Premiere dan preview Photoshop memakai banyak core",
      },
      {
        component: "ram",
        minimum: "16 GB",
        level: "wajib",
        reason: "Photoshop dengan banyak layer dan Premiere 1080p butuh ruang",
      },
      {
        component: "storage",
        minimum: "SSD 512 GB, 1 TB disarankan",
        level: "disarankan",
        reason: "File video dan aset desain cepat membesar",
      },
      {
        component: "gpu",
        minimum: "RTX 4050 atau setara",
        level: "wajib",
        reason: "Blender dan render Premiere memakai GPU; integrated akan sangat lambat",
      },
      {
        component: "layar",
        minimum: "100% sRGB atau OLED",
        level: "wajib",
        reason: "Warna di layar harus sama dengan hasil cetak dan tampilan klien",
      },
      {
        component: "baterai",
        minimum: "60 Wh ke atas",
        level: "opsional",
        reason: "Render biasanya dilakukan sambil dicolok",
      },
    ];

// Mock tambahan (disetujui Fahren): Desain dengan budget < Rp10 jt. Di katalog mock, GPU dedicated
// termurah ada di kisaran Rp15 jt, jadi saran naik budget mengikuti itu.
const desainBudgetWarning: RequirementWarning = {
  id: "budget-gpu",
  message: "Budget di bawah Rp10 juta agak ketat untuk GPU dedicated.",
  detail: "Laptop dengan RTX 4050 jarang ada di kisaran ini. Layar akurat warna masih bisa didapat.",
  actions: [
    { label: "Naikkan budget ke Rp15 juta", kind: "raise-budget", targetBudget: 15_000_000 },
    { label: "Tetap lanjut dengan kompromi", kind: "compromise" },
  ],
  compromiseNote: "GPU integrated; Figma dan Photoshop tetap lancar, render Blender dan Premiere jauh lebih lama.",
};

const desainLowBudget = (["lt-6", "6-8", "8-10"] as const).map(
  (tier): RequirementProfile => ({
    id: `req-desain-${tier}`,
    persona: "desain",
    budgetTier: tier,
    summary: "Layar akurat masih terjangkau; GPU dedicated perlu kompromi di budget ini.",
    specs: withSpec(desainBase, {
      gpu: {
        minimum: "RTX 4050 atau setara (jarang di budget ini)",
        reason: "Tanpa GPU dedicated, Blender dan render Premiere akan sangat lambat",
      },
    }),
    warnings: [desainBudgetWarning],
    isMock: true,
  })
);

const rawProfiles: RequirementProfile[] = [
  // ---------------------------------------------------------------- Teknik per tier budget
  {
    id: "req-teknik-lt-6",
    persona: "teknik",
    budgetTier: "lt-6",
    summary: "Bisa, dengan kompromi: pilih laptop yang RAM-nya bisa ditambah nanti.",
    specs: withSpec(teknikBase, {
      cpu: {
        minimum: "Ryzen 5 / Core i5 seri U",
        reason: "Cukup untuk VS Code dan web; compile Android akan lebih lambat",
      },
      ram: {
        minimum: "8 GB yang bisa di-upgrade ke 16 GB",
        reason: "Docker + Android Studio butuh 16 GB; mulai dari 8 GB lalu tambah saat ada dana",
      },
      storage: {
        minimum: "SSD 512 GB",
        reason: "Jangan turun ke 256 GB: SDK Android saja bisa 30 GB lebih",
      },
    }),
    warnings: [
      {
        id: "budget-ketat",
        message: "Budget di bawah Rp6 juta agak ketat untuk Docker + Android Studio.",
        detail: "Laptop di kisaran ini umumnya RAM 8 GB. Masih bisa dipakai, asalkan RAM-nya bisa ditambah.",
        actions: [
          { label: "Naikkan budget ke Rp7 juta", kind: "raise-budget", targetBudget: 7_000_000 },
          { label: "Tetap lanjut dengan kompromi", kind: "compromise" },
        ],
        compromiseNote: "RAM 8 GB yang bisa di-upgrade ke 16 GB nanti; compile Android akan lebih lambat.",
        meter: { metric: "ramGb", need: 16, affordable: 8 },
      },
    ],
    isMock: true,
  },
  {
    id: "req-teknik-6-8",
    persona: "teknik",
    budgetTier: "6-8",
    summary: "Spek wajib terpenuhi; layar dan baterai mungkin perlu kompromi.",
    specs: withSpec(teknikBase, {
      cpu: {
        minimum: "Ryzen 5 / Core i5 (generasi 1–2 tahun lalu tidak masalah)",
        reason: "Seri H generasi lalu sering lebih kencang dari seri U terbaru di harga ini",
      },
      layar: {
        minimum: "IPS Full HD 14 inci (45% sRGB masih wajar)",
        level: "opsional",
        reason: "Layar akurat warna jarang ada di kisaran ini; cukup untuk coding",
      },
    }),
    warnings: [],
    isMock: true,
  },
  {
    id: "req-teknik-8-10",
    persona: "teknik",
    budgetTier: "8-10",
    summary: "Kisaran yang pas: semua spek wajib dan disarankan bisa terpenuhi.",
    specs: teknikBase,
    warnings: [],
    isMock: true,
  },
  {
    id: "req-teknik-10-15",
    persona: "teknik",
    budgetTier: "10-15",
    summary: "Ruang untuk naik kelas: CPU lebih kencang dan SSD lebih lega.",
    specs: withSpec(teknikBase, {
      cpu: {
        minimum: "Ryzen 7 / Core i7 / Core Ultra 7",
        level: "disarankan",
        reason: "Compile proyek besar dan banyak container terasa jauh lebih cepat",
      },
      storage: {
        minimum: "SSD 512 GB, 1 TB disarankan",
        reason: "Beberapa emulator dan image Docker cepat menghabiskan 512 GB",
      },
      gpu: {
        minimum: "Integrated cukup; RTX 3050/4050 bila belajar AI",
        reason: "GPU dedicated hanya perlu untuk machine learning atau game",
      },
    }),
    warnings: [],
    isMock: true,
  },
  {
    id: "req-teknik-15-plus",
    persona: "teknik",
    budgetTier: "15-plus",
    summary: "Budget lega: kamu bisa memilih berdasarkan kenyamanan, bukan sekadar cukup.",
    specs: withSpec(teknikBase, {
      cpu: {
        minimum: "Ryzen 7 / Core i7 seri H atau HX",
        level: "disarankan",
        reason: "Build dan test paralel berjalan tanpa menunggu lama",
      },
      ram: {
        minimum: "16 GB, 32 GB disarankan",
        reason: "Menjalankan beberapa VM atau model AI kecil secara lokal",
      },
      storage: {
        minimum: "SSD 1 TB",
        reason: "Dataset, image Docker, dan SDK bisa disimpan tanpa bersih-bersih rutin",
      },
      gpu: {
        minimum: "RTX 4050 ke atas bila belajar AI/ML",
        reason: "CUDA mempercepat training model; tidak perlu bila hanya web/mobile",
      },
    }),
    warnings: [],
    isMock: true,
  },

  // ---------------------------------------------------------------- Persona lain
  ...desainLowBudget,
  {
    id: "req-desain",
    persona: "desain",
    summary: "Layar akurat warna dan GPU dedicated adalah dua hal yang tidak bisa ditawar.",
    specs: desainBase,
    warnings: [],
    isMock: true,
  },
  {
    id: "req-umum",
    persona: "umum",
    summary: "Yang penting ringan, awet baterai, dan nyaman diketik; performa tinggi tidak perlu.",
    specs: [
      {
        component: "cpu",
        minimum: "Core i3 / Ryzen 3 generasi terbaru atau lebih",
        level: "disarankan",
        reason: "Dokumen, browser, dan Zoom tidak butuh CPU kencang",
      },
      {
        component: "ram",
        minimum: "8 GB",
        level: "wajib",
        reason: "Cukup untuk Office, banyak tab browser, dan kuliah online",
      },
      {
        component: "storage",
        minimum: "SSD 256 GB, 512 GB disarankan",
        level: "wajib",
        reason: "SSD membuat laptop menyala dan membuka aplikasi dengan cepat",
      },
      {
        component: "gpu",
        minimum: "Integrated",
        level: "opsional",
        reason: "Tidak ada aplikasi yang membutuhkan GPU dedicated",
      },
      {
        component: "layar",
        minimum: "IPS Full HD 14 inci",
        level: "disarankan",
        reason: "Nyaman dibaca lama untuk jurnal dan materi kuliah",
      },
      {
        component: "baterai",
        minimum: "50 Wh ke atas (± 8 jam)",
        level: "wajib",
        reason: "Kuliah seharian tanpa harus mencari colokan",
      },
    ],
    warnings: [],
    isMock: true,
  },
  {
    id: "req-profesional",
    persona: "profesional",
    summary: "Portabel, port lengkap, dan tampil rapi saat meeting.",
    specs: [
      {
        component: "cpu",
        minimum: "Core i5 / Ryzen 5",
        level: "wajib",
        reason: "Excel besar, banyak tab, dan video call berjalan bersamaan",
      },
      {
        component: "ram",
        minimum: "16 GB",
        level: "disarankan",
        reason: "Teams/Zoom + browser + Office memakan memori lebih dari 8 GB",
      },
      {
        component: "storage",
        minimum: "SSD 512 GB",
        level: "wajib",
        reason: "Arsip dokumen kerja dan aplikasi kantor",
      },
      {
        component: "gpu",
        minimum: "Integrated",
        level: "opsional",
        reason: "Aplikasi kantor tidak butuh GPU dedicated",
      },
      {
        component: "layar",
        minimum: "IPS/OLED Full HD 14 inci",
        level: "disarankan",
        reason: "Presentasi dan dokumen tampil tajam",
      },
      {
        component: "baterai",
        minimum: "60 Wh ke atas",
        level: "wajib",
        reason: "Berpindah ruang meeting tanpa membawa charger",
      },
    ],
    warnings: [],
    isMock: true,
  },
];

// ---------------------------------------------------------------- Ambang daftar periksa (PRD §19)
// Disetujui Fahren: angka batas terstruktur per profil. Frontend hanya membandingkan
// nilai spek laptop dengan angka ini (lib/spec-check.ts); bukan SAW, bukan pemeringkatan.
// cpuBench memakai skala `cpu.benchScore` di data/laptops.ts (0–100).

type Checks = Partial<Record<SpecComponent, SpecCheck>>;

const teknikChecks: Checks = {
  cpu: { metric: "cpuBench", min: 70 },
  ram: { metric: "ramGb", min: 16 },
  storage: { metric: "storageGb", min: 512 },
  layar: { metric: "screenInch", min: 14 },
  baterai: { metric: "batteryWh", min: 50 },
};
const desainChecks: Checks = {
  cpu: { metric: "cpuBench", min: 75 },
  ram: { metric: "ramGb", min: 16 },
  storage: { metric: "storageGb", min: 512 },
  gpu: { metric: "gpuDedicated", min: 1 },
  layar: { metric: "srgbPercent", min: 100 },
  baterai: { metric: "batteryWh", min: 60 },
};

const specChecks: Record<string, Checks> = {
  "req-teknik-lt-6": {
    ...teknikChecks,
    cpu: { metric: "cpuBench", min: 55 },
    ram: { metric: "ramMaxGb", min: 16 },
  },
  "req-teknik-6-8": teknikChecks,
  "req-teknik-8-10": teknikChecks,
  "req-teknik-10-15": { ...teknikChecks, cpu: { metric: "cpuBench", min: 85 } },
  "req-teknik-15-plus": {
    ...teknikChecks,
    cpu: { metric: "cpuBench", min: 88 },
    storage: { metric: "storageGb", min: 1024 },
  },
  "req-desain": desainChecks,
  "req-desain-lt-6": desainChecks,
  "req-desain-6-8": desainChecks,
  "req-desain-8-10": desainChecks,
  "req-umum": {
    cpu: { metric: "cpuBench", min: 45 },
    ram: { metric: "ramGb", min: 8 },
    storage: { metric: "storageGb", min: 256 },
    layar: { metric: "screenInch", min: 14 },
    baterai: { metric: "batteryWh", min: 50 },
  },
  "req-profesional": {
    cpu: { metric: "cpuBench", min: 60 },
    ram: { metric: "ramGb", min: 16 },
    storage: { metric: "storageGb", min: 512 },
    layar: { metric: "screenInch", min: 14 },
    baterai: { metric: "batteryWh", min: 60 },
  },
};

// Karakter laptop yang dicari per profil (disetujui Fahren, R3): 1 rendah, 2 sedang, 3 tinggi.
// Statis per profil, bukan hitungan dari jawaban.
type Character = NonNullable<RequirementProfile["character"]>;
const desainCharacter: Character = { performa: 3, mobilitas: 1 };
const characters: Record<string, Character> = {
  "req-teknik-lt-6": { performa: 2, mobilitas: 2 },
  "req-teknik-6-8": { performa: 2, mobilitas: 2 },
  "req-teknik-8-10": { performa: 3, mobilitas: 2 },
  "req-teknik-10-15": { performa: 3, mobilitas: 2 },
  "req-teknik-15-plus": { performa: 3, mobilitas: 1 },
  "req-desain": desainCharacter,
  "req-desain-lt-6": desainCharacter,
  "req-desain-6-8": desainCharacter,
  "req-desain-8-10": desainCharacter,
  "req-umum": { performa: 1, mobilitas: 3 },
  "req-profesional": { performa: 2, mobilitas: 3 },
};

export const requirementProfiles: RequirementProfile[] = rawProfiles.map((p) => ({
  ...p,
  checks: specChecks[p.id],
  character: characters[p.id],
}));
