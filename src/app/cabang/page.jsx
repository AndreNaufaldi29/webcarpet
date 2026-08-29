import Cabang from "../../components/Cabang";
import prisma from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/settingsStore";

export async function generateMetadata() {
  let settings = DEFAULT_SETTINGS;

  try {
    const dbSetting = await prisma.setting.findUnique({
      where: { id: 1 },
    });
    if (dbSetting) {
      settings = { ...DEFAULT_SETTINGS, ...dbSetting };
    }
  } catch (e) {
    // Fallback jika database offline saat build
  }

  const title = `Cabang & Workshop Kami | ${settings.companyName}`;
  const description = `Temukan lokasi kantor, workshop, dan showroom ${settings.companyName} di Sidoarjo, Surabaya, dan kota lainnya. Siap melayani pemesanan ke seluruh Indonesia.`;
  const imageUrl =
    settings.ogImage ||
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

  return {
    title,
    description,
    alternates: {
      canonical: "/cabang",
      languages: {
        "id-ID": "/cabang",
      },
    },
    openGraph: {
      title,
      description,
      url: "/cabang",
      siteName: settings.companyName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: settings.companyName,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function CabangPage() {
  return <Cabang />;
}
