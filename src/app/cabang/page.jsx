import Cabang from "../../components/Cabang";

export const metadata = {
  title: "Cabang & Workshop Pabrik Karpet Sidoarjo Surabaya",
  description:
    "Temukan lokasi kantor, workshop, dan showroom Rumah Indah Carpet di Sidoarjo, Surabaya, dan kota lainnya. Siap melayani pemesanan, survei lokasi, dan instalasi ke seluruh Indonesia.",
  alternates: {
    canonical: "/cabang",
    languages: {
      "id-ID": "/cabang",
    },
  },
  openGraph: {
    title: "Cabang & Workshop Kami | Rumah Indah Carpet",
    description:
      "Temukan lokasi kantor, workshop, dan showroom Rumah Indah Carpet di Sidoarjo dan Surabaya.",
    url: "/cabang",
    siteName: "Rumah Indah Carpet",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cabang & Workshop Kami | Rumah Indah Carpet",
    description:
      "Temukan lokasi kantor, workshop, dan showroom Rumah Indah Carpet.",
  },
};

export default function CabangPage() {
  return <Cabang />;
}
