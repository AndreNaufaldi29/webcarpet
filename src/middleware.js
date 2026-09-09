// src/middleware.js
import { NextResponse } from "next/server";

const SECRET_KEY =
  process.env.AUTH_SECRET ||
  process.env.SESSION_SECRET ||
  "abcarpet_secure_hmac_secret_2026_rumahindahcarpet_superkey";

async function verifyEdgeToken(tokenString) {
  if (!tokenString || typeof tokenString !== "string") return null;
  const parts = tokenString.split(".");
  if (parts.length !== 2) return null;

  const [payloadEncoded, signature] = parts;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payloadEncoded)
    );

    const bytes = new Uint8Array(signatureBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSignature = btoa(binary)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSignature) {
      return null;
    }

    let b64 = payloadEncoded.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const jsonStr = atob(b64);
    const payload = JSON.parse(jsonStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
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
    // 1. Cek format Signed Token kriptografis
    const verifiedPayload = await verifyEdgeToken(sessionCookie);
    if (verifiedPayload && verifiedPayload.email) {
      hasValidSession = true;
    } else {
      // 2. Fallback parsing untuk backward compatibility jika ada token di dalam JSON string
      try {
        const parsed = JSON.parse(sessionCookie);
        if (parsed?.token) {
          const innerVerified = await verifyEdgeToken(parsed.token);
          if (innerVerified && innerVerified.email) {
            hasValidSession = true;
          }
        }
      } catch {
        hasValidSession = false;
      }
    }
  }

  // Helper untuk menyematkan Security Headers ke respon
  const applySecurityHeaders = (response) => {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    return response;
  };

  // Kasus 1: Pengguna mengakses halaman login
  if (pathname === "/admin/login") {
    // Jika sudah login valid, langsung alihkan ke dashboard admin
    if (hasValidSession) {
      const adminUrl = new URL("/admin", request.url);
      return applySecurityHeaders(NextResponse.redirect(adminUrl));
    }
    // Jika belum login, izinkan akses ke halaman login
    return applySecurityHeaders(NextResponse.next());
  }

  // Kasus 2: Pengguna mengakses rute admin lainnya (/admin, /admin/produk, dll)
  if (!hasValidSession) {
    // Belum login atau session tidak valid -> redirect ke halaman login
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    // Bersihkan cookie yang tidak valid jika ada
    if (sessionCookie) {
      redirectResponse.cookies.delete("abcarpet_admin_session");
    }
    return applySecurityHeaders(redirectResponse);
  }

  // Sesi valid, izinkan request lanjut ke halaman admin dengan security headers
  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*"],
};
