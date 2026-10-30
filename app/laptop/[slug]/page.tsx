import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FlowHeader } from "@/components/layout/flow-header";
import { DetailView } from "@/components/laptop/detail-view";
import { getLaptopSlugs } from "@/lib/api";

// /laptop/[slug] — Detail Laptop (PRD §8, §19). Mendukung ?mock=error (PRD §26).

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getLaptopSlugs().map((slug) => ({ slug }));
}

// Metadata statis (generateMetadata yang membaca params memblokir prefetch di Next 16).
export const metadata: Metadata = { title: "Detail Laptop · SPECO" };

export default function LaptopPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<FlowHeader />}>
      <LaptopDetail params={params} />
    </Suspense>
  );
}

async function LaptopDetail({ params }: { params: Params }) {
  const { slug } = await params;
  if (!getLaptopSlugs().includes(slug)) notFound();
  return <DetailView slug={slug} />;
}
