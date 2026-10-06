/**
 * Proxy (pengganti middleware di Next.js 16).
 * - Seluruh halaman hanya bisa diakses setelah login (NFR-03).
 * - Sesi diperpanjang setiap ada aktivitas (sliding expiration); jika tidak aktif
 *   lebih dari SESSION_IDLE_MINUTES, cookie kedaluwarsa dan pengguna harus login ulang.
 */
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions, signSession, verifySessionToken } from "@/lib/jwt";

const PUBLIC_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Sesi berakhir, silakan login kembali." }, { status: 401 });
    }
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    const hadCookie = request.cookies.has(SESSION_COOKIE);
    if (hadCookie) url.searchParams.set("expired", "1");
    const res = NextResponse.redirect(url);
    if (hadCookie) res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  if (session && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const res = NextResponse.next();
  if (session) {
    // Perpanjang sesi karena ada aktivitas
    res.cookies.set(SESSION_COOKIE, await signSession(session), sessionCookieOptions());
  }
  return res;
}

export const config = {
  matcher: [
    // Semua path kecuali aset statis Next.js & ikon
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|robots.txt).*)",
  ],
};
