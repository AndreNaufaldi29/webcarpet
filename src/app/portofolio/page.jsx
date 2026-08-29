import Portofolio from "../../components/Portofolio";

export const metadata = {
  title: "Portofolio Proyek Pemasangan Karpet Masjid, Hotel & Gedung",
  description:
    "Dokumentasi hasil pengerjaan pemasangan karpet masjid, musholla, hotel berbintang, ballroom, dan perkantoran oleh tim ahli Rumah Indah Carpet di seluruh Indonesia.",
  alternates: {
    canonical: "/portofolio",
    languages: {
      "id-ID": "/portofolio",
    },
  },
  openGraph: {
    title: "Portofolio Proyek Pemasangan Karpet | Rumah Indah Carpet",
    description:
      "Dokumentasi hasil pengerjaan pemasangan karpet masjid, hotel berbintang, dan perkantoran oleh tim ahli Rumah Indah Carpet.",
    url: "/portofolio",
    siteName: "Rumah Indah Carpet",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portofolio Proyek Pemasangan Karpet | Rumah Indah Carpet",
    description:
      "Dokumentasi proyek pemasangan karpet masjid, hotel, dan kantor di seluruh Indonesia.",
  },
};

export default function PortofolioPage() {
  return <Portofolio />;
}
