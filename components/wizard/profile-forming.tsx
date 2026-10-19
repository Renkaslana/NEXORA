"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown"
import { LaptopRender } from "@/components/ui/laptop-render"
import { NeedMeter } from "@/components/ui/need-meter"
import { RowList, useRows } from "@/components/wizard/profile-summary"
import { getBudgetPreset, getPersonaForMajor, getRequirements } from "@/lib/api"
import { representativeRender } from "@/lib/laptop-image"
import { DURATION, EASE_OUT } from "@/lib/motion"
import { needMeterRows } from "@/lib/need-meter"
import { useProfileStore, type WizardStepId } from "@/store/profile"
import type { RequirementProfile } from "@/types"

// Panel "Profil kamu terbentuk" (REDESIGN §17, gerak 7; PRD §15, §25). Render mini mengikuti
// persona + tier budget; meter CPU/RAM/SSD muncul setelah jurusan dipilih, dari getRequirements().
// Saat budget/jurusan berubah, meter lama tetap tampil (label "memperbarui…") sampai data baru datang.

const SHOWN = ["cpu", "ram", "storage"] as const

/** Dipanggil sekali di WizardShell, lalu dibagi ke panel desktop & strip mobile. */
export function useFormingRequirement() {
  const profile = useProfileStore((s) => s.profile)
  const persona = profile.major ? getPersonaForMajor(profile.major) : null
  const tier = getBudgetPreset(profile.budget.max).id
  const key = persona ? `${persona}-${tier}` : null
  const [state, setState] = React.useState<{ key: string; requirement: RequirementProfile } | null>(null)

  React.useEffect(() => {
    if (!key) return
    let alive = true
    getRequirements(profile).then(
      (requirement) => alive && setState({ key, requirement }),
      () => {}
    )
    return () => {
      alive = false
    }
    // Kebutuhan mock hanya bergantung pada persona + tier, jadi cukup ambil ulang saat key berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return {
    persona,
    tier,
    requirement: key ? state?.requirement : undefined,
    updating: Boolean(key) && state?.key !== key,
  }
}

export type Forming = ReturnType<typeof useFormingRequirement>

function Meters({ forming, size }: { forming: Forming; size: "compact" | "mini" }) {
  const { persona, requirement, updating } = forming
  if (!persona) {
    return size === "mini" ? null : (
      <p className="type-small font-normal text-text-muted">Pilih jurusan untuk melihat spek yang kamu butuh.</p>
    )
  }
  if (!requirement) {
    return <p className="type-small font-normal text-text-muted">Menyusun kebutuhanmu…</p>
  }
  const rows = needMeterRows(requirement).filter((r) => (SHOWN as readonly string[]).includes(r.component))
  return (
    <div className={cn("flex", size === "mini" ? "gap-3" : "flex-col gap-3.5")} aria-busy={updating}>
      {rows.map((r, i) => (
        <NeedMeter
          key={r.component}
          component={r.component}
          scale={r.scale}
          need={r.need}
          index={i}
          size={size}
          className={cn(size === "mini" && "flex-1", updating && "opacity-60 transition-opacity")}
        />
      ))}
    </div>
  )
}

function MiniRender({ forming }: { forming: Forming }) {
  const reduce = useReducedMotion()
  const image = representativeRender(forming.persona, forming.tier)
  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-studio">
      <AnimatePresence initial={false}>
        <motion.div
          key={`${image.shape}-${image.color}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : DURATION.medium, ease: EASE_OUT }}
        >
          <LaptopRender image={image} sizes="360px" eager className="h-full bg-transparent" />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function ProfileForming({ current, forming }: { current: WizardStepId; forming: Forming }) {
  const rows = useRows(current)
  const { updating, persona } = forming
  const filled = rows.filter((r) => r.value).length
  return (
    <section aria-labelledby="forming-title" className="overflow-hidden rounded-card border border-border bg-bg">
      <MiniRender forming={forming} />
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="forming-title" className="type-small text-text">
            Profil kamu terbentuk
          </h2>
          <span className="num type-micro text-text-muted">{filled}/5 terisi</span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="type-micro text-text-muted">Spek yang kamu butuh</h3>
            {persona && updating && <span className="type-micro text-primary">memperbarui…</span>}
          </div>
          <Meters forming={forming} size="compact" />
        </div>

        <RowList rows={rows} current={current} />
      </div>
    </section>
  )
}

/** Mobile & tablet: strip atas berisi 3 meter mini + tombol buka ringkasan (REDESIGN §17). */
export function ProfileFormingMobile({ current, forming }: { current: WizardStepId; forming: Forming }) {
  const rows = useRows(current)
  const filled = rows.filter((r) => r.value)
  return (
    <details className="group rounded-card border border-border bg-bg">
      <summary className="flex min-h-12 cursor-pointer list-none flex-col gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          <span className="type-small text-text">Profil kamu terbentuk</span>
          <span className="flex items-center gap-1 type-micro text-text-muted">
            <span className="num">{filled.length}/5</span>
            <CaretDownIcon
              weight="bold"
              className="size-4 transition-transform duration-[var(--motion-medium)] group-open:rotate-180"
              aria-hidden="true"
            />
          </span>
        </span>
        <Meters forming={forming} size="mini" />
      </summary>
      <div className="border-t border-border px-4 py-4">
        <RowList rows={rows} current={current} />
      </div>
    </details>
  )
}
