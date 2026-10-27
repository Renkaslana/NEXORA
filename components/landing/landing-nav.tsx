"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "motion/react"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List"
import { XIcon } from "@phosphor-icons/react/dist/ssr/X"
import { Wordmark } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"

// Navbar landing mengambang (brief redesign landing §4, disetujui Fahren): kaca transparan di atas hero,
// lalu berubah halus menjadi putih hangat bertepi tipis saat di-scroll (72 → 64 px). Nilainya diturunkan
// langsung dari posisi scroll (bukan berganti kelas), jadi tidak pernah meloncat. Blur hanya di sini
// (pengecualian glassmorphism khusus navbar, disetujui Fahren).

const links = [
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#transparansi", label: "Transparansi" },
  { href: "#tentang", label: "Tentang" },
]

/** Jarak scroll (px) sampai navbar berubah penuh. */
const SETTLE = 140

export function LandingNav() {
  const reduce = useReducedMotion()
  const [open, setOpen] = React.useState(false)
  const menuId = React.useId()
  const { scrollY } = useScroll()
  const t = useTransform(scrollY, [0, SETTLE], [0, 1], { clamp: true })

  const height = useTransform(t, [0, 1], [72, 64])
  const bgAlpha = useTransform(t, [0, 1], [0.5, 0.88])
  const lineAlpha = useTransform(t, [0, 1], [0.45, 1])
  const shadowAlpha = useTransform(t, [0, 1], [0, 0.06])
  const background = useMotionTemplate`rgba(247, 245, 240, ${bgAlpha})`
  const borderColor = useMotionTemplate`rgba(220, 218, 210, ${lineAlpha})`
  const boxShadow = useMotionTemplate`0 8px 24px rgba(23, 23, 23, ${shadowAlpha})`

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 lg:px-10">
      <motion.div
        style={{ background, borderColor, boxShadow, height: reduce ? 64 : height }}
        className={"pointer-events-auto mx-auto flex max-w-[1240px] items-center justify-between gap-4 rounded-[18px] border px-3 text-ink-strong backdrop-blur-md backdrop-saturate-150 sm:px-5" /* taste-skill-ignore: kaca hanya di navbar, disetujui Fahren */}
      >
        <Wordmark />

        <nav aria-label="Utama" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={"relative inline-flex min-h-11 items-center px-3 type-small text-ink-strong after:absolute after:inset-x-3 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-[var(--motion-medium)] after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100" /* taste-skill-ignore: garis bawah muncul saat hover (brief §28) */}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Button asChild variant="signal" size="sm" className="hidden rounded-[12px] px-4 md:inline-flex">
            <Link href="/rekomendasi/budget">
              Mulai Rekomendasi <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="signal" size="icon" className="rounded-[12px] md:hidden">
            <Link href="/rekomendasi/budget" aria-label="Mulai Rekomendasi">
              <ArrowRightIcon weight="bold" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-[12px] text-ink-strong hover:bg-black/5 md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <XIcon weight="bold" aria-hidden="true" /> : <ListIcon weight="bold" aria-hidden="true" />}
          </Button>
        </div>
      </motion.div>

      <nav
        id={menuId}
        aria-label="Menu seluler"
        hidden={!open}
        className="pointer-events-auto mx-auto mt-2 max-w-[1240px] rounded-[18px] border border-canvas-line bg-canvas p-2 md:hidden"
      >
        <ul className="flex flex-col">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn("flex min-h-12 items-center rounded-[12px] px-3 type-body font-semibold text-ink-strong hover:bg-black/5")}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
