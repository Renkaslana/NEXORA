"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { MOOD_PHOTOS, type MoodPhotoId } from "@/lib/mood-photos"
import { DURATION, EASE_IN_OUT } from "@/lib/motion"

// Foto suasana ber-duotone (REDESIGN §24). Gerak 12: foto "dibuka" seperti jendela dari inset 12%
// ke penuh sambil scale 1.06 → 1, sekali saat masuk viewport. Reduced motion: langsung penuh.
function MoodPhoto({
  id,
  sizes,
  decorative = false,
  className,
}: {
  id: MoodPhotoId
  sizes: string
  /** Foto murni hiasan di samping teks yang sudah menjelaskan isinya. */
  decorative?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const photo = MOOD_PHOTOS[id]
  const shut = "inset(12% 12% 12% 12% round 24px)"
  const open = "inset(0% 0% 0% 0% round 24px)"

  return (
    <motion.div
      className={cn("relative overflow-hidden rounded-[24px] bg-blue-950", className)}
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      initial={reduce ? false : { clipPath: shut }}
      whileInView={{ clipPath: open }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: DURATION.slow, ease: EASE_IN_OUT }}
    >
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.06 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: DURATION.slow, ease: EASE_IN_OUT }}
      >
        <Image src={photo.src} alt={decorative ? "" : photo.alt} fill sizes={sizes} className="object-cover" />
      </motion.div>
    </motion.div>
  )
}

export { MoodPhoto }
