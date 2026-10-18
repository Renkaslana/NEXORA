"use client";

import { create } from "zustand";
import type { RecommendationSet } from "@/lib/api";
import type { UserProfile } from "@/types";

// Serah-terima hasil dari layar Analisis ke Hasil (disetujui Fahren): disimpan di memori saja,
// tidak di sessionStorage. Bila Hasil dibuka langsung atau setelah refresh, Hasil memuat ulang
// lewat `getRecommendations()` dengan skeleton (PRD §14).

/** Tanda tangan profil: hasil hanya dipakai ulang bila jawaban tidak berubah. */
export function profileKey(profile: UserProfile): string {
  const { budget, major, activities, primaryActivity, software, priorityMode, priorities, hardFilters } = profile;
  return JSON.stringify([budget, major, activities, primaryActivity, software, priorityMode, priorities, hardFilters]);
}

interface ResultsState {
  key: string | null;
  data: RecommendationSet | null;
  setResult: (profile: UserProfile, data: RecommendationSet) => void;
  clear: () => void;
}

export const useResultsStore = create<ResultsState>()((set) => ({
  key: null,
  data: null,
  setResult: (profile, data) => set({ key: profileKey(profile), data }),
  clear: () => set({ key: null, data: null }),
}));
