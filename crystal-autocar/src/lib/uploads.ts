/**
 * Penyimpanan berkas upload (FR-19). Berkas disimpan di luar folder `public`
 * sehingga hanya bisa diakses lewat route terproteksi `/api/berkas/[nama]`.
 */
import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { UPLOAD_DIR } from "./db";
import { MAX_UPLOAD_BYTES } from "./constants";

const SIGNATURES: { mime: string; ext: string; test: (b: Buffer) => boolean }[] = [
  { mime: "image/jpeg", ext: ".jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", ext: ".png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/webp", ext: ".webp", test: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  { mime: "application/pdf", ext: ".pdf", test: (b) => b.subarray(0, 5).toString() === "%PDF-" },
];

export type SavedFile = { filename: string; mime: string; size: number; originalName: string };

/** Validasi isi berkas berdasarkan signature (bukan sekadar ekstensi) lalu simpan. */
export async function saveUpload(file: File): Promise<SavedFile | { error: string }> {
  if (!file || file.size === 0) return { error: "Pilih berkas terlebih dahulu" };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "Ukuran berkas maksimal 5 MB" };

  const buf = Buffer.from(await file.arrayBuffer());
  const sig = SIGNATURES.find((s) => s.test(buf));
  if (!sig) return { error: "Format berkas harus JPG, PNG, WEBP, atau PDF" };

  const filename = `${crypto.randomUUID()}${sig.ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buf);
  const originalName = (file.name || `berkas${sig.ext}`).replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  return { filename, mime: sig.mime, size: buf.length, originalName };
}

export function uploadPath(filename: string): string | null {
  // Cegah path traversal: hanya nama UUID + ekstensi yang valid
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/.test(filename)) return null;
  return path.join(UPLOAD_DIR, filename);
}

export async function deleteUploadFile(filename: string) {
  const p = uploadPath(filename);
  if (p) await fs.rm(p, { force: true });
}
