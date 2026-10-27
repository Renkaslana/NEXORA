import { CountUp } from "@/components/landing/count-up"
import { Reveal } from "@/components/landing/reveal"
import type { LandingSample } from "@/components/landing/sample-data"

// "SPECO bukan toko. Dan itu memang sengaja." (brief redesign landing §18–19; PRD §27). Pernyataan
// besar + fakta produk yang memang benar (jumlah pertanyaan Wizard, jumlah kriteria penilaian dari mock,
// satu Best Match), bukan statistik bisnis karangan.

export function NotAStore({ sample }: { sample: LandingSample }) {
  const facts = [
    { value: 5, label: "pertanyaan untuk memahami kebutuhanmu" },
    { value: sample.breakdown.length, label: "kriteria penilaian, dengan bobot dari prioritasmu" },
    { value: 1, label: "Best Match yang dijelaskan, lengkap dengan alternatif dan trade-off" },
  ]

  return (
    <section id="tentang" aria-labelledby="tentang-title" className="scroll-mt-24 bg-white py-20 md:py-32">
      <div className="page-container flex flex-col gap-16 md:gap-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-12">
            <Reveal variant="clip">
              <h2 id="tentang-title" className="text-[2.75rem] leading-[1] font-extrabold tracking-[-0.05em] text-ink-strong md:text-[4.5rem]">
                SPECO bukan toko.
              </h2>
            </Reveal>
            <Reveal variant="clip" delay={0.1}>
              <p className="text-[2.75rem] leading-[1] font-extrabold tracking-[-0.05em] text-ink-soft md:text-[4.5rem]">
                Dan itu memang sengaja.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.16} className="lg:col-span-5 lg:col-start-8">
            <p className="type-body-l text-ink-strong">
              Kami tidak menjual laptop atau mendorongmu memilih produk tertentu. Tidak ada iklan, promo, atau komisi.
              SPECO membantu membandingkan pilihan berdasarkan kebutuhan dan prioritasmu, dan selalu menyebut
              kekurangannya.
            </p>
          </Reveal>
        </div>

        <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
          {facts.map((f, i) => (
            <li key={f.label}>
              <Reveal delay={0.08 * i} innerClassName="flex flex-col gap-3">
                <p aria-label={`${f.value} ${f.label}`} className="flex flex-col gap-3">
                  <CountUp
                    value={f.value}
                    duration={0.9}
                    className="text-[5.5rem] leading-[0.8] font-extrabold tracking-[-0.06em] text-ink-strong tabular-nums md:text-[7rem]"
                  />
                  <span aria-hidden="true" className="max-w-[16rem] type-body-l text-ink-soft">
                    {f.label}
                  </span>
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
