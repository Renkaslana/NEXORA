import { cacheLife } from "next/cache";
import {
  getBudgetPreviewContent,
  getCatalogPreview,
  getLandingStoryContent,
  getLaptops,
  getRecommendations,
  getRequirements,
  getSampleProfile,
  getWizardOptions,
} from "@/lib/api";
import { landingMeterRows } from "@/lib/need-meter";
import type { BudgetNeedId, LandingMeterRef } from "@/types";

/**
 * Data landing "Editorial Tech" (brief redesign landing, disetujui Fahren Okt 2026), lewat `lib/api.ts`.
 * `use cache` membuat jeda palsu terjadi sekali saat build, jadi `/` tetap prerender statis tanpa
 * skeleton. Tidak ada perhitungan SAW: skor dan bobot diambil apa adanya dari hasil mock, dan demo
 * aktivitas hanya membandingkan spek laptop dengan ambang Profil Kebutuhan (≥ min, seperti daftar periksa).
 */

const SPEC_ROWS: LandingMeterRef[] = [
  { kind: "spec", component: "cpu" },
  { kind: "spec", component: "ram" },
  { kind: "spec", component: "storage" },
  { kind: "spec", component: "gpu" },
]

export async function getLandingSample() {
  "use cache"
  cacheLife("max")

  const options = getWizardOptions()
  const story = getLandingStoryContent()
  const profile = getSampleProfile("teknik")

  const [requirement, recommendations, catalog] = await Promise.all([
    getRequirements(profile),
    getRecommendations(profile),
    getLaptops(getCatalogPreview().map((l) => l.id)),
  ])

  // ------------------------------------------------ Pratinjau "Satu budget. Banyak kemungkinan."
  const preview = getBudgetPreviewContent()
  const budgetPreview = {
    needs: preview.needs,
    range: preview.range,
    laptops: catalog.map((l) => ({
      id: l.id,
      slug: l.slug,
      name: `${l.brand} ${l.model}`,
      priceIdr: l.priceIdr,
      image: l.image,
      cpu: l.cpu.name,
      ramGb: l.ram.gb,
      storageGb: l.storage.gb,
      gpu: l.gpu.name,
      fit: Object.fromEntries(preview.needs.map((n) => [n.id, preview.fit[n.id][l.id] ?? 0])) as Record<BudgetNeedId, number>,
    })),
  }

  // ------------------------------------------------ Contoh rekomendasi (Best Match profil Informatika Rp8 jt)
  const best = recommendations.items[0]
  const label = (id: string) => options.criterionLabels[id as keyof typeof options.criterionLabels] ?? id
  const breakdown = [...best.result.breakdown]
    .sort((a, b) => b.weight - a.weight)
    .map((b) => ({ ...b, label: label(b.criterion), hint: story.criterionHints[b.criterion] }))

  const majorLabel = options.majors.find((m) => m.id === profile.major)?.label ?? profile.major
  const softwareLabels = profile.software.map((id) => options.software.find((s) => s.id === id)?.label ?? id)
  const activityLabel = options.activities.find((a) => a.id === profile.primaryActivity)?.label ?? ""

  return {
    demoBudget: story.demoBudget,
    budgetPreview,
    profile: {
      budget: profile.budget.max,
      majorLabel,
      activityLabel,
      softwareLabels,
      priorityCount: profile.priorities.length,
    },
    requirementSummary: requirement.summary,
    best: {
      laptop: {
        name: `${best.laptop.brand} ${best.laptop.model}`,
        slug: best.laptop.slug,
        image: best.laptop.image,
        priceIdr: best.laptop.priceIdr,
        cpu: best.laptop.cpu.name,
        ramGb: best.laptop.ram.gb,
        storageGb: best.laptop.storage.gb,
        gpu: best.laptop.gpu.name,
        display: `${String(best.laptop.display.inch).replace(".", ",")}″ ${best.laptop.display.panel} ${best.laptop.display.resolution}`,
      },
      matchScore: best.result.matchScore,
      reasons: best.result.reasons.slice(0, 3).map((r) => r.text),
      meters: landingMeterRows(SPEC_ROWS.slice(0, 3), requirement, best.laptop),
      result: best.result,
    },
    breakdown,
    catalogSize: catalog.length,
    resultCount: recommendations.items.length,
  }
}

export type LandingSample = Awaited<ReturnType<typeof getLandingSample>>
