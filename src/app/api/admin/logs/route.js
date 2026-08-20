import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching admin logs:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil riwayat log aktivitas admin" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, userName = "Admin", userRole = "Super Admin", action, module, description, ipAddress } = body;

    if (!action || !module || !description) {
      return NextResponse.json(
        { success: false, error: "Action, module, dan description wajib diisi" },
        { status: 400 }
      );
    }

    const log = await prisma.adminLog.create({
      data: {
        userId: userId ? Number(userId) : null,
        userName,
        userRole,
        action,
        module,
        description,
        ipAddress: ipAddress || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    console.error("Error creating admin log:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mencatat log aktivitas admin" },
      { status: 500 }
    );
  }
}
