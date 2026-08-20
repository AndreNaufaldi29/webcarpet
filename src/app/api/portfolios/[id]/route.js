import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: Number(id) },
    });

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: "Portofolio tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: portfolio });
  } catch (error) {
    console.error("Error fetching portfolio by ID:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data portofolio" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.portfolio.update({
      where: { id: Number(id) },
      data: body,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating portfolio by ID:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui portofolio" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.portfolio.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Portofolio berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting portfolio by ID:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus portofolio" },
      { status: 500 }
    );
  }
}
