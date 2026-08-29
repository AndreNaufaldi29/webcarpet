export default function manifest() {
  return {
    name: "Rumah Indah Carpet - Produsen & Toko Karpet Premium",
    short_name: "Rumah Indah Carpet",
    description:
      "Pusat karpet masjid, karpet hotel, karpet kantor, dan karpet custom berkualitas tinggi dengan harga distributor langsung.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A3B25",
    theme_color: "#0A3B25",
    icons: [
      {
        src: "/rumah_indah_carpet.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/rumah_indah_carpet.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
