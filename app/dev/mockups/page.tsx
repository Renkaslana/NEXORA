import type { Metadata } from "next";
import { MockupsView } from "./mockups-view";

export const metadata: Metadata = {
  title: "Mockup untuk Figma · SPECO (dev)",
  robots: { index: false },
};

export default function DevMockupsPage() {
  return <MockupsView />;
}
