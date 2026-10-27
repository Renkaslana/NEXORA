"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/ssr/ClipboardText"
import { GraduationCapIcon } from "@phosphor-icons/react/dist/ssr/GraduationCap"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass"
import { TargetIcon } from "@phosphor-icons/react/dist/ssr/Target"
import { WalletIcon } from "@phosphor-icons/react/dist/ssr/Wallet"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle"
import { FlowHeader } from "@/components/layout/flow-header"
import { BestMatch } from "@/components/results/best-match"
import { ResultsIntro, type IntroSummaryItem } from "@/components/results/results-intro"
import { Alternatives, CompareBar, CompareCta, ReasonCards, type CardState } from "@/components/results/results-sections"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { firstMissingStep, stepHref } from "@/components/wizard/steps"
import {
  getNoResultSuggestions,
  getRecommendations,
  getWizardOptions,
  parseMockMode,
  type MockMode,
  type RecommendationItem,
  type RecommendationSet,
} from "@/lib/api"
import { formatRupiah, formatRupiahShort } from "@/lib/format"
import { useApi } from "@/lib/use-api"
import { MAX_COMPARE, rehydrateCompare, useCompareStore } from "@/store/compare"
import { rehydrateProfile, useProfileHydrated, useProfileStore } from "@/store/profile"
import { profileKey, useResultsStore } from "@/store/results"
import { rehydrateSaved, useSavedStore } from "@/store/saved"
import type { UserProfile } from "@/types"

// Hasil Rekomendasi /rekomendasi/hasil (PRD §17, §26, §27; redesign brief Hasil + referensi Fahren, Okt 2026):
// Konteks (intro + ringkasan jawaban) → Best Match → alasan → alternatif (filter merek + urutan) → CTA
// bandingkan; bar bandingkan menempel di bawah mulai 2 laptop. Tanpa persona contoh.

const options = getWizardOptions()
const activityLabel = Object.fromEntries(options.activities.map((a) => [a.id, a.label])) as Record<string, string>
const laptopName = (item: RecommendationItem) => `${item.laptop.brand} ${item.laptop.model}`

function ResultsSkeleton() {
  return (
    <div className="page-container flex flex-col gap-8 pt-10" aria-hidden="true">
      <Skeleton className="h-[220px] rounded-[24px] bg-surface" />
      <Skeleton className="h-[420px] rounded-[24px] bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[360px] rounded-[20px] bg-surface" />
        ))}
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

  return (item: RecommendationItem): CardState => {
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

// ---------------------------------------------------------------- Isi hasil

function ResultsBody({ set, profile, announce }: { set: RecommendationSet; profile: UserProfile; announce: (message: string) => void }) {
  const cardProps = useCardActions(announce)
  const [best, ...rest] = set.items
  const fallbackIds = set.items.slice(0, 3).map((i) => i.laptop.id)

  return (
    <div className="page-container relative z-10 -mt-14 flex flex-col gap-14 md:gap-20 lg:-mt-20">
      <BestMatch
        item={best}
        total={set.items.length}
        budget={profile.budget.max}
        useCaseLabels={activityLabel}
        ownActivities={profile.activities}
        {...cardProps(best)}
      />
      <ReasonCards item={best} />
      {rest.length > 0 && <Alternatives items={rest} all={set.items} cardState={cardProps} />}
      <CompareCta fallbackIds={fallbackIds} />
      <p className="type-micro text-text-muted">
        Skor dari data contoh; perhitungan asli dilakukan server SPECO. Gambar laptop adalah ilustrasi, bukan foto produk asli.
      </p>
    </div>
  )
}

/** Ringkasan jawaban untuk header: budget, kategori utama (aktivitas utama), kebutuhan lain / jurusan. */
function introSummary(profile: UserProfile): IntroSummaryItem[] {
  const primary = (profile.primaryActivity && activityLabel[profile.primaryActivity]) || "-"
  const extra = profile.activities.filter((a) => a !== profile.primaryActivity).slice(0, 2).map((a) => activityLabel[a])
  const major = options.majors.find((m) => m.id === profile.major)?.label ?? "-"
  return [
    { label: "Budget", value: formatRupiah(profile.budget.max), Icon: WalletIcon },
    { label: "Kategori utama", value: primary, Icon: TargetIcon },
    extra.length
      ? { label: "Kebutuhan lain", value: extra.join(" & "), Icon: GraduationCapIcon }
      : { label: "Jurusan", value: major, Icon: GraduationCapIcon },
  ]
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
      <div className="page-container pt-10">
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
      </div>
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
  const [attempt, setAttempt] = React.useState(0)
  const [message, setMessage] = React.useState<string | null>(null)
  const announce = React.useCallback((m: string) => setMessage(m), [])

  React.useEffect(() => {
    rehydrateProfile()
    rehydrateSaved()
    rehydrateCompare()
  }, [])

  const missing = hydrated ? firstMissingStep(profile) : undefined
  const key = profileKey(profile)
  const useCache = !mock && cached && cachedKey === key

  const render = (set: RecommendationSet) =>
    set.items.length === 0 ? (
      <div className="page-container flex flex-col gap-6 pt-10 md:pt-14">
        <h1 className="max-w-4xl text-3xl leading-[1.1] font-extrabold tracking-[-0.035em] text-text md:text-[2.75rem]">
          Belum ada hasil untuk profilmu
        </h1>
        <NoResult profile={profile} />
      </div>
    ) : (
      <>
        <ResultsIntro count={set.items.length} summary={introSummary(profile)} editHref={stepHref("budget")} />
        <ResultsBody set={set} profile={profile} announce={announce} />
      </>
    )

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <FlowHeader back={{ href: "/rekomendasi/profil" }} />
      <main className="flex flex-1 flex-col pb-32">
        {!hydrated && <ResultsSkeleton />}

        {missing && (
          <div className="page-container pt-10">
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
          </div>
        )}

        {hydrated && !missing && (
          <>
            {useCache && cached ? (
              render(cached)
            ) : (
              <FetchedResults
                key={`${key}-${mock}-${attempt}`}
                profile={profile}
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
      <CompareBar />
    </div>
  )
}
