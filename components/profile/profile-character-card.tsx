"use client"

import * as React from "react"
import { cn } from "cn"
import type { Persona, RequirementProfile } from "@/types"

// Kartu profil kobalt (REDESIGN §18; R4: dari ink-950 ke kobalt): satu-satunya bidang berwarna di halaman Profil. Berisi ringkasan
// kebutuhan + dua meter karakter (Performa, Mobilitas). Nilai karakter statis per profil di mock
// (disetujui Fahren, R3), bukan hitungan dari jawaban.

const LEVEL_LABEL = { 1: "Rendah", 2: "Sedang", 3: "Tinggi" } as const

function CharacterMeter({ label, level, hint }: { label: string; level: 1 | 2 | 3; hint: string }) {
  return (
    <div role="img" aria-label={`${label}: ${LEVEL_LABEL[level].toLowerCase()}. ${hint}`} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3" aria-hidden="true">
        <span className="type-small text-white">{label}</span>
        <span className="type-small text-signal">{LEVEL_LABEL[level]}</span>
      </div>
      <div className="grid grid-cols-3 gap-1" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(
              "h-2 rounded-full transition-colors duration-[var(--motion-slow)]",
              n <= level ? "bg-white" : "bg-cobalt-800"
            )}
          />
        ))}
      </div>
      <p className="type-small font-normal text-cobalt-100" aria-hidden="true">
        {hint}
      </p>
    </div>
  )
}

const PERFORMA_HINT = {
  1: "Kerja ringan: dokumen, browser, kuliah online.",
  2: "Beberapa aplikasi sedang berjalan bersamaan.",
  3: "Beban berat seperti compile, render, atau emulator.",
} as const
const MOBILITAS_HINT = {
  1: "Lebih sering di meja; bobot bukan prioritas.",
  2: "Kadang dibawa ke kampus atau kantor.",
  3: "Dibawa setiap hari; bobot dan baterai penting.",
} as const

export function ProfileCharacterCard({
  requirement,
  persona,
  summaryRef,
}: {
  requirement: RequirementProfile
  persona?: Persona
  summaryRef: React.Ref<HTMLParagraphElement>
}) {
  const character = requirement.character
  return (
    <section
      aria-labelledby="character-title"
      data-tone="cobalt"
      className="grid gap-8 rounded-[20px] bg-cobalt-600 p-6 text-white md:grid-cols-12 md:gap-10 md:p-8"
    >
      <div className="flex flex-col gap-3 md:col-span-7">
        <h2 id="character-title" className="type-small text-cobalt-100">
          {persona ? `Untuk ${persona.label}` : "Profil kebutuhanmu"}
        </h2>
        <p
          ref={summaryRef}
          tabIndex={-1}
          aria-live="polite"
          className="max-w-[40rem] text-2xl leading-8 font-extrabold tracking-[-0.03em] text-white outline-none md:text-[2rem] md:leading-10"
        >
          {requirement.summary}
        </p>
      </div>
      {character && (
        <div className="flex flex-col gap-6 md:col-span-5">
          <CharacterMeter label="Performa" level={character.performa} hint={PERFORMA_HINT[character.performa]} />
          <CharacterMeter label="Mobilitas" level={character.mobilitas} hint={MOBILITAS_HINT[character.mobilitas]} />
        </div>
      )}
    </section>
  )
}
