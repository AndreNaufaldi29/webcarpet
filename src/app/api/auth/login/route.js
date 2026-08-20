import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe = true } = body;

    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        { success: false, error: "Email dan kata sandi wajib diisi!" },
        { status: 400 }
      );
    }

    // Cari user di database Prisma
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user || user.password !== trimmedPassword) {
      return NextResponse.json(
        { success: false, error: "Email atau kata sandi yang Anda masukkan salah!" },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Akun Anda sedang dinonaktifkan. Hubungi Super Admin." },
        { status: 403 }
      );
    }

    // Generate token
    const token = `ab_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Catat Admin Log aktivitas login
    try {
      await prisma.adminLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "LOGIN",
          module: "Auth",
          description: `${user.role} ${user.name} berhasil login ke Admin Panel`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Gagal mencatat log login:", e);
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar || user.name.charAt(0),
      phone: user.phone || "-",
    };

    return NextResponse.json({
      success: true,
      token,
      user: userData,
      message: `Selamat datang kembali, ${user.name}!`,
    });
  } catch (error) {
    console.error("Error authenticating admin:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan sistem pada server database." },
      { status: 500 }
    );
  }
}
