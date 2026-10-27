"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { DURATION, EASE_IN_OUT, EASE_OUT } from "@/lib/motion"

// Muncul sekali saat masuk viewport (REDESIGN §13). "up" = naik 24px + fade; "clip" = teks dibuka
// dari bawah lewat masker (band gelap). Yang diamati elemen luar yang ukurannya tetap: elemen yang
// tersembunyi lewat clip-path/scale nol tidak terdeteksi IntersectionObserver.
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  innerClassName,
}: {
  children: React.ReactNode
  variant?: "up" | "clip"
  delay?: number
  /** Kelas elemen luar (posisi di layout, mis. h-full, max-w). */
  className?: string
  /** Kelas elemen yang bergerak (susunan anak, mis. flex flex-col gap-3). */
  innerClassName?: string
}) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const hidden = variant === "clip" ? { y: "105%" } : { opacity: 0, y: 24 }
  const shown = variant === "clip" ? { y: "0%" } : { opacity: 1, y: 0 }

  return (
    // Clip: masker diberi ruang bawah (pb-4 -mb-4) agar ekor huruf (g, y, j) pada judul ber-leading rapat
    // tidak ikut terpotong, tanpa mengubah tinggi layout.
    <div ref={ref} className={cn(variant === "clip" && "-mb-4 overflow-hidden pb-4", className)}>
      <motion.div
        className={cn("h-full", innerClassName)}
        initial={reduce ? false : hidden}
        animate={reduce || inView ? shown : hidden}
        transition={{
          duration: variant === "clip" ? DURATION.slow : DURATION.medium * 2,
          ease: variant === "clip" ? EASE_IN_OUT : EASE_OUT,
          delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
