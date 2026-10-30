"use client";

import * as React from "react";
import { cn } from "cn";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star";
import type { Icon } from "@/lib/icons";

interface SelectCardProps extends Omit<React.ComponentProps<"button">, "title" | "onSelect"> {
  mode?: "single" | "multi";
  selected?: boolean;
  icon?: Icon;
  title: string;
  description?: string;
  meta?: string;
  primary?: boolean;
  trailing?: React.ReactNode;
  size?: "md" | "sm";
}

const POP = "ease-[cubic-bezier(0.34,1.56,0.64,1)]";

export function SelectCard({
  mode = "single",
  selected = false,
  icon: IconComponent,
  title,
  description,
  meta,
  primary = false,
  trailing,
  size = "md",
  disabled,
  className,
  ...props
}: SelectCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      data-selected={selected || undefined}
      className={cn(
        "group relative flex w-full min-h-11 flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white text-left",
        "transition-all duration-200 ease-out shadow-2xs",
        "hover:border-emerald-400 hover:shadow-sm active:scale-[0.98]",
        "data-selected:border-emerald-700 data-selected:bg-emerald-50/60 data-selected:ring-2 data-selected:ring-emerald-600/20 data-selected:hover:border-emerald-800",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none disabled:active:scale-100",
        size === "md" ? "p-4 pr-12" : "px-3 py-2.5 pr-10",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute flex items-center justify-center border transition-all duration-200",
          size === "md" ? "top-4 right-4 size-5" : "top-3 right-3 size-4",
          mode === "single" ? "rounded-full" : "rounded-md",
          selected
            ? "border-emerald-700 bg-emerald-700 text-white shadow-xs"
            : "border-slate-300 bg-slate-50 group-hover:border-emerald-400"
        )}
      >
        <CheckIcon
          weight="bold"
          className={cn(
            "size-3 transition-transform duration-200",
            POP,
            selected ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>

      {IconComponent && (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex shrink-0 items-center justify-center transition-colors duration-200",
            size === "md" ? "size-10 rounded-xl" : "size-8 rounded-lg",
            selected
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-800 group-disabled:group-hover:bg-slate-100"
          )}
        >
          <IconComponent weight="duotone" className={size === "md" ? "size-6" : "size-5"} />
        </span>
      )}

      <span className="flex flex-col gap-0.5">
        <span
          className={cn(
            "font-extrabold text-slate-900 group-hover:text-emerald-950",
            size === "md" ? "text-sm" : "text-xs"
          )}
        >
          {title}
        </span>
        {description && <span className="text-xs font-normal text-slate-500">{description}</span>}
        {meta && <span className="text-[11px] font-semibold text-slate-400 mt-0.5">{meta}</span>}
      </span>

      {(primary || trailing) && (
        <span className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          {primary && (
            <span className="inline-flex h-5 items-center gap-1 rounded-full bg-emerald-700 px-2 text-[10px] font-black text-white">
              <StarIcon weight="fill" className="size-3" aria-hidden="true" />
              Prioritas Utama
            </span>
          )}
          {trailing}
        </span>
      )}
    </button>
  );
}

export type { SelectCardProps };
