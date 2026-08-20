import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const branches = await prisma.branch.findMany({
      where,
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ success: true, data: branches });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data cabang dari database" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      city = "Sidoarjo",
      badge = "Showroom Display",
      address,
      phone = "0812-5223-5800",
      mapsUrl = "",
      image = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
      status = "Aktif",
    } = body;

    if (!name || !name.trim() || !address || !address.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama cabang dan alamat lengkap wajib diisi" },
        { status: 400 }
      );
    }

    let branch;
    try {
      branch = await prisma.branch.create({
        data: {
          name: name.trim(),
          city: city.trim(),
          badge: badge.trim(),
          address: address.trim(),
          phone: phone.trim(),
          mapsUrl: mapsUrl.trim(),
          image: image.trim(),
          status: status || "Aktif",
        },
      });
    } catch (createErr) {
      if (createErr.code === "P2002") {
        await prisma.$executeRawUnsafe(
          "SELECT setval(pg_get_serial_sequence('branches', 'id'), COALESCE((SELECT MAX(id) FROM branches), 1))"
        );
        branch = await prisma.branch.create({
          data: {
            name: name.trim(),
            city: city.trim(),
            badge: badge.trim(),
            address: address.trim(),
            phone: phone.trim(),
            mapsUrl: mapsUrl.trim(),
            image: image.trim(),
            status: status || "Aktif",
          },
        });
      } else {
        throw createErr;
      }
    }

    try {
      await prisma.adminLog.create({
        data: {
          action: "CREATE_BRANCH",
          module: "Branch",
          description: `Menambahkan cabang baru: ${branch.name} (${branch.city})`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log branch create error:", e);
    }

    return NextResponse.json({ success: true, data: branch }, { status: 201 });
  } catch (error) {
    console.error("Error creating branch:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan cabang ke database" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, city, badge, address, phone, mapsUrl, image, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID cabang wajib disertakan" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (city) updateData.city = city.trim();
    if (badge !== undefined) updateData.badge = badge.trim();
    if (address) updateData.address = address.trim();
    if (phone) updateData.phone = phone.trim();
    if (mapsUrl !== undefined) updateData.mapsUrl = mapsUrl.trim();
    if (image) updateData.image = image.trim();
    if (status) updateData.status = status;

    const updated = await prisma.branch.update({
      where: { id: Number(id) },
      data: updateData,
    });

    try {
      await prisma.adminLog.create({
        data: {
          action: "UPDATE_BRANCH",
          module: "Branch",
          description: `Memperbarui data cabang ID #${updated.id}: ${updated.name}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log branch update error:", e);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating branch:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui cabang" },
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
        { success: false, error: "ID cabang wajib disertakan" },
        { status: 400 }
      );
    }

    const deleted = await prisma.branch.delete({
      where: { id: Number(id) },
    });

    try {
      await prisma.adminLog.create({
        data: {
          action: "DELETE_BRANCH",
          module: "Branch",
          description: `Menghapus cabang: ${deleted.name}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log branch delete error:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Cabang "${deleted.name}" berhasil dihapus`,
    });
  } catch (error) {
    console.error("Error deleting branch:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus cabang" },
      { status: 500 }
    );
  }
}
