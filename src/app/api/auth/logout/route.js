import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const sessionCookie = request.cookies.get("abcarpet_admin_session")?.value;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        if (parsed?.user?.id) {
          await prisma.adminLog.create({
            data: {
              userId: parsed.user.id,
              userName: parsed.user.name || "Admin",
              userRole: parsed.user.role || "Admin",
              action: "LOGOUT",
              module: "Auth",
              description: `${parsed.user.role || "Admin"} ${parsed.user.name || ""} berhasil keluar dari Admin Panel`,
              ipAddress: "127.0.0.1",
            },
          });
        }
      } catch (e) {
        console.warn("Gagal mencatat log logout:", e);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Berhasil keluar dari sesi admin.",
    });

    // Hapus session cookie dengan pasti di root path
    response.cookies.set({
      name: "abcarpet_admin_session",
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error during admin logout:", error);
    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.set({
      name: "abcarpet_admin_session",
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      sameSite: "lax",
    });
    return response;
  }
}
