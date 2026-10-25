"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { MOOD_PHOTOS, type MoodPhotoId } from "@/lib/mood-photos"
import { DURATION, EASE_IN_OUT } from "@/lib/motion"

// Foto suasana (REDESIGN §24; foto scene-* berwarna asli). Gerak 12: foto "dibuka" seperti jendela dari inset 12%
// ke penuh sambil scale 1.06 → 1, sekali saat masuk viewport. Reduced motion: langsung penuh.
function MoodPhoto({
  id,
  sizes,
  decorative = false,
  label = false,
  drift = false,
  className,
}: {
  id: MoodPhotoId
  sizes: string
  /** Foto murni hiasan di samping teks yang sudah menjelaskan isinya. */
  decorative?: boolean
  /** Label "Ilustrasi" untuk foto buatan AI agar tidak dikira foto asli. */
  label?: boolean
  /** Gambar bergerak pelan (zoom 1 → 1,08, bolak-balik 18 dtk). Reduced motion: diam. */
  drift?: boolean
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
        <Image
          src={photo.src}
          alt={decorative ? "" : photo.alt}
          fill
          sizes={sizes}
          className={cn("object-cover", drift && "animate-drift")}
        />
      </motion.div>
      {label && (
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 type-micro text-white"
        >
          Ilustrasi AI
        </span>
      )}
    </motion.div>
  )
}

export { MoodPhoto }
