import type { Laptop, Scenario } from "@/types";

// Verifikasi konsistensi mock data (PRD §27, §33). Ini BUKAN SAW: hanya memeriksa
// bahwa skor yang ditulis tangan cocok dengan breakdown-nya.

export interface MockIssue {
  scenarioId: string;
  laptopId?: string;
  message: string;
}

export interface MockCheckRow {
  scenarioId: string;
  laptopId: string;
  weightedSum: number;
  matchScore: number;
  ok: boolean;
}

export interface MockCheckReport {
  ok: boolean;
  rows: MockCheckRow[];
  issues: MockIssue[];
}

export function checkScenarios(scenarios: Scenario[], laptops: Laptop[]): MockCheckReport {
  const laptopIds = new Set(laptops.map((l) => l.id));
  const issues: MockIssue[] = [];
  const rows: MockCheckRow[] = [];

  for (const sc of scenarios) {
    const weightTotal = sc.profile.priorities.reduce((sum, p) => sum + (p.weight ?? 0), 0);
    if (weightTotal !== 100) {
      issues.push({ scenarioId: sc.id, message: `Jumlah bobot profil ${weightTotal}%, harus 100%` });
    }

    const categories = new Set<string>();
    sc.results.forEach((r, index) => {
      if (!laptopIds.has(r.laptopId)) {
        issues.push({ scenarioId: sc.id, laptopId: r.laptopId, message: "Laptop tidak ada di katalog" });
      }

      const resultWeight = r.breakdown.reduce((sum, b) => sum + b.weight, 0);
      if (resultWeight !== 100) {
        issues.push({ scenarioId: sc.id, laptopId: r.laptopId, message: `Bobot breakdown ${resultWeight}%` });
      }

      // Jumlahkan dalam bilangan bulat dulu agar tidak ada galat pembulatan.
      const weightedSum = r.breakdown.reduce((sum, b) => sum + b.weight * b.score, 0) / 100;
      const ok = Math.round(weightedSum) === r.matchScore;
      rows.push({ scenarioId: sc.id, laptopId: r.laptopId, weightedSum, matchScore: r.matchScore, ok });
      if (!ok) {
        issues.push({
          scenarioId: sc.id,
          laptopId: r.laptopId,
          message: `matchScore ${r.matchScore}, seharusnya ${Math.round(weightedSum)} (${weightedSum})`,
        });
      }

      if (index > 0 && r.matchScore > sc.results[index - 1].matchScore) {
        issues.push({ scenarioId: sc.id, laptopId: r.laptopId, message: "Urutan hasil tidak menurun" });
      }
      if (r.category) {
        if (categories.has(r.category)) {
          issues.push({ scenarioId: sc.id, laptopId: r.laptopId, message: `Kategori ${r.category} ganda` });
        }
        categories.add(r.category);
      }
    });

    if (sc.results[0]?.category !== "best-match") {
      issues.push({ scenarioId: sc.id, message: "Hasil pertama harus best-match" });
    }
  }

  return { ok: issues.length === 0, rows, issues };
}
