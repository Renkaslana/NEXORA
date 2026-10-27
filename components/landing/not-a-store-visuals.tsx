"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react"
import { cn } from "cn"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { FileTextIcon } from "@phosphor-icons/react/dist/ssr/FileText"
import { ScalesIcon } from "@phosphor-icons/react/dist/ssr/Scales"
import { ShoppingCartSimpleIcon } from "@phosphor-icons/react/dist/ssr/ShoppingCartSimple"
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle"
import { UsersThreeIcon } from "@phosphor-icons/react/dist/ssr/UsersThree"
import { Reveal } from "@/components/landing/reveal"
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion"

// Bagian bergerak dari section "SPECO bukan toko" (brief SPECO_Section_Redesign §11–17 + perbaikan Fahren).
// Section-nya Server Component; hanya yang butuh klien ada di sini. Urutan masuk: judul → laptop → anotasi
// → prinsip → fakta → visual kedua. Semua gerak transform/opacity, sekali saat masuk viewport; melayang,
// paralaks, dan glow kursor mati saat reduced motion / tanpa mouse.

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

// ---------------------------------------------------------------- Visual laptop + anotasi

const NOTES = [
  {
    text: "Tidak ada penjualan langsung.",
    Icon: ShoppingCartSimpleIcon,
    // Posisi di sekitar laptop (lg+), dalam persen wadah visual. Rotasi kecil agar terasa seperti catatan.
    place: "lg:top-[4%] lg:left-[2%] lg:-rotate-3",
  },
  {
    text: "Rekomendasi berdasarkan kebutuhanmu.",
    Icon: SparkleIcon,
    place: "lg:top-[30%] lg:-right-[4%] lg:rotate-[4deg]",
  },
  {
    text: "Penjelasan spesifikasi dengan bahasa sederhana.",
    Icon: UsersThreeIcon,
    place: "lg:bottom-[6%] lg:right-[6%] lg:rotate-2",
  },
]

