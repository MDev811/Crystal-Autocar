import { AppShell } from "@/components/nav";
import { Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { listOpex } from "@/lib/repo/reports";
import { rupiah, tanggal, todayISO } from "@/lib/format";
import { OPEX_LABEL } from "@/lib/constants";
import { AddOpexModal, DeleteOpexButton } from "./client";
import { Receipt, Zap, Megaphone, Wifi, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Biaya Operasional",
};

export default async function OperasionalPage(props: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  const user = await requireUser();
  const searchParams = await props.searchParams;
  const today = todayISO();
  const selectedMonth = searchParams.bulan ?? today.slice(0, 7); // "YYYY-MM"

  const startDate = `${selectedMonth}-01`;
  const endDate = `${selectedMonth}-31`;

  const items = listOpex(startDate, endDate);
  const total = items.reduce((sum, item) => sum + item.nominal, 0);

  // Rekap per kategori
  const byCategory = items.reduce<Record<string, number>>((acc, cur) => {
    acc[cur.kategori] = (acc[cur.kategori] || 0) + cur.nominal;
    return acc;
  }, {});

  return (
    <AppShell user={user}>
      <div className="space-y-4 max-w-3xl mx-auto">
        <PageHeader
          title="Biaya Operasional"
          subtitle="Pencatatan beban rutin showroom (Listrik, Iklan, Internet, dll) - FR-13"
          action={<AddOpexModal />}
        />

        {/* Filter Bulan */}
        <Card className="p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-300">Pilih Periode Bulan:</span>
          <form method="GET" action="/operasional" className="flex items-center gap-2">
            <input
              type="month"
              name="bulan"
              defaultValue={selectedMonth}
              className="glass-input px-3 py-1.5 text-xs text-white"
            />
            <button
              type="submit"
              className="rounded-xl bg-crystal-500/20 text-crystal-300 px-3 py-1.5 text-xs font-bold hover:bg-crystal-500/30 transition"
            >
              Tampilkan
            </button>
          </form>
        </Card>

        {/* Ringkasan Total Operasional */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3.5 rounded-2xl col-span-2 sm:col-span-1 border-amethyst-500/30 bg-amethyst-500/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Beban</span>
            <span className="text-lg font-black text-white block mt-1">{rupiah(total)}</span>
          </Card>
          <Card className="p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" /> Listrik
            </span>
            <span className="text-sm font-bold text-slate-200 block mt-1">
              {rupiah(byCategory.listrik ?? 0)}
            </span>
          </Card>
          <Card className="p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Megaphone className="h-3 w-3 text-sky-400" /> Iklan / Promo
            </span>
            <span className="text-sm font-bold text-slate-200 block mt-1">
              {rupiah(byCategory.iklan ?? 0)}
            </span>
          </Card>
          <Card className="p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Wifi className="h-3 w-3 text-emerald-400" /> Internet & Lain
            </span>
            <span className="text-sm font-bold text-slate-200 block mt-1">
              {rupiah((byCategory.internet ?? 0) + (byCategory.lainnya ?? 0))}
            </span>
          </Card>
        </div>

        {/* Tabel / List Pengeluaran */}
        <Card className="p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-amethyst-400" />
              Riwayat Beban Periode Ini ({items.length})
            </h2>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Belum ada catatan pengeluaran operasional di bulan ini.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{OPEX_LABEL[item.kategori]}</span>
                      <span className="text-[10px] text-slate-400">{tanggal(item.tanggal)}</span>
                    </div>
                    {item.keterangan && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.keterangan}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-black text-rose-300 tabular-nums">
                      − {rupiah(item.nominal)}
                    </span>
                    <DeleteOpexButton id={item.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
