"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "cn";
import { Slider } from "@/components/ui/slider";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu";
import { formatRupiah, formatRupiahShort, rupiahToWords } from "@/lib/format";
import { catalogLaptops, getLaptopImage, CatalogLaptop } from "@/lib/catalog-service";
import type { BudgetPreset } from "@/types";

interface BudgetSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  range: { min: number; max: number; step: number };
  presets?: BudgetPreset[];
  flexible?: boolean;
  onFlexibleChange?: (flexible: boolean) => void;
  feedback?: { typicalSpec: string; laptopCount: number };
  showInput?: boolean;
  className?: string;
}

const digitsOnly = (s: string) => Number(s.replace(/\D/g, "") || 0);

// 5 Preset Tier Budget Speco (Lumina Tech Editorial)
const SPECO_PRESET_TIERS = [
  { id: "lt-6", label: "< Rp6 Jt", subtitle: "Hemat & Cukup", targetValue: 5500000, desc: "Celeron / Core i3, RAM 8GB, SSD 256GB" },
  { id: "6-8", label: "Rp6–8 Jt", subtitle: "Serba Bisa", targetValue: 7500000, desc: "Ryzen 5 / Core i5, RAM 16GB, SSD 512GB" },
  { id: "8-10", label: "Rp8–10 Jt", subtitle: "Paling Seimbang", targetValue: 9000000, desc: "Ryzen 7 7730U, RAM 16GB, 100% sRGB" },
  { id: "10-15", label: "Rp10–15 Jt", subtitle: "Layar OLED & Tipis", targetValue: 13500000, desc: "Core Ultra / Ryzen 7, OLED 2.8K, < 1.3kg" },
  { id: "15-plus", label: "Rp15 Jt+", subtitle: "Kreator & GPU RTX", targetValue: 19000000, desc: "RTX 4060, RAM 32GB, 3D Render & AI" },
];

