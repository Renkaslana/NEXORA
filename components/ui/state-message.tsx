import { cn } from "cn"
import type { Icon } from "@/lib/icons"

// PRD §23 Empty / Error State: ikon + judul + deskripsi + CTA, satu komponen, isi via props.
// PRD §26: setiap state punya judul, penjelasan, dan tindakan alternatif.

interface StateMessageProps {
  icon: Icon
  title: string
  body: string
  children: React.ReactNode
  tone?: "neutral" | "danger"
  className?: string
}

export function StateMessage({ icon: IconComponent, title, body, children, tone = "neutral", className }: StateMessageProps) {
  return (
    <section
      role={tone === "danger" ? "alert" : undefined}
      className={cn("flex max-w-2xl flex-col items-start gap-4 rounded-card bg-surface p-6 md:p-8", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-12 place-items-center rounded-[12px]",
          tone === "danger" ? "bg-danger-soft text-danger" : "bg-paper-100 text-text-muted"
        )}
      >
        <IconComponent weight="duotone" size={28} />
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="type-h2 text-text">{title}</h2>
        <p className="type-body text-text-muted">{body}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  )
}
