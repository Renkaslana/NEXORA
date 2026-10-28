"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise"
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowsLeftRight"
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle"
import { FlowHeader } from "@/components/layout/flow-header"
import { DetailHero, NeedsTable, ProsConsPanel, ReasonPanel, ScoreWhy, SpecGrid } from "@/components/laptop/detail-parts"
import { BookmarkButton } from "@/components/results/bookmark-button"
import { AlternativeCard, CompareBar, CompareCta, highlights, type CardState } from "@/components/results/results-sections"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { firstMissingStep, stepHref } from "@/components/wizard/steps"
import {
  getLaptop,
  getRecommendations,
  getRequirements,
  parseMockMode,
  type MockMode,
  type RecommendationItem,
  type RecommendationSet,
} from "@/lib/api"
import { checkSpecs } from "@/lib/spec-check"
import { useApi } from "@/lib/use-api"
import { cn } from "cn"
import { MAX_COMPARE, rehydrateCompare, useCompareStore } from "@/store/compare"
import { rehydrateProfile, useProfileHydrated, useProfileStore } from "@/store/profile"
import { profileKey, useResultsStore } from "@/store/results"
import { rehydrateSaved, useSavedHydrated, useSavedStore } from "@/store/saved"
import type { Laptop, RequirementProfile, UserProfile } from "@/types"

// Detail Laptop /laptop/[slug] (PRD §19, §27, §14; redesign brief DETAIL + referensi Fahren, Okt 2026):
// laporan rekomendasi personal. Hero (info | galeri | skor) → kenapa cocok + trade-off → kebutuhanmu vs laptop
// + kenapa skornya X% → spesifikasi → kelebihan/kekurangan → alternatif → CTA bandingkan.

const RESULTS_HREF = "/rekomendasi/hasil"

interface DetailData {
  laptop: Laptop | null
  /** null bila profil belum lengkap. */
  set: RecommendationSet | null
  requirement: RequirementProfile | null
}

function DetailSkeleton() {
  return (
    <div className="page-container flex flex-col gap-10 pt-8" aria-hidden="true">
      <div className="grid gap-8 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-[20px] bg-surface" />
        <Skeleton className="aspect-[4/3] rounded-[22px] bg-surface" />
        <Skeleton className="h-72 rounded-[20px] bg-surface" />
      </div>
      <Skeleton className="h-64 rounded-[24px] bg-surface" />
    </div>
  )
}

// ---------------------------------------------------------------- Isi

