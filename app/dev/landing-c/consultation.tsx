"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { RequirementCard } from "@/components/profile/requirement-card";
import { LaptopCard } from "@/components/results/laptop-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectCard } from "@/components/wizard/select-card";
import { Stepper } from "@/components/wizard/stepper";
import { getBudgetInsight, getRecommendations, getRequirements, getSampleProfile, getWizardOptions } from "@/lib/api";
import { formatRupiahShort } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { BudgetPresetId, RequirementProfile } from "@/types";

const options = getWizardOptions();
const informatika = getSampleProfile("teknik");
const majorLabel = options.majors.find((m) => m.id === informatika.major)?.label ?? "Informatika";

const wizardSteps = [
  { id: "budget", label: "Budget" },
  { id: "jurusan", label: "Jurusan" },
  { id: "aktivitas", label: "Aktivitas" },
  { id: "software", label: "Software" },
  { id: "prioritas", label: "Prioritas" },
];

// Semua preset diambil sekali (lewat lib/api.ts) lalu di-cache, supaya ganti preset terasa instan.
async function loadPreviews() {
  const [entries, recommendations] = await Promise.all([
    Promise.all(
      options.budgetPresets.map(async (p) => {
        const profile = { ...informatika, budget: { ...informatika.budget, max: p.value } };
        return [p.id, await getRequirements(profile)] as const;
      })
    ),
    getRecommendations(informatika),
  ]);
  return {
    byPreset: Object.fromEntries(entries) as Record<BudgetPresetId, RequirementProfile>,
    best: recommendations.items[0],
  };
}

function PreviewSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-bg p-5" aria-hidden="true">
      <Skeleton className="h-4 w-32 bg-surface" />
      <div className="flex gap-1.5">
        <Skeleton className="h-7 w-24 rounded-full bg-surface" />
        <Skeleton className="h-7 w-24 rounded-full bg-surface" />
      </div>
      <Skeleton className="h-4 w-3/4 bg-surface" />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex gap-3 py-2">
          <Skeleton className="size-5 bg-surface" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/3 bg-surface" />
            <Skeleton className="h-3 w-full bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

const upcoming = [
  {
    question: "Kamu kuliah atau bekerja di bidang apa?",
    examples: options.majors.slice(0, 5).map((m) => m.label),
    note: "Jurusan menyorot aktivitas dan aplikasi yang relevan.",
  },
  {
    question: "Laptop ini akan dipakai untuk apa?",
    examples: options.activities.slice(0, 5).map((a) => a.label),
    note: "Pilih beberapa, lalu tandai satu yang utama.",
  },
  {
    question: "Aplikasi apa yang sering kamu pakai?",
    examples: options.software.slice(0, 5).map((s) => s.label),
    note: "Setiap aplikasi diberi tag beban: ringan, sedang, atau berat. Boleh dilewati.",
  },
  {
    question: "Apa yang paling penting buatmu?",
    examples: options.priorities.slice(0, 5).map((p) => p.label),
    note: "Urutkan tiga prioritas teratas. Boleh dilewati.",
  },
];

