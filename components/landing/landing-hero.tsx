"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { WarningBanner } from "@/components/profile/requirement-card"
import { ScoreRing } from "@/components/results/score-ring"
import { Button } from "@/components/ui/button"
import { LaptopRender } from "@/components/ui/laptop-render"
import { NeedMeter } from "@/components/ui/need-meter"
import { getBudgetInsight, getWizardOptions } from "@/lib/api"
import type { LaptopImage } from "@/lib/laptop-image"
import { DURATION, EASE_OUT, SPRING_SOFT } from "@/lib/motion"
import { needMeterRows, type NeedMeterRow } from "@/lib/need-meter"
import type { BudgetPresetId, RequirementProfile, SpecComponent } from "@/types"

// Hero Landing redesign "Live Spec" (REDESIGN §15; PRD §12–13). Preset budget = kontrol utama:
// render, callout Garis Kebutuhan, dan kartu Profil Kebutuhan bereaksi langsung (gerak 5).
// Section "Garis kebutuhanmu" digabung ke sini (keputusan Fahren R2).

const options = getWizardOptions()
/** Tier yang punya skenario hasil (Raka, Rp8 jt). Badge skor hanya tampil di sini. */
const SCORED_TIER: BudgetPresetId = "8-10"

/** Render yang mewakili kelas laptop di tiap tier. Rp8–10 jt = Best Match Raka. */
const PRESET_RENDER: Record<BudgetPresetId, LaptopImage> = {
  "lt-6": { shape: "mainstream", color: "graphite" },
  "6-8": { shape: "mainstream", color: "silver" },
  "8-10": { shape: "mainstream", color: "navy" },
  "10-15": { shape: "ultrabook", color: "mist" },
  "15-plus": { shape: "creator", color: "navy" },
}

/** Posisi callout di sekitar laptop (desktop). Garis penunjuk mengarah ke laptop. */
const CALLOUTS: { component: SpecComponent; className: string; side: "left" | "right" }[] = [
  { component: "cpu", className: "left-[-4%] top-[7%]", side: "right" },
  { component: "ram", className: "right-[-3%] top-[34%]", side: "left" },
  { component: "storage", className: "right-[6%] bottom-[-6%]", side: "left" },
]

interface LandingHeroProps {
  presetRequirements: Record<BudgetPresetId, RequirementProfile>
  bestMatch: { matchScore: number; laptopName: string }
  majorLabel: string
  softwareLabels: string[]
}

/** Tilt + kedalaman pointer (gerak 2 & 15): hanya pointer halus dan tanpa reduced motion. */
function usePointerDepth() {
  const reduce = useReducedMotion()
  const [enabled, setEnabled] = React.useState(false)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const x = useSpring(px, SPRING_SOFT)
  const y = useSpring(py, SPRING_SOFT)

  React.useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)")
    const update = () => setEnabled(query.matches && !reduce)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [reduce])

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!enabled) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onPointerLeave = () => {
    px.set(0)
    py.set(0)
  }

  return {
    enabled,
    handlers: { onPointerMove, onPointerLeave },
    rotateX: useTransform(y, (v) => v * -6),
    rotateY: useTransform(x, (v) => v * 6),
    renderX: useTransform(x, (v) => v * 12),
    renderY: useTransform(y, (v) => v * 12),
    calloutX: useTransform(x, (v) => v * -6),
    calloutY: useTransform(y, (v) => v * -6),
  }
}

