import Link from "next/link"
import { ArrowDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowDown"
import { PlayIcon } from "@phosphor-icons/react/dist/ssr/Play"
import { QuestionIcon } from "@phosphor-icons/react/dist/ssr/Question"
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack"
import { TargetIcon } from "@phosphor-icons/react/dist/ssr/Target"
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
    { value: 5, suffix: "", unit: "pertanyaan", text: "untuk memahami kebutuhanmu.", Icon: QuestionIcon },
    { value: sample.breakdown.length, suffix: "+", unit: "faktor", text: "yang dipertimbangkan dalam rekomendasi.", Icon: StackIcon },
    { value: 1, suffix: "", unit: "tujuan", text: "menemukan laptop yang paling cocok untukmu.", Icon: TargetIcon },
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
                <span className="relative isolate inline-block font-extrabold text-teal-600 font-serif italic">
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

      {/* ------------------------------------------------ Fakta + visual perjalanan: satu panel putih (referensi Fahren) */}
      <div className="mt-20 bg-data-blue/[0.035] pt-14 pb-10 md:mt-28 md:pt-20 md:pb-12">
        <div className="page-container">
          <Reveal>
            <div className="grid overflow-hidden rounded-[28px] border border-canvas-line bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,0.5fr)]">
              <ul
                className="grid divide-y divide-canvas-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-6 lg:py-8" // taste-skill-ignore: pemisah antarfakta sesuai referensi Fahren
              >
                {facts.map((f, i) => (
                  <li key={f.unit} className="px-6 py-6 sm:py-2 md:px-7">
                    <Reveal delay={0.1 + 0.09 * i} innerClassName="flex gap-4">
                      <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-data-blue/[0.08] text-data-blue">
                        <f.Icon weight="bold" className="size-[22px]" />
                      </span>
                      <p className="flex flex-col">
                        <span className="sr-only">{`${f.value}${f.suffix} ${f.unit} ${f.text}`}</span>
                        <CountUp
                          value={f.value}
                          suffix={f.suffix}
                          duration={0.9}
                          className="text-[3.5rem] leading-[0.9] font-extrabold tracking-[-0.06em] text-ink-strong tabular-nums md:text-[4rem]"
                        />
                        <span aria-hidden="true" className="mt-2 text-lg leading-6 font-extrabold tracking-[-0.02em] text-ink-strong">
                          {f.unit}
                        </span>
                        <span aria-hidden="true" className="mt-1 type-small font-normal text-ink-soft">
                          {f.text}
                        </span>
                      </p>
                    </Reveal>
                  </li>
                ))}
              </ul>
              <JourneyVisual className="min-h-[13rem] sm:min-h-[16rem] lg:min-h-0" />
            </div>
          </Reveal>

          <Link href="#mulai" className="group mx-auto mt-6 flex w-fit flex-col items-center gap-2 type-small font-medium text-ink-strong">
            <span className="flex size-9 items-center justify-center rounded-full border border-canvas-line bg-white transition-colors duration-300 group-hover:border-data-blue group-hover:text-data-blue">
              <ArrowDownIcon weight="bold" className="size-4 transition-transform duration-300 ease-out group-hover:translate-y-0.5" aria-hidden="true" />
            </span>
            Lanjut ke rekomendasi
          </Link>
        </div>
      </div>
    </section>
  )
}
