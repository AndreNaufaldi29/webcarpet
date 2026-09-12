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

  // Izinkan asset statis atau file aset
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
    const verifiedPayload = await verifyEdgeToken(sessionCookie);
    if (verifiedPayload && verifiedPayload.email) {
      hasValidSession = true;
    }
  }

  // Helper untuk menyematkan Security & Strict Anti-Cache Headers ke respon
  const applySecurityAndNoCacheHeaders = (response) => {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    // Anti-caching ketat untuk mencegah browser back-forward cache (bfcache) membocorkan data admin
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
    return response;
  };

  // Proteksi API Rute Admin (/api/admin/*)
  if (pathname.startsWith("/api/admin")) {
    if (!hasValidSession) {
      return applySecurityAndNoCacheHeaders(
        NextResponse.json(
          { success: false, error: "Akses ditolak: Autentikasi administrator diperlukan." },
          { status: 401 }
        )
      );
    }
    return applySecurityAndNoCacheHeaders(NextResponse.next());
  }

  // Proteksi Halaman Admin Web (/admin/*)
  if (pathname.startsWith("/admin")) {
    // Kasus 1: Akses ke Halaman Login (/admin/login)
    if (pathname === "/admin/login") {
      // Jika sudah memiliki sesi valid dan tidak sedang logout, arahkan ke dashboard
      if (hasValidSession) {
        const redirectTarget = request.nextUrl.searchParams.get("redirect") || "/admin";
        let targetUrl;
        try {
          targetUrl = new URL(redirectTarget, request.url);
          if (!targetUrl.pathname.startsWith("/admin") || targetUrl.pathname === "/admin/login") {
            targetUrl = new URL("/admin", request.url);
          }
        } catch {
          targetUrl = new URL("/admin", request.url);
        }
        return applySecurityAndNoCacheHeaders(NextResponse.redirect(targetUrl));
      }
      // Belum login -> izinkan akses ke halaman login dengan anti-cache
      return applySecurityAndNoCacheHeaders(NextResponse.next());
    }

    // Kasus 2: Akses ke Halaman Admin yang dilindungi (/admin, /admin/produk, dll)
    if (!hasValidSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);

      // Pastikan cookie yang kadaluwarsa/tidak valid dihapus seketika
      redirectResponse.cookies.delete("abcarpet_admin_session");
      redirectResponse.cookies.set({
        name: "abcarpet_admin_session",
        value: "",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        sameSite: "lax",
      });

      return applySecurityAndNoCacheHeaders(redirectResponse);
    }

    // Sesi valid, izinkan request lanjut ke halaman admin dengan security & anti-cache headers
    return applySecurityAndNoCacheHeaders(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