export function BudgetSlider({
  value,
  onValueChange,
  range,
  presets,
  flexible,
  onFlexibleChange,
  feedback,
  showInput = true,
  className,
}: BudgetSliderProps) {
  const id = React.useId();
  const [dragging, setDragging] = React.useState(false);
  const [draft, setDraft] = React.useState<string | null>(null);

  const clampSnap = (v: number) => {
    const snapped = Math.round(v / range.step) * range.step;
    return Math.min(range.max, Math.max(range.min, snapped));
  };

  const commitDraft = () => {
    if (draft !== null) onValueChange(clampSnap(digitsOnly(draft)));
    setDraft(null);
  };

  // Hitung jumlah laptop nyata di database 450 katalog
  const realCatalogMatches = React.useMemo(() => {
    const maxAllowed = flexible ? value * 1.15 : value;
    const minAllowed = value * 0.6;
    return catalogLaptops.filter(
      (l) => l.numericPrice > 0 && l.numericPrice <= maxAllowed && l.numericPrice >= minAllowed
    );
  }, [value, flexible]);

  // Laptop preview unggulan di budget ini
  const topPreviewLaptop: CatalogLaptop | undefined = React.useMemo(() => {
    if (realCatalogMatches.length === 0) return catalogLaptops[0];
    return [...realCatalogMatches].sort((a, b) => {
      // Prioritaskan laptop paling mendekati budget dengan spek terbaik
      const distA = Math.abs(a.numericPrice - value);
      const distB = Math.abs(b.numericPrice - value);
      return distA - distB;
    })[0];
  }, [realCatalogMatches, value]);

  // Motion value agar angka mengejar halus
  const reduce = useReducedMotion();
  const shown = useMotionValue(value);
  const shownText = useTransform(shown, (v) => formatRupiah(Math.round(v / range.step) * range.step));

  React.useEffect(() => {
    const controls = animate(shown, value, { duration: reduce ? 0 : 0.2, ease: [0.23, 1, 0.32, 1] });
    return () => controls.stop();
  }, [value, reduce, shown]);

  return (
    <div className={cn("flex min-w-0 flex-col gap-6", className)}>
      {/* Top Display: Angka Besar & Input Manual */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Budget Maksimalmu
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
              Target Anggaran
            </span>
          </div>

          <output
            htmlFor={`${id}-input`}
            className={cn(
              "text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight transition-colors duration-150",
              dragging && "text-emerald-700"
            )}
          >
            <motion.span>{shownText}</motion.span>
          </output>
        </div>

        {showInput && (
          <label className="flex flex-col gap-1 sm:text-right">
            <span className="text-xs font-bold text-slate-500">Atau ketik angka manual</span>
            <span className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 mr-1.5" aria-hidden="true">
                Rp
              </span>
              <input
                id={`${id}-input`}
                inputMode="numeric"
                autoComplete="off"
                className="w-32 bg-transparent text-right font-black text-sm text-slate-900 outline-none"
                value={draft ?? new Intl.NumberFormat("id-ID").format(value)}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitDraft}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitDraft();
                }}
              />
            </span>
          </label>
        )}
      </div>

      {/* Slider Bar */}
      <div className="flex flex-col gap-2.5 px-1">
        <Slider
          value={[value]}
          min={range.min}
          max={range.max}
          step={range.step}
          onValueChange={([v]) => {
            setDragging(true);
            onValueChange(v);
          }}
          onValueCommit={() => setDragging(false)}
          onPointerUp={() => setDragging(false)}
          thumbLabel="Budget maksimal"
          className="py-3"
        />
        <div className="flex justify-between text-xs font-bold text-slate-400" aria-hidden="true">
          <span>{formatRupiahShort(range.min)}</span>
          <span>Rp12 Jt (Paling Populer)</span>
          <span>{formatRupiahShort(range.max)}+</span>
        </div>
      </div>

      {/* 5 Preset Tier Chips */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
          Pilih Tier Cepat Mahasiswa:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SPECO_PRESET_TIERS.map((tier) => {
            const isSelected = Math.abs(value - tier.targetValue) < 1500000;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onValueChange(tier.targetValue)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-emerald-800 text-white border-emerald-900 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
                }`}
              >
                <span className="text-xs font-black block leading-none">{tier.label}</span>
                <span
                  className={`text-[10px] mt-1 block truncate ${
                    isSelected ? "text-emerald-200" : "text-slate-500"
                  }`}
                >
                  {tier.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle Fleksibel */}
      {onFlexibleChange && (
        <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
          <input
            type="checkbox"
            checked={Boolean(flexible)}
            onChange={(e) => onFlexibleChange(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
          />
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-slate-900">
              Pertimbangkan toleransi budget ±10%
            </span>
            <span className="text-[11px] text-slate-500">
              Rekomendasikan jika ada laptop dengan performa jauh lebih tinggi hanya sedikit di atas anggaran.
            </span>
          </div>
        </label>
      )}

      {/* Real-time Catalog Feedback Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SparkleIcon weight="fill" className="text-emerald-700 w-4 h-4" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Analisis Katalog SPECO
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
            ± {realCatalogMatches.length} Laptop Terdaftar
          </span>
        </div>

        {topPreviewLaptop && (
          <div className="flex items-center gap-3.5 pt-1">
            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={getLaptopImage(topPreviewLaptop)}
                alt={topPreviewLaptop.Model_Seri}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/laptops/mainstream-silver-34.webp";
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-emerald-800 uppercase">
                  {topPreviewLaptop.Brand}
                </span>
                <span className="text-xs font-extrabold text-slate-900 truncate">
                  {topPreviewLaptop.Model_Seri}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {topPreviewLaptop.Processor_CPU} • RAM {topPreviewLaptop.RAM_GB}GB • {topPreviewLaptop.Storage_GB_Tipe}
              </p>
              <p className="text-xs font-black text-slate-900 mt-1">
                {formatRupiah(topPreviewLaptop.numericPrice)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
