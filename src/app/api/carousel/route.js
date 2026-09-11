import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEFAULT_SLIDES, DEFAULT_CAROUSEL_SETTINGS } from "@/lib/carouselStore";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    let slides = [];
    try {
      slides = await prisma.heroSlide.findMany({
        orderBy: [{ order: "asc" }, { id: "asc" }],
      });

      // If database is completely empty on first launch, seed default slides
      if (!slides || slides.length === 0) {
        for (let i = 0; i < DEFAULT_SLIDES.length; i++) {
          const item = DEFAULT_SLIDES[i];
          try {
            await prisma.heroSlide.create({
              data: {
                title: item.title,
                badge: item.badge,
                desc: item.desc,
                image: item.image,
                btnPrimaryText: item.btnPrimaryText || "Jelajahi Katalog",
                btnPrimaryLink: item.btnPrimaryLink || "/catalog",
                btnSecondaryText: item.btnSecondaryText || "Lihat Portofolio",
                btnSecondaryLink: item.btnSecondaryLink || "/portofolio",
                order: item.order || i + 1,
                status: item.status || "Aktif",
              },
            });
          } catch (seedErr) {
            // ignore individual seed error
          }
        }

        slides = await prisma.heroSlide.findMany({
          orderBy: [{ order: "asc" }, { id: "asc" }],
        });
      }
    } catch (e) {
      console.warn("Fetch hero_slides from DB error, fallback to defaults:", e.message);
      slides = DEFAULT_SLIDES;
    }

    let carouselSettings = DEFAULT_CAROUSEL_SETTINGS;
    try {
      const dbSetting = await prisma.setting.findUnique({
        where: { id: 1 },
      });
      if (dbSetting) {
        carouselSettings = {
          autoplay: dbSetting.carouselAutoplay ?? true,
          interval: dbSetting.carouselInterval ?? 6500,
        };
      }
    } catch (e) {
      // Fallback settings
    }

    return NextResponse.json(
      {
        success: true,
        data: slides && slides.length > 0 ? slides : DEFAULT_SLIDES,
        settings: carouselSettings,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching carousel slides:", error);
    return NextResponse.json(
      {
        success: true,
        data: DEFAULT_SLIDES,
        settings: DEFAULT_CAROUSEL_SETTINGS,
        warning: "Fallback to default slides",
      }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      badge = "KARPET MASJID & IBADAH",
      desc,
      image,
      btnPrimaryText = "Jelajahi Katalog",
      btnPrimaryLink = "/catalog",
      btnSecondaryText = "Lihat Portofolio",
      btnSecondaryLink = "/portofolio",
      order = 0,
      status = "Aktif",
    } = body;

    if (!title || !title.trim() || !image || !image.trim() || !desc || !desc.trim()) {
      return NextResponse.json(
        { success: false, error: "Judul, deskripsi, dan foto banner slide wajib diisi" },
        { status: 400 }
      );
    }

    const slide = await prisma.heroSlide.create({
      data: {
        title: title.trim(),
        badge: badge ? badge.trim() : "KARPET PREMIUM",
        desc: desc.trim(),
        image: image.trim(),
        btnPrimaryText: btnPrimaryText ? btnPrimaryText.trim() : "Jelajahi Katalog",
        btnPrimaryLink: btnPrimaryLink ? btnPrimaryLink.trim() : "/catalog",
        btnSecondaryText: btnSecondaryText ? btnSecondaryText.trim() : "Lihat Portofolio",
        btnSecondaryLink: btnSecondaryLink ? btnSecondaryLink.trim() : "/portofolio",
        order: Number(order) || 0,
        status: status || "Aktif",
      },
    });

    try {
      await prisma.adminLog.create({
        data: {
          action: "CREATE_CAROUSEL_SLIDE",
          module: "Carousel",
          description: `Menambahkan slide carousel baru: "${slide.title}"`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log carousel create error:", e);
    }

    return NextResponse.json({ success: true, data: slide }, { status: 201 });
  } catch (error) {
    console.error("Error creating carousel slide:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan slide carousel" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();

    // 1. Reset to Defaults
    if (body.action === "RESET_DEFAULTS") {
      try {
        await prisma.heroSlide.deleteMany();
        for (let i = 0; i < DEFAULT_SLIDES.length; i++) {
          const item = DEFAULT_SLIDES[i];
          await prisma.heroSlide.create({
            data: {
              title: item.title,
              badge: item.badge,
              desc: item.desc,
              image: item.image,
              btnPrimaryText: item.btnPrimaryText || "Jelajahi Katalog",
              btnPrimaryLink: item.btnPrimaryLink || "/catalog",
              btnSecondaryText: item.btnSecondaryText || "Lihat Portofolio",
              btnSecondaryLink: item.btnSecondaryLink || "/portofolio",
              order: item.order || i + 1,
              status: item.status || "Aktif",
            },
          });
        }

        await prisma.setting.upsert({
          where: { id: 1 },
          update: {
            carouselAutoplay: DEFAULT_CAROUSEL_SETTINGS.autoplay,
            carouselInterval: DEFAULT_CAROUSEL_SETTINGS.interval,
          },
          create: {
            id: 1,
            companyName: "Rumah Indah Carpet",
            carouselAutoplay: DEFAULT_CAROUSEL_SETTINGS.autoplay,
            carouselInterval: DEFAULT_CAROUSEL_SETTINGS.interval,
          },
        });

        const resetSlides = await prisma.heroSlide.findMany({
          orderBy: [{ order: "asc" }, { id: "asc" }],
        });

        return NextResponse.json({
          success: true,
          data: resetSlides,
          settings: DEFAULT_CAROUSEL_SETTINGS,
          message: "Slide carousel berhasil di-reset ke bawaan di Database",
        });
      } catch (resetErr) {
        console.warn("Reset carousel error:", resetErr.message);
        return NextResponse.json({
          success: true,
          data: DEFAULT_SLIDES,
          settings: DEFAULT_CAROUSEL_SETTINGS,
        });
      }
    }

    // 2. Update Global Carousel Settings (autoplay, interval)
    if (body.action === "UPDATE_SETTINGS") {
      const { autoplay, interval } = body;
      try {
        await prisma.setting.upsert({
          where: { id: 1 },
          update: {
            carouselAutoplay: Boolean(autoplay),
            carouselInterval: Number(interval) || 6500,
          },
          create: {
            id: 1,
            companyName: "Rumah Indah Carpet",
            carouselAutoplay: Boolean(autoplay),
            carouselInterval: Number(interval) || 6500,
          },
        });
      } catch (err) {
        console.warn("Update carousel setting in DB error:", err.message);
      }

      return NextResponse.json({
        success: true,
        message: "Pengaturan global carousel berhasil diperbarui",
      });
    }

    // 3. Bulk Reordering
    if (body.action === "REORDER_SLIDES" && Array.isArray(body.slides)) {
      for (let i = 0; i < body.slides.length; i++) {
        const item = body.slides[i];
        const numericId = parseInt(item.id, 10);
        if (!isNaN(numericId) && numericId > 0) {
          try {
            await prisma.heroSlide.updateMany({
              where: { id: numericId },
              data: { order: i + 1 },
            });
          } catch (e) {
            // safely ignore individual reorder failures
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Urutan slide carousel berhasil diperbarui",
      });
    }

    // 4. Standard Single Slide Update
    const {
      id,
      title,
      badge,
      desc,
      image,
      btnPrimaryText,
      btnPrimaryLink,
      btnSecondaryText,
      btnSecondaryLink,
      order,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID slide wajib disertakan" },
        { status: 400 }
      );
    }

    const numericId = parseInt(id, 10);
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (badge !== undefined) updateData.badge = badge.trim();
    if (desc !== undefined) updateData.desc = desc.trim();
    if (image !== undefined) updateData.image = image.trim();
    if (btnPrimaryText !== undefined) updateData.btnPrimaryText = btnPrimaryText.trim();
    if (btnPrimaryLink !== undefined) updateData.btnPrimaryLink = btnPrimaryLink.trim();
    if (btnSecondaryText !== undefined) updateData.btnSecondaryText = btnSecondaryText.trim();
    if (btnSecondaryLink !== undefined) updateData.btnSecondaryLink = btnSecondaryLink.trim();
    if (order !== undefined) updateData.order = Number(order);
    if (status !== undefined) updateData.status = status;

    let updatedSlide;
    if (!isNaN(numericId) && numericId > 0) {
      const existing = await prisma.heroSlide.findUnique({
        where: { id: numericId },
      });

      if (existing) {
        updatedSlide = await prisma.heroSlide.update({
          where: { id: numericId },
          data: updateData,
        });
      } else {
        // Create if it didn't exist in DB yet
        updatedSlide = await prisma.heroSlide.create({
          data: {
            title: title ? title.trim() : "Slide Banner",
            badge: badge ? badge.trim() : "KARPET PREMIUM",
            desc: desc ? desc.trim() : "",
            image: image ? image.trim() : "",
            btnPrimaryText: btnPrimaryText ? btnPrimaryText.trim() : "Jelajahi Katalog",
            btnPrimaryLink: btnPrimaryLink ? btnPrimaryLink.trim() : "/catalog",
            btnSecondaryText: btnSecondaryText ? btnSecondaryText.trim() : "Lihat Portofolio",
            btnSecondaryLink: btnSecondaryLink ? btnSecondaryLink.trim() : "/portofolio",
            order: Number(order) || 1,
            status: status || "Aktif",
          },
        });
      }
    } else {
      updatedSlide = await prisma.heroSlide.create({
        data: {
          title: title ? title.trim() : "Slide Banner",
          badge: badge ? badge.trim() : "KARPET PREMIUM",
          desc: desc ? desc.trim() : "",
          image: image ? image.trim() : "",
          btnPrimaryText: btnPrimaryText ? btnPrimaryText.trim() : "Jelajahi Katalog",
          btnPrimaryLink: btnPrimaryLink ? btnPrimaryLink.trim() : "/catalog",
          btnSecondaryText: btnSecondaryText ? btnSecondaryText.trim() : "Lihat Portofolio",
          btnSecondaryLink: btnSecondaryLink ? btnSecondaryLink.trim() : "/portofolio",
          order: Number(order) || 1,
          status: status || "Aktif",
        },
      });
    }

    try {
      await prisma.adminLog.create({
        data: {
          action: "UPDATE_CAROUSEL_SLIDE",
          module: "Carousel",
          description: `Memperbarui slide carousel ID #${updatedSlide.id}: "${updatedSlide.title}"`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log carousel update error:", e);
    }

    return NextResponse.json({ success: true, data: updatedSlide });
  } catch (error) {
    console.error("Error updating carousel slide:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui slide carousel" },
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
        { success: false, error: "ID slide wajib disertakan" },
        { status: 400 }
      );
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      return NextResponse.json({
        success: true,
        message: "Slide lokal berhasil dibersihkan",
      });
    }

    // Use deleteMany to avoid Prisma P2025 error if record does not exist
    const deleteResult = await prisma.heroSlide.deleteMany({
      where: { id: numericId },
    });

    try {
      await prisma.adminLog.create({
        data: {
          action: "DELETE_CAROUSEL_SLIDE",
          module: "Carousel",
          description: `Menghapus slide carousel ID #${numericId}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log carousel delete error:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Slide ID #${numericId} berhasil dihapus dari database`,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error("Error deleting carousel slide:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus slide carousel" },
      { status: 500 }
    );
  }
}
