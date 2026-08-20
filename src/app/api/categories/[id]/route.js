import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data kategori" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: body,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating category by ID:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui kategori" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting category by ID:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
