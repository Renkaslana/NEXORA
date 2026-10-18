import type {
  Activity,
  BudgetPreset,
  CriterionId,
  HardFilter,
  Major,
  Persona,
  Priority,
  Software,
} from "@/types";

// Pilihan wizard (PRD §15, §29). Jangan diimpor dari komponen: akses lewat `lib/api.ts`.

export const personas: Persona[] = [
  { id: "teknik", label: "Teknik & Informatika", example: "Raka, 19, Informatika" },
  { id: "desain", label: "Desain, Multimedia & Arsitektur", example: "Salsa, 20, DKV" },
  { id: "umum", label: "Mahasiswa Umum", example: "Dinda, 18, Hukum" },
  { id: "profesional", label: "Karyawan & Profesional", example: "Bima, 24, staf admin" },
];

export const majors: Major[] = [
  { id: "informatika", label: "Informatika", icon: "code", persona: "teknik" },
  { id: "sistem-informasi", label: "Sistem Informasi", icon: "network", persona: "teknik" },
  { id: "data-science", label: "Data Science", icon: "chart", persona: "teknik" },
  { id: "dkv", label: "Desain Grafis/DKV", icon: "palette", persona: "desain" },
  { id: "arsitektur", label: "Arsitektur", icon: "ruler", persona: "desain" },
  { id: "teknik", label: "Teknik (Sipil/Mesin/Elektro)", icon: "cog", persona: "teknik" },
  { id: "bisnis", label: "Bisnis/Manajemen", icon: "briefcase", persona: "profesional" },
  { id: "akuntansi", label: "Akuntansi", icon: "calculator", persona: "profesional" },
  { id: "umum", label: "Umum/Kantor", icon: "file", persona: "umum" },
  { id: "lainnya", label: "Lainnya", icon: "more", persona: "umum" },
];

export const activities: Activity[] = [
  { id: "programming", label: "Programming", icon: "code" },
  { id: "uiux", label: "UI/UX Design", icon: "pen" },
  { id: "desain-grafis", label: "Desain Grafis", icon: "palette" },
  { id: "video", label: "Edit Video", icon: "film" },
  { id: "3d", label: "3D/Blender", icon: "box" },
  { id: "data", label: "Analisis Data", icon: "chart" },
  { id: "office", label: "Office & Kuliah Online", icon: "file" },
  { id: "gaming", label: "Gaming", icon: "gamepad" },
  { id: "ai-ml", label: "AI/Machine Learning", icon: "cpu" },
];

export const software: Software[] = [
  { id: "vscode", label: "VS Code", load: "ringan", suggestedFor: ["informatika", "sistem-informasi", "data-science"] },
  { id: "android-studio", label: "Android Studio", load: "berat", suggestedFor: ["informatika", "sistem-informasi"] },
  { id: "docker", label: "Docker", load: "berat", suggestedFor: ["informatika", "sistem-informasi"] },
  { id: "figma", label: "Figma", load: "sedang", suggestedFor: ["dkv", "informatika", "sistem-informasi"] },
  { id: "photoshop", label: "Photoshop", load: "sedang", suggestedFor: ["dkv", "arsitektur"] },
  { id: "premiere", label: "Premiere Pro", load: "berat", suggestedFor: ["dkv"] },
  { id: "blender", label: "Blender", load: "berat", suggestedFor: ["dkv", "arsitektur"] },
  { id: "autocad", label: "AutoCAD", load: "sedang", suggestedFor: ["arsitektur", "teknik"] },
  { id: "matlab", label: "MATLAB", load: "sedang", suggestedFor: ["teknik", "data-science"] },
  { id: "spss", label: "SPSS", load: "ringan", suggestedFor: ["bisnis", "akuntansi", "data-science"] },
  { id: "excel", label: "Excel", load: "ringan", suggestedFor: ["bisnis", "akuntansi", "umum"] },
  { id: "zoom", label: "Zoom", load: "ringan", suggestedFor: ["umum", "bisnis", "akuntansi", "lainnya"] },
];

export const criterionLabels: Record<CriterionId, string> = {
  performa: "Performa",
  budget: "Sesuai budget",
  ram: "RAM",
  storage: "Storage",
  gpu: "GPU",
  layar: "Layar",
  baterai: "Baterai",
  portabilitas: "Portabilitas",
  build: "Build quality",
};

export const priorities: Priority[] = [
  { id: "performa", label: "Performa", criterion: "performa" },
  { id: "baterai", label: "Baterai", criterion: "baterai" },
  { id: "ringan", label: "Ringan dibawa", criterion: "portabilitas" },
  { id: "layar", label: "Layar", criterion: "layar" },
  { id: "build", label: "Build quality", criterion: "build" },
  { id: "storage", label: "Storage", criterion: "storage" },
  { id: "ram", label: "RAM", criterion: "ram" },
  { id: "gpu", label: "GPU", criterion: "gpu" },
  { id: "hemat", label: "Harga hemat", criterion: "budget" },
];

export const hardFilters: HardFilter[] = [
  { id: "bobot-1-3", label: "Bobot di bawah 1,3 kg", description: "Untuk yang membawa laptop setiap hari" },
  { id: "baterai-awet", label: "Baterai awet", description: "Minimal 60 Wh, sekitar 9 jam pemakaian ringan" },
  { id: "port-hdmi", label: "Port HDMI", description: "Untuk presentasi tanpa adaptor" },
  { id: "layar-akurat", label: "Layar akurat warna", description: "Minimal 100% sRGB" },
  { id: "ram-upgrade", label: "RAM bisa di-upgrade", description: "Bisa ditambah nanti saat kebutuhan naik" },
];

export const budgetPresets: BudgetPreset[] = [
  {
    id: "lt-6",
    label: "< Rp6 jt",
    min: 3_000_000,
    max: 6_000_000,
    value: 5_000_000,
    typicalSpec: "Core i3 / Ryzen 3–5 seri U, RAM 8 GB, SSD 256–512 GB",
  },
  {
    id: "6-8",
    label: "Rp6–8 jt",
    min: 6_000_000,
    max: 8_000_000,
    value: 7_000_000,
    typicalSpec: "Ryzen 5 / Core i5, RAM 8–16 GB, SSD 512 GB",
  },
  {
    id: "8-10",
    label: "Rp8–10 jt",
    min: 8_000_000,
    max: 10_000_000,
    value: 8_000_000,
    typicalSpec: "Ryzen 5 / Core i5, RAM 16 GB, SSD 512 GB",
  },
  {
    id: "10-15",
    label: "Rp10–15 jt",
    min: 10_000_000,
    max: 15_000_000,
    value: 12_000_000,
    typicalSpec: "Ryzen 7 / Core i7 atau Core Ultra, RAM 16 GB, SSD 512 GB–1 TB, layar OLED",
  },
  {
    id: "15-plus",
    label: "Rp15 jt+",
    min: 15_000_000,
    max: 30_000_000,
    value: 17_000_000,
    typicalSpec: "Core i7 / Ryzen 7 seri H, RTX 4050–4060, RAM 16–32 GB, SSD 1 TB",
  },
];

/** Batas slider budget (PRD §15 step 1). */
export const budgetRange = { min: 3_000_000, max: 30_000_000, step: 500_000 } as const;
