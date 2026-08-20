import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const item = await prisma.testimonial.findUnique({
      where: { id: Number(id) },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Testimoni tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Error fetching testimonial by ID:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data testimoni" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.testimonial.update({
      where: { id: Number(id) },
      data: body,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating testimonial by ID:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui testimoni" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.testimonial.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Testimoni berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting testimonial by ID:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus testimoni" },
      { status: 500 }
    );
  }
}
