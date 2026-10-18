"use client"

import { cn } from "cn"
import { Check } from "lucide-react"

// PRD §23 Stepper ★: 5 langkah · Done/Current/Upcoming · titik di desktop, progress bar di
// mobile (§15, §24). Langkah selesai bisa diklik untuk kembali.

interface StepperStep {
  id: string
  label: string
}

interface StepperProps {
  steps: StepperStep[]
  /** Indeks langkah aktif (0-based). */
  current: number
  /** Indeks langkah yang sudah selesai. Default: semua langkah sebelum `current`. */
  done?: number[]
  onStepClick?: (index: number) => void
  /** auto = bar di < md, titik di ≥ md. */
  variant?: "auto" | "dots" | "bar"
  className?: string
}

const pad = (n: number) => String(n).padStart(2, "0")

function StepperBar({ steps, current }: Pick<StepperProps, "steps" | "current">) {
  const percent = ((current + 1) / steps.length) * 100
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-baseline justify-between type-small text-text-muted">
        <span>
          Langkah <span className="num text-text">{current + 1}</span> dari <span className="num">{steps.length}</span>
        </span>
        <span className="font-semibold text-text">{steps[current]?.label}</span>
      </p>
      <div
        role="progressbar"
        aria-label="Kemajuan rekomendasi"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
        aria-valuetext={`Langkah ${current + 1} dari ${steps.length}: ${steps[current]?.label}`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-border"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function StepperDots({ steps, current, done, onStepClick }: Omit<StepperProps, "variant" | "className">) {
  const isDone = (i: number) => (done ? done.includes(i) : i < current)
  return (
    <ol className="flex items-start">
      {steps.map((step, index) => {
        const state = index === current ? "current" : isDone(index) ? "done" : "upcoming"
        const clickable = state === "done" && onStepClick
        const content = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 num type-micro transition-colors duration-200",
                state === "done" && "border-primary bg-primary text-primary-foreground",
                state === "current" && "border-primary bg-bg text-primary",
                state === "upcoming" && "border-border bg-bg text-text-muted"
              )}
            >
              {state === "done" ? <Check className="size-4" strokeWidth={2.5} /> : pad(index + 1)}
            </span>
            <span
              className={cn(
                "type-small whitespace-nowrap",
                state === "upcoming" ? "font-medium text-text-muted" : "font-semibold text-text"
              )}
            >
              <span className="sr-only">
                {state === "done" ? "Selesai: " : state === "current" ? "Langkah saat ini: " : "Belum: "}
              </span>
              {step.label}
            </span>
          </>
        )
        return (
          <li
            key={step.id}
            aria-current={state === "current" ? "step" : undefined}
            className="flex flex-1 items-start last:flex-none"
          >
            {clickable ? (
              <button
                type="button"
                onClick={() => onStepClick(index)}
                className="flex min-h-11 flex-col items-center gap-2 rounded-control px-1 hover:[&>span:first-child]:bg-primary-hover"
              >
                {content}
              </button>
            ) : (
              <div className="flex min-h-11 flex-col items-center gap-2 px-1">{content}</div>
            )}
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="mx-1 mt-4 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                <span
                  className="block h-full bg-primary transition-[width] duration-300 ease-out"
                  style={{ width: isDone(index) ? "100%" : "0%" }}
                />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function Stepper({ steps, current, done, onStepClick, variant = "auto", className }: StepperProps) {
  return (
    <nav aria-label="Langkah rekomendasi" className={className}>
      {variant !== "dots" && (
        <div className={cn(variant === "auto" && "md:hidden")}>
          <StepperBar steps={steps} current={current} />
        </div>
      )}
      {variant !== "bar" && (
        <div className={cn(variant === "auto" && "hidden md:block")}>
          <StepperDots steps={steps} current={current} done={done} onStepClick={onStepClick} />
        </div>
      )}
    </nav>
  )
}

export { Stepper }
export type { StepperStep }
