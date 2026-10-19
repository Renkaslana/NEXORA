import { formatStorage } from "@/lib/format";
import type { Laptop, RequirementProfile, SpecComponent, SpecMetric } from "@/types";

// Daftar periksa "spek minimum vs laptop ini" (PRD §19, pola PCPartPicker §10).
// Hanya membandingkan angka spek laptop dengan ambang di mock (≥ min). BUKAN SAW:
// tidak ada normalisasi, pembobotan, atau pemeringkatan.

export type CheckStatus = "met" | "short" | "unchecked";

export interface SpecCheckResult {
  component: SpecComponent;
  status: CheckStatus;
  /** Nilai laptop dalam bahasa awam, mis. "16 GB DDR5". */
  actual: string;
}

export function metricValue(laptop: Laptop, metric: SpecMetric): number {
  switch (metric) {
    case "cpuBench":
      return laptop.cpu.benchScore;
    case "ramGb":
      return laptop.ram.gb;
    case "ramMaxGb":
      return laptop.ram.upgradeable ? laptop.ram.maxGb : laptop.ram.gb;
    case "storageGb":
      return laptop.storage.gb;
    case "gpuDedicated":
      return laptop.gpu.type === "dedicated" ? 1 : 0;
    case "srgbPercent":
      return laptop.display.srgbPercent;
    case "screenInch":
      return laptop.display.inch;
    case "batteryWh":
      return laptop.batteryWh;
  }
}

function actualText(laptop: Laptop, component: SpecComponent): string {
  switch (component) {
    case "cpu":
      return `${laptop.cpu.name} (${laptop.cpu.cores} core)`;
    case "ram":
      return `${laptop.ram.gb} GB ${laptop.ram.type}${laptop.ram.upgradeable ? `, bisa sampai ${laptop.ram.maxGb} GB` : ", tidak bisa ditambah"}`;
    case "storage":
      return `${formatStorage(laptop.storage.gb)} ${laptop.storage.type}`;
    case "gpu":
      return `${laptop.gpu.name}${laptop.gpu.type === "dedicated" ? ` ${laptop.gpu.vramGb} GB` : " (integrated)"}`;
    case "layar":
      return `${String(laptop.display.inch).replace(".", ",")}″ ${laptop.display.panel}, ${laptop.display.srgbPercent}% sRGB`;
    case "baterai":
      return `${laptop.batteryWh} Wh`;
  }
}

export function checkSpecs(requirement: RequirementProfile, laptop: Laptop): SpecCheckResult[] {
  return requirement.specs.map((spec) => {
    const check = requirement.checks?.[spec.component];
    const status: CheckStatus = !check ? "unchecked" : metricValue(laptop, check.metric) >= check.min ? "met" : "short";
    return { component: spec.component, status, actual: actualText(laptop, spec.component) };
  });
}
