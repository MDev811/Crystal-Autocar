/**
 * Skema validasi input (NFR-04). Semua data dari form divalidasi di server
 * sebelum menyentuh database. Pesan error berbahasa Indonesia (NFR-05).
 */
import { z } from "zod";
import {
  ATTACHMENT_TYPES,
  BOOKING_STATUSES,
  CAR_COST_CATEGORIES,
  OPEX_CATEGORIES,
  PURCHASE_SOURCES,
} from "./constants";

/** Hapus karakter kontrol & spasi berlebih */
const clean = (v: unknown) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim() : v;

const text = (label: string, max = 100) =>
  z.preprocess(clean, z.string(`${label} wajib diisi`).min(1, `${label} wajib diisi`).max(max, `${label} maksimal ${max} karakter`));

const optionalText = (max = 300) =>
  z.preprocess(
    (v) => {
      const c = clean(v);
      return c === "" || c === null || c === undefined ? null : c;
    },
    z.string().max(max, `Maksimal ${max} karakter`).nullable(),
  );

/** Uang dalam Rupiah: menerima "150.000.000" atau "150000000" */
const money = (label: string, { allowZero = false } = {}) =>
  z.preprocess(
    (v) => {
      if (typeof v !== "string") return v;
      const digits = v.replace(/\D/g, "");
      return digits === "" ? undefined : Number(digits);
    },
    z
      .number(`${label} wajib diisi`)
      .int()
      .min(allowZero ? 0 : 1, allowZero ? `${label} tidak boleh negatif` : `${label} harus lebih dari 0`)
      .max(100_000_000_000, `${label} terlalu besar`),
  );

const optionalMoney = (label: string) =>
  z.preprocess((v) => (typeof v === "string" && v.replace(/\D/g, "") === "" ? "0" : v), money(label, { allowZero: true }));

const date = (label = "Tanggal") =>
  z
    .string(`${label} wajib diisi`)
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} tidak valid`)
    .refine((v) => !Number.isNaN(new Date(v).getTime()), `${label} tidak valid`);

const phone = z.preprocess(
  (v) => {
    const c = clean(v);
    return c === "" || c === undefined ? null : c;
  },
  z.string().regex(/^[0-9+\-\s()]{6,20}$/, "Nomor telepon tidak valid").nullable(),
);

const thisYear = new Date().getFullYear();

export const carSchema = z.object({
  merek: text("Merek", 50),
  tipe: text("Tipe", 80),
  tahun: z.coerce
    .number("Tahun wajib diisi")
    .int("Tahun tidak valid")
    .min(1970, "Tahun minimal 1970")
    .max(thisYear + 1, `Tahun maksimal ${thisYear + 1}`),
  warna: text("Warna", 30),
  nopol: z.preprocess(
    (v) => (typeof v === "string" ? v.toUpperCase().replace(/\s+/g, " ").trim() : v),
    z.string("Nomor polisi wajib diisi").regex(/^[A-Z]{1,2} ?\d{1,4} ?[A-Z]{0,3}$/, "Format nomor polisi tidak valid (contoh: B 1234 ABC)"),
  ),
  no_rangka: z.preprocess(
    (v) => (typeof v === "string" ? v.toUpperCase().replace(/\s+/g, "") : v),
    z.string("Nomor rangka wajib diisi").regex(/^[A-Z0-9]{5,20}$/, "Nomor rangka 5–20 karakter huruf/angka"),
  ),
  catatan: optionalText(500),
});

export const purchaseSchema = z.object({
  tgl_beli: date("Tanggal beli"),
  penjual: text("Nama penjual", 80),
  sumber: z.enum(PURCHASE_SOURCES, "Pilih sumber pembelian"),
  harga_beli: money("Harga beli"),
  komisi_calo: optionalMoney("Komisi calo"),
  ket_beli: optionalText(300),
});

export const newCarSchema = carSchema.extend(purchaseSchema.shape).extend({
  status_awal: z.enum(["tersedia", "perbaikan"], "Pilih status awal"),
});

export const carCostSchema = z.object({
  tanggal: date(),
  kategori: z.enum(CAR_COST_CATEGORIES, "Pilih kategori biaya"),
  nominal: money("Nominal"),
  keterangan: optionalText(300),
});

export const bookingSchema = z.object({
  tanggal: date(),
  pembeli: text("Nama pembeli", 80),
  telepon: phone,
  nominal: money("Nominal tanda jadi"),
});

export const bookingCloseSchema = z.object({
  status: z.enum(BOOKING_STATUSES).refine((s) => s === "dikembalikan" || s === "hangus", "Status tidak valid"),
  tanggal: date(),
});

export const saleSchema = z.object({
  tanggal: date("Tanggal jual"),
  pembeli: text("Nama pembeli", 80),
  telepon: phone,
  harga_jual: money("Harga jual"),
  keterangan: optionalText(300),
});

export const opexSchema = z.object({
  tanggal: date(),
  kategori: z.enum(OPEX_CATEGORIES, "Pilih kategori"),
  nominal: money("Nominal"),
  keterangan: optionalText(300),
});

export const attachmentSchema = z.object({
  jenis: z.enum(ATTACHMENT_TYPES, "Pilih jenis dokumen"),
});

export const loginSchema = z.object({
  username: z.preprocess(clean, z.string().min(1, "Username wajib diisi").max(50)),
  password: z.string().min(1, "Password wajib diisi").max(100),
});

export const changePasswordSchema = z
  .object({
    password_lama: z.string().min(1, "Password lama wajib diisi"),
    password_baru: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .max(100)
      .regex(/[A-Za-z]/, "Harus mengandung huruf")
      .regex(/\d/, "Harus mengandung angka"),
    konfirmasi: z.string(),
  })
  .refine((d) => d.password_baru === d.konfirmasi, { path: ["konfirmasi"], message: "Konfirmasi password tidak sama" });

export const idSchema = z.coerce.number().int().positive();

/** Konversi error Zod menjadi { field: pesan } */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
