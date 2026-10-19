import { BriefcaseIcon } from "@phosphor-icons/react/dist/ssr/Briefcase"
import { CalculatorIcon } from "@phosphor-icons/react/dist/ssr/Calculator"
import { ChartBarIcon } from "@phosphor-icons/react/dist/ssr/ChartBar"
import { CodeIcon } from "@phosphor-icons/react/dist/ssr/Code"
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu"
import { CubeIcon } from "@phosphor-icons/react/dist/ssr/Cube"
import { DotsThreeIcon } from "@phosphor-icons/react/dist/ssr/DotsThree"
import { FileTextIcon } from "@phosphor-icons/react/dist/ssr/FileText"
import { FilmSlateIcon } from "@phosphor-icons/react/dist/ssr/FilmSlate"
import { GameControllerIcon } from "@phosphor-icons/react/dist/ssr/GameController"
import { GearIcon } from "@phosphor-icons/react/dist/ssr/Gear"
import { NetworkIcon } from "@phosphor-icons/react/dist/ssr/Network"
import { PaletteIcon } from "@phosphor-icons/react/dist/ssr/Palette"
import { PenNibIcon } from "@phosphor-icons/react/dist/ssr/PenNib"
import { RulerIcon } from "@phosphor-icons/react/dist/ssr/Ruler"
import type { Icon } from "@/lib/icons"

// Peta kunci ikon di `data/options.ts` → ikon Phosphor (REDESIGN §12). Ditampilkan duotone di tile.
const icons: Record<string, Icon> = {
  code: CodeIcon,
  network: NetworkIcon,
  chart: ChartBarIcon,
  palette: PaletteIcon,
  ruler: RulerIcon,
  cog: GearIcon,
  briefcase: BriefcaseIcon,
  calculator: CalculatorIcon,
  file: FileTextIcon,
  more: DotsThreeIcon,
  pen: PenNibIcon,
  film: FilmSlateIcon,
  box: CubeIcon,
  gamepad: GameControllerIcon,
  cpu: CpuIcon,
}

export function getOptionIcon(key: string): Icon {
  return icons[key] ?? DotsThreeIcon
}
