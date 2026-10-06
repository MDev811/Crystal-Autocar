import { AppShell } from "@/components/nav";
import { ButtonLink, Card, EmptyState, Money, SectionTitle, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { countByStatus, listCars } from "@/lib/repo/cars";
import { cashTotals, profitMonthly, recentCash, stockReport } from "@/lib/repo/reports";
import { daysBetween, rupiah, rupiahShort, tanggal, todayISO } from "@/lib/format";
import Link from "next/link";
import {
  Car,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  AlertTriangle,
  ChevronRight,
  Clock,
  CarFront,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await requireUser();
  const today = todayISO();
  const currentYear = new Date().getFullYear();
  const currentMonthYM = today.slice(0, 7); // "YYYY-MM"

  // Data aggregasi dashboard
  const statusCounts = countByStatus();
  const stock = stockReport();
  const monthlyProfits = profitMonthly(currentYear);
  const currentMonthProfit =
    monthlyProfits.find((m) => m.bulan === currentMonthYM) ?? {
      laba_bersih: 0,
      unit_terjual: 0,
      omzet: 0,
    };

  // Arus kas bulan ini
  const monthStart = `${currentMonthYM}-01`;
  const monthEnd = `${currentMonthYM}-31`;
  const cashMonth = cashTotals(monthStart, monthEnd);

  // Mobil terbaru di stok & arus kas terkini
  const recentCars = listCars({ status: "aktif", limit: 4 });
  const recentCashEntries = recentCash(5);

  // Cek unit aging / stok lama (> 45 hari)
  const oldStock = stock.rows.filter((c) => c.lama_hari > 45);

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Sambutan & Status Ringkas */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Halo, <span className="text-gradient">{user.nama}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Ringkasan Keuangan Showroom Crystal Autocar hari ini
            </p>
          </div>
          <Link
            href="/mobil/tambah"
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-crystal px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-crystal-500/20"
          >
            <Plus className="h-4 w-4" /> Beli Mobil Baru
          </Link>
        </div>

        {/* Peringatan Stok Mengendap / Lama */}
        {oldStock.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-white">Perhatian: {oldStock.length} Unit Mengendap &gt; 45 Hari</span>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                Unit seperti {oldStock[0].merek} {oldStock[0].tipe} ({oldStock[0].nopol}) sudah {oldStock[0].lama_hari} hari di showroom. Pertimbangkan penyesuaian harga atau promosi.
              </p>
            </div>
            <Link
              href="/laporan"
              className="text-[11px] font-bold text-amber-300 underline underline-offset-2 shrink-0"
            >
              Cek Stok
            </Link>
          </div>
        )}

        {/* 4 Kartu Metrik Utama */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Stok Unit */}
          <Card className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Stok Aktif
              </span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-crystal-500/20 text-crystal-300">
                <Car className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white">
                {statusCounts.tersedia + statusCounts.perbaikan + statusCounts.dipesan}{" "}
                <span className="text-xs font-semibold text-slate-400">Unit</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex gap-2">
                <span className="text-emerald-400">{statusCounts.tersedia} Siap</span>
                <span>•</span>
                <span className="text-amber-400">{statusCounts.perbaikan} Perbaikan</span>
              </div>
            </div>
          </Card>

          {/* 2. Nilai Aset Stok */}
          <Card className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nilai Aset
              </span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-500/20 text-blue-300">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-black text-white truncate" title={rupiah(stock.nilai)}>
                {rupiahShort(stock.nilai)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                Rata-rata {stock.rataHari} hari di showroom
              </p>
            </div>
          </Card>

          {/* 3. Laba Bulan Ini */}
          <Card className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Laba Bulan Ini
              </span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-black text-emerald-300 truncate" title={rupiah(currentMonthProfit.laba_bersih)}>
                {rupiahShort(currentMonthProfit.laba_bersih)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {currentMonthProfit.unit_terjual} mobil terjual
              </p>
            </div>
          </Card>

          {/* 4. Arus Kas Bersih Bulan Ini */}
          <Card className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Kas Bersih Bln Ini
              </span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-amethyst-500/20 text-amethyst-300">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div
                className={`text-xl sm:text-2xl font-black truncate ${
                  cashMonth.masuk - cashMonth.keluar >= 0 ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {rupiahShort(cashMonth.masuk - cashMonth.keluar)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span className="text-emerald-400 truncate">+{rupiahShort(cashMonth.masuk)}</span>
                <span className="text-rose-400 truncate">-{rupiahShort(cashMonth.keluar)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Action Grid di Mobile */}
        <div className="grid grid-cols-3 gap-2.5 sm:hidden">
          <Link
            href="/mobil/tambah"
            className="flex flex-col items-center justify-center p-3 rounded-2xl glass text-center hover:bg-white/10 active:scale-95 transition"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-crystal text-slate-950 mb-1.5 shadow-md">
              <CarFront className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-white">Beli Mobil</span>
          </Link>
          <Link
            href="/operasional"
            className="flex flex-col items-center justify-center p-3 rounded-2xl glass text-center hover:bg-white/10 active:scale-95 transition"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amethyst-500/20 text-amethyst-300 mb-1.5 border border-amethyst-400/30">
              <Receipt className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-white">Operasional</span>
          </Link>
          <Link
            href="/laporan"
            className="flex flex-col items-center justify-center p-3 rounded-2xl glass text-center hover:bg-white/10 active:scale-95 transition"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/20 text-blue-300 mb-1.5 border border-blue-400/30">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-white">Laporan</span>
          </Link>
        </div>

        {/* Daftar Mobil Terbaru di Showroom */}
        <div>
          <SectionTitle
            action={
              <Link href="/mobil" className="text-xs font-semibold text-crystal-400 hover:text-crystal-300 flex items-center gap-1">
                Lihat Semua ({statusCounts.tersedia + statusCounts.perbaikan + statusCounts.dipesan}) <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            Stok Unit Terbaru
          </SectionTitle>

          {recentCars.length === 0 ? (
            <EmptyState
              icon={<Car className="h-8 w-8" />}
              title="Belum ada unit mobil"
            >
              Belum ada stok mobil tercatat. Klik tombol di bawah untuk mencatat mobil pertama.
              <div className="mt-4">
                <ButtonLink href="/mobil/tambah" size="sm">
                  + Tambah Mobil Baru
                </ButtonLink>
              </div>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentCars.map((car) => {
                const agingDays = car.tgl_beli ? daysBetween(car.tgl_beli, today) : 0;
                return (
                  <Link
                    key={car.id}
                    href={`/mobil/${car.id}`}
                    className="glass p-3.5 rounded-2xl flex items-center justify-between gap-3 hover:bg-white/10 transition active:scale-[0.98] group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={car.status} />
                        <span className="text-[11px] font-mono font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded-md">
                          {car.nopol}
                        </span>
                      </div>
                      <div className="font-bold text-white text-sm truncate group-hover:text-crystal-300 transition">
                        {car.merek} {car.tipe} ({car.tahun})
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span>Modal: <strong className="text-slate-200">{rupiahShort(car.total_modal)}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" /> {agingDays} hari
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-crystal-400 shrink-0 transition" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Riwayat Arus Kas Terkini */}
        <div>
          <SectionTitle
            action={
              <Link href="/laporan?tab=kas" className="text-xs font-semibold text-crystal-400 hover:text-crystal-300 flex items-center gap-1">
                Laporan Arus Kas <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            Arus Kas Terkini
          </SectionTitle>

          {recentCashEntries.length === 0 ? (
            <Card className="p-4 text-center text-xs text-slate-400">
              Belum ada transaksi arus kas tercatat.
            </Card>
          ) : (
            <Card className="divide-y divide-white/5 p-0">
              {recentCashEntries.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                        c.jenis === "masuk"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-rose-500/15 text-rose-300"
                      }`}
                    >
                      {c.jenis === "masuk" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {c.kategori}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {c.keterangan || "-"}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {tanggal(c.tanggal)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-black tabular-nums ${
                        c.jenis === "masuk" ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {c.jenis === "masuk" ? "+" : "-"}
                      {rupiah(c.nominal)}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
