import { cn } from "cn"
import type { LucideIcon } from "lucide-react"

// PRD §23 Empty / Error State: ikon + judul + deskripsi + CTA, satu komponen, isi via props.
// PRD §26: setiap state punya judul, penjelasan, dan tindakan alternatif.

interface StateMessageProps {
  icon: LucideIcon
  title: string
  body: string
  children: React.ReactNode
  tone?: "neutral" | "danger"
  className?: string
}

export function StateMessage({ icon: Icon, title, body, children, tone = "neutral", className }: StateMessageProps) {
  return (
    <section
      role={tone === "danger" ? "alert" : undefined}
      className={cn("flex max-w-2xl flex-col items-start gap-4 rounded-card bg-surface p-6 md:p-8", className)}
    >
      <Icon className={tone === "danger" ? "size-8 text-danger" : "size-8 text-text-muted"} strokeWidth={1.5} aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <h2 className="type-h2 text-text">{title}</h2>
        <p className="type-body text-text-muted">{body}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  )
}
