"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ScoreRing } from "@/components/results/score-ring"
import { Button } from "@/components/ui/button"
import { LaptopRender } from "@/components/ui/laptop-render"
import { NeedMeter } from "@/components/ui/need-meter"
import { getBudgetInsight, getWizardOptions } from "@/lib/api"
import type { LaptopImage } from "@/lib/laptop-image"
import { DURATION, EASE_OUT } from "@/lib/motion"
import { needMeterRows } from "@/lib/need-meter"
import type { BudgetPresetId, RequirementProfile } from "@/types"

// Hero redesign "Kalimat terbelah" (disetujui Fahren, Okt 2026; PRD §12–13 isi tetap):
// kalimat "Laptop buat kuliahmu, / pas di budget-mu." dibelah oleh bingkai studio berisi render.
// Preset budget = kontrol utama: render dan Garis Kebutuhan di bingkai bereaksi langsung.
// Gerak khas: saat di-scroll, dua belahan kalimat menjauh dan bingkai sedikit mengecil.

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

const HEADLINE = ["Laptop buat kuliahmu,", "pas di budget-mu."] as const
/** Masuk dari sisi masing-masing (keyframe tw-animate-css, tampil sebelum hidrasi). */
const ENTER_LEFT = "animate-in fade-in slide-in-from-left-10 fill-mode-both duration-700" // taste-skill-ignore: animasi geser, bukan gradient
const ENTER_RIGHT = "animate-in fade-in slide-in-from-right-10 fill-mode-both duration-700" // taste-skill-ignore: animasi geser, bukan gradient

interface LandingHeroProps {
  presetRequirements: Record<BudgetPresetId, RequirementProfile>
  bestMatch: { matchScore: number; laptopName: string }
  majorLabel: string
  softwareLabels: string[]
}

