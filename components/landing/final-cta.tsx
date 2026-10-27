import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { HERO_TIERS } from "@/components/landing/hero-tiers"
import { Reveal } from "@/components/landing/reveal"
import { Button } from "@/components/ui/button"

// CTA akhir (brief redesign landing §20): satu-satunya bidang biru penuh di landing, sebagai penutup
// cerita. Tombol kuning = aksi utama. Foto laptop kecil dari render hero kisaran Rp10–15 jt.

export function FinalCta() {
  const tier = HERO_TIERS["10-15"]
  return (
    <section aria-labelledby="cta-title" data-tone="cobalt" className="bg-canvas px-3 pb-3 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-[1240px] items-center gap-10 overflow-hidden rounded-[28px] bg-data-blue px-6 py-14 text-white md:px-12 md:py-20 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col items-start gap-6 lg:col-span-7">
          <Reveal variant="clip">
            <h2 id="cta-title" className="text-[2.25rem] leading-[1.02] font-extrabold tracking-[-0.045em] md:text-[3.5rem]">
              Sudah tahu laptop yang kamu butuhkan?
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[32rem] type-body-l text-white/85">
              Biarkan SPECO membantu menemukan pilihan yang paling sesuai. Lima pertanyaan, tanpa akun.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <Button
              asChild
              variant="signal"
              size="lg"
              className="rounded-[14px] transition-[background-color,transform] duration-[var(--motion-medium)] hover:scale-[1.015] hover:[&_[data-arrow]]:translate-x-1 active:scale-[0.98]"
            >
              <Link href="/rekomendasi/budget">
                Mulai Rekomendasi <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
        </div>
        <Reveal delay={0.12} className="lg:col-span-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={tier.src} alt={tier.alt} fill sizes="(min-width: 1024px) 34vw, 90vw" quality={90} className="object-cover" style={{ objectPosition: "68% 72%" }} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
