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
import { PERSONA_WEIGHTS } from "@/lib/spk-saw"

const PERSONA_TABS = [
  { id: "informatika", label: "Profil Coding / TI" },
  { id: "desain", label: "Profil Desain / DKV" },
  { id: "umum", label: "Profil Kuliah & Riset" },
  { id: "gaming_teknik", label: "Profil Gaming / 3D" },
]

export function SawTransparency({ sample }: { sample: LandingSample }) {
  const reduce = useReducedMotion()
  const listRef = React.useRef<HTMLUListElement>(null)
  const inView = useInView(listRef, { once: true, amount: 0.35 })
  const [focused, setFocused] = React.useState<string | null>(null)
  const [activePersona, setActivePersona] = React.useState("informatika")

  const currentWeights = React.useMemo(() => {
    const pw = PERSONA_WEIGHTS[activePersona]?.weights
    if (!pw) return sample.breakdown

    return [
      { criterion: "performa", label: "Performa CPU & GPU", weight: Math.round(pw.c1_cpu_gpu * 100), score: 88, hint: "Diukur dari benchmark multi-core dan kartu grafis." },
      { criterion: "harga", label: "Sesuai Budget", weight: Math.round(pw.c6_price * 100), score: 92, hint: "Kriteria cost: harga terjangkau bernilai optimal." },
      { criterion: "ram", label: "Kapasitas RAM", weight: Math.round(pw.c2_ram * 100), score: 90, hint: "Kapasitas RAM dan opsi upgradability." },
      { criterion: "penyimpanan", label: "Storage NVMe", weight: Math.round(pw.c3_storage * 100), score: 85, hint: "Kapasitas SSD NVMe untuk OS dan aplikasi kuliah." },
      { criterion: "portabilitas", label: "Portabilitas", weight: Math.round(pw.c5_portability * 100), score: 80, hint: "Bobot ringan dan daya tahan baterai." },
      { criterion: "layar", label: "Kualitas Layar", weight: Math.round(pw.c4_display * 100), score: 78, hint: "Akurasi warna panel sRGB / IPS." },
    ]
  }, [activePersona, sample.breakdown])

  const max = Math.max(...currentWeights.map((b) => b.weight))

  return (
    <section id="transparansi" aria-labelledby="transparansi-title" className="scroll-mt-24 bg-white py-20 md:py-32 border-t border-slate-100">
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
              <span className="font-bold text-teal-700 tabular-nums">{sample.best.matchScore}%</span> kecocokan untuk
              mahasiswa {PERSONA_WEIGHTS[activePersona]?.name || sample.profile.majorLabel}.
            </p>
            <ScoreExplainer
              example={sample.best.result}
              exampleName={sample.best.laptop.name}
              trigger={
                <Button variant="link" className="self-start text-teal-700 hover:text-teal-800">
                  Pelajari cara perhitungannya <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
                </Button>
              }
            />
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          {/* Persona Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mb-6 p-1 bg-slate-100 rounded-xl">
            {PERSONA_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePersona(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePersona === tab.id
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mb-3 grid grid-cols-[8.5rem_minmax(0,1fr)_3rem] gap-4 type-micro font-medium tracking-normal text-slate-500 md:grid-cols-[10rem_minmax(0,1fr)_3.5rem]">
            <span>KRITERIA</span>
            <span>BOBOT PRIORITAS</span>
            <span className="text-right">%</span>
          </div>
          <ul ref={listRef} className="flex flex-col gap-1.5" onMouseLeave={() => setFocused(null)}>
            {currentWeights.map((b, i) => {
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
                      open ? "bg-teal-50/50 border border-teal-200/50" : "hover:bg-slate-50"
                    )}
                  >
                    <span className="type-body font-semibold text-slate-900">{b.label}</span>
                    <span className="h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                      <motion.span
                        className="block h-full origin-left rounded-full bg-teal-600"
                        style={{ width: `${(b.weight / max) * 100}%` }}
                        initial={reduce ? false : { scaleX: 0 }}
                        animate={{ scaleX: reduce || inView ? 1 : 0 }}
                        transition={{ duration: 0.9, ease: EASE_OUT, delay: reduce ? 0 : 0.08 * i }}
                      />
                    </span>
                    <span className="text-right type-body font-bold text-slate-900 tabular-nums">{b.weight}%</span>
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
                        className="overflow-hidden px-3 type-small font-normal text-slate-500"
                      >
                        <span className="block pt-1 pb-3">
                          {b.hint}
                        </span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 px-3 type-micro font-medium tracking-normal text-slate-400">
            Klik tab di atas untuk melihat bagaimana bobot kriteria berubah secara matematis untuk tiap jurusan.
          </p>
        </div>
      </div>
    </section>
  )
}
