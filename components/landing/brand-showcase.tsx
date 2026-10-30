"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";

interface BrandItem {
  name: string;
  category: "local" | "global";
  tagline: string;
  series: string;
  priceRange: string;
}

const BRANDS: BrandItem[] = [
  {
    name: "Axioo",
    category: "local",
    tagline: "Brand Lokal Inovatif",
    series: "Hype Series, Pongo Gaming",
    priceRange: "Rp3,6 Jt - Rp17 Jt",
  },
  {
    name: "Advan",
    category: "local",
    tagline: "Teknologi Kebanggaan Bangsa",
    series: "Workplus, Workpro, AI-Gen",
    priceRange: "Rp3,8 Jt - Rp11 Jt",
  },
  {
    name: "Zyrex",
    category: "local",
    tagline: "Spesialis Rasio Spek-Harga",
    series: "Sky K32, Maverick, Skybook",
    priceRange: "Rp3,7 Jt - Rp9 Jt",
  },
  {
    name: "ASUS",
    category: "global",
    tagline: "No. 1 Consumer Notebook",
    series: "Vivobook, Zenbook, TUF, ROG",
    priceRange: "Rp4,7 Jt - Rp39 Jt+",
  },
  {
    name: "Lenovo",
    category: "global",
    tagline: "Smart Technology for All",
    series: "IdeaPad, ThinkBook, Yoga, LOQ",
    priceRange: "Rp4,2 Jt - Rp35 Jt+",
  },
  {
    name: "Acer",
    category: "global",
    tagline: "Inovasi Andal Setiap Kelas",
    series: "Aspire Lite, Swift Go, Nitro V",
    priceRange: "Rp4,4 Jt - Rp29 Jt",
  },
  {
    name: "HP",
    category: "global",
    tagline: "Reliable Partner & Company",
    series: "Laptop 14s, Pavilion Plus, Victus",
    priceRange: "Rp4,6 Jt - Rp31 Jt",
  },
  {
    name: "Apple",
    category: "global",
    tagline: "Kinerja Efisiensi Silikon",
    series: "MacBook Air M2/M3, MacBook Pro",
    priceRange: "Rp11,5 Jt - Rp39 Jt+",
  },
  {
    name: "MSI",
    category: "global",
    tagline: "Performa Gaming & Kreator",
    series: "Modern 14, Thin 15, Cyborg 15",
    priceRange: "Rp5,4 Jt - Rp33 Jt",
  },
  {
    name: "Dell",
    category: "global",
    tagline: "Durabilitas & Layanan Prima",
    series: "Inspiron 14, Latitude, XPS",
    priceRange: "Rp5,9 Jt - Rp42 Jt+",
  },
];

export function BrandShowcase() {
  const [activeTab, setActiveTab] = React.useState<"all" | "local" | "global">("all");

  const filteredBrands = React.useMemo(() => {
    if (activeTab === "all") return BRANDS;
    return BRANDS.filter((b) => b.category === activeTab);
  }, [activeTab]);

  return (
    <section id="brand-laptop" className="py-20 bg-gradient-to-b from-white via-teal-50/30 to-white border-t border-teal-100/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold tracking-wider uppercase mb-3 border border-teal-200/60">
              <SparkleIcon weight="bold" className="w-3.5 h-3.5 text-teal-600" />
              Katalog Brand Lokal & Internasional
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Semua brand dihitung <span className="italic font-serif text-teal-600 font-normal">adil</span>. Dari Lokal hingga Global.
            </h2>
            <p className="mt-3 text-slate-600 text-base leading-relaxed">
              SPECO membandingkan lini laptop resmi di Indonesia, mulai dari brand kebanggaan lokal hingga brand internasional, murni berdasarkan kualitas spesifikasi, garansi, dan rasio harga terhadap kebutuhan kuliahmu.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/70 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-teal-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua Brand (10)
            </button>
            <button
              onClick={() => setActiveTab("local")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "local"
                  ? "bg-teal-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Brand Lokal Indonesia (3)
            </button>
            <button
              onClick={() => setActiveTab("global")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "global"
                  ? "bg-teal-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Brand Internasional (7)
            </button>
          </div>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredBrands.map((brand) => (
              <motion.div
                key={brand.name}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group relative bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-900/5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        brand.category === "local"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-teal-50 text-teal-800 border border-teal-200"
                      }`}
                    >
                      {brand.category === "local" ? "LOKAL ID" : "GLOBAL"}
                    </span>
                    <span className="text-[11px] text-teal-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      Lihat Seri <ArrowRightIcon className="w-3 h-3" />
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                    {brand.tagline}
                  </p>
                  <p className="text-xs text-slate-700 font-semibold mt-2 line-clamp-2">
                    {brand.series}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Rentang</span>
                  <span className="font-bold text-slate-900">{brand.priceRange}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Axioo Student Spotlight Box */}
        <div className="mt-8 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                  Brand Lokal Indonesia
                </span>
                <span className="text-teal-200 text-xs font-medium">
                  170+ Titik Service Center Resmi
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Lini Mahasiswa Axioo
              </h3>
              <p className="mt-2 text-slate-300 text-sm leading-relaxed">
                Brand pelopor laptop Indonesia yang sangat populer di kalangan mahasiswa berkat seri Hype (hemat anggaran untuk tugas harian) dan Axioo Pongo (gaming & render 3D dengan kartu grafis RTX diskon mahasiswa).
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-teal-200 font-medium">
                <span>Rentang: Rp3,6 Jt - Rp19,9 Jt</span>
                <span>•</span>
                <span className="text-amber-300">Garansi resmi 1-3 tahun ganti unit</span>
              </div>
            </div>

            {/* Mini preview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 hover:bg-white/15 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-white">Axioo Pongo 725</span>
                  <span className="bg-teal-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                    91% Match
                  </span>
                </div>
                <p className="text-xs text-slate-300">Core i7-12650H • RTX 2050 • 16GB</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-300">Rp9.999.000</span>
                  <Link href="/rekomendasi" className="text-teal-300 hover:text-white flex items-center gap-1 font-semibold">
                    Detail <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 hover:bg-white/15 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-white">Axioo Hype 5 AMD X3</span>
                  <span className="bg-teal-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                    89% Match
                  </span>
                </div>
                <p className="text-xs text-slate-300">Ryzen 5 3500U • Vega 8 • 8GB</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-300">Rp4.899.000</span>
                  <Link href="/rekomendasi" className="text-teal-300 hover:text-white flex items-center gap-1 font-semibold">
                    Detail <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
