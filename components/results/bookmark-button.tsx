"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/ssr/BookmarkSimple"
import { EASE_OUT } from "@/lib/motion"

// Simpan laptop (store/saved.ts): default / hover / terpilih, dengan "pop" kecil saat baru dipilih.
export function BookmarkButton({
  saved,
  name,
  onToggle,
  size = "md",
}: {
  saved: boolean
  name: string
  onToggle: () => void
  size?: "md" | "lg"
}) {
  const reduce = useReducedMotion()
  const [pulse, setPulse] = React.useState(0)
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Hapus ${name} dari simpanan` : `Simpan ${name}`}
      onClick={() => {
        if (!saved) setPulse((p) => p + 1)
        onToggle()
      }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[12px] border transition-colors duration-200 ease-out",
        size === "lg" ? "size-12 rounded-[14px]" : "size-11",
        saved ? "border-primary bg-primary-soft text-primary" : "border-border bg-bg text-text hover:border-primary/50 hover:text-primary"
      )}
    >
      <motion.span
        key={pulse}
        initial={reduce || pulse === 0 ? false : { scale: 0.75 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, ease: EASE_OUT }}
        className="flex"
      >
        <BookmarkSimpleIcon weight={saved ? "fill" : "bold"} className="size-5" aria-hidden="true" />
      </motion.span>
    </button>
  )
}
