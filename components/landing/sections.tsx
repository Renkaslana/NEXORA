import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { Reveal } from "@/components/landing/reveal"
import type { LandingSample } from "@/components/landing/sample-data"
import { ScrollStory } from "@/components/landing/scroll-story"
import { Button } from "@/components/ui/button"
import { LaptopRender } from "@/components/ui/laptop-render"
import { MoodPhoto } from "@/components/ui/mood-photo"
import { NeedMeter } from "@/components/ui/need-meter"
import { formatRupiah, formatRupiahShort } from "@/lib/format"
import type { MoodPhotoId } from "@/lib/mood-photos"

// Section di bawah lipatan Landing redesign (REDESIGN §16; PRD §6, §13). Urutan mengikuti
// perjalanan emosi: bingung → dipahami → terarah → yakin. "Garis kebutuhanmu" digabung ke hero.

function SectionHeader({ id, title, lead }: { id: string; title: string; lead: string }) {
  return (
    <Reveal className="max-w-2xl" innerClassName="flex flex-col gap-3">
      <h2 id={id} className="type-h1 text-text">
        {title}
      </h2>
      <p className="type-body-l text-text-muted">{lead}</p>
    </Reveal>
  )
}

// ---------------------------------------------------------------- 2. Spek saja tidak menjawab

