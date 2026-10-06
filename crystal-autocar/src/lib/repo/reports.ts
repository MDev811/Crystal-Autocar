/**
 * Repository laporan keuangan (FR-14, FR-15, FR-16, FR-17).
 *
 * Rumus:
 *  - Laba per unit          = Harga Jual − Total Modal
 *  - Laba bersih periode    = Σ Laba unit terjual + DP hangus − Σ Biaya operasional
 *  - Kas masuk              = Tanda jadi diterima + Pelunasan penjualan (harga jual − tanda jadi)
 *  - Kas keluar             = Harga beli + Komisi calo + Biaya unit + Operasional + DP dikembalikan
 */
import { many, one } from "../db";
import { daysBetween, todayISO } from "../format";
import type { CarStatus, OpexCategory } from "../constants";

/* ----------------------------- Laba per mobil ----------------------------- */

export type CarProfitRow = {
  id: number;
  merek: string;
  tipe: string;
  tahun: number;
  nopol: string;
  tgl_beli: string | null;
  tgl_jual: string;
  pembeli: string;
  harga_beli: number;
  komisi_calo: number;
  total_biaya: number;
  total_modal: number;
  harga_jual: number;
  laba: number;
  lama_hari: number;
};

export function profitPerCar(dari: string, sampai: string): CarProfitRow[] {
  const rows = many<Omit<CarProfitRow, "lama_hari">>(
    `SELECT v.id, v.merek, v.tipe, v.tahun, v.nopol, v.tgl_beli, s.tanggal AS tgl_jual, s.pembeli,
            v.harga_beli, v.komisi_calo, v.total_biaya, s.total_modal, s.harga_jual, s.laba
       FROM sales s JOIN v_car_summary v ON v.id = s.car_id
      WHERE s.tanggal BETWEEN ? AND ?
      ORDER BY s.tanggal DESC, s.id DESC`,
    dari,
    sampai,
  );
  return rows.map((r) => ({ ...r, lama_hari: r.tgl_beli ? daysBetween(r.tgl_beli, r.tgl_jual) : 0 }));
}

/* ---------------------------- Laba per bulan ----------------------------- */

export type MonthlyProfitRow = {
  bulan: string; // YYYY-MM
  unit_terjual: number;
  omzet: number;
  laba_penjualan: number;
  pendapatan_lain: number;
  biaya_operasional: number;
  laba_bersih: number;
};

function monthlyMap(sql: string, ...params: string[]) {
  const map = new Map<string, Record<string, number>>();
  for (const r of many<Record<string, number | string>>(sql, ...params)) {
    const { bulan, ...rest } = r;
    map.set(String(bulan), rest as Record<string, number>);
  }
  return map;
}

