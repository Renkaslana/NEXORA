import Link from "next/link"
import { Wordmark } from "@/components/layout/navbar"

// Header ringkas untuk alur rekomendasi (Wizard, Profil Kebutuhan, dst.): logo + Keluar.
export function FlowHeader() {
  return (
    <header className="border-b border-border bg-bg">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Wordmark />
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-control px-3 type-small text-text-muted hover:bg-surface hover:text-text"
        >
          Keluar
        </Link>
      </div>
    </header>
  )
}
