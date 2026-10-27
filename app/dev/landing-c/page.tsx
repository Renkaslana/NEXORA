import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Consultation } from "./consultation";

// Varian C — Konsultasi (PRD §12 Concept C): pertanyaan "Berapa budget-mu?" langsung di hero,
// preset budget, dan preview Profil Kebutuhan (Informatika) yang berubah saat preset dipilih.

export const metadata: Metadata = { title: "Landing C — Konsultasi · SPECO (dev)" };

export default function LandingC() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Consultation />
      </main>
      <Footer />
    </>
  );
}
