"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { getCatalogPreview } from "@/lib/api"
import { formatRupiahShort } from "@/lib/format"
import { renderKey, renderSrc } from "@/lib/laptop-image"
import { DURATION, EASE_OUT } from "@/lib/motion"
import type { RecommendationResult } from "@/types"

// Katalog yang tersaring nyata di layar Analisis (REDESIGN §14, gerak 8). Aturannya sama dengan
// yang sudah ada, bukan SAW: tahap 2 menyaring harga ≤ budget (+10% bila fleksibel), tahap 3
// menandai laptop yang ada di hasil getRecommendations() beserta skornya, tahap 4 menyorot Best Match.
// Visual dekoratif (aria-hidden); jumlahnya diumumkan sekali lewat teks di AnalysisView.

const catalog = getCatalogPreview()

export function catalogCounts(limit: number, results: RecommendationResult[] | null) {
  const price = new Map(catalog.map((l) => [l.id, l.priceIdr]))
  return {
    total: catalog.length,
    inBudget: catalog.filter((l) => l.priceIdr <= limit).length,
    matched: results ? results.length : null,
    /** Hasil yang sedikit melewati budget (Hasil menulisnya sebagai trade-off). */
    overBudget: results ? results.filter((r) => (price.get(r.laptopId) ?? 0) > limit).length : 0,
  }
}

export function AnalysisCatalog({
  stage,
  limit,
  results,
}: {
  /** Jumlah tahap selesai (0–4). */
  stage: number
  /** Batas harga, sudah termasuk toleransi fleksibel. */
  limit: number
  results: RecommendationResult[] | null
}) {
  const reduce = useReducedMotion()
  const scores = new Map(results?.map((r) => [r.laptopId, r.matchScore]))
  const bestId = results?.[0]?.laptopId

  return (
    <ul aria-hidden="true" className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4">
      {catalog.map((l, i) => {
        const ranked = stage >= 3 && results !== null
        const out = ranked ? !scores.has(l.id) : stage >= 2 && l.priceIdr > limit
        const score = ranked ? scores.get(l.id) : undefined
        const best = stage >= 4 && l.id === bestId
        const key = renderKey(l.image, "34")
        return (
          <motion.li
            key={l.id}
            className={cn(
              "relative flex min-w-0 flex-col gap-1.5 rounded-[12px] bg-ink-900 p-1.5 sm:p-2",
              best && "ring-2 ring-blue-400"
            )}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: out ? 0.22 : 1, scale: out ? 0.95 : best ? 1.03 : 1, y: 0 }}
            transition={{ duration: reduce ? 0 : DURATION.medium, ease: EASE_OUT, delay: stage === 0 ? i * 0.03 : 0 }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-studio">
              {key && <Image src={renderSrc(key)} alt="" fill sizes="(min-width: 1024px) 140px, 30vw" className="object-contain" />}
            </div>
            <p className="truncate type-micro font-medium tracking-normal text-zinc-300">{l.name}</p>
            <p className="num type-micro text-zinc-400">{formatRupiahShort(l.priceIdr)}</p>
            {score !== undefined && (
              <span className="num absolute top-2.5 right-2.5 animate-in rounded-full bg-blue-400 px-1.5 py-0.5 type-micro text-ink-950 fade-in zoom-in-95 duration-200">
                {score}%
              </span>
            )}
          </motion.li>
        )
      })}
    </ul>
  )
}
