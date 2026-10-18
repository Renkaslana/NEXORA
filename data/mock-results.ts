import type { BreakdownItem, CriterionId, Scenario } from "@/types";

// 4 skenario hasil statis, satu per persona (PRD §29). Frontend TIDAK menghitung SAW:
// semua skor ditulis tangan. Aturan konsistensi (PRD §27, §33):
//   matchScore = round(Σ weight × score / 100), Σ weight = 100
// Diverifikasi oleh `lib/mock-check.ts` dan ditampilkan di /dev/components.
// Jangan diimpor dari komponen: akses lewat `lib/api.ts`.

type Weights = [CriterionId, number][];

/** Menyusun breakdown dari daftar bobot + skor dengan urutan yang sama. */
function bd(weights: Weights, scores: number[]): BreakdownItem[] {
  return weights.map(([criterion, weight], i) => ({ criterion, weight, score: scores[i] }));
}

const toPriorities = (weights: Weights) =>
  weights.map(([criterion, weight], i) => ({ criterion, rank: i + 1, weight }));

// ---------------------------------------------------------------- Raka · Teknik
// Bobot persis contoh PRD §27.
const W_RAKA: Weights = [
  ["performa", 35],
  ["budget", 25],
  ["ram", 15],
  ["storage", 10],
  ["portabilitas", 10],
  ["layar", 5],
];