/** Laba bulanan untuk rentang bulan [dariBulan, sampaiBulan] (format YYYY-MM) */
export function profitMonthlyRange(dariBulan: string, sampaiBulan: string): MonthlyProfitRow[] {
  const sales = monthlyMap(
    `SELECT substr(tanggal,1,7) AS bulan, COUNT(*) AS unit, SUM(harga_jual) AS omzet, SUM(laba) AS laba
       FROM sales WHERE substr(tanggal,1,7) BETWEEN ? AND ? GROUP BY bulan`,
    dariBulan,
    sampaiBulan,
  );
  const hangus = monthlyMap(
    `SELECT substr(tanggal_selesai,1,7) AS bulan, SUM(nominal) AS total
       FROM bookings WHERE status = 'hangus' AND substr(tanggal_selesai,1,7) BETWEEN ? AND ? GROUP BY bulan`,
    dariBulan,
    sampaiBulan,
  );
  const opex = monthlyMap(
    `SELECT substr(tanggal,1,7) AS bulan, SUM(nominal) AS total
       FROM operational_expenses WHERE substr(tanggal,1,7) BETWEEN ? AND ? GROUP BY bulan`,
    dariBulan,
    sampaiBulan,
  );

  const out: MonthlyProfitRow[] = [];
  let [y, m] = dariBulan.split("-").map(Number);
  const [ey, em] = sampaiBulan.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    const s = sales.get(key);
    const lain = hangus.get(key)?.total ?? 0;
    const biaya = opex.get(key)?.total ?? 0;
    const labaJual = s?.laba ?? 0;
    out.push({
      bulan: key,
      unit_terjual: s?.unit ?? 0,
      omzet: s?.omzet ?? 0,
      laba_penjualan: labaJual,
      pendapatan_lain: lain,
      biaya_operasional: biaya,
      laba_bersih: labaJual + lain - biaya,
    });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

export function profitMonthly(tahun: number): MonthlyProfitRow[] {
  return profitMonthlyRange(`${tahun}-01`, `${tahun}-12`);
}

export type YearlyProfitRow = Omit<MonthlyProfitRow, "bulan"> & { tahun: string };

export function profitYearly(): YearlyProfitRow[] {
  const years = many<{ y: string }>(
    `SELECT DISTINCT y FROM (
       SELECT substr(tanggal,1,4) AS y FROM sales
       UNION SELECT substr(tanggal,1,4) FROM operational_expenses
       UNION SELECT substr(tanggal_selesai,1,4) FROM bookings WHERE status='hangus'
     ) WHERE y IS NOT NULL ORDER BY y DESC`,
  );
  return years.map(({ y }) => {
    const rows = profitMonthly(Number(y));
    const sum = (k: keyof MonthlyProfitRow) => rows.reduce((a, r) => a + Number(r[k]), 0);
    return {
      tahun: y,
      unit_terjual: sum("unit_terjual"),
      omzet: sum("omzet"),
      laba_penjualan: sum("laba_penjualan"),
      pendapatan_lain: sum("pendapatan_lain"),
      biaya_operasional: sum("biaya_operasional"),
      laba_bersih: sum("laba_bersih"),
    };
  });
}

/* ------------------------------- Arus kas -------------------------------- */

export type CashEntry = {
  tanggal: string;
  jenis: "masuk" | "keluar";
  kategori: string;
  keterangan: string;
  nominal: number;
  car_id: number | null;
};

const CASH_UNION = `
  SELECT p.tanggal, 'keluar' AS jenis, 'Pembelian Mobil' AS kategori,
         c.merek || ' ' || c.tipe || ' (' || c.nopol || ') dari ' || p.penjual AS keterangan,
         p.harga_beli AS nominal, c.id AS car_id
    FROM purchases p JOIN cars c ON c.id = p.car_id
  UNION ALL
  SELECT p.tanggal, 'keluar', 'Komisi Calo', c.merek || ' ' || c.tipe || ' (' || c.nopol || ')',
         p.komisi_calo, c.id
    FROM purchases p JOIN cars c ON c.id = p.car_id WHERE p.komisi_calo > 0
  UNION ALL
  SELECT cc.tanggal, 'keluar', 'Biaya Unit',
         c.merek || ' ' || c.tipe || ' (' || c.nopol || ')' || COALESCE(' — ' || cc.keterangan, ''),
         cc.nominal, c.id
    FROM car_costs cc JOIN cars c ON c.id = cc.car_id
  UNION ALL
  SELECT o.tanggal, 'keluar', 'Operasional', o.kategori || COALESCE(' — ' || o.keterangan, ''), o.nominal, NULL
    FROM operational_expenses o
  UNION ALL
  SELECT b.tanggal, 'masuk', 'Tanda Jadi', c.merek || ' ' || c.tipe || ' (' || c.nopol || ') dari ' || b.pembeli,
         b.nominal, c.id
    FROM bookings b JOIN cars c ON c.id = b.car_id
  UNION ALL
  SELECT b.tanggal_selesai, 'keluar', 'Pengembalian Tanda Jadi',
         c.merek || ' ' || c.tipe || ' (' || c.nopol || ') ke ' || b.pembeli, b.nominal, c.id
    FROM bookings b JOIN cars c ON c.id = b.car_id WHERE b.status = 'dikembalikan'
  UNION ALL
  SELECT s.tanggal, 'masuk', 'Penjualan Mobil',
         c.merek || ' ' || c.tipe || ' (' || c.nopol || ') ke ' || s.pembeli, s.harga_jual - s.tanda_jadi, c.id
    FROM sales s JOIN cars c ON c.id = s.car_id
`;

const OPEX_NAMES: Record<OpexCategory, string> = {
  listrik: "Listrik",
  iklan: "Iklan Marketplace",
  internet: "Internet",
  lainnya: "Lainnya",
};

export function cashFlow(dari: string, sampai: string) {
  const entries = many<CashEntry>(
    `SELECT * FROM (${CASH_UNION}) WHERE nominal > 0 AND tanggal BETWEEN ? AND ? ORDER BY tanggal DESC`,
    dari,
    sampai,
  ).map((e) => {
    if (e.kategori !== "Operasional") return e;
    const [kat, ...rest] = e.keterangan.split(" — ");
    return { ...e, keterangan: [OPEX_NAMES[kat as OpexCategory] ?? kat, ...rest].join(" — ") };
  });
  const masuk = entries.filter((e) => e.jenis === "masuk").reduce((a, e) => a + e.nominal, 0);
  const keluar = entries.filter((e) => e.jenis === "keluar").reduce((a, e) => a + e.nominal, 0);

  const byKategori = new Map<string, { jenis: "masuk" | "keluar"; total: number }>();
  for (const e of entries) {
    const k = byKategori.get(e.kategori) ?? { jenis: e.jenis, total: 0 };
    k.total += e.nominal;
    byKategori.set(e.kategori, k);
  }

  return {
    entries,
    masuk,
    keluar,
    neto: masuk - keluar,
    perKategori: [...byKategori.entries()].map(([kategori, v]) => ({ kategori, ...v })),
  };
}

export function cashTotals(dari: string, sampai: string) {
  const r = one<{ masuk: number; keluar: number }>(
    `SELECT COALESCE(SUM(CASE WHEN jenis='masuk' THEN nominal END),0) AS masuk,
            COALESCE(SUM(CASE WHEN jenis='keluar' THEN nominal END),0) AS keluar
       FROM (${CASH_UNION}) WHERE tanggal BETWEEN ? AND ?`,
    dari,
    sampai,
  );
  return { masuk: r?.masuk ?? 0, keluar: r?.keluar ?? 0 };
}

export function recentCash(limit = 6) {
  return many<CashEntry>(`SELECT * FROM (${CASH_UNION}) WHERE nominal > 0 ORDER BY tanggal DESC LIMIT ?`, limit);
}

/* ------------------------------ Laporan stok ----------------------------- */

export type StockRow = {
  id: number;
  merek: string;
  tipe: string;
  tahun: number;
  warna: string;
  nopol: string;
  status: CarStatus;
  tgl_beli: string | null;
  harga_beli: number;
  komisi_calo: number;
  total_biaya: number;
  total_modal: number;
  lama_hari: number;
};

export function stockReport() {
  const today = todayISO();
  const rows = many<Omit<StockRow, "lama_hari">>(
    `SELECT id, merek, tipe, tahun, warna, nopol, status, tgl_beli, harga_beli, komisi_calo, total_biaya, total_modal
       FROM v_car_summary WHERE status <> 'terjual' ORDER BY tgl_beli ASC`,
  ).map((r) => ({ ...r, lama_hari: r.tgl_beli ? daysBetween(r.tgl_beli, today) : 0 }));
  const nilai = rows.reduce((a, r) => a + r.total_modal, 0);
  const rata = rows.length ? Math.round(rows.reduce((a, r) => a + r.lama_hari, 0) / rows.length) : 0;
  return { rows, nilai, rataHari: rata };
}

/* -------------------------------- Lainnya -------------------------------- */

export type OpexRow = {
  id: number;
  tanggal: string;
  kategori: OpexCategory;
  nominal: number;
  keterangan: string | null;
};

export function listOpex(dari: string, sampai: string) {
  return many<OpexRow>(
    "SELECT * FROM operational_expenses WHERE tanggal BETWEEN ? AND ? ORDER BY tanggal DESC, id DESC",
    dari,
    sampai,
  );
}

export function availableYears(): number[] {
  const rows = many<{ y: string }>(
    `SELECT DISTINCT y FROM (
       SELECT substr(tanggal,1,4) AS y FROM sales
       UNION SELECT substr(tanggal,1,4) FROM purchases
       UNION SELECT substr(tanggal,1,4) FROM operational_expenses
     ) WHERE y IS NOT NULL ORDER BY y DESC`,
  );
  const years = rows.map((r) => Number(r.y));
  const now = new Date().getFullYear();
  if (!years.includes(now)) years.unshift(now);
  return years;
}
