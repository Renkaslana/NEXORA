import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ClosingCta } from "@/components/landing/closing-cta";
import { LandingHero } from "@/components/landing/landing-hero";
import { getLandingSample } from "@/components/landing/sample-data";
import { BudgetTiers, HowItWorks, PersonaEntry, SpecIsNotEnough, TrustBand } from "@/components/landing/sections";
import { SoftwareSentence } from "@/components/landing/software-sentence";

// Landing redesign "Kalimat terbelah" (disetujui Fahren, Okt 2026; isi PRD §8, §12–14). Urutan:
// hero kobalt (kalimat dibelah bingkai render) → "Laptop buat ___" (interaksi utama) → etalase
// vs kebutuhan → lima pertanyaan + cerita ter-pin → batas tiap budget → persona → bukan toko →
// CTA kalimat dengan isian.

export default async function Home() {
  const sample = await getLandingSample();

  return (
    <>
      <Navbar tone="cobalt" />
      <main className="flex-1">
        <LandingHero />
        <SoftwareSentence />
        <SpecIsNotEnough sample={sample} />
        <HowItWorks sample={sample} />
        <BudgetTiers sample={sample} />
        <PersonaEntry sample={sample} />
        <TrustBand />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
