"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/ssr/BookmarkSimple";
import { formatRupiah } from "@/lib/format";
import { catalogLaptops, getLaptopImage, CatalogLaptop } from "@/lib/catalog-service";

interface BrandModalProps {
  brand: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectLaptop: (laptop: CatalogLaptop) => void;
  onToggleBookmark: (laptop: CatalogLaptop) => void;
  isBookmarked: (id: string) => boolean;
}

export function BrandModal({
  brand,
  isOpen,
  onClose,
  onSelectLaptop,
  onToggleBookmark,
  isBookmarked,
}: BrandModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !brand) return null;

  const brandLaptops = catalogLaptops
    .filter((l) => l.Brand.toLowerCase() === brand.toLowerCase())
    .sort((a, b) => a.numericPrice - b.numericPrice);

  const isLocal = ["Axioo", "Advan", "Zyrex"].includes(brand);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-base">
                {brand.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">{brand}</h3>
                  {isLocal && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      Brand Lokal Indonesia
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {brandLaptops.length} model terdaftar di katalog SPECO 2026
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Body List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {brandLaptops.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Tidak ada data laptop untuk brand ini.
              </div>
            ) : (
              brandLaptops.map((item) => {
                const bookmarked = isBookmarked(item.ID_Perangkat);
                const imgSrc = getLaptopImage(item);
                return (
                  <div
                    key={item.ID_Perangkat}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    onClick={() => {
                      onSelectLaptop(item);
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 shrink-0 p-1 flex items-center justify-center overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={item.Model_Seri}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/laptops/mainstream-silver-34.webp";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-800">
                          {item.Model_Seri}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.Processor_CPU} • RAM {item.RAM_GB}GB • {item.Layar_Ukuran_Panel_ColorGamut}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-black text-slate-900">
                        {formatRupiah(item.numericPrice)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(item);
                        }}
                        className={`p-2 rounded-lg border transition-all ${
                          bookmarked
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-white text-slate-400 border-slate-200 hover:text-emerald-700"
                        }`}
                      >
                        <BookmarkSimpleIcon weight={bookmarked ? "fill" : "regular"} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
            Klik laptop untuk melihat rincian spesifikasi lengkap dan link toko resmi.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
