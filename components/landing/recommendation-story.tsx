"use client"

import * as React from "react"
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react"
import { cn } from "cn"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle"
import { SealCheckIcon } from "@phosphor-icons/react/dist/ssr/SealCheck"
import { Reveal } from "@/components/landing/reveal"
import type { LandingSample } from "@/components/landing/sample-data"
import { LaptopRender } from "@/components/ui/laptop-render"
import { NeedMeter } from "@/components/ui/need-meter"
import { formatRupiah, formatRupiahShort } from "@/lib/format"
import { DURATION, EASE_OUT } from "@/lib/motion"

// "Dari jawabanmu, kami menemukan kecocokan." (brief redesign landing §15 + §23; PRD §17, §27).
// Satu-satunya section sticky: di lg+ langkah Budget → Kebutuhan → Aplikasi → Penilaian → Rekomendasi
// aktif mengikuti scroll, dan kartu rekomendasi yang menempel menyala bertahap sampai skor naik ke
// nilai mock. Di bawah lg & reduced motion: blok statis (dipilih lewat CSS agar tanpa beda server/klien).
// Skor diambil apa adanya dari hasil mock; frontend tidak menghitung SAW.

type Sample = LandingSample

function steps(s: Sample) {
  return [
    { title: "Budget", body: `${formatRupiahShort(s.profile.budget)}, boleh lebih sedikit bila sepadan.` },
    { title: "Kebutuhan", body: s.requirementSummary },
    { title: "Aplikasi", body: `${s.profile.activityLabel}: ${s.profile.softwareLabels.join(", ")}.` },
    { title: "Penilaian", body: `Setiap laptop dinilai pada ${s.breakdown.length} kriteria, dengan bobot dari prioritasmu.` },
    { title: "Rekomendasi", body: "Laptop dengan skor tertinggi jadi Best Match, lengkap dengan alasannya." },
  ]
}

/** Skor kecocokan: angka + bar, naik dari 0 dalam ±1 detik saat `run`. */
function MatchScore({ value, run }: { value: number; run: boolean }) {
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => `${Math.round(v)}%`)
  const scaleX = useTransform(mv, (v) => v / 100)
  React.useEffect(() => {
    if (reduce) {
      mv.set(run ? value : 0)
      return
    }
    const controls = animate(mv, run ? value : 0, { duration: run ? 1.1 : 0.3, ease: EASE_OUT })
    return () => controls.stop()
  }, [run, value, reduce, mv])
  return (
    <div className="flex flex-col gap-2" role="img" aria-label={run ? `Kecocokan ${value} persen` : "Skor belum dihitung"}>
      <div className="flex items-baseline justify-between" aria-hidden="true">
        <span className="type-small text-slate-500 font-semibold">Skor Kecocokan</span>
        <motion.span className="text-5xl leading-none font-extrabold tracking-[-0.05em] text-teal-700 tabular-nums">{text}</motion.span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <motion.div className="h-full origin-left rounded-full bg-teal-600" style={{ scaleX }} />
      </div>
    </div>
  )
}

