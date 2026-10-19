"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle"
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning"
import { XCircleIcon } from "@phosphor-icons/react/dist/ssr/XCircle"
import { IconTile } from "@/components/ui/icon-tile"
import { SPEC_ICONS } from "@/lib/icons"
import { DURATION, EASE_IN_OUT, staggerDelay } from "@/lib/motion"
import { meterPosition, meterStatus, type MeterScale, type MeterStatus } from "@/lib/need-meter"
import type { SpecComponent } from "@/types"

// Garis Kebutuhan (REDESIGN §9, signature): track = rentang wajar komponen, garis vertikal tegas =
// kebutuhanmu, fill = nilai laptop. Tiga mode: requirement (garis + zona cukup), laptop (fill vs
// garis), compare (penanda A/B/C). Status selalu ikon + teks, tidak hanya warna (PRD §28).

export interface CompareMarker {
  /** Huruf penanda, mis. "A". */
  key: string
  name: string
  value: number
}

const FILL: Record<MeterStatus, string> = {
  met: "bg-primary",
  near: "bg-warning",
  short: "bg-danger",
  unchecked: "bg-text-muted",
}

const MARKER_TONE = ["bg-ink-950 text-white", "bg-blue-700 text-white", "bg-bg text-text ring-2 ring-border-strong"]

function statusText(status: MeterStatus, scale: MeterScale, need: number, value: number) {
  if (status === "met") return "Memenuhi"
  if (status === "unchecked") return "Tidak dicek"
  if (scale.max === 1) return "Tidak memenuhi"
  const gap = Math.round((need - value) * 10) / 10
  return `${status === "near" ? "Mendekati, kurang" : "Kurang"} ${scale.format(gap).replace(/^(skor|maks\.) /, "")}`
}

function StatusLabel({ status, text }: { status: MeterStatus; text: string }) {
  const Icon = status === "met" ? CheckCircleIcon : status === "near" ? WarningIcon : XCircleIcon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 type-small",
        status === "met" && "text-success",
        status === "near" && "text-warning",
        status === "short" && "text-danger",
        status === "unchecked" && "text-text-muted"
      )}
    >
      <Icon size={16} weight="fill" aria-hidden="true" />
      {text}
    </span>
  )
}

function NeedMeter({
  component,
  label,
  scale,
  need,
  value,
  markers,
  index = 0,
  size = "default",
  className,
}: {
  component?: SpecComponent
  /** Default: label komponen dari `lib/icons.ts`. */
  label?: string
  scale: MeterScale
  need: number
  /** Mode laptop: nilai satu laptop. */
  value?: number
  /** Mode compare: 2–3 laptop pada satu track. */
  markers?: CompareMarker[]
  /** Urutan di grup, untuk jeda masuk. */
  index?: number
  size?: "default" | "compact"
  className?: string
}) {
  const reduce = useReducedMotion()
  // Yang diamati track-nya, bukan elemen fill: fill mulai di scaleX(0) sehingga luasnya nol dan
  // IntersectionObserver tidak andal mendeteksinya.
  const trackRef = React.useRef<HTMLDivElement>(null)
  const inView = useInView(trackRef, { once: true, amount: 0.6 })
  const meta = component ? SPEC_ICONS[component] : undefined
  const name = label ?? meta?.label ?? ""
  const needPos = meterPosition(scale, need)
  const mode = markers ? "compare" : value !== undefined ? "laptop" : "requirement"
  const status = meterStatus(need, value)
  const delay = staggerDelay(index)

  const grow = (to: number) =>
    reduce
      ? { initial: { scaleX: to }, animate: { scaleX: to } }
      : {
          initial: { scaleX: 0 },
          animate: { scaleX: inView ? to : 0 },
          transition: { duration: DURATION.slow, ease: EASE_IN_OUT, delay },
        }

  const a11y =
    mode === "laptop"
      ? {
          role: "meter" as const,
          "aria-label": name,
          "aria-valuemin": scale.min,
          "aria-valuemax": scale.max,
          "aria-valuenow": value,
          "aria-valuetext": `${scale.format(value!)}, butuh ${scale.format(need)}, ${statusText(status, scale, need, value!).toLowerCase()}`,
        }
      : mode === "requirement"
        ? { role: "img" as const, "aria-label": `${name}: butuh minimal ${scale.format(need)}` }
        : { role: "group" as const, "aria-label": `${name}, butuh ${scale.format(need)}` }

  return (
    <div className={cn("flex min-w-0 flex-col", size === "compact" ? "gap-1.5" : "gap-2", className)} {...a11y}>
      <div className="flex items-center justify-between gap-3" aria-hidden={mode !== "compare" || undefined}>
        <span className="flex min-w-0 items-center gap-2.5">
          {meta && size === "default" && <IconTile icon={meta.icon} category={meta.category} size="sm" />}
          <span className="truncate type-small text-text">{name}</span>
        </span>
        <span className="shrink-0 type-small font-normal text-text-muted">
          Butuh <span className="num text-text">{scale.format(need)}</span>
        </span>
      </div>

      {/* Track. Semua elemen visual di sini dekoratif; nilainya ada di teks dan atribut ARIA. */}
      <div ref={trackRef} className="relative h-5" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-border">
          {mode === "requirement" && (
            <motion.span
              className="absolute inset-y-0 right-0 origin-right bg-blue-200"
              style={{ left: `${needPos * 100}%` }}
              {...grow(1)}
            />
          )}
          {mode === "laptop" && (
            <motion.span
              className={cn("absolute inset-0 origin-left", FILL[status])}
              {...grow(meterPosition(scale, value!))}
            />
          )}
        </div>
        <span
          className="absolute top-0 h-5 w-[3px] -translate-x-1/2 rounded-full bg-text"
          style={{ left: `${needPos * 100}%` }}
        />
        {markers?.map((m, i) => (
          <motion.span
            key={m.key}
            className={cn(
              "absolute top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[11px] font-semibold",
              MARKER_TONE[i % MARKER_TONE.length]
            )}
            style={{ left: `${meterPosition(scale, m.value) * 100}%` }}
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            animate={reduce || inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: DURATION.medium, delay: delay + i * 0.08 }}
          >
            {m.key}
          </motion.span>
        ))}
      </div>

      {mode === "laptop" && (
        <div className="flex items-center justify-between gap-3" aria-hidden="true">
          <span className="num type-small text-text">{scale.format(value!)}</span>
          <StatusLabel status={status} text={statusText(status, scale, need, value!)} />
        </div>
      )}
      {mode === "compare" && (
        <ul className="flex flex-col gap-1">
          {markers!.map((m) => {
            const s = meterStatus(need, m.value)
            return (
              <li key={m.key} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate type-small font-normal text-text">
                  <span className="font-semibold">{m.key}</span> {m.name}{" "}
                  <span className="num text-text-muted">{scale.format(m.value)}</span>
                </span>
                <StatusLabel status={s} text={statusText(s, scale, need, m.value)} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** Daftar meter dengan legenda garis; dipakai Profil, Detail, Hasil. */
function NeedMeterGroup({
  title,
  children,
  className,
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("flex flex-col gap-5", className)} aria-label={title}>
      {title && (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="type-h3 text-text">{title}</h3>
          <p className="flex items-center gap-1.5 type-micro text-text-muted">
            <span className="inline-block h-3 w-[3px] rounded-full bg-text" aria-hidden="true" />
            Garis = kebutuhanmu
          </p>
        </div>
      )}
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}

export { NeedMeter, NeedMeterGroup }
