"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft"
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut"
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowsLeftRight"
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/ssr/BookmarkSimple"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle"
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning"
import { FlowHeader } from "@/components/layout/flow-header"
import { FullSpecs, KeySpecs, LaptopGallery, ProsCons, SuitedFor } from "@/components/laptop/laptop-sections"
import { CompareTray } from "@/components/results/compare-tray"
import { categoryLabels, LaptopCard } from "@/components/results/laptop-card"
import { RequirementCheck, RequirementCheckHeader } from "@/components/results/requirement-check"
import { ScoreBreakdown } from "@/components/results/score-breakdown"
import { ScoreExplainer } from "@/components/results/score-explainer"
import { ScoreRing } from "@/components/results/score-ring"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { firstMissingStep, stepHref } from "@/components/wizard/steps"
import {
  getLaptop,
  getRecommendations,
  getRequirements,
  parseMockMode,
  type MockMode,
  type RecommendationSet,
} from "@/lib/api"
import { formatRupiah } from "@/lib/format"
import { checkSpecs } from "@/lib/spec-check"
import { useApi } from "@/lib/use-api"
import { cn } from "cn"
import { MAX_COMPARE, rehydrateCompare, useCompareStore } from "@/store/compare"
import { rehydrateProfile, useProfileHydrated, useProfileStore } from "@/store/profile"
import { profileKey, useResultsStore } from "@/store/results"
import { rehydrateSaved, useSavedHydrated, useSavedStore } from "@/store/saved"
import type { Laptop, RecommendationResult, RequirementProfile, UserProfile } from "@/types"

// Detail Laptop /laptop/[slug] (PRD §19, §27, §14): setiap bagian dikaitkan dengan profil pengguna.

const RESULTS_HREF = "/rekomendasi/hasil"

interface DetailData {
  laptop: Laptop | null
  /** null bila profil belum lengkap. */
  set: RecommendationSet | null
  requirement: RequirementProfile | null
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-hidden="true">
      <div className="grid gap-8 lg:grid-cols-12">
        <Skeleton className="aspect-[4/3] rounded-card bg-surface lg:col-span-7" />
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Skeleton className="h-10 w-4/5 rounded-control bg-surface" />
          <Skeleton className="h-5 w-32 rounded-control bg-surface" />
          <Skeleton className="size-28 rounded-full bg-surface" />
          <Skeleton className="h-12 w-full rounded-control bg-surface" />
        </div>
      </div>
      <Skeleton className="h-64 rounded-card bg-surface" />
    </div>
  )
}

