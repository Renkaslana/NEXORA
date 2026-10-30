"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr/GithubLogo";
import { DatabaseIcon } from "@phosphor-icons/react/dist/ssr/Database";
import { CodeIcon } from "@phosphor-icons/react/dist/ssr/Code";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { BookOpenTextIcon } from "@phosphor-icons/react/dist/ssr/BookOpenText";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
import { SignInIcon } from "@phosphor-icons/react/dist/ssr/SignIn";
import { UserPlusIcon } from "@phosphor-icons/react/dist/ssr/UserPlus";
import { UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { getCurrentUser, signOutUser } from "@/lib/supabase";

interface UserProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSetInformatikaPreset: () => void;
  currentUser?: {
    name: string;
    email: string;
    role: "admin" | "mahasiswa" | "guest";
  } | null;
  onLogout?: () => void;
}

export function UserProfileMenu({
  isOpen,
  onClose,
  onSetInformatikaPreset,
  currentUser,
  onLogout,
}: UserProfileMenuProps) {
  const router = useRouter();
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isGuest = !currentUser || currentUser.role === "guest";
  const isAdmin = currentUser?.role === "admin";

  const handleLogoutClick = async () => {
    try {
      await signOutUser();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("speco_user_session");
    localStorage.removeItem("speco_admin_session");
    if (onLogout) onLogout();
    onClose();
    router.refresh();
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute top-full right-0 mt-2 w-84 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-4.5 z-50 text-left"
      >
        {/* Header User / Status */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 text-white flex items-center justify-center font-black text-sm shadow-md">
                MA
              </div>
            ) : isGuest ? (
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center font-bold text-sm">
                <UserIcon className="w-5 h-5 text-slate-500" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md">
                {(currentUser.name || "M").slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 leading-none truncate">
                  {isAdmin
                    ? currentUser?.name || "Admin Otoritas"
                    : isGuest
                    ? "Tamu / Mahasiswa"
                    : currentUser.name}
                </span>
                {isAdmin && (
                  <CheckCircleIcon weight="fill" className="text-emerald-600 w-3.5 h-3.5 shrink-0" />
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                {isAdmin
                  ? "Project Lead & Data Engineer"
                  : isGuest
                  ? "Belum masuk ke akun"
                  : currentUser.email}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status Badge & Tim NEXORA */}
        <div className="py-3 space-y-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Status Akses
            </span>
            {isAdmin ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                Admin Otoritas (TIM SPECO 7A)
              </span>
            ) : isGuest ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                Mode Penjelajah Publik
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-200">
                Akun Mahasiswa Aktif
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <DatabaseIcon className="w-3.5 h-3.5 text-emerald-700" />
              Database Supabase
            </span>
            <span className="font-extrabold text-emerald-800">450 Laptop & PC Aktif</span>
          </div>
        </div>

        {/* Action Links */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {isGuest ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={onClose}
                className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <SignInIcon className="w-4 h-4" />
                <span>Masuk</span>
              </Link>
              <Link
                href="/daftar"
                onClick={onClose}
                className="py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <UserPlusIcon className="w-4 h-4 text-slate-600" />
                <span>Daftar</span>
              </Link>
            </div>
          ) : (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-between transition-colors shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                    <span>Portal Admin Database & Export</span>
                  </span>
                  <span className="text-[10px] bg-emerald-600 px-1.5 py-0.5 rounded text-white font-mono">
                    Admin
                  </span>
                </Link>
              )}
            </>
          )}

          {/* Link Dashboard Mahasiswa */}
          <Link
            href="/dashboard"
            onClick={onClose}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 font-bold text-xs flex items-center justify-between transition-colors border border-emerald-200/80"
          >
            <span className="flex items-center gap-2">
              <SparkleIcon className="w-4 h-4 text-emerald-700" />
              <span>Dashboard Mahasiswa & Riwayat</span>
            </span>
            <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded font-mono">
              Siswa
            </span>
          </Link>

          {/* Link Dokumentasi Lengkap Proyek */}
          <Link
            href="/docs"
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 font-bold text-xs flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <BookOpenTextIcon className="w-4 h-4 text-emerald-700" />
              <span>Dokumentasi Lengkap Proyek</span>
            </span>
            <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-mono">
              /docs
            </span>
          </Link>

          {/* Preset Informatika */}
          <button
            onClick={() => {
              onSetInformatikaPreset();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 font-bold text-xs flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <CodeIcon className="w-4 h-4 text-emerald-700" />
              Setel Preferensi Informatika (12 Jt)
            </span>
            <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Preset
            </span>
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/Nourivex/Speco"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <GithubLogoIcon weight="bold" className="w-4 h-4" />
            <span>GitHub Nourivex/Speco</span>
          </a>

          {/* Logout button jika login */}
          {!isGuest && (
            <button
              onClick={handleLogoutClick}
              className="w-full py-2 px-3 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <SignOutIcon className="w-4 h-4" />
              <span>Keluar dari Sesi</span>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
