/**
 * Script seeding contoh data realistis untuk demo Showroom Crystal Autocar.
 */
import { getDb, run, tx } from "../src/lib/db";
import bcrypt from "bcryptjs";

console.log("Seeding data awal Showroom Crystal Autocar...");

tx(() => {
  const db = getDb();

  // 1. Pastikan user default ada
  const user = db.prepare("SELECT COUNT(*) as n FROM users").get() as { n: number };
  if (user.n === 0) {
    db.prepare("INSERT INTO users (username, nama, password_hash) VALUES (?, ?, ?)").run(
      "pemilik",
      "Bapak Hendra (Owner Crystal Autocar)",
      bcrypt.hashSync("crystal123", 12)
    );
  }

  // Cek jika sudah ada mobil, jika belum tambahkan contoh
  const carCount = db.prepare("SELECT COUNT(*) as n FROM cars").get() as { n: number };
  if (carCount.n > 0) {
    console.log("Data mobil sudah ada, seeding dilewati.");
    return;
  }

  // --- UNIT 1: Toyota Avanza 1.3 G M/T 2021 (Tersedia) ---
  const car1 = run(
    "INSERT INTO cars (merek, tipe, tahun, warna, nopol, no_rangka, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    "Toyota", "Avanza 1.3 G M/T", 2021, "Hitam Metalik", "B 1492 KOB", "MHFM1BA3JMK012938", "tersedia", "Pajak hidup panjang sampai Des 2026, ban 90%, servis record Toyota resmi"
  );
  run(
    "INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
    car1.lastId, "2026-09-10", "Ibu Sari Dewi", "marketplace", 168000000, 1500000, "Beli lewat OLX, kondisi istimewa"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car1.lastId, "2026-09-12", "cuci_poles", 750000, "Salon interior dan poles body 3 step"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car1.lastId, "2026-09-14", "sparepart", 1200000, "Ganti oli mesin TMO 5W-30 + filter oli & kampas rem depan"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car1.lastId, "2026-09-15", "bensin", 200000, "Pertamax 16 liter"
  );

  // --- UNIT 2: Honda HR-V 1.5 E CVT 2020 (Dipesan / Tanda Jadi) ---
  const car2 = run(
    "INSERT INTO cars (merek, tipe, tahun, warna, nopol, no_rangka, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    "Honda", "HR-V 1.5 E CVT", 2020, "Putih Mutiara", "B 2819 SYZ", "MRHHR1870LP029182", "dipesan", "Tangan pertama dari baru, sunroof normal, interior bersih"
  );
  run(
    "INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
    car2.lastId, "2026-09-18", "Pak Bambang", "makelar", 235000000, 2000000, "Makelar Pak Joko"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car2.lastId, "2026-09-20", "cuci_poles", 850000, "Detailing exterior nano ceramic coating"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car2.lastId, "2026-09-21", "sparepart", 1600000, "Servis berkala ganti oli transmisi CVT Honda"
  );
  // Tanda jadi dari pembeli (FR-09)
  run(
    "INSERT INTO bookings (car_id, tanggal, pembeli, telepon, nominal, status) VALUES (?, ?, ?, ?, ?, ?)",
    car2.lastId, "2026-10-02", "Ibu Dr. Ratna", "081389012345", 10000000, "aktif"
  );

  // --- UNIT 3: Mitsubishi Xpander Ultimate A/T 2022 (Dalam Perbaikan) ---
  const car3 = run(
    "INSERT INTO cars (merek, tipe, tahun, warna, nopol, no_rangka, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    "Mitsubishi", "Xpander Ultimate A/T", 2022, "Abu-abu Metalik", "B 1732 TUV", "MK2NC1W00NL048291", "perbaikan", "Sedang rapikan cat bumper belakang dan cek freon AC"
  );
  run(
    "INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
    car3.lastId, "2026-09-28", "Showroom Mitra Jaya", "lainnya", 220000000, 1000000, "Trade-in rekanan showroom"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car3.lastId, "2026-09-30", "sparepart", 1800000, "Cat ulang bumper belakang & poles lecet halus"
  );

  // --- UNIT 4: Toyota Kijang Innova Reborn 2.4 V Diesel A/T 2021 (TERJUAL) ---
  const car4 = run(
    "INSERT INTO cars (merek, tipe, tahun, warna, nopol, no_rangka, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    "Toyota", "Innova Reborn 2.4 V Diesel A/T", 2021, "Hitam", "B 2049 WXY", "MHFK4BA31MK092812", "terjual", "Unit favorit, langsung laku 5 hari pajang"
  );
  run(
    "INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
    car4.lastId, "2026-09-02", "Bpk. Rahmat Santoso", "makelar", 370000000, 2500000, "Unit dari Bandung, makelar Kang Deni"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car4.lastId, "2026-09-04", "cuci_poles", 1000000, "Salon poles interior & exterior"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car4.lastId, "2026-09-05", "sparepart", 2500000, "Ganti filter solar, oli diesel Shell Rimula R6, balancing 4 roda"
  );
  // Total modal car4: 370jt + 2.5jt + 1jt + 2.5jt = 376.000.000
  // Harga jual: 405.000.000 -> Laba: 29.000.000
  run(
    "INSERT INTO sales (car_id, booking_id, tanggal, pembeli, telepon, harga_jual, tanda_jadi, total_modal, laba, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    car4.lastId, null, "2026-09-15", "Bpk. H. Sudirman", "081211223344", 405000000, 0, 376000000, 29000000, "Pelunasan tunai via transfer BCA"
  );

  // --- UNIT 5: Honda Brio RS CVT 2022 (TERJUAL di bulan ini) ---
  const car5 = run(
    "INSERT INTO cars (merek, tipe, tahun, warna, nopol, no_rangka, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    "Honda", "Brio RS 1.2 CVT", 2022, "Kuning Mutiara (Carnival Yellow)", "B 1102 KAA", "MRHDK1850NL038291", "terjual", "Favorit anak muda, kilometer 18rb asli"
  );
  run(
    "INSERT INTO purchases (car_id, tanggal, penjual, sumber, harga_beli, komisi_calo, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
    car5.lastId, "2026-09-25", "Ibu Cynthia", "marketplace", 172000000, 1000000, "Marketplace OLX"
  );
  run(
    "INSERT INTO car_costs (car_id, tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?, ?)",
    car5.lastId, "2026-09-26", "cuci_poles", 600000, "Cuci poles detailing"
  );
  // Total modal car5: 172jt + 1jt + 600rb = 173.600.000
  // Harga jual: 191.000.000 -> Laba: 17.400.000 (bulan Oktober)
  run(
    "INSERT INTO sales (car_id, booking_id, tanggal, pembeli, telepon, harga_jual, tanda_jadi, total_modal, laba, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    car5.lastId, null, "2026-10-04", "Mas Kevin Ardiansyah", "085712345678", 191000000, 0, 173600000, 17400000, "Pelunasan transfer Bank Mandiri"
  );

  // --- BIAYA OPERASIONAL SHOWROOM (FR-13) ---
  run(
    "INSERT INTO operational_expenses (tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?)",
    "2026-09-05", "listrik", 1450000, "Tagihan listrik showroom bulan September"
  );
  run(
    "INSERT INTO operational_expenses (tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?)",
    "2026-09-10", "iklan", 2500000, "Top-up saldo iklan OLX & Facebook Ads"
  );
  run(
    "INSERT INTO operational_expenses (tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?)",
    "2026-09-12", "internet", 450000, "Paket internet Wi-Fi Indihome showroom"
  );
  run(
    "INSERT INTO operational_expenses (tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?)",
    "2026-10-03", "listrik", 1520000, "Tagihan listrik showroom bulan Oktober"
  );
  run(
    "INSERT INTO operational_expenses (tanggal, kategori, nominal, keterangan) VALUES (?, ?, ?, ?)",
    "2026-10-05", "iklan", 1800000, "Iklan marketplace Mobil123 & Carmudi"
  );
});

console.log("✓ Seeding data berhasil diselesaikan!");
