import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { Reveal } from "@/components/landing/reveal"
import type { LandingSample } from "@/components/landing/sample-data"
import { ScrollStory } from "@/components/landing/scroll-story"
import { MoodPhoto } from "@/components/ui/mood-photo"
import { NeedMeter } from "@/components/ui/need-meter"
import { getBudgetInsight } from "@/lib/api"
import { formatRupiah, formatRupiahShort } from "@/lib/format"
import type { MoodPhotoId } from "@/lib/mood-photos"

// Section di bawah hero, redesign "Kalimat terbelah" (disetujui Fahren, Okt 2026; isi PRD §6, §13).
// Urutan argumen: etalase tidak tahu kuliahmu → 5 pertanyaan → batas tiap budget → persona →
// bukan toko → CTA. Tiap section punya susunan sendiri; tidak ada deretan kartu kembar.

// ---------------------------------------------------------------- Etalase vs kebutuhan

export function SpecIsNotEnough({ sample }: { sample: LandingSample }) {
  return (
    <section aria-labelledby="kasus-title" className="py-16 md:py-24">
      <div className="page-container grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-24">
            <MoodPhoto id="scene-mall" sizes="(min-width: 1024px) 45vw, 100vw" label drift />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-10 lg:col-span-6">
          <Reveal innerClassName="flex flex-col gap-4">
            <h2 id="kasus-title" className="type-display text-text">
              Kartu spek di etalase tidak tahu kuliahmu.
            </h2>
            <p className="type-body-l text-text">
              Di mal komputer, setiap laptop punya kartu berisi angka. Kartu itu menjawab “apa isinya”, bukan “cukup
              nggak buat aku”. Dua contoh di bawah: garis tegas adalah kebutuhan pemiliknya, bar adalah laptop yang
              hampir mereka beli.
            </p>
          </Reveal>

          <ol className="flex flex-col gap-4">
            {sample.cases.map((c, i) => (
              <li key={c.id}>
                <Reveal delay={i * 0.08}>
                  <article className="flex flex-col gap-5 rounded-[20px] bg-paper-100 p-5 md:p-7">
                    <div className="flex flex-col gap-2">
                      <p className="type-small text-cobalt-600">
                        {c.personaName}, {c.majorLabel}
                      </p>
                      <h3 className="type-h2 text-text">{c.title}</h3>
                      <p className="type-body text-text">{c.story}</p>
                    </div>
                    <div className="flex flex-col gap-4 rounded-[14px] bg-bg p-4">
                      <p className="type-small text-text">
                        {c.laptop.name} · <span className="tabular-nums">{formatRupiah(c.laptop.priceIdr)}</span>
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
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
          <p className="type-small font-normal text-text-muted">
            Contoh dari data demo NEXORA, bukan kisah pengguna nyata. Foto adalah ilustrasi AI.
          </p>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- Cara kerja: satu bar lima pertanyaan

/** Perkiraan detik per pertanyaan; lebar segmen sebanding (± 2 menit total). */
const QUESTIONS = [
  { label: "Budget", seconds: 15, hint: "Geser atau pilih kisaran" },
  { label: "Jurusan", seconds: 10, hint: "Satu klik" },
  { label: "Aktivitas", seconds: 20, hint: "Kuliah, coding, desain…" },
  { label: "Software", seconds: 25, hint: "Yang sering kamu buka" },
  { label: "Prioritas", seconds: 30, hint: "Urutkan 3 yang terpenting" },
]

export function HowItWorks({ sample }: { sample: LandingSample }) {
  return (
    <section id="cara-kerja" aria-labelledby="cara-kerja-title" className="scroll-mt-16 bg-paper-100 pt-16 md:pt-24">
      <div className="page-container flex flex-col gap-10 pb-12 md:pb-8">
        <Reveal className="max-w-3xl" innerClassName="flex flex-col gap-4">
          <h2 id="cara-kerja-title" className="type-display text-text">
            Lima pertanyaan, kurang dari dua menit.
          </h2>
          <p className="type-body-l text-text">
            Tanpa istilah teknis dan tanpa akun. Yang tampil di layar laptop di bawah adalah tampilan NEXORA
            sebenarnya, dengan profil Raka (Informatika, budget {formatRupiahShort(sample.profile.budget.max)}).
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <ol className="flex flex-col gap-2 md:flex-row">
            {QUESTIONS.map((q, i) => (
              <li
                key={q.label}
                style={{ flexGrow: q.seconds }}
                className="flex basis-0 flex-col gap-1 rounded-[14px] bg-cobalt-600 px-4 py-4 text-white md:min-h-32 md:justify-between"
              >
                <span className="text-sm font-semibold text-cobalt-100 tabular-nums">
                  {i + 1} · ±{q.seconds} dtk
                </span>
                <span className="flex flex-col">
                  <span className="type-h3 text-white">{q.label}</span>
                  <span className="type-small font-normal text-cobalt-100">{q.hint}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
      <ScrollStory sample={sample} />
      <div aria-hidden="true" className="h-16 md:h-24" />
    </section>
  )
}

// ---------------------------------------------------------------- Batas tiap budget

export function BudgetTiers({ sample }: { sample: LandingSample }) {
  return (
    <section aria-labelledby="tier-title" className="py-16 md:py-24">
      <div className="page-container grid gap-10 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-4" innerClassName="flex flex-col gap-6">
          <h2 id="tier-title" className="type-display text-text">
            Tiap budget punya batasnya.
          </h2>
          <p className="type-body-l text-text">
            Lebih baik tahu sejak awal apa yang realistis di kisaran harga-mu, daripada kecewa di depan etalase.
          </p>
          <MoodPhoto id="scene-spec-card" sizes="(min-width: 1024px) 30vw, 100vw" label className="hidden lg:block" />
        </Reveal>

        <ol className="flex flex-col gap-2 lg:col-span-8">
          {sample.budgetPresets.map((p, i) => {
            const insight = getBudgetInsight(p.value, true)
            return (
              <li key={p.id}>
                <Reveal delay={i * 0.06}>
                  <Link
                    href={`/rekomendasi/budget?budget=${p.value}`}
                    className="group grid gap-x-6 gap-y-2 rounded-[16px] bg-paper-100 p-5 transition-colors duration-[var(--motion-fast)] hover:bg-cobalt-600 hover:text-white md:grid-cols-[9rem_minmax(0,1fr)_7rem] md:items-center md:p-6"
                  >
                    <span className="text-2xl leading-8 font-extrabold tracking-[-0.03em] tabular-nums">{p.label}</span>
                    <span className="type-body text-text group-hover:text-white">{p.typicalSpec}</span>
                    <span className="flex items-center justify-between gap-2 type-small text-text-muted group-hover:text-cobalt-100 md:justify-end">
                      <span className="tabular-nums">{insight.laptopCount} laptop</span>
                      <ArrowRightIcon
                        weight="bold"
                        className="size-5 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- Persona

const PERSONA_PHOTO: Record<string, MoodPhotoId> = {
  teknik: "scene-kos",
  desain: "scene-studio-dkv",
  umum: "scene-krl",
  profesional: "scene-kopi",
}

export function PersonaEntry({ sample }: { sample: LandingSample }) {
  return (
    <section id="persona" aria-labelledby="persona-title" className="scroll-mt-16 bg-paper-100 py-16 md:py-24">
      <div className="page-container flex flex-col gap-12">
        <Reveal className="max-w-3xl" innerClassName="flex flex-col gap-4">
          <h2 id="persona-title" className="type-display text-text">
            Mirip salah satu dari mereka?
          </h2>
          <p className="type-body-l text-text">
            Mulai dari contoh yang paling dekat denganmu. Budget dan jurusannya langsung terisi, dan semuanya bisa kamu
            ubah di Wizard.
          </p>
        </Reveal>

        <ul className="flex flex-col gap-14 md:gap-20">
          {sample.personas.map((p, i) => {
            const [name, ...rest] = p.example.split(", ")
            const href = `/rekomendasi/budget?budget=${p.budgetMax}&jurusan=${p.major}`
            const flip = i % 2 === 1
            return (
              <li key={p.id} className="grid items-center gap-6 md:grid-cols-12 md:gap-10">
                <div className={flip ? "md:order-2 md:col-span-6 md:col-start-7" : "md:col-span-6"}>
                  <MoodPhoto id={PERSONA_PHOTO[p.id]} sizes="(min-width: 768px) 50vw, 100vw" label decorative />
                </div>
                <Reveal
                  className={flip ? "md:order-1 md:col-span-5 md:col-start-1" : "md:col-span-5 md:col-start-8"}
                  innerClassName="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="text-5xl leading-none font-extrabold tracking-[-0.04em] text-text md:text-6xl">
                      {name}
                    </h3>
                    <p className="type-body-l text-text">
                      {rest.join(", ")} · <span className="tabular-nums">{p.budgetLabel}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-3.5 rounded-[14px] bg-bg p-4">
                    {p.meters.map((m, j) => (
                      <NeedMeter key={m.key} component={m.component} scale={m.scale} need={m.need} index={j} size="compact" />
                    ))}
                  </div>
                  <p className="type-body text-text">
                    <span className="font-semibold">Khawatir:</span> {p.fear}
                  </p>
                  <Link
                    href={href}
                    aria-label={`Mulai seperti ${name}: ${p.majorLabel}, budget ${formatRupiahShort(p.budgetMax)}`}
                    className="group inline-flex min-h-11 items-center gap-2 self-start type-body font-semibold text-cobalt-600"
                  >
                    Mulai seperti {name}
                    <ArrowRightIcon weight="bold" className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </Reveal>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- Bukan toko

const promises = [
  { figure: "0", unit: "iklan.", body: "Tidak ada promo, diskon, atau hitung mundur. Urutan laptop hanya ditentukan kebutuhanmu." },
  { figure: "0", unit: "komisi.", body: "Tidak ada keranjang. Harga hanya ditampilkan sebagai informasi." },
  { figure: "1", unit: "trade-off di setiap hasil.", body: "Setiap rekomendasi menyebut kekurangannya, termasuk saat sedikit melewati budget." },
]

export function TrustBand() {
  return (
    <section aria-labelledby="trust-title" className="py-16 md:py-24">
      <div className="page-container flex flex-col gap-10">
        <Reveal variant="clip">
          <h2 id="trust-title" className="type-display text-text">
            NEXORA bukan toko.
          </h2>
        </Reveal>
        <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
          {promises.map((p, i) => (
            <li key={p.unit}>
              <Reveal delay={0.08 + i * 0.08} innerClassName="flex flex-col gap-3">
                <p className="flex flex-col">
                  <span className="text-[7rem] leading-[0.85] font-extrabold tracking-[-0.06em] text-cobalt-600 tabular-nums md:text-[9rem]">
                    {p.figure}
                  </span>
                  <span className="type-h2 text-text">{p.unit}</span>
                </p>
                <p className="type-body text-text">{p.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
