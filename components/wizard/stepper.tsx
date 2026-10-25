"use client"

import { cn } from "cn"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"

// PRD §23 Stepper ★: 5 langkah · Done/Current/Upcoming · titik di desktop, progress bar di
// mobile (§15, §24). Langkah selesai bisa diklik untuk kembali. `tone="cobalt"` untuk band kobalt Wizard (R4).

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
  tone?: "default" | "cobalt"
  className?: string
}

const pad = (n: number) => String(n).padStart(2, "0")

function StepperBar({ steps, current, tone }: Pick<StepperProps, "steps" | "current" | "tone">) {
  const cobalt = tone === "cobalt"
  const percent = ((current + 1) / steps.length) * 100
  return (
    <div className="flex flex-col gap-2">
      <p className={cn("flex items-baseline justify-between type-small", cobalt ? "text-cobalt-100" : "text-text-muted")}>
        <span>
          Langkah <span className={cn("tabular-nums", cobalt ? "text-white" : "text-text")}>{current + 1}</span> dari{" "}
          <span className="tabular-nums">{steps.length}</span>
        </span>
        <span className={cn("font-semibold", cobalt ? "text-white" : "text-text")}>{steps[current]?.label}</span>
      </p>
      <div
        role="progressbar"
        aria-label="Kemajuan rekomendasi"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
        aria-valuetext={`Langkah ${current + 1} dari ${steps.length}: ${steps[current]?.label}`}
        className={cn("h-1.5 w-full overflow-hidden rounded-full", cobalt ? "bg-cobalt-800" : "bg-border")}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-300 ease-out", cobalt ? "bg-signal" : "bg-primary")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function StepperDots({ steps, current, done, onStepClick, tone }: Omit<StepperProps, "variant" | "className">) {
  const isDone = (i: number) => (done ? done.includes(i) : i < current)
  const cobalt = tone === "cobalt"
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
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 type-micro tabular-nums transition-colors duration-200",
                cobalt
                  ? [
                      state === "done" && "border-white bg-white text-cobalt-600",
                      state === "current" && "border-signal bg-signal text-signal-ink",
                      state === "upcoming" && "border-cobalt-400 text-cobalt-100",
                    ]
                  : [
                      state === "done" && "border-primary bg-primary text-primary-foreground",
                      state === "current" && "border-primary bg-bg text-primary",
                      state === "upcoming" && "border-border bg-bg text-text-muted",
                    ]
              )}
            >
              {state === "done" ? <CheckIcon weight="bold" className="size-4" /> : pad(index + 1)}
            </span>
            <span
              className={cn(
                "type-small whitespace-nowrap",
                state === "upcoming"
                  ? cn("font-medium", cobalt ? "text-cobalt-100" : "text-text-muted")
                  : cn("font-semibold", cobalt ? "text-white" : "text-text")
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
                className={cn(
                  "flex min-h-11 flex-col items-center gap-2 rounded-control px-1",
                  cobalt ? "hover:[&>span:first-child]:bg-cobalt-100" : "hover:[&>span:first-child]:bg-primary-hover"
                )}
              >
                {content}
              </button>
            ) : (
              <div className="flex min-h-11 flex-col items-center gap-2 px-1">{content}</div>
            )}
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn("mx-1 mt-4 h-0.5 flex-1 overflow-hidden rounded-full", cobalt ? "bg-cobalt-400" : "bg-border")}
              >
                <span
                  className={cn("block h-full transition-[width] duration-300 ease-out", cobalt ? "bg-white" : "bg-primary")}
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

function Stepper({ steps, current, done, onStepClick, variant = "auto", tone = "default", className }: StepperProps) {
  return (
    <nav aria-label="Langkah rekomendasi" className={className}>
      {variant !== "dots" && (
        <div className={cn(variant === "auto" && "md:hidden")}>
          <StepperBar steps={steps} current={current} tone={tone} />
        </div>
      )}
      {variant !== "bar" && (
        <div className={cn(variant === "auto" && "hidden md:block")}>
          <StepperDots steps={steps} current={current} done={done} onStepClick={onStepClick} tone={tone} />
        </div>
      )}
    </nav>
  )
}

export { Stepper }
export type { StepperStep }
