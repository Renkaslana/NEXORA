import { cacheLife } from "next/cache";
import {
  getLandingContent,
  getLaptops,
  getRecommendations,
  getRequirements,
  getSampleProfile,
  getWizardOptions,
} from "@/lib/api";
import { landingMeterRows } from "@/lib/need-meter";
import type { BudgetPresetId, RequirementProfile } from "@/types";

/**
 * ARSIP: data landing R2 "Live Spec", hanya dipakai halaman arsip /dev/landing-a|b dan snippets.
 * Landing aktif memakai `sample-data.ts`. Data contoh landing, lewat `lib/api.ts`. `use cache` membuat jeda palsu terjadi sekali saat
 * build, sehingga halaman tetap prerender statis tanpa skeleton: profil kelima preset budget
 * hero, kasus "Spek saja tidak menjawab", dan kebutuhan khas tiap persona (REDESIGN §15–16).
 */
export async function getArchiveLandingSample() {
  "use cache";
  cacheLife("max");

  const profile = getSampleProfile("teknik");
  const options = getWizardOptions();
  const content = getLandingContent();

  const [requirement, recommendations, presetEntries, caseLaptops] = await Promise.all([
    getRequirements(profile),
    getRecommendations(profile),
    Promise.all(
      options.budgetPresets.map(
        async (p) =>
          [p.id, await getRequirements({ ...profile, budget: { ...profile.budget, max: p.value } })] as const
      )
    ),
    getLaptops(content.cases.map((c) => c.laptopId)),
  ]);

  const majorLabel = (id: string) => options.majors.find((m) => m.id === id)?.label ?? id;
  const softwareLabels = profile.software
    .map((id) => options.software.find((s) => s.id === id)?.label ?? id)
    .slice(0, 2);
  const spec = (c: string) => requirement.specs.find((s) => s.component === c)!;

  const cases = await Promise.all(
    content.cases.map(async (c) => {
      const laptop = caseLaptops.find((l) => l.id === c.laptopId)!;
      const caseRequirement = await getRequirements(getSampleProfile(c.persona));
      return {
        ...c,
        laptop: { name: `${laptop.brand} ${laptop.model}`, image: laptop.image, priceIdr: laptop.priceIdr },
        meters: landingMeterRows(c.rows, caseRequirement, laptop),
      };
    })
  );

  const personas = await Promise.all(
    options.personas.map(async (p) => {
      const personaProfile = getSampleProfile(p.id);
      const personaRequirement = await getRequirements(personaProfile);
      return {
        ...p,
        major: personaProfile.major,
        majorLabel: majorLabel(personaProfile.major),
        budgetMax: personaProfile.budget.max,
        meters: landingMeterRows(content.personaHighlights[p.id], personaRequirement),
      };
    })
  );

  return {
    profile,
    majorLabel: majorLabel(profile.major),
    softwareLabels,
    requirement,
    presetRequirements: Object.fromEntries(presetEntries) as Record<BudgetPresetId, RequirementProfile>,
    ram: spec("ram"),
    storage: spec("storage"),
    best: recommendations.items[0],
    alternatives: recommendations.items.slice(1, 3),
    activities: options.activities,
    budgetPresets: options.budgetPresets,
    cases,
    personas,
  };
}

export type ArchiveLandingSample = Awaited<ReturnType<typeof getArchiveLandingSample>>;