export function Consultation() {
  const state = useApi(loadPreviews);
  const [presetId, setPresetId] = React.useState<BudgetPresetId>("8-10");
  const preset = options.budgetPresets.find((p) => p.id === presetId)!;
  const requirement = state.status === "success" ? state.data.byPreset[presetId] : null;
  const nextHref = `/rekomendasi/jurusan?budget=${preset.value}`;

  const cta = (
    <div className="flex flex-col gap-3">
      <Button asChild size="lg" className="self-start">
        <Link href={nextHref}>
          Lanjut ke pertanyaan berikutnya <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
      <p className="type-small font-normal text-text-muted">
        Budget {preset.label} tersimpan. Masih ada 4 pertanyaan, kurang dari dua menit.
      </p>
    </div>
  );

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="page-container grid gap-10 pt-8 pb-16 md:pt-14 md:pb-24 lg:grid-cols-12 lg:gap-6 lg:pt-16">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-6 lg:pr-8">
          <Stepper steps={wizardSteps} current={0} variant="bar" className="max-w-sm" />
          <div className="flex flex-col gap-4">
            <h1 className="type-display text-text">Berapa budget-mu?</h1>
            <p className="max-w-[36rem] type-body-l text-text-muted">
              Mulai dari sini. Pilih kisaran harga, dan lihat langsung spek yang dibutuhkan mahasiswa {majorLabel} di
              budget itu, sebelum melihat satu pun laptop.
            </p>
          </div>

          <div role="group" aria-label="Pilih kisaran budget" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {options.budgetPresets.map((p) => {
              const insight = getBudgetInsight(p.value, true);
              return (
                <SelectCard
                  key={p.id}
                  mode="single"
                  title={p.label}
                  description={`${insight.laptopCount} laptop di katalog`}
                  selected={presetId === p.id}
                  onClick={() => setPresetId(p.id)}
                />
              );
            })}
          </div>

          <div className="hidden lg:block">{cta}</div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-6">
          <div aria-live="polite" aria-busy={state.status === "loading"}>
            {state.status === "loading" && (
              <>
                <span className="sr-only">Memuat Profil Kebutuhan…</span>
                <PreviewSkeleton />
              </>
            )}
            {state.status === "error" && (
              <p className="rounded-card bg-danger/8 p-5 type-small text-danger">{state.error.message}</p>
            )}
            {requirement && (
              <RequirementCard
                key={presetId}
                requirement={requirement}
                heading="Pratinjau Profil Kebutuhan"
                profileChips={[`Budget ${preset.label}`, majorLabel, "Programming + UI/UX"]}
                className="animate-in fade-in duration-200"
              />
            )}
          </div>
          <p className="type-micro text-text-muted">
            Contoh untuk {majorLabel}. Jurusanmu sendiri ditanyakan di langkah berikutnya.
          </p>
        </div>

        {/* Mobile: tombol menempel di bawah selama hero terlihat (PRD §14, §24) */}
        <div className="sticky bottom-0 z-30 -mx-4 border-t border-border bg-bg px-4 py-3 md:-mx-6 md:px-6 lg:hidden">
          <Button asChild size="lg" className="w-full">
            <Link href={nextHref}>
              Lanjut dengan budget {preset.label} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Cara kerja */}
      <section id="cara-kerja" aria-labelledby="cara-kerja-title" className="scroll-mt-16 bg-surface py-16 md:py-24">
        <div className="page-container grid gap-12 lg:grid-cols-12 lg:gap-6">
          <header className="flex flex-col gap-3 lg:col-span-4">
            <h2 id="cara-kerja-title" className="type-h1 text-text">
              Tinggal empat pertanyaan
            </h2>
            <p className="type-body-l text-text-muted">
              Begini sisa konsultasinya. Tidak ada formulir panjang; setiap jawaban langsung membentuk profilmu.
            </p>
          </header>

          <ol className="flex flex-col lg:col-span-7 lg:col-start-6">
            <li className="flex gap-4 pb-8">
              <span aria-hidden="true" className="flex flex-col items-center">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-4" strokeWidth={2.5} />
                </span>
                <span className="mt-2 w-0.5 flex-1 bg-primary" />
              </span>
              <div className="flex flex-col gap-1 pb-2">
                <p className="type-small text-text-muted">
                  <span className="sr-only">Sudah dijawab: </span>Berapa budget-mu?
                </p>
                <p className="type-h3 text-text">{preset.label}</p>
              </div>
            </li>
            {upcoming.map((step) => (
              <li key={step.question} className="flex gap-4 pb-8">
                <span aria-hidden="true" className="flex flex-col items-center">
                  <span className="size-8 rounded-full border-2 border-border-strong bg-bg" />
                  <span className="mt-2 w-0.5 flex-1 bg-border" />
                </span>
                <div className="flex min-w-0 flex-col gap-3 pb-2">
                  <h3 className="type-h3 text-text">{step.question}</h3>
                  <ul className="flex flex-wrap gap-1.5" aria-label="Contoh pilihan">
                    {step.examples.map((e) => (
                      <li key={e} className="inline-flex h-8 items-center rounded-full bg-bg px-3 type-small text-text">
                        {e}
                      </li>
                    ))}
                  </ul>
                  <p className="type-small font-normal text-text-muted">{step.note}</p>
                </div>
              </li>
            ))}
            <li className="flex gap-4">
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-primary bg-bg">
                <span className="size-2.5 rounded-full bg-primary" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="type-h3 text-text">Lalu kamu melihat hasilnya</h3>
                  <p className="type-body text-text-muted">
                    Profil Kebutuhan seperti di atas, kemudian laptop yang paling cocok dengan skor dan alasannya.
                  </p>
                </div>
                {state.status === "success" ? (
                  <div inert data-ui className="max-w-md">
                    <LaptopCard
                      variant="compact"
                      laptop={state.data.best.laptop}
                      result={state.data.best.result}
                      animateScore={false}
                    />
                  </div>
                ) : (
                  <Skeleton className="h-[106px] max-w-md rounded-card bg-bg" />
                )}
                <p className="type-micro text-text-muted">
                  Contoh hasil untuk {majorLabel}, budget {formatRupiahShort(informatika.budget.max)}.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
