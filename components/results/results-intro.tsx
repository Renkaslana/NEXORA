"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple"
import type { Icon } from "@phosphor-icons/react"
import { EASE_OUT } from "@/lib/motion"

// Pembuka halaman Hasil (brief REDESIGN UI/UX HASIL + referensi Fahren, Okt 2026): konteks sebelum hasil.
// Desktop: foto editorial (aset Fahren, laptop di kanan) sebagai latar, teks + ringkasan jawaban di kiri di atas
// veil putih yang memudar. Mobile: judul → ringkasan → foto sebagai blok. Bukan kartu hasil.

const SRC = "/images/hasil/intro.webp"
const ALT = "Laptop terbuka di teras putih menghadap danau dan pegunungan berkabut"

export interface IntroSummaryItem {
  label: string
  value: string
  Icon: Icon
}

export function ResultsIntro({ count, summary, editHref }: { count: number; summary: IntroSummaryItem[]; editHref: string }) {
  const reduce = useReducedMotion()
  const up = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease: EASE_OUT, delay },
        }

  const edit = (
    <Link
      href={editHref}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-bg px-4 type-small text-text transition-colors duration-200 hover:border-primary hover:text-primary"
    >
      <PencilSimpleIcon weight="bold" className="size-4" aria-hidden="true" />
      Ubah kebutuhan
    </Link>
  )

  return (
    <section aria-labelledby="hasil-title" className="relative isolate overflow-hidden bg-[#e9f2fc]">
      {/* Desktop: foto sebagai latar. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden lg:block"
        initial={reduce ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
      >
        <Image src={SRC} alt="" fill loading="eager" fetchPriority="high" sizes="100vw" quality={86} className="object-cover object-[72%_60%]" />
      </motion.div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.82) 30%, rgba(255,255,255,0) 56%), linear-gradient(0deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 22%)", // taste-skill-ignore: veil keterbacaan di atas foto
        }}
      />
      <span className="sr-only hidden lg:block">{ALT}</span>

      <div className="page-container relative flex flex-col gap-6 pt-10 pb-24 lg:min-h-[25rem] lg:justify-center lg:pt-12 lg:pb-28">
        <div className="flex max-w-[36rem] flex-col gap-4">
          <motion.p {...up(0)} className="type-micro font-semibold tracking-[0.24em] text-primary uppercase">
            Hasil rekomendasi
          </motion.p>
          <motion.h1
            {...up(0.06)}
            id="hasil-title"
            className="text-[2.25rem] leading-[1.04] font-extrabold tracking-[-0.045em] text-text md:text-[3rem] lg:text-[3.5rem]"
          >
            Laptop yang paling <span className="text-primary sm:block">cocok untukmu.</span>
          </motion.h1>
          <motion.p {...up(0.12)} className="type-body-l text-text-muted">
            Kami menemukan {count} pilihan berdasarkan budget, kebutuhan, dan preferensimu.
          </motion.p>
        </div>

        <motion.div {...up(0.18)} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <ul aria-label="Ringkasan jawabanmu" className="grid grid-cols-1 gap-2 rounded-[18px] border border-border bg-bg p-2 sm:grid-cols-3 sm:gap-0">
            {summary.map(({ label, value, Icon }) => (
              <li key={label} className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 sm:min-w-[11rem]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-primary-soft text-primary">
                  <Icon weight="bold" className="size-5" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="type-micro text-text-muted">{label}</span>
                  <span className="truncate type-small font-semibold text-text">{value}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="lg:hidden">{edit}</div>
        </motion.div>

        {/* Mobile/tablet: foto sebagai blok di bawah ringkasan. */}
        <motion.div
          className="relative aspect-[16/9] overflow-hidden rounded-[20px] lg:hidden"
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.2 }}
        >
          <Image src={SRC} alt={ALT} fill sizes="100vw" quality={86} className="object-cover object-[76%_60%]" />
        </motion.div>
      </div>

      {/* Desktop: "Ubah kebutuhan" di kanan bawah, di atas foto. */}
      <div className="page-container pointer-events-none absolute inset-x-0 bottom-28 hidden justify-end lg:flex">
        <div className="pointer-events-auto">{edit}</div>
      </div>
    </section>
  )
}
