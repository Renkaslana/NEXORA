"use client"

import * as React from "react"
import { cn } from "cn"
import { ChatCircleTextIcon } from "@phosphor-icons/react/dist/ssr/ChatCircleText"

// Umpan balik kontekstual Wizard (REDESIGN §17): satu kalimat dari data statis per opsi, bukan AI.
// Diumumkan sopan lewat aria-live; teks baru masuk dengan fade singkat (berganti lewat `contentKey`).
export function FeedbackLine({
  children,
  contentKey,
  live = true,
  className,
}: {
  children: React.ReactNode
  /** Ganti nilai ini saat isinya berubah: konten masuk ulang, wilayah aria-live tetap. */
  contentKey?: string
  /** false bila pembungkusnya sudah aria-live (agar wilayahnya tetap ada sebelum teks pertama). */
  live?: boolean
  className?: string
}) {
  return (
    <div aria-live={live ? "polite" : undefined} className={cn("flex gap-3 rounded-card bg-blue-50 p-4 text-text", className)}>
      <ChatCircleTextIcon weight="duotone" className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div key={contentKey} className="flex min-w-0 animate-in flex-col gap-1 type-body fade-in duration-200">
        {children}
      </div>
    </div>
  )
}
