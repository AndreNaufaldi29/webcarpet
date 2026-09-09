import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  verifyPassword,
  hashPassword,
  signSessionToken,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  getClientIp,
} from "@/lib/security";

export async function POST(request) {
  const clientIp = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "Unknown Browser";

  try {
    const body = await request.json();
    const { email, password, rememberMe = true } = body;

    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        { success: false, error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    // 1. CEK RATE LIMIT (BRUTE-FORCE PROTECTION)
    const ipLimit = checkRateLimit(clientIp);
    const emailLimit = checkRateLimit(trimmedEmail);

    if (ipLimit.isLocked || emailLimit.isLocked) {
      const waitSeconds = Math.max(
        ipLimit.lockRemainingSeconds || 0,
        emailLimit.lockRemainingSeconds || 0
      );
      const waitMinutes = Math.ceil(waitSeconds / 60);

      // Log brute force attempt
      try {
        await prisma.adminLog.create({
          data: {
            action: "LOGIN_BLOCKED_RATE_LIMIT",
            module: "Auth",
            description: `Akses login diblokir karena terlalu banyak percobaan gagal untuk email ${trimmedEmail}`,
            ipAddress: clientIp,
            userAgent,
          },
        });
      } catch (e) {
        console.warn("Log rate limit error:", e);
      }

      return NextResponse.json(
        {
          success: false,
          error: `Terlalu banyak percobaan login gagal. Akses sementara dikunci demi keamanan. Silakan coba lagi dalam ${waitMinutes} menit.`,
          isLocked: true,
          lockRemainingSeconds: waitSeconds,
        },
        { status: 429 }
      );
    }

    // 2. CARI USER DI DATABASE
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    // 3. VERIFIKASI KATA SANDI SECARA KRIPTOGRAFIS
    const passwordCheck = user
      ? verifyPassword(trimmedPassword, user.password)
      : { isValid: false, needsRehash: false };

    if (!user || !passwordCheck.isValid) {
      // Catat kegagalan login
      const ipFail = recordFailedAttempt(clientIp);
      const emailFail = recordFailedAttempt(trimmedEmail);
      const remaining = Math.min(
        ipFail.remainingAttempts,
        emailFail.remainingAttempts
      );

      try {
        await prisma.adminLog.create({
          data: {
            userId: user ? user.id : null,
            userName: user ? user.name : trimmedEmail,
            userRole: user ? user.role : "Guest",
            action: "LOGIN_FAILED",
            module: "Auth",
            description: `Percobaan login gagal untuk email ${trimmedEmail} (Sisa percobaan: ${remaining})`,
            ipAddress: clientIp,
            userAgent,
          },
        });

        // Jika terdeteksi >= 3 kali gagal, buat notifikasi keamanan
        if (ipFail.remainingAttempts <= 2 || emailFail.remainingAttempts <= 2) {
          await prisma.adminNotification.create({
            data: {
              title: "Peringatan Percobaan Login Gagal",
              message: `Terdeteksi percobaan login berulang dari IP ${clientIp} pada akun ${trimmedEmail}`,
              type: "danger",
              module: "security",
              isRead: false,
            },
          });
        }
      } catch (e) {
        console.warn("Log failed login error:", e);
      }

      const lockWarning =
        remaining > 0
          ? ` Sisa percobaan: ${remaining} kali sebelum akun dikunci.`
          : " Akses sementara dikunci selama 15 menit.";

      return NextResponse.json(
        {
          success: false,
          error: `Email atau kata sandi tidak valid.${lockWarning}`,
          remainingAttempts: remaining,
        },
        { status: 401 }
      );
    }

    // 4. CEK STATUS AKUN
    if (user.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Akun Anda dinonaktifkan oleh administrator. Hubungi Super Admin." },
        { status: 403 }
      );
    }

    // 5. TRANSPARENT AUTO-UPGRADE HASH (Jika password masih plaintext)
    if (passwordCheck.needsRehash) {
      try {
        const secureHashedPassword = hashPassword(trimmedPassword);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: secureHashedPassword },
        });
      } catch (hashErr) {
        console.warn("Gagal auto-upgrade password hash:", hashErr);
      }
    }

    // 6. RESET RATE LIMIT PADA LOGIN BERHASIL
    resetRateLimit(clientIp);
    resetRateLimit(trimmedEmail);

    // 7. TERBITKAN CRYPTOGRAPHICALLY SIGNED SESSION TOKEN
    const sessionDurationSeconds = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    const token = signSessionToken(
      {
        uid: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      sessionDurationSeconds
    );

    // 8. CATAT LOG AUDIT LOGIN BERHASIL
    try {
      await prisma.adminLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "LOGIN_SUCCESS",
          module: "Auth",
          description: `${user.role} ${user.name} berhasil login ke Admin Panel`,
          ipAddress: clientIp,
          userAgent,
        },
      });
    } catch (e) {
      console.warn("Gagal mencatat log login sukses:", e);
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

    const response = NextResponse.json({
      success: true,
      token,
      user: userData,
      message: `Selamat datang kembali, ${user.name}!`,
    });

    // 9. SET HTTPONLY SECURE SESSION COOKIE
    response.cookies.set({
      name: "abcarpet_admin_session",
      value: token,
      path: "/",
      maxAge: sessionDurationSeconds,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error in hardened admin login:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal pada server autentikasi." },
      { status: 500 }
    );
  }
}
