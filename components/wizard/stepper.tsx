"use client";

import { cn } from "cn";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";

interface StepperStep {
  id: string;
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  current: number;
  done?: number[];
  onStepClick?: (index: number) => void;
  variant?: "auto" | "dots" | "bar";
  tone?: "default" | "cobalt" | "emerald";
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

function StepperBar({ steps, current, tone }: Pick<StepperProps, "steps" | "current" | "tone">) {
  const isEmerald = tone === "emerald";
  const cobalt = tone === "cobalt";
  const percent = ((current + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col gap-2">
      <p
        className={cn(
          "flex items-baseline justify-between text-xs font-medium",
          isEmerald ? "text-emerald-200" : cobalt ? "text-cobalt-100" : "text-slate-500"
        )}
      >
        <span>
          Langkah <span className={cn("tabular-nums font-bold", isEmerald || cobalt ? "text-white" : "text-slate-900")}>{current + 1}</span> dari{" "}
          <span className="tabular-nums">{steps.length}</span>
        </span>
        <span className={cn("font-bold", isEmerald || cobalt ? "text-white" : "text-slate-900")}>
          {steps[current]?.label}
        </span>
      </p>
      <div
        role="progressbar"
        aria-label="Kemajuan rekomendasi"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
        aria-valuetext={`Langkah ${current + 1} dari ${steps.length}: ${steps[current]?.label}`}
        className={cn(
          "h-2 w-full overflow-hidden rounded-full",
          isEmerald ? "bg-emerald-950/70 border border-emerald-800/60" : cobalt ? "bg-cobalt-800" : "bg-slate-200"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-out",
            isEmerald ? "bg-gradient-to-r from-emerald-500 to-teal-400" : cobalt ? "bg-amber-400" : "bg-emerald-600"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function StepperDots({ steps, current, done, onStepClick, tone }: Omit<StepperProps, "variant" | "className">) {
  const isDone = (i: number) => (done ? done.includes(i) : i < current);
  const isEmerald = tone === "emerald";
  const cobalt = tone === "cobalt";

  return (
    <ol className="flex items-start">
      {steps.map((step, index) => {
        const state = index === current ? "current" : isDone(index) ? "done" : "upcoming";
        const clickable = state === "done" && onStepClick;

        const content = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black tabular-nums transition-all duration-200 shadow-xs",
                isEmerald
                  ? [
                      state === "done" && "border-emerald-400 bg-emerald-500 text-slate-950",
                      state === "current" && "border-white bg-white text-emerald-950 ring-4 ring-emerald-500/30",
                      state === "upcoming" && "border-emerald-800/80 bg-emerald-950/40 text-emerald-300",
                    ]
                  : cobalt
                  ? [
                      state === "done" && "border-white bg-white text-cobalt-600",
                      state === "current" && "border-amber-400 bg-amber-400 text-slate-950",
                      state === "upcoming" && "border-cobalt-400 text-cobalt-100",
                    ]
                  : [
                      state === "done" && "border-emerald-600 bg-emerald-600 text-white",
                      state === "current" && "border-emerald-600 bg-white text-emerald-800",
                      state === "upcoming" && "border-slate-300 bg-white text-slate-400",
                    ]
              )}
            >
              {state === "done" ? <CheckIcon weight="bold" className="size-4" /> : pad(index + 1)}
            </span>
            <span
              className={cn(
                "text-xs whitespace-nowrap mt-1",
                state === "upcoming"
                  ? cn("font-medium", isEmerald ? "text-emerald-300/80" : cobalt ? "text-cobalt-100" : "text-slate-400")
                  : cn("font-extrabold", isEmerald || cobalt ? "text-white" : "text-slate-900")
              )}
            >
              <span className="sr-only">
                {state === "done" ? "Selesai: " : state === "current" ? "Langkah saat ini: " : "Belum: "}
              </span>
              {step.label}
            </span>
          </>
        );

        return (
          <li
            key={step.id}
            aria-current={state === "current" ? "step" : undefined}
            className="flex flex-1 items-start last:flex-none"
          >
            {clickable ? (
              <button
                type="button"
                onClick={() => onStepClick(index)}
                className="flex min-h-11 flex-col items-center gap-1 rounded-xl px-1 hover:scale-105 transition-transform"
              >
                {content}
              </button>
            ) : (
              <div className="flex min-h-11 flex-col items-center gap-1 px-1">{content}</div>
            )}

            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "mx-2 mt-4 h-0.5 flex-1 overflow-hidden rounded-full",
                  isEmerald ? "bg-emerald-800/80" : cobalt ? "bg-cobalt-400" : "bg-slate-200"
                )}
              >
                <span
                  className={cn(
                    "block h-full transition-[width] duration-300 ease-out",
                    isEmerald ? "bg-emerald-400" : cobalt ? "bg-white" : "bg-emerald-600"
                  )}
                  style={{ width: isDone(index) ? "100%" : "0%" }}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function Stepper({
  steps,
  current,
  done,
  onStepClick,
  variant = "auto",
  tone = "emerald",
  className,
}: StepperProps) {
  if (variant === "bar") {
    return (
      <nav aria-label="Kemajuan kuis rekomendasi" className={className}>
        <StepperBar steps={steps} current={current} tone={tone} />
      </nav>
    );
  }

  if (variant === "dots") {
    return (
      <nav aria-label="Kemajuan kuis rekomendasi" className={className}>
        <StepperDots steps={steps} current={current} done={done} onStepClick={onStepClick} tone={tone} />
      </nav>
    );
  }

  return (
    <nav aria-label="Kemajuan kuis rekomendasi" className={className}>
      <div className="md:hidden">
        <StepperBar steps={steps} current={current} tone={tone} />
      </div>
      <div className="hidden md:block">
        <StepperDots steps={steps} current={current} done={done} onStepClick={onStepClick} tone={tone} />
      </div>
    </nav>
  );
}
