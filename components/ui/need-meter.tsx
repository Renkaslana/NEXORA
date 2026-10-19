"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle"
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning"
import { XCircleIcon } from "@phosphor-icons/react/dist/ssr/XCircle"
import { IconTile } from "@/components/ui/icon-tile"
import { CRITERION_ICONS, SPEC_ICONS } from "@/lib/icons"
import { DURATION, EASE_IN_OUT, EASE_OUT, staggerDelay } from "@/lib/motion"
import {
  meterPosition,
  meterStatus,
  resolveScale,
  type MeterScale,
  type MeterScaleId,
  type MeterStatus,
} from "@/lib/need-meter"
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
  const gap = scale.format(Math.round(Math.abs(need - value) * 10) / 10).replace(/^(skor|maks\.) /, "")
  const text = scale.shortText ? scale.shortText(gap) : `Kurang ${gap}`
  return status === "near" ? `Mendekati, ${lowerFirst(text)}` : text
}

const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)

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

const BOBOT = { ...CRITERION_ICONS.portabilitas, label: "Bobot" }

function NeedMeter({
  component,
  label,
  scale: scaleProp,
  need,
  value,
  markers,
  index = 0,
  size = "default",
  flashShort = false,
  bare = false,
  className,
}: {
  /** Komponen spek, atau "bobot" untuk batas bobot persona. */
  component?: SpecComponent | "bobot"
  /** Default: label komponen dari `lib/icons.ts`. */
  label?: string
  /** Objek skala, atau id-nya bila dikirim dari Server Component. */
  scale: MeterScale | MeterScaleId
  need: number
  /** Mode laptop: nilai satu laptop. */
  value?: number
  /** Mode compare: 2–3 laptop pada satu track. */
  markers?: CompareMarker[]
  /** Urutan di grup, untuk jeda masuk. */
  index?: number
  /** mini = strip Wizard mobile: label & nilai satu baris kecil, track lebih tipis. */
  size?: "default" | "compact" | "mini"
  /** Bagian yang kurang berkedip sekali setelah terisi (landing "Spek saja tidak menjawab"). */
  flashShort?: boolean
  /** Hanya track (label & angka sudah ditulis di sekitarnya, mis. baris spek Profil). */
  bare?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  // Yang diamati track-nya, bukan elemen fill: fill mulai di scaleX(0) sehingga luasnya nol dan
  // IntersectionObserver tidak andal mendeteksinya.
  const trackRef = React.useRef<HTMLDivElement>(null)
  const inView = useInView(trackRef, { once: true, amount: 0.6 })
  const scale = resolveScale(scaleProp)
  const meta = component === "bobot" ? BOBOT : component ? SPEC_ICONS[component] : undefined
  const name = label ?? meta?.label ?? ""
  const needPos = meterPosition(scale, need)
  const isMax = scale.direction === "max"
  const mode = markers ? "compare" : value !== undefined ? "laptop" : "requirement"
  const status = meterStatus(need, value, scale.direction)
  const delay = staggerDelay(index)
  const needWord = isMax ? "Maks." : "Butuh"
  // Garis & zona meluncur saat kebutuhan berubah (hero: ganti preset budget, gerak 5).
  const slide = { duration: reduce ? 0 : DURATION.medium, ease: EASE_OUT }

  const grow = (to: number, extra: Record<string, string> = {}) =>
    reduce
      ? { initial: { scaleX: to, ...extra }, animate: { scaleX: to, ...extra } }
      : {
          initial: { scaleX: 0, ...extra },
          animate: { scaleX: inView ? to : 0, ...extra },
          transition: { scaleX: { duration: DURATION.slow, ease: EASE_IN_OUT, delay }, default: slide },
        }
  const flash =
    flashShort && status === "short" && inView && !reduce
      ? {
          opacity: [1, 1, 0.3, 1],
          transition: { duration: 0.9, times: [0, 0.55, 0.75, 1], delay: delay + DURATION.slow },
        }
      : undefined

  const a11y =
    mode === "laptop"
      ? {
          role: "meter" as const,
          "aria-label": name,
          "aria-valuemin": scale.min,
          "aria-valuemax": scale.max,
          "aria-valuenow": value,
          "aria-valuetext": `${scale.format(value!)}, ${isMax ? "maksimal" : "butuh"} ${scale.format(need)}, ${lowerFirst(statusText(status, scale, need, value!))}`,
        }
      : mode === "requirement"
        ? { role: "img" as const, "aria-label": `${name}: ${isMax ? "maksimal" : "butuh minimal"} ${scale.format(need)}` }
        : { role: "group" as const, "aria-label": `${name}, ${isMax ? "maksimal" : "butuh"} ${scale.format(need)}` }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col",
        size === "default" ? "gap-2" : size === "compact" ? "gap-1.5" : "gap-1",
        className
      )}
      {...a11y}
    >
      <div
        className={cn("flex items-center justify-between", size === "mini" ? "gap-1.5" : "gap-3", bare && "sr-only")}
        aria-hidden={mode !== "compare" || undefined}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {meta && size === "default" && <IconTile icon={meta.icon} category={meta.category} size="sm" />}
          <span className={cn("truncate text-text", size === "mini" ? "type-micro" : "type-small")}>{name}</span>
        </span>
        {size === "mini" ? (
          <span className="num shrink-0 type-micro text-text">{scale.format(need).replace(/^skor /, "")}</span>
        ) : (
          <span className="shrink-0 type-small font-normal text-text-muted">
            {needWord} <span className="num text-text">{scale.format(need)}</span>
          </span>
        )}
      </div>

      {/* Track. Semua elemen visual di sini dekoratif; nilainya ada di teks dan atribut ARIA. */}
      <div ref={trackRef} className={cn("relative", size === "mini" ? "h-3" : "h-5")} aria-hidden="true">
        <div
          className={cn(
            "absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-border",
            size === "mini" ? "h-1.5" : "h-2"
          )}
        >
          {mode === "requirement" &&
            (isMax ? (
              <motion.span
                className="absolute inset-y-0 left-0 origin-left bg-blue-200"
                {...grow(1, { width: `${needPos * 100}%` })}
              />
            ) : (
              <motion.span
                className="absolute inset-y-0 right-0 origin-right bg-blue-200"
                {...grow(1, { left: `${needPos * 100}%` })}
              />
            ))}
          {mode === "laptop" && (
            <motion.span className="absolute inset-0" animate={flash}>
              <motion.span
                className={cn("absolute inset-0 origin-left", FILL[status])}
                {...grow(meterPosition(scale, value!))}
              />
            </motion.span>
          )}
        </div>
        <motion.span
          className={cn(
            "absolute top-0 -translate-x-1/2 rounded-full bg-text",
            size === "mini" ? "h-3 w-0.5" : "h-5 w-[3px]"
          )}
          initial={false}
          animate={{ left: `${needPos * 100}%` }}
          transition={slide}
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
            const s = meterStatus(need, m.value, scale.direction)
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
