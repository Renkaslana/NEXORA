"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import { cn } from "cn"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { PlayIcon } from "@phosphor-icons/react/dist/ssr/Play"
import { useHeroTone } from "@/components/landing/hero-tone"
import { HERO_TIERS } from "@/components/landing/hero-tiers"
import { Button } from "@/components/ui/button"
import { getBudgetInsight, getWizardOptions } from "@/lib/api"
import { DURATION, EASE_OUT, EASE_SMOOTH } from "@/lib/motion"
import type { BudgetPresetId } from "@/types"

// Hero slider kisaran budget SPECO (brief redesign landing §5–11 + brief SPECO §11–23, disetujui Fahren
// Okt 2026; isi PRD §12–13). Foto tetap render kertas berwarna (keputusan Fahren); CTA kuning.
// Latar = render premium kisaran aktif selebar layar; laptop selalu di kanan, sisi kiri zona aman teks.
// - Kelima thumbnail selalu tampil; yang aktif disorot dengan garis progres. Pergantian otomatis tiap
//   6 detik digerakkan oleh `animationend` garis progres (CSS), jadi jeda dan progres selalu sinkron.
// - Berhenti saat kursor/fokus di hero atau tab tersembunyi, lalu lanjut lagi; mati bila reduced motion.
// - Kelima render ditumpuk dan tidak pernah dipasang ulang (tanpa kedipan): yang keluar membesar 1,03
//   dan geser −20 px sambil memudar, yang masuk dari 0,98 / +20 px dengan blur tipis (800 ms).

const options = getWizardOptions()
const ORDER = options.budgetPresets.map((p) => p.id)
const FIRST: BudgetPresetId = "8-10"
const AUTOPLAY_S = 6
const SLIDE_S = 0.8
/** Fokus render: laptop ada di kanan-bawah setiap gambar. */
const FOCUS = "68% 72%"

const presetOf = (id: BudgetPresetId) => options.budgetPresets.find((p) => p.id === id)!
const indexOf = (id: BudgetPresetId) => ORDER.indexOf(id)
const step = (id: BudgetPresetId, by: number) => ORDER[(indexOf(id) + by + ORDER.length) % ORDER.length]
// "< Rp6 jt" → "di bawah Rp6 jt", "Rp15 jt+" → "Rp15 jt ke atas"
const inWords = (label: string) => label.replace(/^<\s*/, "di bawah ").replace(/\+$/, " ke atas")

/** Semua gambar hero ada di layar pertama, jadi dimuat langsung (tanpa lazy). */
function TierImage({
  id,
  sizes,
  priority = false,
  decorative = false,
  className,
}: {
  id: BudgetPresetId
  sizes: string
  /** Latar pertama (LCP): prioritas unduh tertinggi. */
  priority?: boolean
  /** Lapisan yang tidak sedang tampil atau gambar thumbnail (sudah berlabel tombol): alt kosong. */
  decorative?: boolean
  className?: string
}) {
  const tier = HERO_TIERS[id]
  return (
    <Image
      src={tier.src}
      alt={decorative ? "" : tier.alt}
      fill
      sizes={sizes}
      loading="eager"
      fetchPriority={priority ? "high" : "auto"}
      quality={90}
      className={cn("object-cover", className)}
      style={{ objectPosition: FOCUS }}
    />
  )
}

/** Paralaks scroll + kedalaman kursor halus pada render (desktop, pointer halus, tanpa reduced motion). */
function useDepth(ref: React.RefObject<HTMLElement | null>) {
  const reduce = useReducedMotion()
  const [fine, setFine] = React.useState(false)
  React.useEffect(() => {
    const q = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)")
    const update = () => setFine(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  const enabled = fine && !reduce
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, 24])
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 90, damping: 20, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 90, damping: 20, mass: 0.6 })
  const x = useTransform(sx, (v) => v * 8) // ±4 px (posisi kursor −0,5…0,5)
  const y = useTransform([sy, scrollY], ([a, b]: number[]) => a * 8 + b)
  return {
    style: enabled ? { x, y } : undefined,
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return
      const r = e.currentTarget.getBoundingClientRect()
      px.set((e.clientX - r.left) / r.width - 0.5)
      py.set((e.clientY - r.top) / r.height - 0.5)
    },
    onPointerLeave: () => {
      px.set(0)
      py.set(0)
    },
  }
}