const raka: Scenario = {
  id: "sc-teknik",
  persona: "teknik",
  personaName: "Raka",
  title: "Raka · Informatika · Rp8 jt",
  profile: {
    budget: { min: 7_000_000, max: 8_000_000, flexible: true },
    major: "informatika",
    activities: ["programming", "uiux"],
    primaryActivity: "programming",
    software: ["vscode", "docker", "android-studio", "figma"],
    priorityMode: "weights",
    priorities: toPriorities(W_RAKA),
    hardFilters: [],
  },
  results: [
    {
      laptopId: "lp-001",
      matchScore: 94, // 94,4
      category: "best-match",
      summary: "Sangat sesuai untuk programming dan produktivitas harian.",
      subScores: { performance: 94, value: 92, portability: 88, budgetFit: 97 },
      breakdown: bd(W_RAKA, [94, 96, 100, 92, 88, 90]),
      reasons: [
        { text: "Sesuai budget Rp8 juta", source: "Harga Rp8,3 jt, masih dalam toleransi ±10%" },
        { text: "RAM 16 GB memenuhi kebutuhan multitasking", source: "Dari aktivitas Programming + software Docker" },
        { text: "SSD 512 GB cukup untuk proyek dan SDK", source: "Dari software Android Studio" },
        { text: "Ringan untuk dibawa ke kampus", source: "1,4 kg, prioritas \"Ringan\" kamu" },
      ],
      tradeOffs: [
        {
          text: "GPU kurang ideal untuk 3D berat",
          source: "Tidak masalah untuk profilmu, tapi perlu diperhatikan bila nanti belajar Blender",
        },
      ],
    },
    {
      laptopId: "lp-002",
      matchScore: 92, // 91,6
      category: "best-performance",
      categoryReason: "CPU 8 core paling kencang di budget-mu, cocok bila sering compile proyek besar.",
      summary: "Paling kencang untuk compile, sedikit melewati budget.",
      subScores: { performance: 100, value: 86, portability: 85, budgetFit: 82 },
      breakdown: bd(W_RAKA, [100, 82, 90, 92, 85, 98]),
      reasons: [
        { text: "Ryzen 7 8 core, paling kencang di daftar ini", source: "Skor CPU 90 dari 100" },
        { text: "Layar OLED 100% sRGB untuk UI/UX", source: "Dari aktivitas tambahan UI/UX Design" },
      ],
      tradeOffs: [
        { text: "RAM 16 GB tidak bisa di-upgrade", source: "Cukup untuk sekarang, tapi tidak bisa naik ke 32 GB" },
        { text: "Rp800 ribu di atas budget", source: "Harga Rp8,8 jt, batas toleransi ±10%" },
      ],
    },
    {
      laptopId: "lp-003",
      matchScore: 90, // 90,0
      category: "best-value",
      categoryReason: "Spek setara Best Match, Rp700 ribu lebih murah.",
      summary: "Spek inti sama dengan Best Match dengan harga lebih rendah.",
      subScores: { performance: 82, value: 98, portability: 86, budgetFit: 100 },
      breakdown: bd(W_RAKA, [82, 100, 100, 92, 86, 70]),
      reasons: [
        { text: "RAM 16 GB yang bisa di-upgrade", source: "Dari software Docker + Android Studio" },
        { text: "Rp7,6 jt, di bawah budget", source: "Budget Rp8 jt" },
      ],
      tradeOffs: [{ text: "Layar 45% sRGB, warna kurang akurat", source: "Berpengaruh untuk UI/UX, tidak untuk coding" }],
    },
    {
      laptopId: "lp-004",
      matchScore: 89, // 89,3
      category: "best-battery",
      categoryReason: "Baterai 75 Wh, sekitar 12 jam pemakaian ringan.",
      summary: "Paling awet dan ringan untuk seharian di kampus.",
      subScores: { performance: 88, value: 88, portability: 94, budgetFit: 86 },
      breakdown: bd(W_RAKA, [88, 86, 90, 92, 94, 98]),
      reasons: [
        { text: "Baterai 75 Wh", source: "Prioritas \"Ringan dibawa\": sering kerja tanpa colokan" },
        { text: "1,3 kg", source: "Lebih ringan 100 g dari Best Match" },
      ],
      tradeOffs: [{ text: "RAM tidak bisa di-upgrade", source: "Tetap 16 GB selamanya" }],
    },
    {
      laptopId: "lp-010",
      matchScore: 88, // 87,9
      category: "cheapest",
      categoryReason: "Memenuhi semua spek wajib di harga terendah.",
      summary: "Spek wajib terpenuhi dengan sisa budget hampir Rp2 juta.",
      subScores: { performance: 82, value: 96, portability: 70, budgetFit: 100 },
      breakdown: bd(W_RAKA, [82, 100, 100, 92, 70, 60]),
      reasons: [
        { text: "Ryzen 5 seri H dan RAM 16 GB", source: "Spek wajib CPU + RAM terpenuhi" },
        { text: "Rp6,2 jt", source: "Sisa budget Rp1,8 jt" },
      ],
      tradeOffs: [{ text: "1,5 kg, paling berat di daftar ini", source: "Prioritas \"Ringan\" kamu" }],
    },
    {
      laptopId: "lp-009",
      matchScore: 78, // 78,2
      summary: "Ringan dan murah, tetapi RAM 8 GB tidak bisa ditambah.",
      subScores: { performance: 64, value: 80, portability: 96, budgetFit: 100 },
      breakdown: bd(W_RAKA, [64, 100, 50, 92, 96, 90]),
      reasons: [{ text: "Paling ringan, 1,24 kg", source: "Prioritas \"Ringan\" kamu" }],
      tradeOffs: [{ text: "RAM 8 GB tidak bisa di-upgrade", source: "Spek wajib RAM 16 GB tidak terpenuhi" }],
    },
    {
      laptopId: "lp-007",
      matchScore: 76, // 75,9
      summary: "Baterai awet, tetapi kurang untuk Docker.",
      subScores: { performance: 62, value: 78, portability: 90, budgetFit: 100 },
      breakdown: bd(W_RAKA, [62, 100, 50, 92, 90, 70]),
      reasons: [{ text: "Baterai 57 Wh", source: "Prioritas \"Ringan dibawa\"" }],
      tradeOffs: [{ text: "RAM 8 GB tidak bisa di-upgrade", source: "Spek wajib RAM 16 GB tidak terpenuhi" }],
    },
    {
      laptopId: "lp-008",
      matchScore: 75, // 74,55
      summary: "Murah dan ringan, tetapi kurang untuk Android Studio.",
      subScores: { performance: 60, value: 78, portability: 86, budgetFit: 100 },
      breakdown: bd(W_RAKA, [60, 100, 50, 92, 86, 65]),
      reasons: [{ text: "Rp5,9 jt", source: "Jauh di bawah budget" }],
      tradeOffs: [{ text: "RAM 8 GB tidak bisa di-upgrade", source: "Spek wajib RAM 16 GB tidak terpenuhi" }],
    },
  ],
  isMock: true,
};

// ---------------------------------------------------------------- Salsa · Desain
const W_SALSA: Weights = [
  ["layar", 30],
  ["gpu", 25],
  ["performa", 20],
  ["ram", 10],
  ["storage", 10],
  ["budget", 5],
];

