"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ChartBarIcon } from "@phosphor-icons/react/dist/ssr/ChartBar"
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/ssr/ClipboardText"
import { GearIcon } from "@phosphor-icons/react/dist/ssr/Gear"
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star"
import { Reveal } from "@/components/landing/reveal"
import { EASE_OUT } from "@/lib/motion"

// "Cara Kerja" (brief + referensi Fahren, Okt 2026; PRD §6): tiga langkah 01 → 02 → 03 sebagai satu alur,
// tanpa gambar atau mockup. Lingkaran nomor dihubungkan garis yang terisi sampai langkah aktif (progres).
// Hover/fokus menyorot langkah; klik/keyboard memilih langkah dan panel detail di bawahnya berganti isi.
// Panel selalu ada (tinggi tetap) agar tidak ada lompatan layout. Mobile: timeline vertikal, detail di dalam
// langkah yang dipilih. Semua gerak transform/opacity, sekali saat masuk viewport.

const STEPS = [
  {
    title: "Ceritakan kebutuhanmu",
    body: "Tentukan budget, jurusan, aktivitas, aplikasi yang kamu pakai, dan hal yang paling kamu prioritaskan.",
    Icon: ClipboardTextIcon,
    detail: "Cukup jawab 5 pertanyaan singkat dengan klik, tanpa istilah teknis. Semakin lengkap jawabanmu, semakin tepat rekomendasinya.",
    chips: ["Budget", "Jurusan", "Aktivitas", "Aplikasi", "Prioritas"],
  },
  {
    title: "SPECO menghitung kecocokan",
    body: "Setiap laptop dibandingkan dengan Profil Kebutuhanmu dan dinilai dengan bobot dari prioritasmu.",
    Icon: ChartBarIcon,
    detail: "Tiap kriteria diberi nilai, lalu dikalikan bobot dari prioritasmu. Hasilnya satu skor kecocokan yang bisa kamu periksa rinciannya.",
    chips: ["Performa", "RAM", "Penyimpanan", "Layar", "Baterai", "Portabilitas"],
  },
  {
    title: "Dapatkan rekomendasi",
    body: "Lihat laptop yang paling sesuai, lengkap dengan skor kecocokan, alasan, dan trade-off-nya.",
    Icon: StarIcon,
    detail: "Best Match tampil paling atas beserta alasannya. Simpan yang kamu suka, lalu bandingkan sampai 3 laptop berdampingan.",
    chips: ["Skor kecocokan", "Alasan", "Trade-off", "Bandingkan"],
  },
]

const num = (i: number) => String(i + 1).padStart(2, "0") // taste-skill-ignore: penomoran 01/02/03 diminta brief Cara Kerja

