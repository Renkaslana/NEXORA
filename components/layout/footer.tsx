import { Wordmark } from "@/components/layout/navbar"

// Footer ringkas. PRD §27: label "Data contoh (demo)" tampil selama memakai mock data.
export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="page-container flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <Wordmark />
          <p className="type-small font-normal text-text-muted">
            Laptop Decision Assistant · Proyek RPL Kelompok 7A
          </p>
        </div>
        <div className="flex flex-col gap-1 md:items-end">
          <p className="type-small font-normal text-text-muted">
            NEXORA tidak menjual laptop, tidak memasang iklan, dan selalu menjelaskan trade-off.
          </p>
          <p className="type-micro font-medium tracking-normal text-text-muted">
            Data contoh (demo): harga dan skor bukan data aktual. Gambar laptop dan foto suasana di landing adalah
            ilustrasi AI (Gemini); sebagian foto suasana lain dari StockSnap (CC0).
          </p>
        </div>
      </div>
    </footer>
  )
}
