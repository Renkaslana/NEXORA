"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams, useSelectedLayoutSegment } from "next/navigation"
import { cn } from "cn"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle"
import { motion, useReducedMotion } from "motion/react"
import { FlowHeader } from "@/components/layout/flow-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileForming, ProfileFormingMobile, useFormingRequirement } from "@/components/wizard/profile-forming"
import { StepFeedback } from "@/components/wizard/step-feedback"
import { Stepper } from "@/components/wizard/stepper"
import { isWizardStep, stepHref, validateStep, wizardSteps } from "@/components/wizard/steps"
import { getWizardOptions } from "@/lib/api"
import { DURATION, EASE_OUT } from "@/lib/motion"
import { rehydrateProfile, useProfileHydrated, useProfileStore } from "@/store/profile"

// Kerangka Wizard (PRD §15, §24; REDESIGN §17; R4 band kobalt): stepper di atas, pertanyaan 8 kolom + panel
// "Profil kamu terbentuk" 4 kolom, tombol Kembali/Lanjut di bawah. Mobile: strip meter mini yang bisa
// dibuka, tombol menempel. Transisi langkah mengikuti arah maju/mundur (gerak 6).
// Dipasang di layout route group sehingga tetap terpasang saat berpindah langkah.

const PROFILE_HREF = "/rekomendasi/profil"
const options = getWizardOptions()

/** Isi store dari `?budget=` (CTA landing) dan `?jurusan=` (baris persona). */
function UrlPrefill() {
  const params = useSearchParams()
  const hydrated = useProfileHydrated()
  const applyPrefill = useProfileStore((s) => s.applyPrefill)

  React.useEffect(() => {
    if (!hydrated) return
    const budget = Number(params.get("budget"))
    const major = params.get("jurusan")
    const { min, max } = options.budgetRange
    applyPrefill({
      budget: budget >= min && budget <= max ? budget : undefined,
      major: major && options.majors.some((m) => m.id === major) ? major : undefined,
    })
  }, [hydrated, params, applyPrefill])

  return null
}

function StepSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-card bg-surface" />
        ))}
      </div>
    </div>
  )
}

