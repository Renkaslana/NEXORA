"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List"
import { XIcon } from "@phosphor-icons/react/dist/ssr/X"
import { Button } from "@/components/ui/button"

// PRD §13, §23, §24 Navbar: logo kiri, "Cara Kerja" + "Jelajahi Laptop", CTA kanan.
// Mobile: logo + hamburger + CTA ikon. Sticky, latar putih.

// "Jelajahi Laptop" (/jelajah, PRD §8 Should have) disembunyikan sampai halamannya dibuat
// agar demo tidak menemui 404. Tambahkan kembali: { href: "/jelajah", label: "Jelajahi Laptop" }.
const links = [
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#persona", label: "Persona" },
]

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex min-h-11 items-center gap-2 rounded-control text-text", className)}>
      <span aria-hidden="true" className="grid size-7 place-items-center rounded-control bg-primary">
        <span className="h-3 w-3.5 rounded-[2px] border-2 border-primary-foreground border-b-[3px]" />
      </span>
      <span className="text-[17px] leading-none font-bold tracking-[-0.01em]">NEXORA</span>
    </Link>
  )
}

export function Navbar({ ctaHref = "/rekomendasi/budget", showCta = true }: { ctaHref?: string; showCta?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const menuId = React.useId()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Wordmark />

        <nav aria-label="Utama" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-11 items-center rounded-control px-3 type-small text-text transition-colors hover:bg-paper-100"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          {showCta && (
            <>
              <Button asChild size="sm" className="hidden md:inline-flex">
                <Link href={ctaHref}>Mulai Rekomendasi</Link>
              </Button>
              <Button asChild size="icon" className="md:hidden">
                <Link href={ctaHref} aria-label="Mulai Rekomendasi">
                  <ArrowRightIcon weight="bold" aria-hidden="true" />
                </Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <XIcon weight="bold" aria-hidden="true" /> : <ListIcon weight="bold" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      <nav id={menuId} aria-label="Menu seluler" hidden={!open} className="border-t border-border md:hidden">
        <ul className="page-container flex flex-col py-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center type-body font-semibold text-text"
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
