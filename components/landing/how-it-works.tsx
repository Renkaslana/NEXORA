"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { GearIcon } from "@phosphor-icons/react/dist/ssr/Gear"
import { Reveal } from "@/components/landing/reveal"
import { EASE_OUT } from "@/lib/motion"

// "Cara Kerja" (brief + referensi Fahren, Okt 2026; PRD §6). Header rata kiri seperti section lain. Tiga langkah
// = tiga kolom sama lebar dengan garis progres bersegmen selebar kontainer (satu segmen per kolom), lalu nomor,
// judul, dan penjelasan. Kolom memakai subgrid agar judul & paragraf sejajar walau judul 02 dua baris.
// Interaksi: hover (dengan jeda niat) / klik / panah memilih langkah; sorotan latar meluncur antarkolom
// (layoutId), segmen terisi sampai langkah terpilih, dan takik panel detail bergeser ke kolomnya.
// Masuk viewport: segmen 1 → 2 → 3 terisi berurutan sekali, lalu kembali ke langkah terpilih.
// Mobile: timeline vertikal, detail di dalam langkah terpilih. Hanya transform/opacity, tanpa loop.

const STEPS = [
  {
    title: "Ceritakan kebutuhanmu",
    body: "Tentukan budget, jurusan, aktivitas, aplikasi yang kamu pakai, dan hal yang paling kamu prioritaskan.",
    detail: "Cukup jawab 5 pertanyaan singkat dengan klik, tanpa istilah teknis. Semakin lengkap jawabanmu, semakin tepat rekomendasinya.",
    chips: ["Budget", "Jurusan", "Aktivitas", "Aplikasi", "Prioritas"],
  },
  {
    title: "SPECO menghitung kecocokan",
    body: "Setiap laptop dibandingkan dengan Profil Kebutuhanmu dan dinilai dengan bobot dari prioritasmu.",
    detail: "Tiap kriteria diberi nilai, lalu dikalikan bobot dari prioritasmu. Hasilnya satu skor kecocokan yang bisa kamu periksa rinciannya.",
    chips: ["Performa", "RAM", "Penyimpanan", "Layar", "Baterai", "Portabilitas"],
  },
  {
    title: "Dapatkan rekomendasi",
    body: "Lihat laptop yang paling sesuai, lengkap dengan skor kecocokan, alasan, dan trade-off-nya.",
    detail: "Best Match tampil paling atas beserta alasannya. Simpan yang kamu suka, lalu bandingkan sampai 3 laptop berdampingan.",
    chips: ["Skor kecocokan", "Alasan", "Trade-off", "Bandingkan"],
  },
]

const num = (i: number) => String(i + 1).padStart(2, "0") // taste-skill-ignore: penomoran 01/02/03 diminta brief Cara Kerja

/** Jeda antarsegmen saat intro (detik) dan lama intro sebelum kembali ke langkah terpilih (ms). */
const INTRO_STEP = 0.38
const INTRO_HOLD_MS = 1700
const HOVER_INTENT_MS = 140

