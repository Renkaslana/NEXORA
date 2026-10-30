"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/ssr/BookmarkSimple";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { formatRupiah } from "@/lib/format";
import { getLaptopImage, CatalogLaptop } from "@/lib/catalog-service";

interface LaptopQuickModalProps {
  laptop: CatalogLaptop | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export function LaptopQuickModal({
  laptop,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
}: LaptopQuickModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !laptop) return null;

  const imgSrc = getLaptopImage(laptop);
  const isLocal = ["Axioo", "Advan", "Zyrex"].includes(laptop.Brand);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-800 tracking-wider uppercase">
                {laptop.Brand}
              </span>
              {isLocal && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Brand Lokal Indonesia
                </span>
              )}
              {laptop.Kategori_Target && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200/80 text-slate-700">
                  {laptop.Kategori_Target}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Top Showcase: Image + Title + Price */}
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              <div className="w-48 h-40 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0 p-3 flex items-center justify-center overflow-hidden shadow-2xs">
                <img
                  src={imgSrc}
                  alt={laptop.Model_Seri}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/laptops/mainstream-silver-34.webp";
                  }}
                />
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                  {laptop.Brand} {laptop.Model_Seri}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{laptop.Rekomendasi_UseCase_Tag || "Laptop Kuliah & Produktivitas"}</p>

                <div className="mt-3 flex flex-wrap items-baseline gap-2 justify-center sm:justify-start">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">
                    {formatRupiah(laptop.numericPrice)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    Garansi: {laptop.Status_Garansi_Resmi || "Resmi 1-2 Tahun"}
                  </span>
                </div>

                {laptop.Target_Mahasiswa_Jurusan && (
                  <p className="text-xs text-slate-600 mt-2 bg-slate-100/70 p-2 rounded-lg">
                    <span className="font-bold text-slate-800">Target Jurusan:</span> {laptop.Target_Mahasiswa_Jurusan}
                  </p>
                )}
              </div>
            </div>

            {/* Spesifikasi Grid */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <CpuIcon className="w-4 h-4 text-emerald-700" />
                Spesifikasi Teknis
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Prosesor (CPU)</span>
                  <span className="font-bold text-slate-900 mt-0.5">{laptop.Processor_CPU}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Kartu Grafis (GPU)</span>
                  <span className="font-bold text-slate-900 mt-0.5">{laptop.Kartu_Grafis_GPU}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">RAM & Upgradeability</span>
                  <span className="font-bold text-slate-900 mt-0.5">
                    {laptop.RAM_GB} GB RAM (Upgradeable: {laptop.Upgradeable_RAM})
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Penyimpanan (Storage)</span>
                  <span className="font-bold text-slate-900 mt-0.5">{laptop.Storage_GB_Tipe}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Layar & Panel</span>
                  <span className="font-bold text-slate-900 mt-0.5">{laptop.Layar_Ukuran_Panel_ColorGamut}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Bobot Perangkat</span>
                  <span className="font-bold text-slate-900 mt-0.5">{laptop.Bobot_kg} kg</span>
                </div>
              </div>
            </div>

            {/* Pros & Cons */}
            {(laptop.Pros_Kelebihan || laptop.Cons_Kekurangan) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {laptop.Pros_Kelebihan && (
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                      <CheckCircleIcon weight="fill" className="text-emerald-700 w-4 h-4" />
                      Kelebihan Utama
                    </span>
                    <p className="text-slate-700 leading-relaxed">{laptop.Pros_Kelebihan}</p>
                  </div>
                )}
                {laptop.Cons_Kekurangan && (
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                      <WarningCircleIcon weight="fill" className="text-amber-700 w-4 h-4" />
                      Hal yang Perlu Diperhatikan
                    </span>
                    <p className="text-slate-700 leading-relaxed">{laptop.Cons_Kekurangan}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={onToggleBookmark}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isBookmarked
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              <BookmarkSimpleIcon weight={isBookmarked ? "fill" : "regular"} className="w-4 h-4 text-emerald-700" />
              <span>{isBookmarked ? "Tersimpan di Riwayat" : "Simpan ke Riwayat"}</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/bandingkan"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold text-center"
              >
                Buka Komparasi
              </Link>
              <a
                href={laptop.Link_Gambar && laptop.Link_Gambar.startsWith("http") ? laptop.Link_Gambar : "https://www.tokopedia.com/search?q=" + encodeURIComponent(`${laptop.Brand} ${laptop.Model_Seri}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>Cek di Toko Resmi</span>
                <ArrowSquareOutIcon weight="bold" className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
