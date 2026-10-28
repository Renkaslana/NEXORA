import { formatRupiah, formatStorage, formatWeight } from "@/lib/format"
import type { Laptop } from "@/types"

// Tabel spesifikasi lengkap (PRD §19), dipakai di dialog "Lihat spesifikasi lengkap" halaman Detail.

const inch = (n: number) => `${String(n).replace(".", ",")}″`

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
