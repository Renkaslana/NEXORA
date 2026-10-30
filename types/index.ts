// Tipe domain SPECO (nama kode: NEXORA). Field mengikuti PRD §29 (skema kartu Modul 2 Trello)
// supaya nanti tinggal disambung ke REST API tanpa mengubah komponen.

export type PersonaId = "teknik" | "desain" | "umum" | "profesional";

export type SoftwareLoad = "ringan" | "sedang" | "berat";

/** Kriteria penilaian. Label tampilan ada di `data/options.ts`. */
export type CriterionId =
  | "performa"
  | "budget"
  | "ram"
  | "storage"
  | "gpu"
  | "layar"
  | "baterai"
  | "portabilitas"
  | "build";

export type ActivityId =
  | "programming"
  | "uiux"
  | "desain-grafis"
  | "video"
  | "3d"
  | "data"
  | "office"
  | "gaming"
  | "ai-ml";

export type HardFilterId =
  | "bobot-1-3"
  | "baterai-awet"
  | "port-hdmi"
  | "layar-akurat"
  | "ram-upgrade";

export type BudgetPresetId = "lt-6" | "6-8" | "8-10" | "10-15" | "15-plus";

// ---------------------------------------------------------------- Laptop

/** Bentuk & warna render ilustrasi (REDESIGN §24). Bukan foto produk asli. */
export type LaptopShape = "ultrabook" | "mainstream" | "creator";
export type LaptopColor = "silver" | "mist" | "graphite" | "navy";
export type LaptopAngle = "34" | "front" | "side" | "ports";

export interface Laptop {
  id: string;
  slug: string;
  brand: string;
  model: string;
  priceIdr: number;
  cpu: { name: string; cores: number; threads: number; benchScore: number };
  gpu: { type: "integrated" | "dedicated"; name: string; vramGb: number };
  ram: { gb: number; type: string; upgradeable: boolean; maxGb: number };
  storage: { gb: number; type: string };
  display: {
    inch: number;
    resolution: string;
    panel: "IPS" | "OLED" | "TN" | "VA";
    srgbPercent: number;
    refreshHz: number;
  };
  batteryWh: number;
  weightKg: number;
  ports: string[];
  useCases: ActivityId[];
  targetPersonas: PersonaId[];
  pros: string[];
  cons: string[];
  /** Gambar utama (render sudut 3/4). */
  imageUrl: string;
  customImageUrl?: string;
  /** Render ilustrasi yang mewakili laptop ini; URL per sudut disusun `lib/laptop-image.ts`. */
  image: { shape: LaptopShape; color: LaptopColor };
  marketplaceUrl: string;
  isMock?: boolean;
}

// ---------------------------------------------------------------- Opsi wizard (PRD §15)

export interface Major {
  id: string;
  label: string;
  /** Nama kunci ikon; dipetakan ke ikon Phosphor di `lib/icons.ts`. */
  icon: string;
  persona: PersonaId;
}

export interface Activity {
  id: ActivityId;
  label: string;
  icon: string;
  /** Satu kalimat umpan balik di Wizard saat dipilih (REDESIGN §17). Teks mock statis. */
  feedback: string;
}

export interface Software {
  id: string;
  label: string;
  load: SoftwareLoad;
  /** Jurusan yang menyorot software ini di urutan atas. */
  suggestedFor: string[];
}

export interface Priority {
  id: string;
  label: string;
  criterion: CriterionId;
  /** Satu kalimat umpan balik di Wizard saat dipilih (REDESIGN §17). Teks mock statis. */
  feedback: string;
}

export interface HardFilter {
  id: HardFilterId;
  label: string;
  description: string;
  /** Kenapa syarat ini sering membuat hasil kosong (PRD §26 no-result). Teks mock. */
  limitingReason: string;
}

export interface BudgetPreset {
  id: BudgetPresetId;
  /** Label chip, mis. "Rp6–8 jt". */
  label: string;
  min: number;
  max: number;
  /** Nilai slider saat preset dipilih. */
  value: number;
  /** "Di kisaran ini biasanya kamu dapat: …" */
  typicalSpec: string;
}

export interface Persona {
  id: PersonaId;
  label: string;
  example: string;
  /** PRD §5 */
  budgetLabel: string;
  needs: string;
  fear: string;
}

// ---------------------------------------------------------------- Profil pengguna

export interface UserProfile {
  /** `max` adalah nilai slider; `flexible` = toleransi ±10%. */
  budget: { min: number; max: number; flexible: boolean };
  major: string;
  activities: ActivityId[];
  primaryActivity: ActivityId | null;
  software: string[];
  /**
   * PRD §15 step 5. "rank": 1–3 prioritas berurutan, `weight` null (bobot ditentukan backend).
   * "weights": bobot diatur sendiri oleh pengguna lewat "Atur bobot detail", Σ weight = 100.
   */
  priorityMode: "rank" | "weights";
  priorities: { criterion: CriterionId; rank: number; weight: number | null }[];
  hardFilters: HardFilterId[];
}

