"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Button } from "@/components/ui/button";
import { wizardSteps } from "@/components/wizard/steps";
import { getLaptops, getSampleProfile } from "@/lib/api";
import { rehydrateCompare, useCompareStore } from "@/store/compare";
import { rehydrateProfile, useProfileStore } from "@/store/profile";
import { useResultsStore } from "@/store/results";
import type { PersonaId } from "@/types";

// /dev/mockups — daftar layar untuk ditangkap ke Figma dengan ekstensi html.to.design.
// Tombol "Siapkan data" mengisi store dengan profil contoh agar setiap layar tampil lengkap
// (tanpa harus mengisi Wizard). Bukan halaman final.

const SEEDS: { id: string; label: string; persona: PersonaId; budget?: number }[] = [
  { id: "raka", label: "Raka · Informatika · Rp8 jt", persona: "teknik" },
  { id: "raka-ketat", label: "Raka · budget ketat Rp5 jt (banner kompromi)", persona: "teknik", budget: 5_000_000 },
  { id: "salsa", label: "Salsa · DKV · Rp15 jt", persona: "desain" },
  { id: "dinda", label: "Dinda · Hukum · Rp6 jt", persona: "umum" },
];

const SCREENS: { group: string; items: { name: string; href: string; note: string }[] }[] = [
  {
    group: "Landing",
    items: [{ name: "Landing", href: "/", note: "Halaman panjang. Hero, kasus, cerita (statis bila reduced motion), persona, band gelap." }],
  },
  {
    group: "Wizard (5 langkah)",
    items: wizardSteps.map((s, i) => ({
      name: `Wizard ${i + 1} — ${s.label}`,
      href: `/rekomendasi/${s.id}`,
      note: i === 0 ? "Panel kanan “Profil kamu terbentuk” + umpan balik budget." : "Jawaban contoh sudah terisi, umpan balik tampil.",
    })),
  },
  {
    group: "Profil & Analisis",
    items: [
      { name: "Profil Kebutuhan", href: "/rekomendasi/profil", note: "Kartu gelap + baris Garis Kebutuhan. Seed “budget ketat” untuk banner kompromi." },
      { name: "Analisis (ditahan)", href: "/rekomendasi/analisis?hold=1", note: "Berhenti di tahap 3: katalog tersaring + skor. Tunggu ±3 detik sebelum menangkap." },
      { name: "Analisis (Best Match)", href: "/rekomendasi/analisis?hold=best", note: "Semua tahap selesai, Best Match mengisi bingkai. Tunggu ±4 detik." },
    ],
  },
  {
    group: "Hasil, Detail, Komparasi",
    items: [
      { name: "Hasil Rekomendasi", href: "/rekomendasi/hasil", note: "Best Match + alternatif + Compare Tray (2 laptop dari seed)." },
      { name: "Detail Laptop", href: "/laptop/asus-vivobook-14-m1405", note: "Galeri render 4 sudut, daftar periksa, score breakdown." },
      { name: "Komparasi", href: "/bandingkan?ids=lp-001,lp-002,lp-003", note: "Tabel 3 kolom (desktop) / kartu per kriteria (mobile)." },
    ],
  },
  {
    group: "State (PRD §26)",
    items: [
      { name: "Hasil kosong", href: "/rekomendasi/hasil?mock=empty", note: "Saran longgarkan syarat / naikkan budget." },
      { name: "Profil gagal dimuat", href: "/rekomendasi/profil?mock=error", note: "State error." },
      { name: "Laptop tidak ditemukan", href: "/laptop/tidak-ada", note: "Halaman 404 khusus." },
    ],
  },
  {
    group: "Design system",
    items: [{ name: "Komponen", href: "/dev/components", note: "Semua komponen + Garis Kebutuhan + render + foto." }],
  },
];

