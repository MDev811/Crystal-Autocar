import { AppShell } from "@/components/nav";
import { ButtonLink, Card, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { countByStatus, listCars } from "@/lib/repo/cars";
import { daysBetween, rupiahShort, todayISO } from "@/lib/format";
import Link from "next/link";
import { Car, Clock, Plus, Search, Filter } from "lucide-react";
import type { CarStatus } from "@/lib/constants";

export const metadata = {
  title: "Stok Mobil",
};

export default async function CarsPage(props: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await requireUser();
  const searchParams = await props.searchParams;
  const statusParam = (searchParams.status ?? "aktif") as CarStatus | "aktif" | "semua";
  const queryParam = searchParams.q ?? "";

  const counts = countByStatus();
  const totalAktif = counts.tersedia + counts.perbaikan + counts.dipesan;
  const cars = listCars({ status: statusParam, q: queryParam });
  const today = todayISO();

  const filterTabs = [
    { key: "aktif", label: "Aktif", count: totalAktif },
    { key: "tersedia", label: "Tersedia", count: counts.tersedia },
    { key: "perbaikan", label: "Perbaikan", count: counts.perbaikan },
    { key: "dipesan", label: "Dipesan", count: counts.dipesan },
    { key: "terjual", label: "Terjual", count: counts.terjual },
    { key: "semua", label: "Semua", count: totalAktif + counts.terjual },
  ];

  return (
    <AppShell user={user}>
      <div className="space-y-4">
        <PageHeader
          title="Stok Mobil"
          subtitle="Kelola unit kendaraan, modal per unit, dan status penjualan"
          action={
            <ButtonLink href="/mobil/tambah" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Beli Mobil
            </ButtonLink>
          }
        />

        {/* Input Pencarian */}
        <form method="GET" action="/mobil" className="relative">
          <input type="hidden" name="status" value={statusParam} />
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={queryParam}
            placeholder="Cari merek, tipe, atau nopol (cth: Avanza / B 1234)..."
            className="glass-input w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500"
          />
          {queryParam && (
            <Link
              href={`/mobil?status=${statusParam}`}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Reset
            </Link>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-crystal-500/20 text-crystal-300 px-2.5 py-1 text-xs font-semibold hover:bg-crystal-500/30 transition"
          >
            Cari
          </button>
        </form>

        {/* Filter Tab Status (Scroll horizontal di mobile) */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterTabs.map((tab) => {
            const isSelected = statusParam === tab.key;
            return (
              <Link
                key={tab.key}
                href={`/mobil?status=${tab.key}${queryParam ? `&q=${encodeURIComponent(queryParam)}` : ""}`}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                  isSelected
                    ? "bg-crystal text-slate-950 shadow-md shadow-crystal-500/25"
                    : "glass text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? "bg-slate-950/30 text-slate-900" : "bg-white/10 text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Hasil Daftar Mobil */}
        {cars.length === 0 ? (
          <EmptyState
            icon={<Car className="h-8 w-8" />}
            title="Tidak ada mobil ditemukan"
          >
            {queryParam
              ? `Tidak ada hasil pencarian untuk "${queryParam}". Coba kata kunci lain.`
              : "Belum ada unit mobil untuk kategori status ini."}
            <div className="mt-4">
              <ButtonLink href="/mobil/tambah" size="sm">
                + Tambah Pembelian Mobil
              </ButtonLink>
            </div>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {cars.map((car) => {
              const aging = car.tgl_beli ? daysBetween(car.tgl_beli, today) : 0;
              const isTerjual = car.status === "terjual";

              return (
                <Link
                  key={car.id}
                  href={`/mobil/${car.id}`}
                  className="glass p-4 rounded-3xl flex flex-col justify-between hover:bg-white/10 transition active:scale-[0.99] group border border-white/10"
                >
                  <div>
                    {/* Header Card: Status & Nopol */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={car.status} />
                        <span className="text-xs font-mono font-bold text-slate-200 bg-white/10 px-2 py-0.5 rounded-lg tracking-wider">
                          {car.nopol}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {isTerjual ? "Terjual" : `${aging} hari`}
                      </span>
                    </div>

                    {/* Judul Mobil */}
                    <h3 className="text-base font-extrabold text-white group-hover:text-crystal-300 transition">
                      {car.merek} {car.tipe}{" "}
                      <span className="text-xs font-normal text-slate-400">({car.tahun})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Warna {car.warna} • Sumber: {car.sumber ?? "-"}
                    </p>
                  </div>

                  {/* Footer Card: Modal & Hasil */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Total Modal (HPP)
                      </div>
                      <div className="text-sm font-extrabold text-slate-200">
                        {rupiahShort(car.total_modal)}
                      </div>
                      {car.total_biaya > 0 && (
                        <div className="text-[10px] text-slate-400">
                          Termasuk perbaikan {rupiahShort(car.total_biaya)}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      {isTerjual ? (
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Laba Bersih
                          </div>
                          <div
                            className={`text-sm font-extrabold ${
                              (car.laba ?? 0) >= 0 ? "text-emerald-300" : "text-rose-300"
                            }`}
                          >
                            {(car.laba ?? 0) >= 0 ? "+" : ""}
                            {rupiahShort(car.laba ?? 0)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Jual: {rupiahShort(car.harga_jual ?? 0)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-crystal-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Detail Unit →
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
