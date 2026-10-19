import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { getLandingSample } from "@/components/landing/sample-data";
import { ClosingCta, HowItWorks, PersonaEntry, SpecIsNotEnough, TrustBand } from "@/components/landing/sections";

// Landing redesign "Live Spec" (REDESIGN §15–16; PRD §8, §12–14). Urutan: hero (dengan Garis
// Kebutuhan yang bereaksi ke budget) → spek saja tidak menjawab → cerita ter-pin → persona →
// band gelap → CTA penutup.

export default async function Home() {
  const sample = await getLandingSample();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <LandingHero
          presetRequirements={sample.presetRequirements}
          bestMatch={{
            matchScore: sample.best.result.matchScore,
            laptopName: `${sample.best.laptop.brand} ${sample.best.laptop.model}`,
          }}
          majorLabel={sample.majorLabel}
          softwareLabels={sample.softwareLabels}
        />
        <SpecIsNotEnough sample={sample} />
        <HowItWorks sample={sample} />
        <PersonaEntry sample={sample} />
        <TrustBand />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
