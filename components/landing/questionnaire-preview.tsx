"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { Reveal } from "@/components/landing/reveal"
import { Button } from "@/components/ui/button"
import { getWizardOptions } from "@/lib/api"
import { DURATION, EASE_OUT } from "@/lib/motion"

// "5 pertanyaan. Kurang dari 2 menit." (brief redesign landing §14; PRD §15). Pratinjau kuesioner yang
// bisa dicoba, memakai pilihan asli Wizard. Jawaban budget & jurusan dibawa ke Wizard sungguhan lewat
// ?budget= dan ?jurusan= (fitur prefill yang sudah ada). Langkah lain hanya demo di halaman ini.

const options = getWizardOptions()

interface Question {
  id: string
  title: string
  multi: boolean
  choices: { id: string; label: string }[]
}

const QUESTIONS: Question[] = [
  {
    id: "budget",
    title: "Berapa budget-mu?",
    multi: false,
    choices: options.budgetPresets.map((p) => ({ id: p.id, label: p.label })),
  },
  {
    id: "jurusan",
    title: "Kamu kuliah jurusan apa?",
    multi: false,
    choices: options.majors.slice(0, 6).map((m) => ({ id: m.id, label: m.label })),
  },
  {
    id: "aktivitas",
    title: "Apa yang paling sering kamu lakukan?",
    multi: false,
    choices: options.activities.slice(0, 6).map((a) => ({ id: a.id, label: a.label })),
  },
  {
    id: "software",
    title: "Aplikasi apa yang sering kamu buka?",
    multi: true,
    choices: options.software.slice(0, 8).map((s) => ({ id: s.id, label: s.label })),
  },
  {
    id: "prioritas",
    title: "Apa yang paling penting buatmu?",
    multi: true,
    choices: options.priorities.slice(0, 6).map((p) => ({ id: p.id, label: p.label })),
  },
]

const pad = (n: number) => String(n).padStart(2, "0") // taste-skill-ignore: penghitung 01 / 05 (brief §14)

export function QuestionnairePreview() {
  const reduce = useReducedMotion()
  const [index, setIndex] = React.useState(0)
  const [direction, setDirection] = React.useState(1)
  const [answers, setAnswers] = React.useState<Record<string, string[]>>({})
  const q = QUESTIONS[index]
  const picked = answers[q.id] ?? []
  const last = index === QUESTIONS.length - 1
  const answeredCount = QUESTIONS.filter((x) => (answers[x.id] ?? []).length > 0).length

  const toggle = (id: string) =>
    setAnswers((prev) => {
      const cur = prev[q.id] ?? []
      const next = q.multi ? (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id].slice(-3)) : [id]
      return { ...prev, [q.id]: next }
    })
  const go = (by: number) => {
    setDirection(by)
    setIndex((i) => Math.min(QUESTIONS.length - 1, Math.max(0, i + by)))
  }

  const budget = options.budgetPresets.find((p) => p.id === answers.budget?.[0])
  const wizardHref = `/rekomendasi/budget${
    budget || answers.jurusan?.[0]
      ? `?${[budget && `budget=${budget.value}`, answers.jurusan?.[0] && `jurusan=${answers.jurusan[0]}`].filter(Boolean).join("&")}`
      : ""
  }`

  return (
    <section aria-labelledby="pertanyaan-title" className="bg-canvas py-20 md:py-32">
      <div className="page-container grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Reveal variant="clip">
            <h2 id="pertanyaan-title" className="text-[2.25rem] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink-strong md:text-[3.5rem]">
              5 pertanyaan. Kurang dari <span className="italic font-serif text-teal-600 font-normal">2 menit.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[30rem] type-body-l text-ink-soft">
              Coba langsung di sini. Pertanyaannya sama dengan yang ada di SPECO, dan jawaban budget serta jurusanmu
              ikut terbawa saat kamu lanjut.
            </p>
          </Reveal>
        </div>

        {/* ------------------------------------------------ Pratinjau aplikasi */}
        <Reveal delay={0.12} className="lg:col-span-6 lg:col-start-7">
          <div className="flex flex-col gap-6 rounded-[24px] border border-canvas-line bg-white p-5 md:p-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <p className="type-small font-bold text-ink-strong tabular-nums">
                  <span className="sr-only">Pertanyaan </span>
                  {pad(index + 1) /* taste-skill-ignore */}
                  <span className="font-medium text-ink-soft"> / {pad(QUESTIONS.length) /* taste-skill-ignore */}</span>
                </p>
                <p className="type-micro font-medium tracking-normal text-ink-soft">{answeredCount} dari 5 terjawab</p>
              </div>
              <div
                role="progressbar"
                aria-label="Kemajuan pratinjau kuesioner"
                aria-valuemin={0}
                aria-valuemax={QUESTIONS.length}
                aria-valuenow={index + 1}
                className="h-1.5 overflow-hidden rounded-full bg-canvas"
              >
                <motion.div
                  className="h-full origin-left rounded-full bg-data-blue"
                  initial={false}
                  animate={{ scaleX: (index + 1) / QUESTIONS.length }}
                  transition={{ duration: reduce ? 0 : DURATION.slow, ease: EASE_OUT }}
                />
              </div>
            </div>

            <div className="relative min-h-[17rem] overflow-hidden">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.fieldset
                  key={q.id}
                  custom={direction}
                  initial={reduce ? false : { opacity: 0, x: 24 * direction }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: -16 * direction, transition: { duration: 0.15 } }}
                  transition={{ duration: DURATION.medium * 1.4, ease: EASE_OUT }}
                  className="flex flex-col gap-4"
                >
                  <legend className="mb-4 text-2xl leading-8 font-extrabold tracking-[-0.03em] text-ink-strong">
                    {q.title}
                    {q.multi && <span className="block type-small font-normal text-ink-soft">Boleh pilih sampai 3.</span>}
                  </legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {q.choices.map((c) => {
                      const on = picked.includes(c.id)
                      return (
                        <button
                          key={c.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(c.id)}
                          className={cn(
                            "relative flex min-h-14 items-center rounded-[14px] border px-3.5 py-2.5 text-left type-small transition-[color,background-color,border-color,transform,box-shadow] duration-[var(--motion-fast)] ease-out active:scale-[0.98]",
                            on
                              ? "scale-[1.02] border-teal-600 bg-teal-50 text-slate-900 ring-1 ring-teal-600 shadow-sm"
                              : "border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-teal-300"
                          )}
                        >
                          <span className="pr-5">{c.label}</span>
                          {on && (
                            <CheckIcon weight="bold" className="absolute top-2.5 right-2.5 size-4 text-teal-600" aria-hidden="true" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.fieldset>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => go(-1)}
                disabled={index === 0}
                className="rounded-xl text-slate-700 hover:bg-slate-100"
              >
                <ArrowLeftIcon weight="bold" aria-hidden="true" /> Kembali
              </Button>
              {last ? (
                <Button asChild className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2.5">
                  <Link href={wizardHref}>
                    Lihat Hasil Rekomendasi <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              ) : (
                <Button onClick={() => go(1)} className="rounded-[12px] bg-ink-strong text-white hover:bg-ink-strong/90 active:bg-ink-strong">
                  {picked.length ? "Lanjut" : "Lewati"} <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
