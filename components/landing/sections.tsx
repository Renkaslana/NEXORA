import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { LandingSample } from "@/components/landing/sample-data"
import { RequirementSnippet, ResultSnippet, WizardSnippet } from "@/components/landing/snippets"
import { Button } from "@/components/ui/button"
import { getSampleProfile, getWizardOptions } from "@/lib/api"
import { formatRupiahShort, rupiahToWords } from "@/lib/format"

// Section di bawah lipatan Landing final, urutan PRD §13:
// Cara kerja → 4 persona → "Kenapa NEXORA bukan toko" → CTA penutup.

// ---------------------------------------------------------------- Cara kerja (PRD §11, §13)

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
]

export function HowItWorks({ sample }: { sample: LandingSample }) {
  return (
    <section id="cara-kerja" aria-labelledby="cara-kerja-title" className="scroll-mt-16 bg-surface py-16 md:py-24">
      <div className="page-container flex flex-col gap-10 md:gap-14">
        <header className="flex max-w-2xl flex-col gap-3">
          <h2 id="cara-kerja-title" className="type-h1 text-text">
            Tiga layar, kurang dari dua menit
          </h2>
          <p className="type-body-l text-text-muted">
            Ini tampilan yang akan kamu lihat, bukan ilustrasi. Contoh di bawah memakai profil Raka, mahasiswa
            Informatika dengan budget {rupiahToWords(sample.profile.budget.max).replace(" rupiah", "")}.
          </p>
        </header>
        <ol className="grid gap-10 lg:grid-cols-3 lg:gap-6">
          {howSteps.map(({ title, body, snippet: Snippet }, index) => (
            <li key={title} className="flex min-w-0 flex-col gap-5">
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary type-small text-primary-foreground">
                  {index + 1}
                </span>
                <span className="hidden h-0.5 flex-1 rounded-full bg-border lg:block" />
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
  )
}

// ---------------------------------------------------------------- 4 persona (PRD §5, §13)

export function PersonaEntry() {
  const { personas, majors } = getWizardOptions()
  return (
    <section aria-labelledby="persona-title" className="py-16 md:py-24">
      <div className="page-container flex flex-col gap-10">
        <header className="flex max-w-2xl flex-col gap-3">
          <h2 id="persona-title" className="type-h1 text-text">
            Mirip salah satu dari mereka?
          </h2>
          <p className="type-body-l text-text-muted">
            Mulai dari contoh yang paling dekat denganmu. Budget dan jurusannya langsung terisi, dan semuanya bisa
            kamu ubah di Wizard.
          </p>
        </header>

        <ul className="flex flex-col border-t border-border">
          {personas.map((p) => {
            const profile = getSampleProfile(p.id)
            const [name, ...rest] = p.example.split(", ")
            const major = majors.find((m) => m.id === profile.major)?.label
            const href = `/rekomendasi/budget?budget=${profile.budget.max}&jurusan=${profile.major}`
            return (
              <li
                key={p.id}
                className="grid gap-4 border-b border-border py-6 md:grid-cols-12 md:items-start md:gap-6 md:py-8"
              >
                <div className="flex flex-col gap-1 md:col-span-3">
                  <h3 className="type-h3 text-text">{name}</h3>
                  <p className="type-small font-normal text-text-muted">
                    {rest.join(", ")} · {p.label}
                  </p>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2 md:col-span-6 md:gap-6">
                  <div className="flex flex-col gap-1">
                    <dt className="type-micro text-text-muted">Butuh</dt>
                    <dd className="type-small font-normal text-text">{p.needs}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="type-micro text-text-muted">Khawatir</dt>
                    <dd className="type-small font-normal text-text">{p.fear}</dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-2 md:col-span-3 md:items-end">
                  <p className="type-small text-text">
                    <span className="sr-only">Kisaran budget: </span>
                    <span className="num">{p.budgetLabel}</span>
                  </p>
                  <Button asChild variant="secondary" size="sm" className="self-start md:self-end">
                    <Link href={href} aria-label={`Mulai seperti ${name}: ${major}, budget ${formatRupiahShort(profile.budget.max)}`}>
                      Mulai seperti {name} <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- Kepercayaan (PRD §13, §27)

const promises = [
  {
    title: "Tidak menjual",
    body: "NEXORA bukan toko. Tidak ada keranjang, tidak ada komisi, dan harga hanya ditampilkan sebagai informasi.",
  },
  {
    title: "Tanpa iklan",
    body: "Tidak ada label promo, diskon, atau hitung mundur. Urutan laptop hanya ditentukan oleh kebutuhanmu.",
  },
  {
    title: "Trade-off ditulis terang",
    body: "Setiap rekomendasi menyebut kekurangannya, termasuk saat laptop itu sedikit melewati budget-mu.",
  },
]

export function TrustStrip() {
  return (
    <section aria-labelledby="trust-title" className="bg-surface py-16 md:py-24">
      <div className="page-container grid gap-10 lg:grid-cols-12 lg:gap-6">
        <h2 id="trust-title" className="type-h1 text-text lg:col-span-4">
          Kenapa NEXORA bukan toko
        </h2>
        <dl className="grid gap-8 sm:grid-cols-3 sm:gap-6 lg:col-span-8">
          {promises.map((p) => (
            <div key={p.title} className="flex flex-col gap-2">
              <dt className="type-h3 text-text">{p.title}</dt>
              <dd className="type-body text-text-muted">{p.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- CTA penutup

export function ClosingCta() {
  return (
    <section aria-labelledby="closing-title" className="py-20 md:py-28">
      <div className="page-container flex flex-col items-start gap-6">
        <h2 id="closing-title" className="type-h1 text-text">
          Budget sudah ada. Tinggal tahu butuhnya.
        </h2>
        <p className="max-w-[40rem] type-body-l text-text-muted">
          Lima pertanyaan, kurang dari dua menit, tanpa membuat akun. Jawabanmu tersimpan selama tab ini terbuka.
        </p>
        <Button asChild size="lg">
          <Link href="/rekomendasi/budget">
            Cari Laptop yang Pas <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
