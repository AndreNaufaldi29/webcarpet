import BlogList from "@/views/BlogList";
import { ARTICLES } from "@/lib/blogData";

export const metadata = {
  title: "Blog & Panduan Karpet Masjid, Hotel & Kantor | Rumah Indah Carpet",
  description:
    "Kumpulan artikel edukasi dan panduan seputar cara memilih karpet masjid tebal, tips karpet ballroom hotel, karpet tile kantor, dan cara perawatan lantai karpet.",
  keywords: [
    "blog karpet",
    "artikel karpet masjid",
    "panduan memilih karpet",
    "tips karpet hotel",
    "karpet tile kantor",
    "rumah indah carpet blog",
    "cara merawat karpet",
  ],
  alternates: {
    canonical: "/blog",
    languages: {
      "id-ID": "/blog",
    },
  },
  openGraph: {
    title: "Blog & Panduan Karpet Masjid, Hotel & Kantor | Rumah Indah Carpet",
    description:
      "Kumpulan artikel edukasi dan panduan seputar cara memilih karpet masjid tebal, tips karpet ballroom hotel, karpet tile kantor, dan cara perawatan lantai karpet.",
    url: "/blog",
    siteName: "Rumah Indah Carpet",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
        width: 1200,
        height: 630,
        alt: "Blog & Panduan Karpet Rumah Indah Carpet",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Panduan Karpet Masjid, Hotel & Kantor | Rumah Indah Carpet",
    description:
      "Kumpulan artikel edukasi dan panduan seputar cara memilih karpet masjid tebal, tips karpet ballroom hotel, karpet tile kantor, dan cara perawatan lantai karpet.",
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
    ],
  },
};

export default function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog Rumah Indah Carpet",
    description:
      "Kumpulan artikel panduan, tips, dan inspirasi karpet masjid, hotel, ballroom, dan kantor.",
    url: "https://webcarpet-p2id.vercel.app/blog",
    publisher: {
      "@type": "Organization",
      name: "Rumah Indah Carpet",
      logo: {
        "@type": "ImageObject",
        url: "https://webcarpet-p2id.vercel.app/logo.png",
      },
    },
    blogPost: ARTICLES.map((art) => ({
      "@type": "BlogPosting",
      headline: art.title,
      description: art.excerpt,
      url: `https://webcarpet-p2id.vercel.app/blog/${art.slug}`,
      datePublished: art.updatedAt || "2026-02-28T09:00:00.000Z",
      image: art.image,
      author: {
        "@type": "Person",
        name: art.author?.name,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogList />
    </>
  );
}
