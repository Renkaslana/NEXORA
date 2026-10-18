import { formatRupiah, formatRupiahShort, formatStorage, formatWeight } from "@/lib/format";
import { checkSpecs, type CheckStatus } from "@/lib/spec-check";
import type { Laptop, RecommendationResult, RequirementProfile, SpecComponent, UserProfile } from "@/types";

// Baris tabel Komparasi (PRD §18). Hanya menyusun tampilan dari data mock:
// - status ✓/✕ dari lib/spec-check.ts (ambang ≥ min) dan budget pengguna;
// - "unggul" = nilai terbaik di baris lewat perbandingan angka biasa (maks/min).
// BUKAN SAW: tidak ada normalisasi atau pembobotan.

export type CellStatus = CheckStatus | "near";

export interface CompareCell {
  laptopId: string;
  text: string;
  status: CellStatus;
  best: boolean;
}

export interface CompareRow {
  id: string;
  label: string;
  need: string;
  cells: CompareCell[];
  /** true bila semua laptop punya nilai yang sama (disembunyikan saat "Hanya perbedaan"). */
  same: boolean;
}

interface Input {
  laptops: Laptop[];
  requirement: RequirementProfile | null;
  profile: UserProfile | null;
  results: Map<string, RecommendationResult>;
}

/** Tandai nilai terbaik; tidak ada "unggul" bila semua nilai sama. */
function markBest(values: number[], higherIsBetter: boolean): boolean[] {
  const target = higherIsBetter ? Math.max(...values) : Math.min(...values);
  const allSame = values.every((v) => v === values[0]);
  return values.map((v) => !allSame && v === target);
}

export function buildCompareRows({ laptops, requirement, profile, results }: Input): CompareRow[] {
  const checks = new Map(laptops.map((l) => [l.id, requirement ? checkSpecs(requirement, l) : []]));
  const need = (c: SpecComponent) => requirement?.specs.find((s) => s.component === c)?.minimum ?? "—";
  const status = (l: Laptop, c: SpecComponent): CellStatus =>
    checks.get(l.id)?.find((r) => r.component === c)?.status ?? "unchecked";

  const specRow = (
    id: SpecComponent,
    label: string,
    text: (l: Laptop) => string,
    value: (l: Laptop) => number,
    higherIsBetter = true
  ): CompareRow => {
    const best = markBest(laptops.map(value), higherIsBetter);
    const texts = laptops.map(text);
    return {
      id,
      label,
      need: need(id),
      cells: laptops.map((l, i) => ({ laptopId: l.id, text: texts[i], status: status(l, id), best: best[i] })),
      same: texts.every((t) => t === texts[0]),
    };
  };

  const rows: CompareRow[] = [];

  // Kecocokan (dari hasil rekomendasi mock; laptop di luar hasil = "—").
  const scores = laptops.map((l) => results.get(l.id)?.matchScore ?? -1);
  const scoreBest = markBest(scores, true);
  rows.push({
    id: "kecocokan",
    label: "Kecocokan",
    need: "—",
    cells: laptops.map((l, i) => ({
      laptopId: l.id,
      text: scores[i] >= 0 ? `${scores[i]}%` : "—",
      status: "unchecked",
      best: scores[i] >= 0 && scoreBest[i],
    })),
    same: scores.every((s) => s === scores[0]),
  });

  rows.push(specRow("cpu", "CPU", (l) => `${l.cpu.name} (${l.cpu.cores} core)`, (l) => l.cpu.benchScore));
  rows.push(specRow("ram", "RAM", (l) => `${l.ram.gb} GB${l.ram.upgradeable ? `, maks ${l.ram.maxGb}` : ""}`, (l) => l.ram.gb));
  rows.push(specRow("storage", "Storage", (l) => formatStorage(l.storage.gb), (l) => l.storage.gb));
  rows.push(
    specRow(
      "gpu",
      "GPU",
      (l) => (l.gpu.type === "dedicated" ? `${l.gpu.name} ${l.gpu.vramGb} GB` : `${l.gpu.name} (integrated)`),
      (l) => (l.gpu.type === "dedicated" ? l.gpu.vramGb : 0)
    )
  );
  rows.push(
    specRow(
      "layar",
      "Layar",
      (l) => `${String(l.display.inch).replace(".", ",")}″ ${l.display.panel}, ${l.display.srgbPercent}% sRGB`,
      (l) => l.display.srgbPercent
    )
  );
  rows.push(specRow("baterai", "Baterai", (l) => `${l.batteryWh} Wh`, (l) => l.batteryWh));

  // Bobot: diperiksa hanya bila pengguna memilih syarat wajib "Bobot di bawah 1,3 kg".
  const weightLimit = profile?.hardFilters.includes("bobot-1-3") ? 1.3 : null;
  const weightBest = markBest(laptops.map((l) => l.weightKg), false);
  const weightTexts = laptops.map((l) => formatWeight(l.weightKg));
  rows.push({
    id: "bobot",
    label: "Bobot",
    need: weightLimit ? "< 1,3 kg" : "—",
    cells: laptops.map((l, i) => ({
      laptopId: l.id,
      text: weightTexts[i],
      status: weightLimit ? (l.weightKg < weightLimit ? "met" : "short") : "unchecked",
      best: weightBest[i],
    })),
    same: weightTexts.every((t) => t === weightTexts[0]),
  });

  // Harga vs budget: ≤ budget = Memenuhi; ≤ budget + 10% (bila fleksibel) = Mendekati.
  const budget = profile?.budget;
  const priceBest = markBest(laptops.map((l) => l.priceIdr), false);
  const priceTexts = laptops.map((l) => formatRupiah(l.priceIdr));
  rows.push({
    id: "harga",
    label: "Harga (contoh)",
    need: budget ? `≤ ${formatRupiahShort(budget.max)}${budget.flexible ? " (±10%)" : ""}` : "—",
    cells: laptops.map((l, i) => ({
      laptopId: l.id,
      text: priceTexts[i],
      status: !budget
        ? "unchecked"
        : l.priceIdr <= budget.max
          ? "met"
          : budget.flexible && l.priceIdr <= budget.max * 1.1
            ? "near"
            : "short",
      best: priceBest[i],
    })),
    same: priceTexts.every((t) => t === priceTexts[0]),
  });

  return rows;
}

