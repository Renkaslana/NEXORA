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

// Lapisan service (PRD §29). Satu-satunya pintu ke data mock di `data/`.
// Nanti isi fungsi async diganti `fetch` ke REST API tanpa mengubah komponen.
// Fungsi async memberi jeda palsu 600–2500 ms agar state loading terlihat.
// Frontend tidak menghitung SAW: skenario dipilih dengan lookup statis per persona.

export type MockMode = "error" | "empty";

export interface ApiOptions {
  /** Paksa state demo (PRD §26: `?mock=error`, `?mock=empty`). */
  mock?: MockMode | null;
}

export class ApiError extends Error {
  constructor(message = "Terjadi kesalahan saat membuat rekomendasi. Jawabanmu tetap tersimpan.") {
    super(message);
    this.name = "ApiError";
  }
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
 * Umpan balik langsung di bawah slider budget (PRD §15 step 1, §25).
 * Sinkron agar angka berubah real-time saat slider digeser.
 */
export function getBudgetInsight(budget: number, flexible = false) {
  const preset = getBudgetPreset(budget);
  const limit = flexible ? budget * 1.1 : budget;
  const laptopCount = laptops.filter((l) => l.priceIdr <= limit).length;
  return { preset, typicalSpec: preset.typicalSpec, laptopCount, catalogSize: laptops.length };
}

// ---------------------------------------------------------------- Data async (dengan jeda)

export async function getRequirements(profile: UserProfile, options?: ApiOptions): Promise<RequirementProfile> {
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
  isMock: true;
}

export async function getRecommendations(profile: UserProfile, options?: ApiOptions): Promise<RecommendationSet> {
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
      isMock: true as const,
    },
    options
  );
}

/** Mengembalikan `null` bila tidak ditemukan (PRD §26: state 404 di Detail). */
export async function getLaptop(slug: string, options?: ApiOptions): Promise<Laptop | null> {
  return respond(laptops.find((l) => l.slug === slug) ?? null, options);
}

export async function getLaptops(ids: string[], options?: ApiOptions): Promise<Laptop[]> {
  const byId = new Map(laptops.map((l) => [l.id, l]));
  return respond(
    ids.map((id) => byId.get(id)).filter((l): l is Laptop => Boolean(l)),
    options
  );
}

/** Skenario persona contoh, untuk switch persona demo di Hasil (PRD §17). */
export async function getScenarios(options?: ApiOptions): Promise<Scenario[]> {
  return respond(scenarios, options);
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
