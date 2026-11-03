"use server";
/**
 * Aksi autentikasi: login, logout, ganti password (FR-01, FR-02, NFR-02).
 */
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { one, run } from "@/lib/db";
import { createSession, deleteSession, requireUser } from "@/lib/session";
import { changePasswordSchema, fieldErrors, loginSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

/* Pembatasan percobaan login sederhana (anti brute-force) */
const MAX_ATTEMPTS = 5;
const LOCK_MS = 5 * 60_000;
const attempts = new Map<string, { count: number; until: number }>();

type UserRow = { id: number; username: string; nama: string; password_hash: string };

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const key = parsed.data.username.toLowerCase();
  const rec = attempts.get(key);
  if (rec && rec.until > Date.now()) {
    const menit = Math.ceil((rec.until - Date.now()) / 60_000);
    return { message: `Terlalu banyak percobaan. Coba lagi dalam ${menit} menit.` };
  }

  const user = one<UserRow>("SELECT * FROM users WHERE username = ? COLLATE NOCASE", parsed.data.username);
  const valid = user ? await bcrypt.compare(parsed.data.password, user.password_hash) : false;

  if (!user || !valid) {
    const count = (rec?.count ?? 0) + 1;
    attempts.set(key, { count, until: count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0 });
    return { message: "Username atau password salah." };
  }

  attempts.delete(key);
  await createSession({ userId: user.id, username: user.username, nama: user.nama });

  const next = String(formData.get("next") ?? "");
  // Hanya izinkan redirect internal (cegah open redirect)
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logoutAction(formData?: FormData) {
  await deleteSession();
  const reason = formData?.get("reason");
  redirect(reason === "idle" ? "/login?expired=1" : "/login");
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireUser();
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const user = one<UserRow>("SELECT * FROM users WHERE id = ?", session.userId);
  if (!user || !(await bcrypt.compare(parsed.data.password_lama, user.password_hash))) {
    return { errors: { password_lama: "Password lama salah" } };
  }
  if (parsed.data.password_lama === parsed.data.password_baru) {
    return { errors: { password_baru: "Password baru harus berbeda dari password lama" } };
  }

  const hash = await bcrypt.hash(parsed.data.password_baru, 12);
  run("UPDATE users SET password_hash = ? WHERE id = ?", hash, user.id);
  return { ok: true, message: "Password berhasil diubah.", ts: Date.now() };
}
