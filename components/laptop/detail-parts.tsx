"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react"
import { cn } from "cn"
import type { Icon } from "@phosphor-icons/react"
import { ArrowDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowDown"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowsLeftRight"
import { BarbellIcon } from "@phosphor-icons/react/dist/ssr/Barbell"
import { BatteryFullIcon } from "@phosphor-icons/react/dist/ssr/BatteryFull"
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown"
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft"
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu"
import { GraphicsCardIcon } from "@phosphor-icons/react/dist/ssr/GraphicsCard"
import { HardDrivesIcon } from "@phosphor-icons/react/dist/ssr/HardDrives"
import { MemoryIcon } from "@phosphor-icons/react/dist/ssr/Memory"
import { MinusIcon } from "@phosphor-icons/react/dist/ssr/Minus"
import { MonitorIcon } from "@phosphor-icons/react/dist/ssr/Monitor"
import { PlugsIcon } from "@phosphor-icons/react/dist/ssr/Plugs"
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star"
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning"
import { FullSpecs } from "@/components/laptop/full-specs"
import { componentMeta } from "@/components/profile/requirement-card"
import { BookmarkButton } from "@/components/results/bookmark-button"
import { budgetStatus } from "@/components/results/best-match"
import { categoryLabels } from "@/components/results/laptop-card"
import { reasonIcon } from "@/components/results/results-sections"
import { ScoreRing, scoreTier, tierLabel } from "@/components/results/score-ring"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LaptopRender } from "@/components/ui/laptop-render"
import { getWizardOptions } from "@/lib/api"
import { formatDecimal, formatRupiah, formatStorage, formatWeight } from "@/lib/format"
import { ANGLE_LABEL, availableAngles } from "@/lib/laptop-image"
import { EASE_OUT } from "@/lib/motion"
import type { SpecCheckResult } from "@/lib/spec-check"
import type { Laptop, LaptopAngle, RecommendationResult, RequirementProfile } from "@/types"

// Bagian halaman Detail (brief REDESIGN DETAIL + referensi Fahren, Okt 2026; PRD §19, §27): laporan rekomendasi
// personal, bukan halaman toko. Semua isi dari data (laptop, hasil, Profil Kebutuhan, spec-check); tidak ada SAW.

const { criterionLabels, activities } = getWizardOptions()
const activityLabel = Object.fromEntries(activities.map((a) => [a.id, a.label])) as Record<string, string>
const inch = (n: number) => `${String(n).replace(".", ",")}″`

function useOnceInView<T extends Element>(amount = 0.3) {
  const reduce = useReducedMotion()
  const ref = React.useRef<T>(null)
  const inView = useInView(ref, { once: true, amount })
  return { ref, shown: !!reduce || inView, reduce: !!reduce }
}

