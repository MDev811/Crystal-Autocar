"use server";
/**
 * Aksi data mobil & transaksinya (FR-03 s/d FR-12, FR-19).
 * Setiap aksi: cek login → validasi → transaksi DB → revalidasi halaman.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { run, tx } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  attachmentSchema,
  bookingCloseSchema,
  bookingSchema,
  carCostSchema,
  carSchema,
  fieldErrors,
  idSchema,
  newCarSchema,
  purchaseSchema,
  saleSchema,
} from "@/lib/validation";
import {
  getActiveBooking,
  getCarSummary,
  getSale,
  listAttachments,
  nopolExists,
  resyncSale,
  totalModal,
  touchCar,
} from "@/lib/repo/cars";
import { deleteUploadFile, saveUpload } from "@/lib/uploads";
import type { ActionState } from "@/lib/action-state";

function refresh(carId?: number) {
  revalidatePath("/", "layout");
  if (carId) revalidatePath(`/mobil/${carId}`);
}

const form = (fd: FormData) => Object.fromEntries(fd);

/* --------------------------- Mobil + Pembelian --------------------------- */

export async function createCarAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = newCarSchema.safeParse(form(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Periksa kembali isian yang ditandai." };
  const d = parsed.data;
  if (nopolExists(d.nopol)) return { errors: { nopol: "Nomor polisi sudah terdaftar di stok" } };

  const carId = tx(() => {
    const { lastId } = run(
      "INSERT INTO cars (merek, tipe, tahun, warna, nopol, no_rangka, status, catatan) VALUES (?,?,?,?,?,?,?,?)",
      d.merek, d.tipe, d.tahun, d.warna, d.nopol, d.no_rangka, d.status_awal, d.catatan,
    );
    run(
      "INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan) VALUES (?,?,?,?,?,?,?)",
      lastId, d.tgl_beli, d.penjual, d.sumber, d.harga_beli, d.komisi_calo, d.ket_beli,
    );
    return lastId;
  });

  refresh();
  redirect(`/mobil/${carId}?baru=1`);
}

const updateCarSchema = carSchema.extend(purchaseSchema.shape).extend({
  status: z.enum(["tersedia", "perbaikan"]).optional(),
});

export async function updateCarAction(carId: number, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const car = getCarSummary(idSchema.parse(carId));
  if (!car) return { message: "Data mobil tidak ditemukan." };

  const parsed = updateCarSchema.safeParse(form(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Periksa kembali isian yang ditandai." };
  const d = parsed.data;
  if (nopolExists(d.nopol, car.id)) return { errors: { nopol: "Nomor polisi sudah dipakai mobil lain di stok" } };

  // Status hanya bisa diubah manual antara Tersedia <-> Dalam Perbaikan
  const status = d.status && (car.status === "tersedia" || car.status === "perbaikan") ? d.status : car.status;

  tx(() => {
    run(
      `UPDATE cars SET merek=?, tipe=?, tahun=?, warna=?, nopol=?, no_rangka=?, catatan=?, status=?,
              updated_at = datetime('now','localtime') WHERE id=?`,
      d.merek, d.tipe, d.tahun, d.warna, d.nopol, d.no_rangka, d.catatan, status, car.id,
    );
    run(
      `INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan)
       VALUES (?,?,?,?,?,?,?)
       ON CONFLICT(car_id) DO UPDATE SET tanggal=excluded.tanggal, penjual=excluded.penjual, sumber=excluded.sumber,
         harga_beli=excluded.harga_beli, komisi_calo=excluded.komisi_calo, keterangan=excluded.keterangan`,
      car.id, d.tgl_beli, d.penjual, d.sumber, d.harga_beli, d.komisi_calo, d.ket_beli,
    );
    resyncSale(car.id);
  });

  refresh(car.id);
  redirect(`/mobil/${car.id}`);
}

export async function setRepairStatusAction(carId: number, status: "tersedia" | "perbaikan") {
  await requireUser();
  run(
    "UPDATE cars SET status = ?, updated_at = datetime('now','localtime') WHERE id = ? AND status IN ('tersedia','perbaikan')",
    status,
    idSchema.parse(carId),
  );
  refresh(carId);
}

export async function deleteCarAction(carId: number) {
  await requireUser();
  const id = idSchema.parse(carId);
  const files = listAttachments(id);
  run("DELETE FROM cars WHERE id = ?", id); // cascade ke tabel turunan
  await Promise.all(files.map((f) => deleteUploadFile(f.filename)));
  refresh();
  redirect("/mobil");
}

/* ------------------------------ Biaya unit ------------------------------- */

export async function addCostAction(carId: number, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const car = getCarSummary(idSchema.parse(carId));
  if (!car) return { message: "Data mobil tidak ditemukan." };
  const parsed = carCostSchema.safeParse(form(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  tx(() => {
    run(
      "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?,?,?,?,?)",
      car.id, d.tanggal, d.kategori, d.nominal, d.keterangan,
    );
    touchCar(car.id);
    resyncSale(car.id);
  });

  refresh(car.id);
  return { ok: true, message: "Biaya berhasil dicatat. Total modal diperbarui otomatis.", ts: Date.now() };
}

export async function deleteCostAction(carId: number, costId: number) {
  await requireUser();
  tx(() => {
    run("DELETE FROM car_costs WHERE id = ? AND car_id = ?", idSchema.parse(costId), idSchema.parse(carId));
    resyncSale(carId);
  });
  refresh(carId);
}

/* ------------------------------ Tanda jadi ------------------------------- */

export async function addBookingAction(carId: number, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const car = getCarSummary(idSchema.parse(carId));
  if (!car) return { message: "Data mobil tidak ditemukan." };
  if (car.status === "terjual") return { message: "Mobil sudah terjual." };
  if (getActiveBooking(car.id)) return { message: "Mobil ini sudah memiliki tanda jadi aktif." };

  const parsed = bookingSchema.safeParse(form(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  tx(() => {
    run(
      "INSERT INTO bookings (car_id, tanggal, pembeli, telepon, nominal) VALUES (?,?,?,?,?)",
      car.id, d.tanggal, d.pembeli, d.telepon, d.nominal,
    );
    run("UPDATE cars SET status = 'dipesan', updated_at = datetime('now','localtime') WHERE id = ?", car.id);
  });

  refresh(car.id);
  redirect(`/mobil/${car.id}`);
}

export async function closeBookingAction(carId: number, bookingId: number, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = bookingCloseSchema.safeParse(form(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const id = idSchema.parse(carId);

  tx(() => {
    const r = run(
      "UPDATE bookings SET status = ?, tanggal_selesai = ? WHERE id = ? AND car_id = ? AND status = 'aktif'",
      parsed.data.status, parsed.data.tanggal, idSchema.parse(bookingId), id,
    );
    if (r.changes > 0) {
      run("UPDATE cars SET status = 'tersedia', updated_at = datetime('now','localtime') WHERE id = ? AND status = 'dipesan'", id);
    }
  });

  refresh(id);
  return { ok: true, message: "Tanda jadi dibatalkan. Status mobil kembali Tersedia.", ts: Date.now() };
}

/* ------------------------------- Penjualan ------------------------------- */

export async function addSaleAction(carId: number, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const car = getCarSummary(idSchema.parse(carId));
  if (!car) return { message: "Data mobil tidak ditemukan." };
  if (getSale(car.id)) return { message: "Mobil ini sudah tercatat terjual." };

  const parsed = saleSchema.safeParse(form(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const booking = getActiveBooking(car.id);
  const tandaJadi = booking?.nominal ?? 0;
  if (d.harga_jual < tandaJadi) return { errors: { harga_jual: "Harga jual tidak boleh kurang dari tanda jadi" } };
  if (car.tgl_beli && d.tanggal < car.tgl_beli) return { errors: { tanggal: "Tanggal jual tidak boleh sebelum tanggal beli" } };

  tx(() => {
    const modal = totalModal(car.id);
    run(
      `INSERT INTO sales (car_id, booking_id, tanggal, pembeli, telepon, harga_jual, tanda_jadi, total_modal, laba, keterangan)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      car.id, booking?.id ?? null, d.tanggal, d.pembeli, d.telepon, d.harga_jual, tandaJadi, modal, d.harga_jual - modal, d.keterangan,
    );
    if (booking) run("UPDATE bookings SET status = 'terpakai', tanggal_selesai = ? WHERE id = ?", d.tanggal, booking.id);
    // FR-12: status otomatis menjadi Terjual
    run("UPDATE cars SET status = 'terjual', updated_at = datetime('now','localtime') WHERE id = ?", car.id);
  });

  refresh(car.id);
  redirect(`/mobil/${car.id}?terjual=1`);
}

export async function cancelSaleAction(carId: number) {
  await requireUser();
  const id = idSchema.parse(carId);
  const sale = getSale(id);
  if (!sale) return;
  tx(() => {
    run("DELETE FROM sales WHERE id = ?", sale.id);
    if (sale.booking_id) {
      run("UPDATE bookings SET status = 'aktif', tanggal_selesai = NULL WHERE id = ?", sale.booking_id);
      run("UPDATE cars SET status = 'dipesan', updated_at = datetime('now','localtime') WHERE id = ?", id);
    } else {
      run("UPDATE cars SET status = 'tersedia', updated_at = datetime('now','localtime') WHERE id = ?", id);
    }
  });
  refresh(id);
}

/* ---------------------------- Foto & Dokumen ----------------------------- */

export async function uploadAttachmentAction(carId: number, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const car = getCarSummary(idSchema.parse(carId));
  if (!car) return { message: "Data mobil tidak ditemukan." };
  const parsed = attachmentSchema.safeParse(form(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const files = fd.getAll("berkas").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { errors: { berkas: "Pilih minimal satu berkas" } };
  if (files.length > 6) return { errors: { berkas: "Maksimal 6 berkas sekali unggah" } };

  const saved: { filename: string; mime: string; size: number; originalName: string }[] = [];
  for (const file of files) {
    const res = await saveUpload(file);
    if ("error" in res) {
      await Promise.all(saved.map((s) => deleteUploadFile(s.filename)));
      return { errors: { berkas: `${file.name}: ${res.error}` } };
    }
    saved.push(res);
  }

  tx(() => {
    for (const s of saved) {
      run(
        "INSERT INTO attachments (car_id, jenis, filename, original_name, mime, size) VALUES (?,?,?,?,?,?)",
        car.id, parsed.data.jenis, s.filename, s.originalName, s.mime, s.size,
      );
    }
  });

  refresh(car.id);
  return { ok: true, message: `${saved.length} berkas berhasil diunggah.`, ts: Date.now() };
}

export async function deleteAttachmentAction(carId: number, attachmentId: number) {
  await requireUser();
  const id = idSchema.parse(carId);
  const file = listAttachments(id).find((a) => a.id === attachmentId);
  if (!file) return;
  run("DELETE FROM attachments WHERE id = ?", file.id);
  await deleteUploadFile(file.filename);
  refresh(id);
}
