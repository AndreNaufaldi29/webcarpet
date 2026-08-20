import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { findOrCreateCategory, updateAllCategoryCounts } from "@/lib/categorySync";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const isNew = searchParams.get("isNew");

    const where = {};
    if (category && category !== "Semua" && category !== "Semua Kategori") {
      where.category = { contains: category, mode: "insensitive" };
    }
    if (featured === "true") {
      where.isFeatured = true;
    }
    if (isNew === "true") {
      where.isNew = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data produk dari database" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      category = "Karpet Masjid",
      stock = 10,
      status = "Aktif",
      rating = 5,
      reviews = 0,
      description = "",
      images = [],
      isFeatured = false,
      isNew = false,
      specifications = {},
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama produk wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Cari atau otomatis buat Kategori di tabel categories jika belum ada
    const matchedCategory = await findOrCreateCategory(category);
    const categoryId = matchedCategory ? matchedCategory.id : null;
    const finalCategoryName = matchedCategory ? matchedCategory.name : category.trim();

    const productImages = Array.isArray(images) && images.length > 0
      ? images
      : ["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200"];

    let product;
    try {
      product = await prisma.product.create({
        data: {
          name: name.trim(),
          category: finalCategoryName,
          categoryId: categoryId,
          stock: Number(stock) || 0,
          status: status || "Aktif",
          rating: Number(rating) || 5,
          reviews: Number(reviews) || 0,
          description: description.trim(),
          images: productImages,
          isFeatured: Boolean(isFeatured),
          isNew: Boolean(isNew),
          specifications: specifications || {},
        },
      });
    } catch (createErr) {
      if (createErr.code === "P2002") {
        await prisma.$executeRawUnsafe(
          "SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1))"
        );
        product = await prisma.product.create({
          data: {
            name: name.trim(),
            category: finalCategoryName,
            categoryId: categoryId,
            stock: Number(stock) || 0,
            status: status || "Aktif",
            rating: Number(rating) || 5,
            reviews: Number(reviews) || 0,
            description: description.trim(),
            images: productImages,
            isFeatured: Boolean(isFeatured),
            isNew: Boolean(isNew),
            specifications: specifications || {},
          },
        });
      } else {
        throw createErr;
      }
    }

    // 2. Update jumlah produk di kategori secara otomatis
    updateAllCategoryCounts().catch((e) => console.warn("Update category count error:", e));

    try {
      await prisma.adminLog.create({
        data: {
          action: "CREATE_PRODUCT",
          module: "Product",
          description: `Menambahkan produk baru: ${product.name} (Kategori: ${product.category})`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log product create error:", e);
    }

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan produk ke database" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, category, stock, status, rating, reviews, description, images, isFeatured, isNew, specifications } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID produk wajib disertakan" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (category) {
      const matchedCategory = await findOrCreateCategory(category);
      updateData.category = matchedCategory ? matchedCategory.name : category.trim();
      updateData.categoryId = matchedCategory ? matchedCategory.id : null;
    }
    if (stock !== undefined) updateData.stock = Number(stock);
    if (status) updateData.status = status;
    if (rating !== undefined) updateData.rating = Number(rating);
    if (reviews !== undefined) updateData.reviews = Number(reviews);
    if (description !== undefined) updateData.description = description.trim();
    if (images && Array.isArray(images)) updateData.images = images;
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (isNew !== undefined) updateData.isNew = Boolean(isNew);
    if (specifications) updateData.specifications = specifications;

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
    });

    // Update jumlah produk di kategori
    updateAllCategoryCounts().catch((e) => console.warn("Update category count error:", e));

    try {
      await prisma.adminLog.create({
        data: {
          action: "UPDATE_PRODUCT",
          module: "Product",
          description: `Memperbarui produk ID #${updated.id}: ${updated.name}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log product update error:", e);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui produk" },
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
        { success: false, error: "ID produk wajib disertakan" },
        { status: 400 }
      );
    }

    const deleted = await prisma.product.delete({
      where: { id: Number(id) },
    });

    // Update jumlah produk di kategori
    updateAllCategoryCounts().catch((e) => console.warn("Update category count error:", e));

    try {
      await prisma.adminLog.create({
        data: {
          action: "DELETE_PRODUCT",
          module: "Product",
          description: `Menghapus produk: ${deleted.name}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log product delete error:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Produk "${deleted.name}" berhasil dihapus`,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
