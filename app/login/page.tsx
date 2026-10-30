"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { LockKeyIcon } from "@phosphor-icons/react/dist/ssr/LockKey";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/ssr/Envelope";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { StudentIcon } from "@phosphor-icons/react/dist/ssr/Student";
import { GoogleLogoIcon } from "@/components/ui/brand-icon";
import {
  signInWithEmail,
  signInWithGoogle,
  isSupabaseConfigured,
  isAdminUser,
  verifyPasskeyFromDatabase,
} from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"mahasiswa" | "admin">("mahasiswa");

  // Mahasiswa Form
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Admin Form
  const [adminKeyOrEmail, setAdminKeyOrEmail] = React.useState("");
  const [adminPass, setAdminPass] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Periksa parameter tab di URL saat mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "admin") {
        // Parameter URL dibaca setelah mount agar render server dan klien tetap sama.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveTab("admin");
      }
    }
  }, []);

  // Handle Login Mahasiswa (Manual)
  const handleMahasiswaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Harap masukkan email dan kata sandi mahasiswa.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }
      }

      // Simpan sesi pengguna
      localStorage.setItem(
        "speco_user_session",
        JSON.stringify({
          name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          email: email,
          role: "mahasiswa",
        })
      );
      router.push("/");
    } catch (err) {
      setErrorMsg((err instanceof Error ? err.message : "") || "Gagal masuk ke sistem.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Login Admin (Manual)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = adminKeyOrEmail.trim();

    if (!val) {
      setErrorMsg("Harap masukkan passkey admin atau email otoritas.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Verifikasi via Passkey dari Database public.admin_passkeys
      const isPasskeyValid = await verifyPasskeyFromDatabase(val);
      if (isPasskeyValid) {
        localStorage.setItem("speco_admin_session", "authorized_lead_affif");
        localStorage.setItem(
          "speco_user_session",
          JSON.stringify({
            name: "Admin Otoritas",
            email: "admin@speco.id",
            role: "admin",
          })
        );
        router.push("/admin");
        return;
      }

      // 2. Verifikasi via Supabase Email & Password
      if (isSupabaseConfigured && adminPass) {
        const { data, error } = await signInWithEmail(val, adminPass);
        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        const isUserAdmin = await isAdminUser(data.user);
        if (isUserAdmin) {
          localStorage.setItem("speco_admin_session", "authorized_lead_affif");
          localStorage.setItem(
            "speco_user_session",
            JSON.stringify({
              name: data.user?.user_metadata?.full_name || "Muhammad Affif",
              email: data.user?.email || val,
              role: "admin",
            })
          );
          router.push("/admin");
          return;
        } else {
          setErrorMsg("Akun ini tidak memiliki hak akses administrator.");
          setLoading(false);
          return;
        }
      }

      setErrorMsg("Passkey admin tidak cocok dengan data di database.");
    } catch (err) {
      setErrorMsg((err instanceof Error ? err.message : "") || "Gagal verifikasi admin.");
    } finally {
      setLoading(false);
    }
  };

  // Login via Google OAuth Mahasiswa
  const handleGoogleLoginMahasiswa = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg((err instanceof Error ? err.message : "") || "Gagal masuk dengan Google.");
      setLoading(false);
    }
  };

  // Login via Google OAuth Admin
  const handleGoogleLoginAdmin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle(`${window.location.origin}/admin`);
    } catch (err) {
      setErrorMsg((err instanceof Error ? err.message : "") || "Gagal masuk dengan Google Admin.");
      setLoading(false);
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
          Masuk ke SPECO Portal
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-500">
          Pilih portal login sesuai peranmu: Mahasiswa atau Admin Proyek.
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 p-1 bg-slate-200/80 rounded-2xl flex items-center max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab("mahasiswa");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "mahasiswa"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <StudentIcon className="w-4 h-4 text-emerald-700" />
            <span>Mahasiswa</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("admin");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "admin"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
            <span>Admin & Lead</span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-slate-200 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: LOGIN MAHASISWA */}
          {activeTab === "mahasiswa" && (
            <>
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLoginMahasiswa}
                disabled={loading}
                className="w-full h-11 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer"
              >
                <GoogleLogoIcon className="w-4 h-4" />
                <span>Masuk dengan Akun Google Kampus</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-500 font-semibold">Atau via Email & Password</span>
                </div>
              </div>

              <form onSubmit={handleMahasiswaLogin} className="space-y-4">
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
                      placeholder="nama@mhs.harkatnegeri.ac.id"
                      className="w-full h-11 px-3.5 pl-10 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                    />
                    <EnvelopeIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
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
                  className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs tracking-wide transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Masuk sebagai Mahasiswa</span>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-500">
                Belum memiliki akun?{" "}
                <Link href="/daftar" className="font-extrabold text-emerald-800 hover:underline">
                  Daftar Sekarang
                </Link>
              </div>
            </>
          )}

          {/* TAB 2: LOGIN ADMIN & LEAD */}
          {activeTab === "admin" && (
            <>
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-400">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Area Khusus Otoritas TIM SPECO</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Login resmi menggunakan akun Google terdaftar Supabase atau kredensial Project Lead untuk mengakses Dashboard Manajemen 450 Laptop.
                </p>
              </div>

              {/* Google OAuth Admin Button */}
              <button
                type="button"
                onClick={handleGoogleLoginAdmin}
                disabled={loading}
                className="w-full h-11 rounded-xl border-2 border-slate-900 hover:bg-slate-50 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer"
              >
                <GoogleLogoIcon className="w-4 h-4" />
                <span>Masuk dengan Google (Akun Admin)</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-500 font-semibold">Atau Masuk dengan Kredensial / Passkey</span>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Passkey Admin atau Email Otoritas
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={adminKeyOrEmail}
                      onChange={(e) => setAdminKeyOrEmail(e.target.value)}
                      placeholder="Masukkan passkey admin atau email..."
                      className="w-full h-11 px-3.5 pl-10 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all font-mono"
                    />
                    <LockKeyIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs tracking-wide transition-all shadow-md shadow-slate-950/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                      <span>Verifikasi & Masuk Dashboard</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span>•</span>
          <Link
            href="/docs"
            className="hover:text-emerald-800 transition-colors"
          >
            Dokumentasi Proyek (/docs)
          </Link>
        </div>
      </div>
    </div>
  );
}
