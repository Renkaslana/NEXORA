import { glossary } from "@/data/glossary";
import { budgetNeedFit, budgetNeeds, budgetPreviewRange, criterionHints, demoBudget } from "@/data/landing";
import { laptops } from "@/data/laptops";
import { requirementProfiles } from "@/data/mock-requirements";
import { scenarios } from "@/data/mock-results";
import {
  activities,
  budgetPresets,
  budgetRange,
  criterionLabels,
  hardFilters,
  majors,
  personas,
  priorities,
  software,
} from "@/data/options";
import { checkScenarios } from "@/lib/mock-check";
import type {
  BudgetPreset,
  BudgetPresetId,
  Laptop,
  PersonaId,
  RecommendationResult,
  RequirementProfile,
  Scenario,
  UserProfile,
} from "@/types";

// Lapisan service (PRD §29). Satu-satunya pintu data untuk komponen.
// - `NEXT_PUBLIC_API_URL` kosong (default, juga di Vercel): data mock di `data/` dengan jeda palsu 600–2500 ms.
// - `NEXT_PUBLIC_API_URL` diisi: fungsi async memanggil backend Laravel (kontrak di docs/BACKEND.md).
// `?mock=error|empty` dan `{ source: "mock" }` (konten contoh landing) selalu memakai mock.
// Frontend tidak menghitung SAW: skor, bobot, dan peringkat datang dari backend (atau skenario mock).

export type MockMode = "error" | "empty";

export interface ApiOptions {
  /** Paksa state demo (PRD §26: `?mock=error`, `?mock=empty`). */
  mock?: MockMode | null;
  /** "mock" = selalu data contoh, mis. konten landing yang merujuk laptop contoh tertentu. */
  source?: "mock";
}

