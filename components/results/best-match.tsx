"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useInView, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowsLeftRight"
import { BarbellIcon } from "@phosphor-icons/react/dist/ssr/Barbell"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu"
import { HardDrivesIcon } from "@phosphor-icons/react/dist/ssr/HardDrives"
import { MemoryIcon } from "@phosphor-icons/react/dist/ssr/Memory"
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star"
import { BookmarkButton } from "@/components/results/bookmark-button"
import { ScoreExplainer } from "@/components/results/score-explainer"
import { ScoreRing, scoreTier, tierLabel } from "@/components/results/score-ring"
import { Button } from "@/components/ui/button"
import { LaptopRender } from "@/components/ui/laptop-render"
import type { RecommendationItem } from "@/lib/api"
import { formatRupiah, formatStorage, formatWeight } from "@/lib/format"
import { EASE_OUT } from "@/lib/motion"

// Best Match (brief Hasil §5): gambar | info utama | skor + breakdown. Mobile: gambar → info → skor → tombol.
// Breakdown = `subScores` dari hasil (bukan dihitung di frontend). Status budget = harga vs budget profil.
// Gambar = render ilustrasi katalog (placeholder; nanti dari database), tidak dimanipulasi.

const SUB_SCORES: [keyof RecommendationItem["result"]["subScores"], string][] = [
  ["budgetFit", "Sesuai budget"],
  ["performance", "Performa"],
  ["portability", "Portabilitas"],
  ["value", "Nilai harga"],
]

export function budgetStatus(price: number, budget: number): { label: string; tone: "success" | "warning" } {
  if (price <= budget * 0.9) return { label: "Di bawah budget", tone: "success" }
  if (price <= budget) return { label: "Sesuai budget", tone: "success" }
  return { label: "Sedikit di atas budget", tone: "warning" }
}

