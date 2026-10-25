"use client"

import * as React from "react"
import Image from "next/image"
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import { getCatalogPreview } from "@/lib/api"
import { formatRupiahShort } from "@/lib/format"
import { renderKey, renderSrc } from "@/lib/laptop-image"
import { DURATION, EASE_IN_OUT, EASE_OUT } from "@/lib/motion"
import type { RecommendationResult } from "@/types"

// Katalog tersaring di layar Analisis, redesign "Garis kebutuhan menyapu katalog" (disetujui
// Fahren, Okt 2026; REDESIGN §14). Aturannya tetap bukan SAW:
//   tahap 2  garis budget kuning menyapu dari kiri; laptop dengan harga > budget (+10% bila
//            fleksibel) jatuh dan memudar saat garis lewat
//   tahap 3  laptop di hasil getRecommendations() naik ke depan, urut skor dari API, skor dihitung naik
//   tahap 4  Best Match membesar mengisi bingkai dengan skornya
// Visual dekoratif (aria-hidden); jumlahnya diumumkan lewat teks di AnalysisView.

const catalog = getCatalogPreview()
/** Lama sapuan garis budget (detik). */
const SWEEP = 0.7

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

/** Angka yang dihitung naik dari 0 (reduced motion: langsung). */
function CountUp({ value, duration = DURATION.count, className }: { value: number; duration?: number; className?: string }) {
  const reduce = useReducedMotion()
  const mv = useMotionValue(reduce ? value : 0)
  const text = useTransform(mv, (v) => `${Math.round(v)}`)
  React.useEffect(() => {
    if (reduce) {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, { duration, ease: EASE_OUT })
    return () => controls.stop()
  }, [mv, value, duration, reduce])
  return <motion.span className={className}>{text}</motion.span>
}

function Render({ image, sizes }: { image: (typeof catalog)[number]["image"]; sizes: string }) {
  const key = renderKey(image, "34")
  return key ? <Image src={renderSrc(key)} alt="" fill sizes={sizes} className="object-contain" /> : null
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
  const ranked = stage >= 3 && results !== null
  const best = stage >= 4 && results?.[0] ? catalog.find((l) => l.id === results[0].laptopId) : undefined

  // Urutan: tahap 3 ke atas, hasil (urut skor API) di depan, lalu sisanya sesuai katalog.
  const order = ranked
    ? [
        ...results!.map((r) => catalog.find((l) => l.id === r.laptopId)!).filter(Boolean),
        ...catalog.filter((l) => !scores.has(l.id)),
      ]
    : catalog

  return (
    <div aria-hidden="true" className="relative">
      <ul className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4">
        {order.map((l) => {
          const index = catalog.indexOf(l)
          const overBudget = stage >= 2 && l.priceIdr > limit
          const out = ranked ? !scores.has(l.id) : overBudget
          const score = ranked ? scores.get(l.id) : undefined
          // Laptop jatuh saat garis budget melewati kolomnya (perkiraan 4 kolom).
          const dropDelay = stage === 2 && !reduce ? ((index % 4) / 4) * SWEEP + 0.1 : 0
          return (
            <motion.li
              key={l.id}
              layout={reduce ? false : "position"}
              className="relative flex min-w-0 flex-col gap-1.5 rounded-[14px] bg-cobalt-700 p-1.5 sm:p-2"
              initial={reduce ? false : { opacity: 0, y: -20 }}
              animate={{
                opacity: out ? 0.2 : 1,
                y: out && !ranked ? 18 : 0,
                rotate: out && !ranked && !reduce ? (index % 2 ? 3 : -3) : 0,
                scale: out ? 0.94 : 1,
              }}
              transition={{
                layout: { duration: reduce ? 0 : DURATION.slow, ease: EASE_IN_OUT },
                default: {
                  duration: reduce ? 0 : DURATION.slow,
                  ease: EASE_OUT,
                  delay: stage === 0 && !reduce ? index * 0.04 : dropDelay,
                },
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-studio">
                <Render image={l.image} sizes="(min-width: 1024px) 160px, 30vw" />
                {overBudget && !ranked && (
                  <span
                    className="absolute inset-x-1.5 bottom-1.5 animate-in rounded-full bg-signal-ink px-2 py-0.5 text-center text-[10px] leading-4 font-semibold text-white fade-in zoom-in-95 fill-mode-both sm:text-[11px]"
                    style={{ animationDelay: `${dropDelay * 1000}ms` }}
                  >
                    di atas budget
                  </span>
                )}
              </div>
              <p className="truncate type-micro font-medium tracking-normal text-white">{l.name}</p>
              <p className="type-micro font-medium tracking-normal text-cobalt-100 tabular-nums">
                {formatRupiahShort(l.priceIdr)}
              </p>
              {score !== undefined && (
                <span className="absolute top-2.5 right-2.5 rounded-full bg-signal px-1.5 py-0.5 type-micro text-signal-ink tabular-nums">
                  <CountUp value={score} />%
                </span>
              )}
            </motion.li>
          )
        })}
      </ul>

      {/* Garis budget yang menyapu katalog (tahap 2). */}
      <AnimatePresence>
        {stage === 2 && !reduce && (
          <motion.div
            key="sweep"
            className="pointer-events-none absolute -inset-y-3 left-0 w-1 rounded-full bg-signal"
            initial={{ left: "0%", opacity: 1 }}
            animate={{ left: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ left: { duration: SWEEP, ease: EASE_IN_OUT }, opacity: { duration: DURATION.fast } }}
          >
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-signal px-2 py-0.5 text-[11px] leading-4 font-semibold whitespace-nowrap text-signal-ink tabular-nums">
              {formatRupiahShort(limit)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Best Match mengisi bingkai (tahap 4). */}
      <AnimatePresence>
        {best && (
          <motion.div
            key="best"
            className="absolute inset-0 flex flex-col overflow-hidden rounded-[20px] bg-studio sm:flex-row"
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduce ? 0 : DURATION.slow, ease: EASE_OUT }}
          >
            <div className="relative min-h-0 flex-1">
              <Render image={best.image} sizes="(min-width: 1024px) 40vw, 90vw" />
              <span className="absolute top-3 left-3 type-micro text-text-muted">Ilustrasi</span>
            </div>
            <div className="flex flex-col justify-center gap-1 p-4 text-text sm:w-[42%] sm:p-6">
              <span className="self-start rounded-full bg-cobalt-600 px-2.5 py-1 type-micro text-white">Best Match</span>
              <p className="text-6xl leading-none font-extrabold tracking-[-0.05em] text-cobalt-600 tabular-nums sm:text-7xl">
                <CountUp value={results![0].matchScore} duration={0.9} />%
              </p>
              <p className="type-h3 text-text">{best.name}</p>
              <p className="type-small font-normal text-text-muted tabular-nums">{formatRupiahShort(best.priceIdr)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
