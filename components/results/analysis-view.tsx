"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, CircleAlert, ClipboardList, RotateCcw } from "lucide-react"
import { FlowHeader } from "@/components/layout/flow-header"
import { AnalyzingSteps, type AnalyzingStep } from "@/components/results/analyzing-steps"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { firstMissingStep, stepHref } from "@/components/wizard/steps"
import { getBudgetInsight, getRecommendations, getWizardOptions, parseMockMode, type MockMode } from "@/lib/api"
import { formatRupiahShort } from "@/lib/format"
import { useApi } from "@/lib/use-api"
import { rehydrateProfile, useProfileHydrated, useProfileStore } from "@/store/profile"
import { useResultsStore } from "@/store/results"
import type { UserProfile } from "@/types"

// Layar Analisis /rekomendasi/analisis (PRD §14, §25, §26): 4 tahap dicentang bergantian
// sambil getRecommendations() berjalan, lalu otomatis ke Hasil. Teks tahap hanya menampilkan
// jawaban pengguna dan angka katalog mock; tidak ada perhitungan SAW di frontend.

const PROFILE_HREF = "/rekomendasi/profil"
const RESULT_HREF = "/rekomendasi/hasil"
/** Waktu (ms) tiap tahap selesai; total ± 2,5 detik (PRD §25). */
const STEP_DONE_AT = [700, 1300, 1900, 2500]
const options = getWizardOptions()
const labelOf = <T extends { id: string; label: string }>(list: T[], id: string) =>
  list.find((x) => x.id === id)?.label ?? id

function stepsFor(profile: UserProfile): AnalyzingStep[] {
  const insight = getBudgetInsight(profile.budget.max, profile.budget.flexible)
  const priorityLabels = profile.priorities
    .slice(0, 3)
    .map((p) => options.priorities.find((o) => o.criterion === p.criterion)?.label ?? p.criterion)
  const filters = profile.hardFilters.length ? ` · ${profile.hardFilters.length} syarat wajib` : ""
  return [
    {
      label: "Membaca profilmu",
      detail: [
        labelOf(options.majors, profile.major),
        formatRupiahShort(profile.budget.max),
        profile.primaryActivity ? labelOf(options.activities, profile.primaryActivity) : null,
      ]
        .filter(Boolean)
        .join(" · "),
    },
    {
      label: "Menyaring laptop sesuai budget",
      detail: `${insight.catalogSize} laptop di katalog → ${insight.laptopCount} dalam budget${filters}`,
    },
    {
      label: "Menghitung kecocokan per kriteria",
      detail: priorityLabels.length ? `Prioritasmu: ${priorityLabels.join(", ")}` : "Memakai prioritas umum untuk jurusanmu",
    },
    { label: "Menyusun alasan dan trade-off", detail: "Untuk Best Match dan alternatifnya" },
  ]
}

// ---------------------------------------------------------------- Satu kali proses (remount untuk Coba lagi)

function AnalysisRun({ mock, onRetry }: { mock: MockMode | null; onRetry: () => void }) {
  const router = useRouter()
  const setResult = useResultsStore((s) => s.setResult)
  // Profil dibekukan saat proses dimulai.
  const [profile] = React.useState(() => useProfileStore.getState().profile)
  const [load] = React.useState(() => () => getRecommendations(profile, { mock }))
  const state = useApi(load)
  const [elapsed, setElapsed] = React.useState(0)
  const steps = React.useMemo(() => stepsFor(profile), [profile])
  const headingRef = React.useRef<HTMLHeadingElement>(null)

  React.useEffect(() => {
    headingRef.current?.focus()
    const timers = STEP_DONE_AT.map((ms, i) => window.setTimeout(() => setElapsed(i + 1), ms))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [])

  // Tahap terakhir baru selesai setelah data datang.
  const completed = state.status === "success" ? elapsed : Math.min(elapsed, steps.length - 1)
  const finished = state.status === "success" && completed === steps.length

  React.useEffect(() => {
    if (!finished || state.status !== "success") return
    setResult(profile, state.data)
    const t = window.setTimeout(() => {
      router.replace(mock === "empty" ? `${RESULT_HREF}?mock=empty` : RESULT_HREF)
    }, 400)
    return () => window.clearTimeout(t)
  }, [finished, state, profile, setResult, router, mock])

  if (state.status === "error") {
    return (
      <StateMessage
        icon={CircleAlert}
        tone="danger"
        title="Gagal membuat rekomendasi"
        body="Terjadi kesalahan saat membuat rekomendasi. Jawabanmu tetap tersimpan."
      >
        <Button onClick={onRetry}>
          <RotateCcw aria-hidden="true" /> Coba lagi
        </Button>
        <Button asChild variant="secondary">
          <Link href={stepHref("budget")}>Ubah jawaban</Link>
        </Button>
      </StateMessage>
    )
  }

  const current = steps[Math.min(completed, steps.length - 1)]
  return (
    <section aria-labelledby="analysis-title" className="flex w-full max-w-xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 id="analysis-title" ref={headingRef} tabIndex={-1} className="type-h1 text-text outline-none">
          {finished ? "Rekomendasi siap" : "Menganalisis kebutuhanmu…"}
        </h1>
        <p className="type-body-l text-text-muted">
          {finished
            ? "Membuka laptop yang paling cocok untukmu."
            : "Kami mencocokkan jawabanmu dengan laptop di katalog. Ini hanya butuh beberapa detik."}
        </p>
      </header>

      <div
        role="progressbar"
        aria-label="Kemajuan analisis"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={completed}
        aria-valuetext={finished ? "Selesai" : `Tahap ${completed + 1} dari ${steps.length}: ${current.label}`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-border"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${(completed / steps.length) * 100}%` }}
        />
      </div>

      <AnalyzingSteps steps={steps} completed={completed} />

      <p className="sr-only" aria-live="polite">
        {finished ? "Analisis selesai. Membuka hasil." : current.label}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="secondary">
          <Link href={PROFILE_HREF}>Batal</Link>
        </Button>
        <p className="type-micro text-text-muted">Data contoh (demo); perhitungan asli dilakukan server.</p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- Halaman

export function AnalysisView() {
  const params = useSearchParams()
  const mock = parseMockMode(params.get("mock"))
  const hydrated = useProfileHydrated()
  const profile = useProfileStore((s) => s.profile)
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    rehydrateProfile()
  }, [])

  const missing = hydrated ? firstMissingStep(profile) : undefined

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <FlowHeader />
      <main className="page-container flex flex-1 flex-col items-center pt-12 pb-20 md:pt-20">
        {!hydrated && (
          <div className="flex w-full max-w-xl flex-col gap-6" aria-hidden="true">
            <Skeleton className="h-10 w-3/4 rounded-control bg-surface" />
            <Skeleton className="h-48 rounded-card bg-surface" />
          </div>
        )}
        {missing && (
          <StateMessage
            icon={ClipboardList}
            title="Jawab dulu beberapa pertanyaan"
            body={`Rekomendasi disusun dari jawabanmu. Langkah "${missing.label}" belum diisi.`}
          >
            <Button asChild>
              <Link href={stepHref(missing.id)}>
                Isi langkah {missing.label} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </StateMessage>
        )}
        {hydrated && !missing && <AnalysisRun key={attempt} mock={mock} onRetry={() => setAttempt((a) => a + 1)} />}
      </main>
    </div>
  )
}