function DetailBody({ data, profile, announce }: { data: DetailData & { laptop: Laptop }; profile: UserProfile | null; announce: (m: string) => void }) {
  const { laptop, set, requirement } = data
  const name = `${laptop.brand} ${laptop.model}`
  const index = set ? set.items.findIndex((i) => i.laptop.id === laptop.id) : -1
  const result = set && index >= 0 ? set.items[index].result : undefined
  const checks = requirement ? checkSpecs(requirement, laptop) : []

  const comparedItems = useCompareStore((s) => s.items)
  const toggleCompare = useCompareStore((s) => s.toggle)
  const savedHydrated = useSavedHydrated()
  const savedList = useSavedStore((s) => s.saved)
  const toggleSaved = useSavedStore((s) => s.toggle)
  const compared = comparedItems.some((i) => i.id === laptop.id)
  const saved = savedHydrated && savedList.some((x) => x.laptopId === laptop.id)

  const compareFor = (id: string, slug: string, n: string) => () => {
    const outcome = toggleCompare({ id, slug, name: n })
    announce(
      outcome === "full"
        ? `Maksimal ${MAX_COMPARE} laptop. Hapus satu pilihan untuk menambah ${n}.`
        : outcome === "added"
          ? `${n} dipilih untuk dibandingkan.`
          : `${n} dihapus dari perbandingan.`
    )
  }
  const saveFor = (id: string, n: string) => () => announce(toggleSaved(id) ? `${n} disimpan.` : `${n} dihapus dari simpanan.`)
  const onCompare = compareFor(laptop.id, laptop.slug, name)
  const onSave = saveFor(laptop.id, name)

  const cardState = (item: RecommendationItem): CardState => {
    const n = `${item.laptop.brand} ${item.laptop.model}`
    return {
      compared: comparedItems.some((c) => c.id === item.laptop.id),
      saved: savedHydrated && savedList.some((s) => s.laptopId === item.laptop.id),
      onCompareChange: compareFor(item.laptop.id, item.laptop.slug, n),
      onSaveChange: saveFor(item.laptop.id, n),
    }
  }

  // Alternatif: laptop lain dari hasil yang sama, urut skor (PRD §19 no. 9).
  const others = set ? set.items.filter((i) => i.laptop.id !== laptop.id) : []
  const shownOthers = others.slice(0, 4)
  const extras = set ? highlights(set.items) : {}
  const rankOf = (id: string) => (set ? set.items.findIndex((i) => i.laptop.id === id) + 1 : 0)

  return (
    <>
      {/* Hero ringkas di bidang biru sangat muda */}
      <div className="bg-[#eef4fc]">
        <div className="page-container flex flex-col gap-6 pt-5 pb-10 md:pb-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 type-small text-text-muted">
              <li>
                <Link href={RESULTS_HREF} className="hover:text-primary hover:underline">
                  Hasil rekomendasi
                </Link>
              </li>
              <li aria-hidden="true">
                <CaretRightIcon weight="bold" className="size-3" />
              </li>
              <li aria-current="page" className="truncate text-text">
                {name}
              </li>
            </ol>
          </nav>
          <DetailHero
            laptop={laptop}
            result={result}
            rank={index >= 0 ? index + 1 : undefined}
            total={set?.items.length}
            budget={profile?.budget.max}
            hasProfile={!!profile}
            compared={compared}
            saved={saved}
            onCompare={onCompare}
            onSave={onSave}
            wizardHref={stepHref("budget")}
          />
        </div>
      </div>

      <div className="page-container flex flex-col gap-14 pt-10 md:gap-20 md:pt-14">
        {result && <ReasonPanel result={result} />}

        {(requirement || result) && (
          <div className={cn("grid gap-10 lg:gap-8", requirement && result && "lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start")}>
            {requirement && <NeedsTable requirement={requirement as RequirementProfile} checks={checks} />}
            {result && <ScoreWhy result={result} />}
          </div>
        )}

        <SpecGrid laptop={laptop} />
        <ProsConsPanel laptop={laptop} ownActivities={profile?.activities ?? []} />

        {shownOthers.length > 0 && (
          <section aria-labelledby="alt-detail-title" className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <h2 id="alt-detail-title" className="text-2xl leading-8 font-extrabold tracking-[-0.03em] text-text md:text-[1.75rem]">
                  Alternatif lain yang juga cocok
                </h2>
                <p className="type-body text-text-muted">Masih ragu? Bandingkan dengan pilihan lain dari hasilmu.</p>
              </div>
              <Link href={RESULTS_HREF} className="inline-flex min-h-11 items-center type-small font-semibold text-primary hover:underline">
                Lihat semua hasil
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {shownOthers.map((item, i) => (
                <AlternativeCard key={item.laptop.id} item={item} rank={rankOf(item.laptop.id)} extra={extras[item.laptop.id]} state={cardState(item)} index={i} />
              ))}
            </ul>
          </section>
        )}

        {set && <CompareCta fallbackIds={[laptop.id, ...others.slice(0, 2).map((o) => o.laptop.id)]} />}

        <p className="type-micro text-text-muted">Data contoh (demo): harga, spek, dan skor bukan data aktual. Gambar adalah ilustrasi.</p>
      </div>

      {/* Mobile & tablet: tombol utama menempel di bawah (PRD §14, §24) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg py-3 lg:hidden" /* taste-skill-ignore: bar menempel */>
        <div className="page-container flex items-center gap-2">
          <Button variant="signal" aria-pressed={compared} onClick={onCompare} className="h-12 flex-1 rounded-[14px]">
            {compared ? <CheckIcon weight="bold" aria-hidden="true" /> : <ArrowsLeftRightIcon weight="bold" aria-hidden="true" />}
            {compared ? "Dipilih" : "Bandingkan"}
          </Button>
          <BookmarkButton saved={saved} name={name} onToggle={onSave} size="lg" />
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------- Pemuatan

function DetailLoader({ slug, mock, onRetry, announce }: { slug: string; mock: MockMode | null; onRetry: () => void; announce: (m: string) => void }) {
  const [snapshot] = React.useState(() => {
    const profile = useProfileStore.getState().profile
    const complete = !firstMissingStep(profile)
    const { key, data } = useResultsStore.getState()
    return { profile: complete ? profile : null, cached: complete && key === profileKey(profile) ? data : null }
  })
  const [load] = React.useState(() => async (): Promise<DetailData> => {
    const { profile, cached } = snapshot
    const [laptop, set, requirement] = await Promise.all([
      getLaptop(slug, { mock }),
      profile ? (cached ? Promise.resolve(cached) : getRecommendations(profile)) : Promise.resolve(null),
      profile ? getRequirements(profile) : Promise.resolve(null),
    ])
    return { laptop, set, requirement }
  })
  const state = useApi(load)

  if (state.status === "loading") {
    return (
      <>
        <span className="sr-only" role="status">
          Memuat detail laptop…
        </span>
        <DetailSkeleton />
      </>
    )
  }
  if (state.status === "error") {
    return (
      <div className="page-container pt-10">
      <StateMessage icon={WarningCircleIcon} tone="danger" title="Gagal memuat detail laptop" body="Terjadi kesalahan saat memuat data. Coba lagi sebentar lagi.">
        <Button onClick={onRetry}>
          <ArrowCounterClockwiseIcon weight="bold" aria-hidden="true" /> Coba lagi
        </Button>
        <Button asChild variant="secondary">
          <Link href={RESULTS_HREF}>Kembali ke hasil</Link>
        </Button>
      </StateMessage>
      </div>
    )
  }
  if (!state.data.laptop) {
    return (
      <div className="page-container pt-10">
      <StateMessage icon={WarningCircleIcon} title="Laptop tidak ditemukan" body="Laptop tidak ditemukan atau sudah tidak tersedia.">
        <Button asChild>
          <Link href={RESULTS_HREF}>Kembali ke hasil</Link>
        </Button>
        {/* "Jelajahi laptop" (/jelajah) ditambahkan saat halamannya dibuat (PRD §26). */}
      </StateMessage>
      </div>
    )
  }
  return <DetailBody data={{ ...state.data, laptop: state.data.laptop }} profile={snapshot.profile} announce={announce} />
}

export function DetailView({ slug }: { slug: string }) {
  const params = useSearchParams()
  const mock = parseMockMode(params.get("mock"))
  const hydrated = useProfileHydrated()
  const [attempt, setAttempt] = React.useState(0)
  const [message, setMessage] = React.useState<string | null>(null)
  const announce = React.useCallback((m: string) => setMessage(m), [])

  React.useEffect(() => {
    rehydrateProfile()
    rehydrateSaved()
    rehydrateCompare()
  }, [])

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <FlowHeader back={{ href: RESULTS_HREF, label: "Kembali ke hasil" }} />
      <main className="flex flex-1 flex-col pb-40 lg:pb-32">
        {hydrated ? (
          <DetailLoader key={`${slug}-${attempt}`} slug={slug} mock={mock} onRetry={() => setAttempt((a) => a + 1)} announce={announce} />
        ) : (
          <DetailSkeleton />
        )}
        <p className="sr-only" aria-live="polite">
          {message}
        </p>
      </main>
      <CompareBar raised />
    </div>
  )
}
