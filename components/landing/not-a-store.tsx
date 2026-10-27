import Link from "next/link"
import { PlayIcon } from "@phosphor-icons/react/dist/ssr/Play"
import { CountUp } from "@/components/landing/count-up"
import { JourneyVisual, LaptopVisual, Principles, SengajaUnderline } from "@/components/landing/not-a-store-visuals"
import { Reveal } from "@/components/landing/reveal"
import type { LandingSample } from "@/components/landing/sample-data"

// "SPECO bukan toko. Dan itu memang sengaja." (brief SPECO_Section_Redesign + referensi Fahren, Okt 2026; PRD §27).
// Editorial: pernyataan sebesar hero yang menyatu dengan visual laptop (aset Fahren, glow tipis + 3 anotasi) →
// tiga prinsip (tautan ke bukti di halaman) → fakta produk + visual perjalanan kuliah (aset Fahren, menembus
// ke tepi kanan) di bidang biru sangat tipis. Fakta = hal yang memang benar di produk
// (jumlah pertanyaan Wizard, jumlah kriteria dari mock, satu tujuan), bukan statistik bisnis karangan.
// Server Component; gerak hanya di `not-a-store-visuals.tsx`, `Reveal`, dan `CountUp`.

const HEADLINE = "text-[clamp(2.75rem,12vw,3.75rem)] leading-[0.95] tracking-[-0.05em] text-ink-strong md:text-[clamp(3.25rem,8vw,4.5rem)] lg:text-[clamp(3.5rem,6vw,5.5rem)]"

export function NotAStore({ sample }: { sample: LandingSample }) {
  const facts = [
    { value: 5, suffix: "", unit: "pertanyaan", text: "untuk memahami kebutuhanmu." },
    { value: sample.breakdown.length, suffix: "+", unit: "faktor", text: "yang dipertimbangkan dalam rekomendasi." },
    { value: 1, suffix: "", unit: "tujuan", text: "menemukan laptop yang paling cocok untukmu." },
  ]

  return (
    <section id="tentang" aria-labelledby="tentang-title" className="scroll-mt-24 overflow-x-clip bg-white">
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

          {/* Visual digeser ke arah judul (sedikit menumpuk ke tengah) dan diperbesar. */}
          <div className="lg:col-span-5 lg:-mr-6 lg:-ml-24">
            <LaptopVisual />
          </div>
        </div>

        {/* ------------------------------------------------ Tiga prinsip */}
        <div className="mt-16 md:mt-24">
          <Principles />
        </div>
      </div>

      {/* ------------------------------------------------ Fakta + visual perjalanan (bidang biru sangat tipis) */}
      <div className="mt-20 overflow-hidden bg-data-blue/[0.035] py-16 md:mt-28 md:py-24">
        <div className="page-container grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6 lg:col-span-5 lg:grid-cols-1 lg:gap-10">
            {facts.map((f, i) => (
              <li key={f.unit}>
              <Reveal delay={0.09 * i}>
                <p className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-end gap-x-5 sm:flex sm:flex-col sm:items-start sm:gap-4 lg:grid lg:grid-cols-[7.5rem_minmax(0,1fr)] lg:items-center lg:gap-x-6">
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
          {/* Visual lebih besar dan menembus sampai tepi kanan layar (lg+), agar menyatu dengan bidang. */}
          <div className="lg:col-span-7 lg:mr-[calc((min(100vw,1248px)-100vw)/2-1.5rem)]">
            <JourneyVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
