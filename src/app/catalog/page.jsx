import { Suspense } from "react";
import Catalog from "../../components/Catalog";
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

  const title = `Katalog Produk Karpet Lengkap | ${settings.companyName}`;
  const description = `Jelajahi berbagai pilihan karpet masjid tebal, karpet ballroom hotel, karpet tile kantor, hingga karpet custom motif dari ${settings.companyName}.`;
  const imageUrl =
    settings.ogImage ||
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

  return {
    title,
    description,
    alternates: {
      canonical: "/catalog",
      languages: {
        "id-ID": "/catalog",
      },
    },
    openGraph: {
      title,
      description,
      url: "/catalog",
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

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0A3B25",
            fontWeight: 600,
            fontSize: "1.1rem",
          }}
        >
          Memuat Katalog Karpet...
        </div>
      }
    >
      <Catalog />
    </Suspense>
  );
}