function SectionHead({ id, eyebrow, title, desc, action }: { id: string; eyebrow?: string; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex max-w-[40rem] flex-col gap-1.5">
        {eyebrow && <p className="type-micro font-semibold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>}
        <h2 id={id} className="text-2xl leading-8 font-extrabold tracking-[-0.03em] text-text md:text-[1.75rem]">
          {title}
        </h2>
        {desc && <p className="type-body text-text-muted">{desc}</p>}
      </div>
      {action}
    </div>
  )
}

// ---------------------------------------------------------------- Galeri

/** 1 gambar utama + panah + thumbnail kecil; panah kiri/kanan keyboard; crossfade ringan, tanpa autoplay. */
export function Gallery({ name, laptop }: { name: string; laptop: Laptop }) {
  const reduce = useReducedMotion()
  const angles = availableAngles(laptop.image)
  const [index, setIndex] = React.useState(0)
  const angle: LaptopAngle = angles[index] ?? "34"
  const go = (i: number) => setIndex(Math.max(0, Math.min(angles.length - 1, i)))
  const arrow = (dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= angles.length) return null
    const IconC = dir < 0 ? CaretLeftIcon : CaretRightIcon
    return (
      <button
        type="button"
        onClick={() => go(target)}
        aria-label={dir < 0 ? "Gambar sebelumnya" : "Gambar berikutnya"}
        className={cn(
          "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/95 text-text transition-[opacity,transform] duration-150 ease-out hover:scale-105 active:scale-95",
          dir < 0 ? "left-3" : "right-3"
        )}
      >
        <IconC weight="bold" className="size-4" aria-hidden="true" />
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-roledescription="galeri"
        aria-label={`Gambar ilustrasi ${name}`}
        tabIndex={angles.length > 1 ? 0 : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(index - 1)
          if (e.key === "ArrowRight") go(index + 1)
        }}
        className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-studio"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={angle}
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <LaptopRender
              image={laptop.image}
              customSrc={index === 0 ? (laptop.customImageUrl || (laptop.imageUrl?.startsWith('http') ? laptop.imageUrl : undefined)) : undefined}
              angle={angle}
              sizes="(min-width: 1024px) 34vw, 92vw"
              eager={index === 0}
              className="h-full"
            />
          </motion.div>
        </AnimatePresence>
        {arrow(-1)}
        {arrow(1)}
        <p className="sr-only" aria-live="polite">
          Gambar {index + 1} dari {angles.length}: tampak {ANGLE_LABEL[angle].toLowerCase()}
        </p>
      </div>
      {angles.length > 1 && (
        <div role="group" aria-label="Pilih sudut" className="flex justify-center gap-2">
          {angles.map((a, i) => (
            <button
              key={a}
              type="button"
              aria-pressed={i === index}
              aria-label={`Tampak ${ANGLE_LABEL[a].toLowerCase()}`}
              onClick={() => go(i)}
              className={cn(
                "w-16 overflow-hidden rounded-[10px] border-2 transition-colors duration-150 sm:w-[4.5rem]",
                i === index ? "border-primary" : "border-transparent opacity-80 hover:border-border-strong hover:opacity-100"
              )}
            >
              <LaptopRender image={laptop.image} angle={a} sizes="80px" label={false} decorative />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- Hero

const SUB_SCORES: [keyof RecommendationResult["subScores"], string][] = [
  ["budgetFit", "Sesuai budget"],
  ["performance", "Performa"],
  ["portability", "Portabilitas"],
  ["value", "Nilai harga"],
]

export function DetailHero({
  laptop,
  result,
  rank,
  total,
  budget,
  hasProfile,
  compared,
  saved,
  onCompare,
  onSave,
  wizardHref,
}: {
  laptop: Laptop
  result?: RecommendationResult
  rank?: number
  total?: number
  budget?: number
  hasProfile: boolean
  compared: boolean
  saved: boolean
  onCompare: () => void
  onSave: () => void
  wizardHref: string
}) {
  const reduce = useReducedMotion()
  const name = `${laptop.brand} ${laptop.model}`
  const status = budget ? budgetStatus(laptop.priceIdr, budget) : null
  const up = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: EASE_OUT, delay } })
  const highlights = [
    { Icon: CpuIcon, label: "Prosesor", value: laptop.cpu.name },
    { Icon: MemoryIcon, label: "RAM", value: `${laptop.ram.gb} GB` },
    { Icon: HardDrivesIcon, label: "SSD", value: formatStorage(laptop.storage.gb) },
    { Icon: BarbellIcon, label: "Berat", value: formatWeight(laptop.weightKg) },
  ]

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.78fr)] lg:gap-8">
      {/* Galeri: paling atas di mobile, tengah di desktop. */}
      <motion.div
        className="lg:order-2"
        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <Gallery name={name} laptop={laptop} />
      </motion.div>

      {/* Info */}
      <div className="flex flex-col gap-5 lg:order-1">
        <motion.div {...up(0)} className="flex flex-wrap items-center gap-2">
          {rank === 1 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal px-3 py-1 type-micro font-semibold text-signal-ink">
              <StarIcon weight="fill" className="size-3.5" aria-hidden="true" /> Best Match
            </span>
          ) : result?.category ? (
            <span className="rounded-full bg-primary-soft px-3 py-1 type-micro font-semibold text-primary">{categoryLabels[result.category]}</span>
          ) : null}
          {rank && total && (
            <span className="rounded-full border border-border bg-bg px-3 py-1 type-micro text-text-muted">
              #{rank} dari <span className="num">{total}</span>
            </span>
          )}
        </motion.div>
        <motion.div {...up(0.05)} className="flex flex-col gap-2">
          <h1 className="text-[2rem] leading-[1.08] font-extrabold tracking-[-0.04em] text-text md:text-[2.5rem]">{name}</h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="num text-xl font-bold text-text">{formatRupiah(laptop.priceIdr)}</span>
            {status && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 type-micro font-semibold",
                  status.tone === "success" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
                )}
              >
                {status.label}
              </span>
            )}
          </p>
        </motion.div>
        {result && (
          <motion.p {...up(0.1)} className="max-w-[30rem] type-body text-text-muted">
            {result.summary}
          </motion.p>
        )}
        <motion.ul {...up(0.14)} className="grid grid-cols-2 gap-2">
          {highlights.map(({ Icon, label, value }) => (
            <li key={label} className="flex items-start gap-2.5 rounded-[12px] border border-border bg-bg p-3">
              <Icon weight="bold" className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex min-w-0 flex-col">
                <span className="type-micro text-text-muted">{label}</span>
                <span className="type-small font-semibold text-text">{value}</span>
              </span>
            </li>
          ))}
        </motion.ul>
        <motion.div {...up(0.18)} className="hidden items-center gap-2 lg:flex">
          <Button
            variant="signal"
            aria-pressed={compared}
            onClick={onCompare}
            className="h-12 rounded-[14px] px-5 transition-[background-color,transform] duration-200 hover:scale-[1.01]"
          >
            {compared ? <CheckIcon weight="bold" aria-hidden="true" /> : <ArrowsLeftRightIcon weight="bold" aria-hidden="true" />}
            {compared ? "Dipilih untuk dibandingkan" : "Bandingkan"}
          </Button>
          <BookmarkButton saved={saved} name={name} onToggle={onSave} size="lg" />
        </motion.div>
        {result && (
          <a href="#alasan" className="group inline-flex min-h-11 items-center gap-1.5 self-start type-small font-semibold text-primary">
            Lihat alasan lengkap
            <ArrowDownIcon weight="bold" className="size-3.5 transition-transform duration-200 group-hover:translate-y-0.5" aria-hidden="true" />
          </a>
        )}
      </div>

      {/* Panel skor */}
      <motion.div {...up(0.12)} className="lg:order-3">
        {result ? (
          <ScorePanel result={result} />
        ) : (
          <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-bg p-6">
            <p className="type-body font-semibold text-text">Belum ada skor kecocokan</p>
            <p className="type-small font-normal text-text-muted">
              {hasProfile
                ? "Laptop ini tidak masuk rekomendasi untuk profilmu. Daftar periksa kebutuhan di bawah tetap bisa kamu lihat."
                : "Jawab 5 pertanyaan agar SPECO bisa menilai seberapa cocok laptop ini dengan kebutuhanmu."}
            </p>
            {!hasProfile && (
              <Button asChild className="self-start rounded-[12px]">
                <Link href={wizardHref}>Cari tahu kecocokannya</Link>
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function ScorePanel({ result }: { result: RecommendationResult }) {
  const { ref, shown, reduce } = useOnceInView<HTMLDivElement>(0.4)
  const tier = scoreTier(result.matchScore)
  return (
    <div ref={ref} className="flex flex-col gap-5 rounded-[20px] border border-border bg-bg p-6">
      <div className="flex items-center gap-4">
        <ScoreRing value={result.matchScore} size="lg" showLabel={false} />
        <div className="flex flex-col">
          <p className="text-lg font-extrabold tracking-[-0.02em] text-primary">{tierLabel[tier]}</p>
          <p className="type-small font-normal text-text-muted">untuk kebutuhanmu</p>
        </div>
      </div>
      <ul className="flex flex-col gap-3" aria-label="Ringkasan skor">
        {SUB_SCORES.map(([key, label], i) => {
          const v = result.subScores[key]
          return (
            <li key={key} className="flex flex-col gap-1.5">
              <span className="flex justify-between type-small">
                <span className="text-text">{label}</span>
                <span className="num font-semibold text-text">{v}%</span>
              </span>
              <Bar value={v} shown={shown} reduce={reduce} delay={i * 70} />
            </li>
          )
        })}
      </ul>
      <a href="#skor" className="group inline-flex items-center gap-1 self-start type-small font-semibold text-primary">
        Bagaimana skor dihitung?
        <ArrowRightIcon weight="bold" className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
      </a>
    </div>
  )
}

function Bar({ value, shown, reduce, delay = 0, thick = false }: { value: number; shown: boolean; reduce: boolean; delay?: number; thick?: boolean }) {
  return (
    <span className={cn("block overflow-hidden rounded-full bg-border", thick ? "h-2" : "h-1.5")} aria-hidden="true">
      <span
        className="block h-full origin-left rounded-full bg-primary transition-transform duration-700 ease-out"
        style={{ transform: `scaleX(${shown ? value / 100 : 0})`, transitionDelay: reduce ? "0ms" : `${150 + delay}ms` }}
      />
    </span>
  )
}

// ---------------------------------------------------------------- Kenapa cocok + trade-off

export function ReasonPanel({ result }: { result: RecommendationResult }) {
  const { ref, shown, reduce } = useOnceInView<HTMLElement>(0.2)
  return (
    <section ref={ref} id="alasan" aria-labelledby="alasan-title" className="flex scroll-mt-24 flex-col gap-6 rounded-[24px] border border-primary/10 bg-primary-soft/40 p-5 md:p-8">
      <SectionHead id="alasan-title" eyebrow="Kenapa SPECO memilih laptop ini?" title="Cocok untuk kebutuhanmu" desc={result.summary} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {result.reasons.map((r, i) => {
          const IconC = reasonIcon(r.text)
          return (
            <motion.li
              key={r.text}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.4, ease: EASE_OUT, delay: reduce ? 0 : i * 0.06 }}
              className="flex gap-3 rounded-[16px] border border-border bg-bg p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-22px_rgba(17,17,17,0.35)]" // taste-skill-ignore: bayangan hanya saat hover
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-primary-soft text-primary">
                <IconC weight="bold" className="size-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="type-small font-semibold text-text">{r.text}</span>
                <span className="type-small font-normal text-text-muted">{r.source}</span>
              </span>
            </motion.li>
          )
        })}
      </ul>
      {result.tradeOffs.length > 0 && (
        <div className="flex gap-3 rounded-[16px] border border-warning/20 bg-warning-soft p-4">
          <WarningIcon weight="fill" className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="type-small font-semibold text-warning">Ada yang perlu diperhatikan</p>
            <ul className="flex flex-col gap-1">
              {result.tradeOffs.map((t) => (
                <li key={t.text} className="type-small font-normal text-text">
                  <span className="font-semibold">{t.text}.</span> {t.source}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------- Kebutuhanmu vs laptop ini

const STATUS: Record<SpecCheckResult["status"], { label: string; cls: string; Icon: Icon }> = {
  met: { label: "Memenuhi", cls: "bg-success-soft text-success", Icon: CheckIcon },
  short: { label: "Di bawah minimum", cls: "bg-warning-soft text-warning", Icon: WarningIcon },
  unchecked: { label: "Tidak dicek", cls: "bg-surface text-text-muted", Icon: MinusIcon },
}

function StatusChip({ status }: { status: SpecCheckResult["status"] }) {
  const { label, cls, Icon: IconC } = STATUS[status]
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 type-micro font-semibold whitespace-nowrap", cls)}>
      <IconC weight="bold" className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}

export function NeedsTable({ requirement, checks }: { requirement: RequirementProfile; checks: SpecCheckResult[] }) {
  const rows = requirement.specs.map((spec) => ({ spec, check: checks.find((c) => c.component === spec.component)! }))
  const checked = checks.filter((c) => c.status !== "unchecked")
  const met = checked.filter((c) => c.status === "met").length
  return (
    <section aria-labelledby="kebutuhan-title" className="flex flex-col gap-5">
      <SectionHead
        id="kebutuhan-title"
        title="Kebutuhanmu vs laptop ini"
        desc={`Spek minimum dari Profil Kebutuhanmu dibandingkan dengan laptop ini. Memenuhi ${met} dari ${checked.length} yang diperiksa.`}
      />
      {/* md+: tabel */}
      <div className="hidden overflow-hidden rounded-[18px] border border-border bg-bg md:block">
        <table className="w-full type-small">
          <caption className="sr-only">Kebutuhanmu dibandingkan dengan laptop ini</caption>
          <thead>
            <tr className="border-b border-border bg-surface/60 text-left" /* taste-skill-ignore: garis tabel */>
              <th scope="col" className="px-4 py-3 font-semibold text-text">Komponen</th>
              <th scope="col" className="px-4 py-3 font-semibold text-text">Kebutuhanmu</th>
              <th scope="col" className="px-4 py-3 font-semibold text-text">Laptop ini</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-text">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ spec, check }) => {
              const { label, icon: IconC } = componentMeta[spec.component]
              return (
                <tr key={spec.component} className="border-b border-border last:border-0" /* taste-skill-ignore: garis tabel */>
                  <th scope="row" className="px-4 py-3.5 text-left font-medium text-text">
                    <span className="flex items-center gap-2">
                      <IconC className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                      {label}
                    </span>
                  </th>
                  <td className="px-4 py-3.5 text-text-muted">{spec.minimum}</td>
                  <td className="px-4 py-3.5 text-text">{check.actual}</td>
                  <td className="px-4 py-3.5 text-right">
                    <StatusChip status={check.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile: kartu bertumpuk */}
      <ul className="flex flex-col gap-2 md:hidden">
        {rows.map(({ spec, check }) => {
          const { label, icon: IconC } = componentMeta[spec.component]
          return (
            <li key={spec.component} className="flex flex-col gap-2 rounded-[14px] border border-border bg-bg p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 type-small font-semibold text-text">
                  <IconC className="size-4 text-text-muted" aria-hidden="true" /> {label}
                </span>
                <StatusChip status={check.status} />
              </div>
              <p className="type-small font-normal text-text-muted">
                <span className="font-semibold text-text">Kebutuhanmu:</span> {spec.minimum}
              </p>
              <p className="type-small font-normal text-text-muted">
                <span className="font-semibold text-text">Laptop ini:</span> {check.actual}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// ---------------------------------------------------------------- Kenapa skornya X%?

export function ScoreWhy({ result }: { result: RecommendationResult }) {
  const { ref, shown, reduce } = useOnceInView<HTMLElement>(0.3)
  const [open, setOpen] = React.useState(false)
  const panelId = React.useId()
  const rows = [...result.breakdown].sort((a, b) => b.weight - a.weight)
  const total = rows.reduce((sum, r) => sum + (r.weight * r.score) / 100, 0)
  const tier = scoreTier(result.matchScore)

  return (
    <section ref={ref} id="skor" aria-labelledby="skor-title" className="flex scroll-mt-24 flex-col gap-5 rounded-[20px] border border-border bg-bg p-5 md:p-6">
      <SectionHead
        id="skor-title"
        title={`Kenapa skornya ${result.matchScore}%?`}
        desc="Tiap kriteria diberi skor 0–100, lalu dikalikan bobot dari prioritasmu."
      />
      <ul className="flex flex-col gap-3.5" aria-label="Rincian skor per kriteria">
        {rows.map((r, i) => (
          <li key={r.criterion} className="flex flex-col gap-1.5">
            <span className="flex items-baseline justify-between gap-2 type-small">
              <span className="text-text">
                {criterionLabels[r.criterion]}
                <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 type-micro text-primary">
                  <span className="sr-only">bobot </span>
                  <span className="num">{r.weight}%</span>
                </span>
              </span>
              <span className="num font-semibold text-text">
                <span className="sr-only">skor </span>
                {r.score}
              </span>
            </span>
            <Bar value={r.score} shown={shown} reduce={reduce} delay={i * 60} thick />
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3 rounded-[14px] bg-primary-soft/60 p-3">
        <ScoreRing value={result.matchScore} size="sm" />
        <p className="type-small text-text">
          <span className="font-semibold text-primary">{tierLabel[tier]}</span> untuk kebutuhanmu
        </p>
      </div>
      <div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex min-h-11 items-center gap-1.5 type-small font-semibold text-primary"
        >
          Bagaimana skor dihitung?
          <CaretDownIcon weight="bold" className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              key="how"
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <ol className="flex list-decimal flex-col gap-1.5 pt-1 pl-5 type-small font-normal text-text-muted">
                <li>Prioritasmu diubah menjadi bobot per kriteria (totalnya 100%).</li>
                <li>Tiap laptop diberi skor 0–100 di setiap kriteria, dibandingkan dengan laptop lain di katalog.</li>
                <li>Skor dikalikan bobotnya lalu dijumlahkan (metode Simple Additive Weighting).</li>
                <li>
                  Untuk laptop ini: Σ bobot × skor = <span className="num text-text">{formatDecimal(total)}</span> ≈{" "}
                  <span className="num font-semibold text-text">{result.matchScore}%</span>. Angka dari data contoh.
                </li>
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- Spesifikasi

export function SpecGrid({ laptop: l }: { laptop: Laptop }) {
  const tiles: { Icon: Icon; label: string; value: string; note: string }[] = [
    { Icon: CpuIcon, label: "Prosesor", value: l.cpu.name, note: `${l.cpu.cores} core / ${l.cpu.threads} thread` },
    { Icon: MemoryIcon, label: "RAM", value: `${l.ram.gb} GB ${l.ram.type}`, note: l.ram.upgradeable ? `Bisa sampai ${l.ram.maxGb} GB` : "Tidak bisa ditambah" },
    { Icon: HardDrivesIcon, label: "Penyimpanan", value: formatStorage(l.storage.gb), note: l.storage.type },
    { Icon: GraphicsCardIcon, label: "GPU", value: l.gpu.name, note: l.gpu.type === "dedicated" ? `Terpisah, ${l.gpu.vramGb} GB VRAM` : "Terintegrasi" },
    { Icon: MonitorIcon, label: "Layar", value: `${inch(l.display.inch)} ${l.display.panel}`, note: `${l.display.resolution.replace("x", " × ")} · ${l.display.srgbPercent}% sRGB` },
    { Icon: BatteryFullIcon, label: "Baterai", value: `${l.batteryWh} Wh`, note: "Makin besar makin lama tanpa colokan" },
    { Icon: BarbellIcon, label: "Berat", value: formatWeight(l.weightKg), note: l.weightKg <= 1.4 ? "Ringan dibawa harian" : "Lebih berat untuk dibawa" },
    { Icon: PlugsIcon, label: "Port", value: `${l.ports.length} port`, note: l.ports.slice(0, 3).join(", ") + (l.ports.length > 3 ? ", …" : "") },
  ]
  return (
    <section aria-labelledby="spek-title" className="flex flex-col gap-5">
      <SectionHead
        id="spek-title"
        title="Spesifikasi"
        action={
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="group inline-flex min-h-11 items-center gap-1.5 type-small font-semibold text-primary">
                Lihat spesifikasi lengkap
                <ArrowRightIcon weight="bold" className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Spesifikasi lengkap</DialogTitle>
                <DialogDescription>
                  {l.brand} {l.model} · data contoh
                </DialogDescription>
              </DialogHeader>
              <FullSpecs laptop={l} />
            </DialogContent>
          </Dialog>
        }
      />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(({ Icon: IconC, label, value, note }) => (
          <li key={label} className="flex flex-col gap-1.5 rounded-[16px] border border-border bg-bg p-4">
            <span className="flex items-center gap-2 type-micro text-text-muted">
              <IconC weight="bold" className="size-4 text-primary" aria-hidden="true" /> {label}
            </span>
            <span className="type-small font-semibold text-text">{value}</span>
            <span className="type-micro font-normal text-text-muted">{note}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ---------------------------------------------------------------- Kelebihan & kekurangan

export function ProsConsPanel({ laptop, ownActivities }: { laptop: Laptop; ownActivities: string[] }) {
  return (
    <section aria-labelledby="plusminus-title" className="flex flex-col gap-5">
      <SectionHead id="plusminus-title" title="Kelebihan & kekurangan" />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-[18px] border border-border bg-bg p-5">
          <h3 className="type-body font-semibold text-text">Kelebihan</h3>
          <ul className="flex flex-col gap-2">
            {laptop.pros.map((p) => (
              <li key={p} className="flex gap-2.5 type-small font-normal text-text">
                <CheckIcon weight="bold" className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                <span>
                  <span className="sr-only">Kelebihan: </span>
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3 rounded-[18px] border border-border bg-bg p-5">
          <h3 className="type-body font-semibold text-text">Kekurangan</h3>
          <ul className="flex flex-col gap-2">
            {laptop.cons.map((c) => (
              <li key={c} className="flex gap-2.5 type-small font-normal text-text">
                <WarningIcon weight="bold" className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                <span>
                  <span className="sr-only">Kekurangan: </span>
                  {c}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {laptop.useCases.length > 0 && (
        <p className="flex flex-wrap items-center gap-1.5 type-small text-text-muted">
          <span className="mr-1 font-semibold text-text">Cocok untuk:</span>
          {laptop.useCases.map((u) => {
            const mine = ownActivities.includes(u)
            return (
              <span
                key={u}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 type-micro",
                  mine ? "bg-primary-soft font-semibold text-primary" : "border border-border text-text-muted"
                )}
              >
                {mine && <CheckIcon weight="bold" className="size-3" aria-hidden="true" />}
                {activityLabel[u] ?? u}
              </span>
            )
          })}
        </p>
      )}
    </section>
  )
}
