import { AppShell } from "@/components/nav";
import { Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { logoutAction } from "@/actions/auth";
import { Database, LogOut, Info, KeyRound } from "lucide-react";
import { LockedButton } from "@/components/locked-modal";
import { LOCKED_FEATURES } from "@/lib/locked-features";

export const metadata = {
  title: "Akun & Pengaturan",
};

export default async function AkunPage() {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <div className="space-y-4 max-w-2xl mx-auto">
        <PageHeader
          title="Akun & Pengaturan"
          subtitle="Profil pengguna, keamanan akun, dan backup basis data"
        />

        {/* Profil Singkat (Aktif - Sprint 1) */}
        <Card className="p-5 rounded-3xl flex items-center gap-4 bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-crystal-500/20">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-crystal text-slate-950 font-black text-xl shadow-lg shadow-crystal-500/25 shrink-0">
            {user.nama.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold text-white truncate">{user.nama}</h2>
            <p className="text-xs text-slate-400">@{user.username} • Hak Akses Pemilik</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Sesi Aktif (Sprint 1 Review)
            </span>
          </div>
        </Card>

        {/* Form Ganti Password (FR-02 - Terkunci, Sprint 5) */}
        <Card className="p-5 rounded-3xl space-y-3 border-white/10">
          <div className="border-b border-white/10 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-crystal-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Ubah Password Akun (FR-02)
              </h2>
            </div>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
              Sprint 5 🔒
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Fitur penggantian kata sandi mandiri dijadwalkan pada Sprint 5. Untuk sesi demo dan pengujian Sprint 1, akun default <strong className="text-white">pemilik</strong> dapat digunakan secara langsung.
          </p>
          <div className="pt-1">
            <LockedButton info={LOCKED_FEATURES.gantiPassword} size="sm" variant="outline">
              Ubah Password
            </LockedButton>
          </div>
        </Card>

        {/* Backup Database (NFR-07 / FR-18 - Terkunci, Sprint 5) */}
        <Card className="p-5 rounded-3xl space-y-3 border-white/10">
          <div className="border-b border-white/10 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-crystal-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Backup Basis Data (NFR-07 / FR-18)
              </h2>
            </div>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
              Sprint 5 🔒
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Pengunduhan salinan basis data SQLite (<code className="text-crystal-300">crystal-autocar.db</code>) dan otomatisasi arsip dijadwalkan untuk disempurnakan pada Sprint 5 (Minggu 8).
          </p>
          <div className="pt-1">
            <LockedButton info={LOCKED_FEATURES.backup} size="sm" variant="outline">
              Unduh Berkas Backup SQLite
            </LockedButton>
          </div>
        </Card>

        {/* Informasi Sistem & Spesifikasi Tugas SMT 7 */}
        <Card className="p-5 rounded-3xl space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-white font-bold mb-1">
            <Info className="h-4 w-4 text-crystal-400" /> Tentang Sistem
          </div>
          <p>
            Aplikasi Web-Based Pengelolaan Keuangan Jual Beli Mobil Bekas pada{" "}
            <strong className="text-white">Showroom Crystal Autocar</strong>.
          </p>
          <div className="pt-2 text-[11px] text-slate-500 space-y-0.5">
            <div>Framework: Next.js (App Router) + Tailwind CSS v4</div>
            <div>Basis Data: SQLite (Built-in Node.js Engine)</div>
            <div>Tahap Progres: Sprint 1 Review / Prototype Awal (Minggu 4)</div>
            <div>Kelompok: Kelompok F (Geys, Mirza, Rafi)</div>
          </div>
        </Card>

        {/* Tombol Logout */}
        <div className="pt-2">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 py-3 text-xs font-bold text-rose-300 hover:bg-rose-500/20 active:scale-95 transition"
            >
              <LogOut className="h-4 w-4" /> Keluar dari Aplikasi
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
