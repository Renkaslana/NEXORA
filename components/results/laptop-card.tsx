"use client"

import Link from "next/link"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowsLeftRight"
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/ssr/BookmarkSimple"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { LaptopRender } from "@/components/ui/laptop-render"
import { ScoreRing } from "@/components/results/score-ring"
import { formatRupiah, formatStorage, formatWeight } from "@/lib/format"
import type { Laptop, RecommendationResult, ResultCategory } from "@/types"

// PRD §23 Laptop Card ★: Best Match (besar), Default, Compact ·
// Default/Hover/Selected/Compared/Saved · label kategori opsional.
// Harga = info sekunder, bukan judul (§17, §27). Hover naik 2px + shadow-sm (§25).

export const categoryLabels: Record<ResultCategory, string> = {
  "best-match": "Best Match",
  "best-performance": "Performa Terbaik",
  "best-value": "Nilai Terbaik",
  "best-battery": "Baterai Terawet",
  lightest: "Paling Ringan",
  cheapest: "Paling Hemat",
}

const subScoreLabels: [keyof RecommendationResult["subScores"], string][] = [
  ["performance", "Performa"],
  ["value", "Nilai"],
  ["portability", "Portabilitas"],
  ["budgetFit", "Sesuai budget"],
]

interface LaptopCardProps {
  laptop: Laptop
  result: RecommendationResult
  variant?: "best-match" | "default" | "compact"
  /** Paksa label kategori; default dari `result.category`. `null` = sembunyikan. */
  category?: ResultCategory | null
  selected?: boolean
  compared?: boolean
  saved?: boolean
  onCompareChange?: (next: boolean) => void
  onSaveChange?: (next: boolean) => void
  /** Matikan animasi ring, mis. di cuplikan landing. */
  animateScore?: boolean
  /** Paksa tampilan hover (halaman dev). */
  forceHover?: boolean
  className?: string
}

function keySpecs(l: Laptop) {
  return [l.cpu.name, `RAM ${l.ram.gb} GB`, `SSD ${formatStorage(l.storage.gb)}`, formatWeight(l.weightKg)]
}

function CompareButton({
  compared,
  onChange,
  size = "md",
  tone = "default",
}: {
  compared: boolean
  onChange?: (next: boolean) => void
  size?: "sm" | "md"
  tone?: "default" | "cobalt"
}) {
  return (
    <Button
      variant={tone === "cobalt" ? "inverse" : "secondary"}
      size={size}
      aria-pressed={compared}
      onClick={() => onChange?.(!compared)}
      className={cn(
        tone !== "cobalt" && compared && "border-primary bg-primary-soft text-primary hover:border-primary hover:bg-primary-soft"
      )}
    >
      {compared ? <CheckIcon weight="bold" aria-hidden="true" /> : <ArrowsLeftRightIcon weight="bold" aria-hidden="true" />}
      {compared ? "Dibandingkan" : "Bandingkan"}
    </Button>
  )
}

function SaveButton({
  saved,
  onChange,
  name,
  tone = "default",
}: {
  saved: boolean
  onChange?: (next: boolean) => void
  name: string
  tone?: "default" | "cobalt"
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={saved}
      aria-label={saved ? `Hapus ${name} dari simpanan` : `Simpan ${name}`}
      onClick={() => onChange?.(!saved)}
      className={cn(tone === "cobalt" ? "text-white hover:bg-cobalt-700 active:bg-cobalt-800" : saved && "text-primary")}
    >
      <BookmarkSimpleIcon weight="bold" className={cn(saved && "fill-current")} aria-hidden="true" />
    </Button>
  )
}

