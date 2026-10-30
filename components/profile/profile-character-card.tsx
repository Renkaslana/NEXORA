"use client";

import * as React from "react";
import { cn } from "cn";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu";
import { GaugeIcon } from "@phosphor-icons/react/dist/ssr/Gauge";
import type { Persona, RequirementProfile } from "@/types";

const LEVEL_LABEL = { 1: "Rendah", 2: "Sedang", 3: "Tinggi" } as const;

function CharacterMeter({ label, level, hint }: { label: string; level: 1 | 2 | 3; hint: string }) {
  return (
    <div role="img" aria-label={`${label}: ${LEVEL_LABEL[level].toLowerCase()}. ${hint}`} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3" aria-hidden="true">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <GaugeIcon className="w-3.5 h-3.5 text-emerald-400" />
          {label}
        </span>
        <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">{LEVEL_LABEL[level]}</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300",
              n <= level ? "bg-gradient-to-r from-emerald-400 to-teal-300 shadow-xs" : "bg-emerald-950/80 border border-emerald-800/60"
            )}
          />
        ))}
      </div>
      <p className="text-[11px] font-normal text-emerald-100/80" aria-hidden="true">
        {hint}
      </p>
    </div>
  );
}

const PERFORMA_HINT = {
  1: "Kerja ringan: dokumen, browser, kuliah online.",
  2: "Beberapa aplikasi sedang berjalan bersamaan.",
  3: "Beban berat seperti compile, render 3D, atau emulator.",
} as const;

const MOBILITAS_HINT = {
  1: "Lebih sering di meja; bobot bukan prioritas.",
  2: "Kadang dibawa ke kampus atau perpustakaan.",
  3: "Dibawa setiap hari; bobot ringan dan baterai awet penting.",
} as const;

export function ProfileCharacterCard({
  requirement,
  persona,
  summaryRef,
}: {
  requirement: RequirementProfile;
  persona?: Persona;
  summaryRef: React.Ref<HTMLParagraphElement>;
}) {
  const character = requirement.character ?? { performa: 2, mobilitas: 2 };

  return (
    <section
      aria-labelledby="character-title"
      className="grid gap-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-6 sm:p-8 text-white md:grid-cols-12 md:gap-10 shadow-xl border border-emerald-800/60 relative overflow-hidden"
    >
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-3 md:col-span-7 relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-[10px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1">
            <SparkleIcon weight="fill" className="w-3 h-3 text-emerald-400" />
            Persona Teridentifikasi
          </span>
        </div>

        <h2 id="character-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {persona ? `Karakter Kebutuhan: ${persona.label}` : "Profil Kebutuhan Mahasiswa"}
        </h2>

        <p
          ref={summaryRef}
          tabIndex={-1}
          className="text-sm sm:text-base text-emerald-100 leading-relaxed outline-none"
        >
          {requirement.summary}
        </p>
      </div>

      <div className="flex flex-col justify-center gap-5 md:col-span-5 md:border-l md:border-emerald-800/60 md:pl-8 relative z-10">
        <CharacterMeter label="Kebutuhan Performa" level={character.performa} hint={PERFORMA_HINT[character.performa]} />
        <CharacterMeter label="Kebutuhan Mobilitas" level={character.mobilitas} hint={MOBILITAS_HINT[character.mobilitas]} />
      </div>
    </section>
  );
}