const salsa: Scenario = {
  id: "sc-desain",
  persona: "desain",
  personaName: "Salsa",
  title: "Salsa · DKV · Rp15 jt",
  profile: {
    budget: { min: 13_000_000, max: 15_000_000, flexible: true },
    major: "dkv",
    activities: ["desain-grafis", "video", "3d"],
    primaryActivity: "desain-grafis",
    software: ["photoshop", "premiere", "blender", "figma"],
    priorityMode: "weights",
    priorities: toPriorities(W_SALSA),
    hardFilters: ["layar-akurat"],
  },
  results: [
    {
      laptopId: "lp-011",
      matchScore: 92, // 91,6
      category: "best-match",
      summary: "Layar OLED akurat dan RTX 4050 untuk desain, video, dan 3D ringan.",
      subScores: { performance: 86, value: 90, portability: 70, budgetFit: 96 },
      breakdown: bd(W_SALSA, [98, 88, 86, 90, 92, 96]),
      reasons: [
        { text: "Layar OLED 2,8K 100% sRGB", source: "Syarat wajib \"Layar akurat warna\"" },
        { text: "RTX 4050 6 GB", source: "Dari software Blender + Premiere Pro" },
        { text: "Rp15 jt, pas di budget", source: "Budget Rp15 jt" },
      ],
      tradeOffs: [{ text: "1,8 kg", source: "Kurang nyaman bila dibawa setiap hari" }],
    },
    {
      laptopId: "lp-012",
      matchScore: 91, // 90,7
      category: "best-performance",
      categoryReason: "RTX 4060 dan CPU 14 core, render Blender paling cepat.",
      summary: "Paling kencang untuk render, tetapi berat dan layar hanya Full HD.",
      subScores: { performance: 98, value: 84, portability: 40, budgetFit: 82 },
      breakdown: bd(W_SALSA, [78, 100, 96, 90, 100, 82]),
      reasons: [
        { text: "RTX 4060 8 GB", source: "Aktivitas 3D/Blender" },
        { text: "SSD 1 TB", source: "File video Premiere cepat membesar" },
      ],
      tradeOffs: [
        { text: "2,4 kg", source: "Hampir dua kali bobot laptop tipis" },
        { text: "Layar Full HD, bukan 2,8K", source: "Detail desain kurang tajam" },
      ],
    },
    {
      laptopId: "lp-002",
      matchScore: 82, // 82,05
      category: "best-value",
      categoryReason: "Layar OLED 100% sRGB, Rp6,2 juta lebih hemat; cukup untuk Figma dan Photoshop.",
      summary: "Hemat dengan layar akurat, tanpa GPU dedicated.",
      subScores: { performance: 90, value: 96, portability: 85, budgetFit: 100 },
      breakdown: bd(W_SALSA, [96, 55, 90, 80, 85, 100]),
      reasons: [{ text: "OLED 100% sRGB", source: "Syarat wajib \"Layar akurat warna\"" }],
      tradeOffs: [{ text: "GPU integrated", source: "Blender dan render video akan jauh lebih lambat" }],
    },
    {
      laptopId: "lp-005",
      matchScore: 80, // 79,7
      category: "lightest",
      categoryReason: "1,25 kg dengan layar OLED 2,8K, paling nyaman dibawa ke studio.",
      summary: "Paling ringan dengan layar tajam, tanpa GPU dedicated.",
      subScores: { performance: 84, value: 84, portability: 96, budgetFit: 98 },
      breakdown: bd(W_SALSA, [95, 52, 84, 80, 85, 98]),
      reasons: [{ text: "1,25 kg", source: "Paling ringan di daftar ini" }],
      tradeOffs: [{ text: "GPU integrated", source: "Tidak cocok untuk aktivitas 3D/Blender" }],
    },
    {
      laptopId: "lp-004",
      matchScore: 79, // 78,9
      category: "best-battery",
      categoryReason: "Baterai 75 Wh, cukup untuk sketsa dan revisi seharian.",
      summary: "Baterai paling awet, tetapi kurang untuk render.",
      subScores: { performance: 82, value: 92, portability: 94, budgetFit: 100 },
      breakdown: bd(W_SALSA, [95, 50, 82, 80, 85, 100]),
      reasons: [{ text: "Baterai 75 Wh", source: "Sekitar 12 jam pemakaian ringan" }],
      tradeOffs: [{ text: "GPU integrated", source: "Tidak cocok untuk aktivitas 3D/Blender" }],
    },
  ],
  isMock: true,
};

