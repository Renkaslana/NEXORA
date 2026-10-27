"use client"

import * as React from "react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle"
import { CountUp } from "@/components/landing/count-up"
import { Reveal } from "@/components/landing/reveal"
import type { LandingSample } from "@/components/landing/sample-data"
import { NeedMeter } from "@/components/ui/need-meter"
import { formatRupiahShort } from "@/lib/format"
import { DURATION, EASE_OUT } from "@/lib/motion"

// "Budget sama. Kebutuhan bisa berbeda." (brief redesign landing §12; data PRD §16 lewat lib/api.ts).
// Budget tetap Rp8 jt; memilih aktivitas mengganti Garis Kebutuhan, faktor penentu, dan jumlah laptop
// katalog yang lolos ambang. Bukan SAW: hanya perbandingan spek ≥ ambang Profil Kebutuhan mock.

export function InteractiveBudget({ sample }: { sample: LandingSample }) {
  const reduce = useReducedMotion()
  const [activeId, setActiveId] = React.useState(sample.activities[1].id)
  const active = sample.activities.find((a) => a.id === activeId)!
  const fade = reduce
    ? {}
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, transition: { duration: 0.15 } } }

  return (
    <section aria-labelledby="budget-sama-title" className="bg-canvas py-20 md:py-32">
      <div className="page-container grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-8 lg:col-span-5">
          <Reveal variant="clip">
            <h2 id="budget-sama-title" className="text-[2.25rem] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink-strong md:text-[3.5rem]">
              Budget sama. Kebutuhan bisa berbeda.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[34rem] type-body-l text-ink-soft">
              Rp8 juta tidak selalu berarti laptop yang sama untuk setiap orang. Mahasiswa yang coding, mendesain,
              gaming, atau hanya butuh laptop untuk kuliah punya kebutuhan yang berbeda.
            </p>
          </Reveal>

          <Reveal delay={0.16} innerClassName="flex flex-col gap-4">
            <p className="flex items-baseline gap-3">
              <span className="type-small text-ink-soft">Budget</span>
              <span className="text-3xl leading-none font-extrabold tracking-[-0.03em] text-ink-strong tabular-nums">
                {formatRupiahShort(sample.demoBudget)}
              </span>
            </p>
            <div role="group" aria-label="Pilih aktivitas utama" className="flex flex-wrap gap-2">
              {sample.activities.map((a) => {
                const on = a.id === activeId
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setActiveId(a.id)}
                    className={cn(
                      "inline-flex h-11 items-center rounded-[12px] border px-4 type-small transition-[color,background-color,border-color,transform] duration-[var(--motion-fast)] ease-out active:scale-[0.97]",
                      on
                        ? "border-data-blue bg-data-blue text-white"
                        : "border-canvas-line bg-white text-ink-strong hover:-translate-y-0.5 hover:border-ink-soft/40"
                    )}
                  >
                    {a.label}
                  </button>
                )
              })}
            </div>
          </Reveal>
        </div>

        {/* ------------------------------------------------ Panel kebutuhan */}
        <Reveal delay={0.1} className="lg:col-span-7">
          <LayoutGroup>
            <motion.div
              layout={!reduce}
              transition={{ duration: DURATION.slow, ease: EASE_OUT }}
              aria-live="polite"
              className="flex flex-col gap-7 rounded-[24px] border border-canvas-line bg-white p-6 md:p-9"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={`head-${active.id}`} {...fade} transition={{ duration: DURATION.slow, ease: EASE_OUT }} className="flex flex-col gap-1">
                  <p className="type-small text-data-blue">Kebutuhan untuk {active.label.toLowerCase()}</p>
                  <p className="type-h3 text-ink-strong md:text-2xl md:leading-8">{active.summary}</p>
                </motion.div>
              </AnimatePresence>

              <motion.div layout={!reduce} className="flex flex-col gap-4">
                {active.meters.map((m, i) => (
                  <motion.div key={m.key} layout={!reduce} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
                    <NeedMeter component={m.component} scale={m.scale} need={m.need} index={i} size="compact" />
                  </motion.div>
                ))}
              </motion.div>

              <motion.ul layout={!reduce} className="grid gap-2 sm:grid-cols-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {active.factors.map((f, i) => (
                    <motion.li
                      key={`${active.id}-${f}`}
                      {...fade}
                      transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: reduce ? 0 : 0.06 * i }}
                      className="flex gap-2 rounded-[14px] bg-canvas p-3 type-small font-normal text-ink-strong"
                    >
                      <CheckIcon weight="bold" className="mt-0.5 size-4 shrink-0 text-data-blue" aria-hidden="true" />
                      {f}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>

              <motion.div layout={!reduce} className="flex flex-wrap items-end justify-between gap-4 rounded-[18px] bg-canvas p-5">
                <p className="flex items-end gap-3">
                  <CountUp
                    value={active.passCount}
                    duration={0.6}
                    className="text-6xl leading-[0.85] font-extrabold tracking-[-0.05em] text-data-blue tabular-nums"
                  />
                  <span className="type-body text-ink-strong">
                    laptop di katalog contoh
                    <br />
                    memenuhi semuanya
                  </span>
                </p>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p key={`ex-${active.id}`} {...fade} className="max-w-[20rem] type-small font-normal text-ink-soft">
                    {active.example ? (
                      <>
                        Termurah: <span className="font-semibold text-ink-strong">{active.example.name}</span>,{" "}
                        <span className="tabular-nums">{formatRupiahShort(active.example.priceIdr)}</span>
                      </>
                    ) : (
                      <span className="flex gap-2 text-ink-strong">
                        <WarningCircleIcon weight="fill" className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                        {active.note}
                      </span>
                    )}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </LayoutGroup>
        </Reveal>
      </div>
    </section>
  )
}
