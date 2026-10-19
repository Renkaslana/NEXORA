import { formatStorage } from "@/lib/format"
import { metricValue } from "@/lib/spec-check"
import type { Laptop, LandingMeterRef, RequirementProfile, SpecComponent, SpecMetric } from "@/types"

// Garis Kebutuhan (REDESIGN §9): memetakan angka spek dan ambang mock ke panjang bar.
// BUKAN SAW: tidak ada normalisasi antar kriteria, pembobotan, atau pemeringkatan; posisi hanya
// letak sebuah angka di rentang wajar komponennya.

export type MeterStatus = "met" | "near" | "short" | "unchecked"

export interface MeterScale {
  min: number
  max: number
  /** Skala log untuk komponen yang naik berlipat (RAM, storage). */
  log?: boolean
  /**
   * "min" (default): kebutuhan = batas bawah, makin besar makin baik.
   * "max": kebutuhan = batas atas, makin kecil makin baik (mis. bobot).
   */
  direction?: "min" | "max"
  format: (value: number) => string
  /** Teks status saat tidak memenuhi, dari selisih yang sudah diformat. */
  shortText?: (gap: string) => string
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

const kg = (v: number) => `${String(Math.round(v * 100) / 100).replace(".", ",")} kg`

/** Bobot: batas atas dari kebutuhan persona (mis. "di bawah 1,4 kg"). */
export const WEIGHT_SCALE: MeterScale = {
  min: 1,
  max: 3,
  direction: "max",
  format: kg,
  shortText: (gap) => `Lebih berat ${gap}`,
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

/**
 * Arah "min": ≥ kebutuhan = memenuhi, dalam 10% di bawahnya = mendekati.
 * Arah "max": ≤ batas = memenuhi, dalam 10% di atasnya = mendekati. Selain itu kurang.
 */
export function meterStatus(
  need: number | undefined,
  value: number | undefined,
  direction: MeterScale["direction"] = "min"
): MeterStatus {
  if (need === undefined || value === undefined) return "unchecked"
  if (direction === "max") {
    if (value <= need) return "met"
    return value <= need * 1.1 ? "near" : "short"
  }
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

// ---------------------------------------------------------------- Baris yang bisa diserialisasi

/** Skala dirujuk lewat id agar baris meter bisa dikirim dari Server Component ke klien. */
export type MeterScaleId = SpecMetric | "weightKg"

export function resolveScale(scale: MeterScale | MeterScaleId): MeterScale {
  if (typeof scale !== "string") return scale
  return scale === "weightKg" ? WEIGHT_SCALE : METRIC_SCALES[scale]
}

export interface MeterRowData {
  key: string
  /** "bobot" untuk batas bobot persona (bukan komponen spek). */
  component: SpecComponent | "bobot"
  scale: MeterScaleId
  need: number
  value?: number
}

/** Baris meter landing: komponen spek memakai ambang profil, bobot memakai batas persona. */
export function landingMeterRows(refs: LandingMeterRef[], requirement: RequirementProfile, laptop?: Laptop): MeterRowData[] {
  return refs.flatMap((ref): MeterRowData[] => {
    if (ref.kind === "weight") {
      return [{ key: "bobot", component: "bobot", scale: "weightKg", need: ref.maxKg, value: laptop?.weightKg }]
    }
    const check = requirement.checks?.[ref.component]
    if (!check) return []
    return [
      {
        key: ref.component,
        component: ref.component,
        scale: check.metric,
        need: check.min,
        value: laptop ? metricValue(laptop, check.metric) : undefined,
      },
    ]
  })
}

/** Komponen spek untuk sebuah metrik (ikon & label meter). */
export function componentForMetric(metric: SpecMetric): SpecComponent {
  switch (metric) {
    case "cpuBench":
      return "cpu"
    case "ramGb":
    case "ramMaxGb":
      return "ram"
    case "storageGb":
      return "storage"
    case "gpuDedicated":
      return "gpu"
    case "srgbPercent":
    case "screenInch":
      return "layar"
    case "batteryWh":
      return "baterai"
  }
}
