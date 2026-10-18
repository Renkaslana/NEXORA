"use client"

import * as React from "react"
import { cn } from "cn"
import { Check, Star, type LucideIcon } from "lucide-react"

// PRD §23 Select Card ★: Single/Multi · Default/Hover/Selected/Disabled · dengan/tanpa ikon
// · badge "Utama". Elemen `button` asli dengan `aria-pressed` agar Tab berpindah kartu dan
// Spasi/Enter memilih (PRD §15, §28). Terpilih: border + `primary-soft` + centang (§25).

interface SelectCardProps extends Omit<React.ComponentProps<"button">, "title" | "onSelect"> {
  mode?: "single" | "multi"
  selected?: boolean
  icon?: LucideIcon
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

function SelectCard({
  mode = "single",
  selected = false,
  icon: Icon,
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
        "group relative flex w-full min-h-11 flex-col items-start gap-2 rounded-card border bg-bg text-left transition-[border-color,background-color,box-shadow] duration-150 ease-out",
        "hover:border-border-strong hover:shadow-sm",
        "data-selected:border-primary data-selected:bg-primary-soft data-selected:hover:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none",
        size === "md" ? "p-4 pr-12" : "px-3 py-2.5 pr-10",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute flex items-center justify-center border transition-colors duration-150",
          size === "md" ? "top-4 right-4 size-5" : "top-3 right-3 size-4",
          mode === "single" ? "rounded-full" : "rounded-[4px]",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-bg"
        )}
      >
        <Check
          className={cn(
            "size-3 transition-[opacity,transform] duration-150",
            selected ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
          strokeWidth={3}
        />
      </span>

      {Icon && (
        <Icon
          aria-hidden="true"
          strokeWidth={1.5}
          className={cn(
            "shrink-0 transition-colors duration-150",
            size === "md" ? "size-6" : "size-5",
            selected ? "text-primary" : "text-text-muted"
          )}
        />
      )}

      <span className="flex flex-col gap-0.5">
        <span className={cn("font-semibold text-text", size === "md" ? "type-body" : "type-small")}>{title}</span>
        {description && <span className="type-small font-normal text-text-muted">{description}</span>}
        {meta && <span className="type-micro text-text-muted">{meta}</span>}
      </span>

      {(primary || trailing) && (
        <span className="mt-auto flex flex-wrap items-center gap-1.5">
          {primary && (
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-primary px-2 type-micro text-primary-foreground">
              <Star className="size-3 fill-current" aria-hidden="true" />
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
