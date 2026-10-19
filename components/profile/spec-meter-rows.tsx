"use client"

import { LevelBadge } from "@/components/profile/requirement-card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { IconTile } from "@/components/ui/icon-tile"
import { NeedMeter } from "@/components/ui/need-meter"
import { SPEC_ICONS } from "@/lib/icons"
import { needMeterRows } from "@/lib/need-meter"
import type { RequirementProfile, SpecComponent } from "@/types"

// Daftar spek sebagai baris Garis Kebutuhan (REDESIGN §18, gerak 4): tile ikon → komponen →
// minimum → meter dengan zona cukup → tingkat. "Kenapa ini penting?" membuka alasan + glosarium.
// Komponen tanpa ambang di mock tidak diberi meter (tidak dicek), hanya teks minimum.

export function SpecMeterRows({
  requirement,
  glossary,
}: {
  requirement: RequirementProfile
  glossary: Partial<Record<SpecComponent, { term: string; explanation: string }>>
}) {
  const rows = needMeterRows(requirement)
  return (
    <Accordion type="multiple" className="rounded-card border border-border bg-bg">
      {requirement.specs.map((spec, i) => {
        const meta = SPEC_ICONS[spec.component]
        const row = rows.find((r) => r.component === spec.component)
        const term = glossary[spec.component]
        return (
          <AccordionItem key={spec.component} value={spec.component} className="px-4 last:border-b-0 md:px-6">
            <div className="grid gap-x-6 gap-y-3 pt-5 md:grid-cols-[minmax(0,5fr)_minmax(0,5fr)_auto] md:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <IconTile icon={meta.icon} category={meta.category} />
                <div className="flex min-w-0 flex-col">
                  <h3 className="type-small font-normal text-text-muted">{meta.label}</h3>
                  <p className="type-body font-semibold text-text">{spec.minimum}</p>
                </div>
              </div>
              <div className="min-w-0">
                {row ? (
                  <NeedMeter component={spec.component} scale={row.scale} need={row.need} index={i} bare />
                ) : (
                  <p className="type-small font-normal text-text-muted">Tidak diukur dengan angka</p>
                )}
              </div>
              <div className="md:justify-self-end">
                <LevelBadge level={spec.level} />
              </div>
            </div>
            <AccordionTrigger className="min-h-11 py-2 type-small text-primary hover:no-underline">
              Kenapa ini penting?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2 pb-5">
              <p className="type-body text-text">{spec.reason}</p>
              {term && (
                <p className="type-small font-normal text-text-muted">
                  <span className="font-semibold text-text">{term.term}:</span> {term.explanation}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
