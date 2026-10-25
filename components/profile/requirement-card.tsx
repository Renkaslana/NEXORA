import { cn } from "cn"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { BatteryFullIcon } from "@phosphor-icons/react/dist/ssr/BatteryFull"
import { CircleDashedIcon } from "@phosphor-icons/react/dist/ssr/CircleDashed"
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu"
import { GraphicsCardIcon } from "@phosphor-icons/react/dist/ssr/GraphicsCard"
import { HardDrivesIcon } from "@phosphor-icons/react/dist/ssr/HardDrives"
import { MemoryIcon } from "@phosphor-icons/react/dist/ssr/Memory"
import { MonitorIcon } from "@phosphor-icons/react/dist/ssr/Monitor"
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck"
import { ThumbsUpIcon } from "@phosphor-icons/react/dist/ssr/ThumbsUp"
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning"
import type { RequirementLevel, RequirementProfile, RequirementWarning, SpecComponent, SpecRequirement } from "@/types"

// PRD §23 Spec Requirement Card ★ (Wajib/Disarankan/Opsional) dan ringkasan Profil Kebutuhan (§16).
// Tingkat kepentingan selalu ikon + teks, tidak hanya warna (§16, §28).

export const componentMeta: Record<SpecComponent, { label: string; icon: PhosphorIcon }> = {
  cpu: { label: "CPU", icon: CpuIcon },
  ram: { label: "RAM", icon: MemoryIcon },
  storage: { label: "Storage", icon: HardDrivesIcon },
  gpu: { label: "GPU", icon: GraphicsCardIcon },
  layar: { label: "Layar", icon: MonitorIcon },
  baterai: { label: "Baterai", icon: BatteryFullIcon },
}

const levelMeta: Record<RequirementLevel, { label: string; icon: PhosphorIcon; className: string }> = {
  wajib: { label: "Wajib", icon: ShieldCheckIcon, className: "bg-primary-soft text-primary" },
  disarankan: { label: "Disarankan", icon: ThumbsUpIcon, className: "bg-surface text-text" },
  opsional: { label: "Opsional", icon: CircleDashedIcon, className: "bg-surface text-text-muted" },
}

export function LevelBadge({ level }: { level: RequirementLevel }) {
  const { label, icon: Icon, className } = levelMeta[level]
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 type-micro", className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}

/** Satu baris spek: komponen, saran minimum, tingkat, alasan. */
export function SpecRow({ spec, showReason = true }: { spec: SpecRequirement; showReason?: boolean }) {
  const { label, icon: Icon } = componentMeta[spec.component]
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className="mt-0.5 size-5 shrink-0 text-text-muted" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="type-small text-text">
            <span className="text-text-muted">{label} · </span>
            {spec.minimum}
          </p>
          <LevelBadge level={spec.level} />
        </div>
        {showReason && <p className="type-small font-normal text-text-muted">{spec.reason}</p>}
      </div>
    </li>
  )
}

export function WarningBanner({ warning, compact = false }: { warning: RequirementWarning; compact?: boolean }) {
  return (
    <div role="note" className="flex gap-3 rounded-control bg-warning/8 p-3 text-text">
      <WarningIcon weight="bold" className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="type-small text-text">
          <span className="sr-only">Peringatan: </span>
          {warning.message}
        </p>
        {!compact && <p className="type-small font-normal text-text-muted">{warning.detail}</p>}
        <p className="type-micro text-warning">{warning.actions.map((a) => a.label).join(" · ")}</p>
      </div>
    </div>
  )
}

interface RequirementCardProps {
  requirement: RequirementProfile
  /** Chip ringkasan profil, mis. ["Budget Rp8 jt", "Informatika"]. */
  profileChips: string[]
  /** Batasi komponen yang ditampilkan. */
  only?: SpecComponent[]
  showReasons?: boolean
  heading?: string
  className?: string
  footer?: React.ReactNode
}

export function RequirementCard({
  requirement,
  profileChips,
  only,
  showReasons = true,
  heading = "Profil Kebutuhan",
  className,
  footer,
}: RequirementCardProps) {
  const specs = only ? requirement.specs.filter((s) => only.includes(s.component)) : requirement.specs
  return (
    <section aria-label={heading} className={cn("flex flex-col gap-4 rounded-card border border-border bg-bg p-5", className)}>
      <header className="flex flex-col gap-2">
        <p className="type-small text-text">{heading}</p>
        <ul className="flex flex-wrap gap-1.5" aria-label="Ringkasan profil">
          {profileChips.map((c) => (
            <li key={c} className="inline-flex h-7 items-center rounded-full bg-surface px-2.5 type-micro text-text">
              {c}
            </li>
          ))}
        </ul>
        <p className="type-small font-normal text-text-muted">{requirement.summary}</p>
      </header>
      {requirement.warnings.map((w) => (
        <WarningBanner key={w.id} warning={w} />
      ))}
      <ul className="flex flex-col divide-y divide-border">
        {specs.map((s) => (
          <SpecRow key={s.component} spec={s} showReason={showReasons} />
        ))}
      </ul>
      {footer}
    </section>
  )
}
