import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const notifications = await prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.adminNotification.count({
      where: { isRead: false },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil notifikasi admin" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, isRead = true, markAllAsRead = false } = body;

    if (markAllAsRead) {
      await prisma.adminNotification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "Semua notifikasi ditandai dibaca" });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID notifikasi wajib disertakan" },
        { status: 400 }
      );
    }

    const updated = await prisma.adminNotification.update({
      where: { id: Number(id) },
      data: { isRead },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status notifikasi" },
      { status: 500 }
    );
  }
}
