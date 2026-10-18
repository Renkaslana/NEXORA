"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "cn"
import { ArrowLeft, Award, Check, CircleAlert, GitCompareArrows, Laptop as LaptopIcon, Plus, RotateCcw, Trophy, X } from "lucide-react"
import { FlowHeader } from "@/components/layout/flow-header"
import { compareHref } from "@/components/results/compare-tray"
import { Button } from "@/components/ui/button"
import { Chip, StatusChip } from "@/components/ui/chip"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { firstMissingStep, stepHref } from "@/components/wizard/steps"
import { getLaptops, getRecommendations, getRequirements, parseMockMode, type MockMode, type RecommendationSet } from "@/lib/api"
import { buildCompareRows, compareVerdict, type CompareCell, type CompareRow } from "@/lib/compare-rows"
import { formatRupiah } from "@/lib/format"
import { useApi } from "@/lib/use-api"
import { MAX_COMPARE, rehydrateCompare, useCompareStore } from "@/store/compare"
import { rehydrateProfile, useProfileHydrated, useProfileStore } from "@/store/profile"
import { profileKey, useResultsStore } from "@/store/results"
import { rehydrateSaved, useSavedHydrated, useSavedStore } from "@/store/saved"
import type { Laptop, RecommendationResult, RequirementProfile, UserProfile } from "@/types"

// Komparasi /bandingkan?ids=a,b,c (PRD §18, §14, §26). Kolom pertama selalu "Kebutuhanmu".
// Desktop: tabel dengan header laptop sticky. Mobile: mode kartu per kriteria (opsi PRD §18).

const RESULTS_HREF = "/rekomendasi/hasil"

interface CompareData {
  laptops: Laptop[]
  profile: UserProfile | null
  set: RecommendationSet | null
  requirement: RequirementProfile | null
}

const nameOf = (l: Laptop) => `${l.brand} ${l.model}`

function CellBadges({ cell }: { cell: CompareCell }) {
  return (
    <span className="flex flex-wrap gap-1">
      {cell.status === "met" && <StatusChip status="met" />}
      {cell.status === "short" && <StatusChip status="short" />}
      {cell.status === "near" && <Chip tone="warning">≈ Mendekati</Chip>}
      {cell.best && (
        <Chip tone="primary">
          <Award className="size-3.5" aria-hidden="true" />
          Unggul
        </Chip>
      )}
    </span>
  )
}

function CompareSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <Skeleton className="h-24 rounded-card bg-surface" />
      <Skeleton className="h-96 rounded-card bg-surface" />
    </div>
  )
}

// ---------------------------------------------------------------- Isi

