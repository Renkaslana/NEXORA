"use client"

import * as React from "react"

// Nada latar hero yang sedang tampil ("light" = kertas terang, "dark" = kobalt). Dipakai navbar landing
// agar warna teks, versi logo, dan gradien keterbacaan di atas hero mengikuti slide aktif.

type Tone = "light" | "dark"

const HeroToneContext = React.createContext<{ tone: Tone; setTone: (t: Tone) => void }>({
  tone: "light",
  setTone: () => {},
})

export function HeroToneProvider({ children }: { children: React.ReactNode }) {
  const [tone, setTone] = React.useState<Tone>("light")
  const value = React.useMemo(() => ({ tone, setTone }), [tone])
  return <HeroToneContext.Provider value={value}>{children}</HeroToneContext.Provider>
}

export const useHeroTone = () => React.useContext(HeroToneContext)
