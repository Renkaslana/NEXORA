"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List"
import { XIcon } from "@phosphor-icons/react/dist/ssr/X"
import { Button } from "@/components/ui/button"

// PRD §13, §23, §24 Navbar: logo kiri, "Cara Kerja" + "Jelajahi Laptop", CTA kanan.
// Mobile: logo + hamburger + CTA ikon. Sticky, latar putih; `tone="cobalt"` di landing (menyatu
// dengan hero kobalt; CTA navbar memakai inverse agar kuning hanya di aksi utama hero).

// "Jelajahi Laptop" (/jelajah, PRD §8 Should have) disembunyikan sampai halamannya dibuat
// agar demo tidak menemui 404. Tambahkan kembali: { href: "/jelajah", label: "Jelajahi Laptop" }.
const links = [
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#persona", label: "Persona" },
]

export function Wordmark({ className, tone = "default" }: { className?: string; tone?: "default" | "cobalt" }) {
  const cobalt = tone === "cobalt"
  return (
    <Link
      href="/"
      className={cn("inline-flex min-h-11 items-center gap-2 rounded-control", cobalt ? "text-white" : "text-text", className)}
    >
      <span aria-hidden="true" className={cn("grid size-7 place-items-center rounded-control", cobalt ? "bg-white" : "bg-primary")}>
        <span
          className={cn(
            "h-3 w-3.5 rounded-[2px] border-2 border-b-[3px]",
            cobalt ? "border-cobalt-600" : "border-primary-foreground"
          )}
        />
      </span>
      <span className="text-[17px] leading-none font-bold tracking-[-0.01em]">NEXORA</span>
    </Link>
  )
}

export function Navbar({
  ctaHref = "/rekomendasi/budget",
  showCta = true,
  tone = "default",
}: {
  ctaHref?: string
  showCta?: boolean
  tone?: "default" | "cobalt"
}) {
  const [open, setOpen] = React.useState(false)
  const menuId = React.useId()
  const cobalt = tone === "cobalt"

  return (
    <header
      data-tone={cobalt ? "cobalt" : undefined}
      className={cn("sticky top-0 z-40", cobalt ? "bg-cobalt-600 text-white" : "border-b border-border bg-bg")}
    >
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Wordmark tone={tone} />

        <nav aria-label="Utama" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-control px-3 type-small transition-colors",
                    cobalt ? "text-white hover:bg-cobalt-700" : "text-text hover:bg-paper-100"
                  )}
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
              <Button asChild size="sm" variant={cobalt ? "inverse" : "primary"} className="hidden md:inline-flex">
                <Link href={ctaHref}>Mulai Rekomendasi</Link>
              </Button>
              <Button asChild size="icon" variant={cobalt ? "inverse" : "primary"} className="md:hidden">
                <Link href={ctaHref} aria-label="Mulai Rekomendasi">
                  <ArrowRightIcon weight="bold" aria-hidden="true" />
                </Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("md:hidden", cobalt && "text-white hover:bg-cobalt-700 active:bg-cobalt-800")}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <XIcon weight="bold" aria-hidden="true" /> : <ListIcon weight="bold" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      <nav id={menuId} aria-label="Menu seluler" hidden={!open} className={cn("md:hidden", cobalt ? "bg-cobalt-700" : "border-t border-border")}>
        <ul className="page-container flex flex-col py-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn("flex min-h-12 items-center type-body font-semibold", cobalt ? "text-white" : "text-text")}
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
