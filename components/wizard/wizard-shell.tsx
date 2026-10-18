"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams, useSelectedLayoutSegment } from "next/navigation"
import { cn } from "cn"
import { ArrowLeft, ArrowRight, CircleAlert } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Wordmark } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileSummary, ProfileSummaryMobile } from "@/components/wizard/profile-summary"
import { Stepper } from "@/components/wizard/stepper"
import { isWizardStep, stepHref, validateStep, wizardSteps } from "@/components/wizard/steps"
import { getWizardOptions } from "@/lib/api"
import { rehydrateProfile, useProfileHydrated, useProfileStore } from "@/store/profile"

// Kerangka Wizard (PRD §15, §24): stepper di atas, pertanyaan 8 kolom + panel ringkasan 4 kolom,
// tombol Kembali/Lanjut di bawah. Mobile: progress bar, ringkasan bisa dibuka, tombol menempel.
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
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const [attempted, setAttempted] = React.useState<string | null>(null)

  React.useEffect(() => {
    rehydrateProfile()
  }, [])

  const stepId = isWizardStep(segment) ? segment : "budget"
  const index = wizardSteps.findIndex((s) => s.id === stepId)
  const step = wizardSteps[index]
  const prev = wizardSteps[index - 1]
  const next = wizardSteps[index + 1]
  const nextHref = next ? stepHref(next.id) : PROFILE_HREF

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
            <ArrowLeft aria-hidden="true" /> Kembali
          </Link>
        </Button>
      ) : (
        <Button asChild variant="secondary">
          <Link href="/">
            <ArrowLeft aria-hidden="true" /> Beranda
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
          {next ? "Lanjut" : "Lihat Profil Kebutuhan"} <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <React.Suspense fallback={null}>
        <UrlPrefill />
      </React.Suspense>

      <header className="border-b border-border bg-bg">
        <div className="page-container flex h-16 items-center justify-between gap-4">
          <Wordmark />
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-control px-3 type-small text-text-muted hover:bg-surface hover:text-text"
          >
            Keluar
          </Link>
        </div>
      </header>

      <div className="page-container flex flex-1 flex-col gap-6 pt-6 pb-28 md:pt-10 lg:pb-16">
        <Stepper
          steps={wizardSteps}
          current={index}
          onStepClick={(i) => router.push(stepHref(wizardSteps[i].id))}
          className="lg:max-w-[calc(66.666%-0.5rem)]"
        />

        <div className="lg:hidden">
          <ProfileSummaryMobile current={stepId} />
        </div>

        <div className="grid flex-1 gap-8 lg:grid-cols-12 lg:gap-6">
          <main className="flex min-w-0 flex-col gap-8 lg:col-span-8">
            <motion.div
              key={stepId}
              initial={reduceMotion ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col gap-8"
            >
              <header className="flex flex-col gap-3">
                <h1 ref={headingRef} tabIndex={-1} id="step-question" className="type-h1 text-text outline-none">
                  {step.question}
                </h1>
                <p className="max-w-[40rem] type-body-l text-text-muted">{step.helper}</p>
                {error && (
                  <p
                    id="step-error"
                    role={showError ? "alert" : undefined}
                    className={cn(
                      "flex items-center gap-2 type-small",
                      showError ? "text-danger" : "font-normal text-text-muted"
                    )}
                  >
                    <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                    {error}
                  </p>
                )}
              </header>

              {hydrated ? children : <StepSkeleton />}
            </motion.div>

            <div className="hidden lg:block">{nav}</div>
          </main>

          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-6">
              <ProfileSummary current={stepId} />
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
