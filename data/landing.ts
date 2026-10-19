import type { LandingCase, LandingMeterRef, PersonaId } from "@/types";

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
