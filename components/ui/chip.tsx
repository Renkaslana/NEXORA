import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning"
import { XIcon } from "@phosphor-icons/react/dist/ssr/X"

// PRD §23 Chip/Tag: Filter, Selected, Status. Pill hanya untuk chip & badge (§22).
// Status selalu ikon + teks, tidak hanya warna (§11, §28).
const chipVariants = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-full border type-micro whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-bg text-text",
        muted: "border-transparent bg-surface text-text-muted",
        primary: "border-transparent bg-primary-soft text-primary",
        success: "border-transparent bg-success/8 text-success",
        warning: "border-transparent bg-warning/8 text-warning",
        danger: "border-transparent bg-danger/8 text-danger",
      },
      size: {
        sm: "h-6 px-2",
        md: "h-8 px-3 type-small",
      },
    },
    defaultVariants: { tone: "neutral", size: "sm" },
  }
)

function Chip({
  className,
  tone,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof chipVariants>) {
  return <span className={cn(chipVariants({ tone, size }), className)} {...props} />
}

const statusMap = {
  met: { tone: "success", icon: CheckIcon, text: "Memenuhi" },
  short: { tone: "danger", icon: XIcon, text: "Kurang" },
  tradeoff: { tone: "warning", icon: WarningIcon, text: "Trade-off" },
} as const

function StatusChip({
  status,
  children,
  className,
}: {
  status: keyof typeof statusMap
  children?: React.ReactNode
  className?: string
}) {
  const { tone, icon: Icon, text } = statusMap[status]
  return (
    <Chip tone={tone} className={className}>
      <Icon className="size-3.5" aria-hidden="true" />
      {children ?? text}
    </Chip>
  )
}

export { Chip, StatusChip, chipVariants }
