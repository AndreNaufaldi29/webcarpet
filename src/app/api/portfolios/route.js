import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where = {};
    if (category && category !== "Semua") {
      where.category = { equals: category };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const portfolios = await prisma.portfolio.findMany({
      where,
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ success: true, data: portfolios });
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data portofolio dari database" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      category = "Masjid",
      location = "Indonesia",
      area = "100 m²",
      date = "2026",
      image,
      mediaType = "image",
      description = "",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Judul portofolio wajib diisi" },
        { status: 400 }
      );
    }

    const finalImage = image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800";

    let portfolio;
    try {
      portfolio = await prisma.portfolio.create({
        data: {
          title: title.trim(),
          category,
          location,
          area,
          date,
          image: finalImage,
          mediaType: mediaType || "image",
          description: description.trim(),
        },
      });
    } catch (createErr) {
      if (createErr.code === "P2002") {
        await prisma.$executeRawUnsafe(
          "SELECT setval(pg_get_serial_sequence('portfolios', 'id'), COALESCE((SELECT MAX(id) FROM portfolios), 1))"
        );
        portfolio = await prisma.portfolio.create({
          data: {
            title: title.trim(),
            category,
            location,
            area,
            date,
            image: finalImage,
            mediaType: mediaType || "image",
            description: description.trim(),
          },
        });
      } else {
        throw createErr;
      }
    }

    try {
      await prisma.adminLog.create({
        data: {
          action: "CREATE_PORTFOLIO",
          module: "Portfolio",
          description: `Menambahkan portofolio proyek: ${portfolio.title} (${portfolio.location})`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log portfolio create error:", e);
    }

    return NextResponse.json({ success: true, data: portfolio }, { status: 201 });
  } catch (error) {
    console.error("Error creating portfolio:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan portofolio" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, category, location, area, date, image, mediaType, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID portofolio wajib disertakan" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (category) updateData.category = category;
    if (location !== undefined) updateData.location = location.trim();
    if (area !== undefined) updateData.area = area.trim();
    if (date !== undefined) updateData.date = date.trim();
    if (image) updateData.image = image;
    if (mediaType) updateData.mediaType = mediaType;
    if (description !== undefined) updateData.description = description.trim();

    const updated = await prisma.portfolio.update({
      where: { id: Number(id) },
      data: updateData,
    });

    try {
      await prisma.adminLog.create({
        data: {
          action: "UPDATE_PORTFOLIO",
          module: "Portfolio",
          description: `Memperbarui portofolio proyek: ${updated.title}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log portfolio update error:", e);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating portfolio:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui portofolio" },
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
        { success: false, error: "ID portofolio wajib disertakan" },
        { status: 400 }
      );
    }

    const deleted = await prisma.portfolio.delete({
      where: { id: Number(id) },
    });

    try {
      await prisma.adminLog.create({
        data: {
          action: "DELETE_PORTFOLIO",
          module: "Portfolio",
          description: `Menghapus portofolio proyek: ${deleted.title}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log portfolio delete error:", e);
    }

    return NextResponse.json({ success: true, message: "Portofolio berhasil dihapus dari database" });
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus portofolio" },
      { status: 500 }
    );
  }
}
