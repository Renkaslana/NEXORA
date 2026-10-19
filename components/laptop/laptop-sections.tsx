"use client"

import * as React from "react"
import { cn } from "cn"
import { BatteryFull, Cpu, Monitor, Plus, Minus, Weight, Wrench, type LucideIcon } from "lucide-react"
import { LaptopRender } from "@/components/ui/laptop-render"
import { getWizardOptions } from "@/lib/api"
import { formatRupiah, formatStorage, formatWeight } from "@/lib/format"
import { ANGLE_LABEL, availableAngles, type LaptopImage } from "@/lib/laptop-image"
import type { ActivityId, Laptop, LaptopAngle } from "@/types"

// Bagian-bagian halaman Detail (PRD §19): galeri, spesifikasi kunci, kelebihan & kekurangan,
// cocok untuk, spesifikasi lengkap.

const { activities } = getWizardOptions()
const activityLabel = (id: ActivityId) => activities.find((a) => a.id === id)?.label ?? id
const inch = (n: number) => `${String(n).replace(".", ",")}″`

// ---------------------------------------------------------------- Galeri

// Hanya sudut yang punya file render yang tampil (REDESIGN §22, §24). Galeri geser (gerak 14) di R4.
export function LaptopGallery({ name, image }: { name: string; image: LaptopImage }) {
  const angles = availableAngles(image)
  const [active, setActive] = React.useState<LaptopAngle>("34")
  return (
    <div className="flex flex-col gap-3">
      <LaptopRender
        image={image}
        angle={active}
        sizes="(min-width: 1024px) 50vw, 100vw"
        eager
        className="rounded-card"
      />
      {angles.length > 1 && (
        <div role="group" aria-label={`Sudut ilustrasi ${name}`} className="grid grid-cols-4 gap-2">
          {angles.map((angle) => (
            <button
              key={angle}
              type="button"
              aria-pressed={active === angle}
              aria-label={`Tampilkan sudut ${ANGLE_LABEL[angle].toLowerCase()}`}
              onClick={() => setActive(angle)}
              className={cn(
                "overflow-hidden rounded-control border-2 transition-colors duration-150",
                active === angle ? "border-primary" : "border-transparent hover:border-border-strong"
              )}
            >
              <LaptopRender image={image} angle={angle} sizes="120px" label={false} decorative />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- Spesifikasi kunci

function SpecCard({ icon: Icon, title, value, detail }: { icon: LucideIcon; title: string; value: string; detail: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-card border border-border p-5">
      <p className="flex items-center gap-2 type-small text-text-muted">
        <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
        {title}
      </p>
      <p className="type-h3 text-text">{value}</p>
      <p className="type-small font-normal text-text-muted">{detail}</p>
    </div>
  )
}

export function KeySpecs({ laptop: l }: { laptop: Laptop }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SpecCard icon={Cpu} title="Performa" value={l.cpu.name} detail={`${l.cpu.cores} core / ${l.cpu.threads} thread · GPU ${l.gpu.name}${l.gpu.type === "dedicated" ? ` ${l.gpu.vramGb} GB` : " (integrated)"}`} />
      <SpecCard icon={Monitor} title="Layar" value={`${inch(l.display.inch)} ${l.display.panel}`} detail={`${l.display.resolution.replace("x", " × ")} · ${l.display.srgbPercent}% sRGB · ${l.display.refreshHz} Hz`} />
      <SpecCard icon={BatteryFull} title="Baterai" value={`${l.batteryWh} Wh`} detail="Kapasitas baterai; makin besar makin lama tahan tanpa colokan." />
      <SpecCard icon={Weight} title="Portabilitas" value={formatWeight(l.weightKg)} detail={`Port: ${l.ports.join(", ")}`} />
      <SpecCard
        icon={Wrench}
        title="Upgradeability"
        value={l.ram.upgradeable ? `RAM bisa sampai ${l.ram.maxGb} GB` : "RAM tidak bisa ditambah"}
        detail={`Sekarang ${l.ram.gb} GB ${l.ram.type} · ${formatStorage(l.storage.gb)} ${l.storage.type}`}
      />
    </div>
  )
}

// ---------------------------------------------------------------- Kelebihan & kekurangan

export function ProsCons({ laptop }: { laptop: Laptop }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h3 className="type-h3 text-text">Kelebihan</h3>
        <ul className="flex flex-col gap-2">
          {laptop.pros.map((p) => (
            <li key={p} className="flex gap-2 type-body text-text">
              <Plus className="mt-1 size-4 shrink-0 text-success" strokeWidth={2.5} aria-hidden="true" />
              <span><span className="sr-only">Kelebihan: </span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="type-h3 text-text">Kekurangan</h3>
        <ul className="flex flex-col gap-2">
          {laptop.cons.map((c) => (
            <li key={c} className="flex gap-2 type-body text-text">
              <Minus className="mt-1 size-4 shrink-0 text-danger" strokeWidth={2.5} aria-hidden="true" />
              <span><span className="sr-only">Kekurangan: </span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Cocok untuk

export function SuitedFor({ laptop, userActivities }: { laptop: Laptop; userActivities: ActivityId[] }) {
  const notSuited = activities.map((a) => a.id).filter((id) => !laptop.useCases.includes(id))
  const chip = (id: ActivityId, good: boolean) => (
    <li
      key={id}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-full px-3 type-small",
        good ? "bg-success/8 text-success" : "bg-surface text-text-muted",
        userActivities.includes(id) && "ring-1 ring-current"
      )}
    >
      {good ? <Plus className="size-3.5" aria-hidden="true" /> : <Minus className="size-3.5" aria-hidden="true" />}
      {activityLabel(id)}
      {userActivities.includes(id) && <span className="type-micro">(kamu)</span>}
    </li>
  )
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h3 className="type-h3 text-text">Cocok untuk</h3>
        <ul className="flex flex-wrap gap-2">{laptop.useCases.map((id) => chip(id, true))}</ul>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="type-h3 text-text">Kurang cocok untuk</h3>
        <ul className="flex flex-wrap gap-2">{notSuited.map((id) => chip(id, false))}</ul>
      </div>
      <p className="type-micro text-text-muted md:col-span-2">Tanda “(kamu)” = aktivitas yang kamu pilih di Wizard.</p>
    </div>
  )
}

// ---------------------------------------------------------------- Spesifikasi lengkap

export function FullSpecs({ laptop: l }: { laptop: Laptop }) {
  const rows: [string, string][] = [
    ["Merek", l.brand],
    ["Model", l.model],
    ["Harga (contoh)", formatRupiah(l.priceIdr)],
    ["CPU", `${l.cpu.name}, ${l.cpu.cores} core / ${l.cpu.threads} thread`],
    ["GPU", `${l.gpu.name}${l.gpu.type === "dedicated" ? `, ${l.gpu.vramGb} GB VRAM` : " (integrated)"}`],
    ["RAM", `${l.ram.gb} GB ${l.ram.type}${l.ram.upgradeable ? `, maks ${l.ram.maxGb} GB` : ", tidak bisa di-upgrade"}`],
    ["Storage", `${formatStorage(l.storage.gb)} ${l.storage.type}`],
    ["Layar", `${inch(l.display.inch)} ${l.display.resolution.replace("x", " × ")} ${l.display.panel}`],
    ["Akurasi warna", `${l.display.srgbPercent}% sRGB`],
    ["Refresh rate", `${l.display.refreshHz} Hz`],
    ["Baterai", `${l.batteryWh} Wh`],
    ["Bobot", formatWeight(l.weightKg)],
    ["Port", l.ports.join(", ")],
  ]
  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full type-small">
        <caption className="sr-only">Spesifikasi lengkap {l.brand} {l.model}</caption>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-border last:border-0">
              <th scope="row" className="w-40 bg-surface px-4 py-3 text-left font-medium text-text-muted">
                {k}
              </th>
              <td className="px-4 py-3 text-text">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
