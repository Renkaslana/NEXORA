import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StepContent } from "@/components/wizard/step-content";
import { isWizardStep, wizardSteps } from "@/components/wizard/steps";

// /rekomendasi/budget | jurusan | aktivitas | software | prioritas (PRD §8, §30)

type Params = Promise<{ step: string }>;

export function generateStaticParams() {
  return wizardSteps.map((s) => ({ step: s.id }));
}

// Metadata statis: generateMetadata yang membaca params memblokir prefetch (Next 16).
// Judul tab per langkah dirender oleh WizardShell.
export const metadata: Metadata = { title: "Rekomendasi · SPECO" };

// params di-await di dalam <Suspense> agar navigasi antar langkah tetap instan
// (lihat node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md).
export default function WizardStepPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={null}>
      <Step params={params} />
    </Suspense>
  );
}

async function Step({ params }: { params: Params }) {
  const { step } = await params;
  if (!isWizardStep(step)) notFound();
  return <StepContent step={step} />;
}
