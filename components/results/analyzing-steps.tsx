"use client"

import { cn } from "cn"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr/CircleNotch"

// PRD §23 Analyzing Steps ★: 4 tahap · Pending, Active, Done (layar Analisis §14, §25).
// Status selalu ikon + teks (sr-only), tidak hanya warna (§28). Ikon berputar mati saat
// prefers-reduced-motion lewat aturan global di globals.css. tone "dark" untuk layar Analisis
// ber-latar ink-950 (REDESIGN §14).

export interface AnalyzingStep {
  label: string
  detail?: string
}

interface AnalyzingStepsProps {
  steps: AnalyzingStep[]
  /** Jumlah tahap yang sudah selesai. Tahap berikutnya dianggap aktif. */
  completed: number
  tone?: "light" | "dark"
  className?: string
}

export function AnalyzingSteps({ steps, completed, tone = "light", className }: AnalyzingStepsProps) {
  const dark = tone === "dark"
  return (
    <ol className={cn("flex flex-col", className)}>
      {steps.map((step, index) => {
        const state = index < completed ? "done" : index === completed ? "active" : "pending"
        return (
          <li key={step.label} className="flex gap-4" aria-current={state === "active" ? "step" : undefined}>
            <span aria-hidden="true" className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200",
                  state === "done" && "border-success bg-success text-primary-foreground",
                  state === "active" && (dark ? "border-blue-400 text-blue-400" : "border-primary bg-bg text-primary"),
                  state === "pending" && (dark ? "border-ink-700" : "border-border bg-bg")
                )}
              >
                {state === "done" && <CheckIcon weight="bold" className="size-4" />}
                {state === "active" && <CircleNotchIcon weight="bold" className="size-4 animate-spin" />}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    "my-1 w-0.5 flex-1 transition-colors duration-200",
                    state === "done" ? "bg-success" : dark ? "bg-ink-700" : "bg-border"
                  )}
                />
              )}
            </span>
            <div className={cn("flex min-w-0 flex-col gap-0.5", index < steps.length - 1 ? "pb-6" : "pb-0")}>
              <p
                className={cn(
                  "type-body",
                  state === "pending"
                    ? dark
                      ? "text-zinc-400"
                      : "text-text-muted"
                    : dark
                      ? "font-semibold text-white"
                      : "font-semibold text-text"
                )}
              >
                <span className="sr-only">
                  {state === "done" ? "Selesai: " : state === "active" ? "Sedang berjalan: " : "Menunggu: "}
                </span>
                {step.label}
              </p>
              {step.detail && (
                <p className={cn("type-small font-normal", dark ? "text-zinc-300" : "text-text-muted")}>{step.detail}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
