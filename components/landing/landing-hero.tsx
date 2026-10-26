"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { HERO_TIERS } from "@/components/landing/hero-tiers"
import { Button } from "@/components/ui/button"
import { getBudgetInsight, getWizardOptions } from "@/lib/api"
import { DURATION, EASE_OUT } from "@/lib/motion"
import type { BudgetPresetId } from "@/types"

// Hero "kartu budget yang membuka" (disetujui Fahren, Okt 2026; terinspirasi pola "Timed Card Opening";
// isi PRD §12–13, gerak §25, aksesibilitas §28). Latar = render premium kisaran aktif, selebar layar.
// Di sisi kiri (area kertas yang tenang): judul, spek khas kisaran, CTA ke Wizard dengan ?budget=, lalu
// kartu kisaran lain. Memilih kartu membuat kartunya tumbuh dari posisinya menjadi latar penuh (lg+); di layar
// kecil berganti dengan crossfade. Kelima render ditumpuk sekali dan tidak pernah dipasang ulang, jadi tidak
// ada gambar yang dimuat atau didekode ulang saat berpindah (penyebab kedipan sebelumnya).
// Berganti otomatis tiap 3 detik, tanpa garis progres dan tanpa tombol jeda (permintaan Fahren). Pengganti
// tombol jeda (WCAG 2.2.2): berhenti permanen setelah pengguna memilih kartu/panah, berhenti sementara saat
// kursor/fokus di hero atau tab tersembunyi, dan mati total bila prefers-reduced-motion.

const options = getWizardOptions()
const ORDER = options.budgetPresets.map((p) => p.id)
const FIRST: BudgetPresetId = "8-10"
const AUTOPLAY_S = 3
/** Kartu tumbuh menjadi latar: lambat di awal dan akhir, tanpa hentakan. */
const GROW_S = 0.85
const EASE_GROW = [0.65, 0, 0.35, 1] as const

type Box = { top: number; left: number; width: number; height: number }
type Flight =
  | { id: BudgetPresetId; mode: "grow"; from: Box; to: { width: number; height: number } }
  | { id: BudgetPresetId; mode: "fade" }
/** Fokus render: laptop ada di kanan-bawah setiap gambar. */
const FOCUS = "68% 72%"

const presetOf = (id: BudgetPresetId) => options.budgetPresets.find((p) => p.id === id)!
const indexOf = (id: BudgetPresetId) => ORDER.indexOf(id)
const step = (id: BudgetPresetId, by: number) => ORDER[(indexOf(id) + by + ORDER.length) % ORDER.length]
/** Kartu yang tampil: kisaran setelah yang aktif, berputar. */
const queueAfter = (id: BudgetPresetId) => ORDER.map((_, i) => step(id, i + 1)).slice(0, ORDER.length - 1)
// "< Rp6 jt" → "di bawah Rp6 jt", "Rp15 jt+" → "Rp15 jt ke atas"
const inWords = (label: string) => label.replace(/^<\s*/, "di bawah ").replace(/\+$/, " ke atas")

