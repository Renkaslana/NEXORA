"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { XCircleIcon } from "@phosphor-icons/react/dist/ssr/XCircle";
import { IconTiles, LaptopRenders, MoodPhotos, NeedMeters } from "./redesign-parts";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileChips } from "@/components/profile/profile-chips";
import { SpecRequirementCard } from "@/components/profile/spec-requirement-card";
import { WarningPanel } from "@/components/profile/warning-panel";
import { AnalyzingSteps } from "@/components/results/analyzing-steps";
import { RequirementCheck, RequirementCheckHeader } from "@/components/results/requirement-check";
import { ScoreBreakdown } from "@/components/results/score-breakdown";
import { LaptopCard } from "@/components/results/laptop-card";
import { ScoreRing } from "@/components/results/score-ring";
import { BudgetSlider } from "@/components/wizard/budget-slider";
import { getOptionIcon } from "@/components/wizard/option-icon";
import { SelectCard } from "@/components/wizard/select-card";
import { Stepper } from "@/components/wizard/stepper";
import {
  getBudgetInsight,
  getGlossary,
  getRequirements,
  getMockIntegrityReport,
  getRecommendations,
  getSampleProfile,
  getWizardOptions,
} from "@/lib/api";
import { formatDecimal } from "@/lib/format";
import { checkSpecs } from "@/lib/spec-check";
import { useApi } from "@/lib/use-api";
import type { ActivityId } from "@/types";

// /dev/components — semua variant komponen inti (PRD §23) untuk review, bukan halaman final.

const options = getWizardOptions();
const wizardSteps = [
  { id: "budget", label: "Budget" },
  { id: "jurusan", label: "Jurusan" },
  { id: "aktivitas", label: "Aktivitas" },
  { id: "software", label: "Software" },
  { id: "prioritas", label: "Prioritas" },
];
const loadRaka = () => getRecommendations(getSampleProfile("teknik"));
const tightProfile = { ...getSampleProfile("teknik"), budget: { min: 0, max: 5_000_000, flexible: false } };
const loadTight = () => getRequirements(tightProfile);
const loadDetailDemo = () =>
  Promise.all([getRecommendations(getSampleProfile("teknik")), getRequirements(getSampleProfile("teknik"))]);

