"use client"

import type * as React from "react"
import { QuestionIcon } from "@phosphor-icons/react/dist/ssr/Question"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { getWizardOptions } from "@/lib/api"
import { formatDecimal } from "@/lib/format"
import type { RecommendationResult } from "@/types"

// Modal "Bagaimana skor dihitung?" (PRD §27): metode SAW dalam 4 langkah sederhana + contoh
// angka mock Best Match. Hanya menjelaskan; perhitungan asli dilakukan backend.

const { criterionLabels } = getWizardOptions()

const steps = [
  { title: "Saring", body: "Laptop yang melewati budget-mu atau tidak memenuhi syarat wajib dikeluarkan lebih dulu." },
  {
    title: "Samakan skala",
    body: "Setiap spek diubah ke skala 0–100. Untuk performa dan baterai makin besar makin baik; untuk harga dan bobot makin kecil makin baik.",
  },
  { title: "Beri bobot", body: "Skor tiap kriteria dikalikan bobot dari prioritasmu, jadi yang kamu anggap penting berpengaruh lebih besar." },
  { title: "Jumlahkan", body: "Hasil perkalian dijumlahkan menjadi skor kecocokan, lalu laptop diurutkan dari skor tertinggi." },
]

export function ScoreExplainer({
  example,
  exampleName,
  trigger,
}: {
  example?: RecommendationResult
  exampleName?: string
  /** Tombol pembuka kustom (mis. tautan "Pelajari cara perhitungannya →" di landing). */
  trigger?: React.ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="link" size="sm">
            <QuestionIcon weight="bold" aria-hidden="true" /> Bagaimana skor dihitung?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bagaimana skor dihitung?</DialogTitle>
          <DialogDescription>
            SPECO memakai metode Simple Additive Weighting (SAW). Singkatnya ada empat langkah.
          </DialogDescription>
        </DialogHeader>

        <ol className="flex flex-col gap-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="num grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft type-small text-primary" aria-hidden="true">
                {i + 1}
              </span>
              <p className="type-small font-normal text-text">
                <strong className="font-semibold">{s.title}.</strong> {s.body}
              </p>
            </li>
          ))}
        </ol>

        {example && (
          <div className="flex flex-col gap-2">
            <p className="type-small text-text">Contoh: {exampleName}</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] type-small">
                <caption className="sr-only">Rincian skor {exampleName}</caption>
                <thead>
                  <tr className="border-b border-border text-left text-text-muted">
                    <th scope="col" className="py-2 font-medium">Kriteria</th>
                    <th scope="col" className="py-2 text-right font-medium">Bobot</th>
                    <th scope="col" className="py-2 text-right font-medium">Skor</th>
                    <th scope="col" className="py-2 text-right font-medium">Kontribusi</th>
                  </tr>
                </thead>
                <tbody>
                  {example.breakdown.map((b) => (
                    <tr key={b.criterion} className="border-b border-border">
                      <th scope="row" className="py-2 text-left font-normal">{criterionLabels[b.criterion]}</th>
                      <td className="num py-2 text-right">{b.weight}%</td>
                      <td className="num py-2 text-right">{b.score}</td>
                      <td className="num py-2 text-right">{formatDecimal((b.weight * b.score) / 100)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" className="py-2 text-left font-semibold">Total</th>
                    <td className="num py-2 text-right">100%</td>
                    <td />
                    <td className="num py-2 text-right font-semibold">{example.matchScore}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="type-micro text-text-muted">Angka contoh (data demo). Perhitungan asli dilakukan server.</p>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Tutup</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
