import Image from "next/image"
import { cn } from "cn"
import { LaptopIcon } from "@phosphor-icons/react/dist/ssr/Laptop"
import { renderAlt, renderKey, renderSrc, type LaptopImage } from "@/lib/laptop-image"
import type { LaptopAngle } from "@/types"

// Render ilustrasi laptop 4:3 di atas bidang `studio` (REDESIGN §24). Latar render sudah
// diratakan ke warna yang sama, jadi gambar menyatu tanpa sambungan. Label "Ilustrasi" wajib
// di tampilan besar agar render tidak dikira foto produk asli.
function LaptopRender({
  image,
  angle = "34",
  sizes,
  eager = false,
  label = true,
  labelPosition = "bottom",
  decorative = false,
  className,
  imageClassName,
}: {
  image: LaptopImage
  angle?: LaptopAngle
  /** Lebar tampil, mis. "(min-width: 1024px) 40vw, 100vw". */
  sizes: string
  /** Gambar di atas lipatan (hero, Best Match): dimuat lebih dulu. */
  eager?: boolean
  /** Tampilkan label "Ilustrasi" di sudut kiri. */
  label?: boolean
  /** "top" bila bagian bawah render tertutup elemen lain (mis. kartu di hero). */
  labelPosition?: "top" | "bottom"
  /** Thumbnail di samping teks yang sudah menyebut laptopnya: alt kosong. */
  decorative?: boolean
  className?: string
  imageClassName?: string
}) {
  const name = renderKey(image, angle)
  const alt = decorative ? "" : renderAlt(image, angle)

  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden bg-studio", className)}>
      {name ? (
        <Image
          src={renderSrc(name)}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className={cn("object-contain", imageClassName)}
        />
      ) : (
        // Tidak ada render sama sekali untuk warna ini: siluet netral, bukan kotak abu.
        <div
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : alt}
          className="flex size-full items-center justify-center text-text-muted"
        >
          <LaptopIcon weight="duotone" className="size-1/4 max-w-24" aria-hidden="true" />
        </div>
      )}
      {label && (
        <span
          aria-hidden="true"
          className={cn("absolute left-3 type-micro text-text-muted", labelPosition === "top" ? "top-2" : "bottom-2")}
        >
          Ilustrasi
        </span>
      )}
    </div>
  )
}

export { LaptopRender }
