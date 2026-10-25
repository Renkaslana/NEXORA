import { cn } from "cn"
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown"
import { componentMeta, LevelBadge } from "@/components/profile/requirement-card"
import type { SpecRequirement } from "@/types"

// PRD §23 Spec Requirement Card ★ · Wajib/Disarankan/Opsional (halaman Profil Kebutuhan §16).
// Penjelasan istilah memakai disclosure (<details>) agar bisa dibuka dengan keyboard dan sentuhan (§28).

interface SpecRequirementCardProps {
  spec: SpecRequirement
  glossary?: { term: string; explanation: string }
  className?: string
}

export function SpecRequirementCard({ spec, glossary, className }: SpecRequirementCardProps) {
  const { label, icon: Icon } = componentMeta[spec.component]
  const optional = spec.level === "opsional"

  return (
    <article
      aria-labelledby={`spec-${spec.component}`}
      className={cn(
        "flex flex-col gap-4 rounded-card p-5",
        optional ? "bg-surface" : "border border-border bg-bg",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 text-text-muted">
          <Icon className="size-5" aria-hidden="true" />
          <span className="type-small">{label}</span>
        </span>
        <LevelBadge level={spec.level} />
      </div>

      <div className="flex flex-col gap-2">
        <h3 id={`spec-${spec.component}`} className="type-h3 text-text">
          <span className="sr-only">{label}: </span>
          {spec.minimum}
        </h3>
        <p className="type-body text-text">{spec.reason}</p>
      </div>

      {glossary && (
        <details className="group mt-auto">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-control type-small text-primary hover:underline [&::-webkit-details-marker]:hidden">
            Apa itu {glossary.term}?
            <CaretDownIcon weight="bold" className="size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="pt-1 type-small font-normal text-text-muted">{glossary.explanation}</p>
        </details>
      )}
    </article>
  )
}