export function WizardShell({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()
  const router = useRouter()
  const hydrated = useProfileHydrated()
  const reduceMotion = useReducedMotion()
  const profile = useProfileStore((s) => s.profile)
  const markAnswered = useProfileStore((s) => s.markAnswered)
  const answered = useProfileStore((s) => s.answered)
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const [attempted, setAttempted] = React.useState<string | null>(null)

  React.useEffect(() => {
    rehydrateProfile()
  }, [])

  const stepId = isWizardStep(segment) ? segment : "budget"
  const index = wizardSteps.findIndex((s) => s.id === stepId)
  const forming = useFormingRequirement()

  // Arah transisi: maju masuk dari kanan, mundur dari kiri (gerak 6).
  // Pola "nilai sebelumnya" dari dokumentasi React: state diperbarui saat render bila langkah berganti.
  const [move, setMove] = React.useState({ index, direction: 1 })
  if (move.index !== index) setMove({ index, direction: index > move.index ? 1 : -1 })
  const direction = move.index !== index ? (index > move.index ? 1 : -1) : move.direction
  const step = wizardSteps[index]
  const prev = wizardSteps[index - 1]
  const next = wizardSteps[index + 1]
  const nextHref = next ? stepHref(next.id) : PROFILE_HREF

  // Judul tab per langkah (metadata statis halaman tidak tahu langkahnya).
  React.useEffect(() => {
    const title = `${step.label} · Rekomendasi · SPECO`
    document.title = title
    const t = window.setTimeout(() => (document.title = title), 50)
    return () => window.clearTimeout(t)
  }, [step.label])

  // Fokus ke pertanyaan saat langkah berganti (PRD §28: urutan fokus logis).
  React.useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [stepId])

  const error = hydrated ? validateStep(stepId, profile) : null
  const showError = attempted === stepId && error

  const goNext = () => {
    if (error) {
      setAttempted(stepId)
      return
    }
    markAnswered(stepId)
    router.push(nextHref)
  }
  const skip = () => {
    markAnswered(stepId)
    router.push(nextHref)
  }

  const nav = (
    <div className="flex items-center gap-2">
      {prev ? (
        <Button asChild variant="secondary">
          <Link href={stepHref(prev.id)}>
            <ArrowLeftIcon weight="bold" aria-hidden="true" /> <span className="max-[400px]:sr-only">Kembali</span>
          </Link>
        </Button>
      ) : (
        <Button asChild variant="secondary">
          <Link href="/">
            <ArrowLeftIcon weight="bold" aria-hidden="true" /> <span className="max-[400px]:sr-only">Beranda</span>
          </Link>
        </Button>
      )}
      <div className="ml-auto flex items-center gap-2">
        {step.skippable && (
          <Button variant="ghost" onClick={skip}>
            Lewati
          </Button>
        )}
        <Button
          onClick={goNext}
          aria-disabled={Boolean(error) || !hydrated}
          aria-describedby={error ? "step-error" : undefined}
          className={cn((error || !hydrated) && "cursor-not-allowed opacity-50 hover:bg-primary")}
        >
          {next ? (
            "Lanjut"
          ) : (
            <>
              <span className="sm:hidden">Lihat Profil</span>
              <span className="hidden sm:inline">Lihat Profil Kebutuhan</span>
            </>
          )}
          <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
        </Button>
      </div>
    </div>
  )

  const enter = {
    initial: reduceMotion ? false : { opacity: 0, x: 24 * direction },
    animate: { opacity: 1, x: 0 },
    transition: { duration: DURATION.medium, ease: EASE_OUT },
  } as const

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <React.Suspense fallback={null}>
        <UrlPrefill />
      </React.Suspense>

      {/* Band kobalt (R4): header, stepper, dan pertanyaan. Pilihan dan panel Profil di kertas putih. */}
      <div data-tone="cobalt" className="bg-cobalt-600 text-white">
        <FlowHeader tone="cobalt" />
        <div className="page-container flex flex-col gap-8 pt-4 pb-8 md:pt-6 md:pb-10">
          <Stepper
            steps={wizardSteps}
            current={index}
            done={hydrated ? wizardSteps.flatMap((s, i) => (answered.includes(s.id) ? [i] : [])) : []}
            onStepClick={(i) => router.push(stepHref(wizardSteps[i].id))}
            tone="cobalt"
            className="lg:max-w-[calc(66.666%-0.5rem)]"
          />

          <motion.header key={stepId} {...enter} className="flex max-w-3xl flex-col gap-3">
            <p className="text-cobalt-100 tabular-nums" aria-hidden="true">
              <span className="text-5xl leading-none font-extrabold tracking-[-0.04em] text-white">
                {String(index + 1).padStart(2, "0")}
              </span>{" "}
              <span className="type-body">/ {String(wizardSteps.length).padStart(2, "0")}</span>
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              id="step-question"
              className="text-3xl leading-[1.1] font-extrabold tracking-[-0.035em] text-white outline-none md:text-[2.75rem]"
            >
              {step.question}
            </h1>
            <p className="max-w-[40rem] type-body-l text-cobalt-100">{step.helper}</p>
            {error && (
              <p
                id="step-error"
                role={showError ? "alert" : undefined}
                className={cn(
                  "flex items-center gap-2 type-small",
                  showError ? "self-start rounded-full bg-signal px-3 py-1 text-signal-ink" : "font-normal text-cobalt-100"
                )}
              >
                <WarningCircleIcon weight="bold" className="size-4 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}
          </motion.header>
        </div>
      </div>

      <div className="page-container flex flex-1 flex-col gap-6 pt-6 pb-28 md:pt-8 lg:pb-16">
        <div className="lg:hidden">
          <ProfileFormingMobile current={stepId} forming={forming} />
        </div>

        <div className="grid flex-1 gap-8 lg:grid-cols-12 lg:gap-6">
          <main className="flex min-w-0 flex-col gap-8 lg:col-span-8">
            <motion.div key={stepId} {...enter} className="flex flex-col gap-8">
              {/* Isi langkah selalu dirender (validasi instant navigation Next 16), tapi
                  disembunyikan sampai isian sessionStorage terbaca agar tidak berkedip. */}
              {!hydrated && <StepSkeleton />}
              <div hidden={!hydrated} className="flex flex-col gap-6">
                {children}
                <StepFeedback step={stepId} />
              </div>
            </motion.div>

            <div className="hidden lg:block">{nav}</div>
          </main>

          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-6">
              <ProfileForming current={stepId} forming={forming} />
            </div>
          </aside>
        </div>

        <p className="type-micro text-text-muted">Data contoh (demo): pilihan dan angka belum terhubung ke server.</p>
      </div>

      {/* Mobile & tablet: tombol menempel di bawah (PRD §14, §24) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg py-3 lg:hidden">
        <div className="page-container">{nav}</div>
      </div>
    </div>
  )
}
