"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react"
import { cn } from "cn"
import type { LandingSample } from "@/components/landing/sample-data"
import { RequirementSnippet, ResultSnippet, WizardSnippet } from "@/components/landing/snippets"
import { FRONT_SCREEN_RECT, renderAlt, renderSrc, type LaptopImage } from "@/lib/laptop-image"

// Cerita ter-pin "Ceritakan kebutuhanmu" (REDESIGN §16 section 3; gerak 3 & 11).
// md+ tanpa reduced motion: wrapper 300vh, panel kanan sticky. Render 3/4 berputar ke depan, lalu
// layar render menampilkan UI asli Wizard → Profil → Hasil sesuai progres scroll.
// Mobile & reduced motion: tiga blok statis (dipilih lewat CSS, tanpa beda hasil server/klien).

const STEPS = [
  {
    title: "Jawab 5 pertanyaan singkat",
    body: "Budget, jurusan, aktivitas, aplikasi, dan prioritas. Tanpa istilah teknis, cukup klik.",
    Snippet: WizardSnippet,
  },
  {
    title: "Lihat spek yang kamu butuh",
    body: "Sebelum melihat satu pun laptop, kamu tahu RAM, SSD, dan CPU minimum beserta alasannya.",
    Snippet: RequirementSnippet,
  },
  {
    title: "Pilih laptop dengan alasan",
    body: "Skor kecocokan, alasan yang menyebut sumbernya, dan trade-off yang jujur.",
    Snippet: ResultSnippet,
  },
]

const IMAGE: LaptopImage = { shape: "mainstream", color: "silver" }
const SCREEN = FRONT_SCREEN_RECT["mainstream-silver-front"]!
/** Ukuran layar virtual (px CSS) sebelum diskalakan ke kotak layar render. */
const VIRTUAL_W = 560

function StepList({ active }: { active: number }) {
  return (
    <ol className="flex flex-col gap-2">
      {STEPS.map((s, i) => {
        const on = i === active
        return (
          <li
            key={s.title}
            aria-current={on ? "step" : undefined}
            className={cn(
              "flex gap-4 rounded-card p-4 transition-colors duration-[var(--motion-medium)]",
              on ? "bg-bg" : "opacity-60"
            )}
          >
            <span
              className={cn(
                "num grid size-9 shrink-0 place-items-center rounded-[10px] type-small transition-colors duration-[var(--motion-medium)]",
                on ? "bg-cobalt-600 text-white" : "bg-paper-100 text-text-muted"
              )}
            >
              {i + 1}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="type-h3 text-text">{s.title}</h3>
              <p className="type-body text-text-muted">{s.body}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** UI asli diskalakan agar pas di kotak layar render `front`. */
function Screen({ active, sample }: { active: number; sample: LandingSample }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(0.5)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / VIRTUAL_W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const ratio = SCREEN.height / SCREEN.width / (4 / 3) // tinggi/lebar kotak layar di gambar 4:3
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-bg">
      <div
        className="relative origin-top-left"
        style={{ width: VIRTUAL_W, height: VIRTUAL_W * ratio, transform: `scale(${scale})` }}
      >
        {STEPS.map(({ Snippet }, i) => (
          <div
            key={i}
            aria-hidden="true"
            className={cn(
              "absolute inset-0 flex justify-center overflow-hidden px-6 pt-6 transition-opacity duration-[var(--motion-medium)]",
              i === active ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="w-full max-w-[400px]">
              <Snippet sample={sample} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ScrollStory({ sample }: { sample: LandingSample }) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(0)
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end end"] })
  // Gerak 11: 3/4 → depan di awal cerita; layar menyala setelah laptop menghadap pengguna.
  const frontOpacity = useTransform(scrollYProgress, [0.02, 0.14], [0, 1])
  const screenOpacity = useTransform(scrollYProgress, [0.12, 0.2], [0, 1])
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < 0.4 ? 0 : v < 0.72 ? 1 : 2
    setActive((prev) => (prev === next ? prev : next))
  })

  return (
    <>
      {/* ------------------------------------------------ Ter-pin: md+ tanpa reduced motion */}
      <div ref={wrapperRef} className="relative hidden h-[300vh] md:block motion-reduce:md:hidden">
        <div className="sticky top-0 flex h-svh items-center">
          <div className="page-container grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <StepList active={active} />
            </div>
            <div className="lg:col-span-7">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-studio">
                <Image src={renderSrc("mainstream-silver-34")} alt="" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-contain" />
                <motion.div className="absolute inset-0" style={{ opacity: frontOpacity }}>
                  <Image
                    src={renderSrc("mainstream-silver-front")}
                    alt={renderAlt(IMAGE, "front")}
                    fill
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-contain"
                  />
                  <motion.div
                    className="absolute overflow-hidden rounded-[4px]"
                    style={{
                      opacity: screenOpacity,
                      left: `${SCREEN.left}%`,
                      top: `${SCREEN.top}%`,
                      width: `${SCREEN.width}%`,
                      height: `${SCREEN.height}%`,
                    }}
                  >
                    <Screen active={active} sample={sample} />
                  </motion.div>
                </motion.div>
                <span aria-hidden="true" className="absolute top-2 left-3 type-micro text-text-muted">
                  Ilustrasi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ Statis: mobile & reduced motion */}
      <ol className="page-container flex flex-col gap-10 md:hidden motion-reduce:md:flex">
        {STEPS.map(({ title, body, Snippet }, i) => (
          <li key={title} className="flex min-w-0 flex-col gap-4">
            <div className="flex gap-4">
              <span className="num grid size-9 shrink-0 place-items-center rounded-[10px] bg-cobalt-600 type-small text-white">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="type-h3 text-text">{title}</h3>
                <p className="type-body text-text-muted">{body}</p>
              </div>
            </div>
            <div className="rounded-[16px] bg-bg p-4">
              <Snippet sample={sample} />
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}
