import BlogDetail from "@/views/BlogDetail";
import { getArticleBySlug, getAllArticles } from "@/lib/blogData";

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((art) => ({
    slug: art.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan | Rumah Indah Carpet",
      description: "Artikel yang Anda cari tidak dapat ditemukan.",
    };
  }

  const title = article.metaTitle || `${article.title} | Rumah Indah Carpet`;
  const description = article.metaDescription || article.excerpt;
  const coverImage =
    article.ogImage ||
    article.image ||
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

  const keywords = article.metaKeywords
    ? article.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [
        article.category,
        ...(Array.isArray(article.tags) ? article.tags : []),
        "rumah indah carpet",
        "spesialis karpet indonesia",
      ];

  const canonical =
    article.canonicalUrl || `https://webcarpet-p2id.vercel.app/blog/${article.slug}`;

  return {
    title,
    description,
    keywords,
    robots: article.robotsIndex || "index, follow",
    alternates: {
      canonical,
      languages: {
        "id-ID": `/blog/${article.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `/blog/${article.slug}`,
      siteName: "Rumah Indah Carpet",
      type: "article",
      publishedTime: article.updatedAt,
      authors: ["Rumah Indah Carpet"],
      tags: article.tags,
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const article = getArticleBySlug(slug);

  const jsonLd = article
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt,
        image: [article.ogImage || article.image],
        datePublished: article.updatedAt || "2026-02-28T09:00:00.000Z",
        dateModified: article.updatedAt || "2026-02-28T09:00:00.000Z",
        publisher: {
          "@type": "Organization",
          name: "Rumah Indah Carpet",
          url: "https://webcarpet-p2id.vercel.app",
          logo: {
            "@type": "ImageObject",
            url: "https://webcarpet-p2id.vercel.app/logo.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": article.canonicalUrl || `https://webcarpet-p2id.vercel.app/blog/${article.slug}`,
        },
        articleSection: article.category,
        keywords: article.metaKeywords || article.tags?.join(", "),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogDetail initialArticle={article} />
    </>
  );
}
