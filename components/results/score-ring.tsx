"use client"

import * as React from "react"
import { cn } from "cn"
import { animate, useReducedMotion } from "motion/react"

// PRD §23 Score Ring ★: Excellent (≥ 90), Good (75–89), Fair (< 75) · Size S/M/L.
// SVG manual (§30). Angka di tengah + label teks (§11: tidak hanya warna).
// Hitung 0 → nilai dalam 600 ms (§25), mati saat prefers-reduced-motion (§28).

type Tier = "excellent" | "good" | "fair"

export function scoreTier(value: number): Tier {
  if (value >= 90) return "excellent"
  if (value >= 75) return "good"
  return "fair"
}

const tierLabel: Record<Tier, string> = {
  excellent: "Sangat cocok",
  good: "Cocok",
  fair: "Cukup cocok",
}

// PRD §22: success = skor Excellent, primary = ring skor, warning = skor Fair.
const tierStroke: Record<Tier, string> = {
  excellent: "stroke-success",
  good: "stroke-primary",
  fair: "stroke-warning",
}

const tierText: Record<Tier, string> = {
  excellent: "text-success",
  good: "text-primary",
  fair: "text-warning",
}

const sizes = {
  sm: { box: 48, stroke: 4, number: "text-[15px] leading-none", suffix: "text-[10px]" },
  md: { box: 72, stroke: 6, number: "text-[22px] leading-none", suffix: "text-xs" },
  lg: { box: 112, stroke: 8, number: "text-[34px] leading-none", suffix: "text-sm" },
} as const

interface ScoreRingProps {
  value: number
  size?: keyof typeof sizes
  /** Tampilkan label tier di bawah ring. */
  showLabel?: boolean
  animate?: boolean
  /** "cobalt": di bidang kobalt (R4) — track gelap, busur kuning, angka putih. */
  tone?: "default" | "cobalt"
  className?: string
}

function ScoreRing({
  value,
  size = "md",
  showLabel = size !== "sm",
  animate: shouldAnimate = true,
  tone = "default",
  className,
}: ScoreRingProps) {
  const cobalt = tone === "cobalt"
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = React.useState(shouldAnimate ? 0 : value)

  React.useEffect(() => {
    if (!shouldAnimate) return
    const controls = animate(0, value, {
      duration: reduceMotion ? 0 : 0.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [value, shouldAnimate, reduceMotion])

  const shown = shouldAnimate ? display : value
  const tier = scoreTier(value)
  const { box, stroke, number, suffix } = sizes[size]
  const r = (box - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - Math.min(100, Math.max(0, shown)) / 100)

  return (
    <div
      role="img"
      aria-label={`Kecocokan ${value} persen, ${tierLabel[tier].toLowerCase()}`}
      className={cn("inline-flex flex-col items-center gap-1.5", className)}
    >
      <div className="relative" style={{ width: box, height: box }} aria-hidden="true">
        <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} className="-rotate-90">
          <circle cx={box / 2} cy={box / 2} r={r} fill="none" strokeWidth={stroke} className={cobalt ? "stroke-cobalt-800" : "stroke-border"} />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cobalt ? "stroke-signal" : tierStroke[tier]}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className={cn("num", cobalt ? "text-white" : "text-text", number)}>{Math.round(shown)}</span>
          <span className={cn("num ml-px self-center", cobalt ? "text-cobalt-100" : "text-text-muted", suffix)}>%</span>
        </span>
      </div>
      {showLabel && (
        <span className={cn("type-micro", cobalt ? "text-signal" : tierText[tier])} aria-hidden="true">
          {tierLabel[tier]}
        </span>
      )}
    </div>
  )
}

export { ScoreRing, tierLabel }
