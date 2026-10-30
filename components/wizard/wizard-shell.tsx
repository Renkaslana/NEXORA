"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, useSelectedLayoutSegment } from "next/navigation";
import { cn } from "cn";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { motion, useReducedMotion } from "motion/react";
import { FlowHeader } from "@/components/layout/flow-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileForming, ProfileFormingMobile, useFormingRequirement } from "@/components/wizard/profile-forming";
import { StepFeedback } from "@/components/wizard/step-feedback";
import { Stepper } from "@/components/wizard/stepper";
import { isWizardStep, stepHref, validateStep, wizardSteps } from "@/components/wizard/steps";
import { getWizardOptions } from "@/lib/api";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { rehydrateProfile, useProfileHydrated, useProfileStore } from "@/store/profile";

const PROFILE_HREF = "/rekomendasi/profil";
const options = getWizardOptions();

/** Isi store dari `?budget=` (CTA landing) dan `?jurusan=` (baris persona). */
function UrlPrefill() {
  const params = useSearchParams();
  const hydrated = useProfileHydrated();
  const applyPrefill = useProfileStore((s) => s.applyPrefill);

  React.useEffect(() => {
    if (!hydrated) return;
    const budget = Number(params.get("budget"));
    const major = params.get("jurusan");
    const { min, max } = options.budgetRange;
    applyPrefill({
      budget: budget >= min && budget <= max ? budget : undefined,
      major: major && options.majors.some((m) => m.id === major) ? major : undefined,
    });
  }, [hydrated, params, applyPrefill]);

  return null;
}

function StepSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl bg-slate-200/60" />
        ))}
      </div>
    </div>
  );
}