function LaptopCard({
  laptop,
  result,
  variant = "default",
  category,
  selected = false,
  compared = false,
  saved = false,
  onCompareChange,
  onSaveChange,
  animateScore = true,
  forceHover = false,
  className,
}: LaptopCardProps) {
  const name = `${laptop.brand} ${laptop.model}`
  const shownCategory = category === null ? undefined : (category ?? result.category)
  const href = `/laptop/${laptop.slug}`

  const frame = cn(
    "group/card relative rounded-card border bg-bg transition-[transform,box-shadow,border-color] duration-150 ease-out",
    "hover:-translate-y-0.5 hover:shadow-sm",
    forceHover && "-translate-y-0.5 shadow-sm",
    selected ? "border-primary ring-1 ring-primary" : "border-border",
    className
  )

  // REDESIGN §14/§20: render sedikit membesar dan naik saat kartu di-hover (bidang tetap diam)
  const renderHover = cn(
    "transition-transform duration-[var(--motion-medium)] ease-out group-hover/card:-translate-y-1 group-hover/card:scale-[1.03]",
    forceHover && "-translate-y-1 scale-[1.03]"
  )

  const stateBadges = (
    <>
      {compared && (
        <Chip tone="primary">
          <ArrowsLeftRightIcon weight="bold" className="size-3.5" aria-hidden="true" />
          Di daftar banding
        </Chip>
      )}
      {saved && (
        <Chip tone="muted">
          <BookmarkSimpleIcon weight="bold" className="size-3.5 fill-current" aria-hidden="true" />
          Tersimpan
        </Chip>
      )}
    </>
  )

  // ------------------------------------------------------------ Compact
  if (variant === "compact") {
    return (
      <article className={cn(frame, "flex min-w-0 items-center gap-3 p-3")}>
        <LaptopRender
          image={laptop.image}
          customSrc={laptop.customImageUrl || (laptop.imageUrl?.startsWith('http') ? laptop.imageUrl : undefined)}
          sizes="96px"
          label={false}
          decorative
          className="w-24 shrink-0 rounded-control"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {shownCategory && (
            <span className="type-micro text-primary">{categoryLabels[shownCategory]}</span>
          )}
          <h3 className="truncate type-small font-semibold text-text">
            <Link href={href} className="hover:underline">
              {name}
            </Link>
          </h3>
          <p className="num type-micro text-text-muted">{formatRupiah(laptop.priceIdr)}</p>
          {(compared || saved) && <div className="flex flex-wrap gap-1">{stateBadges}</div>}
        </div>
        <ScoreRing value={result.matchScore} size="sm" animate={animateScore} />
      </article>
    )
  }

  // ------------------------------------------------------------ Best Match (R4: bidang kobalt)
  if (variant === "best-match") {
    const trade = result.tradeOffs[0]
    return (
      <article
        data-tone="cobalt"
        className={cn(
          "group/card relative grid overflow-hidden rounded-[24px] bg-cobalt-600 p-2 text-white md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:p-3",
          className
        )}
      >
        <div className="overflow-hidden rounded-[18px]">
          <LaptopRender
            image={laptop.image}
            customSrc={laptop.customImageUrl || (laptop.imageUrl?.startsWith('http') ? laptop.imageUrl : undefined)}
            sizes="(min-width: 768px) 40vw, 100vw"
            eager
            className="h-full md:aspect-auto md:min-h-80"
            imageClassName={renderHover}
          />
        </div>
        <div className="flex flex-col gap-6 p-4 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {shownCategory && (
                  <span className="inline-flex items-center rounded-full bg-signal px-2.5 py-0.5 type-micro text-signal-ink">
                    {categoryLabels[shownCategory]}
                  </span>
                )}
                {compared && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cobalt-800 px-2.5 py-0.5 type-micro text-white">
                    <ArrowsLeftRightIcon weight="bold" className="size-3.5" aria-hidden="true" /> Di daftar banding
                  </span>
                )}
                {saved && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cobalt-800 px-2.5 py-0.5 type-micro text-white">
                    <BookmarkSimpleIcon weight="fill" className="size-3.5" aria-hidden="true" /> Tersimpan
                  </span>
                )}
              </div>
              <h3 className="text-2xl leading-8 font-extrabold tracking-[-0.03em] text-white md:text-[2rem] md:leading-10">
                <Link href={href} className="hover:underline">
                  {name}
                </Link>
              </h3>
              <p className="num type-small text-cobalt-100">{formatRupiah(laptop.priceIdr)}</p>
              <p className="type-body text-white">{result.summary}</p>
            </div>
            <ScoreRing value={result.matchScore} size="lg" animate={animateScore} tone="cobalt" className="shrink-0" />
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {subScoreLabels.map(([key, label]) => (
              <div key={key} className="flex items-center gap-3">
                <dt className="w-28 shrink-0 type-small font-normal text-cobalt-100">{label}</dt>
                <dd className="flex flex-1 items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-cobalt-800" aria-hidden="true">
                    <span className="block h-full rounded-full bg-white" style={{ width: `${result.subScores[key]}%` }} />
                  </span>
                  <span className="num w-7 text-right type-small text-white">{result.subScores[key]}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="grid gap-5 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="flex flex-col gap-2">
              <h4 className="type-small text-white">Kenapa cocok</h4>
              <ul className="flex flex-col gap-2">
                {result.reasons.slice(0, 3).map((r) => (
                  <li key={r.text} className="flex gap-2 type-small font-normal text-white">
                    <CheckIcon weight="bold" className="mt-0.5 size-4 shrink-0 text-white" aria-hidden="true" />
                    <span>
                      {r.text}
                      <span className="block type-micro font-normal text-cobalt-100">{r.source}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {trade && (
              <div className="flex flex-col gap-2 rounded-[14px] bg-cobalt-700 p-3">
                <h4 className="type-small text-white">Perlu diketahui</h4>
                <p className="flex gap-2 type-small font-normal text-white">
                  <WarningIcon weight="fill" className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                  <span>
                    <span className="sr-only">Trade-off: </span>
                    {trade.text}
                    <span className="block type-micro font-normal text-cobalt-100">{trade.source}</span>
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2">
            <Button asChild variant="signal">
              <Link href={href}>
                Lihat Alasan Lengkap <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
              </Link>
            </Button>
            <CompareButton compared={compared} onChange={onCompareChange} tone="cobalt" />
            <SaveButton saved={saved} onChange={onSaveChange} name={name} tone="cobalt" />
          </div>
        </div>
      </article>
    )
  }

  // ------------------------------------------------------------ Default (alternatif berkategori)
  return (
    <article className={cn(frame, "flex flex-col overflow-hidden")}>
      <LaptopRender
        image={laptop.image}
        customSrc={laptop.customImageUrl || (laptop.imageUrl?.startsWith('http') ? laptop.imageUrl : undefined)}
        sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
        className="border-b border-border"
        imageClassName={renderHover}
      />
      <div className="flex flex-1 flex-col gap-4 p-5">
        {(shownCategory || compared || saved) && (
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap gap-1.5">
              {shownCategory && <Chip tone="primary">{categoryLabels[shownCategory]}</Chip>}
              {stateBadges}
            </div>
            {result.categoryReason && <p className="type-small font-normal text-text">{result.categoryReason}</p>}
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="type-body font-semibold text-text">
              <Link href={href} className="hover:underline">
                {name}
              </Link>
            </h3>
            <p className="num type-small text-text-muted">{formatRupiah(laptop.priceIdr)}</p>
          </div>
          <ScoreRing value={result.matchScore} size="md" showLabel={false} animate={animateScore} className="shrink-0" />
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 type-micro text-text-muted" aria-label="Spesifikasi kunci">
          {keySpecs(laptop).map((s) => (
            <li key={s} className="num">
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center gap-2 pt-1">
          <CompareButton compared={compared} onChange={onCompareChange} size="sm" />
          <SaveButton saved={saved} onChange={onSaveChange} name={name} />
        </div>
      </div>
    </article>
  )
}

export { LaptopCard }