export function BestMatch({
  item,
  total,
  budget,
  useCaseLabels,
  ownActivities,
  compared,
  saved,
  onCompareChange,
  onSaveChange,
}: {
  item: RecommendationItem
  total: number
  budget: number
  useCaseLabels: Record<string, string>
  ownActivities: string[]
  compared: boolean
  saved: boolean
  onCompareChange: () => void
  onSaveChange: () => void
}) {
  const { laptop, result } = item
  const name = `${laptop.brand} ${laptop.model}`
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const shown = reduce || inView
  const status = budgetStatus(laptop.priceIdr, budget)
  const tier = scoreTier(result.matchScore)
  const specs = [
    { Icon: CpuIcon, label: "Prosesor", value: laptop.cpu.name },
    { Icon: MemoryIcon, label: "RAM", value: `${laptop.ram.gb} GB` },
    { Icon: HardDrivesIcon, label: "SSD", value: formatStorage(laptop.storage.gb) },
    { Icon: BarbellIcon, label: "Berat", value: formatWeight(laptop.weightKg) },
  ]

  return (
    <motion.article
      ref={ref}
      aria-labelledby="best-match-title"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.55, ease: EASE_OUT }}
      className={cn(
        "grid overflow-hidden rounded-[24px] border bg-bg shadow-[0_24px_60px_-40px_rgba(0,52,235,0.35)]", // taste-skill-ignore: kartu hasil utama terangkat di atas header
        "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)_minmax(0,0.9fr)] lg:grid-rows-[1fr_auto]",
        compared ? "border-primary" : "border-border"
      )}
    >
      {/* Gambar */}
      <div className="p-4 pb-0 sm:p-6 sm:pb-0 lg:row-span-2 lg:pr-0 lg:pb-6">
        <motion.div
          className="h-full overflow-hidden rounded-[18px]"
          initial={reduce ? false : { scale: 0.97 }}
          animate={{ scale: shown ? 1 : 0.97 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <LaptopRender
            image={laptop.image}
            customSrc={laptop.customImageUrl || (laptop.imageUrl?.startsWith('http') ? laptop.imageUrl : undefined)}
            sizes="(min-width: 1024px) 26vw, 92vw"
            eager
            className="h-full min-h-[14rem]"
          />
        </motion.div>
      </div>

      {/* Info utama */}
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:col-start-2 lg:row-start-1 lg:p-8 lg:pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-signal px-3 py-1 type-micro font-semibold text-signal-ink">
            <StarIcon weight="fill" className="size-3.5" aria-hidden="true" /> Best Match
          </span>
          <span className="rounded-full border border-border px-3 py-1 type-micro text-text-muted">
            #1 dari <span className="num">{total}</span>
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h2 id="best-match-title" className="text-[1.75rem] leading-[1.1] font-extrabold tracking-[-0.035em] text-text md:text-[2.25rem]">
            <Link href={`/laptop/${laptop.slug}`} className="hover:text-primary">
              {name}
            </Link>
          </h2>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="num text-xl font-bold text-text">{formatRupiah(laptop.priceIdr)}</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 type-micro font-semibold",
                status.tone === "success" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
              )}
            >
              {status.label}
            </span>
          </p>
        </div>
        <p className="max-w-[30rem] type-body text-text-muted">{result.summary}</p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {specs.map(({ Icon, label, value }) => (
            <li key={label} className="flex items-start gap-2.5 rounded-[12px] border border-border p-3">
              <Icon weight="bold" className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex min-w-0 flex-col">
                <span className="type-micro text-text-muted">{label}</span>
                <span className="type-small font-semibold text-text">{value}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Skor + breakdown */}
      <div className="flex flex-col gap-5 border-t border-border bg-surface/60 p-5 sm:p-6 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:border-t-0 lg:border-l lg:p-7" /* taste-skill-ignore: pemisah panel skor */>
        <div className="flex items-center gap-4">
          <ScoreRing value={result.matchScore} size="lg" showLabel={false} />
          <div className="flex flex-col gap-0.5">
            <p className="text-xl font-extrabold tracking-[-0.02em] text-text">{tierLabel[tier]}</p>
            <ScoreExplainer
              example={result}
              exampleName={name}
              trigger={
                <button type="button" className="self-start type-small text-primary underline-offset-4 hover:underline">
                  Bagaimana skor dihitung?
                </button>
              }
            />
          </div>
        </div>
        <ul className="flex flex-col gap-3.5" aria-label="Rincian skor">
          {SUB_SCORES.map(([key, label], i) => {
            const v = result.subScores[key]
            return (
              <li key={key} className="flex flex-col gap-1.5">
                <span className="flex items-baseline justify-between type-small">
                  <span className="text-text">{label}</span>
                  <span className="num font-semibold text-text">{v}%</span>
                </span>
                <span className="h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
                  <span
                    className="block h-full origin-left rounded-full bg-primary transition-transform duration-[900ms] ease-out"
                    style={{ transform: `scaleX(${shown ? v / 100 : 0})`, transitionDelay: reduce ? "0ms" : `${200 + i * 80}ms` }}
                  />
                </span>
              </li>
            )
          })}
        </ul>
        {laptop.useCases.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="type-small font-semibold text-text">Cocok untuk</p>
            <ul className="flex flex-wrap gap-1.5">
              {laptop.useCases.map((u) => {
                const mine = ownActivities.includes(u)
                return (
                  <li
                    key={u}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 type-micro",
                      mine ? "bg-primary-soft font-semibold text-primary" : "border border-border text-text-muted"
                    )}
                  >
                    {mine && <CheckIcon weight="bold" className="size-3" aria-hidden="true" />}
                    {useCaseLabels[u] ?? u}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Tombol: di bawah info (lg), paling akhir di mobile. */}
      <div className="flex flex-wrap items-center gap-2 px-5 pb-6 sm:px-6 lg:col-start-2 lg:row-start-2 lg:px-8 lg:pb-8">
        <Button asChild variant="signal" className="h-12 rounded-[14px] px-5 hover:[&_[data-arrow]]:translate-x-1">
          <Link href={`/laptop/${laptop.slug}`}>
            Lihat alasan lengkap <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
          </Link>
        </Button>
        <Button
          variant="secondary"
          aria-pressed={compared}
          onClick={onCompareChange}
          className={cn("h-12 rounded-[14px] px-4", compared && "border-primary bg-primary-soft text-primary")}
        >
          {compared ? <CheckIcon weight="bold" aria-hidden="true" /> : <ArrowsLeftRightIcon weight="bold" aria-hidden="true" />}
          {compared ? "Dipilih" : "Bandingkan"}
        </Button>
        <BookmarkButton saved={saved} name={name} onToggle={onSaveChange} size="lg" />
      </div>
    </motion.article>
  )
}