function useLargeScreen() {
  const [large, setLarge] = React.useState(false)
  React.useEffect(() => {
    const q = window.matchMedia("(min-width: 1024px)")
    const update = () => setLarge(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  return large
}

function TierImage({
  id,
  sizes,
  eager = false,
  decorative = false,
  className,
}: {
  id: BudgetPresetId
  sizes: string
  eager?: boolean
  /** Lapisan yang tidak sedang tampil atau gambar kartu (sudah berlabel tombol): alt kosong. */
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
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      className={cn("object-cover", className)}
      style={{ objectPosition: FOCUS }}
    />
  )
}

export function LandingHero() {
  const reduce = useReducedMotion()
  const large = useLargeScreen()
  /** Kisaran di latar (berubah setelah transisi selesai). */
  const [active, setActive] = React.useState<BudgetPresetId>(FIRST)
  /** Transisi yang sedang berjalan: kartu tumbuh dari posisinya (lg+) atau crossfade (layar kecil). */
  const [flight, setFlight] = React.useState<Flight | null>(null)
  /** Pengguna sudah memilih sendiri: pergantian otomatis berhenti permanen. */
  const [stopped, setStopped] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)
  const [announce, setAnnounce] = React.useState("")
  const stageRef = React.useRef<HTMLDivElement>(null)
  const cardRefs = React.useRef<Partial<Record<BudgetPresetId, HTMLElement | null>>>({})

  /** Kisaran yang menentukan warna teks (tinta/putih): ikut latar yang benar-benar terlihat. */
  const [toneId, setToneId] = React.useState<BudgetPresetId>(FIRST)

  const shown = flight?.id ?? active
  const preset = presetOf(shown)
  const tier = HERO_TIERS[shown]
  const insight = getBudgetInsight(preset.value, true)
  const dark = HERO_TIERS[toneId].tone === "dark"
  const queue = queueAfter(shown)

  // Warna teks berganti di pertengahan transisi, saat render baru sudah menutupi sebagian besar layar,
  // agar teks tidak sempat berada di atas latar yang kontrasnya salah.
  React.useEffect(() => {
    if (!flight) return
    const t = window.setTimeout(
      () => setToneId(flight.id),
      (flight.mode === "grow" ? GROW_S : DURATION.slow) * 500
    )
    return () => window.clearTimeout(t)
  }, [flight])

  const select = React.useCallback(
    (id: BudgetPresetId, byUser: boolean) => {
      if (id === shown || flight) return
      if (byUser) {
        setStopped(true)
        setAnnounce(`Kisaran ${presetOf(id).label}: ${HERO_TIERS[id].kind}`)
      }
      if (reduce) {
        setActive(id)
        setToneId(id)
        return
      }
      const card = cardRefs.current[id]?.querySelector("[data-thumb]")
      const stage = stageRef.current
      if (!large || !card || !stage) {
        setFlight({ id, mode: "fade" })
        return
      }
      const s = stage.getBoundingClientRect()
      const c = card.getBoundingClientRect()
      setFlight({
        id,
        mode: "grow",
        from: { top: c.top - s.top, left: c.left - s.left, width: c.width, height: c.height },
        to: { width: s.width, height: s.height },
      })
    },
    [shown, flight, reduce, large]
  )

  // Berganti otomatis: tunggu 3 detik lalu ke kisaran berikutnya. Saat jeda dilepas, hitungan mulai lagi.
  const paused = stopped || hovered || hidden || Boolean(flight)
  const autoplay = !reduce
  React.useEffect(() => {
    if (!autoplay || paused) return
    const t = window.setTimeout(() => select(step(shown, 1), false), AUTOPLAY_S * 1000)
    return () => window.clearTimeout(t)
  }, [autoplay, paused, shown, select])

  React.useEffect(() => {
    const update = () => setHidden(document.visibilityState === "hidden")
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])

  const ink = dark ? "text-white" : "text-text"
  const ctaHref = `/rekomendasi/budget?budget=${preset.value}`
  const words = inWords(preset.label)

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Kisaran budget laptop"
      data-tone={dark ? "cobalt" : undefined}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovered(false)
      }}
      className={cn("relative overflow-hidden transition-colors duration-[600ms] ease-out", ink)}
      style={{ backgroundColor: tier.paper }}
    >
      {/* ------------------------------------------------ Panggung render: di atas pada mobile, latar penuh pada lg */}
      <div ref={stageRef} className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
        {/* Kelima render ditumpuk sekali; yang aktif di atas. Lapisan lain tetap terpasang (sudah terdekode)
            di bawahnya, jadi saat transisi selesai lapisan baru sudah siap dan pergantiannya tidak terlihat. */}
        {ORDER.map((id) => (
          <div key={id} aria-hidden={id !== active} className={cn("absolute inset-0", id === active ? "z-[1]" : "z-0")}>
            <TierImage id={id} sizes="100vw" eager={id === FIRST} decorative={id !== active} />
          </div>
        ))}

        {flight && (
          <motion.div
            key={flight.id}
            aria-hidden="true"
            className="absolute z-[2] overflow-hidden"
            initial={
              flight.mode === "grow"
                ? { ...flight.from, borderRadius: 16 }
                : { top: 0, left: 0, width: "100%", height: "100%", opacity: 0 }
            }
            animate={
              flight.mode === "grow"
                ? { top: 0, left: 0, ...flight.to, borderRadius: 0 }
                : { opacity: 1 }
            }
            transition={{ duration: flight.mode === "grow" ? GROW_S : DURATION.slow, ease: flight.mode === "grow" ? EASE_GROW : EASE_OUT }}
            onAnimationComplete={() => {
              setActive(flight.id)
              setFlight(null)
            }}
          >
            <TierImage id={flight.id} sizes="100vw" decorative />
          </motion.div>
        )}

        <span
          aria-hidden="true"
          className={cn(
            "absolute right-4 bottom-3 z-[3] rounded-full px-2.5 py-1 type-micro lg:top-4 lg:bottom-auto",
            dark ? "bg-white/15 text-white" : "bg-black/45 text-white"
          )}
        >
          Ilustrasi
        </span>
      </div>

      {/* ------------------------------------------------ Isi */}
      <div className="page-container relative z-20 flex flex-col gap-8 pt-8 pb-10 lg:min-h-[calc(100svh-4rem)] lg:justify-between lg:pt-14 lg:pb-10">
        <div className="flex max-w-[42rem] flex-col gap-6">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={shown}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, transition: { duration: DURATION.medium } }}
              transition={{ duration: DURATION.slow, ease: EASE_OUT }}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
            >
              <span className="text-2xl leading-8 font-extrabold tracking-[-0.03em] tabular-nums">{preset.label}</span>
              <span className="type-body font-semibold">{tier.kind}</span>
            </motion.p>
          </AnimatePresence>

          <h1 className="text-[2.5rem] leading-[1.02] font-extrabold tracking-[-0.045em] md:text-[3.5rem]">
            Laptop buat kuliahmu, <span className="whitespace-nowrap">pas di budget-mu.</span>
          </h1>

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={shown}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, transition: { duration: DURATION.medium } }}
              transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: reduce ? 0 : 0.06 }}
              className="max-w-[32rem] type-body-l"
            >
              Di kisaran ini biasanya kamu dapat: {preset.typicalSpec}.{" "}
              <span className="font-semibold tabular-nums">{insight.laptopCount} laptop</span> di katalog contoh kami.
            </motion.p>
          </AnimatePresence>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button asChild variant="signal" size="lg">
              <Link href={ctaHref}>
                Cari laptop {words.startsWith("di bawah") ? "" : "untuk "}
                {words}
                <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
              </Link>
            </Button>
            <Link
              href="#cara-kerja"
              className="inline-flex min-h-11 items-center type-body font-semibold underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current"
            >
              Lihat cara kerjanya
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------ Kartu kisaran lain + kontrol */}
        {/* Kontrol selebar deretan kartu: panah di tengah, penghitung rata kanan. */}
        <div className="flex flex-col gap-4 lg:w-fit">
          <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
            <ul className="flex w-max gap-3">
              <AnimatePresence initial={false} mode="popLayout">
                {queue.map((id) => {
                  const p = presetOf(id)
                  const t = HERO_TIERS[id]
                  return (
                    <motion.li
                      key={id}
                      layout={reduce ? false : "position"}
                      initial={reduce ? false : { opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0 } }}
                      transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: reduce ? 0 : 0.2 }}
                    >
                      <button
                        type="button"
                        ref={(el) => {
                          cardRefs.current[id] = el
                        }}
                        onClick={() => select(id, true)}
                        aria-label={`Tampilkan kisaran ${p.label}: ${t.kind}`}
                        className="group flex w-[8.75rem] flex-col gap-2 text-left"
                      >
                        <span data-thumb className="relative block aspect-[3/4] w-full overflow-hidden rounded-[16px] ring-1 ring-black/10 transition-transform duration-[var(--motion-medium)] ease-out group-hover:-translate-y-1 group-active:scale-[0.98]">
                          <TierImage id={id} sizes="140px" decorative className="transition-transform duration-[var(--motion-slow)] ease-out group-hover:scale-105" />
                        </span>
                        <span className="flex flex-col">
                          <span className="type-small font-bold tabular-nums">{p.label}</span>
                          <span className="type-micro font-medium tracking-normal">{t.kind}</span>
                        </span>
                      </button>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <span aria-hidden="true" />
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Kisaran sebelumnya"
                onClick={() => select(step(shown, -1), true)}
                className={cn("rounded-full ring-1 ring-current/30", dark ? "text-white hover:bg-white/15" : "text-text hover:bg-black/10")}
              >
                <ArrowLeftIcon weight="bold" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Kisaran berikutnya"
                onClick={() => select(step(shown, 1), true)}
                className={cn("rounded-full ring-1 ring-current/30", dark ? "text-white hover:bg-white/15" : "text-text hover:bg-black/10")}
              >
                <ArrowRightIcon weight="bold" aria-hidden="true" />
              </Button>
            </div>
            <p className="justify-self-end type-small font-bold tabular-nums">
              <span className="sr-only">Kisaran </span>
              {/* Penghitung slide "03 / 05" seperti referensi (disetujui Fahren). */}
              {String(indexOf(shown) + 1).padStart(2, "0") /* taste-skill-ignore */}
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
