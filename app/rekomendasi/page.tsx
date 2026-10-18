import { redirect } from "next/navigation";

// /rekomendasi → langkah pertama Wizard (PRD §8).
export default function RekomendasiIndex() {
  redirect("/rekomendasi/budget");
}
