import type { LockedFeatureInfo } from "@/components/locked-modal";

export const LOCKED_FEATURES: Record<string, LockedFeatureInfo> = {
  tandaJadi: {
    reqCode: "FR-09, FR-10",
    title: "Tanda Jadi (DP Booking)",
    featureName: "Tanda Jadi",
    sprint: "Sprint 2",
    week: "Minggu 5",
    description:
      "✅ Fitur penerimaan uang tanda jadi (DP), status mobil 'Dipesan', dan pembatalan tanda jadi (dikembalikan / hangus) — telah selesai dikembangkan pada Sprint 2 (Minggu 5).",
  },
  penjualan: {
    reqCode: "FR-11, FR-12",
    title: "Transaksi Penjualan Tunai Unit",
    featureName: "Penjualan Tunai",
    sprint: "Sprint 3",
    week: "Minggu 6",
    description:
      "✅ Fitur pencatatan penjualan unit tunai, pelunasan sisa DP, perhitungan laba bersih per unit, dan pencatatan kas masuk showroom — telah aktif untuk Sprint 3.",
  },
  operasional: {
    reqCode: "FR-13",
    title: "Beban Operasional Showroom",
    featureName: "Biaya Operasional",
    sprint: "Sprint 3",
    week: "Minggu 6",
    description:
      "✅ Fitur pencatatan pengeluaran rutin operasional seperti listrik, air, internet, dan iklan — telah aktif untuk Sprint 3.",
  },
  laporanKeuangan: {
    reqCode: "FR-14 s.d. FR-16, FR-18",
    title: "Laporan Keuangan & Analisis",
    featureName: "Laporan Keuangan",
    sprint: "Sprint 4",
    week: "Minggu 7",
    description:
      "Modul laporan laba per mobil, laporan laba bersih showroom, arus kas, dan nilai stok & aging dijadwalkan untuk Sprint 4. Tab List Makelar serta Penjual & Pembeli telah dibuka.",
  },
  upload: {
    reqCode: "FR-19",
    title: "Unggah Berkas, Dokumen & Foto",
    featureName: "Unggah Berkas & Foto",
    sprint: "Sprint 5",
    week: "Minggu 8",
    description:
      "Fitur pengunggahan berkas digital seperti foto mobil, nota bengkel, STNK, dan BPKB dijadwalkan untuk dikembangkan pada Sprint 5 (Minggu 8).",
  },
  gantiPassword: {
    reqCode: "FR-02",
    title: "Ubah Password Pengguna",
    featureName: "Ganti Password",
    sprint: "Sprint 5",
    week: "Minggu 8",
    description:
      "Fitur penggantian kata sandi pemilik showroom secara mandiri dijadwalkan untuk disempurnakan pada Sprint 5 (Minggu 8).",
  },
  backup: {
    reqCode: "FR-18, NFR-07",
    title: "Backup Basis Data Showroom",
    featureName: "Backup Basis Data",
    sprint: "Sprint 5",
    week: "Minggu 8",
    description:
      "Fitur pencadangan (backup) basis data SQLite dijadwalkan untuk penyempurnaan pada Sprint 5 (Minggu 8) dan otomatisasi pada tahap deployment (Minggu 11).",
  },
};
