import type { Metadata } from "next";
import { Showcase } from "./showcase";

export const metadata: Metadata = {
  title: "Komponen · NEXORA (dev)",
};

export default function DevComponentsPage() {
  return <Showcase />;
}