// ---------------------------------------------------------------- Dinda · Umum
const W_DINDA: Weights = [
  ["portabilitas", 30],
  ["baterai", 25],
  ["budget", 20],
  ["build", 15],
  ["performa", 10],
];

const dinda: Scenario = {
  id: "sc-umum",
  persona: "umum",
  personaName: "Dinda",
  title: "Dinda · Hukum · Rp6 jt",
  profile: {
    budget: { min: 5_000_000, max: 6_000_000, flexible: true },
    major: "umum",
    activities: ["office"],
    primaryActivity: "office",
    software: ["excel", "zoom"],
    priorityMode: "weights",
    priorities: toPriorities(W_DINDA),
    hardFilters: [],
  },
  results: [
    {
      laptopId: "lp-009",
      matchScore: 87, // 86,8
      category: "best-match",
      summary: "Ringan, bodi aluminium, dan cukup untuk kuliah seharian.",
      subScores: { performance: 64, value: 88, portability: 96, budgetFit: 88 },
      breakdown: bd(W_DINDA, [96, 82, 88, 90, 64]),
      reasons: [
        { text: "1,24 kg", source: "Kebutuhan bobot di bawah 1,4 kg" },
        { text: "Baterai 50 Wh, sekitar 8 jam", source: "Kebutuhan baterai seharian" },
        { text: "Rp6,4 jt", source: "Masih dalam toleransi ±10% dari Rp6 jt" },
      ],
      tradeOffs: [{ text: "RAM 8 GB tidak bisa ditambah", source: "Cukup untuk Office dan Zoom" }],
    },
    {
      laptopId: "lp-007",
      matchScore: 86, // 86,0
      category: "best-battery",
      categoryReason: "Baterai 57 Wh, sekitar 10 jam pemakaian ringan.",
      summary: "Paling awet dengan keyboard nyaman.",
      subScores: { performance: 62, value: 90, portability: 87, budgetFit: 92 },
      breakdown: bd(W_DINDA, [87, 92, 92, 82, 62]),
      reasons: [{ text: "Baterai 57 Wh", source: "Prioritas Baterai kamu" }],
      tradeOffs: [{ text: "1,39 kg", source: "150 g lebih berat dari Best Match" }],
    },
    {
      laptopId: "lp-008",
      matchScore: 81, // 81,4
      category: "best-value",
      categoryReason: "Rp500 ribu lebih murah dari Best Match dengan bobot hampir sama.",
      summary: "Hemat dan ringan, baterai biasa saja.",
      subScores: { performance: 62, value: 94, portability: 88, budgetFit: 98 },
      breakdown: bd(W_DINDA, [88, 70, 98, 78, 62]),
      reasons: [{ text: "Rp5,9 jt", source: "Di bawah budget Rp6 jt" }],
      tradeOffs: [{ text: "Baterai 42 Wh, sekitar 6 jam", source: "Perlu charger untuk kuliah seharian" }],
    },
    {
      laptopId: "lp-010",
      matchScore: 79, // 78,8
      category: "best-performance",
      categoryReason: "CPU 6 core paling kencang di budget-mu, berguna bila nanti butuh aplikasi berat.",
      summary: "Paling kencang, tetapi paling berat.",
      subScores: { performance: 86, value: 90, portability: 72, budgetFit: 94 },
      breakdown: bd(W_DINDA, [72, 76, 94, 72, 86]),
      reasons: [{ text: "Ryzen 5 6600H, RAM 16 GB", source: "Lebih dari cukup untuk Office" }],
      tradeOffs: [{ text: "1,5 kg", source: "Kebutuhan bobot di bawah 1,4 kg tidak terpenuhi" }],
    },
    {
      laptopId: "lp-006",
      matchScore: 77, // 76,6
      category: "cheapest",
      categoryReason: "Memenuhi semua spek wajib di harga terendah.",
      summary: "Termurah, tetapi baterai pendek.",
      subScores: { performance: 50, value: 92, portability: 80, budgetFit: 100 },
      breakdown: bd(W_DINDA, [80, 66, 100, 74, 50]),
      reasons: [{ text: "Rp5,5 jt", source: "Sisa budget Rp500 ribu" }],
      tradeOffs: [{ text: "Baterai 41 Wh, sekitar 6 jam", source: "Kebutuhan baterai 8 jam tidak terpenuhi" }],
    },
  ],
  isMock: true,
};

