import { Suspense } from "react";
import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/flow-header";
import { AnalysisView } from "@/components/results/analysis-view";

// /rekomendasi/analisis — layar proses (PRD §8, §14, §25). Mendukung ?mock=error|empty (PRD §26).
export const metadata: Metadata = { title: "Menganalisis · SPECO" };

export default function AnalisisPage() {
  return (
    <Suspense fallback={<FlowHeader />}>
      <AnalysisView />
    </Suspense>
  );
}
