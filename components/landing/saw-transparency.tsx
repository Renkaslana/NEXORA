"use client"

import * as React from "react"
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { Reveal } from "@/components/landing/reveal"
import type { LandingSample } from "@/components/landing/sample-data"
import { ScoreExplainer } from "@/components/results/score-explainer"
import { Button } from "@/components/ui/button"
import { DURATION, EASE_OUT } from "@/lib/motion"

// "Kenapa laptop ini direkomendasikan?" (brief redesign landing §16, §24; PRD §27 explainability).
// Bobot dan skor per kriteria diambil apa adanya dari hasil mock Best Match (lewat lib/api.ts); frontend
// tidak menjumlah atau menghitung SAW. Bar bobot naik bertahap saat masuk layar; hover/fokus/ketuk
// sebuah kriteria menampilkan penjelasan singkatnya.

export function SawTransparency({ sample }: { sample: LandingSample }) {
  const reduce = useReducedMotion()
  const listRef = React.useRef<HTMLUListElement>(null)
  const inView = useInView(listRef, { once: true, amount: 0.35 })
  const [focused, setFocused] = React.useState<string | null>(null)
  const max = Math.max(...sample.breakdown.map((b) => b.weight))

  return (
    <section id="transparansi" aria-labelledby="transparansi-title" className="scroll-mt-24 bg-canvas py-20 md:py-32">
      <div className="page-container grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Reveal variant="clip">
            <h2 id="transparansi-title" className="text-[2.25rem] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink-strong md:text-[3.5rem]">
              Kenapa laptop ini direkomendasikan?
            </h2>
          </Reveal>
          <Reveal delay={0.08} innerClassName="flex flex-col gap-4">
            <p className="max-w-[30rem] type-body-l text-ink-soft">
              Setiap kriteria punya bobot. Yang kamu prioritaskan dapat bobot lebih besar, jadi pengaruhnya ke skor
              akhir juga lebih besar.
            </p>
            <p className="type-body text-ink-strong">
              Contoh: <span className="font-semibold">{sample.best.laptop.name}</span> mendapat{" "}
              <span className="font-bold text-data-blue tabular-nums">{sample.best.matchScore}%</span> kecocokan untuk
              mahasiswa {sample.profile.majorLabel}.
            </p>
            <ScoreExplainer
              example={sample.best.result}
              exampleName={sample.best.laptop.name}
              trigger={
                <Button variant="link" className="self-start text-data-blue">
                  Pelajari cara perhitungannya <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
                </Button>
              }
            />
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="mb-3 grid grid-cols-[8.5rem_minmax(0,1fr)_3rem] gap-4 type-micro font-medium tracking-normal text-ink-soft md:grid-cols-[10rem_minmax(0,1fr)_3.5rem]">
            <span>Kriteria</span>
            <span>Bobot</span>
            <span className="text-right">%</span>
          </div>
          <ul ref={listRef} className="flex flex-col gap-1.5" onMouseLeave={() => setFocused(null)}>
            {sample.breakdown.map((b, i) => {
              const open = focused === b.criterion
              return (
                <li key={b.criterion}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`hint-${b.criterion}`}
                    onMouseEnter={() => setFocused(b.criterion)}
                    onFocus={() => setFocused(b.criterion)}
                    onBlur={() => setFocused((f) => (f === b.criterion ? null : f))}
                    onClick={() => setFocused((f) => (f === b.criterion ? null : b.criterion))}
                    className={cn(
                      "grid w-full grid-cols-[8.5rem_minmax(0,1fr)_3rem] items-center gap-4 rounded-[14px] px-3 py-3 text-left transition-colors duration-[var(--motion-fast)] md:grid-cols-[10rem_minmax(0,1fr)_3.5rem]",
                      open ? "bg-white" : "hover:bg-white/60"
                    )}
                  >
                    <span className="type-body font-semibold text-ink-strong">{b.label}</span>
                    <span className="h-2.5 overflow-hidden rounded-full bg-canvas-line/60" aria-hidden="true">
                      <motion.span
                        className="block h-full origin-left rounded-full bg-data-blue"
                        style={{ width: `${(b.weight / max) * 100}%` }}
                        initial={reduce ? false : { scaleX: 0 }}
                        animate={{ scaleX: reduce || inView ? 1 : 0 }}
                        transition={{ duration: 0.9, ease: EASE_OUT, delay: reduce ? 0 : 0.08 * i }}
                      />
                    </span>
                    <span className="text-right type-body font-bold text-ink-strong tabular-nums">{b.weight}%</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.p
                        id={`hint-${b.criterion}`}
                        role="note"
                        initial={reduce ? false : { opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={reduce ? undefined : { opacity: 0, y: -4, height: 0 }}
                        transition={{ duration: DURATION.medium, ease: EASE_OUT }}
                        className="overflow-hidden px-3 type-small font-normal text-ink-soft"
                      >
                        <span className="block pt-1 pb-3">
                          {b.hint} Skor {sample.best.laptop.name} untuk kriteria ini:{" "}
                          <span className="font-semibold text-ink-strong tabular-nums">{b.score}/100</span>.
                        </span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 px-3 type-micro font-medium tracking-normal text-ink-soft">
            Bobot contoh dari data demo; perhitungan asli dilakukan server NEXORA.
          </p>
        </div>
      </div>
    </section>
  )
}
