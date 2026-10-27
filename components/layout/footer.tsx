import { Wordmark } from "@/components/layout/navbar"

// Footer ringkas. PRD §27: label "Data contoh (demo)" tampil selama memakai mock data.
export function Footer() {
  return (
    <footer className="mt-auto bg-canvas">
      <div className="page-container flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <Wordmark />
          <p className="type-small font-normal text-ink-soft">Spec for You · Proyek RPL Kelompok 7A</p>
        </div>
        <div className="flex flex-col gap-1 md:items-end">
          <p className="type-small font-normal text-ink-soft">
            SPECO tidak menjual laptop, tidak memasang iklan, dan selalu menjelaskan trade-off.
          </p>
          <p className="type-micro font-medium tracking-normal text-ink-soft">
            Data contoh (demo): harga, skor, dan bobot bukan data aktual. Gambar laptop adalah ilustrasi AI, bukan foto
            produk asli.
          </p>
        </div>
      </div>
    </footer>
  )
}
