"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useInView, useReducedMotion, type Variants } from "motion/react"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { BriefcaseIcon } from "@phosphor-icons/react/dist/ssr/Briefcase"
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft"
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight"
import { ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock"
import { CodeIcon } from "@phosphor-icons/react/dist/ssr/Code"
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu"
import { FadersIcon } from "@phosphor-icons/react/dist/ssr/Faders"
import { GameControllerIcon } from "@phosphor-icons/react/dist/ssr/GameController"
import { GraduationCapIcon } from "@phosphor-icons/react/dist/ssr/GraduationCap"
import { GraphicsCardIcon } from "@phosphor-icons/react/dist/ssr/GraphicsCard"
import { HardDrivesIcon } from "@phosphor-icons/react/dist/ssr/HardDrives"
import { HeartIcon } from "@phosphor-icons/react/dist/ssr/Heart"
import { MemoryIcon } from "@phosphor-icons/react/dist/ssr/Memory"
import { PenNibIcon } from "@phosphor-icons/react/dist/ssr/PenNib"
import { PlayIcon } from "@phosphor-icons/react/dist/ssr/Play"
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle"
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star"
import { TargetIcon } from "@phosphor-icons/react/dist/ssr/Target"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle"
import { CountUp } from "@/components/landing/count-up"
import { Reveal } from "@/components/landing/reveal"
import type { LandingSample } from "@/components/landing/sample-data"
import { Button } from "@/components/ui/button"
import { LaptopRender } from "@/components/ui/laptop-render"
import { Slider } from "@/components/ui/slider"
import { formatRupiah, formatRupiahShort, formatStorage, rupiahToWords } from "@/lib/format"
import { EASE_OUT } from "@/lib/motion"
import { rehydrateSaved, useSavedHydrated, useSavedStore } from "@/store/saved"
import type { BudgetNeedId, LaptopColor, LaptopShape } from "@/types"

// "Satu budget. Banyak kemungkinan." (brief Fahren Okt 2026, mengikuti dua gambar referensi): kiri = budget +
// kebutuhan utama + CTA, kanan = pratinjau hasil 3 laptop. Laptop disaring harga ≤ budget + 10% (toleransi
// fleksibel seperti di Wizard) lalu diurutkan dengan angka kecocokan mock dari `getBudgetPreviewContent()`.
// Bukan perhitungan SAW. Gambar kartu = render ilustrasi katalog sebagai placeholder (lihat `assignRenders`).

type Preview = LandingSample["budgetPreview"]
type PreviewLaptop = Preview["laptops"][number]
type Pick = PreviewLaptop & { score: number; render: { shape: LaptopShape; color: LaptopColor } }

const PER_PAGE = 3
const MAX_PAGES = 3
const FLEX = 1.1

const NEED_ICON: Record<BudgetNeedId, typeof CodeIcon> = {
  coding: CodeIcon,
  desain: PenNibIcon,
  gaming: GameControllerIcon,
  kuliah: GraduationCapIcon,
  office: BriefcaseIcon,
}

/** Render cadangan, urut dari yang paling berbeda bentuknya. */
const RENDER_POOL: { shape: LaptopShape; color: LaptopColor }[] = [
  { shape: "ultrabook", color: "silver" },
  { shape: "mainstream", color: "navy" },
  { shape: "creator", color: "graphite" },
  { shape: "ultrabook", color: "mist" },
  { shape: "creator", color: "navy" },
  { shape: "mainstream", color: "graphite" },
  { shape: "mainstream", color: "silver" },
]

/**
 * Placeholder gambar: tiap halaman berisi tiga bentuk laptop berbeda (tipis, 14 inci, performa), bukan
 * laptop yang sama dengan warna lain (permintaan Fahren). Laptop memakai rendernya sendiri bila bentuknya
 * belum dipakai di halaman itu. Ganti dengan foto produk asli saat aset tersedia.
 */
function assignRenders(items: (PreviewLaptop & { score: number })[]): Pick[] {
  const out: Pick[] = []
  for (let start = 0; start < items.length; start += PER_PAGE) {
    const shapes = new Set<LaptopShape>()
    const keys = new Set<string>()
    for (const item of items.slice(start, start + PER_PAGE)) {
      const own = item.image
      const render =
        !shapes.has(own.shape)
          ? own
          : (RENDER_POOL.find((r) => !shapes.has(r.shape)) ?? RENDER_POOL.find((r) => !keys.has(`${r.shape}-${r.color}`)) ?? own)
      shapes.add(render.shape)
      keys.add(`${render.shape}-${render.color}`)
      out.push({ ...item, render })
    }
  }
  return out
}

function pickLaptops(laptops: PreviewLaptop[], budget: number, need: BudgetNeedId): Pick[] {
  const ranked = laptops
    .filter((l) => l.priceIdr <= budget * FLEX)
    .map((l) => ({ ...l, score: l.fit[need] }))
    .sort((a, b) => b.score - a.score || a.priceIdr - b.priceIdr)
    .slice(0, PER_PAGE * MAX_PAGES)
  return assignRenders(ranked)
}

export function InteractiveBudget({ sample }: { sample: LandingSample }) {
  const { needs, range, laptops } = sample.budgetPreview
  const reduce = useReducedMotion()
  const [budget, setBudget] = React.useState<number>(range.initial)
  const [needId, setNeedId] = React.useState<BudgetNeedId>("coding")
  const [page, setPage] = React.useState(0)
  const [dir, setDir] = React.useState(0)
  const need = needs.find((n) => n.id === needId)!

  const picks = React.useMemo(() => pickLaptops(laptops, budget, needId), [laptops, budget, needId])
  const pageCount = Math.max(1, Math.ceil(picks.length / PER_PAGE))
  const current = Math.min(page, pageCount - 1)
  const visible = picks.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE)
  const compromise = (picks[0]?.score ?? 0) < 80
  const atMax = budget >= range.max

  const panelRef = React.useRef<HTMLDivElement>(null)
  const entered = useInView(panelRef, { once: true, amount: 0.25 })

  function change(next: () => void) {
    setDir(0)
    setPage(0)
    next()
  }
  function go(step: number) {
    const target = Math.min(pageCount - 1, Math.max(0, current + step))
    if (target === current) return
    setDir(step)
    setPage(target)
  }

  const ctaHref = `/rekomendasi/budget?budget=${budget}${need.majorId ? `&jurusan=${need.majorId}` : ""}`

  return (
    <section aria-labelledby="satu-budget-title" className="relative isolate overflow-hidden bg-canvas py-20 md:py-28">
      {/* Aksen biru sangat tipis di kanan atas (diminta Fahren untuk section ini; bukan dekorasi blob). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(52% 46% at 82% 8%, rgba(18,56,245,0.07), rgba(18,56,245,0) 70%)", // taste-skill-ignore: aksen biru tipis (permintaan Fahren)
        }}
      />

      <div className="page-container grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:items-center xl:gap-12">
        {/* ------------------------------------------------ Kiri: budget → kebutuhan → CTA */}
        <div className="flex flex-col gap-7">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-canvas-line bg-white px-3.5 py-1.5 type-micro font-semibold tracking-[0.08em] text-ink-strong uppercase">
              <SparkleIcon weight="fill" className="size-3.5 text-data-blue" aria-hidden="true" />
              Budget & kebutuhan
            </p>
          </Reveal>
          <div className="flex flex-col gap-4">
            <Reveal variant="clip">
              <h2
                id="satu-budget-title"
                className="text-[2.25rem] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink-strong md:text-[3.5rem] xl:text-[3.25rem]"
              >
                Satu budget.
                <br />
                Banyak <span className="italic font-serif text-teal-600 font-normal">kemungkinan.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-[32rem] type-body-l text-ink-soft">
                Di harga yang sama, pilihan laptop bisa sangat berbeda tergantung kebutuhanmu. SPECO membantu kamu
                menemukan yang paling sesuai.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.16}>
            <div className="flex flex-col gap-6 rounded-[24px] border border-canvas-line bg-white p-5 md:p-7 xl:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="type-small text-ink-strong" id="budget-kamu">
                    Budget kamu
                  </p>
                  <p className="text-[2rem] leading-none font-extrabold tracking-[-0.03em] text-teal-700 tabular-nums">
                    {formatRupiah(budget)}
                    {atMax && "+"}
                  </p>
                </div>
                <Slider
                  aria-labelledby="budget-kamu"
                  thumbLabel="Budget kamu"
                  getValueText={(v) => `${rupiahToWords(v)}${v >= range.max ? " atau lebih" : ""}`}
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={[budget]}
                  onValueChange={([v]) => change(() => setBudget(v))}
                />
                <div className="flex justify-between type-small font-normal text-ink-soft" aria-hidden="true">
                  <span>{formatRupiahShort(range.min)}</span>
                  <span>{formatRupiahShort(range.max)}+</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="type-small text-ink-strong" id="kebutuhan-utama">
                  Kebutuhan utama
                </p>
                <div role="group" aria-labelledby="kebutuhan-utama" className="flex flex-wrap gap-1.5">
                  {needs.map((n) => {
                    const on = n.id === needId
                    const Icon = NEED_ICON[n.id]
                    return (
                      <button
                        key={n.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => change(() => setNeedId(n.id))}
                        className={cn(
                          "inline-flex h-11 items-center gap-1.5 rounded-[12px] border px-2.5 type-small transition-[color,background-color,border-color,transform] duration-[var(--motion-fast)] ease-out active:scale-[0.97]",
                          on
                            ? "border-teal-700 bg-teal-700 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-teal-300"
                        )}
                      >
                        <Icon weight={on ? "bold" : "regular"} className="size-[18px]" aria-hidden="true" />
                        {n.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.24} innerClassName="flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button asChild size="lg" className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-3 shadow-md transition-[background-color,transform] hover:-translate-y-0.5">
              <Link href={ctaHref}>
                Lihat rekomendasi sekarang <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Link
              href="#rekomendasi"
              className="group inline-flex min-h-11 items-center gap-3 rounded-full type-body font-semibold text-ink-strong"
            >
              <span className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-ink-strong transition-transform duration-300 ease-out group-hover:scale-105">
                <PlayIcon weight="fill" className="size-4 translate-x-px" aria-hidden="true" />
              </span>
              Lihat contoh hasil
            </Link>
          </Reveal>
        </div>

        {/* ------------------------------------------------ Kanan: pratinjau hasil */}
        <Reveal delay={0.12} className="min-w-0">
          <div
            ref={panelRef}
            className="relative rounded-[28px] border border-canvas-line bg-white p-5 shadow-[0_32px_64px_-40px_rgba(18,56,245,0.35)] md:p-7" // taste-skill-ignore: bayangan panel pratinjau (referensi Fahren)
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="type-small font-normal text-ink-soft">Contoh hasil rekomendasi</p>
                <h3 className="text-xl leading-tight font-bold tracking-[-0.02em] text-ink-strong md:text-2xl">
                  Paling cocok untuk budget{" "}
                  <span className="text-data-blue tabular-nums">
                    {formatRupiah(budget)}
                    {atMax && "+"}
                  </span>
                </h3>
              </div>
              <p className="inline-flex items-center gap-2 rounded-[12px] bg-data-blue/[0.06] px-3 py-2 type-small text-data-blue">
                {React.createElement(NEED_ICON[needId], { weight: "bold", className: "size-4", "aria-hidden": true })}
                Untuk {need.label.toLowerCase()}
              </p>
            </div>

            <p className="sr-only" aria-live="polite">
              {`${picks.length} laptop untuk ${need.label.toLowerCase()} dengan budget ${rupiahToWords(budget)}. Teratas: ${picks[0]?.name ?? "tidak ada"}, kecocokan ${picks[0]?.score ?? 0} persen.`}
            </p>

            {/* Desktop/tablet: halaman berisi 3 kartu, tombol panah di tepi panel. */}
            <div className="relative mt-6 hidden md:block">
              <ul className="grid grid-cols-3 gap-3 lg:gap-4">
                <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                  {visible.map((p, i) => (
                    <PreviewCard key={p.id} pick={p} best={current === 0 && i === 0} index={i} dir={dir} entered={entered} reduce={!!reduce} />
                  ))}
                </AnimatePresence>
              </ul>
              {pageCount > 1 && (
                <>
                  <PageArrow side="left" disabled={current === 0} onClick={() => go(-1)} />
                  <PageArrow side="right" disabled={current === pageCount - 1} onClick={() => go(1)} />
                </>
              )}
            </div>

            {/* Mobile: geser horizontal, semua hasil sekaligus. */}
            <ul className="-mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                {picks.map((p, i) => (
                  <PreviewCard
                    key={p.id}
                    pick={p}
                    best={i === 0}
                    index={Math.min(i, PER_PAGE)}
                    dir={0}
                    entered={entered}
                    reduce={!!reduce}
                    className="w-[78%] shrink-0 snap-start sm:w-[46%]"
                  />
                ))}
              </AnimatePresence>
            </ul>

            <AnimatePresence initial={false}>
              {compromise && (
                <motion.p
                  key={`note-${needId}`}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="mt-4 flex gap-2 rounded-[14px] bg-warning-soft p-3 type-small font-normal text-ink-strong"
                >
                  <WarningCircleIcon weight="fill" className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                  {need.compromiseNote}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-5 hidden items-center justify-between gap-4 md:flex">
              <div className="flex gap-1.5" aria-hidden="true">
                {Array.from({ length: pageCount }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-[width,background-color] duration-300 ease-out",
                      i === current ? "w-10 bg-data-blue" : "w-6 bg-canvas-line"
                    )}
                  />
                ))}
              </div>
              <p className="type-small font-normal text-ink-soft tabular-nums">
                <span className="sr-only">Halaman </span>
                {current + 1} / {pageCount}
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ------------------------------------------------ Tiga alasan singkat */}
      <Reveal delay={0.1} className="page-container mt-14 md:mt-20">
        <ul className="grid gap-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-canvas-line" /* taste-skill-ignore: pemisah vertikal sesuai referensi Fahren */>
          {[
            { Icon: TargetIcon, title: "Rekomendasi personal", text: "Berdasarkan kebutuhanmu, bukan sekadar harga." },
            { Icon: FadersIcon, title: "Perbandingan objektif", text: "Kriteria jelas dan bobotnya bisa kamu lihat." },
            { Icon: ClockIcon, title: "Hemat waktu", text: "5 pertanyaan, langsung dapat pilihan yang sesuai." },
          ].map(({ Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4 md:px-8 md:first:pl-0">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-data-blue/[0.07] text-data-blue">
                <Icon weight="bold" className="size-[22px]" aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="type-body font-semibold text-ink-strong">{title}</span>
                <span className="type-small font-normal text-ink-soft">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}

// ---------------------------------------------------------------- Kartu laptop

const cardVariants: Variants = {
  hidden: (c: { dir: number }) => ({ opacity: 0, x: c.dir * 32, y: c.dir === 0 ? 16 : 0 }),
  show: (c: { index: number }) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT, delay: c.index * 0.07 },
  }),
  exit: (c: { dir: number }) => ({
    opacity: 0,
    x: c.dir * -32,
    transition: { duration: 0.2, ease: EASE_OUT },
  }),
}

