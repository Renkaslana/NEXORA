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
import { HERO_TIERS } from "@/components/landing/hero-tiers"
import { Button } from "@/components/ui/button"
import { getBudgetInsight, getWizardOptions } from "@/lib/api"
import { DURATION, EASE_OUT, EASE_SMOOTH } from "@/lib/motion"
import type { BudgetPresetId } from "@/types"

// Hero slider kisaran budget (brief redesign landing §5–11, disetujui Fahren Okt 2026; isi PRD §12–13).
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
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, 40])
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 90, damping: 20, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 90, damping: 20, mass: 0.6 })
  const x = useTransform(sx, (v) => v * 8)
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
      className={cn("relative overflow-hidden transition-colors duration-[600ms] ease-out", ink)}
      style={{ backgroundColor: tier.paper }}
    >
      {/* ------------------------------------------------ Render: di atas pada mobile, latar penuh pada lg */}
      <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
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
      </div>

      {/* ------------------------------------------------ Isi */}
      <div className="page-container relative z-10 flex flex-col gap-8 pt-8 pb-10 lg:min-h-svh lg:justify-between lg:pt-28 lg:pb-8">
        <div className="flex max-w-[42rem] flex-col gap-6">
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
            className="text-[2.5rem] leading-[1] font-extrabold tracking-[-0.045em] md:text-[3.5rem]"
          >
            Laptop buat kuliahmu, <span className="whitespace-nowrap">pas di budget-mu.</span>
          </motion.h1>

          <div className="flex max-w-[34rem] flex-col gap-2">
            <p className="type-body-l">
              Temukan laptop berdasarkan budget, kuliah, dan aplikasi yang kamu pakai. NEXORA menyaring pilihan sampai
              ketemu yang paling sesuai.
            </p>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p key={`spec-${active}`} {...enter(0.18)} className="type-body font-medium">
                Di kisaran ini: {preset.typicalSpec}.{" "}
                <span className="font-bold tabular-nums">{insight.laptopCount} laptop</span> di katalog contoh.
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={`cta-${active}`} {...enter(0.26)}>
                <Button
                  asChild
                  variant="signal"
                  size="lg"
                  className="rounded-[14px] transition-[background-color,transform] duration-[var(--motion-medium)] hover:scale-[1.015] hover:[&_[data-arrow]]:translate-x-1 active:scale-[0.98]"
                >
                  <Link href={`/rekomendasi/budget?budget=${preset.value}`}>
                    Cari laptop {words.startsWith("di bawah") ? "" : "untuk "}
                    {words}
                    <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
                  </Link>
                </Button>
              </motion.div>
            </AnimatePresence>
            <Link
              href="#cara-kerja"
              className="inline-flex min-h-11 items-center type-body font-semibold underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current"
            >
              Lihat cara kerjanya
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------ Thumbnail kisaran + navigasi */}
        <div className="flex flex-col gap-4 lg:w-fit">
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
                      "group flex w-[6.5rem] flex-col gap-2 text-left transition-[opacity,transform] duration-[var(--motion-medium)] ease-out",
                      on ? "scale-100 opacity-100" : "scale-[0.97] opacity-70 hover:scale-[1.02] hover:opacity-100"
                    )}
                  >
                    <span
                      className={cn(
                        "relative block aspect-[3/4] w-full overflow-hidden rounded-[14px] ring-offset-2 transition-shadow duration-[var(--motion-medium)]",
                        on ? "ring-2 ring-current ring-offset-transparent" : "ring-1 ring-black/10 group-hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)]" /* taste-skill-ignore: elevasi hanya saat hover (brief §10) */
                      )}
                    >
                      <TierImage
                        id={id}
                        sizes="208px"
                        decorative
                        className="transition-transform duration-[var(--motion-slow)] ease-out group-hover:scale-105"
                      />
                      {on && autoplay && (
                        <span aria-hidden="true" className="absolute inset-x-2 bottom-2 h-[3px] overflow-hidden rounded-full bg-white/45">
                          <span
                            key={active}
                            className="block h-full origin-left rounded-full bg-white"
                            style={{
                              animation: `nexora-progress ${AUTOPLAY_S}s linear forwards`,
                              animationPlayState: paused ? "paused" : "running",
                            }}
                            onAnimationEnd={() => select(step(active, 1), false)}
                          />
                        </span>
                      )}
                    </span>
                    <span className="flex flex-col">
                      <span className="type-small font-bold tabular-nums">{p.label}</span>
                      <span className="type-micro font-medium tracking-normal">{t.kind}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <span aria-hidden="true" />
            <div className="flex items-center gap-3">
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
            </div>
            <p className="justify-self-end type-small font-bold tabular-nums">
              <span className="sr-only">Kisaran </span>
              {/* Penghitung slide "03 / 05" (brief §5). */}
              {String(indexOf(active) + 1).padStart(2, "0") /* taste-skill-ignore */}
              <span className="font-medium"> / {String(ORDER.length).padStart(2, "0") /* taste-skill-ignore */}</span>
            </p>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </div>
    </section>
  )
}
