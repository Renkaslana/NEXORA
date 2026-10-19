"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise"
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/ssr/ClipboardText"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle"
import { FlowHeader } from "@/components/layout/flow-header"
import { ProfileChips } from "@/components/profile/profile-chips"
import { LevelBadge } from "@/components/profile/requirement-card"
import { ProfileCharacterCard } from "@/components/profile/profile-character-card"
import { SpecMeterRows } from "@/components/profile/spec-meter-rows"
import { WarningPanel } from "@/components/profile/warning-panel"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { firstMissingStep, stepHref } from "@/components/wizard/steps"
import { getGlossary, getPersonaForMajor, getRequirements, getWizardOptions, parseMockMode, type MockMode } from "@/lib/api"
import { useApi } from "@/lib/use-api"
import { emptyProfile, rehydrateProfile, useProfileHydrated, useProfileStore } from "@/store/profile"

// Profil Kebutuhan /rekomendasi/profil (PRD §16, §14, §26): spek minimum + alasan
// sebelum pengguna melihat satu pun laptop. REDESIGN §18: kartu profil gelap + baris Garis Kebutuhan.

const ANALYSIS_HREF = "/rekomendasi/analisis"
const glossary = getGlossary()
const personas = getWizardOptions().personas

// ---------------------------------------------------------------- State pendukung

function GridSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <Skeleton className="h-48 rounded-card bg-ink-900" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-card bg-surface" />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Isi (remount saat budget/jurusan berubah)

function ProfileContent({
  mock,
  onRetry,
  focusOnLoadRef,
  actions,
}: {
  /** CTA halaman; hanya tampil setelah profil berhasil dimuat. */
  actions: React.ReactNode
  mock: MockMode | null
  onRetry: () => void
  /** true setelah pengguna menaikkan budget: fokus ke ringkasan baru (PRD §28). */
  focusOnLoadRef: React.RefObject<boolean>
}) {
  const profile = useProfileStore((s) => s.profile)
  const compromises = useProfileStore((s) => s.compromises)
  const setBudget = useProfileStore((s) => s.setBudget)
  const setCompromise = useProfileStore((s) => s.setCompromise)

  // Loader dibuat sekali per mount; komponen ini diberi `key` dari budget + jurusan + percobaan.
  const [load] = React.useState(() => {
    const { major, budget } = useProfileStore.getState().profile
    return () => getRequirements({ ...emptyProfile, major, budget }, { mock })
  })
  const state = useApi(load)
  const summaryRef = React.useRef<HTMLParagraphElement>(null)
  React.useEffect(() => {
    if (state.status !== "success" || !focusOnLoadRef.current) return
    focusOnLoadRef.current = false
    summaryRef.current?.focus()
  }, [state.status, focusOnLoadRef])
  const persona = personas.find((p) => p.id === getPersonaForMajor(profile.major))

  if (state.status === "loading") {
    return (
      <>
        <span className="sr-only" role="status">
          Menyusun Profil Kebutuhan…
        </span>
        <GridSkeleton />
      </>
    )
  }

  if (state.status === "error") {
    return (
      <StateMessage
        icon={WarningCircleIcon}
        tone="danger"
        title="Gagal memuat Profil Kebutuhan"
        body="Terjadi kesalahan saat menyusun spek yang kamu butuhkan. Jawabanmu tetap tersimpan."
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

  const requirement = state.data
  return (
    <div className="flex flex-col gap-10">
      <ProfileCharacterCard requirement={requirement} persona={persona} summaryRef={summaryRef} />

      {requirement.warnings.map((w) => (
        <WarningPanel
          key={w.id}
          warning={w}
          accepted={compromises.includes(w.id)}
          onRaiseBudget={(target) => {
            focusOnLoadRef.current = true
            setBudget(target)
          }}
          onCompromise={(accepted) => setCompromise(w.id, accepted)}
        />
      ))}

      <section aria-labelledby="specs-title" className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 id="specs-title" className="type-h2 text-text">
            Spesifikasi minimum yang disarankan
          </h2>
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 type-micro text-text-muted" aria-label="Arti tingkat">
            <div className="flex items-center gap-1.5">
              <dt><LevelBadge level="wajib" /></dt>
              <dd>harus ada</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt><LevelBadge level="disarankan" /></dt>
              <dd>sebaiknya ada</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt><LevelBadge level="opsional" /></dt>
              <dd>boleh tidak</dd>
            </div>
          </dl>
        </div>
        <SpecMeterRows requirement={requirement} glossary={glossary} />
        {persona && (
          <p className="type-micro text-text-muted">
            Disusun untuk persona {persona.label} berdasarkan jurusanmu. Data contoh (demo), belum dihitung server.
          </p>
        )}
      </section>

      <div className="hidden lg:block">{actions}</div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg py-3 lg:hidden">
        <div className="page-container">{actions}</div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Halaman

export function ProfileView() {
  const params = useSearchParams()
  const mock = parseMockMode(params.get("mock"))
  const hydrated = useProfileHydrated()
  const profile = useProfileStore((s) => s.profile)
  const [attempt, setAttempt] = React.useState(0)
  const focusOnLoadRef = React.useRef(false)

  React.useEffect(() => {
    rehydrateProfile()
  }, [])

  const missing = hydrated ? firstMissingStep(profile) : undefined
  const ready = hydrated && !missing

  const actions = (
    <div className="flex items-center gap-2">
      <Button asChild variant="secondary">
        <Link href={stepHref("budget")}>
          <ArrowLeftIcon weight="bold" aria-hidden="true" /> <span className="max-[400px]:sr-only">Ubah Jawaban</span>
        </Link>
      </Button>
      <Button asChild size="lg" className="ml-auto">
        <Link href={ANALYSIS_HREF}>
          Lihat Laptop yang Cocok <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <FlowHeader />
      <main className="page-container flex flex-1 flex-col gap-8 pt-8 pb-32 md:pt-12 lg:pb-20">
        <header className="flex flex-col gap-4">
          <h1 className="type-h1 text-text">Profil Laptop Kamu</h1>
          {ready ? (
            <ProfileChips profile={profile} />
          ) : (
            <Skeleton className="h-11 w-full max-w-xl rounded-full bg-surface" aria-hidden="true" />
          )}
        </header>

        {!hydrated && <GridSkeleton />}

        {missing && (
          <StateMessage
            icon={ClipboardTextIcon}
            title="Jawab dulu beberapa pertanyaan"
            body={`Profil Kebutuhan disusun dari jawabanmu. Langkah "${missing.label}" belum diisi.`}
          >
            <Button asChild>
              <Link href={stepHref(missing.id)}>
                Isi langkah {missing.label} <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
              </Link>
            </Button>
          </StateMessage>
        )}

        {ready && (
          <>
            <ProfileContent
              key={`${profile.major}-${profile.budget.max}-${attempt}`}
              mock={mock}
              focusOnLoadRef={focusOnLoadRef}
              onRetry={() => setAttempt((a) => a + 1)}
              actions={actions}
            />
          </>
        )}
      </main>
    </div>
  )
}
