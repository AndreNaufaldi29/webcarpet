import Catalog from "../../components/Catalog";

export const metadata = {
  title: "Katalog Produk Karpet Lengkap - Karpet Masjid, Hotel, Kantor & Custom",
  description:
    "Jelajahi berbagai pilihan karpet masjid tebal, karpet ballroom hotel, karpet tile kantor, hingga karpet custom motif dari Rumah Indah Carpet dengan kualitas terbaik dan harga langsung produsen.",
  alternates: {
    canonical: "/catalog",
    languages: {
      "id-ID": "/catalog",
    },
  },
  openGraph: {
    title: "Katalog Produk Karpet Lengkap | Rumah Indah Carpet",
    description:
      "Jelajahi berbagai pilihan karpet masjid tebal, karpet ballroom hotel, karpet tile kantor, hingga karpet custom motif dengan harga produsen langsung.",
    url: "/catalog",
    siteName: "Rumah Indah Carpet",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Katalog Produk Karpet Lengkap | Rumah Indah Carpet",
    description: "Jelajahi berbagai pilihan karpet masjid, hotel, kantor, dan custom.",
  },
};

export default function CatalogPage() {
  return <Catalog />;
}
