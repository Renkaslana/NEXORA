import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";

// Header ringkas untuk alur rekomendasi (Wizard, Profil Kebutuhan, dst.): logo + Keluar.
// Menampilkan logo resmi SPECO Indonesia (public/brand/).
export function FlowHeader({
  tone = "emerald",
  back,
}: {
  tone?: "default" | "cobalt" | "emerald";
  back?: { href: string; label?: string };
}) {
  const isEmerald = tone === "emerald";
  const cobalt = tone === "cobalt";
  const logoSrc = isEmerald || cobalt ? "/brand/speco-logo-white.png" : "/brand/speco-logo.png";

  return (
    <header
      data-tone={tone}
      className={cn(
        isEmerald
          ? "border-b border-emerald-900/60 bg-emerald-950/80 backdrop-blur-md text-white"
          : cobalt
          ? "bg-cobalt-600 text-white"
          : "border-b border-border bg-bg"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
        {/* Official SPECO Logo */}
        <Link href="/" aria-label="SPECO, ke beranda" className="flex items-center gap-2 group">
          <Image
            src={logoSrc}
            alt="SPECO Indonesia"
            width={120}
            height={42}
            priority
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-100 text-emerald-900 uppercase">
            AI
          </span>
        </Link>

        {/* Action Navigation */}
        <nav aria-label="Navigasi alur" className="flex items-center gap-2">
          {back && (
            <Link
              href={back.href}
              className={cn(
                "group inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition-colors",
                isEmerald
                  ? "text-emerald-200 hover:bg-emerald-900/60 hover:text-white"
                  : cobalt
                  ? "text-cobalt-100 hover:bg-cobalt-700 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <ArrowLeftIcon weight="bold" className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true" />
              <span className="sm:hidden">Kembali</span>
              <span className="hidden sm:inline">{back.label ?? "Kembali"}</span>
            </Link>
          )}

          <Link
            href="/"
            className={cn(
              "inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all",
              isEmerald
                ? "bg-emerald-900/40 border border-emerald-700/50 text-emerald-100 hover:bg-emerald-900 hover:text-white"
                : cobalt
                ? "text-cobalt-100 hover:bg-cobalt-700 hover:text-white"
                : "border border-slate-200 px-3.5 text-slate-700 hover:bg-slate-100"
            )}
          >
            <SignOutIcon weight="bold" className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Keluar ke Beranda</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
