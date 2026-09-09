import PortfolioDetail from "../../../views/PortfolioDetail";
import { INITIAL_PORTFOLIOS } from "@/lib/data";
import prisma from "@/lib/prisma";

export const revalidate = 180;
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const portfolioId = Number(resolvedParams?.id);

  let item = INITIAL_PORTFOLIOS.find((p) => p.id === portfolioId);

  try {
    const dbPortfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });
    if (dbPortfolio) {
      item = {
        ...dbPortfolio,
        media: Array.isArray(dbPortfolio.media)
          ? dbPortfolio.media
          : typeof dbPortfolio.media === "string"
          ? JSON.parse(dbPortfolio.media)
          : [],
      };
    }
  } catch (e) {
    // Gunakan fallback static data jika database offline saat build
  }

  if (!item) {
    return {
      title: "Dokumentasi Proyek Pemasangan Karpet | Rumah Indah Carpet",
      description: "Dokumentasi pengerjaan karpet bergaransi oleh Rumah Indah Carpet.",
      alternates: {
        canonical: `/portfolio/${resolvedParams?.id || ""}`,
        languages: {
          "id-ID": `/portfolio/${resolvedParams?.id || ""}`,
        },
      },
    };
  }

  const title = `${item.title} - Dokumentasi Pemasangan Karpet | Rumah Indah Carpet`;
  const description = `Dokumentasi dan spesifikasi pemasangan karpet proyek ${item.title} di ${item.location || "Indonesia"}. Luas area: ${item.area || "-"}, material: ${item.carpetType || "Premium"}.`;
  const coverImage =
    item.image ||
    (Array.isArray(item.media) && item.media[0]?.src) ||
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

  return {
    title,
    description,
    keywords: [
      item.title,
      item.location,
      "pemasangan karpet masjid",
      "proyek karpet hotel",
      "rumah indah carpet",
    ].filter(Boolean),
    alternates: {
      canonical: `/portfolio/${item.id}`,
      languages: {
        "id-ID": `/portfolio/${item.id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `/portfolio/${item.id}`,
      siteName: "Rumah Indah Carpet",
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage],
    },
  };
}

export default function PortfolioPage() {
  return <PortfolioDetail />;
}
