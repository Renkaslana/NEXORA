import Link from "next/link"
import { FileTextIcon } from "@phosphor-icons/react/dist/ssr/FileText"
import { PlayIcon } from "@phosphor-icons/react/dist/ssr/Play"
import { ScalesIcon } from "@phosphor-icons/react/dist/ssr/Scales"
import { ShoppingCartSimpleIcon } from "@phosphor-icons/react/dist/ssr/ShoppingCartSimple"
import { CountUp } from "@/components/landing/count-up"
import { JourneyVisual, LaptopVisual, SengajaUnderline } from "@/components/landing/not-a-store-visuals"
import { Reveal } from "@/components/landing/reveal"
import type { LandingSample } from "@/components/landing/sample-data"

// "SPECO bukan toko. Dan itu memang sengaja." (brief SPECO_Section_Redesign + referensi Fahren, Okt 2026; PRD §27).
// Editorial: pernyataan sebesar hero + visual laptop (aset Fahren) → tiga prinsip → fakta produk + visual
// perjalanan kuliah (aset Fahren) di bidang biru sangat tipis. Fakta = hal yang memang benar di produk
// (jumlah pertanyaan Wizard, jumlah kriteria dari mock, satu tujuan), bukan statistik bisnis karangan.
// Server Component; gerak hanya di `not-a-store-visuals.tsx`, `Reveal`, dan `CountUp`.

const PRINCIPLES = [
  {
    title: "Tidak menjual.",
    body: "Kami tidak memiliki stok atau menjual laptop, sehingga tidak ada brand yang membayar untuk diprioritaskan.",
    Icon: ShoppingCartSimpleIcon,
    crossed: true,
  },
  {
    title: "Tidak berpihak.",
    body: "Rekomendasi ditentukan oleh kebutuhanmu, bukan kepentingan brand tertentu.",
    Icon: ScalesIcon,
  },
  {
    title: "Tidak membingungkan.",
    body: "Kami menyederhanakan spesifikasi teknis menjadi penjelasan yang jelas dan mudah dipahami.",
    Icon: FileTextIcon,
  },
]

const HEADLINE = "text-[clamp(2.75rem,12vw,3.75rem)] leading-[0.95] tracking-[-0.05em] text-ink-strong md:text-[clamp(3.25rem,8vw,4.5rem)] lg:text-[clamp(3.5rem,6vw,5.5rem)]"

