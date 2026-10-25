"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { Reveal } from "@/components/landing/reveal"
import { Button } from "@/components/ui/button"
import { LaptopRender } from "@/components/ui/laptop-render"
import { getWizardOptions } from "@/lib/api"

// CTA penutup "kalimat dengan isian" (redesign "Kalimat terbelah"): "Budget-ku Rp __ jt, kuliah __."
// Mengisi ?budget= dan ?jurusan= Wizard. Tanpa JavaScript, form GET tetap membawa jurusan dan
// budget dalam juta (`budgetJt`) yang diabaikan Wizard; tombol tetap membuka Wizard.

const options = getWizardOptions()
const MIN_JT = options.budgetRange.min / 1_000_000
const MAX_JT = options.budgetRange.max / 1_000_000

export function ClosingCta() {
  const router = useRouter()
  const [jt, setJt] = React.useState("8")
  const [major, setMajor] = React.useState("informatika")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const n = Math.min(MAX_JT, Math.max(MIN_JT, Number(jt.replace(",", ".")) || 8))
    router.push(`/rekomendasi/budget?budget=${Math.round(n * 2) * 500_000}&jurusan=${major}`)
  }

  const field =
    "inline-flex h-14 items-center rounded-control bg-cobalt-700 px-3 align-middle text-white outline-none transition-colors hover:bg-cobalt-800 md:h-[4.5rem]"

  return (
    <section aria-labelledby="closing-title" data-tone="cobalt" className="overflow-hidden bg-cobalt-600 py-16 text-white md:py-24">
      <div className="page-container grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-7" innerClassName="flex flex-col gap-8">
          <h2 id="closing-title" className="sr-only">
            Mulai cari laptop
          </h2>
          <form action="/rekomendasi/budget" method="get" onSubmit={onSubmit} className="flex flex-col gap-8">
            <p className="text-[2.25rem] leading-[1.25] font-extrabold tracking-[-0.035em] md:text-[3.25rem]">
              <label htmlFor="cta-budget">Budget-ku Rp</label>{" "}
              <input
                id="cta-budget"
                name="budgetJt"
                inputMode="decimal"
                value={jt}
                onChange={(e) => setJt(e.target.value.replace(/[^\d,.]/g, "").slice(0, 4))}
                aria-describedby="cta-budget-hint"
                className={`${field} w-[3.2ch] text-center tabular-nums`}
              />{" "}
              jt,
              <br />
              <label htmlFor="cta-major">kuliah</label>{" "}
              <select
                id="cta-major"
                name="jurusan"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className={`${field} max-w-full cursor-pointer text-[0.6em] font-bold`}
              >
                {options.majors.map((m) => (
                  <option key={m.id} value={m.id} className="bg-bg text-text">
                    {m.label}
                  </option>
                ))}
              </select>
              .
            </p>
            <p id="cta-budget-hint" className="type-body text-cobalt-100">
              Rp{MIN_JT}–{MAX_JT} jt. Lima pertanyaan, tanpa akun; jawabanmu tersimpan selama tab ini terbuka.
            </p>
            <Button type="submit" variant="signal" size="lg" className="self-start">
              Cari laptop yang pas <ArrowRightIcon weight="bold" data-arrow aria-hidden="true" />
            </Button>
          </form>
        </Reveal>
        <Reveal delay={0.12} className="lg:col-span-5">
          <div className="overflow-hidden rounded-[20px]">
            <LaptopRender
              image={{ shape: "ultrabook", color: "silver" }}
              angle="side"
              sizes="(min-width: 1024px) 40vw, 100vw"
              imageClassName="animate-drift"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
