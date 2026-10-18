"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { equalWeights, rebalance, type WeightMap } from "@/lib/weights";
import type { ActivityId, CriterionId, HardFilterId, UserProfile } from "@/types";

// Store profil wizard (PRD §15, §30): Zustand + persist ke sessionStorage agar refresh dan
// tombol Kembali tidak menghapus isian. `skipHydration` mencegah hydration mismatch:
// HTML server selalu kosong, lalu `rehydrateProfile()` dipanggil sekali di klien.

export type WizardStepId = "budget" | "jurusan" | "aktivitas" | "software" | "prioritas";

export const MAX_PRIORITIES = 3;

/** Urutan kriteria untuk mode bobot detail (sesuai urutan opsi prioritas). */
export const WEIGHT_CRITERIA: CriterionId[] = [
  "performa",
  "baterai",
  "portabilitas",
  "layar",
  "build",
  "storage",
  "ram",
  "gpu",
  "budget",
];

export const emptyProfile: UserProfile = {
  budget: { min: 0, max: 8_000_000, flexible: false },
  major: "",
  activities: [],
  primaryActivity: null,
  software: [],
  priorityMode: "rank",
  priorities: [],
  hardFilters: [],
};

interface ProfileState {
  profile: UserProfile;
  /** Langkah yang sudah dijawab (Lanjut/Lewati ditekan atau terisi dari URL). */
  answered: WizardStepId[];
  /** Urutan prioritas mode "rank" (maks 3). */
  ranked: CriterionId[];
  /** Bobot mode "weights"; null sampai mode ini pertama kali dibuka. */
  weightDraft: WeightMap | null;
  /** ID peringatan Profil Kebutuhan yang diterima sebagai kompromi (PRD §16). */
  compromises: string[];