function Section({ id, title, prd, children }: { id: string; title: string; prd: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6 border-t border-border py-12 md:py-16">
      <header className="flex flex-col gap-1">
        <h2 id={id} className="type-h2 text-text">
          {title}
        </h2>
        <p className="type-small font-normal text-text-muted">{prd}</p>
      </header>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="type-micro tracking-wide text-text-muted uppercase">{children}</p>;
}

// ---------------------------------------------------------------- Mock integrity

function MockIntegrity() {
  const report = React.useMemo(() => getMockIntegrityReport(), []);
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex flex-col gap-4 rounded-card border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`flex items-center gap-2 type-body font-semibold ${report.ok ? "text-success" : "text-danger"}`}>
          {report.ok ? <CheckCircleIcon weight="bold" aria-hidden="true" /> : <XCircleIcon weight="bold" aria-hidden="true" />}
          {report.ok
            ? `Semua skor konsisten (${report.rows.length} hasil, 4 skenario)`
            : `${report.issues.length} masalah konsistensi`}
        </p>
        <Button variant="link" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Sembunyikan rincian" : "Lihat rincian"}
        </Button>
      </div>
      <p className="type-small font-normal text-text-muted">
        Aturan: matchScore = round(Σ bobot × skor / 100), Σ bobot = 100. Bukan SAW; hanya memeriksa angka tulisan tangan.
      </p>
      {report.issues.length > 0 && (
        <ul className="flex flex-col gap-1 type-small text-danger">
          {report.issues.map((i, n) => (
            <li key={n}>
              {i.scenarioId} {i.laptopId}: {i.message}
            </li>
          ))}
        </ul>
      )}
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] type-small">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="py-2 font-medium">Skenario</th>
                <th className="py-2 font-medium">Laptop</th>
                <th className="py-2 text-right font-medium">Σ bobot × skor</th>
                <th className="py-2 text-right font-medium">matchScore</th>
                <th className="py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r) => (
                <tr key={`${r.scenarioId}-${r.laptopId}`} className="border-b border-border last:border-0">
                  <td className="py-2">{r.scenarioId}</td>
                  <td className="num py-2">{r.laptopId}</td>
                  <td className="num py-2 text-right">{formatDecimal(r.weightedSum, 2)}</td>
                  <td className="num py-2 text-right">{r.matchScore}</td>
                  <td className={`py-2 text-right ${r.ok ? "text-success" : "text-danger"}`}>{r.ok ? "✓ Cocok" : "✕ Salah"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Buttons

function Buttons() {
  const variants = ["primary", "secondary", "ghost", "link"] as const;
  const sizes = ["sm", "md", "lg"] as const;
  return (
    <div className="flex flex-col gap-8">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col gap-3">
          <Label>{variant}</Label>
          <div className="flex flex-wrap items-center gap-3">
            {sizes.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {variant === "primary" ? "Cari Laptop yang Pas" : "Lihat cara kerjanya"} · {size.toUpperCase()}
              </Button>
            ))}
            <Button variant={variant} disabled>
              Disabled
            </Button>
            <Button variant={variant} loading>
              Memuat…
            </Button>
          </div>
        </div>
      ))}
      <div className="flex flex-col gap-3">
        <Label>Dengan ikon</Label>
        <div className="flex flex-wrap gap-3">
          <Button>
            Lanjut <ArrowRightIcon weight="bold" aria-hidden="true" />
          </Button>
          <Button variant="secondary">
            <ArrowLeftIcon weight="bold" aria-hidden="true" /> Kembali
          </Button>
          <Button size="lg">
            Cari Laptop yang Pas <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
          </Button>
          <Button variant="secondary" aria-pressed="true">
            Secondary terpilih
          </Button>
        </div>
      </div>
      <p className="type-small font-normal text-text-muted">
        Hover: arahkan kursor (panah penutup bergeser 3px). Tekan: scale 0,97. Focus: tekan Tab, ring 2px biru + offset 2px.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- Select cards

