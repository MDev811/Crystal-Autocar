/**
 * Koneksi & skema database SQLite (memakai modul bawaan Node.js `node:sqlite`).
 *
 * - Database dibuat otomatis di folder `data/` saat pertama kali diakses (zero-config).
 * - Seluruh query memakai prepared statement + parameter binding (NFR-04: anti SQL injection).
 * - Nilai uang disimpan sebagai INTEGER (Rupiah penuh) agar perhitungan akurat.
 * - Akun pemilik default dibuat otomatis bila tabel users masih kosong.
 */
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";

export const DATA_DIR = path.join(process.cwd(), "data");
export const DB_PATH = path.join(DATA_DIR, "crystal-autocar.db");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

export const DEFAULT_USERNAME = "pemilik";
export const DEFAULT_PASSWORD = "crystal123";

const SCHEMA_SQL = /* sql */ `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  nama          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS cars (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  merek      TEXT NOT NULL,
  tipe       TEXT NOT NULL,
  tahun      INTEGER NOT NULL,
  warna      TEXT NOT NULL,
  nopol      TEXT NOT NULL,
  no_rangka  TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'tersedia'
             CHECK (status IN ('tersedia','perbaikan','dipesan','terjual')),
  catatan    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_nopol  ON cars(nopol);

-- Data pembelian (1 mobil = 1 pembelian) — FR-06
CREATE TABLE IF NOT EXISTS purchases (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id      INTEGER NOT NULL UNIQUE REFERENCES cars(id) ON DELETE CASCADE,
  tanggal     TEXT NOT NULL,
  penjual     TEXT NOT NULL,
  sumber      TEXT NOT NULL CHECK (sumber IN ('marketplace','makelar','lainnya')),
  harga_beli  INTEGER NOT NULL CHECK (harga_beli >= 0),
  komisi_calo INTEGER NOT NULL DEFAULT 0 CHECK (komisi_calo >= 0),
  keterangan  TEXT
);
CREATE INDEX IF NOT EXISTS idx_purchases_tanggal ON purchases(tanggal);

-- Biaya per unit — FR-07
CREATE TABLE IF NOT EXISTS car_costs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id     INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  tanggal    TEXT NOT NULL,
  kategori   TEXT NOT NULL CHECK (kategori IN ('cuci_poles','sparepart','bensin','lainnya')),
  nominal    INTEGER NOT NULL CHECK (nominal > 0),
  keterangan TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_car_costs_car     ON car_costs(car_id);
CREATE INDEX IF NOT EXISTS idx_car_costs_tanggal ON car_costs(tanggal);

-- Tanda jadi dari pembeli — FR-09
CREATE TABLE IF NOT EXISTS bookings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id     INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  tanggal    TEXT NOT NULL,
  pembeli    TEXT NOT NULL,
  telepon    TEXT,
  nominal    INTEGER NOT NULL CHECK (nominal > 0),
  status     TEXT NOT NULL DEFAULT 'aktif'
             CHECK (status IN ('aktif','terpakai','dikembalikan','hangus')),
  tanggal_selesai TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_bookings_car     ON bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tanggal ON bookings(tanggal);

-- Penjualan tunai — FR-10, FR-11 (modal & laba disimpan sebagai snapshot)
CREATE TABLE IF NOT EXISTS sales (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id      INTEGER NOT NULL UNIQUE REFERENCES cars(id) ON DELETE CASCADE,
  booking_id  INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  tanggal     TEXT NOT NULL,
  pembeli     TEXT NOT NULL,
  telepon     TEXT,
  harga_jual  INTEGER NOT NULL CHECK (harga_jual > 0),
  tanda_jadi  INTEGER NOT NULL DEFAULT 0,
  total_modal INTEGER NOT NULL,
  laba        INTEGER NOT NULL,
  keterangan  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_sales_tanggal ON sales(tanggal);

-- Pengeluaran operasional showroom — FR-13
CREATE TABLE IF NOT EXISTS operational_expenses (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal    TEXT NOT NULL,
  kategori   TEXT NOT NULL CHECK (kategori IN ('listrik','iklan','internet','lainnya')),
  nominal    INTEGER NOT NULL CHECK (nominal > 0),
  keterangan TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_opex_tanggal ON operational_expenses(tanggal);

-- Foto & dokumen pendukung — FR-19
CREATE TABLE IF NOT EXISTS attachments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id        INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  jenis         TEXT NOT NULL CHECK (jenis IN ('foto','nota','stnk','bpkb','lainnya')),
  filename      TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  mime          TEXT NOT NULL,
  size          INTEGER NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_attachments_car ON attachments(car_id);

-- Ringkasan per mobil: Total Modal = Harga Beli + Komisi Calo + Seluruh Biaya (FR-08)
DROP VIEW IF EXISTS v_car_summary;
CREATE VIEW v_car_summary AS
SELECT
  c.id, c.merek, c.tipe, c.tahun, c.warna, c.nopol, c.no_rangka, c.status, c.catatan, c.created_at,
  p.tanggal      AS tgl_beli,
  p.penjual,
  p.sumber,
  COALESCE(p.harga_beli, 0)  AS harga_beli,
  COALESCE(p.komisi_calo, 0) AS komisi_calo,
  COALESCE(cc.total_biaya, 0) AS total_biaya,
  COALESCE(p.harga_beli, 0) + COALESCE(p.komisi_calo, 0) + COALESCE(cc.total_biaya, 0) AS total_modal,
  s.tanggal      AS tgl_jual,
  s.harga_jual,
  s.laba,
  s.pembeli,
  (SELECT a.filename FROM attachments a WHERE a.car_id = c.id AND a.jenis = 'foto' ORDER BY a.id LIMIT 1) AS foto
FROM cars c
LEFT JOIN purchases p ON p.car_id = c.id
LEFT JOIN (SELECT car_id, SUM(nominal) AS total_biaya FROM car_costs GROUP BY car_id) cc ON cc.car_id = c.id
LEFT JOIN sales s ON s.car_id = c.id;
`;

type GlobalWithDb = typeof globalThis & { __crystalDb?: DatabaseSync };

function init(): DatabaseSync {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA_SQL);

  const count = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (count.n === 0) {
    db.prepare("INSERT INTO users (username, nama, password_hash) VALUES (?, ?, ?)").run(
      DEFAULT_USERNAME,
      "Pemilik Crystal Autocar",
      bcrypt.hashSync(DEFAULT_PASSWORD, 12),
    );
  }
  return db;
}

/** Mengembalikan koneksi tunggal (singleton, aman terhadap hot-reload). */
export function getDb(): DatabaseSync {
  const g = globalThis as GlobalWithDb;
  if (!g.__crystalDb) g.__crystalDb = init();
  return g.__crystalDb;
}

/* ------------------------------------------------------------------ */
/* Helper query bertipe                                                */
/* ------------------------------------------------------------------ */

export function one<T>(sql: string, ...params: SQLInputValue[]): T | undefined {
  return getDb().prepare(sql).get(...params) as T | undefined;
}

export function many<T>(sql: string, ...params: SQLInputValue[]): T[] {
  return getDb().prepare(sql).all(...params) as T[];
}

export function run(sql: string, ...params: SQLInputValue[]) {
  const r = getDb().prepare(sql).run(...params);
  return { changes: Number(r.changes), lastId: Number(r.lastInsertRowid) };
}

/** Menjalankan fungsi di dalam transaksi (ACID — NFR-07). */
export function tx<T>(fn: () => T): T {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
