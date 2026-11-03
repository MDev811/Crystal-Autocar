/**
 * Manajemen sesi sisi server (FR-01, NFR-03).
 */
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { one } from "./db";
import { SESSION_COOKIE, sessionCookieOptions, signSession, verifySessionToken, type SessionPayload } from "./jwt";

export async function createSession(user: SessionPayload) {
  const token = await signSession(user);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Membaca sesi aktif (null jika belum login / kedaluwarsa). */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  const session = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  // Pastikan akun masih ada di database
  const exists = one<{ id: number }>("SELECT id FROM users WHERE id = ?", session.userId);
  return exists ? session : null;
});

/** Wajib login — dipanggil di setiap halaman, server action & route handler terproteksi. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login?expired=1");
  return session;
}
