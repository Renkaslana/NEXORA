import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StepContent } from "@/components/wizard/step-content";
import { isWizardStep, wizardSteps } from "@/components/wizard/steps";

// /rekomendasi/budget | jurusan | aktivitas | software | prioritas (PRD §8, §30)

type Props = { params: Promise<{ step: string }> };

export function generateStaticParams() {
  return wizardSteps.map((s) => ({ step: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { step } = await params;
  const label = wizardSteps.find((s) => s.id === step)?.label ?? "Rekomendasi";
  return { title: `${label} · Rekomendasi · NEXORA` };
}

export default async function WizardStepPage({ params }: Props) {
  const { step } = await params;
  if (!isWizardStep(step)) notFound();
  return <StepContent step={step} />;
}
