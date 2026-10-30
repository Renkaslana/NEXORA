"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/ssr/BookmarkSimple";
import { BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { RobotIcon } from "@phosphor-icons/react/dist/ssr/Robot";
import { SlidersIcon } from "@phosphor-icons/react/dist/ssr/Sliders";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowsLeftRight";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr/DownloadSimple";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/ssr/GraduationCap";
import { WalletIcon } from "@phosphor-icons/react/dist/ssr/Wallet";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star";
import { ChatsCircleIcon } from "@phosphor-icons/react/dist/ssr/ChatsCircle";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { formatRupiah } from "@/lib/format";
import { BrandIcon } from "@/components/ui/brand-icon";
import { catalogLaptops, CatalogLaptop } from "@/lib/catalog-service";
import { getCurrentUser } from "@/lib/supabase";

export default function StudentDashboardPage() {
  const router = useRouter();

  // Active Tab: riwayat | wishlist | komparasi | notifikasi
  const [activeTab, setActiveTab] = React.useState<"riwayat" | "wishlist" | "komparasi" | "notifikasi">("riwayat");
  const [showPriceDropAlert, setShowPriceDropAlert] = React.useState(true);
  const [isStackModalOpen, setIsStackModalOpen] = React.useState(false);
  const [isEduTokenModalOpen, setIsEduTokenModalOpen] = React.useState(false);

  // Stack State
  const [currentStack, setCurrentStack] = React.useState("PyTorch / Docker / Next.js");
  const [tempStack, setTempStack] = React.useState(currentStack);
  const [targetBudget, setTargetBudget] = React.useState("Rp8,5 - 12 Juta");

  // User Profile
  const [studentName, setStudentName] = React.useState("Farhan Rizki Ramadhan");
  const [studentMajor, setStudentMajor] = React.useState("Teknik Informatika • Universitas Harkat Negeri");
  const [studentInitials, setStudentInitials] = React.useState("FR");

  // Wishlist from localStorage
  const [savedLaptops, setSavedLaptops] = React.useState<CatalogLaptop[]>([]);

  // Fetch local user session & bookmarks
  React.useEffect(() => {
    // 1. User session
    getCurrentUser().then((u) => {
      if (u) {
        const name = u.user_metadata?.full_name || u.email?.split("@")[0] || "Farhan Rizki";
        setStudentName(name);
        setStudentInitials(name.slice(0, 2).toUpperCase());
        return;
      }
      const local = localStorage.getItem("speco_user_session");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.name) {
            setStudentName(parsed.name);
            setStudentInitials(parsed.name.slice(0, 2).toUpperCase());
          }
        } catch {
          // ignore
        }
      }
    });

    // 2. Saved laptops
    try {
      const stored = localStorage.getItem("speco_saved_laptops");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // localStorage hanya ada di browser, jadi dibaca setelah mount.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSavedLaptops(parsed);
          return;
        }
      }
      // Fallback default sample 4 laptop
      setSavedLaptops(catalogLaptops.slice(0, 4));
    } catch {
      setSavedLaptops(catalogLaptops.slice(0, 4));
    }
  }, []);

  const handleRemoveSaved = (id: string) => {
    const updated = savedLaptops.filter((item) => item.ID_Perangkat !== id);
    setSavedLaptops(updated);
    try {
      localStorage.setItem("speco_saved_laptops", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleExportSummary = () => {
    const content = `RINGKASAN REKOMENDASI SPESIFIKASI LAPTOP MAHASISWA - SPECO INDONESIA
Tanggal: ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
Mahasiswa: ${studentName} (${studentMajor})
Target Budget: ${targetBudget}
Stack Kebutuhan: ${currentStack}

REKOMENDASI TERBAIK:
1. ASUS Zenbook 14 OLED (Ryzen 7 7730U / 16GB / 512GB) - Rp10.899.000 (Skor 95%)
2. Lenovo Legion Slim 5 (Ryzen 5 7640HS / RTX 4050 / 16GB) - Rp11.950.000 (Skor 91%)
3. ASUS Vivobook 14 OLED (Ryzen 5 7530U / 16GB / 512GB) - Rp8.350.000 (Skor 96%)

Katalog Terverifikasi: 450 Laptop & Desktop Mahasiswa
Platform: SPECO (Universitas Harkat Negeri - TIM SPECO 7A)
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SPECO_Rekomendasi_${studentName.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] font-sans antialiased selection:bg-emerald-200">
      {/* ==============================================================================
          1. HEADER NAVIGATION
      ============================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <Image
                src="/brand/speco-logo.png"
                alt="SPECO Indonesia"
                width={136}
                height={48}
                priority
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            <nav className="hidden xl:flex items-center gap-1 text-xs">
              <Link href="/#beranda" className="px-3.5 py-2 font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                Beranda
              </Link>
              <Link href="/#simulasi-budget" className="px-3.5 py-2 font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                Simulasi Budget
              </Link>
              <Link href="/rekomendasi/budget" className="px-3.5 py-2 font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                Kuis AI
              </Link>
              <Link href="/#transparansi-metrik" className="px-3.5 py-2 font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                Transparansi Metrik
              </Link>
              <Link href="/#katalog-brand" className="px-3.5 py-2 font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                Katalog Brand
              </Link>
              <span className="px-3.5 py-2 font-bold bg-emerald-50 text-emerald-800 rounded-lg">
                Riwayat & Dashboard
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("wishlist")}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 rounded-full text-slate-800 transition-colors text-xs font-bold"
            >
              <BookmarkSimpleIcon weight="bold" className="text-emerald-700 w-4 h-4" />
              <span>Riwayat Saya</span>
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] flex items-center justify-center font-bold">
                {savedLaptops.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("notifikasi")}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 relative transition-colors"
              title="Notifikasi Harga"
            >
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2.5 pl-1.5 py-1 pr-3 bg-white border border-slate-200/80 rounded-full shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-xs">
                {studentInitials}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {studentName.split(" ").slice(0, 2).join(" ")}
                  </span>
                  <CheckCircleIcon weight="fill" className="text-emerald-600 w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium leading-tight">
                  Informatika • UHN
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==============================================================================
          2. MAIN CONTENT AREA
      ============================================================================== */}
      <main className="w-full pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Alert Notification: Price Drop Tracker */}
          {showPriceDropAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-50/60 border border-emerald-200/80 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <SparkleIcon weight="fill" className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] uppercase tracking-wider font-extrabold">
                      Harga Turun
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">
                      Acer Swift Go 14 AI Edition
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5">
                    Turun <span className="font-bold text-emerald-800">Rp400.000</span> (Kini Rp10.299.000) di Shopee Official Store verified partner.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <a
                  href="https://shopee.co.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-2xs flex items-center gap-1"
                >
                  <span>Cek Toko</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </a>
                <button
                  aria-label="Tutup Banner"
                  onClick={() => setShowPriceDropAlert(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Student Profile Header Bento */}
          <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 text-white flex items-center justify-center font-black text-2xl shadow-md">
                  {studentInitials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm border-2 border-white">
                  <GraduationCapIcon weight="fill" className="w-4 h-4" />
                </div>
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {studentName}
                  </h1>
                  <span title="Akun Terverifikasi">
                    <CheckCircleIcon weight="fill" className="text-emerald-600 w-5 h-5 shrink-0" />
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Mahasiswa Terverifikasi
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {studentMajor}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200/60">
                    <WalletIcon className="text-emerald-700 w-4 h-4" />
                    <span className="text-[11px] font-semibold text-slate-500">Target Budget:</span>
                    <span className="text-xs font-extrabold text-slate-900">{targetBudget}</span>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/60 text-slate-700 text-xs">
                    Stack: <code className="font-bold text-emerald-800">{currentStack}</code>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button Group */}
            <div className="flex sm:flex-row flex-col items-stretch sm:items-center gap-2.5 shrink-0 w-full lg:w-auto">
              <Link
                href="/rekomendasi/budget"
                className="px-5 py-3 rounded-2xl bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition-all cursor-pointer"
              >
                <RobotIcon weight="fill" className="w-4 h-4" />
                <span>Kuis Ulang AI</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setTempStack(currentStack);
                  setIsStackModalOpen(true);
                }}
                className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200/70 transition-colors font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <SlidersIcon className="w-4 h-4" />
                <span>Edit Kebutuhan Stack</span>
              </button>
            </div>
          </div>

          {/* Student Metric Overview (4-Column Bento Stat) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Stat 1 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Simulasi Tersimpan
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <RobotIcon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">4</span>
                  <span className="text-xs text-slate-500 font-semibold">Sesi Analisis</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">Terakhir kemarin • Semester 5</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Laptop Dibandingkan
                </span>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <ArrowsLeftRightIcon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">12</span>
                  <span className="text-xs text-slate-500 font-semibold">Kandidat Device</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">Dari 10 brand resmi Indonesia</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Akurasi Match Tertinggi
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircleIcon weight="fill" className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-700">96%</span>
                  <span className="text-xs text-slate-900 font-bold">Optimal Match</span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">ASUS Vivobook 14 (OLED Panel)</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Estimasi Hemat Mahasiswa
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <WalletIcon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">Rp1.450.000</span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">Diskon edukasi & retailer resmi terendah</span>
              </div>
            </div>
          </div>

          {/* Main Workspace: Left Tabs & Simulations Content + Right Widget Drawer */}
          <div className="w-full flex flex-col lg:flex-row items-start gap-6">
            {/* Primary Tab Area & Feeds (8 Cols) */}
            <div className="w-full lg:w-8/12 space-y-5">
              {/* Segmented Tab Navigation */}
              <div className="w-full bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("riwayat")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === "riwayat"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <RobotIcon className="w-4 h-4" />
                  <span>Riwayat Simulasi AI</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === "riwayat" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    4
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("wishlist")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === "wishlist"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <BookmarkSimpleIcon className="w-4 h-4" />
                  <span>Laptop Disimpan / Wishlist</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === "wishlist" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {savedLaptops.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("komparasi")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === "komparasi"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <ArrowsLeftRightIcon className="w-4 h-4" />
                  <span>Komparasi Side-by-Side</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === "komparasi" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    3
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("notifikasi")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === "notifikasi"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <BellIcon className="w-4 h-4" />
                  <span>Notifikasi Harga</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800">
                    2
                  </span>
                </button>
              </div>

              {/* TAB 1: RIWAYAT SIMULASI AI */}
              {activeTab === "riwayat" && (
                <div className="space-y-4">
                  {/* Card 1: Machine Learning & Skripsi */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-slate-400 font-semibold">Kemarin, 28 Okt 2026 • 14:32 WIB</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Tersimpan
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-medium">Alokasi Budget:</span>
                        <span className="text-sm font-black text-slate-900">Rp11.000.000</span>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Simulasi Semester 5 — Skripsi Machine Learning & Docker
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {["PyTorch CUDA", "Docker Desktop", "16 GB RAM Min", "Kompilasi C++ / Rust"].map((tag) => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Dual Pick Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Pick 1 */}
                      <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-emerald-700 uppercase font-black tracking-wider block">
                                Top Recommendation
                              </span>
                              <h3 className="font-black text-sm text-slate-900">ASUS Zenbook 14 OLED</h3>
                              <span className="text-[11px] text-slate-500 font-medium block">
                                Ryzen 7 7730U • 16GB LPDDR4X • 512GB SSD
                              </span>
                            </div>
                            <span className="px-2 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black shrink-0 shadow-2xs">
                              95% Match
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-600">Kinerja Coding & Container</span>
                              <span className="font-bold text-slate-900">9.3 / 10</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <div className="h-full bg-emerald-600 w-[93%] rounded-full" />
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="text-slate-600">Daya Tahan Baterai & Mobilitas</span>
                              <span className="font-bold text-slate-900">9.6 / 10</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <div className="h-full bg-teal-600 w-[96%] rounded-full" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <span className="text-sm font-black text-emerald-800">Rp10.899.000</span>
                          <span className="text-[11px] text-slate-400 font-medium">1.39 kg • Layar 2.8K OLED</span>
                        </div>
                      </div>

                      {/* Pick 2 */}
                      <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-teal-700 uppercase font-black tracking-wider block">
                                Alternatif GPU Dedikasi
                              </span>
                              <h3 className="font-black text-sm text-slate-900">Lenovo Legion Slim 5</h3>
                              <span className="text-[11px] text-slate-500 font-medium block">
                                Ryzen 5 7640HS • RTX 4050 • 16GB DDR5
                              </span>
                            </div>
                            <span className="px-2 py-1 rounded-full bg-slate-200 text-slate-800 text-[11px] font-black shrink-0">
                              91% Match
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-600">Komputasi AI Local (CUDA)</span>
                              <span className="font-bold text-slate-900">9.7 / 10</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <div className="h-full bg-emerald-600 w-[97%] rounded-full" />
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="text-slate-600">Portabilitas Kampus</span>
                              <span className="font-bold text-slate-900">7.8 / 10</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <div className="h-full bg-slate-400 w-[78%] rounded-full" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <span className="text-sm font-black text-slate-900">Rp11.950.000</span>
                          <span className="text-[11px] text-slate-400 font-medium">2.3 kg • Adaptor 170W</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Computational Rationale Capsule */}
                    <div className="bg-emerald-50/70 border border-emerald-100 p-3.5 rounded-2xl flex items-start gap-2.5">
                      <SparkleIcon weight="fill" className="text-emerald-700 w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <span className="font-extrabold text-emerald-900">Alasan Algoritma SPECO:</span> &ldquo;Untuk skripsi ML tingkat sarjana, Ryzen 7 dengan 16GB dual channel memberikan keleluasaan container Docker tanpa thermal throttling berlebih di perpustakaan. Jika model training dilakukan lokal tanpa Google Colab, Legion Slim 5 memberikan tensor acceleration RTX 4050.&rdquo;
                      </p>
                    </div>

                    {/* Card Action Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Link
                          href="/rekomendasi/budget"
                          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <span>Buka Detail Analisis</span>
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href="/bandingkan"
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <ArrowsLeftRightIcon className="w-3.5 h-3.5" />
                          <span>Bandingkan 2 Laptop Ini</span>
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert("Sesi simulasi diarsipkan.")}
                        className="text-slate-400 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        <span>Arsipkan Sesi</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: UI/UX & Freelance */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                        <span className="text-xs text-slate-400 font-semibold">24 Okt 2026 • 09:15 WIB</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          Arsip Sesi
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-medium">Alokasi Budget:</span>
                        <span className="text-sm font-black text-slate-900">Rp8.500.000</span>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Simulasi Desain UI/UX & Freelance Front-End
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {["Figma Client", "100% sRGB / DCI-P3", "Koneksi Type-C Display"].map((tag) => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between gap-2">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-emerald-700 uppercase font-black tracking-wider block">
                                Top Match Rekomendasi
                              </span>
                              <h3 className="font-black text-sm text-slate-900">ASUS Vivobook 14 (OLED)</h3>
                              <span className="text-[11px] text-slate-500 font-medium block">
                                Ryzen 5 7530U • 16GB DDR4 • 512GB SSD
                              </span>
                            </div>
                            <span className="px-2 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black shrink-0">
                              96% Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-2">
                            Layar OLED 100% DCI-P3 Pantone Validated paling akurat di rentang 8 jutaan rupiah.
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <span className="text-sm font-black text-emerald-800">Rp8.350.000</span>
                          <span className="text-[11px] text-slate-400">600 nits • 1.4 kg</span>
                        </div>
                      </div>

                      <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between gap-2">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">
                                Pilihan Value Lokal
                              </span>
                              <h3 className="font-black text-sm text-slate-900">Advan Workplus 14</h3>
                              <span className="text-[11px] text-slate-500 font-medium block">
                                Ryzen 5 6600H • 16GB LPDDR5 • 512GB SSD
                              </span>
                            </div>
                            <span className="px-2 py-1 rounded-full bg-slate-200 text-slate-800 text-[11px] font-black shrink-0">
                              91% Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-2">
                            Performa prosesor H-series terkencang di bawah 7,5 juta, port I/O lengkap untuk dual display.
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <span className="text-sm font-black text-slate-900">Rp7.299.000</span>
                          <span className="text-[11px] text-slate-400">IPS FHD • 1.3 kg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LAPTOP DISIMPAN / WISHLIST */}
              {activeTab === "wishlist" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">
                      Menampilkan {savedLaptops.length} laptop favorit Anda
                    </span>
                    <button
                      onClick={() => {
                        setSavedLaptops([]);
                        localStorage.removeItem("speco_saved_laptops");
                      }}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Kosongkan Wishlist
                    </button>
                  </div>

                  {savedLaptops.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
                      <BookmarkSimpleIcon className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">Belum ada laptop di Wishlist</p>
                      <Link
                        href="/#katalog-brand"
                        className="inline-block px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                      >
                        Jelajahi 450 Laptop
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedLaptops.map((l) => (
                        <div
                          key={l.ID_Perangkat}
                          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3 hover:border-emerald-400 transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <BrandIcon brand={l.Brand} useBrandColor className="w-4 h-4 shrink-0" />
                                <span className="text-[11px] font-black text-slate-400">{l.ID_Perangkat}</span>
                              </div>
                              <button
                                onClick={() => handleRemoveSaved(l.ID_Perangkat)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-md"
                                title="Hapus dari wishlist"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>

                            <h3 className="font-extrabold text-sm text-slate-900 mt-2 line-clamp-1">
                              {l.Brand} {l.Model_Seri}
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                              {l.Processor_CPU} • {l.RAM_GB}GB RAM • {l.Storage_GB_Tipe}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-sm font-black text-emerald-800">
                              {formatRupiah(Number(l.Estimasi_Harga_Pasar_IDR) || 0)}
                            </span>
                            <Link
                              href="/bandingkan"
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
                            >
                              Komparasi
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: KOMPARASI SIDE-BY-SIDE */}
              {activeTab === "komparasi" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="text-base font-black text-slate-900">
                      Tabel Perbandingan 2 Pilihan Teratas
                    </h2>
                    <Link
                      href="/bandingkan"
                      className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <span>Buka Halaman Komparasi Lengkap</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-3">Parameter Spek</th>
                          <th className="py-2.5 px-3 font-extrabold text-emerald-800">ASUS Zenbook 14 OLED</th>
                          <th className="py-2.5 px-3 font-extrabold text-slate-800">Acer Swift Go 14 AI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2.5 px-3 text-slate-500 font-semibold">Prosesor CPU</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">AMD Ryzen 7 7730U (8C/16T)</td>
                          <td className="py-2.5 px-3 text-slate-700">Intel Core Ultra 5 125H (14C/18T)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 text-slate-500 font-semibold">RAM / Upgradeable</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">16GB LPDDR4X (Soldered)</td>
                          <td className="py-2.5 px-3 text-slate-700">16GB LPDDR5X (Soldered)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 text-slate-500 font-semibold">Panel Layar</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-800">14&quot; 2.8K OLED 100% DCI-P3</td>
                          <td className="py-2.5 px-3 text-slate-700">14&quot; 2.2K IPS 100% sRGB</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 text-slate-500 font-semibold">Bobot</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">1.39 kg</td>
                          <td className="py-2.5 px-3 text-slate-700">1.32 kg</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 text-slate-500 font-semibold">Harga Pasar</td>
                          <td className="py-2.5 px-3 font-black text-emerald-800">Rp10.899.000</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">Rp10.299.000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: NOTIFIKASI HARGA */}
              {activeTab === "notifikasi" && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <h2 className="text-base font-black text-slate-900">
                    Notifikasi Penurunan Harga Terpantau
                  </h2>
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-black uppercase">
                            Turun Rp400.000
                          </span>
                          <span className="font-extrabold text-xs text-slate-900">Acer Swift Go 14 AI Edition</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Dari Rp10.699.000 menjadi Rp10.299.000 di Shopee Official Store Acer.
                        </p>
                      </div>
                      <a
                        href="https://shopee.co.id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white text-emerald-800 border border-emerald-300 font-bold text-xs"
                      >
                        Beli
                      </a>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-teal-700 text-white text-[10px] font-black uppercase">
                            Turun Rp200.000
                          </span>
                          <span className="font-extrabold text-xs text-slate-900">Advan Workplus 14 AMD</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Kini Rp6.999.000 di Tokopedia Official Advan.
                        </p>
                      </div>
                      <a
                        href="https://tokopedia.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white text-slate-800 border border-slate-300 font-bold text-xs"
                      >
                        Beli
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Comparison Drawer / Side Widget (4 Cols) */}
            <div className="w-full lg:w-4/12 space-y-5 shrink-0">
              {/* Widget: Top Wishlist Comparison Radar & Specs */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarIcon weight="fill" className="text-emerald-600 w-5 h-5" />
                    <h3 className="font-black text-sm text-slate-900">Wishlist Teratas</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold">5 Disimpan</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Matriks spek komparatif langsung 2 laptop peringkat tertinggi pilihan Anda saat ini:
                </p>

                {/* SVG Benchmark Comparison Chart */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200/60">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <span className="text-slate-800 font-bold">ASUS Zenbook 14</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                      <span className="text-slate-600">Acer Swift Go 14</span>
                    </div>
                  </div>

                  <div className="w-full pt-1">
                    <svg aria-label="Visualisasi perbandingan performa komputasi, portabilitas, baterai, dan layar" className="w-full h-auto overflow-visible" viewBox="0 0 320 130">
                      <line className="text-slate-200" stroke="currentColor" strokeDasharray="2,2" x1="0" x2="320" y1="20" y2="20" />
                      <line className="text-slate-200" stroke="currentColor" strokeDasharray="2,2" x1="0" x2="320" y1="50" y2="50" />
                      <line className="text-slate-200" stroke="currentColor" strokeDasharray="2,2" x1="0" x2="320" y1="80" y2="80" />
                      <line className="text-slate-200" stroke="currentColor" strokeDasharray="2,2" x1="0" x2="320" y1="110" y2="110" />

                      <text className="fill-current text-slate-500 font-sans text-[10px]" x="0" y="15">Kompilasi AI/Code</text>
                      <rect className="fill-current text-emerald-600" height="7" rx="3" width="180" x="110" y="7" />
                      <rect className="fill-current text-teal-500" height="7" rx="3" width="168" x="110" y="16" />

                      <text className="fill-current text-slate-500 font-sans text-[10px]" x="0" y="45">Daya Baterai</text>
                      <rect className="fill-current text-emerald-600" height="7" rx="3" width="195" x="110" y="37" />
                      <rect className="fill-current text-teal-500" height="7" rx="3" width="175" x="110" y="46" />

                      <text className="fill-current text-slate-500 font-sans text-[10px]" x="0" y="75">Portabilitas (1.2kg)</text>
                      <rect className="fill-current text-emerald-600" height="7" rx="3" width="170" x="110" y="67" />
                      <rect className="fill-current text-teal-500" height="7" rx="3" width="185" x="110" y="76" />

                      <text className="fill-current text-slate-500 font-sans text-[10px]" x="0" y="105">Akurasi Layar</text>
                      <rect className="fill-current text-emerald-600" height="7" rx="3" width="198" x="110" y="97" />
                      <rect className="fill-current text-teal-500" height="7" rx="3" width="160" x="110" y="106" />
                    </svg>
                  </div>
                </div>

                {/* Direct Comparison Spec Rows */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1.5 bg-slate-50 px-3 rounded-xl">
                    <span className="text-slate-500">CPU Platform</span>
                    <span className="font-bold text-slate-800 text-right">Ryzen 7 vs Core Ultra 5</span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-slate-50 px-3 rounded-xl">
                    <span className="text-slate-500">RAM / Storage</span>
                    <span className="font-bold text-slate-800 text-right">16GB / 512GB (Keduanya)</span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-slate-50 px-3 rounded-xl">
                    <span className="text-slate-500">Bobot Riil</span>
                    <span className="font-bold text-slate-800 text-right">1.39 kg vs 1.32 kg</span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-slate-50 px-3 rounded-xl">
                    <span className="text-slate-500">Panel Monitor</span>
                    <span className="font-bold text-slate-800 text-right">2.8K OLED vs 2.2K IPS</span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-slate-50 px-3 rounded-xl">
                    <span className="text-slate-500">Harga Termurah</span>
                    <div className="flex flex-col text-right">
                      <span className="font-extrabold text-emerald-800">Rp10.899.000</span>
                      <span className="text-[10px] text-slate-400">vs Rp10.299.000</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/bandingkan"
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-xs text-slate-900 text-center font-bold block"
                >
                  Buka Tabel Komparasi Penuh
                </Link>
              </div>

              {/* Student Verification Campus Perks Card */}
              <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center font-bold">
                    <ShieldCheckIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm block">Perk Edukasi Aktif</span>
                    <span className="text-[11px] text-emerald-200">Universitas Harkat Negeri (uhn.ac.id)</span>
                  </div>
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Anda berhak klaim subsidi garansi resmi 2 tahun dan cashback tambahan Rp250.000 dari program SPECO EduPartner di distributor resmi.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEduTokenModalOpen(true)}
                  className="w-full py-2.5 bg-white text-emerald-950 text-xs font-black rounded-xl hover:bg-emerald-50 transition-colors shadow-xs"
                >
                  Tampilkan Token Kupon Edukasi
                </button>
              </div>

              {/* Academic Advisor Chat Mini CTA */}
              <div className="bg-white rounded-3xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ChatsCircleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Konsultasi Dosen/Lab</span>
                    <span className="text-[11px] text-slate-400">Unduh ringkasan PDF spesifikasi</span>
                  </div>
                </div>
                <button
                  aria-label="Ekspor Laporan PDF"
                  onClick={handleExportSummary}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 transition-colors"
                  title="Unduh Berkas Ringkasan"
                >
                  <DownloadSimpleIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ==============================================================================
          3. FOOTER
      ============================================================================== */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-10 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/speco-logo.png"
                alt="SPECO"
                width={110}
                height={36}
                className="h-7 w-auto object-contain"
              />
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">
                © 2026 SPECO Indonesia. Rekayasa Perangkat Lunak - Universitas Harkat Negeri.
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 font-semibold">
              <Link href="/docs" className="hover:text-emerald-800">
                Dokumentasi
              </Link>
              <Link href="/admin" className="hover:text-emerald-800">
                Portal Admin
              </Link>
              <a
                href="https://github.com/Nourivex/Speco"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-800"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL: EDIT KEBUTUHAN STACK */}
      {isStackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">Ubah Kebutuhan Stack & Budget</h3>
              <button onClick={() => setIsStackModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Stack Utama</label>
                <input
                  type="text"
                  value={tempStack}
                  onChange={(e) => setTempStack(e.target.value)}
                  placeholder="Contoh: Flutter / Firebase / Docker"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Budget</label>
                <select
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none text-slate-900"
                >
                  <option value="< Rp7.000.000">&lt; Rp7.000.000 (Entry Level)</option>
                  <option value="Rp7 - 10 Juta">Rp7 - 10 Juta (Mid-Range)</option>
                  <option value="Rp8,5 - 12 Juta">Rp8,5 - 12 Juta (Optimal Coding)</option>
                  <option value="Rp12 - 16 Juta">Rp12 - 16 Juta (Heavy Dev / AI)</option>
                  <option value="> Rp16.000.000">&gt; Rp16.000.000 (Workstation)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsStackModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentStack(tempStack);
                  setIsStackModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs"
              >
                Simpan Stack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TOKEN KUPON EDUKASI */}
      {isEduTokenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Kupon Edukasi SPECO</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tunjukkan kode voucher ini di kasir distributor resmi partner SPECO.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-lg font-black tracking-widest select-all">
              SPECO-UHN-2026
            </div>

            <p className="text-[11px] text-slate-400">
              Berlaku hingga 31 Desember 2026 untuk civitas akademika Universitas Harkat Negeri.
            </p>

            <button
              onClick={() => setIsEduTokenModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
