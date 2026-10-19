"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"
import { ArrowRight } from "lucide-react"
import { WarningBanner } from "@/components/profile/requirement-card"
import { ScoreRing } from "@/components/results/score-ring"
import { Button } from "@/components/ui/button"
import { LaptopRender } from "@/components/ui/laptop-render"
import { Skeleton } from "@/components/ui/skeleton"
import { getBudgetInsight, getRequirements, getSampleProfile, getWizardOptions } from "@/lib/api"
import { useApi } from "@/lib/use-api"
import type { LaptopImage } from "@/lib/laptop-image"
import type { BudgetPresetId, RequirementProfile } from "@/types"

// Hero Landing final: komposisi A (PRD §12 Concept D, §13) + preview langsung dari varian C.
// Chip preset mengubah kartu Profil Kebutuhan; CTA membawa budget terpilih ke Wizard (§13).

const options = getWizardOptions()
const informatika = getSampleProfile("teknik")
/** Tier yang punya skenario hasil (Raka, Rp8 jt). Badge skor hanya tampil di sini. */
const SCORED_TIER: BudgetPresetId = "8-10"

/** Render yang mewakili kelas laptop di tiap tier (REDESIGN §15). Rp8–10 jt = Best Match Raka. */
const PRESET_RENDER: Record<BudgetPresetId, LaptopImage> = {
  "lt-6": { shape: "mainstream", color: "graphite" },
  "6-8": { shape: "mainstream", color: "silver" },
  "8-10": { shape: "mainstream", color: "navy" },
  "10-15": { shape: "ultrabook", color: "mist" },
  "15-plus": { shape: "creator", color: "navy" },
}

// Profil per preset diambil sekali lewat lib/api.ts lalu disimpan di state.
async function loadOtherPresets() {
  const entries = await Promise.all(
    options.budgetPresets
      .filter((p) => p.id !== SCORED_TIER)
      .map(async (p) => {
        const profile = { ...informatika, budget: { ...informatika.budget, max: p.value } }
        return [p.id, await getRequirements(profile)] as const
      })
  )
  return Object.fromEntries(entries) as Partial<Record<BudgetPresetId, RequirementProfile>>
}

interface LandingHeroProps {
  /** Profil default (tier Rp8–10 jt), dirender di server agar tanpa skeleton. */
  defaultRequirement: RequirementProfile
  bestMatch: { matchScore: number; laptopName: string }
  majorLabel: string
  softwareLabels: string[]
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="flex gap-1.5">
        <Skeleton className="h-7 w-24 rounded-full bg-surface" />
        <Skeleton className="h-7 w-20 rounded-full bg-surface" />
        <Skeleton className="h-7 w-20 rounded-full bg-surface" />
      </div>
      <Skeleton className="h-4 w-4/5 bg-surface" />
      <Skeleton className="h-14 w-full rounded-control bg-surface" />
    </div>
  )
}

