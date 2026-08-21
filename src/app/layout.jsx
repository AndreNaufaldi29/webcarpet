import "../App.css";
import "../components/global.css";
import "../views/pages.css";


import SiteShell from "../components/SiteShell";

export const metadata = {
   dataBase: new URL("https://rumahindahcarpet.co.id"),
  title: {
    default: "Rumah Indah Carpet - Produsen & Toko Karpet Masjid & Hotel Premium Sidoarjo Surabaya",
    template: "%s | Rumah Indah Carpet",
  },
  description:
    "Pusat karpet masjid, karpet hotel, karpet kantor, dan karpet custom berkualitas tinggi dengan harga distributor langsung. Gratis konsultasi & pemasangan rapi bergaransi.",
  keywords: [
    "karpet masjid",
    "karpet hotel",
    "karpet kantor",
    "karpet custom",
    "rumah indah carpet",
    "karpet sidoarjo",
    "karpet surabaya",
    "produsen karpet",
    "pasang karpet masjid",
  ],
  authors: [{ name: "Rumah Indah Carpet Indonesia", url: "https://rumahindahcarpet.co.id" }],
  creator: "Rumah Indah Carpet Indonesia",
  publisher: "Rumah Indah Carpet Indonesia",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://rumahindahcarpet.co.id",
    siteName: "Rumah Indah Carpet",
    title: "Rumah Indah Carpet - Produsen & Toko Karpet Masjid & Hotel Premium Sidoarjo Surabaya",
    description:
      "Pusat karpet masjid, karpet hotel, karpet kantor, dan karpet custom berkualitas tinggi dengan harga distributor langsung. Gratis konsultasi & pemasangan rapi.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
        width: 1200,
        height: 630,
        alt: "Rumah Indah Carpet - Produsen Karpet Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rumah Indah Carpet - Produsen Karpet Premium Sidoarjo Surabaya",
    description:
      "Pusat karpet masjid, hotel, kantor, dan custom berkualitas tinggi dengan harga produsen langsung.",
    images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200"],
  },
  icons: {
    icon: "/rumah_indah_carpet.png",
    shortcut: "/rumah_indah_carpet.png",
    apple: "/rumah_indah_carpet.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
