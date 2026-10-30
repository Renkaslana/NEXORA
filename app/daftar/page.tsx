"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { LockKeyIcon } from "@phosphor-icons/react/dist/ssr/LockKey";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/ssr/Envelope";
import { UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { GoogleLogoIcon } from "@/components/ui/brand-icon";
import { signUpWithEmail, signInWithGoogle, isSupabaseConfigured } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMsg("Harap lengkapi semua kolom pendaftaran.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (!isSupabaseConfigured) {
        setSuccessMsg("Akun berhasil dibuat (mode offline). Mengalihkan...");
        setTimeout(() => router.push("/login"), 1200);
        return;
      }
      const { data, error } = await signUpWithEmail(email, password, fullName);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Pendaftaran berhasil! Akunmu sudah aktif.");
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch (err) {
      setErrorMsg((err instanceof Error ? err.message : "") || "Gagal mendaftar akun baru.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg((err instanceof Error ? (err instanceof Error ? err.message : "") : "") || "Gagal masuk dengan Google.");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased selection:bg-emerald-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Official SPECO Logo */}
        <Link href="/" className="inline-flex items-center justify-center mb-5 hover:opacity-95 transition-opacity">
          <Image
            src="/brand/speco-logo.png"
            alt="SPECO Indonesia"
            width={140}
            height={50}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        <h2 className="text-center text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Buat Akun Mahasiswa
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-500">
          Dapatkan rekomendasi spek terpersonalisasi sesuai jurusan dan kampusmu.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-slate-200 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold leading-relaxed">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold leading-relaxed">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Muhammad Affif"
                  className="w-full h-11 px-3.5 pl-10 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alamat Email Mahasiswa
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="affif@mhs.dinus.ac.id"
                  className="w-full h-11 px-3.5 pl-10 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                />
                <EnvelopeIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi (Minimal 6 Karakter)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pl-10 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                />
                <LockKeyIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? "Mendaftarkan..." : "Daftar Akun Baru"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-500 font-semibold">Atau daftar dengan</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-11 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-2xs"
          >
            <GoogleLogoIcon className="w-4 h-4" />
            <span>Akun Google Kampus</span>
          </button>

          <div className="pt-2 text-center text-xs text-slate-500">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-extrabold text-emerald-800 hover:underline">
              Masuk di Sini
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
