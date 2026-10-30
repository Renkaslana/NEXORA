"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/ssr/BookmarkSimple";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { CodeIcon } from "@phosphor-icons/react/dist/ssr/Code";
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu";
import { FadersIcon } from "@phosphor-icons/react/dist/ssr/Faders";
import { FireIcon } from "@phosphor-icons/react/dist/ssr/Fire";
import { FolderSimpleIcon } from "@phosphor-icons/react/dist/ssr/FolderSimple";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { PaintBrushIcon } from "@phosphor-icons/react/dist/ssr/PaintBrush";
import { PlayCircleIcon } from "@phosphor-icons/react/dist/ssr/PlayCircle";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star";
import { TerminalWindowIcon } from "@phosphor-icons/react/dist/ssr/TerminalWindow";
import { TimerIcon } from "@phosphor-icons/react/dist/ssr/Timer";
import { CubeIcon } from "@phosphor-icons/react/dist/ssr/Cube";
import { ChartBarIcon } from "@phosphor-icons/react/dist/ssr/ChartBar";
import { FirstAidKitIcon } from "@phosphor-icons/react/dist/ssr/FirstAidKit";
import { UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { BookOpenTextIcon } from "@phosphor-icons/react/dist/ssr/BookOpenText";
import { formatRupiah } from "@/lib/format";
import {
  catalogLaptops,
  getRecommendedForSimulator,
  HERO_SHOWCASE_MODELS,
  getLaptopImage,
  CatalogLaptop,
} from "@/lib/catalog-service";
import { SearchPalette } from "@/components/landing/search-palette";
import { BookmarksDrawer } from "@/components/landing/bookmarks-drawer";
import { LaptopQuickModal } from "@/components/landing/laptop-quick-modal";
import { UserProfileMenu } from "@/components/landing/user-profile-menu";
import { BrandModal } from "@/components/landing/brand-modal";
import { BrandIcon } from "@/components/ui/brand-icon";
import { supabase, isAdminUser } from "@/lib/supabase";

// Data Tier Budget Hero
const HERO_TIERS = [
  { id: "lt-6", label: "< Rp6 jt", subtitle: "Hemat & Cukup", count: 8 },
  { id: "6-8", label: "Rp6–8 jt", subtitle: "Serba Bisa", count: 18 },
  { id: "8-10", label: "Rp8–10 jt", subtitle: "Paling Seimbang", count: 24 },
  { id: "10-15", label: "Rp10–15 jt", subtitle: "Tipis & Layar OLED", count: 14 },
  { id: "15-plus", label: "Rp15 jt+", subtitle: "Kreator & GPU", count: 12 },
];

// Data Workload
const WORKLOADS = [
  {
    id: "coding",
    title: "Coding & Informatika",
    desc: "Kompilasi C++, Android, Web & Docker",
    icon: TerminalWindowIcon,
    weights: { cpu: 35, value: 25, ram: 16, display: 14, portability: 10 },
  },
  {
    id: "desain",
    title: "Desain Grafis & UI/UX",
    desc: "Figma, Illustrator, Photoshop, sRGB Tinggi",
    icon: PaintBrushIcon,
    weights: { cpu: 25, value: 20, ram: 15, display: 30, portability: 10 },
  },
  {
    id: "bisnis",
    title: "Bisnis, Data & Riset",
    desc: "Excel Macro, SPSS, Power BI, Python Data",
    icon: ChartBarIcon,
    weights: { cpu: 20, value: 25, ram: 25, display: 15, portability: 15 },
  },
  {
    id: "teknik",
    title: "Teknik & 3D / CAD",
    desc: "AutoCAD, SolidWorks, Blender, Render GPU",
    icon: CubeIcon,
    weights: { cpu: 40, value: 20, ram: 15, display: 15, portability: 10 },
  },
  {
    id: "medis",
    title: "Kedokteran & Umum",
    desc: "Portabel, Baterai Seharian, Layar Nyaman",
    icon: FirstAidKitIcon,
    weights: { cpu: 15, value: 30, ram: 15, display: 15, portability: 25 },
  },
];

export function StitchLanding() {
  // Modal & Drawer States
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [selectedBrandModal, setSelectedBrandModal] = React.useState<string | null>(null);
  const [quickViewLaptop, setQuickViewLaptop] = React.useState<CatalogLaptop | null>(null);

  // Bookmarks State (disimpan di localStorage)
  const [bookmarkedList, setBookmarkedList] = React.useState<CatalogLaptop[]>([]);

  // User Authentication State
  const [currentUser, setCurrentUser] = React.useState<{
    name: string;
    email: string;
    role: "admin" | "mahasiswa" | "guest";
  } | null>(null);

  // Hero Tier State
  const [activeTierIdx, setActiveTierIdx] = React.useState(3); // default: Rp10-15jt

  // Simulator State
  const [budget, setBudget] = React.useState(8500000);
  const [selectedWorkload, setSelectedWorkload] = React.useState("coding");
  const [campusFilters, setCampusFilters] = React.useState({
    ramUpgradeable: false,
    oledOrSrgb: false,
    dedicatedGpu: false,
    warranty2Plus: false,
  });
  const [simulatorPage, setSimulatorPage] = React.useState(0);

  // Kuis Teaser State
  const [quizPriority, setQuizPriority] = React.useState("performa");
  const [quizBudgetTier, setQuizBudgetTier] = React.useState("8-12");

  // Inisialisasi bookmarks dari localStorage saat mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("speco_saved_laptops");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // localStorage hanya ada di browser, jadi dibaca setelah mount.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setBookmarkedList(parsed);
          return;
        }
      }
    } catch {
      // Abaikan bila parsing gagal
    }

    // Default awal bila kosong: 4 laptop favorit mahasiswa
    const defaults = catalogLaptops.slice(0, 4);
    setBookmarkedList(defaults);

    // Cek Sesi Pengguna / Admin
    try {
      if (supabase) {
        supabase.auth.getUser().then(async ({ data }) => {
          if (data?.user) {
            const u = data.user;
            const email = (u.email || "").toLowerCase();
            const isLeadAdmin = await isAdminUser(u);

            setCurrentUser({
              name: u.user_metadata?.full_name || u.email?.split("@")[0] || "User",
              email: u.email || "",
              role: isLeadAdmin ? "admin" : "mahasiswa",
            });
            if (isLeadAdmin) {
              localStorage.setItem("speco_admin_session", "authorized_lead_affif");
            }
            return;
          }
        });
      }

      const userSession = localStorage.getItem("speco_user_session");
      if (userSession) {
        const parsedUser = JSON.parse(userSession);
        setCurrentUser({
          name: parsedUser.name || "Pengguna",
          email: parsedUser.email || "",
          role: parsedUser.role === "admin" ? "admin" : "mahasiswa",
        });
        return;
      }
    } catch {
      // Abaikan bila parsing gagal
    }
  }, []);

  // Simpan ke localStorage setiap ada perubahan bookmarks
  const saveBookmarksToStorage = (list: CatalogLaptop[]) => {
    setBookmarkedList(list);
    try {
      localStorage.setItem("speco_saved_laptops", JSON.stringify(list));
    } catch {
      // Quota exceeded
    }
  };

  const isBookmarked = (id: string) => {
    return bookmarkedList.some((item) => item.ID_Perangkat === id);
  };

  const toggleBookmark = (laptop: CatalogLaptop) => {
    if (isBookmarked(laptop.ID_Perangkat)) {
      const next = bookmarkedList.filter((item) => item.ID_Perangkat !== laptop.ID_Perangkat);
      saveBookmarksToStorage(next);
    } else {
      const next = [laptop, ...bookmarkedList];
      saveBookmarksToStorage(next);
    }
  };

  const removeBookmarkById = (id: string) => {
    const next = bookmarkedList.filter((item) => item.ID_Perangkat !== id);
    saveBookmarksToStorage(next);
  };

  const clearAllBookmarks = () => {
    saveBookmarksToStorage([]);
  };

  // Keyboard shortcut listener untuk ⌘K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Data Tier & Showcase Hero
  const activeTier = HERO_TIERS[activeTierIdx];
  const activeHeroModel = HERO_SHOWCASE_MODELS[activeTierIdx] || HERO_SHOWCASE_MODELS[3];
  const activeWorkloadData = WORKLOADS.find((w) => w.id === selectedWorkload) || WORKLOADS[0];

  // Hasil Rekomendasi Simulator Dinamis (menggunakan algoritma SAW dari 450 laptop)
  const simulatorRecommendations = React.useMemo(() => {
    return getRecommendedForSimulator(budget, selectedWorkload, campusFilters);
  }, [budget, selectedWorkload, campusFilters]);

  // Pagination 3 item per halaman
  const totalPages = Math.ceil(simulatorRecommendations.length / 3);
  const currentMatchedLaptops = simulatorRecommendations.slice(
    simulatorPage * 3,
    simulatorPage * 3 + 3
  );

  // Sinkronkan tier hero dengan simulator saat user klik tier di hero
  const handleSelectTier = (idx: number) => {
    setActiveTierIdx(idx);
    const targetModel = HERO_SHOWCASE_MODELS[idx];
    if (targetModel) {
      setBudget(targetModel.defaultBudget);
    }
  };

  // Setel preset mahasiswa Informatika (tombol cepat profil)
  const handleSetInformatikaPreset = () => {
    setSelectedWorkload("coding");
    setBudget(12000000);
    setCampusFilters({
      ramUpgradeable: true,
      oledOrSrgb: false,
      dedicatedGpu: false,
      warranty2Plus: true,
    });
    // Scroll ke simulasi
    const el = document.getElementById("simulasi-budget");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] font-sans antialiased selection:bg-emerald-200 selection:text-emerald-950">
      {/* ==============================================================================
          1. STICKY MODERN HEADER
      ============================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="h-[74px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
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

            {/* Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              <a
                href="#beranda"
                className="px-3.5 py-2 transition-all bg-emerald-50 text-emerald-800 font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Beranda</span>
              </a>
              <a
                href="#simulasi-budget"
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-lg"
              >
                Simulasi Budget
              </a>
              <a
                href="#kuis-ai"
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-lg flex items-center gap-1"
              >
                <span>Kuis & Rekomendasi AI</span>
                <CaretDownIcon className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href="#transparansi-metrik"
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-lg"
              >
                Transparansi & Metrik
              </a>
              <a
                href="#katalog-brand"
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-lg"
              >
                Katalog Brand
              </a>
              <Link
                href="/dashboard"
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-lg"
              >
                Riwayat & Dashboard
              </Link>
              <Link
                href="/docs"
                className="px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-all rounded-lg flex items-center gap-1.5"
              >
                <BookOpenTextIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span>Dokumentasi</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Quick Search Trigger (⌘K) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center justify-between w-64 h-10 px-3.5 bg-slate-100/90 border border-slate-200 rounded-xl text-slate-500 hover:border-emerald-400 hover:bg-white transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 shrink-0 transition-colors" />
                <span className="text-xs truncate text-slate-500 group-hover:text-slate-800">
                  Cari tipe, spek, budget...
                </span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 group-hover:bg-emerald-100 text-[10px] font-mono text-slate-600 group-hover:text-emerald-800 font-semibold border border-slate-300 shrink-0 transition-colors">
                ⌘K
              </kbd>
            </button>

            {/* Riwayat Bookmark Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsBookmarksOpen(true)}
              className="flex items-center gap-2 h-10 px-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 hover:bg-slate-50 hover:border-emerald-300 transition-all shadow-2xs"
            >
              <BookmarkSimpleIcon weight="fill" className="text-emerald-600 w-4 h-4" />
              <span className="text-xs font-bold">Riwayat</span>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-black">
                {bookmarkedList.length}
              </span>
            </button>

            {/* User Capsule & Profile Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 h-10 px-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-emerald-400 transition-colors"
              >
                {currentUser ? (
                  <>
                    <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-[11px] font-black shadow-2xs">
                      {currentUser.role === "admin" ? "MA" : (currentUser.name || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1 max-w-[90px] sm:max-w-none">
                      <span className="text-xs text-slate-900 font-bold leading-tight truncate">
                        {currentUser.role === "admin" ? "M. Affif" : currentUser.name}
                      </span>
                      {currentUser.role === "admin" && (
                        <CheckCircleIcon weight="fill" className="text-emerald-600 w-3.5 h-3.5 shrink-0" />
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <UserIcon className="w-4 h-4 text-slate-600" />
                    <span className="text-xs text-slate-800 font-bold">Masuk / Akun</span>
                    <CaretDownIcon className="w-3 h-3 text-slate-400" />
                  </>
                )}
              </button>

              <UserProfileMenu
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                onSetInformatikaPreset={handleSetInformatikaPreset}
                currentUser={currentUser}
                onLogout={() => setCurrentUser(null)}
              />
            </div>

            {/* Primary Action Button */}
            <Link
              href="/rekomendasi/budget"
              className="h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/15 flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
            >
              <span>Mulai</span>
              <ArrowRightIcon weight="bold" className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ==============================================================================
          2. ATMOSPHERIC HERO SECTION
      ============================================================================== */}
      <section id="beranda" className="pt-28 pb-16 md:py-24 bg-gradient-to-b from-white via-[#f3faf8] to-[#faf8ff] relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-200/40 via-teal-100/30 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs">
                <SparkleIcon weight="fill" className="w-3.5 h-3.5 text-emerald-700" />
                <span>Rekomendasi Laptop Bebas Afiliasi Toko</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Laptop yang Pas Buat{" "}
                <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Kebutuhan Kuliahmu.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Rekomendasi laptop berbasis data objektif sesuai budget, jurusan, dan aplikasi harianmu.
                Bukan kata promotor toko, tanpa bias e-commerce.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/rekomendasi/budget"
                  className="px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Mulai Kuis Diagnosa</span>
                  <ArrowRightIcon weight="bold" className="w-4 h-4" />
                </Link>

                <a
                  href="#simulasi-budget"
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-2xs flex items-center gap-2 transition-all"
                >
                  <FadersIcon weight="bold" className="w-4 h-4 text-emerald-700" />
                  <span>Simulasi Budget Langsung</span>
                </a>
              </div>

              {/* 5 Tier Quick Selectors */}
              <div className="w-full pt-4 border-t border-slate-200/80">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Eksplorasi Laptop Berdasarkan Budget:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {HERO_TIERS.map((tier, idx) => {
                    const isActive = activeTierIdx === idx;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => handleSelectTier(idx)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isActive
                            ? "bg-emerald-800 text-white border-emerald-900 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
                        }`}
                      >
                        <span className="text-xs font-extrabold block leading-none">{tier.label}</span>
                        <span
                          className={`text-[10px] mt-1 block truncate ${
                            isActive ? "text-emerald-100" : "text-slate-500"
                          }`}
                        >
                          {tier.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Live Benchmark Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-slate-200/90 overflow-hidden">
                {/* Glow Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-extrabold text-slate-900">
                      Rekomendasi Teratas: Tier {activeTier.label}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                    {activeHeroModel.matchScore}% Kecocokan AI
                  </span>
                </div>

                {/* Hero Showcase Image */}
                <div className="relative w-full h-48 my-3 rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/20 border border-slate-100 flex items-center justify-center p-3 overflow-hidden">
                  <img
                    src={activeHeroModel.image}
                    alt={activeHeroModel.name}
                    className="max-h-full max-w-full object-contain drop-shadow-md transition-all duration-300 hover:scale-105"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-white/90 backdrop-blur-xs border border-slate-200 text-[10px] font-bold text-slate-700">
                    {activeHeroModel.subtitle}
                  </div>
                </div>

                {/* Specs Overview */}
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      {activeHeroModel.brand}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                      {activeHeroModel.name}
                    </h3>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {formatRupiah(activeHeroModel.price)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-[10px] text-slate-400 block">Prosesor</span>
                      <span className="font-bold text-slate-900 truncate block">{activeHeroModel.cpu}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-[10px] text-slate-400 block">Memori RAM</span>
                      <span className="font-bold text-slate-900 truncate block">{activeHeroModel.ram}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-[10px] text-slate-400 block">Layar Panel</span>
                      <span className="font-bold text-slate-900 truncate block">{activeHeroModel.display}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-[10px] text-slate-400 block">Daya Baterai</span>
                      <span className="font-bold text-slate-900 truncate block">{activeHeroModel.battery}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-emerald-900 block mb-0.5">Kenapa Cocok:</span>
                    {activeHeroModel.matchReason}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href="#simulasi-budget"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs text-center shadow-xs transition-colors"
                    >
                      Buka di Simulasi Budget
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const target = catalogLaptops.find((c) => c.ID_Perangkat === activeHeroModel.id) || catalogLaptops[0];
                        setQuickViewLaptop(target);
                      }}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                    >
                      Rincian Spek
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          3. VERIFIED BRAND MARQUEE
      ============================================================================== */}
      <section className="py-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Database 450 Laptop Terverifikasi:
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {["Axioo", "Advan", "Zyrex", "ASUS", "Lenovo", "Acer", "Apple", "MSI", "HP", "Dell"].map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setSelectedBrandModal(brand)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 hover:scale-105 transition-all bg-white shadow-2xs group"
                >
                  <BrandIcon brand={brand} useBrandColor className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">
                    {brand}
                  </span>
                  {["Axioo", "Advan", "Zyrex"].includes(brand) && (
                    <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded">
                      ID
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          4. INTERACTIVE BUDGET SIMULATOR
      ============================================================================== */}
      <section id="simulasi-budget" className="py-20 bg-[#faf8ff] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
              Simulasi Dinamis
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Satu Budget. Banyak Kemungkinan.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Geser budget dan pilih beban kerjamu. SPECO menghitung ulang 450 laptop secara real-time
              menggunakan formula SAW.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controller Form */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-200/90 space-y-6">
              {/* Slider Budget */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Budget Maksimalmu:
                  </span>
                  <span className="text-xl font-black text-emerald-800">
                    {formatRupiah(budget)}
                  </span>
                </div>

                <input
                  type="range"
                  min="4000000"
                  max="25000000"
                  step="250000"
                  value={budget}
                  onChange={(e) => {
                    setBudget(Number(e.target.value));
                    setSimulatorPage(0);
                  }}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                />

                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Rp4 Juta</span>
                  <span>Rp12 Juta</span>
                  <span>Rp25 Juta</span>
                </div>
              </div>

              {/* Workload Radio Buttons */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Beban Kerja Utama Jurusan:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {WORKLOADS.map((w) => {
                    const isSelected = selectedWorkload === w.id;
                    const IconComp = w.icon;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setSelectedWorkload(w.id);
                          setSimulatorPage(0);
                        }}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950 shadow-2xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-emerald-700 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-extrabold block truncate">{w.title}</span>
                          <span className="text-[11px] text-slate-500 block truncate">{w.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter Spesifik Kampus */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Kebutuhan Wajib Tambahan:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campusFilters.ramUpgradeable}
                      onChange={(e) => {
                        setCampusFilters((prev) => ({ ...prev, ramUpgradeable: e.target.checked }));
                        setSimulatorPage(0);
                      }}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-semibold text-slate-700 text-[11px]">RAM Upgradeable</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campusFilters.oledOrSrgb}
                      onChange={(e) => {
                        setCampusFilters((prev) => ({ ...prev, oledOrSrgb: e.target.checked }));
                        setSimulatorPage(0);
                      }}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-semibold text-slate-700 text-[11px]">Layar OLED / sRGB</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campusFilters.dedicatedGpu}
                      onChange={(e) => {
                        setCampusFilters((prev) => ({ ...prev, dedicatedGpu: e.target.checked }));
                        setSimulatorPage(0);
                      }}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-semibold text-slate-700 text-[11px]">GPU Dedicated (RTX)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campusFilters.warranty2Plus}
                      onChange={(e) => {
                        setCampusFilters((prev) => ({ ...prev, warranty2Plus: e.target.checked }));
                        setSimulatorPage(0);
                      }}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="font-semibold text-slate-700 text-[11px]">Garansi 2+ Thn</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Results Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Kandidat Terbaik untuk {activeWorkloadData.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ditemukan {simulatorRecommendations.length} laptop dalam batas {formatRupiah(budget)} (+15%)
                  </p>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={simulatorPage === 0}
                      onClick={() => setSimulatorPage((p) => Math.max(0, p - 1))}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                    >
                      <CaretLeftIcon className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-600 px-2">
                      {simulatorPage + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={simulatorPage >= totalPages - 1}
                      onClick={() => setSimulatorPage((p) => Math.min(totalPages - 1, p + 1))}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                    >
                      <CaretRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 3 Matched Laptop Cards */}
              <div className="space-y-3.5">
                {currentMatchedLaptops.map((item, idx) => {
                  const bookmarked = isBookmarked(item.ID_Perangkat);
                  const imgSrc = getLaptopImage(item);
                  const isLocal = ["Axioo", "Advan", "Zyrex"].includes(item.Brand);

                  return (
                    <div
                      key={item.ID_Perangkat}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                    >
                      {/* Left thumbnail & basic info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div
                          onClick={() => setQuickViewLaptop(item)}
                          className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 shrink-0 p-2 flex items-center justify-center cursor-pointer overflow-hidden shadow-2xs"
                        >
                          <img
                            src={imgSrc}
                            alt={item.Model_Seri}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/laptops/mainstream-silver-34.webp";
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
                              {item.Brand}
                            </span>
                            {isLocal && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                                Lokal ID
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                              Rank #{simulatorPage * 3 + idx + 1}
                            </span>
                          </div>

                          <h4
                            onClick={() => setQuickViewLaptop(item)}
                            className="text-sm font-extrabold text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                          >
                            {item.Model_Seri}
                          </h4>

                          <p className="text-xs font-black text-slate-900 mt-0.5">
                            {formatRupiah(item.numericPrice)}
                          </p>

                          {/* Quick specs pill */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 mt-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold truncate max-w-[130px]">
                              {item.Processor_CPU}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold">
                              RAM {item.RAM_GB}GB
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold">
                              {item.Storage_GB_Tipe}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Benchmark & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <span className="text-xs font-extrabold text-emerald-800 block">
                            {item.matchScore || 92}% Kecocokan
                          </span>
                          <span className="text-[10px] text-slate-400">Skor Preferensi SAW</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleBookmark(item)}
                            className={`p-2.5 rounded-xl border transition-all ${
                              bookmarked
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-white text-slate-400 border-slate-200 hover:text-emerald-700 hover:bg-slate-50"
                            }`}
                            title={bookmarked ? "Hapus dari Riwayat" : "Simpan ke Riwayat"}
                          >
                            <BookmarkSimpleIcon weight={bookmarked ? "fill" : "regular"} className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setQuickViewLaptop(item)}
                            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-2xs"
                          >
                            Lihat Spek
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Notification Callout */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-600">
                  Ingin rekomendasi yang lebih presisi dengan bobot software spesifikmu?
                </span>
                <Link
                  href="/rekomendasi/budget"
                  className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold shrink-0 transition-colors"
                >
                  Buka Kuis Rekomendasi Lengkap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          5. ALGORITHM TRANSPARENCY SECTION
      ============================================================================== */}
      <section id="transparansi-metrik" className="py-20 bg-white border-y border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                <ShieldCheckIcon weight="fill" className="w-4 h-4 text-emerald-700" />
                <span>Formula Objektif Bebas Sponsor</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Kenapa Laptop Ini Direkomendasikan?
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Setiap laptop dievaluasi menggunakan metode <strong>Simple Additive Weighting (SAW)</strong>.
                Kriteria seperti harga dan bobot dihitung sebagai biaya (*cost*), sementara performa CPU,
                RAM, dan layar dihitung sebagai keuntungan (*benefit*).
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <CheckCircleIcon weight="fill" className="text-emerald-700 w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    <strong>Tidak ada titipan toko:</strong> Skor murni perbandingan angka benchmark dan harga pasar nyata.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircleIcon weight="fill" className="text-emerald-700 w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    <strong>Normalisasi Matriks Keputusan:</strong> Alternatif terbaik memiliki nilai normalisasi mendekati 1.0.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircleIcon weight="fill" className="text-emerald-700 w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    <strong>Dinamis Sesuai Jurusan:</strong> Mahasiswa Desain mendapat bobot layar 30%, sedangkan Informatika mendapat bobot CPU 35%.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/rekomendasi/analisis"
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <span>Baca Formula Matematis Lengkap di Dokumentasi Arsitektur</span>
                  <ArrowRightIcon weight="bold" className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Bento Weight Distribution Visualizer */}
            <div className="lg:col-span-6 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Distribusi Bobot ({activeWorkloadData.title})
                </span>
                <span className="text-xs font-black text-emerald-800">Total: 100%</span>
              </div>

              <div className="space-y-4 pt-5 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                    <span>Performa Prosesor (CPU & Kompilasi)</span>
                    <span>{activeWorkloadData.weights.cpu}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                      style={{ width: `${activeWorkloadData.weights.cpu}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                    <span>Efisiensi Anggaran (Value-for-Money)</span>
                    <span>{activeWorkloadData.weights.value}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${activeWorkloadData.weights.value}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                    <span>Kapasitas & Kecepatan RAM</span>
                    <span>{activeWorkloadData.weights.ram}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${activeWorkloadData.weights.ram}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                    <span>Kualitas Layar & Akurasi Warna</span>
                    <span>{activeWorkloadData.weights.display}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${activeWorkloadData.weights.display}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                    <span>Portabilitas & Bobot Ringan</span>
                    <span>{activeWorkloadData.weights.portability}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${activeWorkloadData.weights.portability}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          6. QUICK AI QUIZ TEASER
      ============================================================================== */}
      <section id="kuis-ai" className="py-20 bg-[#faf8ff] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold uppercase tracking-wider inline-block">
                  Kuis Diagnosa AI
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  5 Pertanyaan. Kurang dari 2 Menit.
                </h2>
                <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-xl">
                  Coba jawab pertanyaan diagnostik berikut. Sistem langsung memprediksi profil spek ideal
                  yang kamu butuhkan selama masa perkuliahan.
                </p>

                {/* Interactive Question Card */}
                <div className="pt-4 space-y-3">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                    Apa prioritas nomor satu buatmu?
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { id: "performa", label: "Performa Kencang (CPU & GPU)" },
                      { id: "baterai", label: "Baterai Tahan Seharian (10+ Jam)" },
                      { id: "layar", label: "Layar Akurat (OLED / 100% sRGB)" },
                      { id: "hemat", label: "Harga Paling Hemat & Upgradeable" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setQuizPriority(opt.id)}
                        className={`p-3 rounded-xl border text-left font-bold transition-all ${
                          quizPriority === opt.id
                            ? "bg-white text-emerald-950 border-white shadow-sm"
                            : "bg-emerald-950/40 border-emerald-700/60 text-emerald-100 hover:bg-emerald-950/70"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href="/rekomendasi/budget"
                    className="px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Lanjut Kuis Lengkap di SPECO</span>
                    <ArrowRightIcon weight="bold" className="w-3.5 h-3.5 text-emerald-800" />
                  </Link>
                  <span className="text-xs text-emerald-200">1 dari 5 langkah awal</span>
                </div>
              </div>

              {/* Right Teaser Outcome Card */}
              <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-white/15">
                  <span className="font-bold text-emerald-200">Pratinjau Hasil SAW</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-700/80 text-[10px] font-black uppercase">
                    Diagnosa Awal
                  </span>
                </div>

                <div>
                  <span className="text-xs text-emerald-300">Profil yang Disarankan:</span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">
                    {quizPriority === "performa"
                      ? "Workstation Mahasiswa (High-TDP & H-Series)"
                      : quizPriority === "baterai"
                      ? "Ultrabook Portabel Seharian (U-Series)"
                      : quizPriority === "layar"
                      ? "Studio Kreator & Desain (100% sRGB / OLED)"
                      : "Budget Value Champion (RAM Upgradeable)"}
                  </h4>
                </div>

                <div className="space-y-2 text-xs text-emerald-100">
                  <div className="flex justify-between">
                    <span>Rekomendasi RAM:</span>
                    <span className="font-bold text-white">
                      {quizPriority === "hemat" ? "8GB (Wajib Ada Slot Tambahan)" : "16GB Dual-Channel"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target TDP CPU:</span>
                    <span className="font-bold text-white">
                      {quizPriority === "performa" ? "45W - 55W (Performa Maksimal)" : "15W - 28W (Hemat Daya Dingin)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimasi Budget Efisien:</span>
                    <span className="font-bold text-white">Rp7.500.000 - Rp12.000.000</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/15">
                  <Link
                    href="/rekomendasi/budget"
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs text-center block transition-colors shadow-sm"
                  >
                    Dapatkan Rekomendasi Lengkap
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          7. BRAND SHOWCASE
      ============================================================================== */}
      <section id="katalog-brand" className="py-20 bg-white border-t border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2.5 inline-block">
                Katalog Netral
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Semua Brand Dihitung Adil. Dari Lokal Hingga Global.
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                SPECO membandingkan brand lokal Indonesia (Axioo, Advan, Zyrex) dan internasional
                secara murni berbasis rasio harga terhadap spesifikasi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[
              { name: "Axioo", isLocal: true, count: 28, highlight: "Hype Series & Pongo Gaming" },
              { name: "Advan", isLocal: true, count: 22, highlight: "Workplus & Workpro 16:10" },
              { name: "Zyrex", isLocal: true, count: 14, highlight: "Sky Series & Kavaleri" },
              { name: "ASUS", isLocal: false, count: 96, highlight: "Vivobook, Zenbook & TUF" },
              { name: "Lenovo", isLocal: false, count: 88, highlight: "IdeaPad, LOQ & ThinkPad" },
              { name: "Acer", isLocal: false, count: 64, highlight: "Aspire Lite, Swift & Nitro" },
              { name: "Apple", isLocal: false, count: 18, highlight: "MacBook Air & Pro M-Series" },
              { name: "MSI", isLocal: false, count: 42, highlight: "Modern & Cyborg Gaming" },
              { name: "HP", isLocal: false, count: 52, highlight: "Pavilion, Victus & Envy" },
              { name: "Dell", isLocal: false, count: 26, highlight: "Inspiron & Vostro Series" },
            ].map((b) => (
              <div
                key={b.name}
                onClick={() => setSelectedBrandModal(b.name)}
                className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group flex flex-col justify-between h-36"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <BrandIcon brand={b.name} useBrandColor className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="text-sm font-black text-slate-900 group-hover:text-emerald-800 truncate">
                        {b.name}
                      </span>
                    </div>
                    {b.isLocal && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase shrink-0">
                        Lokal
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{b.highlight}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{b.count} model</span>
                  <span className="font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Lihat <ArrowRightIcon className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================================================================
          8. MODERN CLEAN FOOTER
      ============================================================================== */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/brand/speco-logo.png"
                  alt="SPECO Indonesia"
                  width={130}
                  height={42}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Platform rekomendasi laptop berbasis data dan algoritma SAW untuk mahasiswa Indonesia.
                Dibuat oleh TIM SPECO (Kelompok 7A) untuk Mata Kuliah Rekayasa Perangkat Lunak - Universitas Harkat Negeri.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                  Algoritma Bebas Afiliasi Toko
                </span>
                <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 text-[10px] font-bold">
                  Katalog 450 Laptop Mahasiswa
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Modul SPECO
              </span>
              <nav className="flex flex-col gap-1.5 text-xs text-slate-500">
                <a href="#beranda" className="hover:text-emerald-700 transition-colors">Beranda</a>
                <a href="#simulasi-budget" className="hover:text-emerald-700 transition-colors">Simulasi Budget</a>
                <a href="#kuis-ai" className="hover:text-emerald-700 transition-colors">Kuis Diagnosa AI</a>
                <a href="#transparansi-metrik" className="hover:text-emerald-700 transition-colors">Transparansi Metrik</a>
                <a href="#katalog-brand" className="hover:text-emerald-700 transition-colors">Katalog Brand</a>
              </nav>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Mahasiswa & Riset
              </span>
              <nav className="flex flex-col gap-1.5 text-xs text-slate-500">
                <Link href="/rekomendasi/budget" className="hover:text-emerald-700 transition-colors">Kuis Rekomendasi</Link>
                <Link href="/bandingkan" className="hover:text-emerald-700 transition-colors">Komparasi Spek</Link>
                <a href="https://github.com/Nourivex/Speco" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 transition-colors">
                  GitHub Nourivex/Speco
                </a>
                <span className="text-slate-400">TIM SPECO (Kelompok 7A)</span>
              </nav>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 SPECO Indonesia. Rekayasa Perangkat Lunak - Universitas Harkat Negeri.</p>
            <span className="text-slate-400">Terhubung dengan Database 450 Laptop & Supabase Cloud</span>
          </div>
        </div>
      </footer>

      {/* ==============================================================================
          9. MODALS & DRAWERS (⌘K, RIWAYAT, QUICK SPEK, BRAND)
      ============================================================================== */}
      <SearchPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLaptop={(laptop) => {
          setIsSearchOpen(false);
          setQuickViewLaptop(laptop);
        }}
        onToggleBookmark={toggleBookmark}
        isBookmarked={isBookmarked}
      />

      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarkedList}
        onRemoveBookmark={removeBookmarkById}
        onClearAll={clearAllBookmarks}
        onSelectLaptop={(laptop) => {
          setIsBookmarksOpen(false);
          setQuickViewLaptop(laptop);
        }}
      />

      <LaptopQuickModal
        laptop={quickViewLaptop}
        isOpen={Boolean(quickViewLaptop)}
        onClose={() => setQuickViewLaptop(null)}
        isBookmarked={quickViewLaptop ? isBookmarked(quickViewLaptop.ID_Perangkat) : false}
        onToggleBookmark={() => {
          if (quickViewLaptop) toggleBookmark(quickViewLaptop);
        }}
      />

      <BrandModal
        brand={selectedBrandModal}
        isOpen={Boolean(selectedBrandModal)}
        onClose={() => setSelectedBrandModal(null)}
        onSelectLaptop={(laptop) => {
          setSelectedBrandModal(null);
          setQuickViewLaptop(laptop);
        }}
        onToggleBookmark={toggleBookmark}
        isBookmarked={isBookmarked}
      />
    </div>
  );
}
