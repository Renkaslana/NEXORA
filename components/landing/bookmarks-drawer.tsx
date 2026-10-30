"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowsLeftRight";
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/ssr/BookmarkSimple";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { formatRupiah } from "@/lib/format";
import { getLaptopImage, CatalogLaptop } from "@/lib/catalog-service";

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: CatalogLaptop[];
  onRemoveBookmark: (id: string) => void;
  onClearAll: () => void;
  onSelectLaptop: (laptop: CatalogLaptop) => void;
}

export function BookmarksDrawer({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onClearAll,
  onSelectLaptop,
}: BookmarksDrawerProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <BookmarkSimpleIcon weight="fill" className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Riwayat Laptop Tersimpan</h3>
                  <p className="text-[11px] text-slate-500">{bookmarks.length} laptop dalam daftar pantauanmu</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {bookmarks.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <BookmarkSimpleIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Belum Ada Riwayat Tersimpan</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Klik ikon bookmark pada kartu laptop di simulasi budget atau hasil pencarian untuk menyimpan ke sini.
                  </p>
                </div>
              ) : (
                bookmarks.map((item) => {
                  const imgSrc = getLaptopImage(item);
                  return (
                    <div
                      key={item.ID_Perangkat}
                      className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all group flex flex-col gap-2.5"
                    >
                      <div className="flex items-start gap-3">
                        {/* Image */}
                        <div
                          onClick={() => onSelectLaptop(item)}
                          className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 shrink-0 overflow-hidden cursor-pointer flex items-center justify-center p-1"
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

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                              {item.Brand}
                            </span>
                            <button
                              onClick={() => onRemoveBookmark(item.ID_Perangkat)}
                              className="text-slate-300 hover:text-red-500 p-0.5 transition-colors"
                              title="Hapus dari riwayat"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <h4
                            onClick={() => onSelectLaptop(item)}
                            className="text-xs font-bold text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                          >
                            {item.Model_Seri}
                          </h4>
                          <p className="text-[11px] font-black text-slate-900 mt-0.5">
                            {formatRupiah(item.numericPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Specs pills */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="truncate max-w-[170px]">{item.Processor_CPU}</span>
                        <span className="font-semibold">{item.RAM_GB}GB RAM</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Actions */}
            {bookmarks.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
                <Link
                  href="/bandingkan"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <ArrowsLeftRightIcon weight="bold" className="w-4 h-4" />
                  <span>Bandingkan {bookmarks.length} Laptop di Komparasi</span>
                </Link>

                <button
                  type="button"
                  onClick={onClearAll}
                  className="w-full py-2 text-[11px] font-semibold text-slate-500 hover:text-red-600 transition-colors"
                >
                  Kosongkan Riwayat
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
