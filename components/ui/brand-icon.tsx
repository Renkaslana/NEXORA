"use client";

import * as React from "react";
import {
  siApple,
  siAsus,
  siLenovo,
  siDell,
  siHp,
  siAcer,
  siMsi,
  siGoogle,
  siIntel,
  siAmd,
  siNvidia,
  SimpleIcon,
} from "simple-icons";

export interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  brand: string;
  className?: string;
  useBrandColor?: boolean;
}

// Koleksi data Simple Icons resmi untuk merek global
const SIMPLE_ICONS_MAP: Record<string, SimpleIcon> = {
  apple: siApple,
  asus: siAsus,
  lenovo: siLenovo,
  dell: siDell,
  hp: siHp,
  acer: siAcer,
  msi: siMsi,
  google: siGoogle,
  intel: siIntel,
  amd: siAmd,
  nvidia: siNvidia,
};

// Vektor custom untuk merek lokal Indonesia (mengikuti format standar Simple Icons 24x24)
const LOCAL_INDONESIA_ICONS: Record<
  string,
  { title: string; hex: string; path: string }
> = {
  axioo: {
    title: "Axioo",
    hex: "006C49",
    // Vektor huruf a khas Axioo dalam grid 24x24
    path: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14.8h-2v-1.2c-.6.8-1.5 1.3-2.5 1.3-2 0-3.3-1.4-3.3-3.4 0-2.1 1.4-3.4 3.4-3.4.9 0 1.7.4 2.3 1V8.5h2.1v8.3zm-2.1-3.3c0-1.1-.7-1.8-1.7-1.8s-1.7.7-1.7 1.8.7 1.8 1.7 1.8 1.7-.7 1.7-1.8zM17 16.8h-2V7.2h2v9.6z",
  },
  advan: {
    title: "Advan",
    hex: "0284C7",
    // Vektor A dinamis Advan dalam grid 24x24
    path: "M12 2.5L3.5 21.5h4.2l1.9-4.5h8.8l1.9 4.5h4.2L16 2.5h-4zm0 6.2l3.1 7.3H8.9l3.1-7.3z",
  },
  zyrex: {
    title: "Zyrex",
    hex: "0D9488",
    // Vektor chevron Z khas Zyrex dalam grid 24x24
    path: "M4 5h16l-9.8 10.2H20V19H4l9.8-10.2H4V5z",
  },
};

/**
 * Mengambil objek SimpleIcon atau fallback brand lokal
 */
export function getSimpleIcon(brandName: string) {
  const key = (brandName || "").trim().toLowerCase();
  return SIMPLE_ICONS_MAP[key] || LOCAL_INDONESIA_ICONS[key] || null;
}

/**
 * Komponen Google Multi-Color SVG resmi untuk login/signup
 */
export function GoogleLogoIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/**
 * Komponen BrandIcon bertenaga Simple Icons (https://simpleicons.org)
 * Menampilkan path SVG resmi standar 24x24 dengan opsi warna hex resmi brand.
 */
export function BrandIcon({
  brand,
  className = "w-5 h-5",
  useBrandColor = false,
  fill,
  ...props
}: BrandIconProps) {
  const icon = getSimpleIcon(brand);

  if (icon) {
    const iconColor = useBrandColor ? `#${icon.hex}` : fill || "currentColor";

    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        fill={iconColor}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <title>{icon.title}</title>
        <path d={icon.path} />
      </svg>
    );
  }

  // Fallback jika merek kustom belum terdaftar
  const initial = (brand || "S").trim().slice(0, 2).toUpperCase();
  return (
    <div
      className={`rounded-md bg-slate-800 text-white flex items-center justify-center font-black text-[10px] select-none ${className}`}
      title={brand}
    >
      {initial}
    </div>
  );
}
