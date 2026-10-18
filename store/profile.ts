"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ActivityId, CriterionId, HardFilterId, UserProfile } from "@/types";

// Store profil wizard (PRD §15, §30): Zustand + persist ke sessionStorage
// agar refresh dan tombol Kembali tidak menghapus isian.
// Kerangka Tahap 1; dipakai penuh saat Wizard dibangun.

export const emptyProfile: UserProfile = {
  budget: { min: 0, max: 8_000_000, flexible: false },
  major: "",
  activities: [],
  primaryActivity: null,
  software: [],
  priorities: [],
  hardFilters: [],
};

interface ProfileState {
  profile: UserProfile;
  setBudget: (max: number, flexible?: boolean) => void;
  setMajor: (major: string) => void;
  toggleActivity: (id: ActivityId) => void;
  setPrimaryActivity: (id: ActivityId) => void;
  toggleSoftware: (id: string) => void;
  setPriorities: (priorities: { criterion: CriterionId; weight: number }[]) => void;
  toggleHardFilter: (id: HardFilterId) => void;
  reset: () => void;
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: emptyProfile,
      setBudget: (max, flexible) =>
        set(({ profile }) => ({
          profile: { ...profile, budget: { ...profile.budget, max, flexible: flexible ?? profile.budget.flexible } },
        })),
      setMajor: (major) => set(({ profile }) => ({ profile: { ...profile, major } })),
      toggleActivity: (id) =>
        set(({ profile }) => {
          const activities = toggle(profile.activities, id);
          const primaryActivity = activities.includes(profile.primaryActivity as ActivityId)
            ? profile.primaryActivity
            : (activities[0] ?? null);
          return { profile: { ...profile, activities, primaryActivity } };
        }),
      setPrimaryActivity: (id) => set(({ profile }) => ({ profile: { ...profile, primaryActivity: id } })),
      toggleSoftware: (id) => set(({ profile }) => ({ profile: { ...profile, software: toggle(profile.software, id) } })),
      setPriorities: (priorities) => set(({ profile }) => ({ profile: { ...profile, priorities } })),
      toggleHardFilter: (id) =>
        set(({ profile }) => ({ profile: { ...profile, hardFilters: toggle(profile.hardFilters, id) } })),
      reset: () => set({ profile: emptyProfile }),
    }),
    { name: "nexora-profile", storage: createJSONStorage(() => sessionStorage) }
  )
);
