"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/ssr/ClipboardText"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle"
import { FlowHeader } from "@/components/layout/flow-header"
import { AnalysisCatalog, catalogCounts } from "@/components/results/analysis-catalog"
import { AnalyzingSteps, type AnalyzingStep } from "@/components/results/analyzing-steps"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { firstMissingStep, stepHref } from "@/components/wizard/steps"
import { getBudgetInsight, getRecommendations, getWizardOptions, parseMockMode, type MockMode } from "@/lib/api"
import { formatRupiahShort } from "@/lib/format"
import { DURATION, EASE_OUT } from "@/lib/motion"
import { useApi } from "@/lib/use-api"
import { rehydrateProfile, useProfileHydrated, useProfileStore } from "@/store/profile"
import { useResultsStore } from "@/store/results"
import type { UserProfile } from "@/types"

// Layar Analisis /rekomendasi/analisis (PRD §14, §25, §26; REDESIGN §14), redesign "Garis
// kebutuhan menyapu katalog" di bidang kobalt: kartu profil tercetak, 4 tahap dicentang
// bergantian sambil getRecommendations() berjalan, katalog 12 laptop disapu garis budget dan
// diurutkan, Best Match mengisi bingkai, lalu otomatis ke Hasil. Tidak ada perhitungan SAW di frontend: penyaringan memakai harga vs
// budget dan himpunan hasil dari API.

const PROFILE_HREF = "/rekomendasi/profil"
const RESULT_HREF = "/rekomendasi/hasil"
/** Waktu (ms) tiap tahap selesai; total ± 2,5 detik (PRD §25). */
const STEP_DONE_AT = [700, 1300, 1900, 2500]
/** Jeda menampilkan Best Match (skor dihitung naik) sebelum pindah ke Hasil. */
const HIGHLIGHT_MS = 1000
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

type Hold = "steps" | "best" | null
const parseHold = (v: string | null): Hold => (v === "1" ? "steps" : v === "best" ? "best" : null)

/** Isi kartu profil yang "tercetak" di awal analisis. */
function receiptFor(profile: UserProfile) {
  const software = profile.software
    .map((id) => options.software.find((s) => s.id === id)?.label ?? id)
    .slice(0, 3)
  return [
    { label: "Jurusan", value: labelOf(options.majors, profile.major) },
    { label: "Budget", value: `${formatRupiahShort(profile.budget.max)}${profile.budget.flexible ? " (fleksibel)" : ""}` },
    { label: "Aktivitas", value: profile.primaryActivity ? labelOf(options.activities, profile.primaryActivity) : "–" },
    { label: "Aplikasi", value: software.length ? software.join(", ") : "–" },
  ]
}

/** Kartu profil keluar dari "printer" di atas: dibuka dari atas ke bawah, baris berurutan. */
function ProfileReceipt({ rows }: { rows: { label: string; value: string }[] }) {
  const reduce = useReducedMotion()
  return (
    <div className="overflow-hidden rounded-[16px] bg-cobalt-800 p-1.5">
      <motion.dl
        className="flex flex-col gap-2 rounded-[12px] bg-bg p-4 text-text"
        initial={reduce ? false : { y: "-100%" }}
        animate={{ y: "0%" }}
        transition={{ duration: DURATION.slow, ease: EASE_OUT }}
      >
        {rows.map((r, i) => (
          <motion.div
            key={r.label}
            className="flex items-baseline justify-between gap-4"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.25 + i * 0.08, duration: DURATION.medium }}
          >
            <dt className="type-small font-normal text-text-muted">{r.label}</dt>
            <dd className="truncate text-right type-small text-text">{r.value}</dd>
          </motion.div>
        ))}
      </motion.dl>
    </div>
  )
}

// ---------------------------------------------------------------- Satu kali proses (remount untuk Coba lagi)

