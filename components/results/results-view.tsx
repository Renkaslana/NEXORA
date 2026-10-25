"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/ssr/ClipboardText"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass"
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle"
import { FlowHeader } from "@/components/layout/flow-header"
import { profileChipItems } from "@/components/profile/profile-chips"
import { CompareTray } from "@/components/results/compare-tray"
import { LaptopCard } from "@/components/results/laptop-card"
import { defaultFilters, ResultFilterBar, type ResultFilters } from "@/components/results/result-filter-bar"
import { ScoreExplainer } from "@/components/results/score-explainer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { firstMissingStep, stepHref } from "@/components/wizard/steps"
import {
  getNoResultSuggestions,
  getPersonaForMajor,
  getRecommendations,
  getSampleProfile,
  getWizardOptions,
  parseMockMode,
  type MockMode,
  type RecommendationItem,
  type RecommendationSet,
} from "@/lib/api"
import { formatRupiahShort } from "@/lib/format"
import { useApi } from "@/lib/use-api"
import { MAX_COMPARE, useCompareStore } from "@/store/compare"
import { rehydrateProfile, useProfileHydrated, useProfileStore } from "@/store/profile"
import { profileKey, useResultsStore } from "@/store/results"
import { rehydrateSaved, useSavedStore } from "@/store/saved"
import type { PersonaId, UserProfile } from "@/types"

// Hasil Rekomendasi /rekomendasi/hasil (PRD §17, §26, §27): Best Match + alternatif berkategori
// + laptop lain, bar filter, switch persona demo, Compare Tray, dan modal penjelasan skor.

const { personas } = getWizardOptions()
const laptopName = (item: RecommendationItem) => `${item.laptop.brand} ${item.laptop.model}`

function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      <Skeleton className="h-[420px] rounded-card bg-surface" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[380px] rounded-card bg-surface" />
        <Skeleton className="h-[380px] rounded-card bg-surface" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Kartu dengan state banding & simpan

function useCardActions(announce: (message: string) => void) {
  const compared = useCompareStore((s) => s.items)
  const toggleCompare = useCompareStore((s) => s.toggle)
  const saved = useSavedStore((s) => s.saved)
  const toggleSaved = useSavedStore((s) => s.toggle)

  return (item: RecommendationItem) => {
    const name = laptopName(item)
    return {
      compared: compared.some((c) => c.id === item.laptop.id),
      saved: saved.some((s) => s.laptopId === item.laptop.id),
      onCompareChange: () => {
        const outcome = toggleCompare({ id: item.laptop.id, slug: item.laptop.slug, name })
        announce(
          outcome === "full"
            ? `Maksimal ${MAX_COMPARE} laptop. Hapus satu dari tray untuk menambah ${name}.`
            : outcome === "added"
              ? `${name} ditambahkan ke komparasi.`
              : `${name} dihapus dari komparasi.`
        )
      },
      onSaveChange: () => {
        const nowSaved = toggleSaved(item.laptop.id)
        announce(nowSaved ? `${name} disimpan.` : `${name} dihapus dari simpanan.`)
      },
    }
  }
}

function Appear({ index, children }: { index: number; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: reduceMotion ? 0 : index * 0.07 }}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------- Isi hasil

