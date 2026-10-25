"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { Button } from "@/components/ui/button"
import { NeedMeter } from "@/components/ui/need-meter"
import { getSoftwareNeeds, getSoftwareSentenceOptions } from "@/lib/api"
import { formatRupiahShort } from "@/lib/format"
import { DURATION, EASE_OUT } from "@/lib/motion"

// Interaksi utama landing (redesign "Kalimat terbelah"): kalimat "Laptop buat ___" diisi aplikasi
// yang dipilih, lalu Garis Kebutuhan dan jumlah laptop katalog yang memenuhi berubah langsung.
// Angka dari mock lewat `lib/api.ts`; penyaringan ≥ ambang, bukan SAW. Maks. 3 aplikasi:
// memilih yang keempat menggantikan pilihan paling lama.

const { software, initial } = getSoftwareSentenceOptions()
const MAX_PICK = 3

export function SoftwareSentence() {
  const [picked, setPicked] = React.useState<string[]>(initial)
  const reduce = useReducedMotion()
  const result = getSoftwareNeeds(picked)
  const names = result.picked.map((s) => s.label)

  const toggle = (id: string) =>
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id].slice(-MAX_PICK)
    )

  return (
    <section id="kalimat" aria-labelledby="kalimat-title" className="scroll-mt-16 bg-paper-100 py-16 md:py-24">
      <div className="page-container grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-7">
          <h2 id="kalimat-title" className="type-display text-text">
            Laptop buat{" "}
            <span className="text-cobalt-600">
              {names.length ? (
                <AnimatePresence mode="popLayout" initial={false}>
                  {names.map((n, i) => (
                    <motion.span
                      key={n}
                      layout={!reduce}
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -12 }}
                      transition={{ duration: DURATION.medium, ease: EASE_OUT }}
                      className="inline-block"
                    >
                      {i > 0 && <span className="text-text-muted">&nbsp;+&nbsp;</span>}
                      {n}
                    </motion.span>
                  ))}
                </AnimatePresence>
              ) : (
                <span className="text-text-muted">apa?</span>
              )}
            </span>
          </h2>

          <div className="flex flex-col gap-3">
            <p id="software-label" className="type-body text-text">
              Pilih sampai 3 aplikasi yang paling sering kamu buka.
            </p>
            <div role="group" aria-labelledby="software-label" className="flex flex-wrap gap-2">
              {software.map((s) => {
                const on = picked.includes(s.id)
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(s.id)}
                    className={cn(
                      "inline-flex h-11 items-center gap-1.5 rounded-full px-4 type-small transition-[color,background-color,transform] duration-[var(--motion-fast)] active:scale-[0.96]",
                      on ? "bg-cobalt-600 text-white" : "bg-bg text-text hover:bg-cobalt-100/60"
                    )}
                  >
                    {on && <CheckIcon weight="bold" className="size-4" aria-hidden="true" />}
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6 rounded-[20px] bg-bg p-5 md:p-7 lg:col-span-5">
          <div aria-live="polite" className="flex items-end gap-4">
            <p className="text-7xl leading-[0.85] font-extrabold tracking-[-0.05em] text-cobalt-600 tabular-nums">
              {result.matchingCount}
            </p>
            <p className="type-body text-text">
              dari {result.catalogSize} laptop di katalog memenuhi
              {result.cheapestIdr ? (
                <span className="block text-text-muted">termurah {formatRupiahShort(result.cheapestIdr)}</span>
              ) : (
                <span className="block text-text-muted">
                  {picked.length ? "belum ada yang memenuhi semuanya" : "pilih aplikasi dulu"}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <NeedMeter component="cpu" scale="cpuBench" need={result.needs.cpuBench || 1} index={0} />
            <NeedMeter component="ram" scale="ramGb" need={result.needs.ramGb || 4} index={1} />
            <NeedMeter component="storage" scale="storageGb" need={result.needs.storageGb || 128} index={2} />
            {result.needs.gpuDedicated === 1 && (
              <p className="rounded-control bg-cobalt-100/50 px-3 py-2.5 type-small text-text">
                GPU terpisah dibutuhkan untuk {result.gpuFor.join(" dan ")}.
              </p>
            )}
          </div>

          <p className="type-small font-normal text-text-muted">
            Angka kasar dari data contoh. Wizard menyusun Profil Kebutuhan lengkap dari jurusan, budget, dan prioritasmu.
          </p>
          <Button asChild variant="secondary" className="self-start">
            <Link href="/rekomendasi/budget">
              Susun profil lengkapku <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
