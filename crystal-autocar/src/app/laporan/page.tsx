import { AppShell } from "@/components/nav";
import { Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";
import {
  cashFlow,
  profitMonthly,
  profitPerCar,
  profitYearly,
  stockReport,
  availableYears,
} from "@/lib/repo/reports";
import { CAR_STATUS_LABEL } from "@/lib/constants";
import { namaBulan, rupiah, rupiahShort, tanggal, todayISO } from "@/lib/format";
import Link from "next/link";
import { ExportButtons } from "./export-buttons";
import {
  BarChart3,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  Clock,
  Layers,
} from "lucide-react";

export const metadata = {
  title: "Laporan Keuangan",
};

export default async function LaporanPage(props: {
  searchParams: Promise<{
    tab?: string;
    tahun?: string;
    dari?: string;
    sampai?: string;
  }>;
}) {
  const user = await requireUser();
  const searchParams = await props.searchParams;
  const tab = searchParams.tab ?? "laba_unit";

  const today = todayISO();
  const currentYear = new Date().getFullYear();
  const selectedYear = Number(searchParams.tahun ?? currentYear);

  const defaultDari = `${selectedYear}-01-01`;
  const defaultSampai = `${selectedYear}-12-31`;
  const dari = searchParams.dari ?? defaultDari;
  const sampai = searchParams.sampai ?? defaultSampai;

  const years = availableYears();

  // 1. Data Laba per Mobil
  const carProfits = profitPerCar(dari, sampai);
  const totalLabaMobil = carProfits.reduce((acc, c) => acc + c.laba, 0);
  const totalOmzetMobil = carProfits.reduce((acc, c) => acc + c.harga_jual, 0);

  // 2. Data Laba Bulanan
  const monthlyProfits = profitMonthly(selectedYear);
  const yearlySummary = profitYearly();
  const totalLabaBersihTahun = monthlyProfits.reduce((acc, m) => acc + m.laba_bersih, 0);

  // 3. Data Arus Kas
  const cash = cashFlow(dari, sampai);

  // 4. Data Nilai Stok
  const stock = stockReport();

  return (
    <AppShell user={user}>
      <div className="space-y-4 max-w-4xl mx-auto">
        <PageHeader
          title="Laporan Keuangan"
          subtitle="Analisis profitabilitas, arus kas, nilai aset, dan ekspor dokumen"
        />

        {/* Tab Navigasi Laporan (Scroll horizontal) */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { key: "laba_unit", label: "Laba per Mobil", icon: Car },
            { key: "laba_bulanan", label: "Laba Bersih Showroom", icon: TrendingUp },
            { key: "kas", label: "Arus Kas (Cash Flow)", icon: ArrowDownLeft },
            { key: "stok", label: "Nilai Stok & Aging", icon: Layers },
          ].map((t) => {
            const active = tab === t.key;
            const Icon = t.icon;
            return (
              <Link
                key={t.key}
                href={`/laporan?tab=${t.key}&tahun=${selectedYear}`}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-3.5 py-2 text-xs font-bold transition active:scale-95 ${
                  active
                    ? "bg-crystal text-slate-950 shadow-md shadow-crystal-500/25"
                    : "glass text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Filter Periode */}
        {(tab === "laba_unit" || tab === "kas") && (
          <Card className="p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-300">Rentang Tanggal:</span>
            <form method="GET" action="/laporan" className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="tab" value={tab} />
              <input
                type="date"
                name="dari"
                defaultValue={dari}
                className="glass-input px-2.5 py-1 text-xs text-white"
              />
              <span className="text-xs text-slate-400">s/d</span>
              <input
                type="date"
                name="sampai"
                defaultValue={sampai}
                className="glass-input px-2.5 py-1 text-xs text-white"
              />
              <button
                type="submit"
                className="rounded-xl bg-crystal-500/20 text-crystal-300 px-3 py-1 text-xs font-bold hover:bg-crystal-500/30 transition"
              >
                Filter
              </button>
            </form>
          </Card>
        )}

        {tab === "laba_bulanan" && (
          <Card className="p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-300">Pilih Tahun:</span>
            <form method="GET" action="/laporan" className="flex items-center gap-2">
              <input type="hidden" name="tab" value={tab} />
              <select
                name="tahun"
                defaultValue={selectedYear}
                className="glass-input px-3 py-1 text-xs text-white bg-slate-900"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    Tahun {y}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-crystal-500/20 text-crystal-300 px-3 py-1 text-xs font-bold hover:bg-crystal-500/30 transition"
              >
                Tampilkan
              </button>
            </form>
          </Card>
        )}

        {/* ==================== TAB 1: LABA PER MOBIL ==================== */}
        {tab === "laba_unit" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Laporan Laba / Rugi Per Unit Mobil
                </h2>
                <p className="text-xs text-slate-400">
                  Total {carProfits.length} mobil terjual • Akumulasi Laba:{" "}
                  <strong className="text-emerald-300">{rupiah(totalLabaMobil)}</strong>
                </p>
              </div>
              <ExportButtons
                payload={{
                  title: "Laporan Laba Per Unit Mobil",
                  period: `${tanggal(dari)} s/d ${tanggal(sampai)}`,
                  filename: `Laba_Mobil_${dari}_${sampai}`,
                  headers: [
                    "Plat",
                    "Unit Mobil",
                    "Tgl Jual",
                    "Pembeli",
                    "Harga Beli",
                    "Biaya Unit",
                    "Total Modal",
                    "Harga Jual",
                    "Laba Bersih",
                  ],
                  rows: carProfits.map((c) => [
                    c.nopol,
                    `${c.merek} ${c.tipe} (${c.tahun})`,
                    tanggal(c.tgl_jual),
                    c.pembeli,
                    c.harga_beli,
                    c.total_biaya,
                    c.total_modal,
                    c.harga_jual,
                    c.laba,
                  ]),
                }}
              />
            </div>

            {carProfits.length === 0 ? (
              <Card className="p-8 text-center text-xs text-slate-400">
                Tidak ada mobil terjual dalam periode tanggal ini.
              </Card>
            ) : (
              <div className="space-y-3">
                {carProfits.map((c) => (
                  <Card key={c.id} className="p-4 rounded-3xl space-y-3 border border-white/10">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-slate-200 bg-white/10 px-2 py-0.5 rounded text-xs">
                            {c.nopol}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Terjual {tanggal(c.tgl_jual)} ke <strong>{c.pembeli}</strong>
                          </span>
                        </div>
                        <h3 className="font-extrabold text-white text-sm">
                          {c.merek} {c.tipe} ({c.tahun})
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Laba Bersih
                        </span>
                        <span
                          className={`text-base font-black ${
                            c.laba >= 0 ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {c.laba >= 0 ? "+" : ""}
                          {rupiah(c.laba)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Harga Beli</span>
                        <span className="text-slate-200">{rupiah(c.harga_beli)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Biaya Perawatan</span>
                        <span className="text-slate-200">{rupiah(c.total_biaya)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Total Modal (HPP)</span>
                        <span className="text-slate-200 font-semibold">{rupiah(c.total_modal)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Harga Jual</span>
                        <span className="text-emerald-300 font-bold">{rupiah(c.harga_jual)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: LABA BULANAN SHOWROOM ==================== */}
        {tab === "laba_bulanan" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Laporan Laba Rugi Bulanan (Tahun {selectedYear})
                </h2>
                <p className="text-xs text-slate-400">
                  Laba Bersih Showroom = (Laba Mobil + DP Hangus) − Biaya Operasional
                </p>
              </div>
              <ExportButtons
                payload={{
                  title: `Laporan Laba Rugi Showroom Tahun ${selectedYear}`,
                  period: `Januari - Desember ${selectedYear}`,
                  filename: `Laba_Rugi_${selectedYear}`,
                  headers: [
                    "Bulan",
                    "Unit Terjual",
                    "Omzet Penjualan",
                    "Laba Unit",
                    "Biaya Operasional",
                    "Laba Bersih Showroom",
                  ],
                  rows: monthlyProfits.map((m) => [
                    namaBulan(m.bulan),
                    m.unit_terjual,
                    m.omzet,
                    m.laba_penjualan,
                    m.biaya_operasional,
                    m.laba_bersih,
                  ]),
                }}
              />
            </div>

            <Card className="p-0 overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/5 text-slate-400 uppercase font-semibold border-b border-white/10 text-[10px]">
                    <tr>
                      <th className="p-3">Bulan</th>
                      <th className="p-3 text-center">Unit</th>
                      <th className="p-3 text-right">Laba Mobil</th>
                      <th className="p-3 text-right">Beban Operasional</th>
                      <th className="p-3 text-right">Laba Bersih Showroom</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {monthlyProfits.map((m) => (
                      <tr key={m.bulan} className="hover:bg-white/5">
                        <td className="p-3 font-bold text-white">{namaBulan(m.bulan)}</td>
                        <td className="p-3 text-center">{m.unit_terjual}</td>
                        <td className="p-3 text-right tabular-nums text-slate-200">
                          {rupiah(m.laba_penjualan)}
                        </td>
                        <td className="p-3 text-right tabular-nums text-rose-300">
                          {m.biaya_operasional > 0 ? `− ${rupiah(m.biaya_operasional)}` : "-"}
                        </td>
                        <td
                          className={`p-3 text-right tabular-nums font-black ${
                            m.laba_bersih >= 0 ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {m.laba_bersih >= 0 ? "+" : ""}
                          {rupiah(m.laba_bersih)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-white/10 font-bold border-t border-white/10">
                    <tr>
                      <td className="p-3 text-white">TOTAL TAHUN {selectedYear}</td>
                      <td className="p-3 text-center text-white">
                        {monthlyProfits.reduce((a, b) => a + b.unit_terjual, 0)}
                      </td>
                      <td className="p-3 text-right text-white">
                        {rupiah(monthlyProfits.reduce((a, b) => a + b.laba_penjualan, 0))}
                      </td>
                      <td className="p-3 text-right text-rose-300">
                        − {rupiah(monthlyProfits.reduce((a, b) => a + b.biaya_operasional, 0))}
                      </td>
                      <td className="p-3 text-right text-emerald-300 text-sm font-black">
                        {rupiah(totalLabaBersihTahun)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ==================== TAB 3: ARUS KAS (CASH FLOW) ==================== */}
        {tab === "kas" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Laporan Arus Kas (Cash Flow)
                </h2>
                <p className="text-xs text-slate-400">
                  Arus masuk (Penjualan, DP) vs Arus keluar (Beli unit, Biaya, Operasional)
                </p>
              </div>
              <ExportButtons
                payload={{
                  title: "Laporan Arus Kas (Cash Flow)",
                  period: `${tanggal(dari)} s/d ${tanggal(sampai)}`,
                  filename: `Arus_Kas_${dari}_${sampai}`,
                  headers: ["Tanggal", "Arus", "Kategori", "Keterangan", "Nominal"],
                  rows: cash.entries.map((e) => [
                    tanggal(e.tanggal),
                    e.jenis === "masuk" ? "KAS MASUK" : "KAS KELUAR",
                    e.kategori,
                    e.keterangan,
                    e.nominal,
                  ]),
                }}
              />
            </div>

            {/* Ringkasan Kas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="p-4 rounded-2xl border-emerald-500/30 bg-emerald-500/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Kas Masuk
                </span>
                <span className="text-lg font-black text-emerald-300 block mt-1">
                  +{rupiah(cash.masuk)}
                </span>
              </Card>
              <Card className="p-4 rounded-2xl border-rose-500/30 bg-rose-500/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Kas Keluar
                </span>
                <span className="text-lg font-black text-rose-300 block mt-1">
                  −{rupiah(cash.keluar)}
                </span>
              </Card>
              <Card className="p-4 rounded-2xl border-crystal-500/30 bg-crystal-500/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Net Cash Flow (Bersih)
                </span>
                <span
                  className={`text-lg font-black block mt-1 ${
                    cash.neto >= 0 ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {cash.neto >= 0 ? "+" : ""}
                  {rupiah(cash.neto)}
                </span>
              </Card>
            </div>

            {/* List Transaksi Kas */}
            <Card className="p-0 overflow-hidden rounded-3xl border border-white/10">
              <div className="divide-y divide-white/5">
                {cash.entries.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">
                    Tidak ada catatan arus kas pada rentang tanggal ini.
                  </p>
                ) : (
                  cash.entries.map((e, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                            e.jenis === "masuk"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          {e.jenis === "masuk" ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{e.kategori}</div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {e.keterangan || "-"}
                          </div>
                          <div className="text-[10px] text-slate-500">{tanggal(e.tanggal)}</div>
                        </div>
                      </div>
                      <div
                        className={`text-right font-black tabular-nums shrink-0 ${
                          e.jenis === "masuk" ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {e.jenis === "masuk" ? "+" : "−"}
                        {rupiah(e.nominal)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ==================== TAB 4: NILAI STOK & AGING ==================== */}
        {tab === "stok" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Laporan Nilai Stok & Aging Unit
                </h2>
                <p className="text-xs text-slate-400">
                  Total {stock.rows.length} unit aktif • Total Aset Modal:{" "}
                  <strong className="text-white">{rupiah(stock.nilai)}</strong>
                </p>
              </div>
              <ExportButtons
                payload={{
                  title: "Laporan Nilai Stok & Aging Unit",
                  period: `Per Tanggal ${tanggal(today)}`,
                  filename: `Nilai_Stok_${today}`,
                  headers: [
                    "Plat",
                    "Mobil",
                    "Status",
                    "Tgl Beli",
                    "Harga Beli",
                    "Biaya Unit",
                    "Total Modal",
                    "Lama di Showroom (Hari)",
                  ],
                  rows: stock.rows.map((s) => [
                    s.nopol,
                    `${s.merek} ${s.tipe} (${s.tahun})`,
                    CAR_STATUS_LABEL[s.status],
                    tanggal(s.tgl_beli),
                    s.harga_beli,
                    s.total_biaya,
                    s.total_modal,
                    `${s.lama_hari} hari`,
                  ]),
                }}
              />
            </div>

            <Card className="p-0 overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/5 text-slate-400 uppercase font-semibold border-b border-white/10 text-[10px]">
                    <tr>
                      <th className="p-3">Plat & Unit</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Modal Terkumpul</th>
                      <th className="p-3 text-right">Lama di Showroom</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stock.rows.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5">
                        <td className="p-3">
                          <Link
                            href={`/mobil/${s.id}`}
                            className="font-bold text-white hover:text-crystal-300 transition"
                          >
                            {s.merek} {s.tipe} ({s.tahun})
                          </Link>
                          <div className="text-[10px] font-mono text-slate-400">{s.nopol}</div>
                        </td>
                        <td className="p-3">
                          <span className="capitalize text-slate-300">
                            {CAR_STATUS_LABEL[s.status]}
                          </span>
                        </td>
                        <td className="p-3 text-right tabular-nums font-bold text-slate-200">
                          {rupiah(s.total_modal)}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          <span
                            className={`font-semibold ${
                              s.lama_hari > 45 ? "text-amber-400 font-bold" : "text-slate-300"
                            }`}
                          >
                            {s.lama_hari} hari
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
