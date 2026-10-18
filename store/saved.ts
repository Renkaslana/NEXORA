"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SavedLaptop } from "@/types";

// Laptop tersimpan (PRD §20 Should have, §29 SavedLaptop): localStorage, tanpa login.
// Disetujui Fahren: umpan balik inline (status ikon + pengumuman), tanpa library toast.

interface SavedState {
  saved: SavedLaptop[];
  toggle: (laptopId: string) => boolean;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      saved: [],
      toggle: (laptopId) => {
        const exists = get().saved.some((s) => s.laptopId === laptopId);
        set(({ saved }) => ({
          saved: exists
            ? saved.filter((s) => s.laptopId !== laptopId)
            : [...saved, { laptopId, savedAt: new Date().toISOString() }],
        }));
        return !exists;
      },
    }),
    { name: "nexora-saved", version: 1, storage: createJSONStorage(() => localStorage), skipHydration: true }
  )
);

export function rehydrateSaved() {
  if (!useSavedStore.persist.hasHydrated()) void useSavedStore.persist.rehydrate();
}

const subscribe = (cb: () => void) => useSavedStore.persist.onFinishHydration(cb);
export function useSavedHydrated() {
  return useSyncExternalStore(subscribe, () => useSavedStore.persist.hasHydrated(), () => false);
}
