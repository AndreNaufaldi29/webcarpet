import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const allProducts = await prisma.product.findMany({
      select: { id: true, category: true, categoryId: true },
    });

    const formatted = categories.map((cat) => {
      const normCatName = (cat.name || "").toLowerCase().replace(/^karpet\s+/i, "").trim();
      const count = allProducts.filter((p) => {
        if (p.categoryId === cat.id) return true;
        const pCatNorm = (p.category || "").toLowerCase().replace(/^karpet\s+/i, "").trim();
        return pCatNorm === normCatName || p.category === cat.name;
      }).length;

      return {
        ...cat,
        products: count,
        productsCount: count,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data kategori dari database" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, slug, description = "", products = 0, status = "Aktif", iconType = "custom" } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const finalSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    let category;
    try {
      category = await prisma.category.create({
        data: {
          name: name.trim(),
          slug: finalSlug,
          description: description.trim(),
          productsCount: Number(products) || 0,
          status: status || "Aktif",
          iconType: iconType || "custom",
        },
      });
    } catch (createErr) {
      if (createErr.code === "P2002") {
        await prisma.$executeRawUnsafe(
          "SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1))"
        );
        category = await prisma.category.create({
          data: {
            name: name.trim(),
            slug: `${finalSlug}-${Date.now()}`,
            description: description.trim(),
            productsCount: Number(products) || 0,
            status: status || "Aktif",
            iconType: iconType || "custom",
          },
        });
      } else {
        throw createErr;
      }
    }

    try {
      await prisma.adminLog.create({
        data: {
          action: "CREATE_CATEGORY",
          module: "Category",
          description: `Membuat kategori baru: ${category.name}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log category create error:", e);
    }

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat kategori baru" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, slug, description, products, status, iconType } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID kategori wajib disertakan" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (slug) updateData.slug = slug.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (products !== undefined) updateData.productsCount = Number(products) || 0;
    if (status) updateData.status = status;
    if (iconType) updateData.iconType = iconType;

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: updateData,
    });

    try {
      await prisma.adminLog.create({
        data: {
          action: "UPDATE_CATEGORY",
          module: "Category",
          description: `Memperbarui kategori: ${updated.name}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log category update error:", e);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui kategori" },
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
        { success: false, error: "ID kategori wajib disertakan" },
        { status: 400 }
      );
    }

    const deleted = await prisma.category.delete({
      where: { id: Number(id) },
    });

    try {
      await prisma.adminLog.create({
        data: {
          action: "DELETE_CATEGORY",
          module: "Category",
          description: `Menghapus kategori: ${deleted.name}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log category delete error:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Kategori "${deleted.name}" berhasil dihapus`,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