function PreviewCard({
  pick,
  best,
  index,
  dir,
  entered,
  reduce,
  className,
}: {
  pick: Pick
  best: boolean
  index: number
  dir: number
  entered: boolean
  reduce: boolean
  className?: string
}) {
  const custom = { dir, index }
  const strong = pick.score >= 80
  const specs = [
    { Icon: CpuIcon, text: pick.cpu },
    { Icon: MemoryIcon, text: `${pick.ramGb} GB RAM` },
    { Icon: HardDrivesIcon, text: `${formatStorage(pick.storageGb)} SSD` },
    { Icon: GraphicsCardIcon, text: pick.gpu },
  ]

  return (
    <motion.li
      layout={!reduce}
      custom={custom}
      variants={reduce ? undefined : cardVariants}
      initial={reduce ? false : "hidden"}
      animate={reduce || entered ? "show" : "hidden"}
      exit={reduce ? undefined : "exit"}
      transition={{ layout: { duration: 0.45, ease: EASE_OUT } }}
      className={cn("flex", className)}
    >
      <article
        className={cn(
          "group relative flex w-full flex-col rounded-[20px] border bg-white p-2.5 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(17,17,17,0.28)]", // taste-skill-ignore: bayangan muncul hanya saat hover
          best ? "border-data-blue ring-1 ring-data-blue" : "border-canvas-line hover:border-ink-soft/30"
        )}
      >
        <div className="relative overflow-hidden rounded-[14px]">
          <LaptopRender
            image={pick.render}
            sizes="(min-width: 1280px) 220px, (min-width: 768px) 30vw, 78vw"
            decorative
            className="rounded-[14px]"
            imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
          {best && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-data-blue px-2 py-1 type-micro font-semibold text-white">
              <StarIcon weight="fill" className="size-3" aria-hidden="true" />
              Paling cocok
            </span>
          )}
          <SaveButton laptopId={pick.id} name={pick.name} />
        </div>

        <div className="flex flex-1 flex-col gap-3 px-1.5 pt-3 pb-1">
          <h4 className="line-clamp-2 min-h-[2.5rem] type-small leading-5 font-semibold text-ink-strong">{pick.name}</h4>
          <p className="-mt-1 type-small font-bold text-data-blue tabular-nums">{formatRupiah(pick.priceIdr)}</p>
          {/* Kecocokan sebagai baris + bar tipis: tetap muat di kartu sempit (3 kolom di panel). */}
          <div className="flex flex-col gap-1.5" aria-label={`Kecocokan ${pick.score} persen`}>
            <p className="flex items-baseline justify-between gap-2" aria-hidden="true">
              <span className="type-micro text-ink-soft">Kecocokan</span>
              <CountUp
                value={pick.score}
                duration={0.6}
                suffix="%"
                className={cn("text-lg leading-none font-extrabold tracking-[-0.03em] tabular-nums", strong ? "text-success" : "text-warning")}
              />
            </p>
            <span className="h-1 overflow-hidden rounded-full bg-canvas-line" aria-hidden="true">
              <span
                className={cn(
                  "block h-full origin-left rounded-full transition-transform duration-500 ease-out",
                  strong ? "bg-success" : "bg-warning"
                )}
                style={{ transform: `scaleX(${pick.score / 100})` }}
              />
            </span>
          </div>
          <ul className="flex flex-col gap-1.5 pt-1">
            {specs.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-2 type-micro text-ink-soft">
                <Icon className="size-3.5 shrink-0 text-ink-strong/70" aria-hidden="true" />
                <span className="truncate">{text}</span>
              </li>
            ))}
          </ul>
          <Link
            href={`/laptop/${pick.slug}`}
            className="mt-auto inline-flex h-10 items-center justify-center gap-1.5 rounded-[12px] bg-data-blue/[0.06] type-small font-semibold text-data-blue transition-colors duration-200 hover:bg-data-blue/[0.12]"
          >
            Lihat detail
            <span className="sr-only"> {pick.name}</span>
            <ArrowRightIcon weight="bold" className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </article>
    </motion.li>
  )
}