export function NotAStore({ sample }: { sample: LandingSample }) {
  const facts = [
    { value: 5, suffix: "", unit: "pertanyaan", text: "untuk memahami kebutuhanmu." },
    { value: sample.breakdown.length, suffix: "+", unit: "faktor", text: "yang dipertimbangkan dalam rekomendasi." },
    { value: 1, suffix: "", unit: "tujuan", text: "menemukan laptop yang paling cocok untukmu." },
  ]

  return (
    <section id="tentang" aria-labelledby="tentang-title" className="scroll-mt-24 bg-white">
      {/* ------------------------------------------------ Pernyataan + visual laptop */}
      <div className="page-container pt-20 md:pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-8 lg:col-span-7">
            <Reveal>
              <p className="inline-flex items-center gap-2.5 rounded-full border border-canvas-line bg-white px-3.5 py-1.5 type-micro font-semibold tracking-[0.08em] text-ink-strong uppercase">
                <span aria-hidden="true" className="size-2 rounded-full bg-data-blue" />
                Kenapa SPECO berbeda?
              </p>
            </Reveal>

            <h2 id="tentang-title" className="sr-only">
              SPECO bukan toko. Dan itu memang sengaja.
            </h2>
            {/* Baris judul muncul berurutan (opacity + translateY 24 px, jeda 80 ms). Kontras bobot: 800 vs 400. */}
            <div aria-hidden="true" className={HEADLINE}>
              <Reveal>
                <span className="block font-extrabold">SPECO</span>
              </Reveal>
              <Reveal delay={0.08}>
                <span className="block font-extrabold">bukan toko.</span>
              </Reveal>
              <Reveal delay={0.16}>
                <span className="block pt-[0.06em] font-normal tracking-[-0.045em]">Dan itu memang</span>
              </Reveal>
              <Reveal delay={0.24}>
                <span className="relative isolate inline-block font-extrabold text-data-blue">
                  sengaja.
                  <SengajaUnderline />
                </span>
              </Reveal>
            </div>

            <Reveal delay={0.3} innerClassName="flex flex-col gap-6">
              <p className="max-w-[28rem] type-body-l text-ink-strong">
                Kami tidak menjual laptop. Kami membantu kamu memahami dan memilih laptop yang benar-benar cocok dengan
                kebutuhanmu.
              </p>
              <Link href="#cara-kerja" className="group inline-flex min-h-11 items-center gap-3 self-start type-body font-semibold text-ink-strong">
                <span className="flex size-10 items-center justify-center rounded-full bg-data-blue/[0.08] text-data-blue transition-transform duration-300 ease-out group-hover:scale-105">
                  <PlayIcon weight="fill" className="size-3.5 translate-x-px" aria-hidden="true" />
                </span>
                Lihat bagaimana SPECO bekerja
              </Link>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <LaptopVisual />
          </div>
        </div>

        {/* ------------------------------------------------ Tiga prinsip */}
        <ul className="mt-16 grid gap-4 md:mt-24 lg:grid-cols-3 lg:gap-6">
          {PRINCIPLES.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={0.09 * i} className="h-full">
                <article className="group flex h-full flex-col gap-5 rounded-[22px] border border-canvas-line bg-white p-6 transition-[transform,border-color,background-color,box-shadow] duration-[400ms] ease-out hover:-translate-y-1 hover:border-data-blue/35 hover:bg-data-blue/[0.025] hover:shadow-[0_18px_36px_-28px_rgba(18,56,245,0.45)] md:p-7" /* taste-skill-ignore: bayangan hanya saat hover (brief §9) */>
                  <div className="flex items-start justify-between">
                    <span className="relative flex size-12 items-center justify-center rounded-[14px] bg-canvas text-ink-strong transition-colors duration-[400ms] ease-out group-hover:bg-data-blue/10 group-hover:text-data-blue">
                      <p.Icon weight="regular" className="size-6" aria-hidden="true" />
                      {p.crossed && (
                        <span aria-hidden="true" className="absolute h-[2px] w-7 rotate-45 rounded-full bg-current ring-2 ring-canvas transition-[box-shadow] duration-[400ms] group-hover:ring-transparent" />
                      )}
                    </span>
                    <span className="type-small font-semibold text-ink-soft tabular-nums transition-colors duration-[400ms] group-hover:text-data-blue">
                      {String(i + 1).padStart(2, "0") /* taste-skill-ignore: penomoran prinsip dari referensi Fahren */}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[1.375rem] leading-7 font-extrabold tracking-[-0.025em] text-ink-strong">{p.title}</h3>
                    <p className="type-body text-ink-soft">{p.body}</p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>

      {/* ------------------------------------------------ Fakta + visual perjalanan (bidang biru sangat tipis) */}
      <div className="mt-20 bg-data-blue/[0.035] py-16 md:mt-28 md:py-24">
        <div className="page-container grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6 lg:col-span-6">
            {facts.map((f, i) => (
              <li key={f.unit}>
              <Reveal delay={0.09 * i}>
                <p className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-end gap-x-5 sm:flex sm:flex-col sm:items-start sm:gap-4">
                  <span className="sr-only">{`${f.value}${f.suffix} ${f.unit} ${f.text}`}</span>
                  <span aria-hidden="true">
                    <CountUp
                      value={f.value}
                      suffix={f.suffix}
                      duration={0.9}
                      className="text-[4.5rem] leading-[0.85] font-extrabold tracking-[-0.06em] text-ink-strong tabular-nums lg:text-[5.5rem]"
                    />
                  </span>
                  <span aria-hidden="true" className="flex flex-col gap-1">
                    <span className="text-xl leading-7 font-extrabold tracking-[-0.02em] text-ink-strong">{f.unit}</span>
                    <span className="type-body text-ink-soft">{f.text}</span>
                  </span>
                </p>
              </Reveal>
              </li>
            ))}
          </ul>
          <div className="lg:col-span-6">
            <JourneyVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