export function LandingHero({ presetRequirements, bestMatch, majorLabel, softwareLabels }: LandingHeroProps) {
  const [presetId, setPresetId] = React.useState<BudgetPresetId | null>(null)
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const leftX = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"])
  const rightX = useTransform(scrollYProgress, [0, 1], ["0%", "14%"])
  const frameScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])

  const shownId = presetId ?? SCORED_TIER
  const preset = options.budgetPresets.find((p) => p.id === shownId)!
  const requirement = presetRequirements[shownId]
  const rows = needMeterRows(requirement).filter((r) => ["cpu", "ram", "storage"].includes(r.component))
  const ram = requirement.specs.find((s) => s.component === "ram")
  const insight = getBudgetInsight(preset.value, true)
  const render = PRESET_RENDER[shownId]

  const ctaHref = presetId ? `/rekomendasi/budget?budget=${preset.value}` : "/rekomendasi/budget"
  // "< Rp6 jt" → "di bawah Rp6 jt", "Rp15 jt+" → "Rp15 jt ke atas"
  const presetWords = preset.label.replace(/^<\s*/, "di bawah ").replace(/\+$/, " ke atas")
  const ctaLabel = presetId
    ? `Cari laptop ${presetWords.startsWith("di bawah") ? "" : "untuk "}${presetWords}`
    : "Cari laptop yang pas"

  const line = "block text-[2.75rem] leading-[0.95] font-extrabold tracking-[-0.045em] md:text-[4.25rem] xl:text-[5.5rem]"

  const meterCard = (
    <div aria-live="polite" className="flex flex-col gap-4 rounded-[14px] bg-bg p-4 text-text md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="type-small text-text">Garis kebutuhanmu</p>
          <p className="type-micro font-medium tracking-normal text-text-muted">
            {majorLabel} · {preset.label}
          </p>
        </div>
        {shownId === SCORED_TIER ? (
          <div className="flex items-center gap-1.5" title={bestMatch.laptopName}>
            <ScoreRing value={bestMatch.matchScore} size="sm" animate={false} />
            <span className="sr-only">cocok dengan {bestMatch.laptopName}</span>
          </div>
        ) : (
          <p className="text-right type-micro font-medium tracking-normal text-text-muted">
            <span className="block text-xl leading-6 font-bold text-text tabular-nums">{insight.laptopCount}</span>
            laptop di katalog
          </p>
        )}
      </div>
      {rows.map((r, i) => (
        <NeedMeter key={r.component} component={r.component} scale={r.scale} need={r.need} index={i} size="compact" />
      ))}
      {ram && (
        <p key={shownId} className="animate-in type-small font-normal text-text-muted fade-in duration-200">
          <span className="font-semibold text-cobalt-600">Kenapa?</span> RAM {ram.minimum} untuk{" "}
          {softwareLabels.join(" + ")}
        </p>
      )}
    </div>
  )

  return (
    <section
      ref={ref}
      data-tone="cobalt"
      aria-labelledby="hero-title"
      className="overflow-hidden bg-cobalt-600 text-white"
    >
      <h1 id="hero-title" className="sr-only">
        {HEADLINE.join(" ")}
      </h1>

      <div className="page-container grid gap-x-8 gap-y-6 pt-8 pb-12 md:pt-10 md:pb-16 lg:grid-cols-12 lg:gap-y-5 lg:pt-8 lg:pb-14">
        {/* Belahan pertama kalimat */}
        <motion.p
          aria-hidden="true"
          style={reduce ? undefined : { x: leftX }}
          className="order-1 lg:col-span-12 lg:row-start-1"
        >
          <span className={cn(line, ENTER_LEFT)}>
            {HEADLINE[0]}
          </span>
        </motion.p>

        {/* Belahan kedua: di bawah bingkai pada lg, langsung di bawah belahan pertama pada mobile */}
        <motion.p
          aria-hidden="true"
          style={reduce ? undefined : { x: rightX }}
          className="order-2 -mt-3 lg:col-span-12 lg:row-start-3 lg:mt-0 lg:text-right"
        >
          <span
            className={cn(line, ENTER_RIGHT)}
            style={{ animationDelay: "120ms" }}
          >
            pas di <span className="whitespace-nowrap">budget-mu.</span>
          </span>
        </motion.p>

        {/* Kiri: penjelasan, preset budget, aksi */}
        <div
          className="order-3 flex min-w-0 animate-in flex-col gap-6 fade-in slide-in-from-bottom-4 fill-mode-both duration-700 lg:col-span-4 lg:row-start-2 lg:self-end"
          style={{ animationDelay: "240ms" }}
        >
          <p className="max-w-[30rem] type-body-l text-cobalt-100">
            Jawab 5 pertanyaan tentang budget, kuliah, dan aplikasimu. Kami tunjukkan spek yang kamu butuh dan laptop
            yang cocok, lengkap dengan alasannya.
          </p>

          <div className="flex min-w-0 flex-col gap-2.5">
            <p id="preset-label" className="type-small text-white">
              Budget-mu berapa?
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
                        "inline-flex h-11 shrink-0 items-center rounded-full border px-4 type-small tabular-nums transition-[color,background-color,border-color,transform] duration-[var(--motion-fast)] active:scale-[0.96]",
                        selected
                          ? "border-white bg-white text-cobalt-600"
                          : "border-white/40 text-white hover:border-white hover:bg-cobalt-700"
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
            <Button asChild variant="signal" size="lg">
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
              </Link>
            </Button>
            <Link
              href="#cara-kerja"
              className="inline-flex min-h-11 items-center type-body font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
            >
              Lihat cara kerjanya
            </Link>
          </div>
        </div>

        {/* Kanan: bingkai studio. md+: render + kartu meter berdampingan di dalam bingkai. */}
        <motion.div
          style={reduce ? undefined : { scale: frameScale }}
          className="order-4 min-w-0 lg:col-span-8 lg:row-start-2"
        >
          <div
            className="grid animate-in overflow-hidden rounded-[20px] bg-studio fade-in zoom-in-95 fill-mode-both duration-700 md:aspect-[16/9] md:grid-cols-[minmax(0,1fr)_17rem] md:items-center"
            style={{ animationDelay: "160ms" }}
          >
            <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
              <AnimatePresence initial={false}>
                <motion.div
                  key={`${render.shape}-${render.color}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: reduce ? 0 : DURATION.slow, ease: EASE_OUT }}
                >
                  <LaptopRender
                    image={render}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    eager
                    labelPosition="top"
                    className="h-full bg-transparent md:aspect-auto"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="p-3 pt-0 md:p-4 md:pl-0">{meterCard}</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
