import { Suspense } from "react";
import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/flow-header";
import { ProfileView } from "@/components/profile/profile-view";
import { Skeleton } from "@/components/ui/skeleton";

// /rekomendasi/profil — Profil Kebutuhan (PRD §8, §16). Mendukung ?mock=error (PRD §26).
export const metadata: Metadata = { title: "Profil Kebutuhan · SPECO" };

function Fallback() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <FlowHeader />
      <div className="page-container flex flex-col gap-8 pt-8 md:pt-12" aria-hidden="true">
        <Skeleton className="h-10 w-72 rounded-control bg-surface" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-56 rounded-card bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <ProfileView />
    </Suspense>
  );
}
