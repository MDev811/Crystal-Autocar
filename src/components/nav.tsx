"use client";

/**
 * Navigasi utama aplikasi Showroom Crystal Autocar:
 * - Mobile Bottom Navigation Bar (Mobile-first, touch-friendly, glassmorphism)
 * - Header atas dengan profil & logout
 * - Modal Action Sheet "Tambah Cepat" (Tambah Mobil Baru, Pengeluaran Operasional)
 * - Dukungan status penguncian fitur sesuai Laporan Progres Minggu 4
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Home,
  Car,
  Plus,
  BarChart3,
  User,
  LogOut,
  X,
  Receipt,
  CarFront,
} from "lucide-react";
import { Logo, cn } from "./ui";
import { logoutAction } from "@/actions/auth";
import { LockedFeatureModal, type LockedFeatureInfo } from "./locked-modal";

export function TopNavbar({ username, nama }: { username: string; nama: string }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:opacity-90 transition">
            <Logo compact={false} />
          </Link>
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-crystal-400/30 bg-crystal-500/10 px-2.5 py-0.5 text-[10px] font-bold text-crystal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-crystal-400 animate-pulse" />
            Sprint 1 Review (Minggu 4)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">{nama}</span>
            <span className="text-[10px] text-slate-400">@{username}</span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Keluar"
              aria-label="Keluar"
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 transition active:scale-95"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

export function BottomNavbar() {
  const pathname = usePathname();
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [lockedModalInfo, setLockedModalInfo] = useState<LockedFeatureInfo | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 overflow-visible border-t border-white/10 bg-slate-950/80 backdrop-blur-2xl pb-safe">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2 overflow-visible">
          {/* 1. Beranda */}
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium transition-all duration-200 active:scale-95",
              isActive("/")
                ? "text-crystal-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Home className={cn("h-5 w-5 mb-0.5", isActive("/") && "stroke-[2.3]")} />
            <span>Beranda</span>
          </Link>

          {/* 2. Stok Mobil */}
          <Link
            href="/mobil"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium transition-all duration-200 active:scale-95",
              isActive("/mobil")
                ? "text-crystal-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Car className={cn("h-5 w-5 mb-0.5", isActive("/mobil") && "stroke-[2.3]")} />
            <span>Stok</span>
          </Link>

          {/* 3. Action Sheet: Tambah Cepat */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickAction(true);
            }}
            aria-label="Tambah Transaksi Cepat"
            className="-mt-5 relative z-50 flex flex-col items-center justify-center group focus:outline-none cursor-pointer pointer-events-auto touch-manipulation select-none"
          >
            <div className="grid h-12 w-12 place-items-center rounded-full bg-crystal text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.5)] group-hover:scale-105 active:scale-95 transition-transform duration-200 pointer-events-auto">
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </div>
            <span className="mt-1 text-[10px] font-semibold text-crystal-300">
              Tambah
            </span>
          </button>

          {/* 4. Laporan */}
          <Link
            href="/laporan"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium transition-all duration-200 active:scale-95",
              isActive("/laporan")
                ? "text-crystal-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <BarChart3 className={cn("h-5 w-5 mb-0.5", isActive("/laporan") && "stroke-[2.3]")} />
            <span>Laporan</span>
          </Link>

          {/* 5. Akun */}
          <Link
            href="/akun"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium transition-all duration-200 active:scale-95",
              isActive("/akun")
                ? "text-crystal-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <User className={cn("h-5 w-5 mb-0.5", isActive("/akun") && "stroke-[2.3]")} />
            <span>Akun</span>
          </Link>
        </div>
      </nav>

      {/* Quick Action Modal / Bottom Sheet rendered directly to body */}
      {showQuickAction && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-up">
          <div
            className="fixed inset-0"
            onClick={() => setShowQuickAction(false)}
            aria-hidden
          />
          <div className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl border border-white/15 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-2xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Tambah Cepat</h3>
                <p className="text-[11px] text-slate-400">Pilih jenis transaksi showroom</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAction(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {/* Opsi 1: Beli Mobil Baru (Aktif - Sprint 1) */}
              <Link
                href="/mobil/tambah"
                onClick={() => setShowQuickAction(false)}
                className="flex items-center gap-3.5 rounded-2xl border border-crystal-500/30 bg-crystal-500/10 p-3.5 hover:bg-crystal-500/20 transition group"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-crystal text-slate-950 group-hover:scale-105 transition shadow">
                  <CarFront className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    Beli Mobil Baru
                    <span className="rounded bg-crystal-400/20 px-1.5 py-0.2 text-[9px] font-bold text-crystal-300">
                      Sprint 1 ✓
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Input unit masuk & harga beli modal (HPP)
                  </div>
                </div>
              </Link>

              {/* Opsi 2: Biaya Operasional (Aktif - Sprint 3) */}
              <Link
                href="/operasional?tambah=1"
                onClick={() => setShowQuickAction(false)}
                className="flex items-center gap-3.5 rounded-2xl border border-crystal-500/30 bg-crystal-500/10 p-3.5 hover:bg-crystal-500/20 transition group"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-crystal text-slate-950 group-hover:scale-105 transition shadow">
                  <Receipt className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    Biaya Operasional
                    <span className="rounded bg-crystal-400/20 px-1.5 py-0.2 text-[9px] font-bold text-crystal-300">
                      Sprint 3 ✓
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Beban listrik, iklan, internet, sewa tempat
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Penjelasan Fitur Terkunci */}
      {lockedModalInfo && (
        <LockedFeatureModal
          isOpen={true}
          onClose={() => setLockedModalInfo(null)}
          info={lockedModalInfo}
        />
      )}
    </>
  );
}

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { username: string; nama: string };
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavbar username={user.username} nama={user.nama} />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 pt-4 pb-28">
        {children}
      </main>
      <BottomNavbar />
    </div>
  );
}
