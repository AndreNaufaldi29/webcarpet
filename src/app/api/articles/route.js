import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ARTICLES } from "@/lib/blogData";

const slugify = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where = {};
    if (category && category !== "Semua") {
      where.category = { equals: category };
    }
    if (status && status !== "Semua") {
      where.status = { equals: status };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    let articles = [];
    try {
      articles = await prisma.article.findMany({
        where,
        orderBy: { id: "desc" },
      });

      // If database table is empty, auto-seed default articles to PostgreSQL
      if (articles.length === 0 && (!category || category === "Semua") && !search && (!status || status === "Semua")) {
        for (const item of ARTICLES) {
          try {
            await prisma.article.create({
              data: {
                slug: item.slug,
                title: item.title,
                category: item.category,
                excerpt: item.excerpt,
                content: item.content,
                image: item.image,
                readTime: item.readTime,
                publishedAt: item.publishedAt,
                views: item.views || 350,
                tags: item.tags || [],
                status: "Dipublikasikan",
                metaTitle: `${item.title} | Rumah Indah Carpet`,
                metaDescription: item.excerpt,
                metaKeywords: item.tags?.join(", ") || "",
                canonicalUrl: `https://webcarpet-p2id.vercel.app/blog/${item.slug}`,
                ogImage: item.image,
                robotsIndex: "index, follow",
              },
            });
          } catch (e) {
            // Ignore duplicate if already created
          }
        }

        articles = await prisma.article.findMany({
          where,
          orderBy: { id: "desc" },
        });
      }
    } catch (dbErr) {
      console.warn("Prisma articles table query warning, using fallback:", dbErr.message);
    }

    if (!Array.isArray(articles) || articles.length === 0) {
      // Fallback to in-memory ARTICLES
      let filtered = [...ARTICLES];
      if (category && category !== "Semua") {
        filtered = filtered.filter((a) => a.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.excerpt.toLowerCase().includes(q) ||
            a.content.toLowerCase().includes(q)
        );
      }
      return NextResponse.json(
        { success: true, data: filtered, isFallback: true },
        {
          headers: {
            "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
          },
        }
      );
    }

    return NextResponse.json(
      { success: true, data: articles },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data artikel dari database", data: ARTICLES },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      category = "Tips & Panduan",
      excerpt = "",
      content = "",
      image = "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      readTime = "5 Menit Baca",
      publishedAt = "Maret 2026",
      tags = [],
      status = "Dipublikasikan",
      metaTitle = "",
      metaDescription = "",
      metaKeywords = "",
      canonicalUrl = "",
      ogImage = "",
      robotsIndex = "index, follow",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Judul artikel wajib diisi" },
        { status: 400 }
      );
    }

    const generatedSlug = slug && slug.trim() ? slugify(slug) : slugify(title);
    const finalSlug = generatedSlug || `artikel-${Date.now()}`;
    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const articleData = {
      slug: finalSlug,
      title: title.trim(),
      category,
      excerpt: excerpt.trim(),
      content: content.trim(),
      image: image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      readTime,
      publishedAt,
      tags: parsedTags,
      status,
      views: 0,
      metaTitle: metaTitle.trim() || `${title.trim()} | Rumah Indah Carpet`,
      metaDescription: metaDescription.trim() || excerpt.trim(),
      metaKeywords: metaKeywords.trim() || parsedTags.join(", "),
      canonicalUrl: canonicalUrl.trim() || `https://webcarpet-p2id.vercel.app/blog/${finalSlug}`,
      ogImage: ogImage.trim() || image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      robotsIndex: robotsIndex || "index, follow",
    };

    let article;
    try {
      article = await prisma.article.create({
        data: articleData,
      });
    } catch (createErr) {
      if (createErr.code === "P2002") {
        // Handle unique slug collision
        const uniqueSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
        article = await prisma.article.create({
          data: {
            ...articleData,
            slug: uniqueSlug,
            canonicalUrl: canonicalUrl.trim() || `https://webcarpet-p2id.vercel.app/blog/${uniqueSlug}`,
          },
        });
      } else {
        throw createErr;
      }
    }

    try {
      await prisma.adminLog.create({
        data: {
          action: "CREATE_ARTICLE",
          module: "Blog",
          description: `Menambahkan artikel baru: ${article.title} (${article.slug})`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log article create error:", e);
    }

    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan artikel" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      slug,
      title,
      category,
      excerpt,
      content,
      image,
      readTime,
      publishedAt,
      tags,
      status,
      views,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogImage,
      robotsIndex,
    } = body;

    if (!id && !slug) {
      return NextResponse.json(
        { success: false, error: "ID atau slug artikel wajib disertakan" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (slug) updateData.slug = slugify(slug);
    if (category) updateData.category = category;
    if (excerpt !== undefined) updateData.excerpt = excerpt.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (image) updateData.image = image;
    if (readTime !== undefined) updateData.readTime = readTime;
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt;
    if (status !== undefined) updateData.status = status;
    if (views !== undefined) updateData.views = Number(views);
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription.trim();
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords.trim();
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl.trim();
    if (ogImage !== undefined) updateData.ogImage = ogImage.trim();
    if (robotsIndex !== undefined) updateData.robotsIndex = robotsIndex;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    }

    const numId = id && !isNaN(Number(id)) && Number(id) < 2147483647 ? Number(id) : null;
    const where = numId ? { id: numId } : { slug: String(slug || id) };

    const updated = await prisma.article.update({
      where,
      data: updateData,
    });

    try {
      await prisma.adminLog.create({
        data: {
          action: "UPDATE_ARTICLE",
          module: "Blog",
          description: `Memperbarui artikel: ${updated.title}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log article update error:", e);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui artikel" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (!id && !slug) {
      return NextResponse.json(
        { success: false, error: "ID atau slug artikel wajib disertakan" },
        { status: 400 }
      );
    }

    const numId = id && !isNaN(Number(id)) && Number(id) < 2147483647 ? Number(id) : null;
    const where = numId ? { id: numId } : { slug: String(slug || id) };

    const deleted = await prisma.article.delete({
      where,
    });

    try {
      await prisma.adminLog.create({
        data: {
          action: "DELETE_ARTICLE",
          module: "Blog",
          description: `Menghapus artikel: ${deleted.title}`,
          ipAddress: "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Log article delete error:", e);
    }

    return NextResponse.json({ success: true, message: "Artikel berhasil dihapus dari database" });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus artikel" },
      { status: 500 }
    );
  }
}
