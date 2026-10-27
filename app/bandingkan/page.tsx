import { Suspense } from "react";
import type { Metadata } from "next";
import { CompareView } from "@/components/compare/compare-view";
import { FlowHeader } from "@/components/layout/flow-header";

// /bandingkan?ids=a,b,c — Komparasi 2–3 laptop (PRD §8, §18). Query string agar bisa dibagikan.
// Mendukung ?mock=error (PRD §26).
export const metadata: Metadata = { title: "Bandingkan Laptop · SPECO" };

export default function BandingkanPage() {
  return (
    <Suspense fallback={<FlowHeader />}>
      <CompareView />
    </Suspense>
  );
}
