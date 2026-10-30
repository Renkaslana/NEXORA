"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "cn"
import { LaptopIcon } from "@phosphor-icons/react/dist/ssr/Laptop"
import { renderAlt, renderKey, renderSrc, type LaptopImage } from "@/lib/laptop-image"
import type { LaptopAngle } from "@/types"

// Render ilustrasi laptop 4:3 di atas bidang studio.
// Mendukung foto riil produk (customSrc) dengan fallback otomatis ke mockup studio jika gagal memuat.
function LaptopRender({
  image,
  customSrc,
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
  customSrc?: string | null
  angle?: LaptopAngle
  /** Lebar tampil, mis. "(min-width: 1024px) 40vw, 100vw". */
  sizes: string
  /** Gambar di atas lipatan (hero, Best Match): dimuat lebih dulu. */
  eager?: boolean
  /** Tampilkan label di sudut kiri. */
  label?: boolean
  /** "top" bila bagian bawah render tertutup elemen lain. */
  labelPosition?: "top" | "bottom"
  /** Thumbnail di samping teks yang sudah menyebut laptopnya: alt kosong. */
  decorative?: boolean
  className?: string
  imageClassName?: string
}) {
  const [loadFailed, setLoadFailed] = React.useState(false)
  const name = renderKey(image, angle)
  const alt = decorative ? "" : renderAlt(image, angle)

  const isUsingCustom = Boolean(customSrc && !loadFailed)
  const displaySrc = isUsingCustom ? customSrc! : (name ? renderSrc(name) : null)

  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden bg-studio", className)}>
      {displaySrc ? (
        <Image
          src={displaySrc}
          alt={alt}
          fill
          unoptimized={isUsingCustom}
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          onError={() => {
            if (isUsingCustom) {
              setLoadFailed(true)
            }
          }}
          className={cn("object-contain", isUsingCustom ? "p-3" : "", imageClassName)}
        />
      ) : (
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
          {isUsingCustom ? "Foto Produk" : "Ilustrasi"}
        </span>
      )}
    </div>
  )
}

export { LaptopRender }
