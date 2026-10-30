"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/ssr/BookmarkSimple";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { formatRupiah } from "@/lib/format";
import { searchCatalog, getLaptopImage, CatalogLaptop } from "@/lib/catalog-service";

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLaptop: (laptop: CatalogLaptop) => void;
  onToggleBookmark: (laptop: CatalogLaptop) => void;
  isBookmarked: (id: string) => boolean;
}

export function SearchPalette({
  isOpen,
  onClose,
  onSelectLaptop,
  onToggleBookmark,
  isBookmarked,
}: SearchPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [activeQuickFilter, setActiveQuickFilter] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input saat terbuka
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // Kosongkan pencarian setiap kali palet ditutup.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setActiveQuickFilter(null);
    }
  }, [isOpen]);

  // Listener tombol Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Hitung hasil pencarian
  const searchResults = React.useMemo(() => {
    let effectiveQuery = query;
    if (activeQuickFilter) {
      effectiveQuery = `${query} ${activeQuickFilter}`.trim();
    }
    return searchCatalog(effectiveQuery, 25);
  }, [query, activeQuickFilter]);

  if (!isOpen) return null;

  const quickFilters = [
    { label: "Di bawah Rp7 Jt", term: "4999000" },
    { label: "Lokal ID (Axioo, Advan)", term: "Axioo" },
    { label: "RAM 16GB+", term: "16" },
    { label: "Layar OLED", term: "OLED" },
    { label: "Gaming & RTX", term: "RTX" },
    { label: "ASUS Zenbook", term: "Zenbook" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[85vh]"
        >
          {/* Header Search Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <MagnifyingGlassIcon className="w-5 h-5 text-emerald-700 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari laptop, prosesor (Ryzen, i5), brand, atau budget..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-200 text-[10px] font-mono text-slate-600 font-semibold border border-slate-300">
              ESC
            </kbd>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 overflow-x-auto scrollbar-none bg-white">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Filter Cepat:
            </span>
            {quickFilters.map((qf) => {
              const active = activeQuickFilter === qf.term;
              return (
                <button
                  key={qf.label}
                  onClick={() => {
                    setActiveQuickFilter(active ? null : qf.term);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {qf.label}
                </button>
              );
            })}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
            {searchResults.length === 0 ? (
              <div className="text-center py-12 px-4">
                <SparkleIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Tidak ada laptop yang cocok</p>
                <p className="text-xs text-slate-400 mt-1">
                  Coba kata kunci lain seperti “Ryzen 5”, “Axioo”, “Zenbook”, atau “16GB”.
                </p>
              </div>
            ) : (
              searchResults.map((item) => {
                const bookmarked = isBookmarked(item.ID_Perangkat);
                const imgSrc = getLaptopImage(item);
                const isLocal = ["Axioo", "Advan", "Zyrex"].includes(item.Brand);

                return (
                  <div
                    key={item.ID_Perangkat}
                    className="group flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-emerald-50/50 transition-colors cursor-pointer"
                    onClick={() => onSelectLaptop(item)}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Image Thumbnail */}
                      <div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                          src={imgSrc}
                          alt={item.Model_Seri}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/laptops/mainstream-silver-34.webp";
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 truncate">
                            {item.Brand} {item.Model_Seri}
                          </span>
                          {isLocal && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider shrink-0">
                              Lokal ID
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 truncate">
                          <span className="truncate">{item.Processor_CPU}</span>
                          <span>•</span>
                          <span>RAM {item.RAM_GB}GB</span>
                          <span>•</span>
                          <span className="truncate">{item.Layar_Ukuran_Panel_ColorGamut}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-800 block">
                          {formatRupiah(item.numericPrice)}
                        </span>
                        <span className="text-[10px] text-slate-400">Garansi {item.Status_Garansi_Resmi || "Resmi"}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(item);
                        }}
                        className={`p-2 rounded-lg border transition-all ${
                          bookmarked
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-white text-slate-400 border-slate-200 hover:text-emerald-700 hover:bg-slate-50"
                        }`}
                        title={bookmarked ? "Hapus dari Riwayat" : "Simpan ke Riwayat"}
                      >
                        <BookmarkSimpleIcon weight={bookmarked ? "fill" : "regular"} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Katalog Resmi: 450 Laptop Mahasiswa 2026</span>
            <div className="flex items-center gap-3">
              <span>Klik laptop untuk melihat rincian spesifikasi & toko</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