export function WizardShell({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const router = useRouter();
  const hydrated = useProfileHydrated();
  const reduceMotion = useReducedMotion();
  const profile = useProfileStore((s) => s.profile);
  const markAnswered = useProfileStore((s) => s.markAnswered);
  const answered = useProfileStore((s) => s.answered);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const [attempted, setAttempted] = React.useState<string | null>(null);

  React.useEffect(() => {
    rehydrateProfile();
  }, []);

  const stepId = isWizardStep(segment) ? segment : "budget";
  const index = wizardSteps.findIndex((s) => s.id === stepId);
  const forming = useFormingRequirement();

  const [move, setMove] = React.useState({ index, direction: 1 });
  if (move.index !== index) setMove({ index, direction: index > move.index ? 1 : -1 });
  const direction = move.index !== index ? (index > move.index ? 1 : -1) : move.direction;
  const step = wizardSteps[index];
  const prev = wizardSteps[index - 1];
  const next = wizardSteps[index + 1];
  const nextHref = next ? stepHref(next.id) : PROFILE_HREF;

  React.useEffect(() => {
    const title = `${step.label} · Rekomendasi · SPECO`;
    document.title = title;
    const t = window.setTimeout(() => (document.title = title), 50);
    return () => window.clearTimeout(t);
  }, [step.label]);

  React.useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [stepId]);

  const error = hydrated ? validateStep(stepId, profile) : null;
  const showError = attempted === stepId && error;

  const goNext = () => {
    if (error) {
      setAttempted(stepId);
      return;
    }
    markAnswered(stepId);
    router.push(nextHref);
  };
  const skip = () => {
    markAnswered(stepId);
    router.push(nextHref);
  };

  const nav = (
    <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
      {prev ? (
        <Button
          asChild
          variant="secondary"
          className="rounded-xl border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2.5 h-11"
        >
          <Link href={stepHref(prev.id)}>
            <ArrowLeftIcon weight="bold" className="w-4 h-4 mr-1.5" aria-hidden="true" />
            <span>Kembali</span>
          </Link>
        </Button>
      ) : (
        <Button
          asChild
          variant="secondary"
          className="rounded-xl border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2.5 h-11"
        >
          <Link href="/">
            <ArrowLeftIcon weight="bold" className="w-4 h-4 mr-1.5" aria-hidden="true" />
            <span>Beranda</span>
          </Link>
        </Button>
      )}

      <div className="ml-auto flex items-center gap-2.5">
        {step.skippable && (
          <Button
            variant="ghost"
            onClick={skip}
            className="rounded-xl text-slate-500 hover:text-slate-900 font-semibold text-xs px-3.5 h-11"
          >
            Lewati Langkah Ini
          </Button>
        )}
        <button
          type="button"
          onClick={goNext}
          aria-disabled={Boolean(error) || !hydrated}
          aria-describedby={error ? "step-error" : undefined}
          className={cn(
            "h-11 px-6 rounded-xl font-black text-xs shadow-md flex items-center gap-2 transition-all",
            error || !hydrated
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {next ? (
            <span>Lanjut Langkah Berikutnya</span>
          ) : (
            <span>Lihat Profil Kebutuhan & Rekomendasi</span>
          )}
          <ArrowRightIcon weight="bold" className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  const enter = {
    initial: reduceMotion ? false : { opacity: 0, x: 20 * direction },
    animate: { opacity: 1, x: 0 },
    transition: { duration: DURATION.medium, ease: EASE_OUT },
  } as const;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#faf8ff] text-[#131b2e] antialiased">
      <React.Suspense fallback={null}>
        <UrlPrefill />
      </React.Suspense>

      {/* Modern Emerald Atmospheric Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <FlowHeader tone="emerald" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 pt-6 pb-10 md:pt-8 md:pb-12 relative z-10">
          <Stepper
            steps={wizardSteps}
            current={index}
            done={hydrated ? wizardSteps.flatMap((s, i) => (answered.includes(s.id) ? [i] : [])) : []}
            onStepClick={(i) => router.push(stepHref(wizardSteps[i].id))}
            tone="emerald"
            className="lg:max-w-3xl"
          />

          <motion.header key={stepId} {...enter} className="flex max-w-3xl flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-[11px] font-mono font-black text-emerald-200">
                Langkah {String(index + 1).padStart(2, "0")} / {String(wizardSteps.length).padStart(2, "0")}
              </span>
              <span className="text-xs text-emerald-300/80 font-medium">Kuis Diagnostik SPECO AI</span>
            </div>

            <h1
              ref={headingRef}
              tabIndex={-1}
              id="step-question"
              className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight outline-none"
            >
              {step.question}
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
              {step.helper}
            </p>

            {error && (
              <p
                id="step-error"
                role={showError ? "alert" : undefined}
                className={cn(
                  "flex items-center gap-2 text-xs font-semibold mt-1",
                  showError
                    ? "self-start rounded-full bg-amber-400 px-3 py-1 text-slate-950 font-bold"
                    : "text-emerald-300 font-normal"
                )}
              >
                <WarningCircleIcon weight="bold" className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}
          </motion.header>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-1 flex-col gap-6 pt-8 pb-28 md:pt-10 lg:pb-16">
        <div className="lg:hidden">
          <ProfileFormingMobile current={stepId} forming={forming} />
        </div>

        <div className="grid flex-1 gap-8 lg:grid-cols-12 lg:gap-8 items-start">
          {/* Main Question Card */}
          <main className="flex min-w-0 flex-col gap-8 lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <motion.div key={stepId} {...enter} className="flex flex-col gap-6">
              {!hydrated && <StepSkeleton />}
              <div hidden={!hydrated} className="flex flex-col gap-6">
                {children}
                <StepFeedback step={stepId} />
              </div>
            </motion.div>

            <div className="hidden lg:block">{nav}</div>
          </main>

          {/* Right Forming Profile Card */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-6">
              <ProfileForming current={stepId} forming={forming} />
            </div>
          </aside>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
          <ShieldCheckIcon weight="fill" className="text-emerald-700 w-4 h-4" />
          <span>
            Dihitung berdasarkan dataset 450 laptop mahasiswa & algoritma Simple Additive Weighting (SAW).
          </span>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md py-3 lg:hidden shadow-lg">
        <div className="px-4">{nav}</div>
      </div>
    </div>
  );
}