export function SpecIsNotEnough({ sample }: { sample: LandingSample }) {
  return (
    <section aria-labelledby="kasus-title" className="bg-paper-100 py-16 md:py-24">
      <div className="page-container flex flex-col gap-10 md:gap-14">
        <SectionHeader
          id="kasus-title"
          title="Spek saja tidak menjawab"
          lead="Angka yang tinggi belum tentu cocok. Garis hitam adalah kebutuhan pemiliknya; bar adalah laptop yang hampir mereka beli."
        />
        <ul className="grid gap-6 md:grid-cols-2">
          {sample.cases.map((c, i) => (
            <li key={c.id}>
              <Reveal delay={i * 0.08} className="h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-card border border-border bg-bg">
                  <LaptopRender image={c.laptop.image} sizes="(min-width: 768px) 45vw, 100vw" className="aspect-[16/9]" />
                  <div className="flex flex-1 flex-col gap-5 p-5 md:p-6">
                    <div className="flex flex-col gap-2">
                      <p className="type-small text-primary">
                        {c.personaName} · {c.majorLabel}
                      </p>
                      <h3 className="type-h3 text-text">{c.title}</h3>
                      <p className="type-body text-text-muted">{c.story}</p>
                    </div>
                    <div className="mt-auto flex flex-col gap-4 border-t border-border pt-5">
                      <p className="type-small font-normal text-text-muted">
                        {c.laptop.name} · <span className="num">{formatRupiah(c.laptop.priceIdr)}</span>
                      </p>
                      {c.meters.map((m, j) => (
                        <NeedMeter
                          key={m.key}
                          component={m.component}
                          scale={m.scale}
                          need={m.need}
                          value={m.value}
                          index={j}
                          flashShort
                        />
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
        <p className="type-small font-normal text-text-muted">
          Contoh dari data demo NEXORA, bukan kisah pengguna nyata.
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 3. Cerita ter-pin

export function HowItWorks({ sample }: { sample: LandingSample }) {
  return (
    <section id="cara-kerja" aria-labelledby="cara-kerja-title" className="scroll-mt-16 py-16 md:pt-24 md:pb-0">
      <div className="page-container pb-10 md:pb-4">
        <SectionHeader
          id="cara-kerja-title"
          title="Ceritakan kebutuhanmu, sisanya kami susun"
          lead={`Tiga layar, kurang dari dua menit. Yang tampil di layar adalah tampilan NEXORA sebenarnya, dengan profil Raka (Informatika, budget ${formatRupiahShort(sample.profile.budget.max)}).`}
        />
      </div>
      <ScrollStory sample={sample} />
    </section>
  )
}

// ---------------------------------------------------------------- 5. Persona

const PERSONA_PHOTO: Record<string, MoodPhotoId> = {
  teknik: "persona-teknik",
  desain: "persona-desain",
  umum: "persona-umum",
  profesional: "persona-profesional",
}

export function PersonaEntry({ sample }: { sample: LandingSample }) {
  return (
    <section id="persona" aria-labelledby="persona-title" className="scroll-mt-16 bg-paper-100 py-16 md:py-24">
      <div className="page-container flex flex-col gap-10">
        <SectionHeader
          id="persona-title"
          title="Mirip salah satu dari mereka?"
          lead="Mulai dari contoh yang paling dekat denganmu. Budget dan jurusannya langsung terisi, dan semuanya bisa kamu ubah di Wizard."
        />
        {/* Mobile: geser horizontal (scroll-snap). lg: grid empat kolom. */}
        <div className="-mx-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:overflow-visible lg:px-0">
          <ul className="flex w-max snap-x snap-mandatory gap-4 lg:grid lg:w-auto lg:grid-cols-4 lg:gap-6">
            {sample.personas.map((p, i) => {
              const [name, ...rest] = p.example.split(", ")
              const href = `/rekomendasi/budget?budget=${p.budgetMax}&jurusan=${p.major}`
              return (
                <li key={p.id} className="w-[82vw] max-w-[22rem] shrink-0 snap-start lg:w-auto lg:max-w-none">
                  <Reveal delay={i * 0.06} className="h-full">
                    <article className="flex h-full flex-col gap-5 rounded-card border border-border bg-bg p-3 pb-5">
                      <MoodPhoto id={PERSONA_PHOTO[p.id]} sizes="(min-width: 1024px) 280px, 82vw" decorative />
                      <div className="flex flex-col gap-1 px-2">
                        <h3 className="type-h3 text-text">{name}</h3>
                        <p className="type-small font-normal text-text-muted">
                          {rest.join(", ")} · <span className="num">{p.budgetLabel}</span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-3.5 px-2">
                        {p.meters.map((m, j) => (
                          <NeedMeter
                            key={m.key}
                            component={m.component}
                            scale={m.scale}
                            need={m.need}
                            index={j}
                            size="compact"
                          />
                        ))}
                      </div>
                      <p className="px-2 type-small font-normal text-text-muted">
                        <span className="font-semibold text-text">Khawatir:</span> {p.fear}
                      </p>
                      <div className="mt-auto px-2">
                        <Button asChild variant="secondary" size="sm">
                          <Link
                            href={href}
                            aria-label={`Mulai seperti ${name}: ${p.majorLabel}, budget ${formatRupiahShort(p.budgetMax)}`}
                          >
                            Mulai seperti {name} <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
                    </article>
                  </Reveal>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 6. Band gelap (PRD §13, §27)

const promises = [
  {
    figure: "0",
    unit: "iklan",
    body: "Tidak ada label promo, diskon, atau hitung mundur. Urutan laptop hanya ditentukan oleh kebutuhanmu.",
  },
  {
    figure: "0",
    unit: "komisi",
    body: "NEXORA bukan toko. Tidak ada keranjang dan tidak ada komisi; harga hanya ditampilkan sebagai informasi.",
  },
  {
    figure: "1",
    unit: "trade-off di setiap hasil",
    body: "Setiap rekomendasi menyebut kekurangannya, termasuk saat laptop itu sedikit melewati budget-mu.",
  },
]

export function TrustBand() {
  return (
    <section aria-labelledby="trust-title" data-tone="dark" className="bg-ink-950 py-16 text-white md:py-24">
      <div className="page-container grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="flex flex-col gap-10 lg:col-span-7">
          <Reveal variant="clip">
            <h2 id="trust-title" className="type-h1 text-white">
              Kenapa NEXORA bukan toko
            </h2>
          </Reveal>
          <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {promises.map((p, i) => (
              <li key={p.unit}>
                <Reveal variant="clip" delay={0.1 + i * 0.08} innerClassName="flex flex-col gap-2">
                  <p className="flex flex-col gap-1">
                    <span className="num text-6xl leading-none text-white">{p.figure}</span>
                    <span className="type-body font-semibold text-white">{p.unit}</span>
                  </p>
                  <p className="type-small font-normal text-zinc-300">{p.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5">
          <MoodPhoto id="band-desk" sizes="(min-width: 1024px) 40vw, 100vw" decorative />
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 7. CTA penutup

export function ClosingCta() {
  return (
    <section aria-labelledby="closing-title" className="py-20 md:py-28">
      <div className="page-container grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-6" innerClassName="flex flex-col items-start gap-6">
          <h2 id="closing-title" className="type-display text-text">
            Budget sudah ada. Tinggal tahu butuhnya.
          </h2>
          <p className="max-w-[40rem] type-body-l text-text-muted">
            Lima pertanyaan, kurang dari dua menit, tanpa membuat akun. Jawabanmu tersimpan selama tab ini terbuka.
          </p>
          <Button asChild size="lg">
            <Link href="/rekomendasi/budget">
              Cari Laptop yang Pas <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
            </Link>
          </Button>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-6">
          <LaptopRender
            image={{ shape: "ultrabook", color: "silver" }}
            angle="side"
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="rounded-[24px]"
          />
        </Reveal>
      </div>
    </section>
  )
}