/** Ringkasan "Paling cocok untukmu" (PRD §18): disusun dari baris di atas, bukan dihitung ulang. */
export function compareVerdict(rows: CompareRow[], laptops: Laptop[], results: Map<string, RecommendationResult>) {
  const scored = laptops.filter((l) => results.has(l.id));
  if (scored.length === 0) return null;
  const winner = [...scored].sort((a, b) => results.get(b.id)!.matchScore - results.get(a.id)!.matchScore)[0];
  const checked = rows.filter((r) => r.cells.some((c) => c.status !== "unchecked"));
  const metCount = (id: string) =>
    checked.filter((r) => {
      const s = r.cells.find((c) => c.laptopId === id)?.status;
      return s === "met" || s === "near";
    }).length;

  const first = `Skor kecocokan tertinggi (${results.get(winner.id)!.matchScore}%) dan memenuhi ${metCount(winner.id)} dari ${checked.length} kebutuhan yang diperiksa.`;

  const runnerUp = laptops.find((l) => l.id !== winner.id);
  let second = "";
  if (runnerUp) {
    const cellOf = (r: CompareRow) => r.cells.find((c) => c.laptopId === runnerUp.id);
    // "Harga (contoh)" → "harga"; singkatan seperti CPU/RAM/GPU tetap kapital.
    const word = (r: CompareRow) => {
      const label = r.label.replace(/\s*\(.*\)$/, "");
      return /^[A-Z]{2,}$/.test(label) ? label : label.toLowerCase();
    };
    const better = rows.filter((r) => r.id !== "kecocokan" && cellOf(r)?.best).map(word);
    const short = rows.filter((r) => cellOf(r)?.status === "short").map(word);
    const name = `${runnerUp.brand} ${runnerUp.model}`;
    const list = (items: string[]) => items.slice(0, 2).join(" dan ");
    if (better.length && short.length) second = `${name} unggul di ${list(better)}, tapi kurang di ${list(short)}.`;
    else if (better.length) second = `${name} unggul di ${list(better)}, tapi skor kecocokannya lebih rendah.`;
    else if (short.length) second = `${name} kurang di ${list(short)}.`;
  }
  return { winner, text: [first, second].filter(Boolean).join(" ") };
}
