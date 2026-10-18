import { cacheLife } from "next/cache";
import { getRecommendations, getRequirements, getSampleProfile, getWizardOptions } from "@/lib/api";

/**
 * Data contoh untuk hero & "Cara kerja" landing statis (A, B), lewat `lib/api.ts`.
 * `use cache` membuat jeda palsu terjadi sekali saat build, sehingga halaman tetap
 * prerender statis tanpa skeleton di hero.
 */
export async function getLandingSample() {
  "use cache";
  cacheLife("max");

  const profile = getSampleProfile("teknik");
  const [requirement, recommendations] = await Promise.all([getRequirements(profile), getRecommendations(profile)]);
  const options = getWizardOptions();

  const majorLabel = options.majors.find((m) => m.id === profile.major)?.label ?? profile.major;
  const softwareLabels = profile.software
    .map((id) => options.software.find((s) => s.id === id)?.label ?? id)
    .slice(0, 2);
  const spec = (c: string) => requirement.specs.find((s) => s.component === c)!;

  return {
    profile,
    majorLabel,
    softwareLabels,
    requirement,
    ram: spec("ram"),
    storage: spec("storage"),
    best: recommendations.items[0],
    alternatives: recommendations.items.slice(1, 3),
    activities: options.activities,
    budgetPresets: options.budgetPresets,
  };
}

export type LandingSample = Awaited<ReturnType<typeof getLandingSample>>;
