import type { Metadata } from "next";

// Halaman eksplorasi & QA, bukan halaman final.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return children;
}