export function LandingHero({ defaultRequirement, bestMatch, majorLabel, softwareLabels }: LandingHeroProps) {
  const others = useApi(loadOtherPresets)
  const [presetId, setPresetId] = React.useState<BudgetPresetId | null>(null)

  const shownId = presetId ?? SCORED_TIER
  const preset = options.budgetPresets.find((p) => p.id === shownId)!
  const requirement =
    shownId === SCORED_TIER ? defaultRequirement : others.status === "success" ? others.data[shownId] : undefined
  const failed = shownId !== SCORED_TIER && others.status === "error"

  const ram = requirement?.specs.find((s) => s.component === "ram")
  const storage = requirement?.specs.find((s) => s.component === "storage")
  const insight = getBudgetInsight(preset.value, true)

  const ctaHref = presetId ? `/rekomendasi/budget?budget=${preset.value}` : "/rekomendasi/budget"
  // "< Rp6 jt" → "di bawah Rp6 jt", "Rp15 jt+" → "Rp15 jt ke atas"
  const presetWords = preset.label.replace(/^<\s*/, "di bawah ").replace(/\+$/, " ke atas")
  const ctaLabel = presetId
    ? `Cari laptop ${presetWords.startsWith("di bawah") ? "" : "untuk "}${presetWords}`
    : "Cari Laptop yang Pas"

  return (
    <section className="page-container grid items-center gap-12 pt-10 pb-20 md:pt-16 md:pb-28 lg:grid-cols-12 lg:gap-6 lg:pt-20">
      {/* ------------------------------------------------------------ Kiri */}
      <div className="flex min-w-0 flex-col gap-6 lg:col-span-6 lg:pr-6">
        <p className="type-small text-primary">Sistem pendukung keputusan laptop</p>
        <h1 className="type-display text-text">Jangan pilih laptop dari speknya. Pilih dari kebutuhanmu.</h1>
        <p className="max-w-[34rem] type-body-l text-text-muted">
          Jawab 5 pertanyaan singkat tentang budget, kuliah, dan aplikasi yang kamu pakai. Kami tunjukkan spek yang
          kamu butuh dan laptop yang cocok, lengkap dengan alasannya.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button asChild size="lg">
            <Link href={ctaHref}>
              {ctaLabel}
              {presetId && <ArrowRight aria-hidden="true" />}
            </Link>
          </Button>
          <Button asChild variant="link" size="md">
            <Link href="#cara-kerja">Lihat cara kerjanya</Link>
          </Button>
        </div>

        <div className="flex min-w-0 flex-col gap-2 pt-2">
          <p id="preset-label" className="type-small font-normal text-text-muted">
            Atau coba budget-mu, lihat kartu Profil Kebutuhan berubah:
          </p>
          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <div role="group" aria-labelledby="preset-label" className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
              {options.budgetPresets.map((p) => {
                const selected = presetId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPresetId(selected ? null : p.id)}
                    className={cn(
                      "inline-flex h-11 shrink-0 items-center rounded-full border px-4 type-small transition-colors duration-150",
                      selected
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-bg text-text hover:border-border-strong hover:bg-surface"
                    )}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ Kanan */}
      <div className="relative min-w-0 lg:col-span-6">
        <LaptopRender
          image={PRESET_RENDER[shownId]}
          sizes="(min-width: 1024px) 50vw, 100vw"
          eager
          labelPosition="top"
          className="rounded-card"
        />
        <div className="relative z-10 -mt-20 px-4 sm:-mt-24 sm:px-8 lg:absolute lg:-bottom-12 lg:-left-12 lg:mt-0 lg:px-0">
          <aside
            data-ui
            aria-label="Contoh Profil Kebutuhan"
            className="flex w-full max-w-[23rem] flex-col gap-4 rounded-card border border-border bg-bg p-5 shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="type-small text-text">Profil Kebutuhan</p>
                <p className="type-micro text-text-muted">Contoh: {majorLabel}</p>
              </div>
              {shownId === SCORED_TIER ? (
                <div className="flex items-center gap-2" title={bestMatch.laptopName}>
                  <ScoreRing value={bestMatch.matchScore} size="sm" animate={false} />
                  <span className="type-small text-success">cocok</span>
                </div>
              ) : (
                <p className="text-right type-micro text-text-muted">
                  <span className="num block type-h3 text-text">{insight.laptopCount}</span>
                  laptop di katalog
                </p>
              )}
            </div>

            <div aria-live="polite" aria-busy={!requirement && !failed} className="flex flex-col gap-3">
              {failed && (
                <p className="type-small text-danger">Gagal memuat profil untuk budget ini. Coba preset lain.</p>
              )}
              {!requirement && !failed && (
                <>
                  <span className="sr-only">Memuat Profil Kebutuhan…</span>
                  <CardSkeleton />
                </>
              )}
              {requirement && ram && storage && (
                <div key={shownId} className="flex animate-in flex-col gap-3 duration-200 fade-in">
                  <ul className="flex flex-wrap gap-1.5" aria-label="Ringkasan profil">
                    {[`Budget ${preset.label}`, `RAM ${ram.minimum}`, storage.minimum].map((c) => (
                      <li
                        key={c}
                        className="inline-flex min-h-7 items-center rounded-full bg-surface px-2.5 py-1 type-micro text-text"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                  <p className="type-small font-normal text-text-muted">{requirement.summary}</p>
                  {requirement.warnings[0] ? (
                    <WarningBanner warning={requirement.warnings[0]} compact />
                  ) : (
                    <p className="rounded-control bg-primary-soft px-3 py-2.5 type-small font-normal text-text">
                      <span className="font-semibold text-primary">Kenapa?</span> RAM {ram.minimum} untuk{" "}
                      {softwareLabels.join(" + ")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
