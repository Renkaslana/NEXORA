"use client"

import Link from "next/link"
import { cn } from "cn"
import { Bookmark, Check, GitCompareArrows, TriangleAlert } from "lucide-react"
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
}: {
  compared: boolean
  onChange?: (next: boolean) => void
  size?: "sm" | "md"
}) {
  return (
    <Button
      variant="secondary"
      size={size}
      aria-pressed={compared}
      onClick={() => onChange?.(!compared)}
      className={cn(compared && "border-primary bg-primary-soft text-primary hover:border-primary hover:bg-primary-soft")}
    >
      {compared ? <Check aria-hidden="true" /> : <GitCompareArrows aria-hidden="true" />}
      {compared ? "Dibandingkan" : "Bandingkan"}
    </Button>
  )
}

function SaveButton({ saved, onChange, name }: { saved: boolean; onChange?: (next: boolean) => void; name: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={saved}
      aria-label={saved ? `Hapus ${name} dari simpanan` : `Simpan ${name}`}
      onClick={() => onChange?.(!saved)}
      className={cn(saved && "text-primary")}
    >
      <Bookmark className={cn(saved && "fill-current")} aria-hidden="true" />
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
          <GitCompareArrows className="size-3.5" aria-hidden="true" />
          Di daftar banding
        </Chip>
      )}
      {saved && (
        <Chip tone="muted">
          <Bookmark className="size-3.5 fill-current" aria-hidden="true" />
          Tersimpan
        </Chip>
      )}
    </>
  )

  // ------------------------------------------------------------ Compact
  if (variant === "compact") {
    return (
      <article className={cn(frame, "flex min-w-0 items-center gap-3 p-3")}>
        <LaptopRender image={laptop.image} sizes="96px" label={false} decorative className="w-24 shrink-0 rounded-control" />
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

  // ------------------------------------------------------------ Best Match
  if (variant === "best-match") {
    const trade = result.tradeOffs[0]
    return (
      <article className={cn(frame, "grid overflow-hidden md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]")}>
        <LaptopRender
          image={laptop.image}
          sizes="(min-width: 768px) 40vw, 100vw"
          eager
          className="h-full md:aspect-auto md:min-h-80"
          imageClassName={renderHover}
        />
        <div className="flex flex-col gap-6 p-5 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {shownCategory && <Chip tone="primary">{categoryLabels[shownCategory]}</Chip>}
                {stateBadges}
              </div>
              <h3 className="type-h3 text-text md:text-2xl md:leading-8">
                <Link href={href} className="hover:underline">
                  {name}
                </Link>
              </h3>
              <p className="num type-small text-text-muted">{formatRupiah(laptop.priceIdr)}</p>
              <p className="type-body text-text">{result.summary}</p>
            </div>
            <ScoreRing value={result.matchScore} size="lg" animate={animateScore} className="shrink-0" />
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {subScoreLabels.map(([key, label]) => (
              <div key={key} className="flex items-center gap-3">
                <dt className="w-28 shrink-0 type-small font-normal text-text-muted">{label}</dt>
                <dd className="flex flex-1 items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border" aria-hidden="true">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${result.subScores[key]}%` }} />
                  </span>
                  <span className="num w-7 text-right type-small text-text">{result.subScores[key]}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="grid gap-5 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="flex flex-col gap-2">
              <h4 className="type-small text-text">Kenapa cocok</h4>
              <ul className="flex flex-col gap-2">
                {result.reasons.slice(0, 3).map((r) => (
                  <li key={r.text} className="flex gap-2 type-small font-normal text-text">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2.5} aria-hidden="true" />
                    <span>
                      {r.text}
                      <span className="block type-micro font-normal text-text-muted">{r.source}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {trade && (
              <div className="flex flex-col gap-2">
                <h4 className="type-small text-text">Perlu diketahui</h4>
                <p className="flex gap-2 type-small font-normal text-text">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                  <span>
                    <span className="sr-only">Trade-off: </span>
                    {trade.text}
                    <span className="block type-micro font-normal text-text-muted">{trade.source}</span>
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href={href}>Lihat Alasan Lengkap</Link>
            </Button>
            <CompareButton compared={compared} onChange={onCompareChange} />
            <SaveButton saved={saved} onChange={onSaveChange} name={name} />
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
