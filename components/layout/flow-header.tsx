import Link from "next/link"
import { cn } from "cn"
import { Wordmark } from "@/components/layout/navbar"

// Header ringkas untuk alur rekomendasi (Wizard, Profil Kebutuhan, dst.): logo + Keluar.
// `tone="cobalt"` untuk layar ber-bidang kobalt (Analisis).
export function FlowHeader({ tone = "default" }: { tone?: "default" | "cobalt" }) {
  const cobalt = tone === "cobalt"
  return (
    <header
      data-tone={cobalt ? "cobalt" : undefined}
      className={cn(cobalt ? "bg-cobalt-600" : "border-b border-border bg-bg")}
    >
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Wordmark tone={tone} />
        <Link
          href="/"
          className={cn(
            "inline-flex min-h-11 items-center rounded-control px-3 type-small",
            cobalt ? "text-cobalt-100 hover:bg-cobalt-700 hover:text-white" : "text-text-muted hover:bg-surface hover:text-text"
          )}
        >
          Keluar
        </Link>
      </div>
    </header>
  )
}
