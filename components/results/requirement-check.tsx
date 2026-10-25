import { cn } from "cn"
import { CircleDashedIcon } from "@phosphor-icons/react/dist/ssr/CircleDashed"
import { componentMeta } from "@/components/profile/requirement-card"
import { Chip, StatusChip } from "@/components/ui/chip"
import type { SpecCheckResult } from "@/lib/spec-check"
import type { SpecRequirement } from "@/types"

// PRD §19 "Berdasarkan kebutuhanmu": spek minimum vs laptop ini (pola PCPartPicker §10).
// Status selalu ikon + teks: ✓ Memenuhi, ✕ Kurang (§11, §28). Hasil cek dari lib/spec-check.ts.

interface RequirementCheckProps {
  specs: SpecRequirement[]
  results: SpecCheckResult[]
  className?: string
}

export function RequirementCheck({ specs, results, className }: RequirementCheckProps) {
  return (
    <ul className={cn("flex flex-col divide-y divide-border rounded-card border border-border", className)}>
      {specs.map((spec) => {
        const r = results.find((x) => x.component === spec.component)!
        const { label, icon: Icon } = componentMeta[spec.component]
        return (
          <li key={spec.component} className="grid gap-2 p-4 sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
            <p className="flex items-center gap-2 type-small text-text">
              <Icon className="size-5 shrink-0 text-text-muted" aria-hidden="true" />
              {label}
            </p>
            <p className="type-small font-normal text-text-muted">
              <span className="sm:sr-only">Butuh: </span>
              {spec.minimum}
              {spec.level === "opsional" && <span className="ml-1">(opsional)</span>}
            </p>
            <p className="type-small text-text">
              <span className="font-normal text-text-muted sm:sr-only">Laptop ini: </span>
              {r.actual}
            </p>
            <div className="sm:justify-self-end">
              {r.status === "met" && <StatusChip status="met" />}
              {r.status === "short" && <StatusChip status="short" />}
              {r.status === "unchecked" && (
                <Chip tone="muted">
                  <CircleDashedIcon weight="bold" className="size-3.5" aria-hidden="true" />
                  Tidak dicek
                </Chip>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Header kolom untuk layar lebar (disembunyikan dari screen reader; tiap baris sudah berlabel). */
export function RequirementCheckHeader() {
  return (
    <div aria-hidden="true" className="hidden gap-4 px-4 type-micro text-text-muted sm:grid sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <span>Komponen</span>
      <span>Kebutuhanmu</span>
      <span>Laptop ini</span>
      <span className="w-24 text-right">Status</span>
    </div>
  )
}
