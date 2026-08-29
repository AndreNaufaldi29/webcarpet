import HeroSearch from "../components/HeroSearch";
import Category from "../components/Category";
import FeaturedCollection from "../components/FeaturedCollection";
import LatestArrival from "../components/LatestArrival";
import Testimonial from "../components/Testimonial";
import TestimonialForm from "../components/TestimonialForm";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    // Gunakan fallback default jika database offline saat build
  }

  const title =
    settings.metaTitle ||
    `${settings.companyName} - Produsen & Toko Karpet Masjid & Hotel Premium`;
  const description =
    settings.metaDescription || settings.description;
  const keywords = settings.metaKeywords
    ? settings.metaKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];
  const imageUrl =
    settings.ogImage ||
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: "/",
      languages: {
        "id-ID": "/",
      },
    },
    openGraph: {
      title,
      description,
      url: "/",
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

export default function HomePage() {
  return (
    <>
      <SpeedInsights />
      <HeroSearch />
      <Category />
      <FeaturedCollection />
      <LatestArrival />
      <Testimonial />
      <TestimonialForm />
    </>
  );
}
