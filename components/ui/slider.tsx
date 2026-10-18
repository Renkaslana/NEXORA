"use client"

import * as React from "react"
import { cn } from "cn"
import { Slider as SliderPrimitive } from "radix-ui"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabel,
  getValueText,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** Label aksesibel untuk thumb (PRD §28). */
  thumbLabel?: string
  /** Teks `aria-valuetext`, mis. "8 juta rupiah" (PRD §28). */
  getValueText?: (value: number) => string
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-border data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={thumbLabel}
          aria-valuetext={getValueText?.(_values[index])}
          className="relative block size-6 shrink-0 cursor-grab rounded-full border-2 border-primary bg-bg shadow-sm transition-[box-shadow,transform] duration-150 select-none after:absolute after:-inset-2.5 hover:ring-4 hover:ring-primary-soft active:cursor-grabbing active:ring-4 active:ring-primary-soft disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
