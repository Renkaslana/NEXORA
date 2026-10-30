"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowsLeftRight"
import { BatteryFullIcon } from "@phosphor-icons/react/dist/ssr/BatteryFull"
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu"
import { FeatherIcon } from "@phosphor-icons/react/dist/ssr/Feather"
import { HardDrivesIcon } from "@phosphor-icons/react/dist/ssr/HardDrives"
import { MemoryIcon } from "@phosphor-icons/react/dist/ssr/Memory"
import { MonitorIcon } from "@phosphor-icons/react/dist/ssr/Monitor"
import { ScalesIcon } from "@phosphor-icons/react/dist/ssr/Scales"
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle"
import { WalletIcon } from "@phosphor-icons/react/dist/ssr/Wallet"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle"
import { XIcon } from "@phosphor-icons/react/dist/ssr/X"
import type { Icon } from "@phosphor-icons/react"
import { BookmarkButton } from "@/components/results/bookmark-button"
import { compareHref } from "@/lib/routes"
import { categoryLabels } from "@/components/results/laptop-card"
import { ScoreRing } from "@/components/results/score-ring"
import { Button } from "@/components/ui/button"
import { LaptopRender } from "@/components/ui/laptop-render"
import type { RecommendationItem } from "@/lib/api"
import { formatRupiah, formatStorage } from "@/lib/format"
import { EASE_OUT } from "@/lib/motion"
import { useCompareStore } from "@/store/compare"

// Bagian halaman Hasil setelah Best Match (brief Hasil §6–9, §14): alasan, alternatif + filter/urutan,
// CTA bandingkan, dan bar bandingkan yang menempel di bawah. Semua isi berasal dari data hasil rekomendasi.

export interface CardState {
  compared: boolean
  saved: boolean
  onCompareChange: () => void
  onSaveChange: () => void
}

// ---------------------------------------------------------------- Kenapa direkomendasikan

export function reasonIcon(text: string): Icon {
  if (/budget|harga/i.test(text)) return WalletIcon
  if (/ringan|kg|bawa|portab/i.test(text)) return FeatherIcon
  if (/baterai/i.test(text)) return BatteryFullIcon
  if (/layar|warna|srgb/i.test(text)) return MonitorIcon
  if (/ram|ssd|cpu|prosesor|gpu|performa/i.test(text)) return CpuIcon
  return SparkleIcon
}

export function ReasonCards({ item }: { item: RecommendationItem }) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const { reasons, tradeOffs } = item.result
  return (
    <section ref={ref} aria-labelledby="alasan-title" className="flex flex-col gap-5">
      <h2 id="alasan-title" className="text-2xl leading-8 font-extrabold tracking-[-0.03em] text-text md:text-[1.75rem]">
        Kenapa laptop ini direkomendasikan?
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.slice(0, 4).map((r, i) => {
          const Icon = reasonIcon(r.text)
          return (
            <motion.li
              key={r.text}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={reduce || inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: reduce ? 0 : i * 0.07 }}
              className="flex flex-col gap-3 rounded-[18px] border border-border bg-bg p-5"
            >
              <span className="flex size-11 items-center justify-center rounded-[12px] bg-primary-soft text-primary">
                <Icon weight="bold" className="size-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="type-body font-semibold text-text">{r.text}</span>
                <span className="type-small font-normal text-text-muted">{r.source}</span>
              </span>
            </motion.li>
          )
        })}
      </ul>
      {tradeOffs.length > 0 && (
        <p className="flex gap-2.5 rounded-[14px] bg-warning-soft px-4 py-3 type-small font-normal text-text">
          <WarningCircleIcon weight="fill" className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          <span>
            <span className="font-semibold">Yang perlu kamu tahu: </span>
            {tradeOffs.map((t) => `${t.text}. ${t.source}`).join(" ")}
          </span>
        </p>
      )}
    </section>
  )
}

// ---------------------------------------------------------------- Alternatif

