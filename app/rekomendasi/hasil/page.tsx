import { Suspense } from "react";
import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/flow-header";
import { ResultsView } from "@/components/results/results-view";

// /rekomendasi/hasil — Hasil Rekomendasi (PRD §8, §17). Mendukung ?mock=error|empty (PRD §26).
export const metadata: Metadata = { title: "Hasil Rekomendasi · SPECO" };

export default function HasilPage() {
  return (
    <Suspense fallback={<FlowHeader />}>
      <ResultsView />
    </Suspense>
  );
}
