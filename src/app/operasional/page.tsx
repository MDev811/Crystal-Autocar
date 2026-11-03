import { AppShell } from "@/components/nav";
import { requireUser } from "@/lib/session";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { listOpex } from "@/lib/repo/reports";
import { OPEX_LABEL, type OpexCategory } from "@/lib/constants";
import { rupiah, tanggal, todayISO } from "@/lib/format";
import { AddOpexModal, DeleteOpexButton } from "./client";
import { Receipt, Calendar, Zap, Megaphone, Globe, Layers } from "lucide-react";

export const metadata = {
  title: "Biaya Operasional",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const validDate = (v: string | undefined, fallback: string) =>
  v && ISO_DATE.test(v) && !Number.isNaN(new Date(v).getTime()) ? v : fallback;

const OPEX_ICONS: Record<OpexCategory, typeof Zap> = {
  listrik: Zap,
  iklan: Megaphone,
  internet: Globe,
  lainnya: Layers,
};

export default async function OperasionalPage(props: {
  searchParams: Promise<{ dari?: string; sampai?: string; tambah?: string }>;
}) {
  const user = await requireUser();
  const sp = await props.searchParams;
  const isTambah = sp.tambah === "1";

  const year = todayISO().slice(0, 4);
  let dari = validDate(sp.dari, `${year}-01-01`);
  let sampai = validDate(sp.sampai, `${year}-12-31`);
  if (dari > sampai) [dari, sampai] = [sampai, dari];

  const rows = listOpex(dari, sampai);
  const total = rows.reduce((a, r) => a + r.nominal, 0);

  // Rekap per kategori
  const byKat: Record<string, number> = { listrik: 0, iklan: 0, internet: 0, lainnya: 0 };
  for (const r of rows) {
    byKat[r.kategori] = (byKat[r.kategori] ?? 0) + r.nominal;
  }

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-3xl space-y-4">
        <PageHeader
          title="Beban Operasional"
          subtitle="Pencatatan beban rutin showroom (listrik, iklan, internet, dll)"
          action={<AddOpexModal defaultOpen={isTambah} />}
        />

        {/* Filter Rentang Tanggal */}
        <form method="GET" action="/operasional" className="glass rounded-2xl p-3 flex flex-wrap items-center gap-2.5">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Periode:</span>
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

        {/* Ringkasan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3.5 rounded-2xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Operasional</div>
            <div className="mt-1 text-base font-black tabular-nums text-rose-300">{rupiah(total)}</div>
          </Card>
          <Card className="p-3.5 rounded-2xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Iklan Marketplace</div>
            <div className="mt-1 text-base font-black tabular-nums text-slate-200">{rupiah(byKat.iklan)}</div>
          </Card>
          <Card className="p-3.5 rounded-2xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Listrik</div>
            <div className="mt-1 text-base font-black tabular-nums text-slate-200">{rupiah(byKat.listrik)}</div>
          </Card>
          <Card className="p-3.5 rounded-2xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Internet & Lainnya</div>
            <div className="mt-1 text-base font-black tabular-nums text-slate-200">{rupiah(byKat.internet + byKat.lainnya)}</div>
          </Card>
        </div>

        {/* Daftar Catatan Pengeluaran */}
        <Card className="rounded-3xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Riwayat Beban Operasional ({rows.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              {tanggal(dari)} s/d {tanggal(sampai)}
            </span>
          </div>

          {rows.length === 0 ? (
            <EmptyState icon={<Receipt className="h-7 w-7" />} title="Belum ada catatan operasional">
              Klik &quot;Catat Operasional&quot; di atas untuk mencatat beban listrik, iklan, atau internet.
            </EmptyState>
          ) : (
            <div className="divide-y divide-white/5">
              {rows.map((r) => {
                const Icon = OPEX_ICONS[r.kategori] ?? Layers;
                return (
                  <div key={r.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-crystal-300 ring-1 ring-white/10">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{OPEX_LABEL[r.kategori]}</span>
                          <span className="text-[10px] text-slate-400">{tanggal(r.tanggal)}</span>
                        </div>
                        {r.keterangan && (
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{r.keterangan}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-rose-300 tabular-nums">{rupiah(r.nominal)}</span>
                      <DeleteOpexButton id={r.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
