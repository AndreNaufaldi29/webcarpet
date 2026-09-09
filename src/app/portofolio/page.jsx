import Portofolio from "../../components/Portofolio";
import prisma from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/settingsStore";

export const revalidate = 180;

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

  const title = `Portofolio Proyek Pemasangan Karpet | ${settings.companyName}`;
  const description = `Dokumentasi hasil pengerjaan pemasangan karpet masjid, hotel berbintang, dan gedung perkantoran oleh tim ahli ${settings.companyName} di seluruh Indonesia.`;
  const imageUrl =
    settings.ogImage ||
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

  return {
    title,
    description,
    alternates: {
      canonical: "/portofolio",
      languages: {
        "id-ID": "/portofolio",
      },
    },
    openGraph: {
      title,
      description,
      url: "/portofolio",
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

export default function PortofolioPage() {
  return <Portofolio />;
}
