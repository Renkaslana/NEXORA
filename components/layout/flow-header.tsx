import Link from "next/link"
import { cn } from "cn"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft"
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut"
import { Wordmark } from "@/components/layout/navbar"

// Header ringkas untuk alur rekomendasi (Wizard, Profil Kebutuhan, dst.): logo + Keluar.
// `tone="cobalt"` untuk layar ber-bidang kobalt (Analisis). `back` menambah tautan "Kembali" (Hasil → Profil).
export function FlowHeader({
  tone = "default",
  back,
}: {
  tone?: "default" | "cobalt"
  back?: { href: string; label?: string }
}) {
  const cobalt = tone === "cobalt"
  return (
    <header
      data-tone={cobalt ? "cobalt" : undefined}
      className={cn(cobalt ? "bg-cobalt-600" : "border-b border-border bg-bg")}
    >
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Wordmark tone={tone} />
        <nav aria-label="Navigasi alur" className="flex items-center gap-2">
          {back && (
            <Link
              href={back.href}
              className={cn(
                "group inline-flex min-h-11 items-center gap-2 rounded-control px-3 type-small",
                cobalt ? "text-cobalt-100 hover:bg-cobalt-700 hover:text-white" : "text-text-muted hover:bg-surface hover:text-text"
              )}
            >
              <ArrowLeftIcon weight="bold" className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true" />
              {back.label ?? "Kembali"}
            </Link>
          )}
          <Link
            href="/"
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-control px-3 type-small",
              back && !cobalt && "border border-border px-4 text-text hover:bg-surface",
              !back && (cobalt ? "text-cobalt-100 hover:bg-cobalt-700 hover:text-white" : "text-text-muted hover:bg-surface hover:text-text")
            )}
          >
            {back && <SignOutIcon weight="bold" className="size-4" aria-hidden="true" />}
            Keluar
          </Link>
        </nav>
      </div>
    </header>
  )
}
