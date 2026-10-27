"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react"
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion"

// Bagian bergerak dari section "SPECO bukan toko" (brief SPECO_Section_Redesign §11–17). Hanya yang butuh
// klien yang ada di sini; section-nya sendiri Server Component. Semua gerak transform/opacity/clip-path,
// sekali saat masuk viewport; melayang & paralaks mati saat reduced motion.

/** Garis tangan kuning di bawah "sengaja.": digambar dari kiri sekali saat terlihat. */
export function SengajaUnderline() {
  const reduce = useReducedMotion()
  const ref = React.useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.8 })
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 300 24"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-[0.12em] left-[-0.04em] -z-10 h-[0.24em] w-[104%] overflow-visible"
    >
      <motion.path
        d="M4 15 C 60 7, 130 5, 196 9 S 280 15, 296 10"
        fill="none"
        stroke="var(--color-signal)"
        strokeWidth="9"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: reduce || inView ? 1 : 0 }}
        transition={{ duration: 0.7, ease: EASE_IN_OUT, delay: 0.45 }}
      />
    </svg>
  )
}

/** Visual 1 (aset Fahren): muncul setelah judul, lalu melayang sangat halus. */
export function LaptopVisual() {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, scale: 0.96, y: 20 }}
      animate={reduce || inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
      transition={{ duration: 0.85, ease: EASE_OUT, delay: 0.25 }}
      className="relative mx-auto w-full max-w-[40rem]"
    >
      <div className="animate-float motion-reduce:animate-none">
        <Image
          src="/images/landing/bukan-toko-laptop.webp"
          alt="Ilustrasi laptop terbuka melayang dengan cahaya biru lembut"
          width={1275}
          height={926}
          sizes="(min-width: 1024px) 40rem, 92vw"
          className="h-auto w-full"
        />
      </div>
    </motion.div>
  )
}

/** Visual 2 (aset Fahren, tulisan tangan bagian dari gambar): dibuka dari bawah + paralaks halus. */
export function JourneyVisual() {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [12, -12])

  // Yang diamati wadah luar: elemen yang tertutup penuh clip-path tidak terdeteksi IntersectionObserver.
  return (
    <div ref={ref} className="relative aspect-[1672/941] w-full">
      <motion.div
        initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0% round 24px)", scale: 0.98 }}
        animate={
          reduce || inView
            ? { clipPath: "inset(0% 0% 0% 0% round 24px)", scale: 1 }
            : { clipPath: "inset(100% 0% 0% 0% round 24px)", scale: 0.98 }
        }
        transition={{ duration: 0.9, ease: EASE_IN_OUT }}
        className="absolute inset-0 overflow-hidden rounded-[24px] bg-canvas shadow-[0_24px_48px_-32px_rgba(17,17,17,0.35)]" // taste-skill-ignore: bayangan lembut visual 2 (brief §15)
      >
        <motion.div style={reduce ? undefined : { y }} className="absolute -inset-y-4 inset-x-0">
          <Image
            src="/images/landing/bukan-toko-perjalanan.webp"
            alt="Tumpukan buku berlabel Coding, Design, Gaming, dan Kuliah di meja dengan tulisan tangan: bukan sekadar spesifikasi, tapi solusi yang sesuai dengan perjalanan kuliahmu"
            fill
            sizes="(min-width: 1024px) 40rem, 92vw"
            className="object-cover"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
