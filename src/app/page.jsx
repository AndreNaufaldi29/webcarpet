import HeroSearch from "../components/HeroSearch";
import Category from "../components/Category";
import FeaturedCollection from "../components/FeaturedCollection";
import LatestArrival from "../components/LatestArrival";
import Testimonial from "../components/Testimonial";
import TestimonialForm from "../components/TestimonialForm";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Rumah Indah Carpet - Produsen & Toko Karpet Masjid & Hotel Premium Sidoarjo Surabaya",
  description:
    "Pusat karpet masjid, karpet hotel, karpet kantor, dan karpet custom berkualitas tinggi dengan harga distributor langsung. Gratis konsultasi & pemasangan rapi bergaransi.",
  alternates: {
    canonical: "/",
    languages: {
      "id-ID": "/",
    },
  },
  openGraph: {
    title: "Rumah Indah Carpet - Produsen & Toko Karpet Masjid & Hotel Premium",
    description:
      "Pusat karpet masjid, karpet hotel, karpet kantor, dan karpet custom berkualitas tinggi dengan harga distributor langsung.",
    url: "/",
    siteName: "Rumah Indah Carpet",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
        width: 1200,
        height: 630,
        alt: "Rumah Indah Carpet",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rumah Indah Carpet - Produsen & Toko Karpet Masjid & Hotel Premium",
    description: "Pusat karpet masjid, hotel, dan kantor berkualitas tinggi dengan harga produsen langsung.",
    images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200"],
  },
};

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