function ResultsBody({ set, announce }: { set: RecommendationSet; announce: (message: string) => void }) {
  const cardProps = useCardActions(announce)
  const [filters, setFilters] = React.useState<ResultFilters>(defaultFilters)
  const [best, ...rest] = set.items

  const brands = [...new Set(rest.map((i) => i.laptop.brand))].sort()
  const sizes = [...new Set(rest.map((i) => i.laptop.display.inch))].sort((a, b) => a - b)
  const visible = rest
    .filter((i) => filters.brands.length === 0 || filters.brands.includes(i.laptop.brand))
    .filter((i) => filters.sizes.length === 0 || filters.sizes.includes(i.laptop.display.inch))
    .sort((a, b) =>
      filters.sort === "harga"
        ? a.laptop.priceIdr - b.laptop.priceIdr
        : filters.sort === "bobot"
          ? a.laptop.weightKg - b.laptop.weightKg
          : b.result.matchScore - a.result.matchScore
    )
  const categorized = visible.filter((i) => i.result.category)
  const others = visible.filter((i) => !i.result.category)
  const persona = personas.find((p) => p.id === set.persona)

  return (
    <div className="flex flex-col gap-12">
      <Appear index={0}>
        <LaptopCard variant="best-match" laptop={best.laptop} result={best.result} {...cardProps(best)} />
      </Appear>

      {rest.length > 0 && (
        <section aria-labelledby="alt-title" className="flex flex-col gap-5">
          <h2 id="alt-title" className="type-h2 text-text">
            Alternatif sesuai kebutuhanmu
          </h2>
          <ResultFilterBar brands={brands} sizes={sizes} value={filters} onChange={setFilters} shown={visible.length} total={rest.length} />

          {visible.length === 0 && (
            <p className="rounded-card bg-surface p-5 type-body text-text">
              Tidak ada alternatif dengan filter ini.{" "}
              <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => setFilters(defaultFilters)}>
                Hapus filter
              </button>
            </p>
          )}

          {categorized.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {categorized.map((item, i) => (
                <Appear key={item.laptop.id} index={i + 1}>
                  <LaptopCard laptop={item.laptop} result={item.result} className="h-full" {...cardProps(item)} />
                </Appear>
              ))}
            </div>
          )}

          {others.length > 0 && (
            <div className="flex flex-col gap-3 pt-4">
              <h3 className="type-h3 text-text">Laptop lain yang lolos filter</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {others.map((item) => (
                  <LaptopCard key={item.laptop.id} variant="compact" laptop={item.laptop} result={item.result} {...cardProps(item)} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <p className="type-micro text-text-muted">
        Hasil contoh untuk persona {persona?.label} ({set.title}). Data demo: belum mengikuti budget dan syarat
        wajibmu secara persis; perhitungan asli dilakukan server.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------- Tidak ada hasil (PRD §26)

function NoResult({ profile }: { profile: UserProfile }) {
  const router = useRouter()
  const pathname = usePathname()
  const toggleHardFilter = useProfileStore((s) => s.toggleHardFilter)
  const setBudget = useProfileStore((s) => s.setBudget)
  const { constraints, suggestedBudget } = getNoResultSuggestions(profile)
  // Setelah melonggarkan, hapus ?mock=empty agar hasil dimuat ulang.
  const rerun = () => router.replace(pathname)

  return (
    <StateMessage
      icon={MagnifyingGlassIcon}
      title="Belum ada laptop yang memenuhi semua syaratmu."
      body={
        constraints.length
          ? "Syarat berikut yang paling membatasi. Longgarkan salah satu untuk melihat hasil."
          : `Budget ${formatRupiahShort(profile.budget.max)} membatasi pilihan untuk kebutuhanmu.`
      }
      className="max-w-3xl"
    >
      <div className="flex w-full flex-col gap-4">
        {constraints.length > 0 && (
          <ul className="flex flex-col gap-2">
            {constraints.map((c) => (
              <li key={c.id} className="flex flex-col gap-3 rounded-card bg-bg p-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 flex-col gap-0.5">
                  <p className="type-small text-text">{c.label}</p>
                  <p className="type-small font-normal text-text-muted">{c.reason}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="self-start sm:self-center"
                  onClick={() => {
                    toggleHardFilter(c.id)
                    rerun()
                  }}
                >
                  Longgarkan syarat ini
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2">
          {suggestedBudget && (
            <Button
              onClick={() => {
                setBudget(suggestedBudget)
                rerun()
              }}
            >
              Naikkan budget ke {formatRupiahShort(suggestedBudget)}
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link href={stepHref("budget")}>Ubah jawaban</Link>
          </Button>
        </div>
      </div>
    </StateMessage>
  )
}

// ---------------------------------------------------------------- Memuat hasil

function FetchedResults({
  profile,
  mock,
  onRetry,
  render,
}: {
  profile: UserProfile
  mock: MockMode | null
  onRetry: () => void
  render: (set: RecommendationSet) => React.ReactNode
}) {
  const setResult = useResultsStore((s) => s.setResult)
  const [load] = React.useState(() => () => getRecommendations(profile, { mock }))
  const state = useApi(load)

  React.useEffect(() => {
    if (state.status === "success" && !mock) setResult(profile, state.data)
  }, [state, mock, profile, setResult])

  if (state.status === "loading") {
    return (
      <>
        <span className="sr-only" role="status">
          Memuat rekomendasi…
        </span>
        <ResultsSkeleton />
      </>
    )
  }
  if (state.status === "error") {
    return (
      <StateMessage
        icon={WarningCircleIcon}
        tone="danger"
        title="Gagal memuat rekomendasi"
        body="Terjadi kesalahan saat membuat rekomendasi. Jawabanmu tetap tersimpan."
      >
        <Button onClick={onRetry}>
          <ArrowCounterClockwiseIcon weight="bold" aria-hidden="true" /> Coba lagi
        </Button>
        <Button asChild variant="secondary">
          <Link href={stepHref("budget")}>Ubah jawaban</Link>
        </Button>
      </StateMessage>
    )
  }
  return <>{render(state.data)}</>
}

// ---------------------------------------------------------------- Halaman

export function ResultsView() {
  const params = useSearchParams()
  const mock = parseMockMode(params.get("mock"))
  const hydrated = useProfileHydrated()
  const profile = useProfileStore((s) => s.profile)
  const cached = useResultsStore((s) => s.data)
  const cachedKey = useResultsStore((s) => s.key)
  const [viewPersona, setViewPersona] = React.useState<PersonaId | null>(null)
  const [attempt, setAttempt] = React.useState(0)
  const [message, setMessage] = React.useState<string | null>(null)
  const announce = React.useCallback((m: string) => setMessage(m), [])

  React.useEffect(() => {
    rehydrateProfile()
    rehydrateSaved()
  }, [])

  const missing = hydrated ? firstMissingStep(profile) : undefined
  const ownPersona = hydrated ? getPersonaForMajor(profile.major) : null
  const showingOther = viewPersona && viewPersona !== ownPersona ? viewPersona : null
  const sourceProfile = showingOther ? getSampleProfile(showingOther) : profile
  const key = profileKey(sourceProfile)
  const useCache = !showingOther && !mock && cached && cachedKey === key

  // Switch persona cepat untuk demo (PRD §17): hanya mengganti tampilan, jawaban tidak berubah.
  const personaSwitch = (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="Contoh persona untuk demo" className="flex flex-wrap items-center gap-2">
        <span className="type-small text-text-muted">Lihat contoh persona:</span>
        {personas.map((p) => {
          const own = p.id === ownPersona
          const selected = showingOther ? showingOther === p.id : own
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setViewPersona(own ? null : p.id)}
              className={
                selected
                  ? "inline-flex min-h-11 items-center rounded-full border border-primary bg-primary-soft px-4 type-small text-primary"
                  : "inline-flex min-h-11 items-center rounded-full border border-border bg-bg px-4 type-small text-text hover:border-border-strong hover:bg-surface"
              }
            >
              {p.example.split(", ")[0]}
              {own && <span className="ml-1 font-normal text-text-muted">(profilmu)</span>}
            </button>
          )
        })}
      </div>
      {showingOther && (
        <p role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-card bg-primary-soft px-4 py-3 type-small font-normal text-text">
          <span>
            Menampilkan contoh: <strong className="font-semibold">{personas.find((p) => p.id === showingOther)?.example}</strong>.
            Jawabanmu tidak berubah.
          </span>
          <button type="button" className="min-h-11 text-primary hover:underline" onClick={() => setViewPersona(null)}>
            Kembali ke hasilku
          </button>
        </p>
      )}
    </div>
  )

  const render = (set: RecommendationSet) => (
    <>
      <header className="flex flex-col gap-4">
        <h1 className="max-w-4xl text-3xl leading-[1.1] font-extrabold tracking-[-0.035em] text-text md:text-[2.75rem]">
          {set.items.length === 0
            ? "Belum ada hasil untuk profilmu"
            : `Kami menemukan ${set.items.length} laptop yang cocok dengan kebutuhanmu.`}
        </h1>
        {!showingOther && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 type-body text-text-muted">
            <span>{profileChipItems(profile).map((i) => i.text).join(" · ")}</span>
            <Link
              href={stepHref("budget")}
              className="inline-flex min-h-11 items-center gap-1 rounded-control type-small text-primary hover:underline"
            >
              <PencilSimpleIcon weight="bold" className="size-3.5" aria-hidden="true" /> Ubah
            </Link>
          </p>
        )}
        {personaSwitch}
        {set.items.length > 0 && (
          <div>
            <ScoreExplainer example={set.items[0].result} exampleName={laptopName(set.items[0])} />
          </div>
        )}
      </header>
      {set.items.length === 0 ? <NoResult profile={profile} /> : <ResultsBody set={set} announce={announce} />}
    </>
  )

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <FlowHeader tone="cobalt" />
      <main className="page-container flex flex-1 flex-col gap-8 pt-8 pb-48 md:pt-12 md:pb-32">
        {!hydrated && <ResultsSkeleton />}

        {missing && (
          <StateMessage
            icon={ClipboardTextIcon}
            title="Jawab dulu beberapa pertanyaan"
            body={`Rekomendasi disusun dari jawabanmu. Langkah "${missing.label}" belum diisi.`}
          >
            <Button asChild>
              <Link href={stepHref(missing.id)}>
                Isi langkah {missing.label} <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
              </Link>
            </Button>
          </StateMessage>
        )}

        {hydrated && !missing && (
          <>
            {useCache && cached ? (
              render(cached)
            ) : (
              <FetchedResults
                key={`${key}-${mock}-${attempt}`}
                profile={sourceProfile}
                mock={mock}
                onRetry={() => setAttempt((a) => a + 1)}
                render={render}
              />
            )}
          </>
        )}

        <p className="sr-only" aria-live="polite">
          {message}
        </p>
      </main>
      <CompareTray notice={message?.startsWith("Maksimal") ? message : null} />
    </div>
  )
}
