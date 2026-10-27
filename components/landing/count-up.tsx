"use client"

import * as React from "react"
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import { EASE_OUT } from "@/lib/motion"

/**
 * Angka yang naik halus ke `value` saat terlihat, dan beranimasi lagi bila `value` berubah
 * (brief landing §19, §22: DATA CHANGE → angka bertransisi). Reduced motion: langsung tampil.
 * Teks akhirnya tetap ada di DOM untuk pembaca layar lewat `aria-label` pemanggil.
 */
export function CountUp({
  value,
  duration = 1,
  suffix = "",
  className,
}: {
  value: number
  duration?: number
  suffix?: string
  className?: string
}) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => `${Math.round(v)}${suffix}`)

  React.useEffect(() => {
    if (reduce) {
      mv.set(value)
      return
    }
    if (!inView) return
    const controls = animate(mv, value, { duration, ease: EASE_OUT })
    return () => controls.stop()
  }, [inView, value, duration, reduce, mv])

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  )
}
