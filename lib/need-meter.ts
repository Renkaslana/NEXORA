import { formatStorage } from "@/lib/format"
import { metricValue } from "@/lib/spec-check"
import type { Laptop, RequirementProfile, SpecComponent, SpecMetric } from "@/types"

// Garis Kebutuhan (REDESIGN §9): memetakan angka spek dan ambang mock ke panjang bar.
// BUKAN SAW: tidak ada normalisasi antar kriteria, pembobotan, atau pemeringkatan; posisi hanya
// letak sebuah angka di rentang wajar komponennya.

export type MeterStatus = "met" | "near" | "short" | "unchecked"

export interface MeterScale {
  min: number
  max: number
  /** Skala log untuk komponen yang naik berlipat (RAM, storage). */
  log?: boolean
  format: (value: number) => string
}

const gb = (v: number) => `${v} GB`

export const METRIC_SCALES: Record<SpecMetric, MeterScale> = {
  cpuBench: { min: 0, max: 100, format: (v) => `skor ${v}` },
  ramGb: { min: 4, max: 64, log: true, format: gb },
  ramMaxGb: { min: 4, max: 64, log: true, format: (v) => `maks. ${v} GB` },
  storageGb: { min: 128, max: 2048, log: true, format: formatStorage },
  gpuDedicated: { min: 0, max: 1, format: (v) => (v >= 1 ? "GPU terpisah" : "Terintegrasi") },
  srgbPercent: { min: 0, max: 100, format: (v) => `${v}% sRGB` },
  screenInch: { min: 13, max: 17, format: (v) => `${String(v).replace(".", ",")}″` },
  batteryWh: { min: 30, max: 100, format: (v) => `${v} Wh` },
}

/** Posisi 0–1 sebuah nilai di track. */
export function meterPosition(scale: MeterScale, value: number): number {
  const clamp = (n: number) => Math.min(1, Math.max(0, n))
  if (scale.log) {
    const lo = Math.log(scale.min)
    return clamp((Math.log(Math.max(value, scale.min)) - lo) / (Math.log(scale.max) - lo))
  }
  return clamp((value - scale.min) / (scale.max - scale.min))
}

/** ≥ kebutuhan = memenuhi; dalam 10% di bawahnya = mendekati; selain itu kurang. */
export function meterStatus(need: number | undefined, value: number | undefined): MeterStatus {
  if (need === undefined || value === undefined) return "unchecked"
  if (value >= need) return "met"
  return value >= need * 0.9 ? "near" : "short"
}

export interface NeedMeterRow {
  component: SpecComponent
  metric: SpecMetric
  scale: MeterScale
  need: number
  value?: number
}

/** Baris meter untuk setiap komponen yang punya ambang di profil (urutan mengikuti `specs`). */
export function needMeterRows(requirement: RequirementProfile, laptop?: Laptop): NeedMeterRow[] {
  return requirement.specs.flatMap((spec) => {
    const check = requirement.checks?.[spec.component]
    if (!check) return []
    return [
      {
        component: spec.component,
        metric: check.metric,
        scale: METRIC_SCALES[check.metric],
        need: check.min,
        value: laptop ? metricValue(laptop, check.metric) : undefined,
      },
    ]
  })
}
