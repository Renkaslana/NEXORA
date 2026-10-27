"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react"
import { EASE_OUT } from "@/lib/motion"

// Panggung CTA akhir (brief REDESIGN CTA SECTION, Okt 2026). Foto (aset Fahren: laptop di atas alas, langit
// dan arsitektur putih) adalah satu gambar; laptop menyatu dengan foto, jadi gerak diterapkan ke lapisan foto:
// - masuk: opacity 0 → 1, skala 1,05 → 1 (foto tetap menutup bidang), 900 ms ease-out;
// - paralaks scroll ±12 px;
// - kursor (lg+, mouse saja): geser ±5 px + miring ≤ 0,8°, lewat spring. Mati saat reduced motion.
// Teks, tombol, dan info tetap elemen HTML di atasnya (children dari Server Component).

const SRC = "/images/landing/cta-langit.webp"
const ALT = "Laptop terbuka di atas alas batu di teras putih, dengan langit biru dan pegunungan di kejauhan"

export function CtaScene({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const scrollY = useTransform(scrollYProgress, [0, 1], [12, -12])

  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 80, damping: 20, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 80, damping: 20, mass: 0.6 })
  const x = useTransform(sx, (v) => v * 10)
  const y = useTransform([sy, scrollY], ([a, b]: number[]) => a * 8 + b)
  const rotateY = useTransform(sx, (v) => v * 1.6)
  const rotateX = useTransform(sy, (v) => v * -1.2)

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== "mouse" || window.innerWidth < 1024) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  function onLeave() {
    px.set(0)
    py.set(0)
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative isolate mx-auto max-w-[1240px] overflow-hidden rounded-[28px] bg-[#c6e0fc] lg:min-h-[54rem]"
    >
      {/* Desktop: foto menutup seluruh bidang; laptop berada di tengah bawah, teks di langit. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden lg:block">
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { opacity: 0, scale: 1.05 }}
          animate={reduce || inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        >
          <motion.div
            className="absolute -inset-[3%]"
            style={reduce ? undefined : { x, y, rotateX, rotateY, transformPerspective: 1400 }}
          >
            <Image src={SRC} alt="" fill sizes="(min-width: 1280px) 1300px, 100vw" quality={86} className="object-cover object-[47%_100%]" />
          </motion.div>
        </motion.div>
        {/* Lapisan putih sangat tipis di atas langit agar teks nyaman dibaca. */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.18) 38%, rgba(255,255,255,0) 58%)" }} // taste-skill-ignore: veil keterbacaan di atas foto
        />
      </div>
      {/* Deskripsi foto desktop hanya di lg+ (di bawahnya foto mobile punya alt sendiri). */}
      <span className="sr-only hidden lg:block">{ALT}</span>
      {children}
    </div>
  )
}

/** Mobile/tablet: foto sebagai blok sendiri di antara CTA dan info, dipusatkan pada laptop. */
export function CtaPhotoMobile() {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  return (
    <div ref={ref} className="relative mt-10 aspect-[4/3] w-full overflow-hidden rounded-[22px] sm:aspect-[16/10] lg:hidden">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { opacity: 0, scale: 0.96, y: 20 }}
        animate={reduce || inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
      >
        <Image src={SRC} alt={ALT} fill sizes="(min-width: 640px) 90vw, 100vw" quality={86} className="object-cover object-[47%_78%]" />
      </motion.div>
    </div>
  )
}
