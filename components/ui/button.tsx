import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr/CircleNotch"
import { Slot } from "radix-ui"

// PRD §23 Button: Primary, Secondary, Ghost, Link · S/M/L · loading.
// Radius 8px (§22). Tinggi M/L ≥ 44px; S 36px dengan area sentuh diperluas ke 44px (§24).
// REDESIGN §14: tekan scale(0.97); ikon panah penutup (`data-arrow`, atau ArrowRight Lucide lama)
// bergeser 3px saat hover; secondary yang `aria-pressed` tampil terpilih.
// signal/inverse: untuk bidang kobalt (redesign "Kalimat terbelah").
const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap transition-[color,background-color,border-color,transform] duration-[var(--motion-fast)] ease-out select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_[data-arrow]]:transition-transform hover:[&_[data-arrow]]:translate-x-[3px]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "border border-border bg-bg text-text hover:border-border-strong hover:bg-paper-100 active:bg-surface-hover aria-pressed:border-primary aria-pressed:bg-blue-50",
        /* Aksi utama di bidang kobalt: satu-satunya pemakaian kuning sinyal. */
        signal: "bg-signal text-signal-ink hover:bg-signal-hover active:bg-signal-active",
        /* Aksi kedua di bidang kobalt. */
        inverse:
          "border border-white/50 text-white hover:border-white hover:bg-cobalt-700 active:bg-cobalt-800 aria-pressed:border-white aria-pressed:bg-white aria-pressed:text-cobalt-600",
        ghost: "text-text hover:bg-surface active:bg-surface-hover",
        link: "h-auto px-0 text-primary underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        sm: "h-9 px-3 type-small after:absolute after:-inset-1 [&_svg]:size-4",
        md: "h-11 px-4 text-[15px] leading-6 [&_svg]:size-5",
        lg: "h-14 px-6 type-body-l font-semibold [&_svg]:size-5",
        icon: "size-11 [&_svg]:size-5",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }

function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <CircleNotchIcon weight="bold" className="animate-spin" aria-hidden="true" />}
          {children}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
