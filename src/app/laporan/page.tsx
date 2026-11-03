import Link from "next/link";
import { ArrowLeftRight, Car, Handshake, Layers, Lock, TrendingUp, Users } from "lucide-react";
import { AppShell } from "@/components/nav";
import { PageHeader, cn } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { LockedPageNotice } from "@/components/locked-modal";
import {
  ListMakelar,
  ListRelasi,
  parseSort,
} from "./sections";

export const metadata = {
  title: "Laporan Showroom",
};

const TABS = [
  { key: "laba", label: "Laba per Mobil", icon: Car, locked: true },
  { key: "bersih", label: "Laba Bersih Showroom", icon: TrendingUp, locked: true },
  { key: "kas", label: "Arus Kas (Cash Flow)", icon: ArrowLeftRight, locked: true },
  { key: "stok", label: "Nilai Stok & Aging", icon: Layers, locked: true },
  { key: "makelar", label: "List Makelar", icon: Handshake, locked: false },
  { key: "relasi", label: "Penjual & Pembeli", icon: Users, locked: false },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function LaporanPage(props: {
  searchParams: Promise<{ tab?: string; urut?: string; peran?: string }>;
}) {
  const user = await requireUser();
  const sp = await props.searchParams;

  // Default tab adalah tab aktif yang sudah dibuka: List Makelar
  const tab: TabKey = TABS.some((t) => t.key === sp.tab) ? (sp.tab as TabKey) : "makelar";
  const urut = parseSort(sp.urut);
  const peran = sp.peran === "pembeli" ? "pembeli" : "penjual";
  const active = TABS.find((t) => t.key === tab)!;

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-3xl space-y-4">
        <PageHeader
          title="Laporan & Relasi"
          subtitle="Rekap mitra makelar, penjual, dan pelanggan showroom"
        />

        {/* Tab navigasi (scroll horizontal di layar kecil) */}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === tab;
            return (
              <Link
                key={t.key}
                href={`/laporan?tab=${t.key}`}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition active:scale-95",
                  isActive
                    ? t.locked
                      ? "bg-amber-500/25 text-amber-200 ring-1 ring-amber-400/50 shadow-md shadow-amber-500/20"
                      : "bg-crystal text-slate-950 shadow-md shadow-crystal-500/25"
                    : t.locked
                      ? "glass text-slate-400 hover:bg-white/10 hover:text-slate-200"
                      : "glass text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
                {t.locked && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                    <Lock className="h-2 w-2 stroke-[2.5]" />
                    <span>Sprint 4</span>
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Tampilan Konten Tab */}
        {active.locked ? (
          <div className="py-2">
            <LockedPageNotice
              info={{
                reqCode: "FR-14 s.d. FR-16, FR-18",
                title: active.label,
                featureName: active.label,
                sprint: "Sprint 4",
                week: "Minggu 7",
                description: `Fitur "${active.label}" dijadwalkan untuk dirilis pada Sprint 4. Tab List Makelar serta Penjual & Pembeli telah dibuka dan siap digunakan.`,
              }}
              backHref="/laporan?tab=makelar"
              backLabel="Buka Tab List Makelar"
            />
          </div>
        ) : (
          <>
            {tab === "makelar" && <ListMakelar urut={urut} />}
            {tab === "relasi" && <ListRelasi peran={peran} urut={urut} />}
          </>
        )}
      </div>
    </AppShell>
  );
}