export function HowItWorks() {
  const reduce = useReducedMotion()
  const [selected, setSelected] = React.useState(0)
  const [hovered, setHovered] = React.useState<number | null>(null)
  const active = hovered ?? selected
  const listRef = React.useRef<HTMLDivElement>(null)
  const inView = useInView(listRef, { once: true, amount: 0.35 })
  const shown = reduce || inView
  const tabsId = React.useId()

  // Urutan masuk: langkah 01 → garis ke 02 → langkah 02 → garis ke 03 → langkah 03.
  const stepDelay = (i: number) => (reduce ? 0 : 0.1 + i * 0.42)
  const lineDelay = (i: number) => (reduce ? 0 : 0.28 + i * 0.42)

  function onKey(e: React.KeyboardEvent, i: number) {
    const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? i + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? i - 1 : null
    if (next === null || next < 0 || next >= STEPS.length) return
    e.preventDefault()
    setSelected(next)
    document.getElementById(`${tabsId}-tab-${next}`)?.focus()
  }

  return (
    <section id="cara-kerja" aria-labelledby="cara-kerja-title" className="relative isolate scroll-mt-24 overflow-hidden bg-white py-20 md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(48% 40% at 50% 0%, rgba(18,56,245,0.05), rgba(18,56,245,0) 72%)", // taste-skill-ignore: aksen tipis di belakang judul (brief Cara Kerja)
        }}
      />

      <div className="page-container">
        {/* ------------------------------------------------ Judul */}
        <div className="mx-auto flex max-w-[62rem] flex-col items-center gap-5 text-center">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-canvas-line bg-white px-3.5 py-1.5 type-micro font-semibold tracking-[0.08em] text-ink-strong uppercase">
              <GearIcon weight="bold" className="size-3.5 text-data-blue" aria-hidden="true" />
              Cara kerja
            </p>
          </Reveal>
          <Reveal variant="clip">
            <h2 id="cara-kerja-title" className="text-[2rem] leading-[1.06] font-extrabold tracking-[-0.045em] text-balance text-ink-strong sm:text-[2.25rem] md:text-[3.5rem]">
              Dari kebutuhan hingga <span className="text-data-blue">laptop</span> yang tepat.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[40rem] type-body-l text-balance text-ink-soft">Tiga langkah sederhana untuk menemukan laptop yang benar-benar sesuai denganmu.</p>
          </Reveal>
        </div>

        {/* ------------------------------------------------ Tiga langkah */}
        <div
          ref={listRef}
          role="tablist"
          aria-label="Langkah cara kerja"
          aria-orientation="horizontal"
          className="mt-14 grid grid-cols-1 md:mt-20 md:grid-cols-3"
          onPointerLeave={() => setHovered(null)}
        >
          {STEPS.map((s, i) => {
            const on = i === active
            const reached = i <= active
            const isSelected = i === selected
            const last = i === STEPS.length - 1
            return (
              <div
                key={s.title}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(i)}
                onClick={() => setSelected(i)}
                className="group relative grid cursor-pointer grid-cols-[3.5rem_minmax(0,1fr)] gap-x-5 pb-10 last:pb-0 md:flex md:flex-col md:gap-0 md:px-6 md:pb-0"
              >
                {/* Garis penghubung: vertikal (mobile) / horizontal (md+). Terisi biru sampai langkah aktif. */}
                {!last && (
                  <>
                    <Connector vertical filled={i <= active} delay={lineDelay(i)} shown={shown} reduce={!!reduce} className="top-[4.25rem] bottom-2 left-[1.75rem] md:hidden" />
                    <Connector filled={i <= active} delay={lineDelay(i)} shown={shown} reduce={!!reduce} className="top-[1.75rem] right-[-1.25rem] left-[5.25rem] hidden md:block" />
                  </>
                )}

                <motion.div
                  className="relative z-10 md:mb-7"
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: stepDelay(i) }}
                >
                  <button
                    id={`${tabsId}-tab-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`${tabsId}-panel`}
                    tabIndex={isSelected ? 0 : -1}
                    onKeyDown={(e) => onKey(e, i)}
                    onFocus={() => setSelected(i)}
                    aria-label={`Langkah ${i + 1}: ${s.title}`}
                    className={cn(
                      "flex size-14 items-center justify-center rounded-full border text-lg font-extrabold tracking-[-0.02em] tabular-nums transition-[transform,background-color,color,border-color,box-shadow] duration-300 ease-out",
                      on
                        ? "scale-105 border-data-blue bg-data-blue text-white shadow-[0_0_0_8px_rgba(18,56,245,0.08)]" // taste-skill-ignore: halo langkah aktif
                        : reached
                          ? "border-data-blue/40 bg-white text-data-blue"
                          : "border-canvas-line bg-white text-ink-soft"
                    )}
                  >
                    {num(i)}
                  </button>
                </motion.div>

                <motion.div
                  className={cn(
                    "flex gap-4 rounded-[18px] transition-colors duration-300 ease-out md:-mx-3 md:p-3",
                    on && "md:bg-data-blue/[0.03]"
                  )}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: stepDelay(i) + (reduce ? 0 : 0.08) }}
                >
                  <span
                    className={cn(
                      "mt-0.5 hidden size-11 shrink-0 items-center justify-center rounded-[12px] border transition-[transform,background-color,color,border-color] duration-300 ease-out sm:flex md:hidden lg:flex",
                      on ? "-translate-y-0.5 border-data-blue/15 bg-data-blue/[0.07] text-data-blue" : "border-canvas-line bg-white text-ink-soft"
                    )}
                    aria-hidden="true"
                  >
                    <s.Icon weight={on ? "bold" : "regular"} className="size-5" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-2 pt-3 md:pt-0">
                    <h3 className="text-xl leading-7 font-extrabold tracking-[-0.025em] text-ink-strong md:text-[1.375rem]">{s.title}</h3>
                    <p className="max-w-[26rem] type-body text-ink-soft">{s.body}</p>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-2 block h-[3px] w-10 origin-left rounded-full transition-[transform,background-color] duration-300 ease-out",
                        on ? "scale-x-100 bg-data-blue" : "scale-x-50 bg-canvas-line"
                      )}
                    />

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
              </div>
            )
          })}
        </div>

        {/* ------------------------------------------------ Panel detail (md+) */}
        <motion.div
          id={`${tabsId}-panel`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-tab-${selected}`}
          className="mt-10 hidden min-h-[9.5rem] rounded-[22px] border border-canvas-line bg-canvas/60 p-6 md:block lg:p-7"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: reduce ? 0 : 1.15 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
            >
              <StepDetail step={selected} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

function Connector({
  vertical = false,
  filled,
  delay,
  shown,
  reduce,
  className,
}: {
  vertical?: boolean
  filled: boolean
  delay: number
  shown: boolean
  reduce: boolean
  className?: string
}) {
  const axis = vertical ? "scaleY" : "scaleX"
  return (
    <span aria-hidden="true" className={cn("absolute overflow-hidden rounded-full", vertical ? "w-[2px]" : "h-[2px]", className)}>
      {/* Masuk: garis abu digambar dari kiri/atas. Isian biru bergeser saat langkah aktif berubah. */}
      <motion.span
        className={cn("absolute inset-0 bg-canvas-line", vertical ? "origin-top" : "origin-left")}
        initial={reduce ? false : { [axis]: 0 }}
        animate={{ [axis]: shown ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay }}
      />
      <span
        className={cn(
          "absolute inset-0 bg-data-blue transition-transform duration-500 ease-out",
          vertical ? "origin-top" : "origin-left",
          filled && shown ? (vertical ? "scale-y-100" : "scale-x-100") : vertical ? "scale-y-0" : "scale-x-0"
        )}
        style={{ transitionDelay: shown && !reduce ? `${delay + 0.35}s` : undefined }}
      />
    </span>
  )
}

function StepDetail({ step, compact = false }: { step: number; compact?: boolean }) {
  const s = STEPS[step]
  return (
    <div className={cn("flex flex-col gap-4", compact ? "pt-4" : "lg:flex-row lg:items-center lg:justify-between lg:gap-10")}>
      <div className="flex flex-col gap-3">
        {!compact && (
          <p className="flex items-center gap-2 type-small text-data-blue">
            <span className="tabular-nums">{num(step)}</span>
            <span aria-hidden="true" className="text-data-blue/50">·</span>
            {s.title}
          </p>
        )}
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
        Mulai dari langkah 01
        <ArrowRightIcon weight="bold" className="size-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-1" aria-hidden="true" />
      </Link>
    </div>
  )
}
