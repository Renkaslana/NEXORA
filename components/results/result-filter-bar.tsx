"use client"

import { cn } from "cn"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise"
import { Button } from "@/components/ui/button"

// Bar filter Hasil (PRD §17, disetujui Fahren sebagai bar, bukan sidebar): hanya mempersempit
// tampilan (merek, ukuran layar) dan mengurutkan; tidak mengubah profil.

export type ResultSort = "skor" | "harga" | "bobot"

export interface ResultFilters {
  brands: string[]
  sizes: number[]
  sort: ResultSort
}

export const defaultFilters: ResultFilters = { brands: [], sizes: [], sort: "skor" }

interface ResultFilterBarProps {
  brands: string[]
  sizes: number[]
  value: ResultFilters
  onChange: (next: ResultFilters) => void
  shown: number
  total: number
}

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

function FilterChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 shrink-0 items-center rounded-full border px-4 type-small transition-colors duration-150",
        selected
          ? "border-primary bg-primary-soft text-primary"
          : "border-border bg-bg text-text hover:border-border-strong hover:bg-surface"
      )}
    >
      {children}
    </button>
  )
}

export function ResultFilterBar({ brands, sizes, value, onChange, shown, total }: ResultFilterBarProps) {
  const active = value.brands.length > 0 || value.sizes.length > 0
  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div role="group" aria-label="Filter merek" className="flex flex-wrap items-center gap-2">
          <span className="type-small text-text-muted">Merek</span>
          {brands.map((b) => (
            <FilterChip key={b} selected={value.brands.includes(b)} onClick={() => onChange({ ...value, brands: toggle(value.brands, b) })}>
              {b}
            </FilterChip>
          ))}
        </div>
        {sizes.length > 1 && (
          <div role="group" aria-label="Filter ukuran layar" className="flex flex-wrap items-center gap-2">
            <span className="type-small text-text-muted">Layar</span>
            {sizes.map((s) => (
              <FilterChip key={s} selected={value.sizes.includes(s)} onClick={() => onChange({ ...value, sizes: toggle(value.sizes, s) })}>
                <span className="num">{String(s).replace(".", ",")}″</span>
              </FilterChip>
            ))}
          </div>
        )}
        <label className="flex items-center gap-2 lg:ml-auto">
          <span className="type-small text-text-muted">Urutkan</span>
          <select
            value={value.sort}
            onChange={(e) => onChange({ ...value, sort: e.target.value as ResultSort })}
            className="h-11 rounded-control border border-border bg-bg px-3 type-small text-text focus-visible:border-primary"
          >
            <option value="skor">Skor tertinggi</option>
            <option value="harga">Harga terendah</option>
            <option value="bobot">Paling ringan</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="type-small font-normal text-text-muted" aria-live="polite">
          Menampilkan <span className="num text-text">{shown}</span> dari <span className="num">{total}</span> alternatif.
          Best Match selalu ditampilkan.
        </p>
        {active && (
          <Button variant="ghost" size="sm" onClick={() => onChange({ ...value, brands: [], sizes: [] })}>
            <ArrowCounterClockwiseIcon weight="bold" aria-hidden="true" /> Hapus filter
          </Button>
        )}
      </div>
    </div>
  )
}
