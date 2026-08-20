import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = {};
    if (status && status !== "Semua") {
      where.status = status;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data testimoni dari database" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      role = "Pelanggan AB Carpet",
      category = "Karpet Masjid",
      city = "Indonesia",
      text,
      review,
      rating = 5,
      status = "Aktif",
      avatarBg = "#2563eb",
      photo,
      media = [],
    } = body;

    const reviewText = text || review;

    if (!name || !name.trim() || !reviewText) {
      return NextResponse.json(
        { success: false, error: "Nama dan ulasan wajib diisi" },
        { status: 400 }
      );
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    let testimonial;
    try {
      testimonial = await prisma.testimonial.create({
        data: {
          name: name.trim(),
          role: role.trim(),
          category,
          city: city.trim(),
          text: reviewText.trim(),
          rating: Number(rating) || 5,
          status: status || "Aktif",
          avatarBg: avatarBg || "#2563eb",
          photo: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`,
          media: Array.isArray(media) ? media : [],
          date: formattedDate,
        },
      });
    } catch (createErr) {
      if (createErr.code === "P2002") {
        await prisma.$executeRawUnsafe(
          "SELECT setval(pg_get_serial_sequence('testimonials', 'id'), COALESCE((SELECT MAX(id) FROM testimonials), 1))"
        );
        testimonial = await prisma.testimonial.create({
          data: {
            name: name.trim(),
            role: role.trim(),
            category,
            city: city.trim(),
            text: reviewText.trim(),
            rating: Number(rating) || 5,
            status: status || "Aktif",
            avatarBg: avatarBg || "#2563eb",
            photo: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`,
            media: Array.isArray(media) ? media : [],
            date: formattedDate,
          },
        });
      } else {
        throw createErr;
      }
    }

    try {
      await prisma.adminLog.create({
        data: {
          action: "CREATE_TESTIMONIAL",
          module: "Testimonial",
          description: `Menambahkan ulasan/testimoni dari: ${testimonial.name} (${testimonial.category})`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log testimonial create error:", e);
    }

    return NextResponse.json({ success: true, data: testimonial }, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan testimoni" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, role, category, city, text, review, rating, status, photo, media } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID testimoni wajib disertakan" },
        { status: 400 }
      );
    }

    const reviewText = text !== undefined ? text : review;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (role !== undefined) updateData.role = role.trim();
    if (category) updateData.category = category;
    if (city !== undefined) updateData.city = city.trim();
    if (reviewText !== undefined) updateData.text = reviewText.trim();
    if (rating !== undefined) updateData.rating = Number(rating);
    if (status) updateData.status = status;
    if (photo) updateData.photo = photo;
    if (media && Array.isArray(media)) updateData.media = media;

    const updated = await prisma.testimonial.update({
      where: { id: Number(id) },
      data: updateData,
    });

    try {
      await prisma.adminLog.create({
        data: {
          action: "UPDATE_TESTIMONIAL",
          module: "Testimonial",
          description: `Memperbarui testimoni dari ${updated.name} (Status: ${updated.status})`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log testimonial update error:", e);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui testimoni" },
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
        { success: false, error: "ID testimoni wajib disertakan" },
        { status: 400 }
      );
    }

    const deleted = await prisma.testimonial.delete({
      where: { id: Number(id) },
    });

    try {
      await prisma.adminLog.create({
        data: {
          action: "DELETE_TESTIMONIAL",
          module: "Testimonial",
          description: `Menghapus testimoni dari: ${deleted.name}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log testimonial delete error:", e);
    }

    return NextResponse.json({ success: true, message: "Testimoni berhasil dihapus dari database" });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus testimoni" },
      { status: 500 }
    );
  }
}