// ---------------------------------------------------------------- Bima · Profesional
const W_BIMA: Weights = [
  ["portabilitas", 25],
  ["baterai", 20],
  ["build", 20],
  ["budget", 20],
  ["performa", 15],
];

const bima: Scenario = {
  id: "sc-profesional",
  persona: "profesional",
  personaName: "Bima",
  title: "Bima · Staf admin · Rp10 jt",
  profile: {
    budget: { min: 9_000_000, max: 10_000_000, flexible: true },
    major: "bisnis",
    activities: ["office", "data"],
    primaryActivity: "office",
    software: ["excel", "zoom", "spss"],
    priorityMode: "weights",
    priorities: toPriorities(W_BIMA),
    hardFilters: ["port-hdmi"],
  },
  results: [
    {
      laptopId: "lp-005",
      matchScore: 91, // 91,0
      category: "best-match",
      summary: "Ringan, port lengkap, dan webcam FHD untuk meeting.",
      subScores: { performance: 84, value: 88, portability: 96, budgetFit: 92 },
      breakdown: bd(W_BIMA, [96, 88, 92, 92, 84]),
      reasons: [
        { text: "1,25 kg", source: "Prioritas Portabel kamu" },
        { text: "HDMI + 2 USB-C + 2 USB-A", source: "Syarat wajib \"Port HDMI\"" },
        { text: "Webcam FHD", source: "Dari aktivitas meeting (Zoom)" },
      ],
      tradeOffs: [{ text: "Rp500 ribu di atas budget", source: "Masih dalam toleransi ±10%" }],
    },
    {
      laptopId: "lp-004",
      matchScore: 90, // 89,8
      category: "best-battery",
      categoryReason: "Baterai 75 Wh, sekitar 12 jam pemakaian ringan.",
      summary: "Paling awet dengan harga lebih rendah.",
      subScores: { performance: 80, value: 94, portability: 92, budgetFit: 96 },
      breakdown: bd(W_BIMA, [92, 98, 80, 96, 80]),
      reasons: [{ text: "Baterai 75 Wh", source: "Prioritas Baterai kamu" }],
      tradeOffs: [{ text: "Webcam HD, bukan FHD", source: "Gambar meeting kurang tajam" }],
    },
    {
      laptopId: "lp-002",
      matchScore: 89, // 89,0
      category: "best-performance",
      categoryReason: "CPU 8 core paling kencang, nyaman untuk Excel besar dan SPSS.",
      summary: "Paling kencang untuk olah data.",
      subScores: { performance: 96, value: 92, portability: 84, budgetFit: 96 },
      breakdown: bd(W_BIMA, [84, 84, 88, 96, 96]),
      reasons: [{ text: "Ryzen 7 8 core", source: "Dari software SPSS + Excel" }],
      tradeOffs: [{ text: "1,46 kg", source: "Paling berat di antara pilihan teratas" }],
    },
    {
      laptopId: "lp-001",
      matchScore: 83, // 83,4
      category: "best-value",
      categoryReason: "Port lengkap termasuk HDMI, Rp2,2 juta lebih murah dari Best Match.",
      summary: "Hemat dan cukup untuk pekerjaan kantor.",
      subScores: { performance: 82, value: 96, portability: 86, budgetFit: 98 },
      breakdown: bd(W_BIMA, [86, 74, 76, 98, 82]),
      reasons: [{ text: "Rp8,3 jt", source: "Di bawah budget Rp10 jt" }],
      tradeOffs: [{ text: "Baterai 50 Wh", source: "Perlu charger untuk hari dengan banyak meeting" }],
    },
    {
      laptopId: "lp-003",
      matchScore: 81, // 81,3
      category: "cheapest",
      categoryReason: "Memenuhi semua syarat wajib termasuk HDMI di harga terendah.",
      summary: "Termurah yang tetap memenuhi syarat.",
      subScores: { performance: 74, value: 98, portability: 84, budgetFit: 100 },
      breakdown: bd(W_BIMA, [84, 74, 72, 100, 74]),
      reasons: [{ text: "Rp7,6 jt", source: "Sisa budget Rp2,4 jt" }],
      tradeOffs: [{ text: "Layar 45% sRGB", source: "Presentasi tampak pucat dibanding OLED" }],
    },
  ],
  isMock: true,
};

export const scenarios: Scenario[] = [raka, salsa, dinda, bima];
