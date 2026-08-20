import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { findOrCreateCategory, updateAllCategoryCounts } from "@/lib/categorySync";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData = {
      ...body,
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
      rating: body.rating !== undefined ? Number(body.rating) : undefined,
      reviews: body.reviews !== undefined ? Number(body.reviews) : undefined,
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
      isNew: body.isNew !== undefined ? Boolean(body.isNew) : undefined,
    };

    if (body.category) {
      const matchedCat = await findOrCreateCategory(body.category);
      if (matchedCat) {
        updateData.category = matchedCat.name;
        updateData.categoryId = matchedCat.id;
      }
    }

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
    });

    updateAllCategoryCounts().catch((e) => console.warn("Update category count error:", e));

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui produk" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id: Number(id) },
    });

    updateAllCategoryCounts().catch((e) => console.warn("Update category count error:", e));

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus dari database",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
