import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getArchiveLandingSample as getLandingSample } from "@/components/landing/archive-sample";
import { RequirementSnippet, ResultSnippet, WizardSnippet } from "@/components/landing/snippets";
import { Button } from "@/components/ui/button";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";

// Varian B — Editorial (PRD §12 Concept B): tipografi sangat besar, satu foto laptop,
// banyak ruang kosong, CTA tunggal. "Cara kerja" ditulis seperti artikel: judul kiri
// yang menempel, tiga bab di kanan, masing-masing dengan satu cuplikan UI asli.

export const metadata: Metadata = { title: "Landing B — Editorial · SPECO (dev)" };

const chapters = [
  {
    title: "Kamu bercerita, bukan mengisi formulir.",
    body: "Lima pertanyaan, satu per layar: berapa budget-mu, kuliah apa, dipakai untuk apa, aplikasi apa, dan apa yang paling penting. Jawabannya cukup diklik; istilah teknis dijelaskan saat muncul.",
    snippet: WizardSnippet,
  },
  {
    title: "Kami terjemahkan jadi spek minimum.",
    body: "Sebelum melihat satu pun laptop, kamu membaca Profil Kebutuhan: RAM, SSD, dan CPU yang kamu perlukan, mana yang wajib dan mana yang boleh dikompromikan, beserta alasannya.",
    snippet: RequirementSnippet,
  },
  {
    title: "Lalu laptop yang cocok, dengan alasannya.",
    body: "Satu Best Match dan empat alternatif. Setiap skor bisa ditelusuri: alasan menyebut sumbernya, dan trade-off ditulis terang, termasuk saat laptop itu melewati budget-mu.",
    snippet: ResultSnippet,
  },
];

export default async function LandingB() {
  const sample = await getLandingSample();

  return (
    <>
      <Navbar showCta={false} />
      <main className="flex-1">
        {/* ---------------------------------------------------------------- Hero */}
        <section className="page-container pt-16 pb-20 md:pt-28 md:pb-32 lg:pt-36">
          <h1 className="max-w-[15ch] type-display-xl text-text lg:max-w-none">
            Tahu dulu butuhnya, baru pilih laptopnya.
          </h1>
          <div className="mt-12 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-6">
            <div className="flex flex-col gap-8 md:col-span-5 md:pt-2 lg:col-span-4">
              <p className="max-w-[36ch] type-body-l text-text">
                SPECO membantu mahasiswa memilih laptop dari budget, jurusan, dan aplikasi yang benar-benar dipakai.
                Lima pertanyaan, lalu spek yang kamu butuh dan laptop yang cocok, lengkap dengan alasannya.
              </p>
              <Button asChild size="lg" className="self-start">
                <Link href="/rekomendasi/budget">
                  Cari Laptop yang Pas <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="md:col-span-7 lg:col-span-7 lg:col-start-6">
              <PhotoPlaceholder tone="mid" className="rounded-card" label="Foto laptop, tiga perempat" />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- Cara kerja */}
        <section id="cara-kerja" aria-labelledby="cara-kerja-title" className="scroll-mt-16 py-20 md:py-32">
          <div className="page-container grid gap-12 lg:grid-cols-12 lg:gap-6">
            <header className="flex flex-col gap-4 lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
              <h2 id="cara-kerja-title" className="max-w-[12ch] type-h1 text-text">
                Dari bingung ke yakin
              </h2>
              <p className="max-w-[34ch] type-body text-text-muted">
                Cara kerja SPECO dalam tiga bab. Cuplikan di sampingnya adalah layar aslinya, dengan contoh mahasiswa
                Informatika berbudget Rp8 juta.
              </p>
            </header>
            <ol className="flex flex-col gap-20 md:gap-28 lg:col-span-8">
              {chapters.map(({ title, body, snippet: Snippet }) => (
                <li key={title} className="grid gap-8 md:grid-cols-8 md:gap-6">
                  <div className="flex flex-col gap-4 md:col-span-4">
                    <h3 className="type-h2 text-text">{title}</h3>
                    <p className="max-w-[60ch] type-body-l text-text">{body}</p>
                  </div>
                  <div className="rounded-card bg-surface p-4 sm:p-6 md:col-span-4">
                    <div className="rounded-card bg-bg p-4">
                      <Snippet sample={sample} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
