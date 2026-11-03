/**
 * Script seeding data dummy realistis (Tepat 6 Unit Mobil) untuk Showroom Crystal Autocar.
 * Sesuai dokumen Laporan Progres Sprint 1 (Minggu 4).
 */
import { getDb, run, tx } from "../src/lib/db";
import bcrypt from "bcryptjs";

console.log("Memulai reset dan seeding data dummy (6 Mobil) Showroom Crystal Autocar...");

tx(() => {
  const db = getDb();

  // 1. Bersihkan data transaksi lama (kecuali akun pemilik)
  db.exec("DELETE FROM attachments;");
  db.exec("DELETE FROM operational_expenses;");
  db.exec("DELETE FROM sales;");
  db.exec("DELETE FROM bookings;");
  db.exec("DELETE FROM car_costs;");
  db.exec("DELETE FROM purchases;");
  db.exec("DELETE FROM cars;");

  // 2. Pastikan akun pemilik default tersedia
  const user = db.prepare("SELECT COUNT(*) as n FROM users").get() as { n: number };
  if (user.n === 0) {
    db.prepare("INSERT INTO users (username, nama, password_hash) VALUES (?, ?, ?)").run(
      "pemilik",
      "Bapak Fauzan Alkatiri (Owner Crystal Autocar)",
      bcrypt.hashSync("crystal123", 12)
    );
  } else {
    db.prepare("UPDATE users SET nama = ? WHERE username = ?").run(
      "Bapak Fauzan Alkatiri (Owner Crystal Autocar)",
      "pemilik"
    );
  }

  // =========================================================================
  // 6 UNIT MOBIL DUMMY SHOWROOM CRYSTAL AUTOCAR
  // =========================================================================

  // --- UNIT 1: Toyota Avanza 1.3 G M/T 2021 (Tersedia / Siap Jual) ---
  const car1 = run(
    "INSERT INTO cars (merek, tipe, tahun, warna, nopol, no_rangka, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    "Toyota",
    "Avanza 1.3 G M/T",
    2021,
    "Hitam Metalik",
    "B 1492 KOB",
    "MHFM1BA3JMK012938",
    "tersedia",
    "Pajak hidup panjang sampai Des 2026, ban 90%, servis record Toyota resmi, interior bersih wangi"
  );
  run(
    "INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
    car1.lastId,
    "2026-09-10",
    "Ibu Sari Dewi",
    "marketplace",
    168000000,
    1500000,
    "Beli lewat OLX Jagakarsa, tangan pertama dari baru"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car1.lastId,
    "2026-09-12",
    "cuci_poles",
    750000,
    "Salon interior dan poles body 3 step"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car1.lastId,
    "2026-09-14",
    "sparepart",
    1200000,
    "Ganti oli mesin TMO 5W-30 + filter oli & kampas rem depan"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car1.lastId,
    "2026-09-15",
    "bensin",
    200000,
    "Pertamax 16 liter untuk test drive"
  );

  // --- UNIT 2: Honda HR-V 1.5 E CVT 2020 (Tersedia / Siap Jual) ---
  const car2 = run(
    "INSERT INTO cars (merek, tipe, tahun, warna, nopol, no_rangka, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    "Honda",
    "HR-V 1.5 E CVT",
    2020,
    "Putih Mutiara",
    "B 2819 SYZ",
    "MRHHR1870LP029182",
    "tersedia",
    "Sunroof panoramic lancar, interior kulit bawaan pabrik, kunci serep lengkap"
  );
  run(
    "INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
    car2.lastId,
    "2026-09-18",
    "Pak Bambang",
    "makelar",
    235000000,
    2000000,
    "Rekomendasi Makelar Pak Joko (Cilandak)"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car2.lastId,
    "2026-09-20",
    "cuci_poles",
    850000,
    "Detailing exterior & poles kaca jamur"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car2.lastId,
    "2026-09-21",
    "sparepart",
    1600000,
    "Servis berkala ganti oli transmisi CVT Honda HCF-2"
  );

  // --- UNIT 3: Mitsubishi Xpander Ultimate A/T 2022 (Sedang Dalam Perbaikan) ---
  const car3 = run(
    "INSERT INTO cars (merek, tipe, tahun, warna, nopol, no_rangka, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    "Mitsubishi",
    "Xpander Ultimate A/T",
    2022,
    "Abu-abu Metalik",
    "B 1732 TUV",
    "MK2NC1W00NL048291",
    "perbaikan",
    "Sedang proses perbaikan cat bumper belakang lecet parkir dan kuras freon AC"
  );
  run(
    "INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
    car3.lastId,
    "2026-09-28",
    "Showroom Mitra Jaya",
    "lainnya",
    220000000,
    1000000,
    "Unit tukar tambah rekanan showroom Depok"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car3.lastId,
    "2026-09-30",
    "sparepart",
    1800000,
    "Cat ulang bumper belakang lecet parkir & poles bodi"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car3.lastId,
    "2026-10-02",
    "sparepart",
    650000,
    "Service rutin AC & tambah freon R134a"
  );

  // --- UNIT 4: Toyota Kijang Innova Reborn 2.4 V Diesel A/T 2021 (Tersedia - Unit Aging > 45 Hari) ---
  const car4 = run(
    "INSERT INTO cars (merek, tipe, tahun, warna, nopol, no_rangka, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    "Toyota",
    "Innova Reborn 2.4 V Diesel A/T",
    2021,
    "Hitam",
    "B 2049 WXY",
    "MHFK4BA31MK092812",
    "tersedia",
    "Mesin 2GD sehat kering, tarikan responsif, unit favorit keluarga besar"
  );
  run(
    "INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
    car4.lastId,
    "2026-09-01",
    "Bpk. Rahmat Santoso",
    "makelar",
    370000000,
    2500000,
    "Unit dari Bandung, makelar Kang Deni"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car4.lastId,
    "2026-09-04",
    "cuci_poles",
    1000000,
    "Salon poles full interior, jok beludru & exterior"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car4.lastId,
    "2026-09-05",
    "sparepart",
    2500000,
    "Ganti filter solar, oli diesel Shell Rimula R6, balancing 4 roda"
  );

  // --- UNIT 5: Daihatsu Rocky 1.0 R Turbo CVT 2022 (Tersedia / Siap Jual) ---
  const car5 = run(
    "INSERT INTO cars (merek, tipe, tahun, warna, nopol, no_rangka, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    "Daihatsu",
    "Rocky 1.0 R Turbo CVT",
    2022,
    "Merah Two-Tone",
    "B 2341 DFR",
    "MHKKD1850NL019283",
    "tersedia",
    "Kilometer 24rb asli, lampu full LED, fitur ASA aktif normal, ban tebal 85%"
  );
  run(
    "INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
    car5.lastId,
    "2026-10-08",
    "Bpk. Gunawan Pratama",
    "marketplace",
    185000000,
    1000000,
    "Beli langsung dari pemakai via Facebook Marketplace"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car5.lastId,
    "2026-10-10",
    "cuci_poles",
    700000,
    "Cuci mesin & detailing poles bodi 2 step"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car5.lastId,
    "2026-10-11",
    "sparepart",
    950000,
    "Ganti oli mesin sintetis 0W-20 & tune up ringan"
  );

  // --- UNIT 6: Honda Brio RS 1.2 CVT 2022 (Status: Tersedia / Siap Jual) ---
  const car6 = run(
    "INSERT INTO cars (merek, tipe, tahun, warna, nopol, no_rangka, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    "Honda",
    "Brio RS 1.2 CVT",
    2022,
    "Kuning Mutiara (Carnival Yellow)",
    "B 1102 KAA",
    "MRHDK1850NL038291",
    "tersedia",
    "Unit lincah favorit anak muda, kondisi seperti baru, siap jalan"
  );
  run(
    "INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
    car6.lastId,
    "2026-09-25",
    "Ibu Cynthia",
    "marketplace",
    172000000,
    1000000,
    "Beli via OLX Jakarta Selatan"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car6.lastId,
    "2026-09-26",
    "cuci_poles",
    600000,
    "Cuci poles salon interior"
  );

  // =========================================================================
  // BIAYA OPERASIONAL SHOWROOM (Untuk kalkulasi kas & laba)
  // Biaya operasional dicatat pada bulan September.
  // Bulan berjalan (Oktober 2026) belum ada beban operasional & penjualan (Laba = Rp 0).
  // =========================================================================
  run(
    "INSERT INTO operational_expenses (tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?)",
    "2026-09-10",
    "listrik",
    1450000,
    "Tagihan listrik showroom bulan September"
  );
  run(
    "INSERT INTO operational_expenses (tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?)",
    "2026-09-15",
    "iklan",
    2500000,
    "Saldo iklan marketplace OLX & Mobil123"
  );
  run(
    "INSERT INTO operational_expenses (tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?)",
    "2026-09-28",
    "lainnya",
    1520000,
    "Biaya kebersihan & perlengkapan showroom bulan September"
  );
});

console.log("✓ Seeding berhasil! Database kini berisi tepat 6 unit mobil dummy.");
