import { Footer } from "@/components/layout/footer";
import { FinalCta } from "@/components/landing/final-cta";
import { HeroToneProvider } from "@/components/landing/hero-tone";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InteractiveBudget } from "@/components/landing/interactive-budget";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { NotAStore } from "@/components/landing/not-a-store";
import { QuestionnairePreview } from "@/components/landing/questionnaire-preview";
import { RecommendationStory } from "@/components/landing/recommendation-story";
import { getLandingSample } from "@/components/landing/sample-data";
import { SawTransparency } from "@/components/landing/saw-transparency";

// Landing SPECO "Editorial Tech × Product Recommendation" (brief redesign landing, disetujui Fahren Okt 2026;
// isi PRD §6, §12–14, §27). Alur cerita: hero (kisaran budget) → masalah: budget sama, kebutuhan beda →
// cara kerja → coba 5 pertanyaan → rekomendasi (sticky, skor naik) → transparansi bobot → bukan toko →
// CTA akhir. UI netral hangat; foto = warna, kuning = aksi utama, biru = data.

export default async function Home() {
  const sample = await getLandingSample();

  return (
    <HeroToneProvider>
      <LandingNav />
      <main className="flex-1 bg-canvas">
        <LandingHero />
        <InteractiveBudget sample={sample} />
        <HowItWorks />
        <QuestionnairePreview />
        <RecommendationStory sample={sample} />
        <SawTransparency sample={sample} />
        <NotAStore sample={sample} />
        <FinalCta />
      </main>
      <Footer />
    </HeroToneProvider>
  );
}
