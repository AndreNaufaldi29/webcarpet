// src/middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Hanya proteksi rute di dalam /admin
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Izinkan asset statis atau favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Dapatkan session cookie
  const sessionCookie = request.cookies.get("abcarpet_admin_session")?.value;
  let hasValidSession = false;

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed && parsed.token && parsed.email) {
        hasValidSession = true;
      }
    } catch {
      hasValidSession = false;
    }
  }

  // Kasus 1: Pengguna mengakses halaman login
  if (pathname === "/admin/login") {
    // Jika sudah login, langsung alihkan ke dashboard admin
    if (hasValidSession) {
      const adminUrl = new URL("/admin", request.url);
      return NextResponse.redirect(adminUrl);
    }
    // Jika belum login, izinkan akses ke halaman login
    return NextResponse.next();
  }

  // Kasus 2: Pengguna mengakses rute admin lainnya (/admin, /admin/produk, dll)
  if (!hasValidSession) {
    // Belum login -> redirect ke halaman login dengan query redirect
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Sesi valid, izinkan request lanjut ke halaman admin
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
