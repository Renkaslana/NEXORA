"use client"

import { FeedbackLine } from "@/components/wizard/feedback-line"
import { getPersonaForMajor, getWizardOptions } from "@/lib/api"
import { useProfileStore, type WizardStepId } from "@/store/profile"

// Umpan balik kontekstual per langkah (REDESIGN §17). Budget punya umpan baliknya sendiri di
// BudgetSlider. Semua teks dirangkai dari data statis di data/options.ts, tanpa perhitungan.

const options = getWizardOptions()

function useFeedback(step: WizardStepId): { key: string; lead?: string; text: string } | null {
  const profile = useProfileStore((s) => s.profile)

  switch (step) {
    case "jurusan": {
      if (!profile.major) return null
      const persona = options.personas.find((p) => p.id === getPersonaForMajor(profile.major))
      if (!persona) return null
      return { key: persona.id, lead: `Biasanya ${persona.label.toLowerCase()} butuh`, text: `${persona.needs}.` }
    }
    case "aktivitas": {
      const chosen = options.activities.filter((a) => profile.activities.includes(a.id))
      if (!chosen.length) return null
      const main = chosen.find((a) => a.id === profile.primaryActivity) ?? chosen[0]
      const names = [main, ...chosen.filter((a) => a.id !== main.id)].map((a) => a.label)
      return { key: names.join("+"), lead: names.slice(0, 3).join(" + "), text: main.feedback }
    }
    case "software": {
      const chosen = options.software.filter((s) => profile.software.includes(s.id))
      if (!chosen.length) return null
      const heavy = chosen.filter((s) => s.load === "berat")
      if (heavy.length) {
        return {
          key: `berat-${heavy.length}`,
          lead: `${heavy.length} aplikasi berat (${heavy.map((s) => s.label).join(", ")})`,
          text: "Aplikasi berat yang jalan bersamaan paling terasa di RAM; 16 GB jadi titik aman.",
        }
      }
      return {
        key: "ringan",
        lead: "Aplikasimu tergolong ringan–sedang",
        text: "Spek menengah sudah cukup; yang lebih terasa nanti baterai dan bobot.",
      }
    }
    case "prioritas": {
      const top =
        profile.priorityMode === "weights"
          ? [...profile.priorities].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))[0]
          : profile.priorities.find((p) => p.rank === 1)
      const priority = top && options.priorities.find((p) => p.criterion === top.criterion)
      if (!priority) return null
      return { key: priority.id, lead: `Prioritas utama: ${priority.label}`, text: priority.feedback }
    }
    default:
      return null
  }
}

export function StepFeedback({ step }: { step: WizardStepId }) {
  const feedback = useFeedback(step)
  // Wilayah aria-live selalu ada agar umpan balik pertama pun diumumkan.
  return (
    <div aria-live="polite">
      {feedback && (
        <FeedbackLine live={false} contentKey={`${step}-${feedback.key}`}>
          {feedback.lead && <p className="type-small text-text">{feedback.lead}</p>}
          <p className="type-body text-text-muted">{feedback.text}</p>
        </FeedbackLine>
      )}
    </div>
  )
}