function CompareBody({ data, ids, announce }: { data: CompareData; ids: string[]; announce: (m: string) => void }) {
  const router = useRouter()
  const removeFromTray = useCompareStore((s) => s.remove)
  const savedHydrated = useSavedHydrated()
  const decision = useSavedStore((s) => s.decision)
  const decide = useSavedStore((s) => s.decide)
  const clearDecision = useSavedStore((s) => s.clearDecision)
  const [onlyDiff, setOnlyDiff] = React.useState(false)

  const { laptops, profile, set, requirement } = data
  const results = new Map<string, RecommendationResult>(
    (set?.items ?? []).filter((i) => ids.includes(i.laptop.id)).map((i) => [i.laptop.id, i.result])
  )
  const rows = buildCompareRows({ laptops, requirement, profile, results })
  const shownRows = onlyDiff ? rows.filter((r) => !r.same) : rows
  const verdict = compareVerdict(rows, laptops, results)
  const chosen = savedHydrated && decision && laptops.some((l) => l.id === decision.laptopId) ? decision.laptopId : null

  const remove = (id: string) => {
    removeFromTray(id)
    const next = ids.filter((x) => x !== id)
    const removed = laptops.find((l) => l.id === id)
    announce(`${removed ? nameOf(removed) : "Laptop"} dihapus dari komparasi.`)
    router.replace(compareHref(next))
  }
  const choose = (l: Laptop) => {
    decide(l.id, ids)
    announce(`Kamu memilih ${nameOf(l)}. Keputusan tersimpan di perangkat ini.`)
  }

  const chooseButton = (l: Laptop, className?: string) => (
    <Button
      size="sm"
      variant={chosen === l.id ? "primary" : "secondary"}
      aria-pressed={chosen === l.id}
      onClick={() => (chosen === l.id ? clearDecision() : choose(l))}
      className={className}
    >
      {chosen === l.id ? <Check aria-hidden="true" /> : <Trophy aria-hidden="true" />}
      {chosen === l.id ? "Pilihanmu" : "Pilih laptop ini"}
    </Button>
  )

  return (
    <div className="flex flex-col gap-8">
      {/* ------------------------------------------------------------ Paling cocok untukmu */}
      {verdict && (
        <section aria-labelledby="verdict-title" className="flex flex-col gap-3 rounded-card bg-primary-soft p-5 md:flex-row md:items-center md:gap-6 md:p-6">
          <Trophy className="size-8 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-1">
            <h2 id="verdict-title" className="type-h3 text-text">
              Paling cocok untukmu: {nameOf(verdict.winner)}
            </h2>
            <p className="type-body text-text">{verdict.text}</p>
          </div>
          {chooseButton(verdict.winner, "self-start md:self-center")}
        </section>
      )}
      {!profile && (
        <p className="rounded-card bg-surface p-4 type-small font-normal text-text">
          Kolom “Kebutuhanmu” masih kosong.{" "}
          <Link href={stepHref("budget")} className="text-primary hover:underline">
            Isi Wizard
          </Link>{" "}
          untuk melihat mana yang memenuhi kebutuhanmu.
        </p>
      )}

      {chosen && (
        <p role="status" className="flex items-start gap-3 rounded-card bg-success/8 px-4 py-3 type-small text-text">
          <Check className="size-4 shrink-0 text-success" strokeWidth={2.5} aria-hidden="true" />
          <span>
            Keputusanmu: <strong className="font-semibold">{nameOf(laptops.find((l) => l.id === chosen)!)}</strong>. Tersimpan
            di perangkat ini.
          </span>
        </p>
      )}

      {/* ------------------------------------------------------------ Kontrol */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} className="size-5 accent-primary" />
          <span className="type-small text-text">Tampilkan hanya perbedaan</span>
        </label>
        {laptops.length < MAX_COMPARE && (
          <Button asChild variant="ghost" size="sm">
            <Link href={RESULTS_HREF}>
              <Plus aria-hidden="true" /> Tambah laptop
            </Link>
          </Button>
        )}
      </div>

      {/* ------------------------------------------------------------ Desktop: tabel */}
      <div className="hidden md:block">
        <table className="w-full table-fixed border-separate border-spacing-0 type-small">
          <caption className="sr-only">Perbandingan {laptops.map(nameOf).join(", ")} dengan kebutuhanmu</caption>
          <thead className="sticky top-0 z-10">
            <tr>
              <th scope="col" className="w-[14%] border-b border-border bg-bg p-3 text-left align-bottom font-medium text-text-muted">
                Spesifikasi
              </th>
              <th scope="col" className="w-[18%] border-b border-border bg-surface p-3 text-left align-bottom">
                <span className="type-small text-text">Kebutuhanmu</span>
              </th>
              {laptops.map((l) => (
                <th key={l.id} scope="col" className="border-b border-border bg-bg p-3 text-left align-top font-normal">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <span aria-hidden="true" className="grid aspect-[4/3] w-16 place-items-center rounded-control bg-surface text-text-muted">
                        <LaptopIcon className="size-5" strokeWidth={1.5} />
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => remove(l.id)} aria-label={`Hapus ${nameOf(l)} dari komparasi`}>
                        <X aria-hidden="true" />
                      </Button>
                    </div>
                    <Link href={`/laptop/${l.slug}`} className="type-small font-semibold text-text hover:underline">
                      {nameOf(l)}
                    </Link>
                    <span className="num type-micro text-text-muted">{formatRupiah(l.priceIdr)}</span>
                    {chooseButton(l, "self-start")}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shownRows.map((row) => (
              <tr key={row.id}>
                <th scope="row" className="border-b border-border p-3 text-left align-top font-medium text-text">
                  {row.label}
                </th>
                <td className="border-b border-border bg-surface p-3 align-top text-text-muted">{row.need}</td>
                {row.cells.map((cell) => (
                  <td key={cell.laptopId} className={cn("border-b border-border p-3 align-top", chosen === cell.laptopId && "bg-primary-soft/60")}>
                    <span className={cn("flex flex-col gap-1.5", row.id === "kecocokan" && "type-h3")}>
                      <span className={cn(row.id === "kecocokan" ? "num text-text" : "text-text")}>{cell.text}</span>
                      <CellBadges cell={cell} />
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------------ Mobile: kartu per kriteria */}
      <div className="flex flex-col gap-4 md:hidden">
        <ul className="flex flex-col gap-2" aria-label="Laptop yang dibandingkan">
          {laptops.map((l, i) => (
            <li key={l.id} className="flex items-center gap-3 rounded-card border border-border p-3">
              <span className="num grid size-8 shrink-0 place-items-center rounded-full bg-surface type-small text-text" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link href={`/laptop/${l.slug}`} className="truncate type-small font-semibold text-text hover:underline">
                  {nameOf(l)}
                </Link>
                {chooseButton(l, "self-start")}
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(l.id)} aria-label={`Hapus ${nameOf(l)} dari komparasi`}>
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
        {shownRows.map((row: CompareRow) => (
          <section key={row.id} aria-labelledby={`m-${row.id}`} className="flex flex-col gap-3 rounded-card bg-surface p-4">
            <div className="flex flex-col gap-0.5">
              <h3 id={`m-${row.id}`} className="type-body font-semibold text-text">
                {row.label}
              </h3>
              <p className="type-small font-normal text-text-muted">Kebutuhanmu: {row.need}</p>
            </div>
            <ul className="flex flex-col gap-2">
              {row.cells.map((cell, i) => (
                <li key={cell.laptopId} className="flex flex-col gap-1.5 rounded-control bg-bg p-3">
                  <p className="type-small text-text">
                    <span className="num mr-2 text-text-muted">{String.fromCharCode(65 + i)}</span>
                    <span className="sr-only">{nameOf(laptops[i])}: </span>
                    {cell.text}
                  </p>
                  <CellBadges cell={cell} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {onlyDiff && shownRows.length < rows.length && (
        <p className="type-small font-normal text-text-muted" aria-live="polite">
          {rows.length - shownRows.length} baris dengan nilai sama disembunyikan.
        </p>
      )}
      <p className="type-micro text-text-muted">
        “Unggul” = nilai terbaik di baris itu. ✓/✕ dibandingkan dengan Profil Kebutuhanmu. Data contoh (demo).
      </p>
    </div>
  )
}

// ---------------------------------------------------------------- Pemuatan

function CompareLoader({ ids, mock, onRetry, announce }: { ids: string[]; mock: MockMode | null; onRetry: () => void; announce: (m: string) => void }) {
  const [load] = React.useState(() => async (): Promise<CompareData> => {
    const current = useProfileStore.getState().profile
    const profile = firstMissingStep(current) ? null : current
    const { key, data } = useResultsStore.getState()
    const cached = profile && key === profileKey(profile) ? data : null
    const [laptops, set, requirement] = await Promise.all([
      getLaptops(ids, { mock }),
      profile ? (cached ? Promise.resolve(cached) : getRecommendations(profile)) : Promise.resolve(null),
      profile ? getRequirements(profile) : Promise.resolve(null),
    ])
    return { laptops, profile, set, requirement }
  })
  const state = useApi(load)

  if (state.status === "loading") {
    return (
      <>
        <span className="sr-only" role="status">
          Memuat komparasi…
        </span>
        <CompareSkeleton />
      </>
    )
  }
  if (state.status === "error") {
    return (
      <StateMessage icon={CircleAlert} tone="danger" title="Gagal memuat komparasi" body="Terjadi kesalahan saat memuat data laptop. Pilihanmu tetap tersimpan.">
        <Button onClick={onRetry}>
          <RotateCcw aria-hidden="true" /> Coba lagi
        </Button>
        <Button asChild variant="secondary">
          <Link href={RESULTS_HREF}>Kembali ke hasil</Link>
        </Button>
      </StateMessage>
    )
  }
  if (state.data.laptops.length < 2) return <EmptyCompare />
  return <CompareBody data={state.data} ids={state.data.laptops.map((l) => l.id)} announce={announce} />
}

function EmptyCompare() {
  return (
    <StateMessage icon={GitCompareArrows} title="Pilih minimal 2 laptop untuk dibandingkan." body="Tekan “Bandingkan” di kartu laptop pada halaman hasil, lalu buka lagi dari tray komparasi.">
      <Button asChild>
        <Link href={RESULTS_HREF}>
          <ArrowLeft aria-hidden="true" /> Kembali ke hasil
        </Link>
      </Button>
    </StateMessage>
  )
}

// ---------------------------------------------------------------- Halaman

export function CompareView() {
  const params = useSearchParams()
  const mock = parseMockMode(params.get("mock"))
  const ids = [...new Set((params.get("ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean))].slice(0, MAX_COMPARE)
  const hydrated = useProfileHydrated()
  const [attempt, setAttempt] = React.useState(0)
  const [message, setMessage] = React.useState<string | null>(null)
  const announce = React.useCallback((m: string) => setMessage(m), [])

  React.useEffect(() => {
    rehydrateProfile()
    rehydrateSaved()
    rehydrateCompare()
  }, [])

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <FlowHeader />
      <main className="page-container flex flex-1 flex-col gap-6 pt-6 pb-20 md:pt-8">
        <Link href={RESULTS_HREF} className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-control type-small text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke hasil
        </Link>
        <h1 className="type-h1 text-text">Bandingkan laptop</h1>
        {!hydrated ? (
          <CompareSkeleton />
        ) : ids.length < 2 ? (
          <EmptyCompare />
        ) : (
          <CompareLoader key={`${ids.join(",")}-${mock}-${attempt}`} ids={ids} mock={mock} onRetry={() => setAttempt((a) => a + 1)} announce={announce} />
        )}
        <p className="sr-only" aria-live="polite">
          {message}
        </p>
      </main>
    </div>
  )
}