export type SortKey = "skor" | "harga" | "performa" | "portabilitas"

const SORTS: { id: SortKey; label: string }[] = [
  { id: "skor", label: "Skor tertinggi" },
  { id: "harga", label: "Harga terendah" },
  { id: "performa", label: "Performa" },
  { id: "portabilitas", label: "Portabilitas" },
]

const MAX_BRAND_PILLS = 4

/**
 * Satu keunggulan per laptop yang dihitung dari data hasil (maks/min biasa, seperti "Unggul" di Komparasi,
 * bukan SAW): paling ringan, paling hemat, baterai terbesar, CPU tertinggi. Kategori hasil dipakai lebih dulu.
 */
export function highlights(items: RecommendationItem[]) {
  const pick = (score: (i: RecommendationItem) => number) => items.reduce((a, b) => (score(b) > score(a) ? b : a)).laptop.id
  const derived: Record<string, string> = {}
  const add = (id: string, label: string) => {
    if (!derived[id]) derived[id] = label
  }
  add(pick((i) => -i.laptop.weightKg), "Paling ringan")
  add(pick((i) => -i.laptop.priceIdr), "Paling hemat")
  add(pick((i) => i.laptop.batteryWh), "Baterai terbesar")
  add(pick((i) => i.laptop.cpu.benchScore), "CPU tertinggi")
  return derived
}

export function AlternativeCard({ item, rank, extra, state, index }: { item: RecommendationItem; rank: number; extra?: string; state: CardState; index: number }) {
  const { laptop, result } = item
  const name = `${laptop.brand} ${laptop.model}`
  const reduce = useReducedMotion()
  const badges = [result.category ? categoryLabels[result.category] : null, extra].filter(
    (b, i, all): b is string => !!b && all.indexOf(b) === i
  )

  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.4, ease: EASE_OUT, delay: reduce ? 0 : index * 0.06, layout: { duration: 0.35, ease: EASE_OUT } }}
    >
      <article
        className={cn(
          "group flex h-full flex-col rounded-[20px] border bg-bg p-3 transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_-26px_rgba(17,17,17,0.35)]", // taste-skill-ignore: bayangan hanya saat hover
          state.compared ? "border-primary bg-primary-soft/40" : "border-border"
        )}
      >
        <div className="relative">
          <div className="overflow-hidden rounded-[14px]">
            <LaptopRender
              image={laptop.image}
              customSrc={laptop.customImageUrl || (laptop.imageUrl?.startsWith('http') ? laptop.imageUrl : undefined)}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw"
              decorative
              imageClassName="transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
          </div>
          <span className="absolute top-2 left-2 rounded-full bg-bg px-2.5 py-0.5 type-micro font-semibold text-text tabular-nums">#{rank}</span>
          <span className="absolute right-2 -bottom-6 rounded-full bg-bg p-1">
            <ScoreRing value={result.matchScore} size="sm" />
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 px-2 pt-4 pb-1">
          <div className="flex flex-col gap-1 pr-12">
            <h3 className="line-clamp-2 type-body font-semibold text-text">
              <Link href={`/laptop/${laptop.slug}`} className="hover:text-primary">
                {name}
              </Link>
            </h3>
            <p className="num type-small text-text-muted">{formatRupiah(laptop.priceIdr)}</p>
          </div>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 type-micro text-text-muted">
            <li className="flex items-center gap-1">
              <CpuIcon className="size-3.5" aria-hidden="true" /> {laptop.cpu.name}
            </li>
            <li className="flex items-center gap-1">
              <MemoryIcon className="size-3.5" aria-hidden="true" /> {laptop.ram.gb} GB
            </li>
            <li className="flex items-center gap-1">
              <HardDrivesIcon className="size-3.5" aria-hidden="true" /> {formatStorage(laptop.storage.gb)}
            </li>
          </ul>
          {badges.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {badges.slice(0, 2).map((b, i) => (
                <li
                  key={b}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 type-micro font-semibold",
                    i === 0 ? "bg-primary-soft text-primary" : "bg-success-soft text-success"
                  )}
                >
                  {b}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto flex items-center gap-2 pt-1">
            <Button
              variant="secondary"
              aria-pressed={state.compared}
              onClick={state.onCompareChange}
              className={cn("flex-1 rounded-[12px]", state.compared && "border-primary bg-primary-soft text-primary")}
            >
              {state.compared ? <CheckIcon weight="bold" aria-hidden="true" /> : <ArrowsLeftRightIcon weight="bold" aria-hidden="true" />}
              {state.compared ? "Dipilih" : "Bandingkan"}
            </Button>
            <BookmarkButton saved={state.saved} name={name} onToggle={state.onSaveChange} />
          </div>
        </div>
      </article>
    </motion.li>
  )
}

