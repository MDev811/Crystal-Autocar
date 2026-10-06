/**
 * Utilitas format tampilan (Rupiah, tanggal) berbahasa Indonesia.
 * Aman dipakai di server maupun client.
 */

const rupiahFmt = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFmt = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

export function rupiah(value: number | null | undefined): string {
  return rupiahFmt.format(Math.round(value ?? 0)).replace(/\u00a0/g, " ");
}

/** Format ringkas: Rp 1,2 M / Rp 350 jt */
export function rupiahShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}Rp ${(abs / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return `${sign}Rp ${abs}`;
}

export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

/** "2026-10-06" -> "6 Okt 2026" */
export function tanggal(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** "2026-10" -> "Oktober 2026" */
export function namaBulan(ym: string): string {
  const [y, m] = ym.split("-");
  return `${BULAN[Number(m) - 1] ?? m} ${y}`;
}

/** Tanggal hari ini (zona waktu lokal) dalam format YYYY-MM-DD */
export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

/** Selisih hari antara dua tanggal ISO */
export function daysBetween(fromISO: string, toISO: string = todayISO()): number {
  const a = new Date(`${fromISO.slice(0, 10)}T00:00:00`).getTime();
  const b = new Date(`${toISO.slice(0, 10)}T00:00:00`).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

export function firstDayOfMonth(d = todayISO()): string {
  return `${d.slice(0, 7)}-01`;
}

export function lastDayOfMonth(d = todayISO()): string {
  const [y, m] = d.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${d.slice(0, 7)}-${String(last).padStart(2, "0")}`;
}
