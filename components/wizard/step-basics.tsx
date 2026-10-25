"use client"

import { cn } from "cn"
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star"
import { BudgetSlider } from "@/components/wizard/budget-slider"
import { getOptionIcon } from "@/components/wizard/option-icon"
import { SelectCard } from "@/components/wizard/select-card"
import { getBudgetInsight, getWizardOptions } from "@/lib/api"
import { useProfileStore } from "@/store/profile"

// Langkah 1–3 Wizard (PRD §15).

const options = getWizardOptions()
const personaLabel = (id: string) => options.personas.find((p) => p.id === id)?.label ?? id

// ---------------------------------------------------------------- 1. Budget

export function BudgetStep() {
  const budget = useProfileStore((s) => s.profile.budget)
  const setBudget = useProfileStore((s) => s.setBudget)
  const setFlexible = useProfileStore((s) => s.setFlexible)
  const insight = getBudgetInsight(budget.max, budget.flexible)

  return (
    <BudgetSlider
      value={budget.max}
      onValueChange={setBudget}
      range={options.budgetRange}
      presets={options.budgetPresets}
      flexible={budget.flexible}
      onFlexibleChange={setFlexible}
      feedback={{ typicalSpec: insight.typicalSpec, laptopCount: insight.laptopCount }}
      className="max-w-2xl"
    />
  )
}

// ---------------------------------------------------------------- 2. Jurusan

export function MajorStep() {
  const major = useProfileStore((s) => s.profile.major)
  const setMajor = useProfileStore((s) => s.setMajor)

  return (
    <div role="group" aria-labelledby="step-question" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {options.majors.map((m) => (
        <SelectCard
          key={m.id}
          mode="single"
          icon={getOptionIcon(m.icon)}
          title={m.label}
          meta={`Persona: ${personaLabel(m.persona)}`}
          selected={major === m.id}
          onClick={() => setMajor(m.id)}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------- 3. Aktivitas

export function ActivityStep() {
  const activities = useProfileStore((s) => s.profile.activities)
  const primary = useProfileStore((s) => s.profile.primaryActivity)
  const toggleActivity = useProfileStore((s) => s.toggleActivity)
  const setPrimary = useProfileStore((s) => s.setPrimaryActivity)
  const selected = options.activities.filter((a) => activities.includes(a.id))

  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-labelledby="step-question" className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {options.activities.map((a) => (
          <SelectCard
            key={a.id}
            mode="multi"
            icon={getOptionIcon(a.icon)}
            title={a.label}
            selected={activities.includes(a.id)}
            primary={primary === a.id}
            onClick={() => toggleActivity(a.id)}
          />
        ))}
      </div>

      {selected.length === 1 && (
        <p className="flex items-center gap-2 type-small font-normal text-text">
          <StarIcon weight="fill" className="size-4 text-primary" aria-hidden="true" />
          <span>
            <strong className="font-semibold">{selected[0].label}</strong> menjadi aktivitas utama. Pilih aktivitas
            lain bila ada.
          </span>
        </p>
      )}

      {selected.length > 1 && (
        <fieldset className="flex flex-col gap-3 rounded-card bg-surface p-4 md:p-5">
          <legend className="float-left mb-3 w-full type-body font-semibold text-text">
            Mana yang paling utama?
          </legend>
          <p className="clear-both -mt-1 type-small font-normal text-text-muted">
            Sistem memakai aktivitas utama untuk menentukan spek yang paling penting.
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((a) => (
              <label
                key={a.id}
                className={cn(
                  "inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 type-small transition-colors duration-150",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                  primary === a.id
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-bg text-text hover:border-border-strong"
                )}
              >
                <input
                  type="radio"
                  name="primary-activity"
                  value={a.id}
                  checked={primary === a.id}
                  onChange={() => setPrimary(a.id)}
                  className="sr-only"
                />
                <StarIcon weight={primary === a.id ? "fill" : "regular"} className="size-4" aria-hidden="true" />
                {a.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  )
}