function SelectCards() {
  const [major, setMajor] = React.useState("informatika");
  const [acts, setActs] = React.useState<ActivityId[]>(["programming", "uiux"]);
  const [primary, setPrimary] = React.useState<ActivityId>("programming");
  const [sw, setSw] = React.useState<string[]>(["vscode", "docker"]);
  const personaLabel = (id: string) => options.personas.find((p) => p.id === id)?.label;
  const loadTone = { ringan: "success", sedang: "warning", berat: "danger" } as const;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Label>Single · dengan ikon + meta persona (Jurusan)</Label>
        <div role="group" aria-label="Jurusan" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {options.majors.slice(0, 7).map((m) => (
            <SelectCard
              key={m.id}
              mode="single"
              icon={getOptionIcon(m.icon)}
              title={m.label}
              meta={`Persona: ${personaLabel(m.persona)}`}
              selected={major === m.id}
              onClick={() => setMajor(m.id)}
            />
          ))}
          <SelectCard mode="single" icon={getOptionIcon("more")} title="Disabled" meta="Tidak bisa dipilih" disabled />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label>Multi · badge “Utama” (Aktivitas). Klik ganda untuk menjadikan utama.</Label>
        <div role="group" aria-label="Aktivitas" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {options.activities.slice(0, 8).map((a) => (
            <SelectCard
              key={a.id}
              mode="multi"
              icon={getOptionIcon(a.icon)}
              title={a.label}
              selected={acts.includes(a.id)}
              primary={primary === a.id && acts.includes(a.id)}
              onClick={() => setActs((list) => (list.includes(a.id) ? list.filter((x) => x !== a.id) : [...list, a.id]))}
              onDoubleClick={() => acts.includes(a.id) && setPrimary(a.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label>Multi · kecil, tanpa ikon, tag beban (Software)</Label>
        <div role="group" aria-label="Software" className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
          {options.software.map((s) => (
            <SelectCard
              key={s.id}
              mode="multi"
              size="sm"
              title={s.label}
              selected={sw.includes(s.id)}
              trailing={
                <Chip tone={loadTone[s.load]}>
                  <span className="sr-only">Beban: </span>
                  {s.load[0].toUpperCase() + s.load.slice(1)}
                </Chip>
              }
              onClick={() => setSw((list) => (list.includes(s.id) ? list.filter((x) => x !== s.id) : [...list, s.id]))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Stepper

function Steppers() {
  const [current, setCurrent] = React.useState(2);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Label>Desktop dots · langkah selesai bisa diklik</Label>
        <Stepper steps={wizardSteps} current={current} onStepClick={setCurrent} variant="dots" />
      </div>
      <div className="flex max-w-md flex-col gap-3">
        <Label>Mobile progress bar</Label>
        <Stepper steps={wizardSteps} current={current} variant="bar" />
      </div>
      <div className="flex flex-col gap-3">
        <Label>Auto (bar di bawah 768px, dots di atasnya)</Label>
        <Stepper steps={wizardSteps} current={current} onStepClick={setCurrent} />
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
          Mundur
        </Button>
        <Button size="sm" onClick={() => setCurrent((c) => Math.min(wizardSteps.length - 1, c + 1))}>
          Maju
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Budget slider

function BudgetSliders() {
  const [plain, setPlain] = React.useState(8_000_000);
  const [value, setValue] = React.useState(8_000_000);
  const [flexible, setFlexible] = React.useState(true);
  const insight = getBudgetInsight(value, flexible);
  return (
    <div className="grid gap-10 lg:grid-cols-2 [&>*]:min-w-0">
      <div className="flex flex-col gap-3">
        <Label>Default</Label>
        <BudgetSlider value={plain} onValueChange={setPlain} range={options.budgetRange} showInput={false} />
      </div>
      <div className="flex flex-col gap-3">
        <Label>Dengan input, preset chip, toggle fleksibel, dan feedback</Label>
        <BudgetSlider
          value={value}
          onValueChange={setValue}
          range={options.budgetRange}
          presets={options.budgetPresets}
          flexible={flexible}
          onFlexibleChange={setFlexible}
          feedback={{ typicalSpec: insight.typicalSpec, laptopCount: insight.laptopCount }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Score ring

function ScoreRings() {
  const [replay, setReplay] = React.useState(0);
  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto">
        <table className="type-small">
          <thead>
            <tr className="text-left text-text-muted">
              <th className="pr-8 pb-3 font-medium">Size</th>
              <th className="pr-8 pb-3 font-medium">Excellent ≥ 90</th>
              <th className="pr-8 pb-3 font-medium">Good 75–89</th>
              <th className="pb-3 font-medium">Fair &lt; 75</th>
            </tr>
          </thead>
          <tbody key={replay}>
            {(["sm", "md", "lg"] as const).map((size) => (
              <tr key={size}>
                <td className="num pr-8 pb-4 align-middle">{size.toUpperCase()}</td>
                {[94, 82, 68].map((v) => (
                  <td key={v} className="pr-8 pb-4 align-middle">
                    <ScoreRing value={v} size={size} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="secondary" size="sm" className="self-start" onClick={() => setReplay((r) => r + 1)}>
        Putar ulang animasi
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------- Laptop cards

function ProfileParts() {
  const state = useApi(loadTight);
  const [accepted, setAccepted] = React.useState(false);
  const glossary = getGlossary();
  if (state.status !== "success") {
    return <Skeleton className="h-64 rounded-card bg-surface" aria-label="Memuat contoh profil" />;
  }
  const req = state.data;
  const byLevel = (["wajib", "disarankan", "opsional"] as const).map((l) => req.specs.find((s) => s.level === l)!);
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Label>Profile chips (klik untuk mengubah langkah)</Label>
        <ProfileChips profile={tightProfile} />
      </div>
      <div className="flex flex-col gap-3">
        <Label>Spec Requirement Card · Wajib, Disarankan, Opsional</Label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {byLevel.map((spec) => (
            <SpecRequirementCard key={spec.component} spec={spec} glossary={glossary[spec.component]} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Label>Warning panel · default dan setelah kompromi</Label>
        <WarningPanel warning={req.warnings[0]} accepted={false} onRaiseBudget={() => {}} onCompromise={() => setAccepted(true)} />
        <WarningPanel warning={req.warnings[0]} accepted onRaiseBudget={() => {}} onCompromise={() => {}} />
        {accepted && <p className="type-small text-text-muted">Tombol kompromi ditekan (demo).</p>}
      </div>
    </div>
  );
}

const demoAnalysisSteps = [
  { label: "Membaca profilmu", detail: "Informatika · Rp8 jt · Programming" },
  { label: "Menyaring laptop sesuai budget", detail: "12 laptop di katalog → 9 dalam budget" },
  { label: "Menghitung kecocokan per kriteria", detail: "Prioritasmu: Performa, Ringan dibawa" },
  { label: "Menyusun alasan dan trade-off", detail: "Untuk Best Match dan alternatifnya" },
];

function AnalysisStepsDemo() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {[
        { completed: 0, label: "Awal (tahap 1 aktif)" },
        { completed: 2, label: "Tengah (2 selesai, 1 aktif)" },
        { completed: 4, label: "Selesai semua" },
      ].map((v) => (
        <div key={v.completed} className="flex flex-col gap-3">
          <Label>{v.label}</Label>
          <AnalyzingSteps steps={demoAnalysisSteps} completed={v.completed} />
        </div>
      ))}
    </div>
  );
}

function DetailParts() {
  const state = useApi(loadDetailDemo);
  if (state.status !== "success") {
    return <Skeleton className="h-64 rounded-card bg-surface" aria-label="Memuat contoh detail" />;
  }
  const [set, req] = state.data;
  const best = set.items[0];
  const weak = set.items[set.items.length - 1];
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Label>Score Breakdown · bar berbobot ({best.laptop.brand} {best.laptop.model})</Label>
        <ScoreBreakdown result={best.result} className="max-w-3xl" />
      </div>
      <div className="flex flex-col gap-3">
        <Label>Requirement vs laptop · semua memenuhi ({best.laptop.model})</Label>
        <RequirementCheckHeader />
        <RequirementCheck specs={req.specs} results={checkSpecs(req, best.laptop)} />
      </div>
      <div className="flex flex-col gap-3">
        <Label>Requirement vs laptop · ada yang kurang ({weak.laptop.model})</Label>
        <RequirementCheck specs={req.specs} results={checkSpecs(req, weak.laptop)} />
      </div>
    </div>
  );
}

function LaptopCards() {
  const state = useApi(loadRaka);
  const [compared, setCompared] = React.useState<string[]>(["lp-003"]);
  const [saved, setSaved] = React.useState<string[]>(["lp-004"]);
  const toggle = (set: React.Dispatch<React.SetStateAction<string[]>>, id: string) => (next: boolean) =>
    set((list) => (next ? [...list, id] : list.filter((x) => x !== id)));

  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Memuat kartu laptop">
        <Skeleton className="h-[420px] rounded-card bg-surface" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[380px] rounded-card bg-surface" />
          <Skeleton className="h-[380px] rounded-card bg-surface" />
        </div>
      </div>
    );
  }
  if (state.status === "error") return <p className="text-danger">{state.error.message}</p>;

  const [best, ...rest] = state.data.items;
  const props = (id: string) => ({
    compared: compared.includes(id),
    saved: saved.includes(id),
    onCompareChange: toggle(setCompared, id),
    onSaveChange: toggle(setSaved, id),
  });

  return (
    <div className="flex flex-col gap-10">
      <p className="type-small font-normal text-text-muted">
        Data: skenario {state.data.title} lewat <code className="num">getRecommendations()</code> (jeda palsu 600–2500 ms).
      </p>
      <div className="flex flex-col gap-3">
        <Label>Best Match (besar)</Label>
        <LaptopCard variant="best-match" laptop={best.laptop} result={best.result} {...props(best.laptop.id)} />
      </div>

      <div className="flex flex-col gap-3">
        <Label>Default · state: default, hover, selected, compared, saved</Label>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <LaptopCard laptop={rest[0].laptop} result={rest[0].result} {...props(rest[0].laptop.id)} compared={false} saved={false} />
          <LaptopCard laptop={rest[0].laptop} result={rest[0].result} forceHover />
          <LaptopCard laptop={rest[0].laptop} result={rest[0].result} selected />
          <LaptopCard laptop={rest[1].laptop} result={rest[1].result} {...props(rest[1].laptop.id)} compared />
          <LaptopCard laptop={rest[2].laptop} result={rest[2].result} {...props(rest[2].laptop.id)} saved />
          <LaptopCard laptop={rest[4].laptop} result={rest[4].result} category={null} {...props(rest[4].laptop.id)} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label>Compact (daftar lain yang lolos filter)</Label>
        <div className="grid gap-3 md:grid-cols-2">
          {rest.slice(3).map((item) => (
            <LaptopCard key={item.laptop.id} variant="compact" laptop={item.laptop} result={item.result} {...props(item.laptop.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Page

export function Showcase() {
  return (
    <main className="page-container pb-24">
      <header className="flex flex-col gap-3 py-12 md:py-16">
        <Link href="/dev" className="type-small text-primary hover:underline">
          ← Indeks dev
        </Link>
        <h1 className="type-h1 text-text">Komponen inti</h1>
        <p className="max-w-2xl type-body-l text-text-muted">
          Semua variant komponen inti (PRD §23), ditambah fondasi redesign R1 (docs/archive/REDESIGN.md). Halaman QA, bukan halaman final.
        </p>
      </header>

      <Section id="icon-tile" title="Icon Tile (Phosphor duotone)" prd="REDESIGN §10, §12 · 5 kategori · 40/32">
        <IconTiles />
      </Section>
      <Section id="need-meter" title="Garis Kebutuhan (NeedMeter)" prd="REDESIGN §9, §13 gerak 4 · requirement, laptop, compare · met, near, short">
        <NeedMeters />
      </Section>
      <Section id="laptop-render" title="Render laptop" prd="REDESIGN §24 · render AI, latar studio, label Ilustrasi">
        <LaptopRenders />
      </Section>
      <Section id="mood-photo" title="Foto suasana" prd="REDESIGN §13 gerak 12, §24 · duotone seragam, kredit">
        <MoodPhotos />
      </Section>
      <Section id="mock" title="Konsistensi mock data" prd="PRD §27, §29, §33">
        <MockIntegrity />
      </Section>
      <Section id="button" title="Button" prd="PRD §23 · Primary, Secondary, Ghost, Link · S/M/L · Disabled, Loading">
        <Buttons />
      </Section>
      <Section id="select-card" title="Select Card" prd="PRD §15, §23, §25 · Single, Multi · Selected, Disabled · badge Utama">
        <SelectCards />
      </Section>
      <Section id="stepper" title="Stepper" prd="PRD §15, §23, §24 · Done, Current, Upcoming · Dots, Progress bar">
        <Steppers />
      </Section>
      <Section id="budget" title="Budget Slider" prd="PRD §15 step 1, §23, §28 · Default, Preset chip, Feedback">
        <BudgetSliders />
      </Section>
      <Section id="score-ring" title="Score Ring" prd="PRD §23, §25, §27 · Excellent, Good, Fair · S/M/L">
        <ScoreRings />
      </Section>
      <Section id="profile" title="Profil Kebutuhan" prd="PRD §16, §23, §26 · Spec Requirement Card, chip profil, banner budget">
        <ProfileParts />
      </Section>
      <Section id="analyzing" title="Analyzing Steps" prd="PRD §23, §25 · 4 tahap · Pending, Active, Done">
        <AnalysisStepsDemo />
      </Section>
      <Section id="detail" title="Score Breakdown & Requirement Check" prd="PRD §19, §23, §27 · bar berbobot, ✓ Memenuhi / ✕ Kurang">
        <DetailParts />
      </Section>
      <Section id="laptop-card" title="Laptop Card" prd="PRD §17, §23, §25 · Best Match, Default, Compact">
        <LaptopCards />
      </Section>
    </main>
  );
}
