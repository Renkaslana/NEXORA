import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { getLandingSample } from "@/components/landing/sample-data";
import { ClosingCta, HowItWorks, PersonaEntry, TrustStrip } from "@/components/landing/sections";

// Landing final (PRD §8, §12–14). Arah: varian A (Hybrid) + preview langsung dari varian C,
// dipilih Fahren setelah eksplorasi di /dev/landing-a|b|c.

export default async function Home() {
  const sample = await getLandingSample();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <LandingHero
          defaultRequirement={sample.requirement}
          bestMatch={{
            matchScore: sample.best.result.matchScore,
            laptopName: `${sample.best.laptop.brand} ${sample.best.laptop.model}`,
          }}
          majorLabel={sample.majorLabel}
          softwareLabels={sample.softwareLabels}
        />
        <HowItWorks sample={sample} />
        <PersonaEntry />
        <TrustStrip />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
