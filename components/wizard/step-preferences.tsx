"use client"

import * as React from "react"
import { cn } from "cn"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise"
import { ArrowDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowDown"
import { ArrowUpIcon } from "@phosphor-icons/react/dist/ssr/ArrowUp"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass"
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus"
import { XIcon } from "@phosphor-icons/react/dist/ssr/X"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Slider } from "@/components/ui/slider"
import { SelectCard } from "@/components/wizard/select-card"
import { getWizardOptions } from "@/lib/api"
import { MAX_PRIORITIES, useProfileStore, WEIGHT_CRITERIA } from "@/store/profile"
import type { CriterionId, SoftwareLoad } from "@/types"

// Langkah 4–5 Wizard (PRD §15).

const options = getWizardOptions()
const loadTone: Record<SoftwareLoad, "success" | "warning" | "danger"> = {
  ringan: "success",
  sedang: "warning",
  berat: "danger",
}
const loadLabel: Record<SoftwareLoad, string> = { ringan: "Ringan", sedang: "Sedang", berat: "Berat" }
const priorityLabel = (c: CriterionId) => options.priorities.find((p) => p.criterion === c)?.label ?? c

// ---------------------------------------------------------------- 4. Software

export function SoftwareStep() {
  const major = useProfileStore((s) => s.profile.major)
  const selected = useProfileStore((s) => s.profile.software)
  const toggleSoftware = useProfileStore((s) => s.toggleSoftware)
  const [query, setQuery] = React.useState("")

  const majorLabel = options.majors.find((m) => m.id === major)?.label
  const q = query.trim().toLowerCase()
  const matches = options.software.filter((s) => s.label.toLowerCase().includes(q))
  const suggested = matches.filter((s) => s.suggestedFor.includes(major))
  const others = matches.filter((s) => !s.suggestedFor.includes(major))

  const grid = (list: typeof matches) => (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {list.map((s) => (
        <SelectCard
          key={s.id}
          mode="multi"
          size="sm"
          title={s.label}
          selected={selected.includes(s.id)}
          onClick={() => toggleSoftware(s.id)}
          trailing={
            <Chip tone={loadTone[s.load]}>
              <span className="sr-only">Beban: </span>
              {loadLabel[s.load]}
            </Chip>
          }
        />
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <label className="flex max-w-md flex-col gap-1.5">
        <span className="type-small text-text">Cari aplikasi</span>
        <span className="flex h-11 items-center gap-2 rounded-control border border-border bg-bg px-3 focus-within:border-primary">
          <MagnifyingGlassIcon weight="bold" className="size-5 shrink-0 text-text-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mis. Figma, Docker, Excel"
            className="w-full bg-transparent type-body text-text outline-none placeholder:text-text-muted"
          />
        </span>
      </label>

      <p className="type-small font-normal text-text-muted" aria-live="polite">
        {selected.length > 0 ? `${selected.length} aplikasi dipilih.` : "Belum ada aplikasi dipilih."}{" "}
        <span className="text-text">Ringan</span> = jalan di laptop apa pun, <span className="text-text">Berat</span> =
        butuh RAM dan CPU lebih.
      </p>

      {matches.length === 0 && (
        <p className="rounded-card bg-surface p-4 type-small font-normal text-text">
          Tidak ada aplikasi bernama “{query}” di daftar. Kamu tetap bisa melanjutkan atau menekan Lewati.
        </p>
      )}

      {suggested.length > 0 && (
        <section aria-labelledby="sw-suggested" className="flex flex-col gap-3">
          <h2 id="sw-suggested" className="type-small text-text">
            Sering dipakai di {majorLabel}
          </h2>
          {grid(suggested)}
        </section>
      )}
      {others.length > 0 && (
        <section aria-labelledby="sw-others" className="flex flex-col gap-3">
          <h2 id="sw-others" className="type-small text-text">
            {suggested.length > 0 ? "Aplikasi lain" : "Semua aplikasi"}
          </h2>
          {grid(others)}
        </section>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- 5. Prioritas

function RankMode() {
  const ranked = useProfileStore((s) => s.ranked)
  const togglePriority = useProfileStore((s) => s.togglePriority)
  const movePriority = useProfileStore((s) => s.movePriority)
  const [announce, setAnnounce] = React.useState("")
  const full = ranked.length >= MAX_PRIORITIES

  const move = (c: CriterionId, dir: -1 | 1) => {
    const i = ranked.indexOf(c)
    movePriority(c, dir)
    setAnnounce(`${priorityLabel(c)} sekarang di urutan ${i + dir + 1}.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="ranked-title" className="flex flex-col gap-3">
        <h2 id="ranked-title" className="type-small text-text">
          Urutan prioritasmu ({ranked.length}/{MAX_PRIORITIES})
        </h2>
        {ranked.length === 0 ? (
          <p className="rounded-card bg-surface p-4 type-small font-normal text-text-muted">
            Belum ada. Pilih dari daftar di bawah; yang dipilih pertama menjadi prioritas nomor 1.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {ranked.map((c, i) => (
              <li key={c} className="flex items-center gap-3 rounded-card border border-primary bg-primary-soft p-2 pl-4">
                <span className="num w-5 type-body text-primary" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="flex-1 type-body font-semibold text-text">
                  <span className="sr-only">Prioritas {i + 1}: </span>
                  {priorityLabel(c)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={i === 0}
                  onClick={() => move(c, -1)}
                  aria-label={`Naikkan ${priorityLabel(c)}`}
                >
                  <ArrowUpIcon weight="bold" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={i === ranked.length - 1}
                  onClick={() => move(c, 1)}
                  aria-label={`Turunkan ${priorityLabel(c)}`}
                >
                  <ArrowDownIcon weight="bold" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePriority(c)}
                  aria-label={`Hapus ${priorityLabel(c)} dari prioritas`}
                >
                  <XIcon weight="bold" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ol>
        )}
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </section>

      <section aria-labelledby="pick-title" className="flex flex-col gap-3">
        <h2 id="pick-title" className="type-small text-text">
          Pilih prioritas
        </h2>
        {full && (
          <p className="type-small font-normal text-text-muted">
            Sudah tiga. Hapus salah satu di atas untuk menggantinya.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {options.priorities
            .filter((p) => !ranked.includes(p.criterion))
            .map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={full}
                onClick={() => togglePriority(p.criterion)}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-bg px-4 type-small text-text transition-colors duration-150 hover:border-border-strong hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PlusIcon weight="bold" className="size-4" aria-hidden="true" />
                {p.label}
              </button>
            ))}
        </div>
      </section>
    </div>
  )
}

function WeightMode() {
  const weightDraft = useProfileStore((s) => s.weightDraft)
  const setWeight = useProfileStore((s) => s.setWeight)
  const resetWeights = useProfileStore((s) => s.resetWeights)
  if (!weightDraft) return null
  const total = WEIGHT_CRITERIA.reduce((sum, c) => sum + weightDraft[c], 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="type-small font-normal text-text-muted">
          Geser bobot tiap kriteria. Kriteria lain menyesuaikan otomatis agar total tetap{" "}
          <span className="num text-text">100%</span>.
        </p>
        <Button variant="ghost" size="sm" onClick={resetWeights}>
          <ArrowCounterClockwiseIcon weight="bold" aria-hidden="true" /> Bagi rata
        </Button>
      </div>
      <ul className="flex flex-col gap-1">
        {WEIGHT_CRITERIA.map((c) => (
          <li key={c} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-4 py-1.5 sm:grid-cols-[9rem_1fr_3.5rem]">
            <span id={`w-${c}`} className="type-small text-text">
              {priorityLabel(c)}
            </span>
            <Slider
              value={[weightDraft[c]]}
              min={0}
              max={100}
              step={1}
              onValueChange={([v]) => setWeight(c, v)}
              thumbLabel={`Bobot ${priorityLabel(c)}`}
              getValueText={(v) => `${v} persen`}
              className="py-2.5"
            />
            <span className="num text-right type-small text-text" aria-hidden="true">
              {weightDraft[c]}%
            </span>
          </li>
        ))}
      </ul>
      <p className={cn("type-small", total === 100 ? "text-success" : "text-danger")} aria-live="polite">
        Total: <span className="num">{total}%</span>
      </p>
    </div>
  )
}

export function PriorityStep() {
  const mode = useProfileStore((s) => s.profile.priorityMode)
  const setPriorityMode = useProfileStore((s) => s.setPriorityMode)
  const hardFilters = useProfileStore((s) => s.profile.hardFilters)
  const toggleHardFilter = useProfileStore((s) => s.toggleHardFilter)

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        {mode === "rank" ? <RankMode /> : <WeightMode />}
        <Button
          variant="link"
          size="sm"
          className="self-start"
          onClick={() => setPriorityMode(mode === "rank" ? "weights" : "rank")}
        >
          {mode === "rank" ? "Atur bobot detail" : "Kembali ke urutan sederhana"}
        </Button>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 type-body font-semibold text-text">Syarat wajib (filter keras)</legend>
        <p className="type-small font-normal text-text-muted">
          Laptop yang tidak memenuhi syarat yang kamu centang tidak akan muncul sama sekali di hasil.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.hardFilters.map((f) => {
            const checked = hardFilters.includes(f.id)
            return (
              <label
                key={f.id}
                className={cn(
                  "flex min-h-11 cursor-pointer items-start gap-3 rounded-card border p-3 transition-colors duration-150",
                  checked ? "border-primary bg-primary-soft" : "border-border bg-bg hover:border-border-strong"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleHardFilter(f.id)}
                  className="mt-0.5 size-5 shrink-0 accent-primary"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="type-small text-text">{f.label}</span>
                  <span className="type-micro font-normal text-text-muted">{f.description}</span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
