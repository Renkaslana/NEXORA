import type { CriterionId } from "@/types";

// Utilitas "Atur bobot detail" (PRD §15 step 5, terinspirasi Custom Ratings RTINGS).
// BUKAN SAW: hanya menjaga agar bobot yang diatur pengguna selalu berjumlah 100%.

export type WeightMap = Record<CriterionId, number>;

/** Bagi 100 rata ke semua kriteria; sisa pembulatan ke kriteria terakhir. */
export function equalWeights(criteria: CriterionId[]): WeightMap {
  const base = Math.floor(100 / criteria.length);
  const map = {} as WeightMap;
  criteria.forEach((c, i) => {
    map[c] = i === criteria.length - 1 ? 100 - base * (criteria.length - 1) : base;
  });
  return map;
}

/**
 * Set satu kriteria ke `value` (0–100) lalu sesuaikan kriteria lain secara proporsional
 * agar total tetap 100. Pembulatan memakai metode sisa terbesar.
 */
export function rebalance(weights: WeightMap, criterion: CriterionId, value: number): WeightMap {
  const target = Math.max(0, Math.min(100, Math.round(value)));
  const others = (Object.keys(weights) as CriterionId[]).filter((c) => c !== criterion);
  const remaining = 100 - target;
  const othersTotal = others.reduce((sum, c) => sum + weights[c], 0);

  const raw = others.map((c) => ({
    c,
    v: othersTotal > 0 ? (weights[c] / othersTotal) * remaining : remaining / others.length,
  }));
  const floored = raw.map((r) => ({ ...r, f: Math.floor(r.v) }));
  let leftover = remaining - floored.reduce((sum, r) => sum + r.f, 0);
  floored
    .slice()
    .sort((a, b) => b.v - b.f - (a.v - a.f))
    .forEach((r) => {
      if (leftover > 0) {
        r.f += 1;
        leftover -= 1;
      }
    });

  const next = { ...weights, [criterion]: target } as WeightMap;
  floored.forEach((r) => {
    next[r.c] = r.f;
  });
  return next;
}