export function LandingHero() {
  const reduce = useReducedMotion()
  const sectionRef = React.useRef<HTMLElement>(null)
  const depth = useDepth(sectionRef)
  const [active, setActive] = React.useState<BudgetPresetId>(FIRST)
  const [previous, setPrevious] = React.useState<BudgetPresetId | null>(null)
  /** Kisaran yang menentukan warna teks: berganti di pertengahan transisi agar kontras tetap benar. */
  const [toneId, setToneId] = React.useState<BudgetPresetId>(FIRST)
  const [hovered, setHovered] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)
  const [announce, setAnnounce] = React.useState("")

  const preset = presetOf(active)
  const tier = HERO_TIERS[active]
  const insight = getBudgetInsight(preset.value, true)
  const dark = HERO_TIERS[toneId].tone === "dark"
  const autoplay = !reduce
  const paused = hovered || hidden

  const select = React.useCallback(
    (id: BudgetPresetId, byUser: boolean) => {
      if (id === active) return
      if (byUser) setAnnounce(`Kisaran ${presetOf(id).label}: ${HERO_TIERS[id].kind}`)
      setPrevious(active)
      setActive(id)
    },
    [active]
  )

  React.useEffect(() => {
    const t = window.setTimeout(() => setToneId(active), reduce ? 0 : SLIDE_S * 500)
    return () => window.clearTimeout(t)
  }, [active, reduce])

  React.useEffect(() => {
    const update = () => setHidden(document.visibilityState === "hidden")
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
    e.preventDefault()
    const next = step(active, e.key === "ArrowRight" ? 1 : -1)
    select(next, true)
    document.getElementById(`hero-thumb-${next}`)?.focus()
  }

  // Nada slide aktif dibagikan ke navbar (teks, logo, gradien keterbacaan).
  const { setTone } = useHeroTone()
  React.useEffect(() => setTone(dark ? "dark" : "light"), [dark, setTone])

  // Keluar dari hero (brief SPECO §21): gambar membesar sedikit, teks naik dan sedikit memudar.
  const { scrollYProgress: out } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const outScale = useTransform(out, [0, 1], [1, 1.05])
  const outY = useTransform(out, [0, 0.6], [0, -24])
  const outOpacity = useTransform(out, [0, 0.6], [1, 0.6])

  const ink = dark ? "text-white" : "text-ink-strong"
  const words = inWords(preset.label)
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT, delay } },
          exit: { opacity: 0, transition: { duration: DURATION.medium } },
        }

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Kisaran budget laptop"
      data-tone={dark ? "cobalt" : undefined}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false)
        depth.onPointerLeave()
      }}
      onPointerMove={depth.onPointerMove}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovered(false)
      }}
      className={cn("relative flex flex-col overflow-hidden transition-colors duration-[600ms] ease-out lg:min-h-svh", ink)}
      style={{ backgroundColor: tier.paper }}
    >
      {/* ------------------------------------------------ Render: setelah CTA pada mobile, latar penuh pada lg */}
      <motion.div
        style={reduce ? undefined : { scale: outScale }}
        // `isolate`: lapisan foto (z-0…z-2) selalu dalam konteks sendiri di bawah scrim. Tanpa ini, saat skala
        // scroll = 1 Motion menulis `transform: none`, konteks hilang, dan foto aktif naik di atas scrim.
        className="relative isolate z-0 order-2 aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto"
      >
        <motion.div className="absolute -inset-4" style={depth.style}>
          {ORDER.map((id) => {
            const state = id === active ? "active" : id === previous ? "leaving" : "idle"
            return (
              <motion.div
                key={id}
                aria-hidden={id !== active}
                className={cn("absolute inset-0", state === "active" ? "z-[2]" : state === "leaving" ? "z-[1]" : "z-0")}
                initial={false}
                animate={state}
                variants={{
                  active: { opacity: 1, scale: 1, x: 0, filter: "blur(0px)" },
                  leaving: { opacity: 0, scale: 1.03, x: -20, filter: "blur(0px)" },
                  idle: { opacity: 0, scale: 0.98, x: 20, filter: "blur(6px)" },
                }}
                transition={
                  reduce
                    ? { duration: 0.2 }
                    : state === "idle"
                      ? { duration: 0 }
                      : { duration: SLIDE_S, ease: EASE_SMOOTH }
                }
              >
                <TierImage id={id} sizes="100vw" priority={id === FIRST} decorative={id !== active} />
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>

      {/* Scrim keterbacaan (desktop): gelap halus dari kiri untuk teks, dan tipis dari bawah untuk thumbnail &
          navigasi. Teks putih lolos AA di kelima foto (diukur). Mobile tidak perlu: teks di bidang solid. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.5) 38%, rgba(0,0,0,0) 66%), linear-gradient(0deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 32%)", // taste-skill-ignore: scrim keterbacaan di atas foto
        }}
      />

      {/* ------------------------------------------------ Teks: zona aman di kiri */}
      <motion.div
        style={reduce ? undefined : { y: outY, opacity: outOpacity }}
        className="page-container relative z-10 order-1 pt-24 pb-8 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:pt-28 lg:pb-8"
      >
        <div className="flex max-w-[42rem] flex-col gap-5">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p key={`label-${active}`} {...enter(0)} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl leading-8 font-extrabold tracking-[-0.03em] tabular-nums">{preset.label}</span>
              <span className="type-body font-semibold">{tier.kind}</span>
            </motion.p>
          </AnimatePresence>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
            className="text-[2.5rem] leading-[1.05] font-extrabold tracking-[-0.045em] md:text-[3.5rem]"
          >
            Laptop yang Pas Buat{" "}
            <span className="italic font-serif text-teal-300 font-normal">Kebutuhan Kuliahmu</span>
          </motion.h1>

          <div className="flex max-w-[32rem] flex-col gap-2">
            <p className="type-body-l text-slate-200">
              Rekomendasi laptop berbasis AI yang dihitung objektif sesuai budget, jurusan kuliah, dan aplikasi harianmu.
            </p>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p key={`spec-${active}`} {...enter(0.18)} className="type-small font-medium text-slate-300">
                Di {preset.label}: {preset.typicalSpec} ·{" "}
                <span className="font-bold tabular-nums text-teal-300">{insight.laptopCount} laptop</span> di katalog aktif
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={`cta-${active}`} {...enter(0.26)}>
                <Button
                  asChild
                  className="rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 shadow-lg shadow-teal-500/20 transition-[background-color,transform] duration-[var(--motion-medium)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                >
                  <Link href={`/rekomendasi/budget?budget=${preset.value}`}>
                    Mulai Simulasi Sekarang
                    <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </motion.div>
            </AnimatePresence>
            <Link href="#cara-kerja" className="group inline-flex min-h-11 items-center gap-3 type-body font-semibold">
              {/* Motif cincin SPECO pada tombol sekunder. */}
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-full ring-[1.5px] ring-current transition-transform duration-[var(--motion-medium)] ease-out group-hover:scale-105"
              >
                <PlayIcon weight="fill" className="size-3.5 translate-x-px" />
              </span>
              <span className="underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current">
                Lihat cara kerjanya
              </span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------ Thumbnail kisaran (kiri) + navigasi (kanan) */}
      {/* Dalam alur normal (mt-auto), bukan absolut: di layar pendek hero memanjang, tidak menumpuk teks. */}
      <div className="page-container relative z-10 order-3 flex flex-col gap-5 pt-6 pb-8 lg:mt-auto lg:flex-row lg:items-end lg:justify-between lg:pb-10">
        <div className="-mx-4 overflow-x-auto px-4 pt-2 pb-1 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
          <div role="group" aria-label="Pilih kisaran budget" onKeyDown={onKeyDown} className="flex w-max gap-3">
            {ORDER.map((id) => {
              const p = presetOf(id)
              const t = HERO_TIERS[id]
              const on = id === active
              return (
                <button
                  key={id}
                  id={`hero-thumb-${id}`}
                  type="button"
                  aria-pressed={on}
                  aria-label={`Tampilkan kisaran ${p.label}: ${t.kind}`}
                  onClick={() => select(id, true)}
                  className={cn(
                    "group flex w-[8rem] flex-col gap-2 text-left transition-[opacity,transform,filter] duration-[var(--motion-medium)] ease-out",
                    on ? "scale-[1.03] opacity-100" : "opacity-75 saturate-[.55] hover:scale-[1.02] hover:opacity-100 hover:saturate-100"
                  )}
                >
                  <span
                    className={cn(
                      "relative block aspect-[4/3] w-full overflow-hidden rounded-[12px] transition-shadow duration-[var(--motion-medium)]",
                      on ? "ring-2 ring-current" : "ring-1 ring-black/10"
                    )}
                  >
                    <TierImage
                      id={id}
                      sizes="256px"
                      decorative
                      className="transition-transform duration-[var(--motion-slow)] ease-out group-hover:scale-105"
                    />
                  </span>
                  <span className="flex flex-col gap-1.5">
                    <span className="flex flex-col">
                      <span className="type-small font-bold tabular-nums">{p.label}</span>
                      <span className="type-micro font-medium tracking-normal">{t.kind}</span>
                    </span>
                    {/* Progres slide aktif: garis teal tipis (motif cincin brand). */}
                    <span aria-hidden="true" className={cn("h-[2px] overflow-hidden rounded-full", on ? "bg-current/20" : "bg-transparent")}>
                      {on && autoplay && (
                        <span
                          key={active}
                          className="block h-full origin-left rounded-full bg-[#14b8a6]"
                          style={{
                            animation: `nexora-progress ${AUTOPLAY_S}s linear forwards`,
                            animationPlayState: paused ? "paused" : "running",
                          }}
                          onAnimationEnd={() => select(step(active, 1), false)}
                        />
                      )}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {[
            { by: -1, label: "Kisaran sebelumnya", Icon: ArrowLeftIcon },
            { by: 1, label: "Kisaran berikutnya", Icon: ArrowRightIcon },
          ].map(({ by, label, Icon }) => (
            <Button
              key={label}
              variant="ghost"
              size="icon"
              aria-label={label}
              onClick={() => select(step(active, by), true)}
              className={cn(
                "rounded-full ring-1 ring-current/30 transition-transform active:scale-95",
                dark ? "text-white hover:bg-white/15" : "text-ink-strong hover:bg-black/10"
              )}
            >
              <Icon weight="bold" aria-hidden="true" />
            </Button>
          ))}
          <p className="ml-2 type-small font-bold tabular-nums">
            <span className="sr-only">Kisaran </span>
            {/* Penghitung slide "03 / 05" (brief SPECO §19). */}
            {String(indexOf(active) + 1).padStart(2, "0") /* taste-skill-ignore */}
            <span className="font-medium"> / {String(ORDER.length).padStart(2, "0") /* taste-skill-ignore */}</span>
          </p>
          <span aria-hidden="true" className="h-[2px] w-20 overflow-hidden rounded-full bg-current/20 sm:w-28">
            <motion.span
              className="block h-full origin-left rounded-full bg-current"
              initial={false}
              animate={{ scaleX: (indexOf(active) + 1) / ORDER.length }}
              transition={{ duration: reduce ? 0 : SLIDE_S, ease: EASE_SMOOTH }}
            />
          </span>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </section>
  )
}
