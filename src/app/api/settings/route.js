import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let setting = await prisma.setting.findUnique({
      where: { id: 1 },
    });

    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          id: 1,
          companyName: "Rumah Indah Carpet",
          tagline: "Spesialis Karpet Masjid, Hotel, Kantor & Custom Premium",
          phone: "0812-5223-5800",
          whatsapp: "081252235800",
          email: "marketing1@rumahindahcarpet.com",
          address: "Jl. Raya Taman No. 45, Sidoarjo, Jawa Timur (Dekat Bundaran Waru)",
          workingHours: "Senin - Sabtu: 08:00 - 17:00 WIB (Minggu Libur/Perjanjian)",
          description:
            "Rumah Indah Carpet adalah produsen dan distributor karpet terkemuka di Indonesia yang melayani penjualan, pembuatan motif custom, hingga jasa pemasangan bergaransi untuk masjid, hotel, kantor, dan residensial.",
          instagram: "https://instagram.com/rumahindahcarpet",
          facebook: "https://facebook.com/rumahindahcarpet",
          tiktok: "https://tiktok.com/@rumahindahcarpet",
          youtube: "https://youtube.com/@rumahindahcarpet",
          mapsUrl: "https://maps.google.com/?q=Rumah+Indah+Carpet+Sidoarjo",
          metaTitle: "Rumah Indah Carpet - Produsen & Toko Karpet Masjid & Hotel Premium Sidoarjo Surabaya",
          metaDescription:
            "Pusat karpet masjid, karpet hotel, karpet kantor, dan karpet custom berkualitas tinggi dengan harga distributor langsung. Gratis konsultasi & pemasangan rapi bergaransi.",
          metaKeywords:
            "karpet masjid, karpet hotel, karpet kantor, karpet custom, rumah indah carpet, karpet sidoarjo, karpet surabaya",
          metaAuthor: "Rumah Indah Carpet Indonesia",
          ogImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
          canonicalUrl: "https://rumahindahcarpet.co.id",
          robotsIndex: "index, follow",
          promoActive: true,
          promoText: "🎉 Dapatkan Diskon Spesial Karpet Masjid & Free Obras dari Rumah Indah Carpet! Hubungi Kami Sekarang.",
          promoLink: "https://wa.me/6281252235800",
        },
      });
    }

    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil pengaturan website" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      companyName,
      tagline,
      phone,
      whatsapp,
      email,
      address,
      workingHours,
      description,
      instagram,
      facebook,
      tiktok,
      youtube,
      mapsUrl,
      metaTitle,
      metaDescription,
      metaKeywords,
      metaAuthor,
      ogImage,
      canonicalUrl,
      robotsIndex,
      promoActive,
      promoText,
      promoLink,
    } = body;

    const isPromoActive =
      promoActive === true || promoActive === "true";

    const setting = await prisma.setting.upsert({
      where: { id: 1 },
      update: {
        companyName,
        tagline,
        phone,
        whatsapp,
        email,
        address,
        workingHours,
        description,
        instagram,
        facebook,
        tiktok,
        youtube,
        mapsUrl,
        metaTitle,
        metaDescription,
        metaKeywords,
        metaAuthor,
        ogImage,
        canonicalUrl,
        robotsIndex,
        promoActive: isPromoActive,
        promoText,
        promoLink,
      },
      create: {
        id: 1,
        companyName: companyName || "Rumah Indah Carpet",
        tagline,
        phone,
        whatsapp,
        email,
        address,
        workingHours,
        description,
        instagram,
        facebook,
        tiktok,
        youtube,
        mapsUrl,
        metaTitle,
        metaDescription,
        metaKeywords,
        metaAuthor,
        ogImage,
        canonicalUrl,
        robotsIndex,
        promoActive: isPromoActive,
        promoText,
        promoLink,
      },
    });

    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}
