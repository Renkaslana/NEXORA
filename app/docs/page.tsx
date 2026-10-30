"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { BookOpenTextIcon } from "@phosphor-icons/react/dist/ssr/BookOpenText";
import { CodeIcon } from "@phosphor-icons/react/dist/ssr/Code";
import { DatabaseIcon } from "@phosphor-icons/react/dist/ssr/Database";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/ssr/UsersThree";
import { CalculatorIcon } from "@phosphor-icons/react/dist/ssr/Calculator";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { TerminalWindowIcon } from "@phosphor-icons/react/dist/ssr/TerminalWindow";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr/GithubLogo";
import { BrandIcon } from "@/components/ui/brand-icon";

const SECTIONS = [
  { id: "ringkasan", label: "Ringkasan & Visi Sistem", icon: BookOpenTextIcon },
  { id: "tim", label: "Struktur TIM SPECO", icon: UsersThreeIcon },
  { id: "saw", label: "Formulasi Matematis SAW", icon: CalculatorIcon },
  { id: "database", label: "Arsitektur Basis Data", icon: DatabaseIcon },
  { id: "api", label: "Standar Kontrak API", icon: CodeIcon },
  { id: "katalog", label: "Katalog 450 Perangkat", icon: TerminalWindowIcon },
  { id: "pengujian", label: "Panduan Pengujian", icon: CheckCircleIcon },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = React.useState("ringkasan");

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] font-sans antialiased selection:bg-emerald-200">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/brand/speco-logo.png"
                alt="SPECO Indonesia"
                width={130}
                height={44}
                priority
                className="h-8.5 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Dokumentasi Resmi
              </span>
              <span className="text-xs text-slate-500 font-semibold hidden md:inline">
                TIM SPECO (Kelompok 7A) • Rekayasa Perangkat Lunak
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Kembali ke Aplikasi</span>
            </Link>
            <a
              href="https://github.com/Nourivex/Speco"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <GithubLogoIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT WITH SIDEBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR NAVIGATION */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-1">
              <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                Daftar Isi Dokumentasi
              </div>
              {SECTIONS.map((sec) => {
                const IconComponent = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-50 text-emerald-900 shadow-2xs border border-emerald-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <IconComponent
                      weight={isActive ? "fill" : "regular"}
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-emerald-700" : "text-slate-400"
                      }`}
                    />
                    <span>{sec.label}</span>
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href="/admin"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-between transition-colors shadow-2xs"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                    <span>Portal Admin</span>
                  </span>
                  <span className="text-[10px] bg-emerald-600 px-1.5 py-0.2 rounded text-white font-mono">
                    Data
                  </span>
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-3 space-y-8">
            {/* SECTION 1: RINGKASAN & VISI SISTEM */}
            {activeSection === "ringkasan" && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                    Bab 1: Pengenalan
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                    Ringkasan Sistem & Prinsip Desain SPECO
                  </h1>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    SPECO (Spesifikasi Komputer & Laptop Advisor) adalah platform Sistem Pendukung
                    Keputusan (SPK) pemilihan perangkat komputasi mahasiswa berbasis data objektif,
                    kebutuhan beban komputasi jurusan, dan toleransi anggaran finansial.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="font-bold text-slate-900 text-sm">
                      1. Tanpa Bias Afiliasi Toko
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Sistem tidak menjual laptop dan tidak menerima komisi endorse dari merek mana
                      pun. Seluruh rekomendasi murni berlandaskan rasio performa terhadap harga.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="font-bold text-slate-900 text-sm">
                      2. Explainable SPK Engine
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Setiap skor kecocokan (Match Score %) dapat dipertanggungjawabkan rincian
                      bobotnya, kriteria komputasinya, serta trade-off kelebihan dan kekurangannya.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="font-bold text-slate-900 text-sm">
                      3. Brand Dinamis (Single Source of Truth)
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Konfigurasi identitas sistem bersumber dari satu titik konfigurasi tanpa
                      hardcode teks generik di dalam algoritma atau controller backend.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="font-bold text-slate-900 text-sm">
                      4. Arsitektur Terpisah (Decoupled)
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Frontend Next.js App Router dan Backend REST API Laravel MariaDB/Supabase
                      berjalan terpisah secara headless dengan kontrak data OpenAPI terstandar.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 2: STRUKTUR TIM SPECO */}
            {activeSection === "tim" && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                    Bab 2: Manajemen Tim
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                    Susunan Tim Pengembang TIM SPECO (Kelompok 7A)
                  </h1>
                  <p className="text-sm text-slate-600 mt-1.5">
                    Mata Kuliah Rekayasa Perangkat Lunak (RPL) - Universitas Harkat Negeri.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      nama: "Muhammad Affif (Mas Affif)",
                      peran: "Project Lead, Backend Developer & Data Engineer",
                      tugas:
                        "Pengarah arsitektur teknis, perancang skema database, implementasi REST API Laravel & Supabase, serta formulasi SPK SAW.",
                      tag: "Project Lead",
                      github: "Nourivex",
                    },
                    {
                      nama: "Zakky Fawwaz",
                      peran: "System Analyst & Koordinator Dosen Pengawas",
                      tugas:
                        "Analisis kebutuhan fungsional & non-fungsional, perancangan use case, serta koordinasi jadwal evaluasi bersama dosen.",
                      tag: "System Analyst",
                      github: "zakyfawwaz701",
                    },
                    {
                      nama: "Muhamad Fahren Andrean Rangkuti",
                      peran: "Frontend Developer (Next.js)",
                      tugas:
                        "Implementasi antarmuka Next.js 16 App Router, Tailwind CSS, komponen interaktif simulasi budget, dan integrasi API.",
                      tag: "Frontend Dev",
                      github: "Renkaslana",
                    },
                    {
                      nama: "Yesa Prayugo",
                      peran: "UI/UX Designer & QA Lead",
                      tugas:
                        "Perancangan wireframe & desain editorial di Stitch/Figma, audit usability antarmuka, serta pengujian kualitas (QA).",
                      tag: "UI/UX & QA",
                      github: "yesaprayugo",
                    },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{m.nama}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                            {m.tag}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700">{m.peran}</p>
                        <p className="text-xs text-slate-500 max-w-xl">{m.tugas}</p>
                      </div>

                      <div className="shrink-0 text-xs font-mono text-slate-500">
                        @{m.github}
                      </div>
                    </div>
                  ))}

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900">
                      Dosen Pengawas Proyek: redmouse studio (@redmousestudio)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white text-emerald-800 font-bold border border-emerald-200">
                      Supervisor
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 3: FORMULASI MATEMATIS SAW */}
            {activeSection === "saw" && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                    Bab 3: Algoritma SPK
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                    Formulasi Matematis Simple Additive Weighting (SAW)
                  </h1>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Metode SAW mencari penjumlahan terbobot dari rating kinerja pada setiap
                    alternatif di semua atribut/kriteria.
                  </p>
                </div>

                <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono space-y-3">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] block">
                      1. Tahap Normalisasi Matriks Keputusan (R):
                    </span>
                    <p className="text-slate-300">
                      Untuk Kriteria Benefit (CPU, RAM, GPU, Layar, Garansi):
                      <br />
                      <strong className="text-white">R_ij = x_ij / max(x_j)</strong>
                    </p>
                    <p className="text-slate-300">
                      Untuk Kriteria Cost (Harga Pasar & Bobot Portabilitas):
                      <br />
                      <strong className="text-white">R_ij = min(x_j) / x_ij</strong>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <span className="font-bold text-emerald-900 text-sm block">
                      2. Perhitungan Nilai Preferensi (V_i) & Match Score:
                    </span>
                    <p className="font-mono text-emerald-950 font-bold">
                      V_i = ∑ (w_j * R_ij)
                    </p>
                    <p className="font-mono text-emerald-900">
                      Match Score (%) = round(V_i * 100, 1)%
                    </p>
                    <p className="text-slate-600">
                      Dimana <strong>w_j</strong> adalah bobot prioritas kriteria ke-j berdasarkan
                      workload mahasiswa (total bobot = 1.0 atau 100%).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      Tabel Bobot Kriteria Berdasarkan Profil Jurusan Mahasiswa:
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                        <thead className="bg-slate-100 text-slate-800 font-bold">
                          <tr>
                            <th className="p-2.5">Profil Workload</th>
                            <th className="p-2.5">CPU (C1)</th>
                            <th className="p-2.5">Harga (C2)</th>
                            <th className="p-2.5">RAM (C3)</th>
                            <th className="p-2.5">Layar (C4)</th>
                            <th className="p-2.5">Portabilitas (C5)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="p-2.5 font-bold">Coding & Informatika</td>
                            <td className="p-2.5">35%</td>
                            <td className="p-2.5">25%</td>
                            <td className="p-2.5">16%</td>
                            <td className="p-2.5">14%</td>
                            <td className="p-2.5">10%</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold">Desain Grafis & UI/UX</td>
                            <td className="p-2.5">25%</td>
                            <td className="p-2.5">20%</td>
                            <td className="p-2.5">15%</td>
                            <td className="p-2.5">30% (sRGB)</td>
                            <td className="p-2.5">10%</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold">Bisnis & Riset Data</td>
                            <td className="p-2.5">20%</td>
                            <td className="p-2.5">25%</td>
                            <td className="p-2.5">25%</td>
                            <td className="p-2.5">15%</td>
                            <td className="p-2.5">15%</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold">Teknik 3D & CAD</td>
                            <td className="p-2.5">40%</td>
                            <td className="p-2.5">20%</td>
                            <td className="p-2.5">15%</td>
                            <td className="p-2.5">15%</td>
                            <td className="p-2.5">10%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 4: BASIS DATA SUPABASE */}
            {activeSection === "database" && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                    Bab 4: Arsitektur Data
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                    Arsitektur Basis Data PostgreSQL & Supabase
                  </h1>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Sistem menggunakan PostgreSQL yang di-host di Supabase Cloud serta MariaDB lokal
                    pada container DDEV untuk backend Laravel.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono space-y-2">
                    <span className="text-sky-400 font-bold text-[11px] block">
                      Tabel: public.laptops (450 Entitas)
                    </span>
                    <pre className="text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
{`CREATE TABLE public.laptops (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    device_type TEXT DEFAULT 'Laptop', -- Laptop atau Mini PC
    cpu TEXT NOT NULL,
    gpu TEXT NOT NULL,
    ram_gb NUMERIC(5,1) NOT NULL,
    ram_upgradable BOOLEAN DEFAULT false,
    storage TEXT NOT NULL,
    display TEXT,
    weight_kg NUMERIC(4,2),
    price_idr BIGINT NOT NULL,
    warranty TEXT,
    buy_url TEXT,
    pros TEXT,
    cons TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);`}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900">
                        Row Level Security (RLS)
                      </span>
                      <p className="text-slate-600">
                        Akses BACA terbuka untuk publik; akses TULIS (insert, update, delete)
                        dibatasi khusus otoritas admin via token atau service key.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900">
                        Tabel Relasi: public.bookmarks
                      </span>
                      <p className="text-slate-600">
                        Menyimpan daftar laptop favorit mahasiswa terautentikasi dengan relasi foreign
                        key ke auth.users(id) dan cascade delete.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 5: STANDAR KONTRAK REST API */}
            {activeSection === "api" && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                    Bab 5: Integrasi REST API
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                    Standar Kontrak JSON Response & Endpoint
                  </h1>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Seluruh respons API dibungkus dalam JSON Envelope standar yang konsisten
                    sebagaimana dirumuskan dalam API_CONTRACT_STANDARDS.md.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono space-y-2">
                    <span className="text-emerald-400 font-bold text-[11px] block">
                      Format Envelope JSON Standar SPECO:
                    </span>
                    <pre className="text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
{`{
  "success": true,
  "status_code": 200,
  "message": "Katalog laptop berhasil diambil",
  "data": [ ... ],
  "meta": {
    "system_name": "SPECO Laptop Advisor",
    "total": 450,
    "page": 1,
    "per_page": 20
  },
  "errors": null
}`}
                    </pre>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 text-sm block">
                      Endpoint Inti:
                    </span>
                    <ul className="space-y-1.5 text-slate-600">
                      <li>
                        <code className="bg-white px-2 py-0.5 rounded border border-slate-300 text-emerald-800 font-bold">
                          GET /api/laptops
                        </code>{" "}
                        Ambil katalog dengan filter brand, tipe, dan harga.
                      </li>
                      <li>
                        <code className="bg-white px-2 py-0.5 rounded border border-slate-300 text-emerald-800 font-bold">
                          POST /api/recommendation
                        </code>{" "}
                        Hitung kalkulasi SPK SAW berdasarkan budget & prioritas kriteria.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 6: KATALOG 450 PERANGKAT */}
            {activeSection === "katalog" && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                    Bab 6: Data Perangkat
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                    Katalog 450 Laptop & Desktop / Mini PC
                  </h1>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Katalog mencakup laptop tipis, laptop gaming, serta mini PC dan desktop ringkas
                    yang relevan untuk ruang belajar mahasiswa.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  {[
                    "Axioo",
                    "Advan",
                    "Zyrex",
                    "ASUS",
                    "Lenovo",
                    "Acer",
                    "Apple",
                    "MSI",
                    "HP",
                    "Dell",
                  ].map((brand) => (
                    <div
                      key={brand}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2"
                    >
                      <BrandIcon brand={brand} useBrandColor className="w-5 h-5 shrink-0" />
                      <span className="font-bold text-slate-900">{brand}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1">
                  <span className="font-bold text-sm block">Dukungan Mini PC & Dekstop:</span>
                  <p className="leading-relaxed">
                    Terdapat 59 unit perangkat dalam dataset berkategori Mini PC (seperti Apple Mac
                    Mini M2/M4, Asus Mini PC, Minisforum, dan PC Rakitan Mahasiswa) yang didukung
                    penuh pada filter katalog dan portal admin.
                  </p>
                </div>
              </section>
            )}

            {/* SECTION 7: PANDUAN PENGUJIAN */}
            {activeSection === "pengujian" && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                    Bab 7: Jaminan Kualitas
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                    Panduan Pengujian Sistem & QA
                  </h1>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Setiap modul diuji secara berkala dengan automated tests, validasi skenario kuis,
                    dan audit build Next.js.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-emerald-900 text-sm block">
                        Status Automated Testing
                      </span>
                      <p className="text-emerald-800 mt-0.5">
                        13 automated test suites dengan 51 assertions lulus uji 100%.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-[11px]">
                      PASSED
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono space-y-2">
                    <span className="text-slate-400 font-bold text-[11px] block">
                      Perintah Verifikasi Build Frontend:
                    </span>
                    <pre className="text-emerald-400">npm run build</pre>
                    <p className="text-slate-400 text-[10px]">
                      Memvalidasi 36 route static dan dynamic tanpa type error.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