export class ApiError extends Error {
  constructor(message = "Terjadi kesalahan saat membuat rekomendasi. Jawabanmu tetap tersimpan.") {
    super(message);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------- Backend (opsional)

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

/** True bila frontend tersambung ke backend sungguhan (NEXT_PUBLIC_API_URL diisi). */
export const usingBackend = API_URL !== "";

function live(options?: ApiOptions): boolean {
  return usingBackend && !options?.mock && options?.source !== "mock";
}

/** Panggil backend; galat jaringan atau status non-2xx menjadi `ApiError` (UI menampilkan state error §26). */
async function backend<T>(path: string, init?: { method?: "GET" | "POST"; body?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: init?.method ?? "GET",
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Tidak bisa terhubung ke server SPECO. Periksa koneksi lalu coba lagi.");
  }
  if (!res.ok) throw Object.assign(new ApiError(), { status: res.status });
  return (await res.json()) as T;
}

const MIN_DELAY = 600;
const MAX_DELAY = 2500;

function fakeLatency(): Promise<void> {
  const ms = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function respond<T>(value: T, options?: ApiOptions): Promise<T> {
  await fakeLatency();
  if (options?.mock === "error") throw new ApiError();
  return structuredClone(value);
}

/** Baca `?mock=error|empty` dari query string (PRD §26). */
export function parseMockMode(value: string | null | undefined): MockMode | null {
  return value === "error" || value === "empty" ? value : null;
}

// ---------------------------------------------------------------- Lookup statis

export function getPersonaForMajor(majorId: string): PersonaId {
  return majors.find((m) => m.id === majorId)?.persona ?? "umum";
}

/** Tier budget dari nilai slider (batas atas inklusif). */
export function getBudgetPreset(budget: number): BudgetPreset {
  return budgetPresets.find((p) => budget < p.max) ?? budgetPresets[budgetPresets.length - 1];
}

function findRequirement(persona: PersonaId, tier: BudgetPresetId): RequirementProfile {
  return (
    requirementProfiles.find((r) => r.persona === persona && r.budgetTier === tier) ??
    requirementProfiles.find((r) => r.persona === persona && !r.budgetTier) ??
    requirementProfiles.find((r) => r.persona === persona && r.budgetTier === "8-10")!
  );
}

function findScenario(persona: PersonaId): Scenario {
  return scenarios.find((s) => s.persona === persona) ?? scenarios[0];
}

// ---------------------------------------------------------------- Data statis (tanpa jeda)

/** Pilihan wizard. Sinkron karena konfigurasi statis, bukan data dari server. */
export function getWizardOptions() {
  return {
    personas,
    majors,
    activities,
    software,
    priorities,
    hardFilters,
    budgetPresets,
    budgetRange,
    criterionLabels,
  };
}

/**
 * Saran saat tidak ada hasil (PRD §26): syarat yang paling membatasi (dari filter keras pengguna,
 * dengan teks alasan mock) dan budget preset berikutnya. Bukan perhitungan; hanya lookup statis.
 */
export function getNoResultSuggestions(profile: UserProfile) {
  const constraints = profile.hardFilters.map((id) => {
    const filter = hardFilters.find((f) => f.id === id)!;
    return { id, label: filter.label, reason: filter.limitingReason };
  });
  const index = budgetPresets.findIndex((p) => p.id === getBudgetPreset(profile.budget.max).id);
  const next = budgetPresets[index + 1];
  return { constraints, suggestedBudget: next && next.value > profile.budget.max ? next.value : null };
}

/** Konten statis landing: budget contoh dan penjelasan singkat tiap kriteria (tooltip transparansi). */
export function getLandingStoryContent() {
  return { demoBudget, criterionHints };
}

/**
 * Pratinjau "Satu budget. Banyak kemungkinan." (landing): kebutuhan, rentang slider, dan angka kecocokan
 * mock per laptop. Statis; penyaringan harga dan pengurutan dilakukan komponen, tanpa SAW.
 */
export function getBudgetPreviewContent() {
  return { needs: budgetNeeds, range: budgetPreviewRange, fit: budgetNeedFit };
}

/** Penjelasan awam istilah teknis per komponen (PRD §28). Sinkron: konfigurasi statis. */
export function getGlossary() {
  return glossary;
}

/**
 * Umpan balik langsung di bawah slider budget (PRD §15 step 1, §25).
 * Sinkron agar angka berubah real-time saat slider digeser.
 */
export function getBudgetInsight(budget: number, flexible = false) {
  const preset = getBudgetPreset(budget);
  const limit = flexible ? budget * 1.1 : budget;
  const laptopCount = laptops.filter((l) => l.priceIdr <= limit).length;
  return { preset, typicalSpec: preset.typicalSpec, laptopCount, catalogSize: laptops.length };
}

// ---------------------------------------------------------------- Data async (backend atau mock dengan jeda)

export async function getRequirements(profile: UserProfile, options?: ApiOptions): Promise<RequirementProfile> {
  if (live(options)) return backend<RequirementProfile>("/api/requirements", { method: "POST", body: profile });
  const persona = getPersonaForMajor(profile.major);
  const tier = getBudgetPreset(profile.budget.max).id;
  return respond(findRequirement(persona, tier), options);
}

export interface RecommendationItem {
  result: RecommendationResult;
  laptop: Laptop;
}

export interface RecommendationSet {
  scenarioId: string;
  persona: PersonaId;
  personaName: string;
  title: string;
  profile: UserProfile;
  /** Indeks 0 = Best Match. Kosong saat tidak ada laptop yang lolos (PRD §26). */
  items: RecommendationItem[];
  isMock: boolean;
}

export async function getRecommendations(profile: UserProfile, options?: ApiOptions): Promise<RecommendationSet> {
  if (live(options)) return backend<RecommendationSet>("/api/recommendations", { method: "POST", body: profile });
  const scenario = findScenario(getPersonaForMajor(profile.major));
  const items =
    options?.mock === "empty"
      ? []
      : scenario.results.map((result) => ({
          result,
          laptop: laptops.find((l) => l.id === result.laptopId)!,
        }));
  return respond(
    {
      scenarioId: scenario.id,
      persona: scenario.persona,
      personaName: scenario.personaName,
      title: scenario.title,
      profile: scenario.profile,
      items,
      isMock: true,
    },
    options
  );
}

/**
 * Ringkasan katalog untuk layar Analisis (PRD §14, §25). Sinkron seperti
 * `getBudgetInsight()`: daftar statis untuk visual "katalog tersaring", bukan hasil penilaian.
 */
export function getCatalogPreview() {
  return laptops.map((l) => ({
    id: l.id,
    name: `${l.brand} ${l.model}`,
    priceIdr: l.priceIdr,
    image: l.image,
  }));
}

/**
 * Slug laptop mock untuk generateStaticParams & validasi rute (sinkron: daftar statis). Saat tersambung ke
 * backend, slug lain tetap dibuka dinamis dan `getLaptop()` yang menentukan ada atau tidak.
 */
export function getLaptopSlugs(): string[] {
  return laptops.map((l) => l.slug);
}

/** Mengembalikan `null` bila tidak ditemukan (PRD §26: state 404 di Detail). */
export async function getLaptop(slug: string, options?: ApiOptions): Promise<Laptop | null> {
  if (live(options)) {
    try {
      return await backend<Laptop>(`/api/laptops/${encodeURIComponent(slug)}`);
    } catch (e) {
      if ((e as { status?: number }).status === 404) return null;
      throw e;
    }
  }
  return respond(laptops.find((l) => l.slug === slug) ?? null, options);
}

export async function getLaptops(ids: string[], options?: ApiOptions): Promise<Laptop[]> {
  if (live(options)) {
    if (ids.length === 0) return [];
    const found = await backend<Laptop[]>(`/api/laptops?ids=${ids.map(encodeURIComponent).join(",")}`);
    // Ikuti urutan `ids` seperti versi mock (backend boleh mengembalikan urutan bebas).
    return ids.map((id) => found.find((l) => l.id === id)).filter((l): l is Laptop => Boolean(l));
  }
  const byId = new Map(laptops.map((l) => [l.id, l]));
  return respond(
    ids.map((id) => byId.get(id)).filter((l): l is Laptop => Boolean(l)),
    options
  );
}

/** Profil contoh per persona untuk mengisi wizard demo dan halaman dev. */
export function getSampleProfile(persona: PersonaId): UserProfile {
  return structuredClone(findScenario(persona).profile);
}

// ---------------------------------------------------------------- Khusus /dev

/** Laporan konsistensi skor mock (PRD §27, §33). */
export function getMockIntegrityReport() {
  return checkScenarios(scenarios, laptops);
}
