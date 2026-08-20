import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const branch = await prisma.branch.findUnique({
      where: { id: Number(id) },
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Cabang tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: branch });
  } catch (error) {
    console.error("Error fetching branch:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data cabang" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const branch = await prisma.branch.update({
      where: { id: Number(id) },
      data: body,
    });

    return NextResponse.json({ success: true, data: branch });
  } catch (error) {
    console.error("Error updating branch:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui data cabang" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.branch.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Cabang berhasil dihapus dari database",
    });
  } catch (error) {
    console.error("Error deleting branch:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus cabang" },
      { status: 500 }
    );
  }
}