// ---------------------------------------------------------------- Profil Kebutuhan (PRD §16)

export type RequirementLevel = "wajib" | "disarankan" | "opsional";

export type SpecComponent = "cpu" | "ram" | "storage" | "gpu" | "layar" | "baterai";

export interface SpecRequirement {
  component: SpecComponent;
  minimum: string;
  level: RequirementLevel;
  reason: string;
}

export interface RequirementWarning {
  id: string;
  message: string;
  detail: string;
  actions: {
    label: string;
    kind: "raise-budget" | "compromise" | "edit";
    /** Untuk "raise-budget": nilai budget baru. */
    targetBudget?: number;
  }[];
  /** Catatan yang tampil setelah pengguna memilih kompromi (PRD §16). */
  compromiseNote: string;
  /** Meter "butuh vs terjangkau budget-mu" (REDESIGN §18). Angka mock, bukan hitungan. */
  meter?: { metric: SpecMetric; need: number; affordable: number };
}

/** Angka spek laptop yang bisa dibandingkan dengan ambang minimum (PRD §19 daftar periksa). */
export type SpecMetric =
  | "cpuBench"
  | "ramGb"
  | "ramMaxGb"
  | "storageGb"
  | "gpuDedicated"
  | "srgbPercent"
  | "screenInch"
  | "batteryWh";

/** Ambang terstruktur (disetujui Fahren): laptop memenuhi bila nilai metrik ≥ `min`. */
export interface SpecCheck {
  metric: SpecMetric;
  min: number;
}

export interface RequirementProfile {
  id: string;
  persona: PersonaId;
  /** Hanya terisi bila profil berbeda per tier budget. */
  budgetTier?: BudgetPresetId;
  summary: string;
  specs: SpecRequirement[];
  warnings: RequirementWarning[];
  /** Ambang per komponen untuk daftar periksa ✓/✕. Tanpa ambang = tidak diperiksa. */
  checks?: Partial<Record<SpecComponent, SpecCheck>>;
  /** Karakter laptop yang dicari, 1 = rendah … 3 = tinggi (kartu gelap Profil, REDESIGN §18). Mock statis. */
  character?: { performa: 1 | 2 | 3; mobilitas: 1 | 2 | 3 };
  isMock: true;
}

// ---------------------------------------------------------------- Hasil (PRD §17, §27)

export type ResultCategory =
  | "best-match"
  | "best-performance"
  | "best-value"
  | "best-battery"
  | "lightest"
  | "cheapest";

export interface BreakdownItem {
  criterion: CriterionId;
  /** Bobot dalam persen; total satu hasil = 100. */
  weight: number;
  /** Skor laptop untuk kriteria ini, 0–100. */
  score: number;
}

export interface Reason {
  text: string;
  /** Sumber klaim, pola Perplexity (PRD §27 lapis 2). */
  source: string;
}

export interface RecommendationResult {
  laptopId: string;
  /** Harus = round(Σ weight × score / 100). Diverifikasi `lib/mock-check.ts`. */
  matchScore: number;
  /** Kosong untuk laptop yang lolos filter tanpa kategori. */
  category?: ResultCategory;
  /** Satu kalimat alasan kategori (PRD §17). */
  categoryReason?: string;
  /** Ringkasan lapis 1 (PRD §27). */
  summary: string;
  subScores: { performance: number; value: number; portability: number; budgetFit: number };
  breakdown: BreakdownItem[];
  reasons: Reason[];
  tradeOffs: Reason[];
}

export interface Scenario {
  id: string;
  persona: PersonaId;
  /** Nama persona contoh, mis. "Raka". */
  personaName: string;
  title: string;
  profile: UserProfile;
  /** Hasil terurut dari skor tertinggi. Indeks 0 = Best Match. */
  results: RecommendationResult[];
  isMock: true;
}

// ---------------------------------------------------------------- Landing

/** Satu baris meter di landing: komponen spek dengan ambang profil, atau batas bobot persona. */
export type LandingMeterRef = { kind: "spec"; component: SpecComponent } | { kind: "weight"; maxKg: number };

/** Kebutuhan utama di section landing "Satu budget. Banyak kemungkinan." */
export type BudgetNeedId = "coding" | "desain" | "gaming" | "kuliah" | "office";

export interface BudgetNeed {
  id: BudgetNeedId;
  label: string;
  /** Jurusan yang diisikan ke Wizard lewat `?jurusan=`. Kosong = pengguna memilih sendiri. */
  majorId?: string;
  /** Catatan kompromi bila tidak ada laptop dengan kecocokan ≥ 80% di budget yang dipilih. */
  compromiseNote: string;
}

// ---------------------------------------------------------------- Penyimpanan lokal (PRD §20)

export interface SavedLaptop {
  laptopId: string;
  savedAt: string;
}

export interface Comparison {
  laptopIds: string[];
  createdAt: string;
}

export interface HistoryEntry {
  profile: UserProfile;
  bestMatchId: string;
  createdAt: string;
}
