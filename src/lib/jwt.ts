/**
 * Penandatanganan & verifikasi token sesi (JWT HS256 via `jose`).
 * Dipakai oleh `proxy.ts` dan modul `session.ts`. Tidak boleh mengimpor database.
 */
import { SignJWT, jwtVerify } from "jose";
import { SESSION_IDLE_MINUTES } from "./constants";

export const SESSION_COOKIE = "ca_session";

export type SessionPayload = {
  userId: number;
  username: string;
  nama: string;
};

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET wajib diisi (minimal 32 karakter) di environment produksi.");
    }
    return new TextEncoder().encode("dev-only-insecure-secret-crystal-autocar-0000");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_IDLE_MINUTES}m`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "number" || typeof payload.username !== "string") return null;
    return { userId: payload.userId, username: payload.username, nama: String(payload.nama ?? "") };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_IDLE_MINUTES * 60,
  };
}
