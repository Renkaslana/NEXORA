"use client"

import * as React from "react"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle"
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning"
import { Button } from "@/components/ui/button"
import { NeedMeter } from "@/components/ui/need-meter"
import { componentForMetric, METRIC_SCALES } from "@/lib/need-meter"
import type { RequirementWarning } from "@/types"

// Banner "budget terlalu rendah" (PRD §16, §26): dua pilihan, naikkan budget atau lanjut
// dengan kompromi. Setelah kompromi dipilih, banner menjadi catatan yang bisa dibatalkan.
// REDESIGN §18: bila mock memberi angka, banner memuat meter "butuh vs terjangkau budget-mu".

interface WarningPanelProps {
  warning: RequirementWarning
  accepted: boolean
  onRaiseBudget: (target: number) => void
  onCompromise: (accepted: boolean) => void
}

export function WarningPanel({ warning, accepted, onRaiseBudget, onCompromise }: WarningPanelProps) {
  const raise = warning.actions.find((a) => a.kind === "raise-budget")
  const compromise = warning.actions.find((a) => a.kind === "compromise")

  // Tombol yang diklik hilang saat state berganti; pindahkan fokus ke tombol penggantinya (PRD §28).
  const undoRef = React.useRef<HTMLButtonElement>(null)
  const compromiseRef = React.useRef<HTMLButtonElement>(null)
  const changed = React.useRef(false)
  React.useEffect(() => {
    if (!changed.current) return
    ;(accepted ? undoRef : compromiseRef).current?.focus()
  }, [accepted])
  const toggle = (next: boolean) => {
    changed.current = true
    onCompromise(next)
  }

  if (accepted) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-card bg-surface p-4 sm:flex-row sm:items-center md:p-5">
        <CheckCircleIcon weight="fill" className="size-5 shrink-0 text-success" aria-hidden="true" />
        <p className="flex-1 type-small font-normal text-text">
          <strong className="font-semibold">Kamu memilih kompromi:</strong> {warning.compromiseNote}
        </p>
        <Button ref={undoRef} variant="ghost" size="sm" className="self-start sm:self-center" onClick={() => toggle(false)}>
          Batalkan kompromi
        </Button>
      </div>
    )
  }

  return (
    <section
      aria-labelledby={`warning-${warning.id}`}
      className="flex flex-col gap-4 rounded-card bg-warning/8 p-4 md:p-5 lg:flex-row lg:items-start"
    >
      <WarningIcon weight="fill" className="size-6 shrink-0 text-warning" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-1">
        <h2 id={`warning-${warning.id}`} className="type-body font-semibold text-text">
          <span className="sr-only">Peringatan: </span>
          {warning.message}
        </h2>
        <p className="type-small font-normal text-text">{warning.detail}</p>
        {warning.meter && (
          <NeedMeter
            component={componentForMetric(warning.meter.metric)}
            label={`Yang terjangkau budget-mu`}
            scale={METRIC_SCALES[warning.meter.metric]}
            need={warning.meter.need}
            value={warning.meter.affordable}
            size="compact"
            className="mt-3 max-w-md rounded-control bg-bg p-3"
          />
        )}
      </div>
      <div className="flex flex-wrap gap-2 lg:shrink-0">
        {raise?.targetBudget && (
          <Button variant="secondary" size="sm" onClick={() => onRaiseBudget(raise.targetBudget!)}>
            {raise.label}
          </Button>
        )}
        {compromise && (
          <Button ref={compromiseRef} variant="ghost" size="sm" onClick={() => toggle(true)}>
            {compromise.label}
          </Button>
        )}
      </div>
    </section>
  )
}