/** Visual 1 (aset Fahren) dengan glow biru tipis dan tiga anotasi yang muncul setelah laptop. */
export function LaptopVisual() {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const shown = reduce || inView

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[44rem] lg:max-w-none">
      {/* Glow ambient: gradien radial statis, bukan blur. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[8%] -z-10"
        style={{
          background: "radial-gradient(closest-side, rgba(18,56,245,0.10), rgba(18,56,245,0.04) 55%, rgba(18,56,245,0) 100%)", // taste-skill-ignore: glow ambient tipis di belakang visual (permintaan Fahren)
        }}
      />
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96, y: 20 }}
        animate={shown ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.85, ease: EASE_OUT, delay: reduce ? 0 : 0.35 }}
      >
        <div className="animate-float motion-reduce:animate-none">
          <Image
            src="/images/landing/bukan-toko-laptop.webp"
            alt="Ilustrasi laptop terbuka melayang dengan cahaya biru lembut"
            width={1275}
            height={926}
            sizes="(min-width: 1024px) 46rem, 92vw"
            className="h-auto w-full"
          />
        </div>
      </motion.div>

      {/* Anotasi: melayang di sekitar laptop (lg+), deretan chip di bawahnya pada layar kecil. */}
      <ul className="mt-2 flex flex-wrap justify-center gap-2 lg:mt-0 lg:block">
        {NOTES.map((n, i) => (
          <motion.li
            key={n.text}
            className={cn("lg:absolute", n.place)}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: reduce ? 0 : 1.0 + i * 0.14 }}
          >
            <span
              className={cn(
                "flex items-center gap-2.5 rounded-[14px] border border-canvas-line bg-white px-3.5 py-2.5 type-small font-medium text-ink-strong",
                "lg:max-w-[13.5rem] lg:shadow-[0_14px_30px_-20px_rgba(17,17,17,0.35)]" // taste-skill-ignore: catatan melayang di atas visual
              )}
            >
              <n.Icon weight={i === 1 ? "fill" : "regular"} className={cn("size-5 shrink-0", i === 1 ? "text-data-blue" : "text-ink-strong")} aria-hidden="true" />
              {n.text}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------- Tiga prinsip

const PRINCIPLES = [
  {
    title: "Tidak menjual.",
    body: "Kami tidak memiliki stok atau menjual laptop, sehingga tidak ada brand yang membayar untuk diprioritaskan.",
    Icon: ShoppingCartSimpleIcon,
    crossed: true,
    href: "#rekomendasi",
    more: "Lihat contoh hasil beserta kekurangannya",
  },
  {
    title: "Tidak berpihak.",
    body: "Rekomendasi ditentukan oleh kebutuhanmu, bukan kepentingan brand tertentu.",
    Icon: ScalesIcon,
    href: "#transparansi",
    more: "Lihat cara skor dihitung",
  },
  {
    title: "Tidak membingungkan.",
    body: "Kami menyederhanakan spesifikasi teknis menjadi penjelasan yang jelas dan mudah dipahami.",
    Icon: FileTextIcon,
    href: "#cara-kerja",
    more: "Lihat cara kerja SPECO",
  },
]

/** Tiga prinsip sebagai tautan: hover menyorot satu kartu, meredupkan yang lain, dan glow tipis mengikuti kursor. */
export function Principles() {
  // Posisi kursor ditulis langsung ke CSS var (tanpa render ulang).
  function onMove(e: React.PointerEvent<HTMLAnchorElement>) {
    if (e.pointerType !== "mouse") return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
  }

  return (
    <ul className="grid gap-4 lg:grid-cols-3 lg:gap-5 [&:has(>li:hover)>li:not(:hover)]:opacity-60">
      {PRINCIPLES.map((p, i) => (
        <li key={p.title} className="transition-opacity duration-[350ms] ease-out">
          <Reveal delay={0.09 * i} className="h-full">
            <Link
              href={p.href}
              onPointerMove={onMove}
              className="group relative isolate flex h-full flex-col gap-6 overflow-hidden rounded-[22px] border border-canvas-line bg-white p-6 transition-[transform,border-color,background-color,box-shadow] duration-[350ms] ease-out hover:-translate-y-1 hover:border-data-blue/60 hover:bg-data-blue/[0.03] hover:shadow-[0_18px_36px_-28px_rgba(18,56,245,0.5)] focus-visible:-translate-y-1 focus-visible:border-data-blue/60 md:p-7" // taste-skill-ignore: bayangan hanya saat hover (brief §9)
            >
              {/* Glow tipis mengikuti kursor, hanya saat hover dengan mouse. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
                style={{ background: "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(18,56,245,0.09), rgba(18,56,245,0) 70%)" }} // taste-skill-ignore: glow kursor sangat tipis (brief perbaikan §7)
              />
              <div className="flex items-center justify-between">
                <span className="type-small font-semibold text-ink-soft tabular-nums transition-colors duration-[350ms] group-hover:text-data-blue">
                  {String(i + 1).padStart(2, "0") /* taste-skill-ignore: penomoran prinsip dari referensi Fahren */}
                </span>
                <span className="flex size-9 items-center justify-center rounded-full border border-canvas-line text-ink-strong transition-[background-color,border-color,color] duration-[350ms] ease-out group-hover:border-data-blue group-hover:bg-data-blue group-hover:text-white">
                  <ArrowRightIcon weight="bold" className="size-4 transition-transform duration-[350ms] ease-out group-hover:translate-x-1.5" aria-hidden="true" />
                </span>
              </div>
              <div className="flex gap-4">
                <span className="relative flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-canvas text-ink-strong transition-colors duration-[350ms] ease-out group-hover:bg-data-blue/10 group-hover:text-data-blue">
                  <p.Icon weight="regular" className="size-6" aria-hidden="true" />
                  {p.crossed && (
                    <span aria-hidden="true" className="absolute h-[2px] w-7 rotate-45 rounded-full bg-current ring-2 ring-canvas transition-[box-shadow] duration-[350ms] group-hover:ring-transparent" />
                  )}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[1.375rem] leading-7 font-extrabold tracking-[-0.025em] text-ink-strong">{p.title}</h3>
                  <p className="type-body text-ink-soft">{p.body}</p>
                  <span className="sr-only">{p.more}</span>
                </div>
              </div>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------- Visual perjalanan kuliah

/**
 * Visual 2 (aset Fahren, tulisan tangan bagian dari gambar) di sisi kanan panel fakta: mengisi kolomnya, tepi kiri
 * memudar ke putih panel agar menyatu. Muncul (opacity + scale 0,97) + paralaks halus ±10 px.
 */
export function JourneyVisual({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [10, -10])

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.97 }}
        animate={reduce || inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay: reduce ? 0 : 0.25 }}
        className="absolute inset-0 lg:[mask-image:linear-gradient(to_right,transparent,#000_26%)]" // taste-skill-ignore: tepi kiri memudar ke panel (referensi Fahren)
      >
        <motion.div style={reduce ? undefined : { y }} className="absolute -inset-y-3 inset-x-0">
          <Image
            src="/images/landing/bukan-toko-perjalanan.webp"
            alt="Tumpukan buku berlabel Coding, Design, Gaming, dan Kuliah di meja dengan tulisan tangan: bukan sekadar spesifikasi, tapi solusi yang sesuai dengan perjalanan kuliahmu"
            fill
            sizes="(min-width: 1024px) 34rem, 92vw"
            className="object-cover object-[62%_50%]"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
