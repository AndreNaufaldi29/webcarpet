import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionToken } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const sessionCookie = request.cookies.get("abcarpet_admin_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, authenticated: false, error: "Tidak ada sesi aktif." },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      );
    }

    const payload = verifySessionToken(sessionCookie);

    if (!payload || !payload.email) {
      const response = NextResponse.json(
        { success: false, authenticated: false, error: "Sesi tidak valid atau telah kedaluwarsa." },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      );

      // Bersihkan cookie yang tidak valid
      response.cookies.delete("abcarpet_admin_session");
      response.cookies.set({
        name: "abcarpet_admin_session",
        value: "",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        sameSite: "lax",
      });

      return response;
    }

    // Cari user di database untuk memastikan status akun tetap aktif
    let user = null;
    if (payload.uid) {
      user = await prisma.user.findUnique({
        where: { id: Number(payload.uid) },
      });
    }

    if (!user && payload.email) {
      user = await prisma.user.findUnique({
        where: { email: payload.email.toLowerCase() },
      });
    }

    if (!user || user.status !== "active") {
      const response = NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: user ? "Akun Anda sedang dinonaktifkan." : "Akun administrator tidak ditemukan.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      );

      response.cookies.delete("abcarpet_admin_session");
      response.cookies.set({
        name: "abcarpet_admin_session",
        value: "",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        sameSite: "lax",
      });

      return response;
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          avatar: user.avatar || user.name.charAt(0),
          phone: user.phone || "-",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { success: false, authenticated: false, error: "Terjadi kesalahan internal saat memeriksa sesi." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
