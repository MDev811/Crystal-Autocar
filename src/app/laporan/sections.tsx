/**
 * Bagian-bagian halaman Laporan (server components). Setiap tab mengambil data langsung
 * dari repository laporan lalu menyajikannya sebagai kartu / tabel + tombol ekspor.
 */
import Link from "next/link";
import { Car, Handshake, MessageCircle, Repeat, UserRound } from "lucide-react";
import { Card, EmptyState, cn } from "@/components/ui";
import { namaBulan, rupiah, tanggal, waLink } from "@/lib/format";
import {
  PARTNER_SORTS,
  cashFlow,
  listBrokers,
  listBuyers,
  listSellers,
  profitMonthlyRange,
  profitPerCar,
  stockReport,
  type PartnerRow,
  type PartnerSort,
} from "@/lib/repo/reports";
import { CAR_STATUS_LABEL } from "@/lib/constants";
import { ExportButtons } from "./export-buttons";

const fmtSigned = (n: number) => `${n >= 0 ? "+" : "-"}${rupiah(Math.abs(n))}`;

/* ------------------------------ Elemen umum ------------------------------ */

export function DateRangeFilter({ tab, dari, sampai }: { tab: string; dari: string; sampai: string }) {
  return (
    <form method="GET" action="/laporan" className="glass rounded-2xl p-3 flex flex-wrap items-center gap-2.5">
      <input type="hidden" name="tab" value={tab} />
      <span className="text-xs font-semibold text-slate-300">Rentang Tanggal:</span>
      <input
        type="date"
        name="dari"
        defaultValue={dari}
        required
        className="glass-input px-3 py-1.5 text-xs text-slate-100"
        aria-label="Dari tanggal"
      />
      <span className="text-xs text-slate-400">s/d</span>
      <input
        type="date"
        name="sampai"
        defaultValue={sampai}
        required
        className="glass-input px-3 py-1.5 text-xs text-slate-100"
        aria-label="Sampai tanggal"
      />
      <button
        type="submit"
        className="rounded-xl bg-crystal-500/25 px-3.5 py-1.5 text-xs font-bold text-crystal-200 hover:bg-crystal-500/40 transition active:scale-95"
      >
        Filter
      </button>
    </form>
  );
}

function SectionHead({ title, subtitle, action }: { title: string; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "good" | "bad" | "info" }) {
  return (
    <Card className="p-3.5 rounded-2xl">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div
        className={cn(
          "mt-1 text-base font-black tabular-nums",
          tone === "good" && "text-emerald-300",
          tone === "bad" && "text-rose-300",
          tone === "info" && "text-crystal-300",
          !tone && "text-white"
        )}
      >
        {value}
      </div>
    </Card>
  );
}

