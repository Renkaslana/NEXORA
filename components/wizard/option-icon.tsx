import {
  Box,
  Briefcase,
  Calculator,
  ChartColumn,
  Code,
  Cog,
  Cpu,
  Ellipsis,
  FileText,
  Film,
  Gamepad2,
  Network,
  Palette,
  PenTool,
  Ruler,
  type LucideIcon,
} from "lucide-react"

// Peta kunci ikon di `data/options.ts` → ikon Lucide (PRD §22: stroke 1.5px, 20/24px).
const icons: Record<string, LucideIcon> = {
  code: Code,
  network: Network,
  chart: ChartColumn,
  palette: Palette,
  ruler: Ruler,
  cog: Cog,
  briefcase: Briefcase,
  calculator: Calculator,
  file: FileText,
  more: Ellipsis,
  pen: PenTool,
  film: Film,
  box: Box,
  gamepad: Gamepad2,
  cpu: Cpu,
}

export function getOptionIcon(key: string): LucideIcon {
  return icons[key] ?? Ellipsis
}
