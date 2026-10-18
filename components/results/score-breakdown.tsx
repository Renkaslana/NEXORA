import { cn } from "cn"
import { getWizardOptions } from "@/lib/api"
import { formatDecimal } from "@/lib/format"
import type { RecommendationResult } from "@/types"

// PRD §23 Score Breakdown ★, §27 lapis 3: bar horizontal berbobot. Panjang bar = skor laptop
// di kriteria itu; tebal bar + label = bobot dari prioritas pengguna. Angka mock; total dicek
// konsisten oleh lib/mock-check.ts. Kontribusi hanya menampilkan bobot × skor dari mock.

const { criterionLabels } = getWizardOptions()

export function ScoreBreakdown({ result, className }: { result: RecommendationResult; className?: string }) {
  const rows = [...result.breakdown].sort((a, b) => b.weight - a.weight)
  const total = rows.reduce((sum, r) => sum + (r.weight * r.score) / 100, 0)

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ul className="flex flex-col gap-4" aria-label="Rincian skor per kriteria">
        {rows.map((r) => {
          const contribution = (r.weight * r.score) / 100
          return (
            <li key={r.criterion} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 sm:grid-cols-[9rem_minmax(0,1fr)_7rem]">
              <p className="type-small text-text">
                {criterionLabels[r.criterion]}
                <span className="ml-2 inline-flex h-6 items-center rounded-full bg-primary-soft px-2 type-micro text-primary">
                  <span className="sr-only">bobot </span>
                  <span className="num">{r.weight}%</span>
                </span>
              </p>
              <p className="text-right type-small text-text-muted sm:order-last">
                <span className="sr-only">skor </span>
                <span className="num text-text">{r.score}</span>
                <span className="mx-1" aria-hidden="true">·</span>
                <span className="sr-only">kontribusi </span>
                <span className="num">+{formatDecimal(contribution)}</span>
              </p>
              <span
                aria-hidden="true"
                className="col-span-2 flex items-center rounded-full bg-border sm:col-span-1"
                style={{ height: 4 + r.weight / 4 }}
              >
                <span className="h-full rounded-full bg-primary" style={{ width: `${r.score}%` }} />
              </span>
            </li>
          )
        })}
      </ul>
      <div className="flex items-baseline justify-between border-t border-border pt-3">
        <p className="type-small text-text">Total (Σ bobot × skor)</p>
        <p className="type-body text-text">
          <span className="num">{formatDecimal(total)}</span>
          <span className="mx-1.5 text-text-muted" aria-hidden="true">≈</span>
          <span className="num font-semibold">{result.matchScore}%</span>
        </p>
      </div>
      <p className="type-micro text-text-muted">
        Bar makin tebal = bobot makin besar dari prioritasmu. Angka contoh (data demo).
      </p>
    </div>
  )
}
