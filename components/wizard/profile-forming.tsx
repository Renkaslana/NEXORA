"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "cn";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { LaptopRender } from "@/components/ui/laptop-render";
import { NeedMeter } from "@/components/ui/need-meter";
import { RowList, useRows } from "@/components/wizard/profile-summary";
import { getBudgetPreset, getPersonaForMajor, getRequirements } from "@/lib/api";
import { representativeRender } from "@/lib/laptop-image";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { needMeterRows } from "@/lib/need-meter";
import { useProfileStore, type WizardStepId } from "@/store/profile";
import type { RequirementProfile } from "@/types";

const SHOWN = ["cpu", "ram", "storage"] as const;

export function useFormingRequirement() {
  const profile = useProfileStore((s) => s.profile);
  const persona = profile.major ? getPersonaForMajor(profile.major) : null;
  const tier = getBudgetPreset(profile.budget.max).id;
  const key = persona ? `${persona}-${tier}` : null;
  const [state, setState] = React.useState<{ key: string; requirement: RequirementProfile } | null>(null);

  React.useEffect(() => {
    if (!key) return;
    let alive = true;
    getRequirements(profile).then(
      (requirement) => alive && setState({ key, requirement }),
      () => {}
    );
    return () => {
      alive = false;
    };
  }, [key]);

  return {
    persona,
    tier,
    requirement: key ? state?.requirement : undefined,
    updating: Boolean(key) && state?.key !== key,
  };
}

export type Forming = ReturnType<typeof useFormingRequirement>;

function Meters({ forming, size }: { forming: Forming; size: "compact" | "mini" }) {
  const { persona, requirement, updating } = forming;
  if (!persona) {
    return size === "mini" ? null : (
      <p className="text-xs font-medium text-slate-500">
        Pilih jurusanmu pada langkah berikutnya untuk melihat rekomendasi spek hardware minimal.
      </p>
    );
  }
  if (!requirement) {
    return <p className="text-xs font-medium text-slate-500">Menyusun kebutuhan hardware...</p>;
  }
  const rows = needMeterRows(requirement).filter((r) => (SHOWN as readonly string[]).includes(r.component));
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
  );
}

function MiniRender({ forming }: { forming: Forming }) {
  const reduce = useReducedMotion();
  const image = representativeRender(forming.persona, forming.tier);
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-b from-slate-50 to-emerald-50/20 border-b border-slate-100 flex items-center justify-center p-4">
      <AnimatePresence initial={false}>
        <motion.div
          key={`${image.shape}-${image.color}`}
          className="absolute inset-0 p-3 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : DURATION.medium, ease: EASE_OUT }}
        >
          <LaptopRender image={image} sizes="360px" eager className="h-full object-contain bg-transparent drop-shadow-sm" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function ProfileForming({ current, forming }: { current: WizardStepId; forming: Forming }) {
  const rows = useRows(current);
  const { updating, persona } = forming;
  const filled = rows.filter((r) => r.value).length;

  return (
    <section aria-labelledby="forming-title" className="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm">
      {/* Modern Emerald Header */}
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <SparkleIcon weight="fill" className="text-emerald-400 w-4 h-4" />
          <h2 id="forming-title" className="text-sm font-extrabold text-white">
            Profil Kebutuhan
          </h2>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 text-[11px] font-black text-emerald-200">
          {filled}/5 Terisi
        </span>
      </div>

      <MiniRender forming={forming} />

      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Kebutuhan Minimal
            </h3>
            {persona && updating && <span className="text-[10px] font-bold text-emerald-700">memperbarui…</span>}
          </div>
          <Meters forming={forming} size="compact" />
        </div>

        <RowList rows={rows} current={current} />
      </div>
    </section>
  );
}

export function ProfileFormingMobile({ current, forming }: { current: WizardStepId; forming: Forming }) {
  const rows = useRows(current);
  const filled = rows.filter((r) => r.value);

  return (
    <details className="group overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xs">
      <summary className="flex min-h-12 cursor-pointer list-none flex-col gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden bg-slate-50">
        <span className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
            <SparkleIcon weight="fill" className="text-emerald-700 w-3.5 h-3.5" />
            Profil Kebutuhan Kamu
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <span>{filled.length}/5 Terisi</span>
            <CaretDownIcon
              weight="bold"
              className="w-4 h-4 transition-transform duration-200 group-open:rotate-180 text-slate-400"
              aria-hidden="true"
            />
          </span>
        </span>
        <Meters forming={forming} size="mini" />
      </summary>
      <div className="bg-white px-4 py-4 border-t border-slate-100">
        <RowList rows={rows} current={current} />
      </div>
    </details>
  );
}
