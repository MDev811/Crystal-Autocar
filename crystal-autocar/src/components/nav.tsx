"use client";

/**
 * Navigasi utama aplikasi Showroom Crystal Autocar:
 * - Mobile Bottom Navigation Bar (Mobile-first, touch-friendly, glassmorphism)
 * - Header atas dengan profil & logout
 * - Modal Action Sheet "Tambah Cepat" (Tambah Mobil Baru, Pengeluaran Operasional)
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Car,
  PlusCircle,
  BarChart3,
  User,
  LogOut,
  X,
  Plus,
  Receipt,
  CarFront,
} from "lucide-react";
import { Logo, cn } from "./ui";
import { logoutAction } from "@/actions/auth";

export function TopNavbar({ username, nama }: { username: string; nama: string }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="hover:opacity-90 transition">
          <Logo compact={false} />
        </Link>
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

  const navItems = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/mobil", label: "Stok", icon: Car },
    {
      isAction: true,
      label: "Tambah",
      icon: Plus,
      onClick: () => setShowQuickAction(true),
    },
    { href: "/laporan", label: "Laporan", icon: BarChart3 },
    { href: "/akun", label: "Akun", icon: User },
  ];

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/80 backdrop-blur-2xl pb-safe">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {navItems.map((item, idx) => {
            if (item.isAction) {
              return (
                <button
                  key="quick-action"
                  onClick={item.onClick}
                  aria-label="Tambah Transaksi Cepat"
                  className="-mt-5 flex flex-col items-center justify-center group focus:outline-none"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-crystal text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.5)] group-hover:scale-105 transition-transform duration-200 active:scale-95">
                    <Plus className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <span className="mt-1 text-[10px] font-semibold text-crystal-300">
                    {item.label}
                  </span>
                </button>
              );
            }

            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium transition-all duration-200 active:scale-95",
                  active
                    ? "text-crystal-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-5 w-5 mb-0.5", active && "stroke-[2.3]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Action Modal / Bottom Sheet */}
      {showQuickAction && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-up">
          <div
            className="fixed inset-0"
            onClick={() => setShowQuickAction(false)}
            aria-hidden
          />
          <div className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl border border-white/15 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-2xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Tambah Cepat</h3>
              <button
                onClick={() => setShowQuickAction(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              <Link
                href="/mobil/tambah"
                onClick={() => setShowQuickAction(false)}
                className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 hover:bg-crystal-500/10 hover:border-crystal-400/30 transition group"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-crystal-500/20 text-crystal-300 group-hover:scale-105 transition">
                  <CarFront className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100">Beli Mobil Baru</div>
                  <div className="text-xs text-slate-400">
                    Input unit masuk & harga beli modal (HPP)
                  </div>
                </div>
              </Link>

              <Link
                href="/operasional"
                onClick={() => setShowQuickAction(false)}
                className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 hover:bg-amethyst-500/10 hover:border-amethyst-400/30 transition group"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-amethyst-500/20 text-amethyst-300 group-hover:scale-105 transition">
                  <Receipt className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100">Biaya Operasional</div>
                  <div className="text-xs text-slate-400">
                    Catat beban listrik, iklan, internet, dll.
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
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
