"use client"

import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle"
import { RequirementCard } from "@/components/profile/requirement-card"
import { LaptopCard } from "@/components/results/laptop-card"
import { getOptionIcon } from "@/components/wizard/option-icon"
import { SelectCard } from "@/components/wizard/select-card"
import { Stepper } from "@/components/wizard/stepper"
import { formatRupiahShort } from "@/lib/format"
import type { LandingSample } from "@/components/landing/sample-data"

// Cuplikan UI asli untuk "Cara kerja" (PRD §11: tunjukkan, bukan klaim; §13).
// Ilustratif: `inert` agar tidak masuk urutan Tab; isinya dijelaskan oleh teks di sekitarnya.

const steps = [
  { id: "budget", label: "Budget" },
  { id: "jurusan", label: "Jurusan" },
  { id: "aktivitas", label: "Aktivitas" },
  { id: "software", label: "Software" },
  { id: "prioritas", label: "Prioritas" },
]

export function WizardSnippet({ sample }: { sample: LandingSample }) {
  const shown = sample.activities.filter((a) => ["programming", "uiux", "desain-grafis", "office"].includes(a.id))
  return (
    <div inert data-ui className="flex flex-col gap-4">
      <Stepper steps={steps} current={2} variant="bar" />
      <p className="type-body font-semibold text-text">Laptop ini akan dipakai untuk apa?</p>
      <div className="grid grid-cols-2 gap-2">
        {shown.map((a) => (
          <SelectCard
            key={a.id}
            mode="multi"
            size="sm"
            icon={getOptionIcon(a.icon)}
            title={a.label}
            selected={sample.profile.activities.includes(a.id)}
            primary={sample.profile.primaryActivity === a.id}
          />
        ))}
      </div>
    </div>
  )
}

export function RequirementSnippet({ sample }: { sample: LandingSample }) {
  return (
    <div inert data-ui>
      <RequirementCard
        requirement={sample.requirement}
        profileChips={[`Budget ${formatRupiahShort(sample.profile.budget.max)}`, sample.majorLabel]}
        only={["cpu", "ram", "storage"]}
        className="border-0 p-0"
      />
    </div>
  )
}

export function ResultSnippet({ sample }: { sample: LandingSample }) {
  const { laptop, result } = sample.best
  return (
    <div inert data-ui className="flex flex-col gap-3">
      <LaptopCard variant="compact" laptop={laptop} result={result} animateScore={false} />
      <ul className="flex flex-col gap-2 px-1">
        {result.reasons.slice(1, 3).map((r) => (
          <li key={r.text} className="flex gap-2 type-small font-normal text-text">
            <CheckCircleIcon weight="fill" className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            <span>
              {r.text}
              <span className="block type-micro text-text-muted">{r.source}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