function SortLinks({
  base,
  current,
  options,
}: {
  base: Record<string, string>;
  current: PartnerSort;
  options: { key: PartnerSort; label: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold text-slate-400">Urutkan:</span>
      {options.map((o) => {
        const qs = new URLSearchParams({ ...base, urut: o.key }).toString();
        return (
          <Link
            key={o.key}
            href={`/laporan?${qs}`}
            className={cn(
              "rounded-xl px-3 py-1.5 text-[11px] font-bold transition active:scale-95",
              current === o.key
                ? "bg-crystal-500/25 text-crystal-200 ring-1 ring-crystal-400/40"
                : "glass text-slate-400 hover:text-white"
            )}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}

/* ------------------------------ 1. Laba per mobil ------------------------------ */

export function LabaPerMobil({ dari, sampai }: { dari: string; sampai: string }) {
  const rows = profitPerCar(dari, sampai);
  const totalLaba = rows.reduce((a, r) => a + r.laba, 0);

  const payload = {
    title: "Laporan Laba / Rugi per Unit Mobil",
    period: `${tanggal(dari)} s/d ${tanggal(sampai)}`,
    filename: `laba-per-mobil_${dari}_${sampai}`,
    headers: ["Nopol", "Mobil", "Tgl Jual", "Pembeli", "Harga Beli", "Komisi", "Biaya Perawatan", "Total Modal", "Harga Jual", "Laba Bersih"],
    rows: rows.map((r) => [
      r.nopol,
      `${r.merek} ${r.tipe} (${r.tahun})`,
      tanggal(r.tgl_jual),
      r.pembeli,
      r.harga_beli,
      r.komisi_calo,
      r.total_biaya,
      r.total_modal,
      r.harga_jual,
      r.laba,
    ]),
  };

  return (
    <div className="space-y-3.5">
      <SectionHead
        title="Laporan Laba / Rugi per Unit Mobil"
        subtitle={
          <>
            Total {rows.length} mobil terjual • Akumulasi Laba:{" "}
            <strong className={totalLaba >= 0 ? "text-emerald-300" : "text-rose-300"}>{rupiah(totalLaba)}</strong>
          </>
        }
        action={rows.length > 0 ? <ExportButtons payload={payload} /> : undefined}
      />

      {rows.length === 0 ? (
        <EmptyState icon={<Car className="h-7 w-7" />} title="Belum ada mobil terjual">
          Tidak ada penjualan pada rentang tanggal ini.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id} className="p-4 rounded-3xl">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-lg bg-white/10 px-2 py-0.5 font-mono font-bold tracking-wider text-slate-100">
                      {r.nopol}
                    </span>
                    <span className="text-slate-400">
                      Terjual {tanggal(r.tgl_jual)} ke <strong className="text-slate-200">{r.pembeli}</strong>
                    </span>
                  </div>
                  <Link href={`/mobil/${r.id}`} className="mt-1.5 block text-base font-extrabold text-white hover:text-crystal-300 transition">
                    {r.merek} {r.tipe} ({r.tahun})
                  </Link>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Laba Bersih</div>
                  <div className={cn("text-xl font-black tabular-nums", r.laba >= 0 ? "text-emerald-300" : "text-rose-300")}>
                    {fmtSigned(r.laba)}
                  </div>
                </div>
              </div>

              <div className="mt-3.5 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-xs sm:grid-cols-4">
                <div>
                  <div className="text-slate-400">Harga Beli</div>
                  <div className="mt-0.5 font-semibold text-slate-100 tabular-nums">{rupiah(r.harga_beli)}</div>
                  {r.komisi_calo > 0 && (
                    <div className="text-[10px] text-slate-500">+ komisi {rupiah(r.komisi_calo)}</div>
                  )}
                </div>
                <div>
                  <div className="text-slate-400">Biaya Perawatan</div>
                  <div className="mt-0.5 font-semibold text-slate-100 tabular-nums">{rupiah(r.total_biaya)}</div>
                </div>
                <div>
                  <div className="text-slate-400">Total Modal (HPP)</div>
                  <div className="mt-0.5 font-semibold text-slate-100 tabular-nums">{rupiah(r.total_modal)}</div>
                </div>
                <div>
                  <div className="text-slate-400">Harga Jual</div>
                  <div className="mt-0.5 font-semibold text-emerald-300 tabular-nums">{rupiah(r.harga_jual)}</div>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">Lama di showroom: {r.lama_hari} hari</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ 2. Laba bersih ------------------------------ */

export function LabaBersih({ dari, sampai }: { dari: string; sampai: string }) {
  const rows = profitMonthlyRange(dari.slice(0, 7), sampai.slice(0, 7));
  const sum = (k: "unit_terjual" | "omzet" | "laba_penjualan" | "pendapatan_lain" | "biaya_operasional" | "laba_bersih") =>
    rows.reduce((a, r) => a + r[k], 0);

  const payload = {
    title: "Laporan Laba Bersih Showroom",
    period: `${namaBulan(dari.slice(0, 7))} s/d ${namaBulan(sampai.slice(0, 7))}`,
    filename: `laba-bersih_${dari.slice(0, 7)}_${sampai.slice(0, 7)}`,
    headers: ["Bulan", "Unit Terjual", "Omzet", "Laba Penjualan", "DP Hangus", "Biaya Operasional", "Laba Bersih"],
    rows: rows.map((r) => [
      namaBulan(r.bulan),
      String(r.unit_terjual),
      r.omzet,
      r.laba_penjualan,
      r.pendapatan_lain,
      r.biaya_operasional,
      r.laba_bersih,
    ]),
  };

  return (
    <div className="space-y-3.5">
      <SectionHead
        title="Laba Bersih Showroom"
        subtitle="Laba penjualan + DP hangus − biaya operasional, per bulan"
        action={<ExportButtons payload={payload} />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Unit Terjual" value={sum("unit_terjual")} />
        <Stat label="Omzet Penjualan" value={rupiah(sum("omzet"))} />
        <Stat label="Biaya Operasional" value={rupiah(sum("biaya_operasional"))} tone="bad" />
        <Stat label="Laba Bersih" value={fmtSigned(sum("laba_bersih"))} tone={sum("laba_bersih") >= 0 ? "good" : "bad"} />
      </div>

      <Card className="rounded-3xl p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs">
            <thead>
              <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-wider text-slate-400">
                <th className="px-3.5 py-2.5">Bulan</th>
                <th className="px-3 py-2.5 text-right">Unit</th>
                <th className="px-3 py-2.5 text-right">Omzet</th>
                <th className="px-3 py-2.5 text-right">Laba Penjualan</th>
                <th className="px-3 py-2.5 text-right">DP Hangus</th>
                <th className="px-3 py-2.5 text-right">Biaya Ops</th>
                <th className="px-3.5 py-2.5 text-right">Laba Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 tabular-nums">
              {rows.map((r) => (
                <tr key={r.bulan}>
                  <td className="px-3.5 py-2.5 font-semibold text-slate-200">{namaBulan(r.bulan)}</td>
                  <td className="px-3 py-2.5 text-right text-slate-300">{r.unit_terjual}</td>
                  <td className="px-3 py-2.5 text-right text-slate-300">{rupiah(r.omzet)}</td>
                  <td className="px-3 py-2.5 text-right text-slate-300">{rupiah(r.laba_penjualan)}</td>
                  <td className="px-3 py-2.5 text-right text-slate-300">{rupiah(r.pendapatan_lain)}</td>
                  <td className="px-3 py-2.5 text-right text-rose-300">{rupiah(r.biaya_operasional)}</td>
                  <td className={cn("px-3.5 py-2.5 text-right font-bold", r.laba_bersih >= 0 ? "text-emerald-300" : "text-rose-300")}>
                    {fmtSigned(r.laba_bersih)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------ 3. Arus kas ------------------------------ */

export function ArusKas({ dari, sampai }: { dari: string; sampai: string }) {
  const kas = cashFlow(dari, sampai);

  const payload = {
    title: "Laporan Arus Kas (Cash Flow)",
    period: `${tanggal(dari)} s/d ${tanggal(sampai)}`,
    filename: `arus-kas_${dari}_${sampai}`,
    headers: ["Tanggal", "Jenis", "Kategori", "Keterangan", "Nominal"],
    rows: kas.entries.map((e) => [
      tanggal(e.tanggal),
      e.jenis === "masuk" ? "Masuk" : "Keluar",
      e.kategori,
      e.keterangan,
      e.nominal,
    ]),
  };

  return (
    <div className="space-y-3.5">
      <SectionHead
        title="Arus Kas (Cash Flow)"
        subtitle="Seluruh uang masuk dan keluar showroom"
        action={kas.entries.length > 0 ? <ExportButtons payload={payload} /> : undefined}
      />

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Kas Masuk" value={rupiah(kas.masuk)} tone="good" />
        <Stat label="Kas Keluar" value={rupiah(kas.keluar)} tone="bad" />
        <Stat label="Saldo Neto" value={fmtSigned(kas.neto)} tone={kas.neto >= 0 ? "good" : "bad"} />
      </div>

      {kas.perKategori.length > 0 && (
        <Card className="rounded-3xl p-4">
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Ringkasan per Kategori</h3>
          <div className="divide-y divide-white/5 text-xs">
            {kas.perKategori.map((k) => (
              <div key={k.kategori} className="flex items-center justify-between py-2">
                <span className="text-slate-200">{k.kategori}</span>
                <span className={cn("font-bold tabular-nums", k.jenis === "masuk" ? "text-emerald-300" : "text-rose-300")}>
                  {k.jenis === "masuk" ? "+" : "-"}
                  {rupiah(k.total)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="rounded-3xl p-4">
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Rincian Transaksi ({kas.entries.length})
        </h3>
        {kas.entries.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">Tidak ada transaksi pada rentang tanggal ini.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {kas.entries.map((e, i) => (
              <div key={`${e.tanggal}-${i}`} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-100">{e.kategori}</div>
                  <div className="truncate text-[11px] text-slate-400">{e.keterangan}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className={cn("font-bold tabular-nums", e.jenis === "masuk" ? "text-emerald-300" : "text-rose-300")}>
                    {e.jenis === "masuk" ? "+" : "-"}
                    {rupiah(e.nominal)}
                  </div>
                  <div className="text-[10px] text-slate-500">{tanggal(e.tanggal)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------ 4. Nilai stok & aging ------------------------------ */

export function NilaiStok() {
  const stok = stockReport();

  const payload = {
    title: "Laporan Nilai Stok & Aging",
    period: `Per ${tanggal(new Date().toISOString().slice(0, 10))}`,
    filename: "nilai-stok-aging",
    headers: ["Nopol", "Mobil", "Status", "Tgl Beli", "Umur (hari)", "Total Modal"],
    rows: stok.rows.map((r) => [
      r.nopol,
      `${r.merek} ${r.tipe} (${r.tahun})`,
      CAR_STATUS_LABEL[r.status],
      tanggal(r.tgl_beli),
      String(r.lama_hari),
      r.total_modal,
    ]),
  };

  return (
    <div className="space-y-3.5">
      <SectionHead
        title="Nilai Stok & Aging"
        subtitle="Modal yang tertanam pada unit yang belum terjual"
        action={stok.rows.length > 0 ? <ExportButtons payload={payload} /> : undefined}
      />

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Unit di Stok" value={stok.rows.length} />
        <Stat label="Nilai Stok (HPP)" value={rupiah(stok.nilai)} tone="info" />
        <Stat label="Rata-rata Umur" value={`${stok.rataHari} hari`} />
      </div>

      {stok.rows.length === 0 ? (
        <EmptyState icon={<Car className="h-7 w-7" />} title="Stok kosong">
          Tidak ada unit aktif di showroom.
        </EmptyState>
      ) : (
        <div className="space-y-2.5">
          {stok.rows.map((r) => (
            <Card key={r.id} className="flex items-center justify-between gap-3 rounded-2xl p-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-lg bg-white/10 px-2 py-0.5 font-mono font-bold tracking-wider text-slate-100">{r.nopol}</span>
                  <span className="text-slate-400">{CAR_STATUS_LABEL[r.status]}</span>
                </div>
                <Link href={`/mobil/${r.id}`} className="mt-1 block truncate text-sm font-bold text-white hover:text-crystal-300">
                  {r.merek} {r.tipe} ({r.tahun})
                </Link>
              </div>
              <div className="shrink-0 text-right text-xs">
                <div className="font-bold tabular-nums text-slate-100">{rupiah(r.total_modal)}</div>
                <div
                  className={cn(
                    "text-[11px] font-semibold",
                    r.lama_hari > 60 ? "text-rose-300" : r.lama_hari > 30 ? "text-amber-300" : "text-emerald-300"
                  )}
                >
                  {r.lama_hari} hari
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ 5. List makelar ------------------------------ */

export const SORT_OPTIONS_BROKER: { key: PartnerSort; label: string }[] = [
  { key: "sering", label: "Paling Sering Bertransaksi" },
  { key: "nilai", label: "Komisi Terbesar" },
  { key: "terbaru", label: "Transaksi Terbaru" },
  { key: "nama", label: "Nama A–Z" },
];

export const SORT_OPTIONS_PARTNER: { key: PartnerSort; label: string }[] = [
  { key: "sering", label: "Paling Sering Bertransaksi" },
  { key: "nilai", label: "Nilai Terbesar" },
  { key: "terbaru", label: "Transaksi Terbaru" },
  { key: "nama", label: "Nama A–Z" },
];

export function parseSort(v: string | undefined): PartnerSort {
  return (PARTNER_SORTS as readonly string[]).includes(v ?? "") ? (v as PartnerSort) : "sering";
}

function UnitHistory({ row, nominalLabel }: { row: PartnerRow; nominalLabel: string }) {
  return (
    <details className="group mt-3 border-t border-white/10 pt-2.5">
      <summary className="cursor-pointer select-none text-[11px] font-bold text-crystal-300 hover:text-crystal-200">
        Riwayat unit ({row.units.length})
      </summary>
      <div className="mt-2 divide-y divide-white/5">
        {row.units.map((u, i) => (
          <div key={`${u.car_id}-${i}`} className="flex items-center justify-between gap-3 py-2 text-xs">
            <div className="min-w-0">
              <Link href={`/mobil/${u.car_id}`} className="block truncate font-semibold text-slate-100 hover:text-crystal-300">
                {u.unit}
              </Link>
              <div className="text-[10px] text-slate-500">
                {u.nopol} • {tanggal(u.tanggal)}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-semibold tabular-nums text-slate-200">{rupiah(u.nominal)}</div>
              {u.komisi > 0 && <div className="text-[10px] text-amber-300">komisi {rupiah(u.komisi)}</div>}
              <div className="text-[10px] text-slate-500">{nominalLabel}</div>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

function CountBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-crystal-500/20 px-2.5 py-1 text-[11px] font-extrabold text-crystal-200 ring-1 ring-inset ring-crystal-400/30">
      <Repeat className="h-3 w-3" /> {n}× transaksi
    </span>
  );
}

export function ListMakelar({ urut }: { urut: PartnerSort }) {
  const brokers = listBrokers(urut);
  const totalKomisi = brokers.reduce((a, b) => a + b.total_komisi, 0);

  const payload = {
    title: "Daftar Makelar",
    period: "Seluruh riwayat transaksi",
    filename: "daftar-makelar",
    headers: ["Nama Makelar", "Jumlah Transaksi", "Total Komisi", "Total Nilai Unit", "Transaksi Terakhir", "Unit"],
    rows: brokers.map((b) => [
      b.nama,
      String(b.jumlah),
      b.total_komisi,
      b.total_nilai,
      tanggal(b.terakhir),
      b.units.map((u) => `${u.unit} ${u.nopol}`).join("; "),
    ]),
  };

  // Urutan makelar "nilai" = komisi terbesar
  const ordered = urut === "nilai" ? [...brokers].sort((a, b) => b.total_komisi - a.total_komisi || b.jumlah - a.jumlah) : brokers;

  return (
    <div className="space-y-3.5">
      <SectionHead
        title="List Makelar"
        subtitle="Makelar / calo yang pernah bertransaksi dengan showroom"
        action={brokers.length > 0 ? <ExportButtons payload={payload} /> : undefined}
      />

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Jumlah Makelar" value={brokers.length} />
        <Stat label="Total Komisi Dibayar" value={rupiah(totalKomisi)} tone="info" />
      </div>

      <SortLinks base={{ tab: "makelar" }} current={urut} options={SORT_OPTIONS_BROKER} />

      {ordered.length === 0 ? (
        <EmptyState icon={<Handshake className="h-7 w-7" />} title="Belum ada data makelar">
          Isi kolom &quot;Nama Makelar&quot; saat mencatat pembelian mobil agar muncul di sini.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {ordered.map((b, idx) => (
            <Card key={b.nama.toLowerCase()} className="rounded-3xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amethyst-500/20 text-sm font-black text-amethyst-300">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-white">{b.nama}</div>
                    <div className="text-[11px] text-slate-400">Terakhir: {tanggal(b.terakhir)}</div>
                  </div>
                </div>
                <CountBadge n={b.jumlah} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-slate-400">Total Komisi</div>
                  <div className="mt-0.5 font-bold tabular-nums text-amber-300">{rupiah(b.total_komisi)}</div>
                </div>
                <div>
                  <div className="text-slate-400">Total Nilai Unit</div>
                  <div className="mt-0.5 font-semibold tabular-nums text-slate-100">{rupiah(b.total_nilai)}</div>
                </div>
              </div>

              <UnitHistory row={b} nominalLabel="harga beli" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ 6. Penjual & pembeli ------------------------------ */

export function ListRelasi({ peran, urut }: { peran: "penjual" | "pembeli"; urut: PartnerSort }) {
  const isSeller = peran === "penjual";
  const rows = isSeller ? listSellers(urut) : listBuyers(urut);
  const totalTransaksi = rows.reduce((a, r) => a + r.jumlah, 0);
  const repeat = rows.filter((r) => r.jumlah > 1).length;

  const payload = {
    title: isSeller ? "Daftar Penjual" : "Daftar Pembeli",
    period: "Seluruh riwayat transaksi",
    filename: isSeller ? "daftar-penjual" : "daftar-pembeli",
    headers: isSeller
      ? ["Nama", "WhatsApp", "Alamat", "Jumlah Transaksi", "Total Nilai", "Transaksi Terakhir"]
      : ["Nama", "WhatsApp / HP", "Jumlah Transaksi", "Total Nilai", "Transaksi Terakhir"],
    rows: rows.map((r) =>
      isSeller
        ? [r.nama, r.telepon ?? "-", r.alamat ?? "-", String(r.jumlah), r.total_nilai, tanggal(r.terakhir)]
        : [r.nama, r.telepon ?? "-", String(r.jumlah), r.total_nilai, tanggal(r.terakhir)],
    ),
  };

  const peranTabs = [
    { key: "penjual", label: "Penjual (Beli dari)" },
    { key: "pembeli", label: "Pembeli (Jual ke)" },
  ] as const;

  return (
    <div className="space-y-3.5">
      <SectionHead
        title="Penjual & Pembeli"
        subtitle="Riwayat orang yang pernah bertransaksi dengan showroom beserta jumlah transaksinya"
        action={rows.length > 0 ? <ExportButtons payload={payload} /> : undefined}
      />

      <div className="flex gap-2">
        {peranTabs.map((t) => (
          <Link
            key={t.key}
            href={`/laporan?${new URLSearchParams({ tab: "relasi", peran: t.key, urut }).toString()}`}
            className={cn(
              "flex-1 rounded-2xl px-3 py-2 text-center text-xs font-bold transition active:scale-95",
              peran === t.key ? "bg-crystal text-slate-950 shadow-md shadow-crystal-500/25" : "glass text-slate-400 hover:text-white"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label={isSeller ? "Jumlah Penjual" : "Jumlah Pembeli"} value={rows.length} />
        <Stat label="Total Transaksi" value={totalTransaksi} />
        <Stat label="Pelanggan Berulang" value={repeat} tone="info" />
      </div>

      <SortLinks base={{ tab: "relasi", peran }} current={urut} options={SORT_OPTIONS_PARTNER} />

      {rows.length === 0 ? (
        <EmptyState icon={<UserRound className="h-7 w-7" />} title={isSeller ? "Belum ada data penjual" : "Belum ada data pembeli"}>
          {isSeller ? "Data muncul setelah ada pembelian mobil." : "Data muncul setelah ada mobil terjual."}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.nama.toLowerCase()} className="rounded-3xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-white">{r.nama}</div>
                  <div className="text-[11px] text-slate-400">Terakhir: {tanggal(r.terakhir)}</div>
                </div>
                <CountBadge n={r.jumlah} />
              </div>

              <div className="mt-2.5 space-y-1 text-xs">
                {r.telepon && (
                  <a
                    href={waLink(r.telepon)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-300 hover:underline"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> {r.telepon}
                  </a>
                )}
                {isSeller && r.alamat && <p className="text-slate-300">{r.alamat}</p>}
              </div>

              <div className="mt-3 text-xs">
                <span className="text-slate-400">{isSeller ? "Total pembelian dari penjual ini: " : "Total belanja pembeli ini: "}</span>
                <strong className="tabular-nums text-slate-100">{rupiah(r.total_nilai)}</strong>
              </div>

              <UnitHistory row={r} nominalLabel={isSeller ? "harga beli" : "harga jual"} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