/** Kartu rekomendasi; bagian yang belum dicapai redup, tapi ruangnya tetap (tanpa geser layout). */
function RecCard({ sample, stage }: { sample: Sample; stage: number }) {
  const { laptop } = sample.best
  const lit = (n: number) => (stage >= n ? "opacity-100" : "opacity-25")
  return (
    <div className="flex flex-col overflow-hidden rounded-[24px] border border-canvas-line bg-white">
      <div className="relative">
        <LaptopRender image={laptop.image} sizes="(min-width: 1024px) 32vw, 90vw" className="aspect-[2/1] lg:aspect-[3/1]" />
        <motion.span
          initial={false}
          animate={{ opacity: stage >= 4 ? 1 : 0, y: stage >= 4 ? 0 : 6 }}
          transition={{ duration: DURATION.medium, ease: EASE_OUT }}
          className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-data-blue px-2.5 py-1 type-micro text-white"
        >
          <SealCheckIcon weight="fill" className="size-3.5" aria-hidden="true" /> Best Match
        </motion.span>
      </div>
      <div className="flex flex-col gap-3.5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="type-h3 text-ink-strong">{laptop.name}</p>
            <p className={cn("type-small text-ink-soft tabular-nums transition-opacity duration-500", lit(0))}>
              {formatRupiah(laptop.priceIdr)} · <span className="text-success">masuk budget</span>
            </p>
          </div>
        </div>

        <div className={cn("flex flex-col gap-3 transition-opacity duration-500", lit(1))}>
          {sample.best.meters.map((m, i) => (
            <NeedMeter key={m.key} component={m.component} scale={m.scale} need={m.need} value={m.value} index={i} size="mini" />
          ))}
        </div>

        <ul className={cn("flex flex-wrap gap-1.5 transition-opacity duration-500", lit(2))} aria-label="Aplikasi yang diperhitungkan">
          {sample.profile.softwareLabels.map((s) => (
            <li key={s} className="rounded-full bg-canvas px-2.5 py-1 type-micro font-medium tracking-normal text-ink-strong">
              {s}
            </li>
          ))}
        </ul>

        <div className={cn("transition-opacity duration-500", lit(3))}>
          <MatchScore value={sample.best.matchScore} run={stage >= 3} />
        </div>

        <ul className={cn("flex flex-col gap-1.5 transition-opacity duration-500", lit(4))}>
          {sample.best.reasons.map((r) => (
            <li key={r} className="flex gap-2 type-small font-normal text-ink-strong">
              <CheckCircleIcon weight="fill" className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function StepList({ sample, stage, onPick }: { sample: Sample; stage: number; onPick?: (i: number) => void }) {
  return (
    <ol className="flex flex-col gap-1">
      {steps(sample).map((s, i) => {
        const on = i === stage
        const done = i < stage
        return (
          <li key={s.title} aria-current={on ? "step" : undefined} className="relative pl-6">
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-2 bottom-2 left-0 w-1 rounded-full transition-colors duration-[var(--motion-medium)]",
                on ? "bg-data-blue" : done ? "bg-ink-strong/25" : "bg-canvas-line"
              )}
            />
            <button
              type="button"
              tabIndex={onPick ? 0 : -1}
              onClick={() => onPick?.(i)}
              className={cn(
                "flex w-full flex-col gap-1 py-3 text-left transition-opacity duration-[var(--motion-medium)]",
                on ? "opacity-100" : "opacity-45 hover:opacity-80",
                !onPick && "pointer-events-none"
              )}
            >
              <span className="text-2xl leading-8 font-extrabold tracking-[-0.03em] text-ink-strong md:text-[1.75rem]">{s.title}</span>
              <span
                className={cn(
                  "grid transition-[grid-template-rows] duration-[var(--motion-slow)] ease-out",
                  on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <span className="overflow-hidden type-body text-ink-soft">{s.body}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export function RecommendationStory({ sample }: { sample: Sample }) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const staticRef = React.useRef<HTMLDivElement>(null)
  const staticInView = useInView(staticRef, { once: true, amount: 0.3 })
  const [stage, setStage] = React.useState(0)
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end end"] })
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(4, Math.max(0, Math.floor(v * 5.2)))
    setStage((prev) => (prev === next ? prev : next))
  })

  // Klik langkah: gulir ke posisi langkah itu di wrapper ter-pin.
  const pick = (i: number) => {
    const el = wrapperRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const range = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + (range * (i + 0.5)) / 5.2, behavior: "smooth" })
  }

  const header = (
    <div className="flex max-w-[40rem] flex-col gap-4">
      <Reveal variant="clip">
        <h2 id="rekomendasi-title" className="text-[2.25rem] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink-strong md:text-[3.5rem]">
          Dari jawabanmu, kami menemukan <span className="italic font-serif text-teal-600 font-normal">kecocokan.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="type-body-l text-ink-soft">
          Contoh untuk mahasiswa {sample.profile.majorLabel} dengan budget {formatRupiahShort(sample.profile.budget)}: dari{" "}
          {sample.catalogSize} laptop di katalog contoh, {sample.resultCount} cocok, dan satu jadi Best Match.
        </p>
      </Reveal>
    </div>
  )

  return (
    <section id="rekomendasi" aria-labelledby="rekomendasi-title" className="scroll-mt-24 bg-white">
      {/* ------------------------------------------------ Ter-pin: md+ tanpa reduced motion */}
      <div ref={wrapperRef} className="relative hidden h-[300vh] tall:block">
        <div className="sticky top-0 flex h-svh items-center pt-20 pb-6">
          <div className="page-container grid items-center gap-10 lg:grid-cols-12">
            <div className="flex flex-col gap-10 lg:col-span-6">
              {header}
              <StepList sample={sample} stage={stage} onPick={pick} />
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <RecCard sample={sample} stage={stage} />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ Statis: mobile, layar pendek, & reduced motion */}
      <div ref={staticRef} className="page-container grid gap-10 py-20 tall:hidden lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-28">
        <div className="flex flex-col gap-10 lg:col-span-6">
          {header}
          <ol className="flex flex-col gap-4">
            {steps(sample).map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span aria-hidden="true" className="text-2xl leading-8 font-extrabold text-data-blue tabular-nums">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <h3 className="type-h3 text-ink-strong">{s.title}</h3>
                  <p className="type-body text-ink-soft">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <RecCard sample={sample} stage={staticInView ? 4 : 0} />
        </div>
      </div>
    </section>
  )
}
