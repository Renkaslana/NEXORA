"use client"

import Link from "next/link"
import { cn } from "cn"
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown"
import { stepHref } from "@/components/wizard/steps"
import { getWizardOptions } from "@/lib/api"
import { formatRupiah } from "@/lib/format"
import { useProfileStore, type WizardStepId } from "@/store/profile"

// Panel "Profil kamu sejauh ini" (PRD §15, §25): terisi setiap langkah selesai, item baru
// masuk dengan highlight singkat. Desktop: panel kanan. Mobile: ringkasan yang bisa dibuka.

const options = getWizardOptions()
const labelOf = <T extends { id: string; label: string }>(list: T[], id: string) =>
  list.find((x) => x.id === id)?.label ?? id

export interface Row {
  step: WizardStepId
  label: string
  value: string | null
}

export function useRows(current: WizardStepId): Row[] {
  const profile = useProfileStore((s) => s.profile)
  const answered = useProfileStore((s) => s.answered)
  const shown = (step: WizardStepId) => answered.includes(step) || step === current

  const primary = profile.primaryActivity
  const activities = profile.activities.length
    ? [
        ...(primary ? [`${labelOf(options.activities, primary)} (utama)`] : []),
        ...profile.activities.filter((a) => a !== primary).map((a) => labelOf(options.activities, a)),
      ].join(", ")
    : null

  const software = profile.software.length
    ? profile.software
        .slice(0, 4)
        .map((s) => labelOf(options.software, s))
        .join(", ") + (profile.software.length > 4 ? ` +${profile.software.length - 4}` : "")
    : answered.includes("software")
      ? "Dilewati"
      : null

  const priorityLabel = (c: string) => options.priorities.find((p) => p.criterion === c)?.label ?? c
  const priorities = profile.priorities.length
    ? profile.priorityMode === "weights"
      ? "Bobot detail: " +
        profile.priorities
          .slice(0, 3)
          .map((p) => `${priorityLabel(p.criterion)} ${p.weight}%`)
          .join(", ")
      : profile.priorities.map((p) => `${p.rank}. ${priorityLabel(p.criterion)}`).join(" · ")
    : answered.includes("prioritas")
      ? "Dilewati"
      : null
  const filters = profile.hardFilters.length
    ? `Syarat wajib: ${profile.hardFilters.map((f) => labelOf(options.hardFilters, f)).join(", ")}`
    : ""

  return [
    {
      step: "budget",
      label: "Budget",
      value: shown("budget")
        ? `${formatRupiah(profile.budget.max)}${profile.budget.flexible ? " · fleksibel ±10%" : ""}`
        : null,
    },
    { step: "jurusan", label: "Jurusan", value: profile.major ? labelOf(options.majors, profile.major) : null },
    { step: "aktivitas", label: "Aktivitas", value: activities },
    { step: "software", label: "Software", value: software },
    {
      step: "prioritas",
      label: "Prioritas",
      value: priorities || filters ? [priorities, filters].filter(Boolean).join(" · ") : null,
    },
  ]
}

export function RowList({ rows, current }: { rows: Row[]; current: WizardStepId }) {
  return (
    <dl className="flex flex-col divide-y divide-border">
      {rows.map((r) => (
        <div key={r.step} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div className="flex min-w-0 flex-col gap-0.5">
            <dt className="type-micro text-text-muted">{r.label}</dt>
            <dd
              key={r.value ?? "kosong"}
              className={cn(
                "-mx-1 rounded-control px-1 type-small",
                r.value ? "animate-flash text-text" : "font-normal text-text-muted"
              )}
            >
              {r.value ?? "Belum diisi"}
            </dd>
          </div>
          {r.value && r.step !== current && (
            <Link
              href={stepHref(r.step)}
              className="inline-flex min-h-11 shrink-0 items-center rounded-control px-2 type-small text-primary hover:underline"
              aria-label={`Ubah ${r.label.toLowerCase()}`}
            >
              Ubah
            </Link>
          )}
        </div>
      ))}
    </dl>
  )
}

export function ProfileSummary({ current }: { current: WizardStepId }) {
  const rows = useRows(current)
  return (
    <section aria-labelledby="summary-title" className="flex flex-col gap-4 rounded-card bg-surface p-5">
      <h2 id="summary-title" className="type-small text-text">
        Profil kamu sejauh ini
      </h2>
      <RowList rows={rows} current={current} />
    </section>
  )
}

export function ProfileSummaryMobile({ current }: { current: WizardStepId }) {
  const rows = useRows(current)
  const filled = rows.filter((r) => r.value)
  return (
    <details className="group rounded-card bg-surface">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-col">
          <span className="type-small text-text">Profil kamu sejauh ini</span>
          <span className="truncate type-micro text-text-muted">
            {filled.length ? filled.map((r) => r.value).join(" · ") : "Belum ada yang diisi"}
          </span>
        </span>
        <CaretDownIcon weight="bold" className="size-5 shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="px-4 pb-4">
        <RowList rows={rows} current={current} />
      </div>
    </details>
  )
}

