"use client"

import { ActivityStep, BudgetStep, MajorStep } from "@/components/wizard/step-basics"
import { PriorityStep, SoftwareStep } from "@/components/wizard/step-preferences"
import type { WizardStepId } from "@/store/profile"

const steps: Record<WizardStepId, () => React.JSX.Element> = {
  budget: BudgetStep,
  jurusan: MajorStep,
  aktivitas: ActivityStep,
  software: SoftwareStep,
  prioritas: PriorityStep,
}

export function StepContent({ step }: { step: WizardStepId }) {
  const Step = steps[step]
  return <Step />
}