function SaveButton({ laptopId, name }: { laptopId: string; name: string }) {
  const hydrated = useSavedHydrated()
  const saved = useSavedStore((s) => s.saved.some((x) => x.laptopId === laptopId))
  const toggle = useSavedStore((s) => s.toggle)
  React.useEffect(() => rehydrateSaved(), [])
  const on = hydrated && saved

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Hapus ${name} dari simpanan` : `Simpan ${name}`}
      onClick={() => toggle(laptopId)}
      className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-white text-ink-strong transition-transform duration-200 ease-out hover:scale-105 active:scale-95"
    >
      <HeartIcon weight={on ? "fill" : "regular"} className={cn("size-4", on && "text-data-blue")} aria-hidden="true" />
    </button>
  )
}

function PageArrow({ side, disabled, onClick }: { side: "left" | "right"; disabled: boolean; onClick: () => void }) {
  const Icon = side === "left" ? CaretLeftIcon : CaretRightIcon
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Laptop sebelumnya" : "Laptop berikutnya"}
      className={cn(
        "absolute top-[38%] z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-canvas-line bg-white text-ink-strong transition-[opacity,transform] duration-200 ease-out hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-0",
        side === "left" ? "-left-5 xl:-left-[2.6rem]" : "-right-5 xl:-right-[2.6rem]"
      )}
    >
      <Icon weight="bold" className="size-4" aria-hidden="true" />
    </button>
  )
}