function AnalysisRun({ mock, hold, onRetry }: { mock: MockMode | null; hold: Hold; onRetry: () => void }) {
  const router = useRouter()
  const setResult = useResultsStore((s) => s.setResult)
  // Profil dibekukan saat proses dimulai.
  const [profile] = React.useState(() => useProfileStore.getState().profile)
  const [load] = React.useState(() => () => getRecommendations(profile, { mock }))
  const state = useApi(load)
  const [elapsed, setElapsed] = React.useState(0)
  const steps = React.useMemo(() => stepsFor(profile), [profile])
  const receipt = React.useMemo(() => receiptFor(profile), [profile])
  const headingRef = React.useRef<HTMLHeadingElement>(null)

  React.useEffect(() => {
    headingRef.current?.focus()
    const timers = STEP_DONE_AT.map((ms, i) => window.setTimeout(() => setElapsed(i + 1), ms))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [])

  // Tahap terakhir baru selesai setelah data datang.
  // `?hold=1` (halaman /dev/mockups): berhenti di tahap 3 tanpa pindah ke Hasil, untuk tangkapan layar.
  // `?hold=best`: semua tahap selesai dan Best Match tampil, tanpa pindah ke Hasil.
  const completed = Math.min(
    state.status === "success" ? elapsed : Math.min(elapsed, steps.length - 1),
    hold === "steps" ? 3 : steps.length
  )
  const finished = state.status === "success" && completed === steps.length

  React.useEffect(() => {
    if (hold || !finished || state.status !== "success") return
    setResult(profile, state.data)
    const t = window.setTimeout(() => {
      router.replace(mock === "empty" ? `${RESULT_HREF}?mock=empty` : RESULT_HREF)
    }, HIGHLIGHT_MS)
    return () => window.clearTimeout(t)
  }, [finished, state, profile, setResult, router, mock, hold])

  if (state.status === "error") {
    return (
      <main className="page-container flex flex-1 flex-col items-center pt-12 pb-20 md:pt-20">
        <StateMessage
          icon={WarningCircleIcon}
          tone="danger"
          title="Gagal membuat rekomendasi"
          body="Terjadi kesalahan saat membuat rekomendasi. Jawabanmu tetap tersimpan."
        >
          <Button onClick={onRetry}>
            <ArrowCounterClockwiseIcon weight="bold" aria-hidden="true" /> Coba lagi
          </Button>
          <Button asChild variant="secondary">
            <Link href={stepHref("budget")}>Ubah jawaban</Link>
          </Button>
        </StateMessage>
      </main>
    )
  }

  const results = state.status === "success" ? state.data.items.map((i) => i.result) : null
  const limit = profile.budget.max * (profile.budget.flexible ? 1.1 : 1)
  const counts = catalogCounts(limit, results)
  const current = steps[Math.min(completed, steps.length - 1)]
  const countText =
    completed >= 3 && counts.matched !== null
      ? `${counts.total} laptop di katalog → ${counts.inBudget} dalam budget → ${counts.matched} cocok${
          counts.overBudget ? `, ${counts.overBudget} di antaranya sedikit di atas budget` : ""
        }`
      : completed >= 2
        ? `${counts.total} laptop di katalog → ${counts.inBudget} dalam budget`
        : `${counts.total} laptop di katalog`

  return (
    <main data-tone="emerald" className="flex flex-1 overflow-x-clip bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white min-h-screen">
      {/* Mobile: judul → katalog (animasinya langsung terlihat) → profil & tahap. lg: kiri 4 kolom, katalog 8. */}
      <section
        aria-labelledby="analysis-title"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid content-start gap-8 py-8 md:py-12 lg:grid-cols-12 lg:gap-x-12 w-full"
      >
        <div className="flex flex-col gap-6 lg:col-span-4 lg:row-start-1">
          <header className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 border border-emerald-600 text-[10px] font-mono font-bold text-emerald-200">
                SPK SAW Algorithm Engine
              </span>
            </div>
            <h1
              id="analysis-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-3xl sm:text-4xl leading-[1.08] font-black text-white outline-none md:text-5xl"
            >
              {finished ? "Rekomendasi Siap Dilihat" : "Menghitung Matriks SAW..."}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              {finished
                ? "Menampilkan laptop terbaik berdasarkan perangkingan preferensi tertinggi."
                : "Sistem melakukan normalisasi matriks keputusan (benefit & cost) dan pembobotan kriteria."}
            </p>
          </header>

          <div
            role="progressbar"
            aria-label="Kemajuan analisis"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={completed}
            aria-valuetext={finished ? "Selesai" : `Tahap ${completed + 1} dari ${steps.length}: ${current.label}`}
            className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-950/80 border border-emerald-800/60"
          >
            <div
              className="h-full origin-left rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-transform duration-500 ease-out"
              style={{ transform: `scaleX(${completed / steps.length})` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-8 lg:col-start-5 lg:row-span-3 lg:row-start-1">
          <p className="text-sm font-extrabold text-emerald-200 tabular-nums" aria-live="polite">
            {countText}
          </p>
          <AnalysisCatalog stage={completed} limit={limit} results={results} />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4 lg:row-start-2">
          <ProfileReceipt rows={receipt} />

          <AnalyzingSteps steps={steps} completed={completed} tone="cobalt" />

          <p className="sr-only" aria-live="polite">
            {finished ? "Analisis selesai. Membuka hasil." : current.label}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="secondary" className="rounded-xl border-emerald-700/60 bg-emerald-900/60 text-white hover:bg-emerald-800 text-xs font-bold">
              <Link href={PROFILE_HREF}>Kembali ke Profil</Link>
            </Button>
            <p className="text-[11px] font-medium text-emerald-300/80">
              Kalkulasi matematis deterministik tanpa bias sponsor.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
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
    <div className="flex min-h-screen flex-1 flex-col bg-[#faf8ff]">
      <FlowHeader tone={hydrated && !missing ? "emerald" : "default"} />
      {hydrated && !missing ? (
        <AnalysisRun key={attempt} mock={mock} hold={parseHold(params.get("hold"))} onRetry={() => setAttempt((a) => a + 1)} />
      ) : (
        <main className="page-container flex flex-1 flex-col items-center pt-12 pb-20 md:pt-20">
          {!hydrated && (
            <div className="flex w-full max-w-xl flex-col gap-6" aria-hidden="true">
              <Skeleton className="h-10 w-3/4 rounded-control bg-surface" />
              <Skeleton className="h-48 rounded-card bg-surface" />
            </div>
          )}
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
        </main>
      )}
    </div>
  )
}
