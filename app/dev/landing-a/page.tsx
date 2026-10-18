import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getLandingSample, type LandingSample } from "@/components/landing/sample-data";
import { RequirementSnippet, ResultSnippet, WizardSnippet } from "@/components/landing/snippets";
import { ScoreRing } from "@/components/results/score-ring";
import { Button } from "@/components/ui/button";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { formatRupiahShort } from "@/lib/format";

// Varian A — Hybrid (PRD §12 Concept D, §13 "Clear Spec").
// Kiri: headline + CTA + preset budget. Kanan: foto laptop + satu kartu Profil Kebutuhan
// mengambang (satu-satunya elemen ber-shadow-lg). Mobile: foto + kartu pindah ke bawah (§13, §24).

export const metadata: Metadata = { title: "Landing A — Hybrid · NEXORA (dev)" };

function ProfileCard({ sample }: { sample: LandingSample }) {
  const chips = [
    `Budget ${formatRupiahShort(sample.profile.budget.max)}`,
    sample.majorLabel,
    `RAM ${sample.ram.minimum}`,
    sample.storage.minimum,
  ];
  return (
    <aside
      data-ui
      aria-label="Contoh Profil Kebutuhan"
      className="flex w-full max-w-[22rem] flex-col gap-4 rounded-card border border-border bg-bg p-5 shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="type-small text-text">Profil Kebutuhan</p>
          <p className="type-micro text-text-muted">Contoh: {sample.majorLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <ScoreRing value={sample.best.result.matchScore} size="sm" animate={false} />
          <span className="type-small text-success">cocok</span>
        </div>
      </div>
      <ul className="flex flex-wrap gap-1.5" aria-label="Ringkasan profil">
        {chips.map((c) => (
          <li key={c} className="inline-flex h-7 items-center rounded-full bg-surface px-2.5 type-micro text-text">
            {c}
          </li>
        ))}
      </ul>
      <p className="rounded-control bg-primary-soft px-3 py-2.5 type-small font-normal text-text">
        <span className="font-semibold text-primary">Kenapa?</span> RAM {sample.ram.minimum} untuk{" "}
        {sample.softwareLabels.join(" + ")}
      </p>
    </aside>
  );
}

const howSteps = [
  {
    title: "Jawab 5 pertanyaan singkat",
    body: "Budget, jurusan, aktivitas, aplikasi, dan prioritas. Tanpa istilah teknis, cukup klik.",
    snippet: WizardSnippet,
  },
  {
    title: "Lihat spek yang kamu butuh",
    body: "Sebelum melihat satu pun laptop, kamu tahu RAM, SSD, dan CPU minimum beserta alasannya.",
    snippet: RequirementSnippet,
  },
  {
    title: "Pilih laptop dengan alasan",
    body: "Skor kecocokan, alasan yang menyebut sumbernya, dan trade-off yang jujur.",
    snippet: ResultSnippet,
  },
];

export default async function LandingA() {
  const sample = await getLandingSample();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ---------------------------------------------------------------- Hero */}
        <section className="page-container grid items-center gap-12 pt-10 pb-16 md:pt-16 md:pb-24 lg:grid-cols-12 lg:gap-6 lg:pt-20">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-6 lg:pr-6">
            <p className="type-small text-primary">Sistem pendukung keputusan laptop</p>
            <h1 className="type-display text-text">Jangan pilih laptop dari speknya. Pilih dari kebutuhanmu.</h1>
            <p className="max-w-[34rem] type-body-l text-text-muted">
              Jawab 5 pertanyaan singkat tentang budget, kuliah, dan aplikasi yang kamu pakai. Kami tunjukkan spek
              yang kamu butuh dan laptop yang cocok, lengkap dengan alasannya.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button asChild size="lg">
                <Link href="/rekomendasi/budget">Cari Laptop yang Pas</Link>
              </Button>
              <Button asChild variant="link" size="md">
                <Link href="#cara-kerja">Lihat cara kerjanya</Link>
              </Button>
            </div>
            <div className="flex min-w-0 flex-col gap-2 pt-2">
              <p className="type-small font-normal text-text-muted">Atau mulai dari budget-mu:</p>
              <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                  {sample.budgetPresets.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/rekomendasi/budget?budget=${p.value}`}
                        className="inline-flex h-11 items-center rounded-full border border-border bg-bg px-4 type-small text-text transition-colors duration-150 hover:border-primary hover:bg-primary-soft hover:text-primary"
                      >
                        {p.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="relative min-w-0 lg:col-span-6">
            <PhotoPlaceholder tone="mid" className="rounded-card" label="Foto laptop, tiga perempat" />
            <div className="relative z-10 -mt-20 px-4 sm:-mt-24 sm:px-8 lg:absolute lg:-bottom-10 lg:-left-12 lg:mt-0 lg:px-0">
              <ProfileCard sample={sample} />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- Cara kerja */}
        <section id="cara-kerja" aria-labelledby="cara-kerja-title" className="scroll-mt-16 bg-surface py-16 md:py-24">
          <div className="page-container flex flex-col gap-10 md:gap-14">
            <header className="flex max-w-2xl flex-col gap-3">
              <h2 id="cara-kerja-title" className="type-h1 text-text">
                Tiga layar, kurang dari dua menit
              </h2>
              <p className="type-body-l text-text-muted">
                Ini tampilan yang akan kamu lihat, bukan ilustrasi. Contoh di bawah memakai profil Raka, mahasiswa
                Informatika dengan budget Rp8 juta.
              </p>
            </header>
            <ol className="grid gap-10 lg:grid-cols-3 lg:gap-6">
              {howSteps.map(({ title, body, snippet: Snippet }, index) => (
                <li key={title} className="flex min-w-0 flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-primary type-small text-primary-foreground"
                    >
                      {index + 1}
                    </span>
                    <span aria-hidden="true" className="hidden h-0.5 flex-1 rounded-full bg-border lg:block" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="type-h3 text-text">{title}</h3>
                    <p className="type-body text-text-muted">{body}</p>
                  </div>
                  <div className="rounded-card border border-border bg-bg p-4">
                    <Snippet sample={sample} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
