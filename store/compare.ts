"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Daftar komparasi untuk Compare Tray (PRD §7, §17, §18): maks 3 laptop, persist ke
// sessionStorage agar tray yang sama tampil di Hasil dan Detail. Ringkasan laptop disimpan
// supaya tray bisa tampil tanpa memuat data lagi.

export const MAX_COMPARE = 3;

export interface CompareItem {
  id: string;
  slug: string;
  name: string;
}

interface CompareState {
  items: CompareItem[];
  /** Tambah atau hapus; "full" bila sudah 3 laptop. */
  toggle: (item: CompareItem) => "added" | "removed" | "full";
  remove: (id: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const { items } = get();
        if (items.some((i) => i.id === item.id)) {
          set({ items: items.filter((i) => i.id !== item.id) });
          return "removed";
        }
        if (items.length >= MAX_COMPARE) return "full";
        set({ items: [...items, item] });
        return "added";
      },
      remove: (id) => set(({ items }) => ({ items: items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "nexora-compare", version: 1, storage: createJSONStorage(() => sessionStorage), skipHydration: true }
  )
);

export function rehydrateCompare() {
  if (!useCompareStore.persist.hasHydrated()) void useCompareStore.persist.rehydrate();
}

const subscribe = (cb: () => void) => useCompareStore.persist.onFinishHydration(cb);
export function useCompareHydrated() {
  return useSyncExternalStore(subscribe, () => useCompareStore.persist.hasHydrated(), () => false);
}
