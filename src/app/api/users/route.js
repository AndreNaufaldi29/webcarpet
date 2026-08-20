import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pengguna dari database" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password = "password123", role = "Staff", status = "active", phone, avatar } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Nama dan email wajib diisi" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Cek apakah email sudah terdaftar sebelumnya
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Email '${cleanEmail}' sudah terdaftar. Silakan gunakan email lain.` },
        { status: 400 }
      );
    }

    let user;
    try {
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          password: password || "password123",
          role,
          status,
          phone: phone || "-",
          avatar: avatar || name.charAt(0).toUpperCase(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          status: true,
          avatar: true,
          phone: true,
          createdAt: true,
        },
      });
    } catch (createErr) {
      // Jika terjadi tabrakan sequence ID PostgreSQL, sinkronkan sequence lalu coba lagi
      if (createErr.code === "P2002") {
        await prisma.$executeRawUnsafe(
          "SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1))"
        );
        user = await prisma.user.create({
          data: {
            name: name.trim(),
            email: cleanEmail,
            password: password || "password123",
            role,
            status,
            phone: phone || "-",
            avatar: avatar || name.charAt(0).toUpperCase(),
          },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            status: true,
            avatar: true,
            phone: true,
            createdAt: true,
          },
        });
      } else {
        throw createErr;
      }
    }

    // Catat log aktivitas pembuatan user
    try {
      await prisma.adminLog.create({
        data: {
          action: "CREATE_USER",
          module: "User",
          description: `Menambahkan akun baru: ${user.name} (${user.email}) dengan role ${user.role}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (logErr) {
      console.warn("Gagal mencatat admin log create user:", logErr);
    }

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat user baru" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, email, password, role, status, phone, avatar } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID pengguna wajib disertakan" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    if (password && password.trim() !== "") {
      updateData.password = password.trim();
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui data pengguna" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID pengguna wajib disertakan" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus pengguna" },
      { status: 500 }
    );
  }
}
