"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SavedLaptop } from "@/types";

// Laptop tersimpan (PRD §20 Should have, §29 SavedLaptop) dan keputusan akhir dari Komparasi
// ("Pilih Laptop Ini", PRD §14): localStorage, tanpa login.
// Disetujui Fahren: umpan balik inline (status ikon + pengumuman), tanpa library toast.

export interface Decision {
  laptopId: string;
  /** Laptop lain yang dibandingkan saat keputusan diambil. */
  comparedIds: string[];
  decidedAt: string;
}

interface SavedState {
  saved: SavedLaptop[];
  decision: Decision | null;
  toggle: (laptopId: string) => boolean;
  decide: (laptopId: string, comparedIds: string[]) => void;
  clearDecision: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      saved: [],
      decision: null,
      toggle: (laptopId) => {
        const exists = get().saved.some((s) => s.laptopId === laptopId);
        set(({ saved }) => ({
          saved: exists
            ? saved.filter((s) => s.laptopId !== laptopId)
            : [...saved, { laptopId, savedAt: new Date().toISOString() }],
        }));
        return !exists;
      },
      decide: (laptopId, comparedIds) =>
        set({ decision: { laptopId, comparedIds, decidedAt: new Date().toISOString() } }),
      clearDecision: () => set({ decision: null }),
    }),
    {
      name: "nexora-saved",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // Versi 1 belum punya `decision`; data simpanan dipertahankan.
      migrate: (persisted) => ({ decision: null, ...(persisted as object) }) as SavedState,
    }
  )
);

export function rehydrateSaved() {
  if (!useSavedStore.persist.hasHydrated()) void useSavedStore.persist.rehydrate();
}

const subscribe = (cb: () => void) => useSavedStore.persist.onFinishHydration(cb);
export function useSavedHydrated() {
  return useSyncExternalStore(subscribe, () => useSavedStore.persist.hasHydrated(), () => false);
}
