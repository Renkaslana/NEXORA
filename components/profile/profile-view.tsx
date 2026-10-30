"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise";
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/ssr/ClipboardText";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { FlowHeader } from "@/components/layout/flow-header";
import { ProfileChips } from "@/components/profile/profile-chips";
import { LevelBadge } from "@/components/profile/requirement-card";
import { ProfileCharacterCard } from "@/components/profile/profile-character-card";
import { SpecMeterRows } from "@/components/profile/spec-meter-rows";
import { WarningPanel } from "@/components/profile/warning-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { firstMissingStep, stepHref } from "@/components/wizard/steps";
import { getGlossary, getPersonaForMajor, getRequirements, getWizardOptions, parseMockMode, type MockMode } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { emptyProfile, rehydrateProfile, useProfileHydrated, useProfileStore } from "@/store/profile";

const ANALYSIS_HREF = "/rekomendasi/analisis";
const glossary = getGlossary();
const personas = getWizardOptions().personas;

function GridSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <Skeleton className="h-48 rounded-3xl bg-emerald-950/20" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl bg-slate-200/60" />
        ))}
      </div>
    </div>
  );
}

function ProfileContent({
  mock,
  onRetry,
  focusOnLoadRef,
  actions,
}: {
  actions: React.ReactNode;
  mock: MockMode | null;
  onRetry: () => void;
  focusOnLoadRef: React.RefObject<boolean>;
}) {
  const profile = useProfileStore((s) => s.profile);
  const compromises = useProfileStore((s) => s.compromises);
  const setBudget = useProfileStore((s) => s.setBudget);
  const setCompromise = useProfileStore((s) => s.setCompromise);

  const [load] = React.useState(() => {
    const { major, budget } = useProfileStore.getState().profile;
    return () => getRequirements({ ...emptyProfile, major, budget }, { mock });
  });
  const state = useApi(load);
  const summaryRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    if (state.status !== "success" || !focusOnLoadRef.current) return;
    focusOnLoadRef.current = false;
    summaryRef.current?.focus();
  }, [state.status, focusOnLoadRef]);

  const persona = personas.find((p) => p.id === getPersonaForMajor(profile.major));

  if (state.status === "loading") {
    return (
      <>
        <span className="sr-only" role="status">
          Menyusun Profil Kebutuhan…
        </span>
        <GridSkeleton />
      </>
    );
  }

  if (state.status === "error") {
    return (
      <StateMessage
        icon={WarningCircleIcon}
        tone="danger"
        title="Gagal memuat Profil Kebutuhan"
        body="Terjadi kesalahan saat menyusun spek yang kamu butuhkan. Jawabanmu tetap tersimpan."
      >
        <Button onClick={onRetry} className="rounded-xl bg-emerald-700 text-white font-bold">
          <ArrowCounterClockwiseIcon weight="bold" aria-hidden="true" /> Coba lagi
        </Button>
        <Button asChild variant="secondary" className="rounded-xl border-slate-300">
          <Link href={stepHref("budget")}>Ubah jawaban</Link>
        </Button>
      </StateMessage>
    );
  }

  const requirement = state.data;
  return (
    <div className="flex flex-col gap-10">
      <ProfileCharacterCard requirement={requirement} persona={persona} summaryRef={summaryRef} />

      {requirement.warnings.map((w) => (
        <WarningPanel
          key={w.id}
          warning={w}
          accepted={compromises.includes(w.id)}
          onRaiseBudget={(target) => {
            focusOnLoadRef.current = true;
            setBudget(target);
          }}
          onCompromise={(accepted) => setCompromise(w.id, accepted)}
        />
      ))}

      <section aria-labelledby="specs-title" className="flex flex-col gap-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="specs-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Spesifikasi Hardware Minimal yang Disarankan
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Batas toleransi spesifikasi laptop agar tugas kuliah dan skripsimu lancar hingga 4 tahun ke depan.
            </p>
          </div>

          <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500" aria-label="Arti tingkat">
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

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon weight="fill" className="text-emerald-700 w-4 h-4" />
            <span>Disusun berdasarkan standar komputasi mahasiswa & data 450 laptop terverifikasi.</span>
          </div>
        </div>
      </section>

      <div className="hidden lg:block">{actions}</div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md py-3 lg:hidden shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">{actions}</div>
      </div>
    </div>
  );
}

export function ProfileView() {
  const params = useSearchParams();
  const mock = parseMockMode(params.get("mock"));
  const hydrated = useProfileHydrated();
  const profile = useProfileStore((s) => s.profile);
  const [attempt, setAttempt] = React.useState(0);
  const focusOnLoadRef = React.useRef(false);

  React.useEffect(() => {
    rehydrateProfile();
  }, []);

  const missing = hydrated ? firstMissingStep(profile) : undefined;
  const ready = hydrated && !missing;

  const actions = (
    <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
      <Button asChild variant="secondary" className="rounded-xl border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs h-11 px-4">
        <Link href={stepHref("budget")}>
          <ArrowLeftIcon weight="bold" className="w-4 h-4 mr-1.5" aria-hidden="true" />
          <span>Ubah Jawaban Kuis</span>
        </Link>
      </Button>
      <Button asChild className="ml-auto rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs h-11 px-6 shadow-md shadow-emerald-700/20">
        <Link href={ANALYSIS_HREF}>
          <span>Lihat Laptop yang Cocok di Analisis SAW</span>
          <ArrowRightIcon weight="bold" className="w-4 h-4 ml-1.5" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] antialiased flex flex-col">
      <FlowHeader tone="emerald" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-1 flex-col gap-8 pt-8 pb-32 md:pt-10 lg:pb-20">
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
              Diagnosa Selesai
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Profil Rekomendasi Laptop Kamu
          </h1>
          {ready ? (
            <ProfileChips profile={profile} />
          ) : (
            <Skeleton className="h-11 w-full max-w-xl rounded-full bg-slate-200/60" aria-hidden="true" />
          )}
        </header>

        {!hydrated && <GridSkeleton />}

        {missing && (
          <StateMessage
            icon={ClipboardTextIcon}
            title="Jawab dulu beberapa pertanyaan"
            body={`Profil Kebutuhan disusun dari jawabanmu. Langkah "${missing.label}" belum diisi.`}
          >
            <Button asChild className="rounded-xl bg-emerald-700 text-white font-bold">
              <Link href={stepHref(missing.id)}>
                <span>Isi langkah {missing.label}</span>
                <ArrowRightIcon weight="bold" className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </Link>
            </Button>
          </StateMessage>
        )}

        {ready && (
          <ProfileContent
            key={`${profile.major}-${profile.budget.max}-${attempt}`}
            mock={mock}
            focusOnLoadRef={focusOnLoadRef}
            onRetry={() => setAttempt((a) => a + 1)}
            actions={actions}
          />
        )}
      </main>
    </div>
  );
}