function Callout({ row, side, index }: { row: NeedMeterRow; side: "left" | "right"; index: number }) {
  return (
    <div
      className="relative w-52 animate-in rounded-card border border-border bg-bg p-3.5 shadow-lg fade-in zoom-in-95 fill-mode-both duration-[var(--motion-medium)]"
      style={{ animationDelay: `${400 + index * 80}ms` }}
    >
      {/* Garis penunjuk ke laptop: dekoratif. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 flex w-7 items-center",
          side === "right" ? "left-full flex-row" : "right-full flex-row-reverse"
        )}
      >
        <span className="h-px flex-1 bg-border-strong" />
        <span className="size-2 rounded-full border-2 border-text bg-bg" />
      </span>
      <NeedMeter component={row.component} scale={row.scale} need={row.need} index={index} size="compact" />
    </div>
  )
}

export function LandingHero({ presetRequirements, bestMatch, majorLabel, softwareLabels }: LandingHeroProps) {
  const [presetId, setPresetId] = React.useState<BudgetPresetId | null>(null)
  const depth = usePointerDepth()
  const reduce = useReducedMotion()

  const shownId = presetId ?? SCORED_TIER
  const preset = options.budgetPresets.find((p) => p.id === shownId)!
  const requirement = presetRequirements[shownId]
  const rows = needMeterRows(requirement)
  const row = (c: SpecComponent) => rows.find((r) => r.component === c)
  const ram = requirement.specs.find((s) => s.component === "ram")
  const insight = getBudgetInsight(preset.value, true)
  const render = PRESET_RENDER[shownId]

  const ctaHref = presetId ? `/rekomendasi/budget?budget=${preset.value}` : "/rekomendasi/budget"
  // "< Rp6 jt" → "di bawah Rp6 jt", "Rp15 jt+" → "Rp15 jt ke atas"
  const presetWords = preset.label.replace(/^<\s*/, "di bawah ").replace(/\+$/, " ke atas")
  const ctaLabel = presetId
    ? `Cari laptop ${presetWords.startsWith("di bawah") ? "" : "untuk "}${presetWords}`
    : "Cari Laptop yang Pas"

  const profileCard = (
    <aside
      aria-label="Contoh Profil Kebutuhan"
      className="flex w-full flex-col gap-4 rounded-card border border-border bg-bg p-5 shadow-lg lg:max-w-[22rem]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="type-small text-text">Profil Kebutuhan</p>
          <p className="type-micro font-medium tracking-normal text-text-muted">
            Contoh: {majorLabel}, {preset.label}
          </p>
        </div>
        {shownId === SCORED_TIER ? (
          <div className="flex items-center gap-2" title={bestMatch.laptopName}>
            <ScoreRing value={bestMatch.matchScore} size="sm" animate={false} />
            <span className="type-small text-success">cocok</span>
          </div>
        ) : (
          <p className="text-right type-micro font-medium tracking-normal text-text-muted">
            <span className="num block type-h3 text-text">{insight.laptopCount}</span>
            laptop di katalog
          </p>
        )}
      </div>

      {/* Di bawah lg callout tidak melayang: meter masuk ke kartu (REDESIGN §24). */}
      <div className="flex flex-col gap-4 lg:hidden">
        {(["cpu", "ram", "storage"] as const).map((c, i) => {
          const r = row(c)
          return r ? (
            <NeedMeter
              key={c}
              component={c}
              scale={r.scale}
              need={r.need}
              index={i}
              size="compact"
              className={c === "cpu" ? "hidden md:flex" : undefined}
            />
          ) : null
        })}
      </div>

      <div aria-live="polite" className="flex flex-col gap-3">
        <p key={shownId} className="animate-in type-small font-normal text-text-muted fade-in duration-200">
          {requirement.summary}
        </p>
        {requirement.warnings[0] ? (
          <WarningBanner warning={requirement.warnings[0]} compact />
        ) : (
          ram && (
            <p className="rounded-control bg-blue-50 px-3 py-2.5 type-small font-normal text-text">
              <span className="font-semibold text-primary">Kenapa?</span> RAM {ram.minimum} untuk{" "}
              {softwareLabels.join(" + ")}
            </p>
          )
        )}
      </div>
    </aside>
  )

  return (
    <section className="page-container grid items-center gap-10 pt-8 pb-16 md:pt-14 md:pb-24 lg:grid-cols-12 lg:gap-8 lg:pt-16 lg:pb-48">
      {/* ------------------------------------------------------------ Kiri */}
      <div className="flex min-w-0 flex-col gap-7 lg:col-span-6">
        <div className="flex animate-in flex-col gap-5 fade-in slide-in-from-bottom-4 fill-mode-both duration-[var(--motion-slow)]">
          <p className="type-small text-primary">Sistem pendukung keputusan laptop</p>
          <h1 className="type-display-xl text-text">
            Jangan pilih laptop dari speknya. <span className="text-primary">Pilih dari kebutuhanmu.</span>
          </h1>
          <p className="max-w-[34rem] type-body-l text-text-muted">
            Jawab 5 pertanyaan singkat tentang budget, kuliah, dan aplikasi yang kamu pakai. Kami tunjukkan spek
            yang kamu butuh dan laptop yang cocok, lengkap dengan alasannya.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-2.5">
          <p id="preset-label" className="type-small text-text">
            Budget-mu?{" "}
            <span className="font-normal text-text-muted">Lihat garis kebutuhannya bergeser.</span>
          </p>
          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <div role="group" aria-labelledby="preset-label" className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
              {options.budgetPresets.map((p) => {
                const selected = presetId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPresetId(selected ? null : p.id)}
                    className={cn(
                      "num inline-flex h-11 shrink-0 items-center rounded-full border px-4 type-small transition-[color,background-color,border-color,transform] duration-[var(--motion-fast)] active:scale-[0.97]",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-bg text-text hover:border-border-strong hover:bg-paper-100"
                    )}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button asChild size="lg">
            <Link href={ctaHref}>
              {ctaLabel}
              <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="link" size="md">
            <Link href="#cara-kerja">Lihat cara kerjanya</Link>
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------ Kanan */}
      <div className="relative min-w-0 lg:col-span-6" {...depth.handlers}>
        <div className="[perspective:1200px]">
          <motion.div
            className="relative animate-in fade-in slide-in-from-bottom-6 fill-mode-both duration-[var(--motion-slow)]"
            style={depth.enabled ? { rotateX: depth.rotateX, rotateY: depth.rotateY } : undefined}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-studio">
              <AnimatePresence initial={false}>
                <motion.div
                  key={`${render.shape}-${render.color}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : DURATION.medium, ease: EASE_OUT }}
                  style={depth.enabled ? { x: depth.renderX, y: depth.renderY } : undefined}
                >
                  <LaptopRender
                    image={render}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    eager
                    labelPosition="top"
                    className="h-full bg-transparent"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Callout melayang hanya di lg+, bergeser berlawanan arah dengan render. */}
            <motion.div
              className="pointer-events-none absolute inset-0 hidden lg:block"
              style={depth.enabled ? { x: depth.calloutX, y: depth.calloutY } : undefined}
            >
              {CALLOUTS.map(({ component, className, side }, i) => {
                const r = row(component)
                return r ? (
                  <div key={component} className={cn("pointer-events-auto absolute", className)}>
                    <Callout row={r} side={side} index={i} />
                  </div>
                ) : null
              })}
            </motion.div>
          </motion.div>
        </div>

        <div className="relative z-10 -mt-16 px-4 sm:-mt-20 sm:px-8 lg:absolute lg:-bottom-36 lg:-left-8 lg:mt-0 lg:px-0">
          {profileCard}
        </div>
      </div>
    </section>
  )
}
