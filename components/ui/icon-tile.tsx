import { cn } from "@/lib/utils";
import type { Icon, SpecCategory } from "@/lib/icons";

// Tile ikon kategori spek (REDESIGN §10, §12): kategori dibedakan lewat tingkat biru + netral,
// bukan hue baru. Ikon Phosphor duotone; dekoratif, jadi label selalu ada di teks sebelahnya.

const TONE: Record<SpecCategory, string> = {
  performa: "bg-blue-700 text-white",
  memori: "bg-blue-100 text-blue-800",
  layar: "bg-paper-100 text-text",
  mobilitas: "bg-ink-950 text-white",
  umum: "bg-bg text-text ring-1 ring-border ring-inset",
};

const SIZE = {
  md: { box: "size-10 rounded-[10px]", icon: 24 },
  sm: { box: "size-8 rounded-[8px]", icon: 20 },
} as const;

export function IconTile({
  icon: IconComponent,
  category,
  size = "md",
  className,
}: {
  icon: Icon;
  category: SpecCategory;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center justify-center", SIZE[size].box, TONE[category], className)}
    >
      <IconComponent size={SIZE[size].icon} weight="duotone" />
    </span>
  );
}
