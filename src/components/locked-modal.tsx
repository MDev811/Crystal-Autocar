"use client";

import { useState } from "react";
import { Lock, X, ArrowLeft, Calendar, Info, Receipt, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { cn } from "./ui";

export interface LockedFeatureInfo {
  title: string;
  featureName: string;
  sprint: string;
  week: string;
  description: string;
  reqCode?: string; // FR code, e.g. "FR-09 s.d. FR-12"
}

export function LockedFeatureModal({
  isOpen,
  onClose,
  info,
}: {
  isOpen: boolean;
  onClose: () => void;
  info: LockedFeatureInfo;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-up">
      <div className="fixed inset-0" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-amber-500/30 bg-slate-900/98 p-6 shadow-2xl backdrop-blur-2xl z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                <Calendar className="h-3 w-3" /> {info.sprint} ({info.week})
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {info.title || "Fitur Dalam Pengembangan"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Modul Fitur:</span>
            <span className="font-semibold text-white">{info.featureName}</span>
          </div>
          {info.reqCode && (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Kode Kebutuhan:</span>
              <span className="font-mono font-bold text-crystal-300">{info.reqCode}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Status Saat Ini:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Terkunci (Tahap Pengembangan)
            </span>
          </div>

          <div className="border-t border-white/10 pt-2.5 mt-2.5 text-slate-300 leading-relaxed text-[11px]">
            {info.description}
          </div>
        </div>

        <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-[11px] text-sky-200 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
          <span>
            Berdasarkan <strong>Laporan Progres Minggu 4 (Sprint 1)</strong>, aplikasi saat ini berfokus pada fondasi: Login, Beranda dasar, Kelola Stok & Tambah Beli Mobil, serta Kalkulator HPP Modal.
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full rounded-2xl bg-white/10 hover:bg-white/15 py-3 text-xs font-bold text-white transition active:scale-95"
        >
          Mengerti & Tutup
        </button>
      </div>
    </div>
  );
}

/**
 * Tombol yang menampilkan status terkunci dan membuka modal penjelasan
 */
export function LockedButton({
  info,
  children,
  className,
  size = "md",
  variant = "locked",
}: {
  info: LockedFeatureInfo;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "locked" | "outline" | "danger" | "success";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "relative group inline-flex items-center justify-center gap-1.5 rounded-2xl font-bold transition active:scale-95 select-none",
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-3.5 py-2 text-xs",
          size === "lg" && "px-4 py-2.5 text-xs sm:text-sm",
          variant === "locked" && "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
          variant === "outline" && "border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10",
          variant === "success" && "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300/80 hover:bg-emerald-500/20",
          className
        )}
        title={`${info.featureName} - Terkunci (${info.sprint})`}
      >
        <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
        <span>{children || info.featureName}</span>
        <span className="hidden group-hover:inline-block ml-1 rounded bg-black/40 px-1 py-0.2 text-[9px] uppercase tracking-wide text-amber-300">
          {info.sprint}
        </span>
      </button>

      <LockedFeatureModal isOpen={open} onClose={() => setOpen(false)} info={info} />
    </>
  );
}

/**
 * Item menu quick action yang terkunci
 */
export function LockedQuickActionItem({
  info,
  icon: Icon,
  subtitle,
  badge,
}: {
  info: LockedFeatureInfo;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  badge?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 transition group"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative grid h-11 w-11 place-items-center rounded-xl bg-slate-800 text-slate-400 group-hover:text-amber-300 transition shrink-0">
            <Icon className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-slate-950 shadow">
              <Lock className="h-2.5 w-2.5 stroke-[2.5]" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-200 group-hover:text-white truncate">
                {info.featureName}
              </span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30 shrink-0">
                {badge || info.sprint} 🔒
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate">
              {subtitle || "Fitur dijadwalkan pada sprint berikutnya"}
            </div>
          </div>
        </div>
      </button>

      <LockedFeatureModal isOpen={open} onClose={() => setOpen(false)} info={info} />
    </>
  );
}

/**
 * Kartu grid beranda yang terkunci di mobile
 */
export function LockedHomeGridItem({
  info,
  iconType,
  label,
  children,
}: {
  info: LockedFeatureInfo;
  iconType?: "operasional" | "laporan";
  label: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex flex-col items-center justify-center p-3 rounded-2xl glass text-center hover:bg-white/10 active:scale-95 transition group"
      >
        <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-slate-400 mb-1.5 border border-white/10 group-hover:border-amber-500/40 group-hover:text-amber-300 transition">
          {children ? (
            children
          ) : iconType === "operasional" ? (
            <Receipt className="h-5 w-5" />
          ) : (
            <FileSpreadsheet className="h-5 w-5" />
          )}
          <div className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-slate-950 shadow">
            <Lock className="h-2.5 w-2.5 stroke-[2.5]" />
          </div>
        </div>
        <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">
          {label}
        </span>
        <span className="text-[9px] text-amber-400 font-medium">{info.sprint}</span>
      </button>

      <LockedFeatureModal isOpen={open} onClose={() => setOpen(false)} info={info} />
    </>
  );
}

/**
 * Halaman penuh untuk rute yang diakses langsung via URL saat statusnya locked
 */
export function LockedPageNotice({
  info,
  backHref = "/",
  backLabel = "Kembali ke Beranda",
}: {
  info: LockedFeatureInfo;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="max-w-xl mx-auto py-8 px-4 text-center space-y-6 animate-fade-up">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
        <Lock className="h-10 w-10 stroke-[2]" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
          <Calendar className="h-3.5 w-3.5" />
          <span>Status: Terkunci • {info.sprint} ({info.week})</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          {info.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          {info.description}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-left space-y-3 glass">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/10 pb-2">
          <Info className="h-4 w-4 text-crystal-400" />
          Keterangan Laporan Progres Minggu 4
        </div>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Modul <strong>{info.featureName}</strong> ({info.reqCode || "-"}) berstatus{" "}
            <span className="text-amber-300 font-semibold">&ldquo;Dalam pengembangan, uji di {info.sprint}&rdquo;</span>.
          </p>
          <p className="text-slate-400 text-[11px]">
            Sesuai dokumen sprint, capaian yang dilaporkan dan didemokan pada <strong>Sprint 1 (Minggu 4)</strong> difokuskan pada fondasi:
          </p>
          <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1 pl-1">
            <li>Autentikasi & login pemilik (FR-01)</li>
            <li>Beranda ringkasan stok aktif dan nilai aset (FR-17)</li>
            <li>Daftar stok mobil, pencarian, dan filter status (FR-03, FR-04, FR-05)</li>
            <li>Form beli mobil beserta komisi calo (FR-06)</li>
            <li>Kalkulator Total Modal (HPP Unit) otomatis (FR-07, FR-08)</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-2xl bg-crystal text-slate-950 font-bold px-5 py-2.5 text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-crystal-500/20 transition active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>
        <Link
          href="/mobil"
          className="inline-flex items-center gap-2 rounded-2xl glass text-slate-200 font-bold px-5 py-2.5 text-xs sm:text-sm hover:bg-white/10 transition active:scale-95"
        >
          Lihat Stok Mobil
        </Link>
      </div>
    </div>
  );
}
