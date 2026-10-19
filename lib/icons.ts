// Satu keluarga ikon: Phosphor (REDESIGN §12). Diimpor per ikon dari `dist/ssr/*` agar aman di
// Server Component dan tidak menarik seluruh paket (node_modules/next/dist/docs, local-development).
import type { Icon } from "@phosphor-icons/react/lib";
import { BatteryHighIcon } from "@phosphor-icons/react/dist/ssr/BatteryHigh";
import { BackpackIcon } from "@phosphor-icons/react/dist/ssr/Backpack";
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu";
import { CubeIcon } from "@phosphor-icons/react/dist/ssr/Cube";
import { GraphicsCardIcon } from "@phosphor-icons/react/dist/ssr/GraphicsCard";
import { HardDrivesIcon } from "@phosphor-icons/react/dist/ssr/HardDrives";
import { MemoryIcon } from "@phosphor-icons/react/dist/ssr/Memory";
import { MonitorIcon } from "@phosphor-icons/react/dist/ssr/Monitor";
import { WalletIcon } from "@phosphor-icons/react/dist/ssr/Wallet";
import type { CriterionId, SpecComponent } from "@/types";

export type { Icon };

/** Kategori spek menentukan warna tile (REDESIGN §10 "Kategori spek"). */
export type SpecCategory = "performa" | "memori" | "layar" | "mobilitas" | "umum";

interface SpecIcon {
  icon: Icon;
  category: SpecCategory;
  label: string;
}

export const SPEC_ICONS: Record<SpecComponent, SpecIcon> = {
  cpu: { icon: CpuIcon, category: "performa", label: "CPU" },
  gpu: { icon: GraphicsCardIcon, category: "performa", label: "GPU" },
  ram: { icon: MemoryIcon, category: "memori", label: "RAM" },
  storage: { icon: HardDrivesIcon, category: "memori", label: "Storage" },
  layar: { icon: MonitorIcon, category: "layar", label: "Layar" },
  baterai: { icon: BatteryHighIcon, category: "mobilitas", label: "Baterai" },
};

export const CRITERION_ICONS: Record<CriterionId, SpecIcon> = {
  performa: { ...SPEC_ICONS.cpu, label: "Performa" },
  gpu: SPEC_ICONS.gpu,
  ram: SPEC_ICONS.ram,
  storage: SPEC_ICONS.storage,
  layar: SPEC_ICONS.layar,
  baterai: SPEC_ICONS.baterai,
  portabilitas: { icon: BackpackIcon, category: "mobilitas", label: "Portabilitas" },
  budget: { icon: WalletIcon, category: "umum", label: "Budget" },
  build: { icon: CubeIcon, category: "umum", label: "Kualitas build" },
};
