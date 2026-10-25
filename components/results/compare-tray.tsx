"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowsLeftRight"
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown"
import { LaptopIcon } from "@phosphor-icons/react/dist/ssr/Laptop"
import { XIcon } from "@phosphor-icons/react/dist/ssr/X"
import { Button } from "@/components/ui/button"
import { MAX_COMPARE, rehydrateCompare, useCompareHydrated, useCompareStore } from "@/store/compare"

// PRD §23 Compare Tray ★ (1, 2, 3 item · Collapsed/Expanded), §17, §24, §25:
// mobile = bar bawah selebar layar, desktop = kotak mengambang kanan bawah (shadow-lg, §22).
// Item baru masuk dengan pop-in; efek "terbang" dari kartu belum dibuat.

export function compareHref(ids: string[]) {
  return `/bandingkan?ids=${ids.join(",")}`
}

interface CompareTrayProps {
  notice?: string | null
  /** Mobile: tray naik di atas bar CTA halaman (Detail). */
  raised?: boolean
}

export function CompareTray({ notice, raised = false }: CompareTrayProps) {
  const hydrated = useCompareHydrated()
  const items = useCompareStore((s) => s.items)
  const remove = useCompareStore((s) => s.remove)
  const reduceMotion = useReducedMotion()
  // Mobile: tertutup agar tidak menutupi konten; desktop: terbuka. Tray baru tampil setelah
  // hidrasi, jadi membaca matchMedia di sini tidak menimbulkan hydration mismatch.
  const [expanded, setExpanded] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  )
  const listId = React.useId()

  React.useEffect(() => {
    rehydrateCompare()
  }, [])

  if (!hydrated || items.length === 0) return null

  const ready = items.length >= 2
  const pop = reduceMotion
    ? {}
    : { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 } }

  return (
    <aside
      aria-label="Daftar komparasi"
      className={cn(
        "fixed inset-x-0 z-40 border-t border-border bg-bg shadow-lg",
        raised ? "bottom-[81px]" : "bottom-0",
        "md:inset-x-auto md:right-6 md:bottom-6 md:w-[23rem] md:rounded-card md:border"
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((e) => !e)}
          className="flex min-h-11 flex-1 items-center gap-2 rounded-control text-left"
        >
          <ArrowsLeftRightIcon weight="bold" className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="flex flex-col">
            <span className="type-small text-text">
              <span className="num">{items.length}</span> dari {MAX_COMPARE} laptop dipilih
            </span>
            <span className="type-micro text-text-muted">
              {ready ? "Siap dibandingkan" : "Pilih minimal 1 laptop lagi"}
            </span>
          </span>
          <CaretDownIcon weight="bold"
            className={cn("ml-auto size-5 text-text-muted transition-transform duration-200", expanded && "rotate-180")}
            aria-hidden="true"
          />
          <span className="sr-only">{expanded ? "Sembunyikan daftar" : "Tampilkan daftar"}</span>
        </button>
        {ready ? (
          <Button asChild size="sm">
            <Link href={compareHref(items.map((i) => i.id))}>
              <span>Bandingkan (<span className="num">{items.length}</span>)</span>
            </Link>
          </Button>
        ) : (
          <Button size="sm" aria-disabled="true" className="cursor-not-allowed opacity-50 hover:bg-primary">
            <span>Bandingkan (<span className="num">{items.length}</span>)</span>
          </Button>
        )}
      </div>

      <div id={listId} hidden={!expanded} className="border-t border-border px-4 py-3">
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li key={item.id} layout={!reduceMotion} {...pop} transition={{ duration: 0.2 }} className="flex items-center gap-3">
                <span aria-hidden="true" className="grid aspect-[4/3] w-14 shrink-0 place-items-center rounded-control bg-surface text-text-muted">
                  <LaptopIcon weight="bold" className="size-4" />
                </span>
                <Link href={`/laptop/${item.slug}`} className="min-w-0 flex-1 truncate type-small text-text hover:underline">
                  {item.name}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(item.id)}
                  aria-label={`Hapus ${item.name} dari komparasi`}
                >
                  <XIcon weight="bold" aria-hidden="true" />
                </Button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {notice && (
          <p role="status" className="pt-2 type-small text-warning">
            {notice}
          </p>
        )}
      </div>
    </aside>
  )
}
