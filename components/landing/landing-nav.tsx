"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List"
import { XIcon } from "@phosphor-icons/react/dist/ssr/X"
import { useHeroTone } from "@/components/landing/hero-tone"
import { Wordmark } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"

// Navbar landing SPECO (brief SPECO §4–10, disetujui Fahren Okt 2026): selebar layar, bukan kapsul.
// - Di atas hero: transparan, menyatu dengan foto; hanya gradien keterbacaan yang sangat tipis (terang di
//   kisaran kertas terang, gelap tipis di kisaran kobalt). Teks & logo mengikuti nada slide aktif.
// - Setelah scroll 48 px: putih hangat rgba(247,245,240,.88) + blur + garis bawah tipis, 72 → 64 px,
//   transisi 400 ms ease-out. Blur hanya di sini (pengecualian kaca khusus navbar, disetujui Fahren).
// - Menu aktif ditandai garis tipis di bawah label (IntersectionObserver pada section tujuan).

const links = [
  { id: "hero", label: "Beranda" },
  { id: "simulasi-budget", label: "Simulasi Budget" },
  { id: "cara-kerja", label: "Cara Kerja" },
  { id: "kuis-ai", label: "Kuis AI" },
  { id: "hasil-analisis", label: "Skor & Hasil" },
  { id: "brand-laptop", label: "Brand Laptop" },
  { id: "tentang", label: "Tentang" },
]
const THRESHOLD = 48

function useActiveSection(ids: string[]) {
  const [active, setActive] = React.useState<string | null>(null)
  React.useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el))
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id)
          else setActive((cur) => (cur === e.target.id ? null : cur))
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids])
  return active
}

export function LandingNav() {
  const reduce = useReducedMotion()
  const { tone } = useHeroTone()
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const menuId = React.useId()
  const ids = React.useMemo(() => links.map((l) => l.id), [])
  const active = useActiveSection(ids)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > THRESHOLD))
  // Posisi awal (mis. reload di tengah halaman): disinkronkan setelah frame pertama.
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setScrolled(window.scrollY > THRESHOLD))
    return () => cancelAnimationFrame(id)
  }, [])

  /** Teks putih hanya saat di atas hero kobalt dan belum di-scroll. */
  const onDark = !scrolled && !open && tone === "dark"
  const ease = { duration: reduce ? 0 : 0.4, ease: "easeOut" } as const

  return (
    <header data-tone={onDark ? "cobalt" : undefined} className="fixed inset-x-0 top-0 z-50">
      {/* Gradien keterbacaan di atas foto (bukan bar): memudar saat navbar berubah ke putih hangat. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        initial={false}
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={ease}
        style={{
          background:
            tone === "dark"
              ? "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0))" // taste-skill-ignore: scrim keterbacaan (brief SPECO §6)
              : "linear-gradient(to bottom, rgba(247,245,240,0.45), rgba(247,245,240,0))", // taste-skill-ignore: scrim keterbacaan (brief SPECO §6)
        }}
      />
      <motion.div
        className={"relative border-b" /* taste-skill-ignore: garis bawah tipis saat scroll (brief SPECO §8) */}
        initial={false}
        animate={{
          backgroundColor: scrolled || open ? "rgba(247,245,240,0.88)" : "rgba(247,245,240,0)",
          borderColor: scrolled || open ? "rgba(17,17,17,0.08)" : "rgba(17,17,17,0)",
          backdropFilter: scrolled || open ? "blur(14px)" : "blur(0px)",
        }}
        transition={ease}
      >
        <motion.div
          className="page-container flex items-center justify-between gap-6"
          initial={false}
          animate={{ height: scrolled ? 64 : 72 }}
          transition={ease}
        >
          <Wordmark tone={onDark ? "cobalt" : "default"} />

          <nav aria-label="Utama" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {links.map((l) => {
                const on = active === l.id
                return (
                  <li key={l.id}>
                    <Link
                      href={`#${l.id}`}
                      aria-current={on ? "location" : undefined}
                      className={cn(
                        "group relative inline-flex min-h-11 items-center type-body font-medium transition-colors duration-300",
                        onDark ? "text-white" : "text-ink-strong"
                      )}
                    >
                      {l.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-x-0 bottom-2 h-[1.5px] origin-left rounded-full bg-current transition-transform duration-300 ease-out",
                          on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                        )}
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              className="hidden rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-5 py-2 shadow-sm transition-[background-color,transform] hover:-translate-y-0.5 md:inline-flex"
            >
              <Link href="/rekomendasi/budget">
                Cari Laptop <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-[12px] md:hidden", onDark ? "text-white hover:bg-white/15" : "text-ink-strong hover:bg-black/5")}
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <XIcon weight="bold" aria-hidden="true" /> : <ListIcon weight="bold" aria-hidden="true" />}
            </Button>
          </div>
        </motion.div>

        {/* Menu seluler: laci sederhana di bawah navbar. */}
        <nav id={menuId} aria-label="Menu seluler" hidden={!open} className="page-container pb-4 md:hidden">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.id}>
                <Link
                  href={`#${l.id}`}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center type-body-l font-semibold text-ink-strong"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild variant="signal" className="mt-2 w-full rounded-[12px]">
            <Link href="/rekomendasi/budget" onClick={() => setOpen(false)}>
              Mulai Rekomendasi <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
            </Link>
          </Button>
        </nav>
      </motion.div>
    </header>
  )
}