  setBudget: (max: number) => void;
  setFlexible: (flexible: boolean) => void;
  setMajor: (major: string) => void;
  toggleActivity: (id: ActivityId) => void;
  setPrimaryActivity: (id: ActivityId) => void;
  toggleSoftware: (id: string) => void;
  togglePriority: (criterion: CriterionId) => void;
  movePriority: (criterion: CriterionId, direction: -1 | 1) => void;
  setPriorityMode: (mode: UserProfile["priorityMode"]) => void;
  setWeight: (criterion: CriterionId, value: number) => void;
  resetWeights: () => void;
  toggleHardFilter: (id: HardFilterId) => void;
  markAnswered: (step: WizardStepId) => void;
  setCompromise: (warningId: string, accepted: boolean) => void;
  /** Isi dari URL (`?budget=`, `?jurusan=`) hanya untuk langkah yang belum dijawab. */
  applyPrefill: (prefill: { budget?: number; major?: string }) => void;
  reset: () => void;
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function buildPriorities(
  mode: UserProfile["priorityMode"],
  ranked: CriterionId[],
  weightDraft: WeightMap | null
): UserProfile["priorities"] {
  if (mode === "weights" && weightDraft) {
    return WEIGHT_CRITERIA.map((criterion) => ({ criterion, weight: weightDraft[criterion] }))
      .sort((a, b) => b.weight - a.weight)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }
  return ranked.map((criterion, i) => ({ criterion, rank: i + 1, weight: null }));
}

const initial = {
  profile: emptyProfile,
  answered: [] as WizardStepId[],
  ranked: [] as CriterionId[],
  weightDraft: null,
  compromises: [] as string[],
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...initial,

      setBudget: (max) => set(({ profile }) => ({ profile: { ...profile, budget: { ...profile.budget, max } } })),
      setFlexible: (flexible) =>
        set(({ profile }) => ({ profile: { ...profile, budget: { ...profile.budget, flexible } } })),
      setMajor: (major) => set(({ profile }) => ({ profile: { ...profile, major } })),

      toggleActivity: (id) =>
        set(({ profile }) => {
          const activities = toggle(profile.activities, id);
          const primaryActivity =
            profile.primaryActivity && activities.includes(profile.primaryActivity)
              ? profile.primaryActivity
              : (activities[0] ?? null);
          return { profile: { ...profile, activities, primaryActivity } };
        }),
      setPrimaryActivity: (id) => set(({ profile }) => ({ profile: { ...profile, primaryActivity: id } })),
      toggleSoftware: (id) => set(({ profile }) => ({ profile: { ...profile, software: toggle(profile.software, id) } })),

      togglePriority: (criterion) =>
        set((state) => {
          const ranked = state.ranked.includes(criterion)
            ? state.ranked.filter((c) => c !== criterion)
            : state.ranked.length < MAX_PRIORITIES
              ? [...state.ranked, criterion]
              : state.ranked;
          return {
            ranked,
            profile: { ...state.profile, priorities: buildPriorities(state.profile.priorityMode, ranked, state.weightDraft) },
          };
        }),
      movePriority: (criterion, direction) =>
        set((state) => {
          const i = state.ranked.indexOf(criterion);
          const j = i + direction;
          if (i < 0 || j < 0 || j >= state.ranked.length) return {};
          const ranked = [...state.ranked];
          [ranked[i], ranked[j]] = [ranked[j], ranked[i]];
          return {
            ranked,
            profile: { ...state.profile, priorities: buildPriorities(state.profile.priorityMode, ranked, state.weightDraft) },
          };
        }),
      setPriorityMode: (mode) =>
        set((state) => {
          const weightDraft = mode === "weights" ? (state.weightDraft ?? equalWeights(WEIGHT_CRITERIA)) : state.weightDraft;
          return {
            weightDraft,
            profile: { ...state.profile, priorityMode: mode, priorities: buildPriorities(mode, state.ranked, weightDraft) },
          };
        }),
      setWeight: (criterion, value) =>
        set((state) => {
          const weightDraft = rebalance(state.weightDraft ?? equalWeights(WEIGHT_CRITERIA), criterion, value);
          return { weightDraft, profile: { ...state.profile, priorities: buildPriorities("weights", state.ranked, weightDraft) } };
        }),
      resetWeights: () =>
        set((state) => {
          const weightDraft = equalWeights(WEIGHT_CRITERIA);
          return { weightDraft, profile: { ...state.profile, priorities: buildPriorities("weights", state.ranked, weightDraft) } };
        }),

      toggleHardFilter: (id) =>
        set(({ profile }) => ({ profile: { ...profile, hardFilters: toggle(profile.hardFilters, id) } })),

      markAnswered: (step) =>
        set(({ answered }) => ({ answered: answered.includes(step) ? answered : [...answered, step] })),

      setCompromise: (warningId, accepted) =>
        set(({ compromises }) => ({
          compromises: accepted
            ? compromises.includes(warningId)
              ? compromises
              : [...compromises, warningId]
            : compromises.filter((id) => id !== warningId),
        })),

      applyPrefill: ({ budget, major }) =>
        set((state) => {
          let { profile, answered } = state;
          if (budget && !answered.includes("budget")) {
            profile = { ...profile, budget: { ...profile.budget, max: budget } };
            answered = [...answered, "budget"];
          }
          if (major && !answered.includes("jurusan")) {
            profile = { ...profile, major };
            answered = [...answered, "jurusan"];
          }
          return { profile, answered };
        }),

      reset: () => set(initial),
    }),
    {
      name: "nexora-profile",
      version: 3,
      // Versi lama hanya kurang field baru; isi yang ada dipertahankan.
      migrate: (persisted) => ({ ...initial, ...(persisted as object) }) as ProfileState,
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: ({ profile, answered, ranked, weightDraft, compromises }) => ({
        profile,
        answered,
        ranked,
        weightDraft,
        compromises,
      }),
    }
  )
);

// ---------------------------------------------------------------- Hidrasi

let rehydrating = false;

/** Panggil sekali di klien (efek) untuk membaca sessionStorage. */
export function rehydrateProfile() {
  if (rehydrating || useProfileStore.persist.hasHydrated()) return;
  rehydrating = true;
  void useProfileStore.persist.rehydrate();
}

const subscribeHydration = (onChange: () => void) => useProfileStore.persist.onFinishHydration(onChange);

/** true setelah isian dari sessionStorage terbaca. Selalu false di server. */
export function useProfileHydrated() {
  return useSyncExternalStore(
    subscribeHydration,
    () => useProfileStore.persist.hasHydrated(),
    () => false
  );
}
