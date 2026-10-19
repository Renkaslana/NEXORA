"use client"

import * as React from "react"
import { cn } from "cn"
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star"
import type { Icon } from "@/lib/icons"

// PRD §23 Select Card ★: Single/Multi · Default/Hover/Selected/Disabled · dengan/tanpa ikon
// · badge "Utama". Elemen `button` asli dengan `aria-pressed` agar Tab berpindah kartu dan
// Spasi/Enter memilih (PRD §15, §28). Tampilan REDESIGN §14: ikon di tile yang ikut berubah saat
// hover/terpilih, tekan scale(0.98), centang "pop" dengan kurva pegas (CSS, tanpa JS per frame).

interface SelectCardProps extends Omit<React.ComponentProps<"button">, "title" | "onSelect"> {
  mode?: "single" | "multi"
  selected?: boolean
  icon?: Icon
  title: string
  description?: string
  /** Baris kecil di bawah judul, mis. "Persona: Teknik & Informatika". */
  meta?: string
  /** Tandai aktivitas utama (PRD §15 step 3). */
  primary?: boolean
  /** Elemen kecil di kanan bawah, mis. tag beban software. */
  trailing?: React.ReactNode
  size?: "md" | "sm"
}

/** Overshoot kecil ≈ spring-soft (REDESIGN §13). */
const POP = "ease-[cubic-bezier(0.34,1.56,0.64,1)]"

function SelectCard({
  mode = "single",
  selected = false,
  icon: IconComponent,
  title,
  description,
  meta,
  primary = false,
  trailing,
  size = "md",
  disabled,
  className,
  ...props
}: SelectCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      data-selected={selected || undefined}
      className={cn(
        "group relative flex w-full min-h-11 flex-col items-start gap-3 rounded-card border border-border bg-bg text-left",
        "transition-[border-color,background-color,box-shadow,transform] duration-[var(--motion-fast)] ease-out",
        "hover:border-border-strong hover:shadow-sm active:scale-[0.98]",
        "data-selected:border-primary data-selected:bg-blue-50 data-selected:hover:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none disabled:active:scale-100",
        size === "md" ? "p-4 pr-12" : "px-3 py-2.5 pr-10",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute flex items-center justify-center border transition-colors duration-[var(--motion-fast)]",
          size === "md" ? "top-4 right-4 size-5" : "top-3 right-3 size-4",
          mode === "single" ? "rounded-full" : "rounded-[5px]",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-bg"
        )}
      >
        <CheckIcon
          weight="bold"
          className={cn(
            "size-3 transition-[opacity,transform] duration-[var(--motion-medium)]",
            POP,
            selected ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>

      {IconComponent && (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex shrink-0 items-center justify-center transition-colors duration-[var(--motion-fast)]",
            size === "md" ? "size-10 rounded-[10px]" : "size-8 rounded-[8px]",
            selected
              ? "bg-blue-700 text-white"
              : "bg-paper-100 text-text-muted group-hover:bg-blue-100 group-hover:text-blue-800 group-disabled:group-hover:bg-paper-100"
          )}
        >
          <IconComponent weight="duotone" className={size === "md" ? "size-6" : "size-5"} />
        </span>
      )}

      <span className="flex flex-col gap-0.5">
        <span className={cn("font-semibold text-text", size === "md" ? "type-body" : "type-small")}>{title}</span>
        {description && <span className="type-small font-normal text-text-muted">{description}</span>}
        {meta && <span className="type-micro font-medium tracking-normal text-text-muted">{meta}</span>}
      </span>

      {(primary || trailing) && (
        <span className="mt-auto flex flex-wrap items-center gap-1.5">
          {primary && (
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-primary px-2 type-micro text-primary-foreground">
              <StarIcon weight="fill" className="size-3" aria-hidden="true" />
              Utama
            </span>
          )}
          {trailing}
        </span>
      )}
    </button>
  )
}

export { SelectCard }
export type { SelectCardProps }