export function HowItWorks() {
  const reduce = useReducedMotion()
  const [selected, setSelected] = React.useState(0)
  const [intro, setIntro] = React.useState<"idle" | "running" | "done">("idle")
  const gridRef = React.useRef<HTMLDivElement>(null)
  const inView = useInView(gridRef, { once: true, amount: 0.4 })
  const shown = reduce || inView
  const tabsId = React.useId()
  const hoverTimer = React.useRef<number | null>(null)

  // Intro sekali: semua segmen terisi berurutan, lalu kembali ke langkah terpilih.
  React.useEffect(() => {
    if (!inView || reduce) return
    const start = requestAnimationFrame(() => setIntro("running"))
    const end = window.setTimeout(() => setIntro("done"), INTRO_HOLD_MS)
    return () => {
      cancelAnimationFrame(start)
      window.clearTimeout(end)
    }
  }, [inView, reduce])

  React.useEffect(
    () => () => {
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
    },
    []
  )

  const running = intro === "running"
  /** Segmen ke-i terisi bila i ≤ batas. Sebelum terlihat tidak ada yang terisi. */
  const filledUpTo = !shown ? -1 : running ? STEPS.length - 1 : reduce || intro === "done" ? selected : -1

  function choose(i: number) {
    setSelected(i)
    if (running) setIntro("done")
  }
  function hoverIn(e: React.PointerEvent, i: number) {
    if (e.pointerType !== "mouse") return
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(() => choose(i), HOVER_INTENT_MS)
  }
  function hoverOut() {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
  }
  function onKey(e: React.KeyboardEvent, i: number) {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    const step = keys[e.key]
    if (step === undefined) return
    const next = i + step
    if (next < 0 || next >= STEPS.length) return
    e.preventDefault()
    choose(next)
    document.getElementById(`${tabsId}-tab-${next}`)?.focus()
  }

  return (
    <section id="cara-kerja" aria-labelledby="cara-kerja-title" className="scroll-mt-24 bg-white py-20 md:py-28">
      <div className="page-container">
        {/* ------------------------------------------------ Header (rata kiri, seperti section lain) */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-canvas-line bg-white px-3.5 py-1.5 type-micro font-semibold tracking-[0.08em] text-ink-strong uppercase">
                <GearIcon weight="bold" className="size-3.5 text-data-blue" aria-hidden="true" />
                Cara kerja
              </p>
            </Reveal>
            <Reveal variant="clip">
              <h2 id="cara-kerja-title" className="text-[2.25rem] leading-[1.02] font-extrabold tracking-[-0.045em] text-balance text-ink-strong md:text-[3.5rem]">
                Dari kebutuhan hingga <span className="italic font-serif text-teal-600 font-normal">laptop</span> yang tepat.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.08} className="lg:col-span-4 lg:col-start-9">
            <p className="max-w-[30rem] type-body-l text-ink-soft lg:max-w-[24rem] lg:pb-2">
              Tiga langkah sederhana untuk menemukan laptop yang benar-benar sesuai denganmu.
            </p>
          </Reveal>
        </div>

        {/* ------------------------------------------------ Tiga langkah */}
        <LayoutGroup id={tabsId}>
          <div
            ref={gridRef}
            role="tablist"
            aria-label="Langkah cara kerja"
            className="mt-14 grid grid-cols-1 md:mt-20 md:grid-cols-3 md:gap-x-8 lg:gap-x-12"
            onPointerLeave={hoverOut}
          >
            {STEPS.map((s, i) => {
              const isSelected = i === selected
              const filled = i <= filledUpTo
              const last = i === STEPS.length - 1
              return (
                <motion.div
                  key={s.title}
                  onPointerEnter={(e) => hoverIn(e, i)}
                  onClick={() => choose(i)}
                  className={cn(
                    "group relative isolate grid cursor-pointer grid-cols-[2.5rem_minmax(0,1fr)] gap-x-5 pb-10 last:pb-0",
                    "md:row-span-3 md:grid-cols-1 md:grid-rows-subgrid md:gap-x-0 md:pb-0"
                  )}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: reduce ? 0 : i * INTRO_STEP * 0.5 }}
                >
                  {/* Sorotan latar: satu elemen yang meluncur ke kolom terpilih. */}
                  {isSelected && (
                    <motion.span
                      layoutId="step-highlight"
                      aria-hidden="true"
                      className="absolute -inset-x-3 -top-3 bottom-5 -z-10 rounded-[20px] bg-data-blue/[0.04] group-last:-bottom-3 md:-inset-x-5 md:-top-6 md:-bottom-6 md:group-last:-bottom-6 lg:-inset-x-6"
                      transition={reduce ? { duration: 0 } : { type: "spring", duration: 0.5, bounce: 0.12 }}
                    />
                  )}

                  {/* Baris 1: segmen progres (md+ horizontal selebar kolom; mobile vertikal di bawah nomor) + nomor. */}
                  <div className="row-span-2 flex flex-col md:row-span-1 md:gap-7">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-12 bottom-0 left-[1.25rem] w-[2px] -translate-x-1/2 overflow-hidden rounded-full bg-canvas-line",
                        "md:relative md:top-auto md:bottom-auto md:left-auto md:h-[3px] md:w-full md:translate-x-0",
                        last && "max-md:hidden"
                      )}
                    >
                      <span
                        className="absolute inset-0 origin-top bg-data-blue transition-transform duration-500 ease-out [transform:scaleY(var(--p))] md:origin-left md:[transform:scaleX(var(--p))]"
                        style={
                          {
                            "--p": filled ? 1 : 0,
                            transitionDelay: running ? `${0.15 + i * INTRO_STEP}s` : "0s",
                          } as React.CSSProperties
                        }
                      />
                    </span>
                    <button
                      id={`${tabsId}-tab-${i}`}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls={`${tabsId}-panel`}
                      tabIndex={isSelected ? 0 : -1}
                      onKeyDown={(e) => onKey(e, i)}
                      onFocus={() => choose(i)}
                      aria-label={`Langkah ${i + 1}: ${s.title}`}
                      className={cn(
                        "relative flex size-10 items-center justify-center rounded-full border text-sm font-extrabold tracking-[-0.01em] tabular-nums transition-[transform,background-color,color,border-color] duration-300 ease-out group-hover:scale-105",
                        isSelected && filled
                          ? "border-data-blue bg-data-blue text-white"
                          : filled
                            ? "border-data-blue/40 bg-white text-data-blue"
                            : "border-canvas-line bg-white text-ink-soft group-hover:border-data-blue/40 group-hover:text-data-blue"
                      )}
                    >
                      {num(i)}
                    </button>
                  </div>

                  <h3
                    className={cn(
                      "col-start-2 pt-1.5 text-xl leading-7 font-extrabold tracking-[-0.025em] transition-colors duration-300 md:col-start-1 md:mt-4 md:pt-0 md:text-[1.375rem]",
                      isSelected ? "text-ink-strong" : "text-ink-strong/75 group-hover:text-ink-strong"
                    )}
                  >
                    {s.title}
                  </h3>
                  <div className="col-start-2 md:col-start-1">
                    <p className="mt-2 max-w-[26rem] type-body text-ink-soft">{s.body}</p>

                    {/* Mobile: detail langkah terpilih di dalam langkahnya. */}
                    <AnimatePresence initial={false}>
                      {isSelected && (
                        <motion.div
                          key="detail"
                          className="overflow-hidden md:hidden"
                          initial={reduce ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: EASE_OUT }}
                        >
                          <StepDetail step={i} compact />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ------------------------------------------------ Panel detail (md+) dengan takik ke kolom terpilih */}
          <motion.div
            className="relative mt-12 hidden md:block"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: reduce ? 0 : 0.5 }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 grid grid-cols-3 gap-x-8 lg:gap-x-12">
              {STEPS.map((s, i) => (
                <div key={s.title} className="relative">
                  {i === selected && (
                    <motion.span
                      layoutId="panel-notch"
                      className="absolute -top-[7px] left-[13px] size-3.5 rotate-45 border-t border-l border-canvas-line bg-canvas" // taste-skill-ignore: takik panel menyambung garis tepi panel
                      transition={reduce ? { duration: 0 } : { type: "spring", duration: 0.5, bounce: 0.12 }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div
              id={`${tabsId}-panel`}
              role="tabpanel"
              aria-labelledby={`${tabsId}-tab-${selected}`}
              className="min-h-[9rem] rounded-[22px] border border-canvas-line bg-canvas p-6 lg:p-7"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={selected}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.26, ease: EASE_OUT }}
                >
                  <StepDetail step={selected} />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </LayoutGroup>
      </div>
    </section>
  )
}

function StepDetail({ step, compact = false }: { step: number; compact?: boolean }) {
  const s = STEPS[step]
  return (
    <div className={cn("flex flex-col gap-4", compact ? "pt-4" : "lg:flex-row lg:items-center lg:justify-between lg:gap-10")}>
      <div className="flex flex-col gap-3">
        <p className={cn("max-w-[44rem] text-ink-strong", compact ? "type-body" : "type-body-l")}>{s.detail}</p>
        <ul className="flex flex-wrap gap-2" aria-label="Yang termasuk">
          {s.chips.map((c) => (
            <li key={c} className="rounded-full border border-data-blue/15 bg-white px-3 py-1 type-small font-medium text-data-blue">
              {c}
            </li>
          ))}
        </ul>
      </div>
      <Link
        href="/rekomendasi/budget"
        className="group/cta inline-flex min-h-11 shrink-0 items-center gap-2 self-start type-body font-semibold text-ink-strong lg:self-center"
      >
        Mulai sekarang
        <ArrowRightIcon weight="bold" className="size-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-1" aria-hidden="true" />
      </Link>
    </div>
  )
}
