import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionToken } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const sessionCookie = request.cookies.get("abcarpet_admin_session")?.value;
    if (sessionCookie) {
      try {
        let user = null;
        const verified = verifySessionToken(sessionCookie);
        if (verified?.uid) {
          user = { id: verified.uid, name: verified.name, role: verified.role };
        } else {
          try {
            const parsed = JSON.parse(sessionCookie);
            if (parsed?.user?.id) user = parsed.user;
          } catch {}
        }

        if (user?.id) {
          await prisma.adminLog.create({
            data: {
              userId: user.id,
              userName: user.name || "Admin",
              userRole: user.role || "Admin",
              action: "LOGOUT",
              module: "Auth",
              description: `${user.role || "Admin"} ${user.name || ""} berhasil keluar dari Admin Panel`,
              ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
            },
          });
        }
      } catch (e) {
        console.warn("Gagal mencatat log logout:", e);
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Berhasil keluar dari sesi admin.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      }
    );

    // Hapus session cookie dengan pasti di root path dan subdomain
    response.cookies.delete("abcarpet_admin_session");
    response.cookies.set({
      name: "abcarpet_admin_session",
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error during admin logout:", error);
    const response = NextResponse.json(
      { success: true, message: "Logged out" },
      {
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return response;
  }
}
