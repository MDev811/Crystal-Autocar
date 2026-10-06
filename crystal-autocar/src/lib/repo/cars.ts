/**
 * Repository data mobil, pembelian, biaya unit, tanda jadi, penjualan & dokumen.
 */
import { many, one, run } from "../db";
import type {
  AttachmentType,
  BookingStatus,
  CarCostCategory,
  CarStatus,
  PurchaseSource,
} from "../constants";

export type CarSummary = {
  id: number;
  merek: string;
  tipe: string;
  tahun: number;
  warna: string;
  nopol: string;
  no_rangka: string;
  status: CarStatus;
  catatan: string | null;
  created_at: string;
  tgl_beli: string | null;
  penjual: string | null;
  sumber: PurchaseSource | null;
  harga_beli: number;
  komisi_calo: number;
  total_biaya: number;
  total_modal: number;
  tgl_jual: string | null;
  harga_jual: number | null;
  laba: number | null;
  pembeli: string | null;
  foto: string | null;
};

export type Purchase = {
  id: number;
  car_id: number;
  tanggal: string;
  penjual: string;
  sumber: PurchaseSource;
  harga_beli: number;
  komisi_calo: number;
  keterangan: string | null;
};

export type CarCost = {
  id: number;
  car_id: number;
  tanggal: string;
  kategori: CarCostCategory;
  nominal: number;
  keterangan: string | null;
};

export type Booking = {
  id: number;
  car_id: number;
  tanggal: string;
  pembeli: string;
  telepon: string | null;
  nominal: number;
  status: BookingStatus;
  tanggal_selesai: string | null;
};

export type Sale = {
  id: number;
  car_id: number;
  booking_id: number | null;
  tanggal: string;
  pembeli: string;
  telepon: string | null;
  harga_jual: number;
  tanda_jadi: number;
  total_modal: number;
  laba: number;
  keterangan: string | null;
};

export type Attachment = {
  id: number;
  car_id: number;
  jenis: AttachmentType;
  filename: string;
  original_name: string;
  mime: string;
  size: number;
  created_at: string;
};

export type CarFilter = { status?: CarStatus | "aktif" | "semua"; q?: string; limit?: number };

/** Daftar mobil dengan filter status & pencarian merek/tipe/nopol (FR-04, FR-05) */
export function listCars({ status = "aktif", q, limit = 500 }: CarFilter = {}): CarSummary[] {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (status === "aktif") where.push("status <> 'terjual'");
  else if (status && status !== "semua") {
    where.push("status = ?");
    params.push(status);
  }
  if (q && q.trim()) {
    const like = `%${q.trim().replace(/[%_]/g, "")}%`;
    const nopolLike = `%${q.trim().replace(/[%_\s]/g, "")}%`;
    where.push("(merek LIKE ? OR tipe LIKE ? OR REPLACE(nopol, ' ', '') LIKE ? OR (merek || ' ' || tipe) LIKE ?)");
    params.push(like, like, nopolLike, like);
  }
  const sql = `SELECT * FROM v_car_summary ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY CASE status WHEN 'terjual' THEN 1 ELSE 0 END, COALESCE(tgl_beli, created_at) DESC, id DESC
    LIMIT ?`;
  params.push(limit);
  return many<CarSummary>(sql, ...params);
}

export function countByStatus(): Record<CarStatus, number> {
  const rows = many<{ status: CarStatus; n: number }>("SELECT status, COUNT(*) AS n FROM cars GROUP BY status");
  const out: Record<CarStatus, number> = { tersedia: 0, perbaikan: 0, dipesan: 0, terjual: 0 };
  for (const r of rows) out[r.status] = r.n;
  return out;
}

export function getCarSummary(id: number): CarSummary | undefined {
  return one<CarSummary>("SELECT * FROM v_car_summary WHERE id = ?", id);
}

export function getPurchase(carId: number) {
  return one<Purchase>("SELECT * FROM purchases WHERE car_id = ?", carId);
}

export function listCosts(carId: number) {
  return many<CarCost>("SELECT * FROM car_costs WHERE car_id = ? ORDER BY tanggal DESC, id DESC", carId);
}

export function listBookings(carId: number) {
  return many<Booking>("SELECT * FROM bookings WHERE car_id = ? ORDER BY tanggal DESC, id DESC", carId);
}

export function getActiveBooking(carId: number) {
  return one<Booking>("SELECT * FROM bookings WHERE car_id = ? AND status = 'aktif' ORDER BY id DESC LIMIT 1", carId);
}

export function getSale(carId: number) {
  return one<Sale>("SELECT * FROM sales WHERE car_id = ?", carId);
}

export function listAttachments(carId: number) {
  return many<Attachment>("SELECT * FROM attachments WHERE car_id = ? ORDER BY jenis = 'foto' DESC, id ASC", carId);
}

export function getAttachmentByFilename(filename: string) {
  return one<Attachment>("SELECT * FROM attachments WHERE filename = ?", filename);
}

export function nopolExists(nopol: string, exceptId?: number) {
  const row = one<{ id: number }>(
    "SELECT id FROM cars WHERE REPLACE(nopol,' ','') = REPLACE(?,' ','') AND status <> 'terjual' AND id <> ?",
    nopol,
    exceptId ?? 0,
  );
  return Boolean(row);
}

/** Total modal terkini sebuah unit (FR-08) */
export function totalModal(carId: number): number {
  return one<{ total_modal: number }>("SELECT total_modal FROM v_car_summary WHERE id = ?", carId)?.total_modal ?? 0;
}

/**
 * Sinkronkan snapshot modal & laba di tabel penjualan bila biaya/harga beli
 * diubah setelah mobil terjual — menjaga konsistensi laporan (NFR-07).
 */
export function resyncSale(carId: number) {
  const sale = getSale(carId);
  if (!sale) return;
  const modal = totalModal(carId);
  run("UPDATE sales SET total_modal = ?, laba = harga_jual - ? WHERE id = ?", modal, modal, sale.id);
}

export function touchCar(carId: number) {
  run("UPDATE cars SET updated_at = datetime('now','localtime') WHERE id = ?", carId);
}
