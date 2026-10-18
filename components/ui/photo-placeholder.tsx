import { cn } from "cn"
import { Laptop } from "lucide-react"

// Placeholder foto produk 4:3 (PRD §22 Imagery). Diganti foto asli tiga perempat
// berlatar `surface` saat aset tersedia.
function PhotoPlaceholder({
  label = "Foto laptop",
  tone = "light",
  className,
  iconClassName,
}: {
  label?: string
  /** light = `surface`; mid = sedikit lebih gelap untuk hero. */
  tone?: "light" | "mid"
  className?: string
  iconClassName?: string
}) {
  return (
    <div
      role="img"
      aria-label={`${label} (placeholder)`}
      className={cn(
        "relative flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 overflow-hidden text-text-muted",
        tone === "light" ? "bg-surface" : "bg-surface-hover",
        className
      )}
    >
      <Laptop className={cn("size-10 stroke-[1.25]", iconClassName)} aria-hidden="true" />
      <span className="type-micro">{label}</span>
    </div>
  )
}

export { PhotoPlaceholder }