export function MockupsView() {
  const [seeded, setSeeded] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    rehydrateProfile();
    rehydrateCompare();
  }, []);

  const seed = async (id: string) => {
    const s = SEEDS.find((x) => x.id === id)!;
    setBusy(true);
    const profile = getSampleProfile(s.persona);
    if (s.budget) profile.budget = { ...profile.budget, max: s.budget };
    useProfileStore.setState({ profile, answered: wizardSteps.map((w) => w.id), compromises: [] });
    useResultsStore.getState().clear();
    const laptops = await getLaptops(["lp-001", "lp-002"]);
    const compare = useCompareStore.getState();
    compare.clear();
    for (const l of laptops) compare.toggle({ id: l.id, slug: l.slug, name: `${l.brand} ${l.model}` });
    setBusy(false);
    setSeeded(s.label);
  };

  return (
    <main className="page-container flex flex-col gap-10 py-12 md:py-16">
      <header className="flex max-w-3xl flex-col gap-3">
        <Link href="/dev" className="type-small text-primary hover:underline">
          ← Indeks dev
        </Link>
        <h1 className="type-h1 text-text">Mockup untuk Figma</h1>
        <p className="type-body-l text-text-muted">
          Daftar layar CariSpek untuk ditangkap ke Figma dengan ekstensi Chrome <strong>html.to.design</strong>. Halaman
          QA, bukan halaman final.
        </p>
      </header>

      <section aria-labelledby="cara" className="flex max-w-3xl flex-col gap-4 rounded-card border border-border p-5 md:p-6">
        <h2 id="cara" className="type-h3 text-text">
          Cara menangkap
        </h2>
        <ol className="flex list-decimal flex-col gap-2 pl-5 type-body text-text">
          <li>Pasang ekstensi Chrome “html.to.design” dan login dengan akun Figma yang sama.</li>
          <li>
            Matikan animasi supaya tidak tertangkap setengah jalan: Windows → Settings → Accessibility → Visual effects →
            Animation effects <strong>Off</strong>. Situs otomatis memakai tampilan statis (prefers-reduced-motion).
          </li>
          <li>Pilih data contoh di bawah (cukup sekali per sesi tab).</li>
          <li>
            Buka setiap layar, tunggu data selesai dimuat (skeleton hilang), lalu tangkap di lebar <strong>1440</strong>{" "}
            (desktop) dan <strong>375</strong> (mobile; aktifkan mode perangkat di DevTools).
          </li>
          <li>Di Figma, beri nama frame sesuai kolom “Layar”, mis. “Hasil Rekomendasi / Desktop 1440”.</li>
        </ol>
      </section>

      <section aria-labelledby="seed" className="flex flex-col gap-4">
        <h2 id="seed" className="type-h2 text-text">
          1. Siapkan data contoh
        </h2>
        <div className="flex flex-wrap gap-2">
          {SEEDS.map((s) => (
            <Button key={s.id} variant="secondary" disabled={busy} aria-pressed={seeded === s.label} onClick={() => seed(s.id)}>
              {s.label}
            </Button>
          ))}
        </div>
        <p aria-live="polite" className="flex items-center gap-2 type-small font-normal text-text-muted">
          {seeded ? (
            <>
              <CheckCircleIcon weight="fill" className="size-4 text-success" aria-hidden="true" />
              Data terisi: {seeded}. Daftar banding berisi 2 laptop.
            </>
          ) : (
            "Belum ada data contoh di tab ini."
          )}
        </p>
      </section>

      <section aria-labelledby="layar" className="flex flex-col gap-6">
        <h2 id="layar" className="type-h2 text-text">
          2. Buka &amp; tangkap setiap layar
        </h2>
        {SCREENS.map((g) => (
          <div key={g.group} className="flex flex-col gap-2">
            <h3 className="type-small text-text-muted">{g.group}</h3>
            <ul className="flex flex-col divide-y divide-border rounded-card border border-border">
              {g.items.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="grid min-h-14 gap-1 px-5 py-4 transition-colors hover:bg-paper-100 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] md:items-center md:gap-6"
                  >
                    <span className="type-body font-semibold text-text">{s.name}</span>
                    <span className="type-small font-normal text-text-muted">{s.note}</span>
                    <span className="num flex items-center gap-1.5 type-small text-primary">
                      {s.href}
                      <ArrowSquareOutIcon weight="bold" className="size-4" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
