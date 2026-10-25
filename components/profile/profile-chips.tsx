"use client"

import Link from "next/link"
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple"
import { stepHref } from "@/components/wizard/steps"
import { getWizardOptions } from "@/lib/api"
import { formatRupiah } from "@/lib/format"
import type { WizardStepId } from "@/store/profile"
import type { UserProfile } from "@/types"

// Ringkasan profil di atas Profil Kebutuhan (PRD §16): chip yang bisa diklik untuk mengedit
// langkah terkait. Contoh: Budget Rp8.000.000 · Informatika · Utama: Programming · Prioritas: Performa + Ringan.

const options = getWizardOptions()
const labelOf = <T extends { id: string; label: string }>(list: T[], id: string) =>
  list.find((x) => x.id === id)?.label ?? id

export function profileChipItems(profile: UserProfile): { step: WizardStepId; label: string; text: string }[] {
  const priorityLabel = (c: string) => options.priorities.find((p) => p.criterion === c)?.label ?? c
  const extra = profile.activities.filter((a) => a !== profile.primaryActivity)
  const items: { step: WizardStepId; label: string; text: string }[] = [
    {
      step: "budget",
      label: "budget",
      text: `Budget ${formatRupiah(profile.budget.max)}${profile.budget.flexible ? " ±10%" : ""}`,
    },
    { step: "jurusan", label: "jurusan", text: labelOf(options.majors, profile.major) },
  ]
  if (profile.primaryActivity) {
    items.push({ step: "aktivitas", label: "aktivitas", text: `Utama: ${labelOf(options.activities, profile.primaryActivity)}` })
  }
  if (extra.length) {
    items.push({
      step: "aktivitas",
      label: "aktivitas tambahan",
      text: `Tambahan: ${extra.map((a) => labelOf(options.activities, a)).join(", ")}`,
    })
  }
  if (profile.software.length) {
    items.push({
      step: "software",
      label: "software",
      text: `Software: ${profile.software.map((s) => labelOf(options.software, s)).join(", ")}`,
    })
  }
  if (profile.priorities.length) {
    items.push({
      step: "prioritas",
      label: "prioritas",
      text: `Prioritas: ${profile.priorities
        .slice(0, 3)
        .map((p) => priorityLabel(p.criterion))
        .join(" + ")}`,
    })
  }
  return items
}

export function ProfileChips({ profile }: { profile: UserProfile }) {
  // Mobile: satu baris yang bisa di-scroll ke samping (seperti chip preset di landing, PRD §13).
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:overflow-visible md:px-0 md:pb-0">
      <ul className="flex w-max gap-2 md:w-auto md:flex-wrap" aria-label="Ringkasan jawabanmu">
        {profileChipItems(profile).map((item) => (
          <li key={`${item.step}-${item.label}`}>
            <Link
              href={stepHref(item.step)}
              aria-label={`${item.text}. Ubah ${item.label}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-bg px-4 py-2 type-small whitespace-nowrap text-text transition-colors duration-150 hover:border-primary hover:bg-primary-soft hover:text-primary"
            >
              {item.text}
              <PencilSimpleIcon weight="bold" className="size-3.5 shrink-0 text-text-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
