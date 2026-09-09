import BlogDetail from "@/views/BlogDetail";
import prisma from "@/lib/prisma";
import { getArticleBySlug as getStaticArticleBySlug, getAllArticles } from "@/lib/blogData";

export const revalidate = 180;
export const dynamicParams = true;

// Fetch article dynamically from PostgreSQL database (Prisma), with fallback to static data
async function getArticleData(slug) {
  if (!slug) return null;

  try {
    const numId = !isNaN(Number(slug)) && Number(slug) < 2147483647 ? Number(slug) : null;
    const dbArticle = await prisma.article.findFirst({
      where: {
        OR: [
          { slug: slug },
          { slug: { equals: slug, mode: "insensitive" } },
          ...(numId ? [{ id: numId }] : []),
        ],
      },
    });

    if (dbArticle) {
      return {
        ...dbArticle,
        tags: Array.isArray(dbArticle.tags) ? dbArticle.tags : [],
        metaTitle: dbArticle.metaTitle || `${dbArticle.title} | Rumah Indah Carpet`,
        metaDescription: dbArticle.metaDescription || dbArticle.excerpt,
        metaKeywords: dbArticle.metaKeywords || (Array.isArray(dbArticle.tags) ? dbArticle.tags.join(", ") : ""),
        canonicalUrl: dbArticle.canonicalUrl || `https://webcarpet-p2id.vercel.app/blog/${dbArticle.slug}`,
        ogImage: dbArticle.ogImage || dbArticle.image,
        robotsIndex: dbArticle.robotsIndex || "index, follow",
      };
    }
  } catch (err) {
    console.warn("Prisma error in getArticleData:", err.message);
  }

  // Fallback to static articles
  const staticArt = getStaticArticleBySlug(slug);
  if (staticArt) {
    return {
      ...staticArt,
      metaTitle: `${staticArt.title} | Rumah Indah Carpet`,
      metaDescription: staticArt.excerpt,
      metaKeywords: staticArt.tags?.join(", ") || "",
      canonicalUrl: `https://webcarpet-p2id.vercel.app/blog/${staticArt.slug}`,
      ogImage: staticArt.image,
      robotsIndex: "index, follow",
    };
  }

  return null;
}

export async function generateStaticParams() {
  const staticArticles = getAllArticles();
  try {
    const dbArticles = await prisma.article.findMany({
      select: { slug: true },
    });
    if (dbArticles && dbArticles.length > 0) {
      return dbArticles.map((art) => ({ slug: art.slug }));
    }
  } catch (e) {
    // ignore
  }
  return staticArticles.map((art) => ({
    slug: art.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const article = await getArticleData(slug);

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan | Rumah Indah Carpet",
      description: "Artikel yang Anda cari tidak dapat ditemukan.",
    };
  }

  const title = article.metaTitle || `${article.title} | Rumah Indah Carpet`;
  const description = article.metaDescription || article.excerpt || "Baca artikel edukasi dan panduan karpet dari Rumah Indah Carpet.";
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
      publishedTime: article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date().toISOString(),
      authors: ["Rumah Indah Carpet"],
      tags: Array.isArray(article.tags) ? article.tags : [],
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
  const article = await getArticleData(slug);

  const jsonLd = article
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt,
        image: [article.ogImage || article.image],
        datePublished: article.createdAt ? new Date(article.createdAt).toISOString() : "2026-02-28T09:00:00.000Z",
        dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : "2026-02-28T09:00:00.000Z",
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
        keywords: article.metaKeywords || (Array.isArray(article.tags) ? article.tags.join(", ") : ""),
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
