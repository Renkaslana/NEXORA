import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { CtaPhotoMobile, CtaScene } from "@/components/landing/final-cta-scene"
import { Reveal } from "@/components/landing/reveal"
import { Button } from "@/components/ui/button"

// CTA akhir (brief REDESIGN CTA SECTION + referensi Fahren, Okt 2026): pernyataan penutup, bukan banner promosi.
// Satu bidang foto (langit + arsitektur putih + laptop di alas, aset Fahren) dengan teks rata tengah di langit:
// label SPECO → eyebrow → judul (fokus) → deskripsi → tombol kuning → info singkat. Desktop: foto menutup
// bidang, laptop di tengah bawah. Mobile: teks → tombol → foto sebagai blok → info. Gerak foto di `CtaScene`.

const BENEFITS = [
  { title: "Hanya 5 pertanyaan", note: "Sekitar 2 menit" },
  { title: "Gratis digunakan", note: "Tanpa biaya apa pun" },
  { title: "Tanpa akun", note: "Langsung lihat hasil" },
]

export function FinalCta() {
  return (
    <section id="mulai" aria-labelledby="cta-title" className="scroll-mt-20 bg-canvas px-3 pb-3 sm:px-6 lg:px-10">
      <CtaScene>
        <div className="flex flex-col items-center px-5 pt-12 pb-8 text-center sm:px-10 md:pt-16 lg:pt-11 lg:pb-0">
          <Reveal>
            <p className="flex flex-col items-center gap-3 text-sm font-bold tracking-[0.42em] text-ink-strong uppercase">
              <span className="pl-[0.42em]">SPECO</span>
              <span aria-hidden="true" className="h-[2px] w-7 rounded-full bg-ink-strong/25" />
            </p>
          </Reveal>
          <Reveal delay={0.05} className="mt-6 lg:mt-5">
            <p className="pl-[0.32em] type-micro font-semibold tracking-[0.32em] text-data-blue uppercase">Siap memulai?</p>
          </Reveal>
          <Reveal delay={0.1} className="mt-4">
            <h2
              id="cta-title"
              className="text-[2rem] leading-[1.06] font-extrabold tracking-[-0.045em] text-balance text-ink-strong sm:text-[2.5rem] md:text-[3.25rem] lg:text-[4rem]"
            >
              Sudah siap menemukan <span className="text-data-blue lg:block">laptop yang <span className="whitespace-nowrap">benar-benar</span> cocok?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.18} className="mt-5">
            <p className="max-w-[34rem] type-body-l text-balance text-ink-strong/85">
              Jawab 5 pertanyaan sederhana, dan biarkan SPECO membantu menemukan rekomendasi yang sesuai dengan
              kebutuhanmu.
            </p>
          </Reveal>
          <Reveal delay={0.26} className="mt-8 lg:mt-7">
            <Button
              asChild
              variant="signal"
              size="lg"
              className="rounded-[14px] transition-[background-color,transform,box-shadow] duration-[250ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-14px_rgba(17,17,17,0.45)] hover:[&_[data-arrow]]:translate-x-1.5 active:translate-y-0 active:scale-[0.97] [&_[data-arrow]]:transition-transform [&_[data-arrow]]:duration-[250ms]" // taste-skill-ignore: bayangan tombol hanya saat hover (brief CTA)
            >
              <Link href="/rekomendasi/budget">
                Mulai Rekomendasi <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>

          <CtaPhotoMobile />

          <Reveal delay={0.34} className="mt-8 w-full lg:mt-7 lg:w-auto">
            <ul
              className="grid gap-4 text-left sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-ink-strong/15 lg:text-left" // taste-skill-ignore: pemisah info sesuai referensi Fahren
            >
              {BENEFITS.map((b) => (
                <li key={b.title} className="flex flex-col items-center gap-0.5 sm:px-8">
                  <span className="type-small font-semibold text-ink-strong">{b.title}</span>
                  <span className="type-small font-normal text-ink-strong/70">{b.note}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </CtaScene>
    </section>
  )
}
