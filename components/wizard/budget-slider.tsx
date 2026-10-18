"use client"

import * as React from "react"
import { cn } from "cn"
import { Slider } from "@/components/ui/slider"
import { formatRupiah, formatRupiahShort, rupiahToWords } from "@/lib/format"
import type { BudgetPreset } from "@/types"

// PRD §23 Budget Slider ★: Default, Dragging, Dengan preset chip, Dengan feedback.
// PRD §15 step 1: Rp3–30 jt+, langkah Rp500 rb, input manual, 5 preset, toggle ±10%.
// PRD §28: aria-valuetext dalam Rupiah, jumlah laptop diumumkan via aria-live.

interface BudgetSliderProps {
  value: number
  onValueChange: (value: number) => void
  range: { min: number; max: number; step: number }
  presets?: BudgetPreset[]
  flexible?: boolean
  onFlexibleChange?: (flexible: boolean) => void
  feedback?: { typicalSpec: string; laptopCount: number }
  showInput?: boolean
  className?: string
}

const digitsOnly = (s: string) => Number(s.replace(/\D/g, "") || 0)

function BudgetSlider({
  value,
  onValueChange,
  range,
  presets,
  flexible,
  onFlexibleChange,
  feedback,
  showInput = true,
  className,
}: BudgetSliderProps) {
  const id = React.useId()
  const [dragging, setDragging] = React.useState(false)
  const [draft, setDraft] = React.useState<string | null>(null)

  const clampSnap = (v: number) => {
    const snapped = Math.round(v / range.step) * range.step
    return Math.min(range.max, Math.max(range.min, snapped))
  }

  const commitDraft = () => {
    if (draft !== null) onValueChange(clampSnap(digitsOnly(draft)))
    setDraft(null)
  }

  const activePreset = presets?.find((p) => value >= p.min && value < p.max) ?? presets?.at(-1)
  const isMax = value >= range.max

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span id={`${id}-label`} className="type-small text-text-muted">
            Budget maksimal
          </span>
          <output
            htmlFor={`${id}-input`}
            aria-hidden="true"
            className={cn(
              "num type-h2 font-semibold text-text transition-colors duration-150",
              dragging && "text-primary"
            )}
          >
            {formatRupiah(value)}
            {isMax && "+"}
          </output>
        </div>
        {showInput && (
          <label className="flex flex-col gap-1">
            <span className="type-small text-text-muted">Atau ketik angka</span>
            <span className="flex h-11 items-center rounded-control border border-border bg-bg px-3 focus-within:border-primary">
              <span className="type-small text-text-muted" aria-hidden="true">
                Rp
              </span>
              <input
                id={`${id}-input`}
                inputMode="numeric"
                autoComplete="off"
                className="num w-28 bg-transparent pl-1.5 text-right text-text outline-none"
                value={draft ?? new Intl.NumberFormat("id-ID").format(value)}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitDraft}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitDraft()
                }}
                aria-describedby={`${id}-hint`}
              />
            </span>
            <span id={`${id}-hint`} className="sr-only">
              Antara {rupiahToWords(range.min)} dan {rupiahToWords(range.max)}, kelipatan {rupiahToWords(range.step)}
            </span>
          </label>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Slider
          value={[value]}
          min={range.min}
          max={range.max}
          step={range.step}
          onValueChange={([v]) => {
            setDragging(true)
            onValueChange(v)
          }}
          onValueCommit={() => setDragging(false)}
          onPointerUp={() => setDragging(false)}
          thumbLabel="Budget maksimal"
          getValueText={(v) => rupiahToWords(v) + (v >= range.max ? " atau lebih" : "")}
          className="py-2.5"
        />
        <div className="flex justify-between type-micro text-text-muted" aria-hidden="true">
          <span className="num">{formatRupiahShort(range.min)}</span>
          <span className="num">{formatRupiahShort(range.max)}+</span>
        </div>
      </div>

      {presets && presets.length > 0 && (
        <div role="group" aria-label="Preset budget" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="flex w-max gap-2 md:w-auto md:flex-wrap">
            {presets.map((p) => {
              const selected = activePreset?.id === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onValueChange(p.value)}
                  className={cn(
                    "h-11 shrink-0 rounded-full border px-4 type-small transition-colors duration-150",
                    selected
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-bg text-text hover:border-border-strong hover:bg-surface"
                  )}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {onFlexibleChange && (
        <label className="flex min-h-11 cursor-pointer items-center gap-3 self-start">
          <input
            type="checkbox"
            checked={Boolean(flexible)}
            onChange={(e) => onFlexibleChange(e.target.checked)}
            className="size-5 accent-primary"
          />
          <span className="type-small text-text">Budget fleksibel ± 10%</span>
        </label>
      )}

      {feedback && (
        <div className="flex flex-col gap-1 rounded-card bg-surface p-4" aria-live="polite">
          <p className="type-small font-normal text-text-muted">Di kisaran ini biasanya kamu dapat:</p>
          <p className="type-body font-semibold text-text">{feedback.typicalSpec}</p>
          <p className="type-small text-text-muted">
            ± <span className="num text-text">{feedback.laptopCount}</span> laptop di katalog
          </p>
        </div>
      )}
    </div>
  )
}

export { BudgetSlider }