function Section({ id, title, children, action }: { id: string; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id={id} className="type-h2 text-text">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------- Isi

function DetailBody({ data, profile, announce }: { data: DetailData & { laptop: Laptop }; profile: UserProfile | null; announce: (m: string) => void }) {
  const { laptop, set, requirement } = data
  const name = `${laptop.brand} ${laptop.model}`
  const item = set?.items.find((i) => i.laptop.id === laptop.id)
  const result: RecommendationResult | undefined = item?.result
  const checks = requirement ? checkSpecs(requirement, laptop) : []
  const checked = checks.filter((c) => c.status !== "unchecked")
  const met = checked.filter((c) => c.status === "met").length

  const compared = useCompareStore((s) => s.items.some((i) => i.id === laptop.id))
  const toggleCompare = useCompareStore((s) => s.toggle)
  const savedHydrated = useSavedHydrated()
  const saved = useSavedStore((s) => s.saved.some((x) => x.laptopId === laptop.id))
  const toggleSaved = useSavedStore((s) => s.toggle)

  const onCompare = () => {
    const outcome = toggleCompare({ id: laptop.id, slug: laptop.slug, name })
    announce(
      outcome === "full"
        ? `Maksimal ${MAX_COMPARE} laptop. Hapus satu dari tray untuk menambah ${name}.`
        : outcome === "added"
          ? `${name} ditambahkan ke komparasi.`
          : `${name} dihapus dari komparasi.`
    )
  }
  const onSave = () => announce(toggleSaved(laptop.id) ? `${name} disimpan.` : `${name} dihapus dari simpanan.`)

  // R4: di band kobalt Bandingkan = kuning sinyal, Simpan = inverse; di bar bawah mobile tetap biasa.
  const actions = (tone: "default" | "cobalt") => (
    <div className="flex items-center gap-2">
      <Button
        size="lg"
        variant={tone === "cobalt" ? "signal" : "primary"}
        aria-pressed={compared}
        onClick={onCompare}
        className="flex-1 sm:flex-none"
      >
        {compared ? <CheckIcon weight="bold" aria-hidden="true" /> : <ArrowsLeftRightIcon weight="bold" aria-hidden="true" />}
        {compared ? "Dibandingkan" : "Bandingkan"}
      </Button>
      <Button
        variant={tone === "cobalt" ? "inverse" : "secondary"}
        size="lg"
        aria-pressed={savedHydrated && saved}
        onClick={onSave}
        className={cn(tone !== "cobalt" && saved && "border-primary text-primary")}
      >
        <BookmarkSimpleIcon weight="bold" className={cn(saved && "fill-current")} aria-hidden="true" />
        {saved ? "Tersimpan" : "Simpan"}
      </Button>
    </div>
  )

  // Alternatif serupa: 3 laptop lain dari hasil yang sama, paling dekat skornya (PRD §19 no. 9).
  const similar = set && result
    ? set.items
        .filter((i) => i.laptop.id !== laptop.id)
        .sort((a, b) => Math.abs(a.result.matchScore - result.matchScore) - Math.abs(b.result.matchScore - result.matchScore))
        .slice(0, 3)
    : []

  const tabSections = [
    { id: "kunci", label: "Spesifikasi kunci", content: <KeySpecs laptop={laptop} /> },
    { id: "plusminus", label: "Kelebihan & kekurangan", content: <ProsCons laptop={laptop} /> },
    { id: "cocok", label: "Cocok untuk", content: <SuitedFor laptop={laptop} userActivities={profile?.activities ?? []} /> },
    { id: "lengkap", label: "Spesifikasi lengkap", content: <FullSpecs laptop={laptop} /> },
  ]

  return (
    <div className="flex flex-col gap-14">
      {/* ------------------------------------------------------------ 1. Hero (R4: band kobalt) */}
      <div
        data-tone="cobalt"
        className="grid gap-6 rounded-[24px] bg-cobalt-600 p-2 text-white md:p-3 lg:grid-cols-12 lg:gap-8"
      >
        <div className="lg:col-span-7">
          <LaptopGallery name={name} image={laptop.image} tone="cobalt" />
        </div>
        <div className="flex flex-col gap-6 px-3 pb-4 lg:col-span-5 lg:px-2 lg:py-6 lg:pr-6">
          <div className="flex flex-col gap-2">
            {result?.category && (
              <span className="self-start rounded-full bg-signal px-2.5 py-0.5 type-micro text-signal-ink">
                {categoryLabels[result.category]}
              </span>
            )}
            <h1 className="text-3xl leading-[1.1] font-extrabold tracking-[-0.035em] text-white md:text-[2.75rem]">{name}</h1>
            <p className="num type-body text-cobalt-100">{formatRupiah(laptop.priceIdr)}</p>
          </div>
          {result ? (
            <div className="flex items-center gap-5">
              <ScoreRing value={result.matchScore} size="lg" tone="cobalt" />
              <p className="type-body-l text-white">
                <strong className="font-semibold">{result.matchScore}% cocok.</strong> {result.summary}
              </p>
            </div>
          ) : (
            <p className="rounded-[14px] bg-cobalt-700 p-4 type-small font-normal text-white">
              {profile
                ? "Laptop ini tidak masuk rekomendasi untuk profilmu, jadi belum ada skor kecocokan."
                : "Isi Wizard untuk melihat seberapa cocok laptop ini dengan kebutuhanmu."}
            </p>
          )}
          <div className="hidden lg:block">{actions("cobalt")}</div>
          <a
            href={laptop.marketplaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-control type-small text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
          >
            Cek harga di toko (contoh) <ArrowSquareOutIcon weight="bold" className="size-4" aria-hidden="true" />
            <span className="sr-only">(membuka tab baru)</span>
          </a>
          {!profile && (
            <Button asChild variant="inverse" className="self-start">
              <Link href={stepHref("budget")}>Cari tahu kecocokannya</Link>
            </Button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------ 2. Berdasarkan kebutuhanmu */}
      {requirement && (
        <Section id="kebutuhan" title="Berdasarkan kebutuhanmu">
          <p className="max-w-[44rem] type-body-l text-text">
            {result ? `${result.summary} ` : ""}
            Laptop ini memenuhi <span className="num">{met}</span> dari <span className="num">{checked.length}</span> spek minimum
            yang diperiksa untuk profilmu.
          </p>
          <div className="flex flex-col gap-2">
            <RequirementCheckHeader />
            <RequirementCheck specs={requirement.specs} results={checks} />
          </div>
        </Section>
      )}

      {/* ------------------------------------------------------------ 3. Kenapa direkomendasikan + trade-off */}
      {result && (
        <Section id="alasan" title="Kenapa direkomendasikan">
          <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <ul className="flex flex-col gap-3">
              {result.reasons.map((r) => (
                <li key={r.text} className="flex gap-3">
                  <CheckIcon weight="bold" className="mt-1 size-5 shrink-0 text-success" aria-hidden="true" />
                  <span className="type-body text-text">
                    {r.text}
                    <span className="block type-small font-normal text-text-muted">{r.source}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              <h3 className="type-h3 text-text">Trade-off</h3>
              <ul className="flex flex-col gap-3">
                {result.tradeOffs.map((t) => (
                  <li key={t.text} className="flex gap-3">
                    <WarningIcon weight="bold" className="mt-1 size-5 shrink-0 text-warning" aria-hidden="true" />
                    <span className="type-body text-text">
                      <span className="sr-only">Trade-off: </span>
                      {t.text}
                      <span className="block type-small font-normal text-text-muted">{t.source}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      )}

      {/* ------------------------------------------------------------ 4. Score breakdown */}
      {result && (
        <Section id="breakdown" title="Rincian skor" action={<ScoreExplainer example={result} exampleName={name} />}>
          <ScoreBreakdown result={result} className="max-w-3xl" />
        </Section>
      )}

      {/* ------------------------------------------------------------ 5–8. Tabs (desktop) / accordion (mobile) */}
      <section aria-label="Spesifikasi dan kecocokan" className="flex flex-col gap-5">
        <div className="hidden md:block">
          <Tabs defaultValue="kunci">
            <TabsList aria-label="Bagian spesifikasi">
              {tabSections.map((t) => (
                <TabsTrigger key={t.id} value={t.id}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabSections.map((t) => (
              <TabsContent key={t.id} value={t.id}>
                {t.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
        <div className="md:hidden">
          <Accordion type="multiple" defaultValue={["kunci"]}>
            {tabSections.map((t) => (
              <AccordionItem key={t.id} value={t.id}>
                <AccordionTrigger>{t.label}</AccordionTrigger>
                <AccordionContent>{t.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ------------------------------------------------------------ 9. Alternatif serupa */}
      {similar.length > 0 && (
        <Section id="serupa" title="Alternatif serupa">
          <div className="grid gap-3 md:grid-cols-3">
            {similar.map((s) => (
              <LaptopCard key={s.laptop.id} variant="compact" laptop={s.laptop} result={s.result} animateScore={false} />
            ))}
          </div>
        </Section>
      )}

      <p className="type-micro text-text-muted">Data contoh (demo): harga, spek, dan skor bukan data aktual.</p>

      {/* Mobile & tablet: CTA menempel di bawah (PRD §14, §24) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg py-3 lg:hidden">
        <div className="page-container">{actions("default")}</div>
      </div>
    </div>
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
      <StateMessage icon={WarningCircleIcon} tone="danger" title="Gagal memuat detail laptop" body="Terjadi kesalahan saat memuat data. Coba lagi sebentar lagi.">
        <Button onClick={onRetry}>
          <ArrowCounterClockwiseIcon weight="bold" aria-hidden="true" /> Coba lagi
        </Button>
        <Button asChild variant="secondary">
          <Link href={RESULTS_HREF}>Kembali ke hasil</Link>
        </Button>
      </StateMessage>
    )
  }
  if (!state.data.laptop) {
    return (
      <StateMessage icon={WarningCircleIcon} title="Laptop tidak ditemukan" body="Laptop tidak ditemukan atau sudah tidak tersedia.">
        <Button asChild>
          <Link href={RESULTS_HREF}>Kembali ke hasil</Link>
        </Button>
        {/* "Jelajahi laptop" (/jelajah) ditambahkan saat halamannya dibuat (PRD §26). */}
      </StateMessage>
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
      <FlowHeader tone="cobalt" />
      <main className="page-container flex flex-1 flex-col gap-6 pt-6 pb-48 md:pt-8 lg:pb-32">
        <Link href={RESULTS_HREF} className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-control type-small text-primary hover:underline">
          <ArrowLeftIcon weight="bold" className="size-4" aria-hidden="true" /> Kembali ke hasil
        </Link>
        {hydrated ? (
          <DetailLoader key={`${slug}-${attempt}`} slug={slug} mock={mock} onRetry={() => setAttempt((a) => a + 1)} announce={announce} />
        ) : (
          <DetailSkeleton />
        )}
        <p className="sr-only" aria-live="polite">
          {message}
        </p>
      </main>
      <CompareTray raised notice={message?.startsWith("Maksimal") ? message : null} />
    </div>
  )
}
