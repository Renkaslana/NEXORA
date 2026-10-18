import { WizardShell } from "@/components/wizard/wizard-shell";

// Route group Wizard: shell tetap terpasang saat berpindah antar 5 langkah (PRD §15).
// Halaman /rekomendasi/profil, /analisis, /hasil nanti berada di luar group ini.
export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return <WizardShell>{children}</WizardShell>;
}
