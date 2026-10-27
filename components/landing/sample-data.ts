import { cacheLife } from "next/cache";
import {
  getCatalogPreview,
  getLandingStoryContent,
  getLaptops,
  getRecommendations,
  getRequirements,
  getSampleProfile,
  getWizardOptions,
} from "@/lib/api";
import { landingMeterRows } from "@/lib/need-meter";
import { checkSpecs } from "@/lib/spec-check";
import type { Laptop, LandingMeterRef, RequirementProfile } from "@/types";

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

/** Laptop lolos bila tidak ada ambang yang kurang dan harganya dalam budget (+10% toleransi). */
function passes(requirement: RequirementProfile, laptop: Laptop, budget: number) {
  return laptop.priceIdr <= budget * 1.1 && checkSpecs(requirement, laptop).every((c) => c.status !== "short")
}

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

  // ------------------------------------------------ Demo "Budget sama, kebutuhan berbeda"
  const activities = await Promise.all(
    story.activities.map(async (a) => {
      const req = a.persona
        ? await getRequirements({ ...getSampleProfile(a.persona), budget: { min: 0, max: story.demoBudget, flexible: true } })
        : story.gamingRequirement
      const passing = catalog
        .filter((l) => passes(req, l, story.demoBudget))
        .sort((x, y) => x.priceIdr - y.priceIdr)
      const cheapest = passing[0]
      return {
        id: a.id,
        label: a.label,
        factors: a.factors,
        summary: req.summary,
        meters: landingMeterRows(SPEC_ROWS, req),
        passCount: passing.length,
        example: cheapest ? { name: `${cheapest.brand} ${cheapest.model}`, priceIdr: cheapest.priceIdr } : null,
        note:
          passing.length === 0
            ? a.id === "gaming"
              ? story.gamingNote
              : (req.warnings[0]?.message ?? "Belum ada laptop di katalog contoh yang memenuhi semua ambang di budget ini.")
            : null,
      }
    })
  )

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
    activities,
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
