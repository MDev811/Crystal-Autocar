/**
 * Konstanta domain aplikasi Crystal Autocar.
 * Dipakai bersama oleh server (validasi) dan client (tampilan).
 */

export const CAR_STATUSES = ["tersedia", "perbaikan", "dipesan", "terjual"] as const;
export type CarStatus = (typeof CAR_STATUSES)[number];

export const CAR_STATUS_LABEL: Record<CarStatus, string> = {
  tersedia: "Tersedia",
  perbaikan: "Dalam Perbaikan",
  dipesan: "Dipesan",
  terjual: "Terjual",
};

/** Sumber pembelian mobil (FR-06) */
export const PURCHASE_SOURCES = ["marketplace", "makelar", "lainnya"] as const;
export type PurchaseSource = (typeof PURCHASE_SOURCES)[number];
export const PURCHASE_SOURCE_LABEL: Record<PurchaseSource, string> = {
  marketplace: "Marketplace",
  makelar: "Makelar",
  lainnya: "Lainnya",
};

/** Kategori biaya per unit (FR-07) */
export const CAR_COST_CATEGORIES = ["cuci_poles", "sparepart", "bensin", "lainnya"] as const;
export type CarCostCategory = (typeof CAR_COST_CATEGORIES)[number];
export const CAR_COST_LABEL: Record<CarCostCategory, string> = {
  cuci_poles: "Cuci & Poles",
  sparepart: "Sparepart",
  bensin: "Bensin",
  lainnya: "Lainnya",
};

/** Kategori pengeluaran operasional (FR-13) */
export const OPEX_CATEGORIES = ["listrik", "iklan", "internet", "lainnya"] as const;
export type OpexCategory = (typeof OPEX_CATEGORIES)[number];
export const OPEX_LABEL: Record<OpexCategory, string> = {
  listrik: "Listrik",
  iklan: "Iklan Marketplace",
  internet: "Internet",
  lainnya: "Lainnya",
};

/** Status tanda jadi (FR-09) */
export const BOOKING_STATUSES = ["aktif", "terpakai", "dikembalikan", "hangus"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  aktif: "Aktif",
  terpakai: "Dipakai di Penjualan",
  dikembalikan: "Dikembalikan",
  hangus: "Hangus",
};

/** Jenis dokumen yang dapat diunggah (FR-19) */
export const ATTACHMENT_TYPES = ["foto", "nota", "stnk", "bpkb", "lainnya"] as const;
export type AttachmentType = (typeof ATTACHMENT_TYPES)[number];
export const ATTACHMENT_LABEL: Record<AttachmentType, string> = {
  foto: "Foto Mobil",
  nota: "Nota",
  stnk: "STNK",
  bpkb: "BPKB",
  lainnya: "Lainnya",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB per berkas
export const ALLOWED_UPLOAD_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/** Sesi berakhir otomatis jika tidak aktif (NFR-03) */
export const SESSION_IDLE_MINUTES = 30;