export function Alternatives({
  items,
  all,
  cardState,
}: {
  /** Alternatif (tanpa Best Match), urut skor. */
  items: RecommendationItem[]
  /** Semua hasil, untuk menghitung keunggulan relatif. */
  all: RecommendationItem[]
  cardState: (item: RecommendationItem) => CardState
}) {
  const [brand, setBrand] = React.useState<string | null>(null)
  const [sort, setSort] = React.useState<SortKey>("skor")
  const sortId = React.useId()
  const extras = React.useMemo(() => highlights(all), [all])
  const rankOf = (id: string) => all.findIndex((i) => i.laptop.id === id) + 1

  const counts = new Map<string, number>()
  items.forEach((i) => counts.set(i.laptop.brand, (counts.get(i.laptop.brand) ?? 0) + 1))
  const brands = [...counts.keys()].sort((a, b) => (counts.get(b)! - counts.get(a)!) || a.localeCompare(b))
  const pills = brands.slice(0, MAX_BRAND_PILLS)
  const others = brands.slice(MAX_BRAND_PILLS)
  const OTHER = "__lainnya"

  const visible = items
    .filter((i) => !brand || (brand === OTHER ? others.includes(i.laptop.brand) : i.laptop.brand === brand))
    .sort((a, b) =>
      sort === "harga"
        ? a.laptop.priceIdr - b.laptop.priceIdr
        : sort === "performa"
          ? b.result.subScores.performance - a.result.subScores.performance
          : sort === "portabilitas"
            ? b.result.subScores.portability - a.result.subScores.portability
            : b.result.matchScore - a.result.matchScore
    )

  const pill = (id: string | null, label: string) => {
    const on = brand === id
    return (
      <button
        key={label}
        type="button"
        aria-pressed={on}
        onClick={() => setBrand(id)}
        className={cn(
          "inline-flex min-h-9 items-center rounded-full border px-3.5 type-small transition-colors duration-200",
          on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-bg text-text hover:border-border-strong"
        )}
      >
        {label}
      </button>
    )
  }

  return (
    <section aria-labelledby="alt-title" className="flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 id="alt-title" className="text-2xl leading-8 font-extrabold tracking-[-0.03em] text-text md:text-[1.75rem]">
            Alternatif lain yang juga cocok
          </h2>
          <p className="type-body text-text-muted">Masih ragu? Berikut pilihan lain yang sesuai dengan kebutuhanmu.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div role="group" aria-label="Filter merek" className="flex flex-wrap gap-1.5">
            {pill(null, "Semua")}
            {pills.map((b) => pill(b, b))}
            {others.length > 0 && pill(OTHER, "Lainnya")}
          </div>
          <label htmlFor={sortId} className="flex items-center gap-2 type-small text-text-muted">
            Urutkan
            <span className="relative">
              <select
                id={sortId}
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="min-h-9 appearance-none rounded-full border border-border bg-bg py-1.5 pr-9 pl-3.5 type-small text-text hover:border-border-strong"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <CaretDownIcon weight="bold" className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            </span>
          </label>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} alternatif ditampilkan
      </p>
      {visible.length === 0 ? (
        <p className="rounded-[18px] border border-border bg-bg p-5 type-body text-text">
          Tidak ada alternatif dengan filter ini.{" "}
          <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => setBrand(null)}>
            Tampilkan semua
          </button>
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={true}>
            {visible.map((item, i) => (
              <AlternativeCard
                key={item.laptop.id}
                item={item}
                rank={rankOf(item.laptop.id)}
                extra={extras[item.laptop.id]}
                state={cardState(item)}
                index={i}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}

// ---------------------------------------------------------------- CTA bandingkan

export function CompareCta({ fallbackIds }: { fallbackIds: string[] }) {
  const items = useCompareStore((s) => s.items)
  const chosen = items.length >= 2
  const ids = chosen ? items.map((i) => i.id) : fallbackIds
  return (
    <section
      aria-labelledby="banding-title"
      className="flex flex-col gap-6 rounded-[24px] border border-primary/10 bg-primary-soft/60 p-6 sm:flex-row sm:items-center md:p-8"
    >
      <span aria-hidden="true" className="flex size-20 shrink-0 items-center justify-center rounded-full bg-bg text-primary md:size-24">
        <ScalesIcon weight="duotone" className="size-10 md:size-12" />
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <p className="type-micro font-semibold tracking-[0.24em] text-primary uppercase">Belum yakin?</p>
        <h2 id="banding-title" className="text-2xl leading-8 font-extrabold tracking-[-0.03em] text-text">
          Bandingkan laptop secara detail
        </h2>
        <p className="max-w-[34rem] type-body text-text-muted">
          Pilih beberapa laptop untuk dibandingkan spesifikasi, kelebihan, dan kekurangannya dalam satu tampilan.
        </p>
      </div>
      <div className="flex flex-col items-start gap-1.5 sm:items-end">
        <Button asChild size="lg" className="rounded-[14px] hover:[&_[data-arrow]]:translate-x-1">
          <Link href={compareHref(ids)}>
            Mulai Bandingkan <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
          </Link>
        </Button>
        <span className="type-micro text-text-muted">
          {chosen ? `${items.length} laptop pilihanmu` : "Dimulai dari Best Match dan 2 alternatif teratas"}
        </span>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- Bar bandingkan (muncul mulai 2 laptop)

export function CompareBar({ raised = false }: { raised?: boolean }) {
  const reduce = useReducedMotion()
  const items = useCompareStore((s) => s.items)
  const clear = useCompareStore((s) => s.clear)
  const show = items.length >= 2
  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          aria-label="Laptop yang dipilih untuk dibandingkan"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className={cn("fixed inset-x-3 z-40 mx-auto flex max-w-[40rem] items-center gap-3 rounded-[18px] border border-border bg-bg p-2.5 pl-4 shadow-lg sm:inset-x-6", raised ? "bottom-[5.5rem] lg:bottom-6" : "bottom-3 sm:bottom-6")} // taste-skill-ignore: bar menempel (overlay)
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <ArrowsLeftRightIcon weight="bold" className="size-4" aria-hidden="true" />
          </span>
          <p className="min-w-0 flex-1 type-small text-text">
            <span className="num font-semibold">{items.length}</span> laptop dipilih
            <span className="hidden truncate text-text-muted sm:block">{items.map((i) => i.name).join(" · ")}</span>
          </p>
          <button
            type="button"
            onClick={clear}
            aria-label="Hapus semua pilihan"
            className="flex size-10 shrink-0 items-center justify-center rounded-[12px] text-text-muted hover:bg-surface hover:text-text"
          >
            <XIcon weight="bold" className="size-4" aria-hidden="true" />
          </button>
          <Button asChild className="rounded-[12px] hover:[&_[data-arrow]]:translate-x-1">
            <Link href={compareHref(items.map((i) => i.id))}>
              Bandingkan <span className="hidden sm:inline">{items.length} laptop</span>
              <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
            </Link>
          </Button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
