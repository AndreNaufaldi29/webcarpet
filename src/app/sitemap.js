import { INITIAL_PRODUCTS, INITIAL_PORTFOLIOS } from "@/lib/data";
import { ARTICLES } from "@/lib/blogData";
import prisma from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://webcarpet-p2id.vercel.app";

  let products = INITIAL_PRODUCTS;
  let portfolios = INITIAL_PORTFOLIOS;
  let articles = ARTICLES;

  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: { not: "Nonaktif" } },
      select: { id: true, updatedAt: true },
    });
    if (Array.isArray(dbProducts) && dbProducts.length > 0) {
      products = dbProducts;
    }
  } catch (e) {
    // Gunakan fallback INITIAL_PRODUCTS jika database offline/build
  }

  try {
    const dbPortfolios = await prisma.portfolio.findMany({
      select: { id: true, updatedAt: true },
    });
    if (Array.isArray(dbPortfolios) && dbPortfolios.length > 0) {
      portfolios = dbPortfolios;
    }
  } catch (e) {
    // Gunakan fallback INITIAL_PORTFOLIOS jika database offline/build
  }

  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portofolio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/cabang`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const productRoutes = products.map((item) => ({
    url: `${baseUrl}/product/${item.id}`,
    lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const portfolioRoutes = portfolios.map((item) => ({
    url: `${baseUrl}/portfolio/${item.id}`,
    lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogRoutes = articles.map((art) => ({
    url: `${baseUrl}/blog/${art.slug}`,
    lastModified: art.updatedAt ? new Date(art.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...portfolioRoutes,
    ...blogRoutes,
  ];
}
