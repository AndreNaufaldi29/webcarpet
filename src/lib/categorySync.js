import prisma from "@/lib/prisma";

export function determineCategoryIcon(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("masjid") || lower.includes("musholla")) return "mosque";
  if (lower.includes("hotel") || lower.includes("ballroom")) return "hotel";
  if (lower.includes("kantor") || lower.includes("office") || lower.includes("meeting")) return "office";
  if (lower.includes("rumah") || lower.includes("home") || lower.includes("kamar")) return "home";
  if (lower.includes("custom") || lower.includes("motif")) return "custom";
  if (lower.includes("aksesoris") || lower.includes("underlayer") || lower.includes("alat")) return "tools";
  return "custom";
}

/**
 * Mencari kategori berdasarkan nama, atau otomatis membuatnya di database jika belum ada
 */
export async function findOrCreateCategory(categoryName) {
  if (!categoryName || typeof categoryName !== "string" || !categoryName.trim()) {
    return null;
  }

  const cleanName = categoryName.trim();
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  try {
    // 1. Coba cari kategori yang cocok
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: cleanName },
          { name: { equals: cleanName, mode: "insensitive" } },
          { slug: slug },
        ],
      },
    });

    // 2. Jika belum ada, otomatis buat kategori baru di tabel categories
    if (!category) {
      const iconType = determineCategoryIcon(cleanName);
      try {
        category = await prisma.category.create({
          data: {
            name: cleanName,
            slug: slug,
            description: `Koleksi karpet berkualitas untuk kategori ${cleanName}.`,
            productsCount: 1,
            status: "Aktif",
            iconType: iconType,
          },
        });
      } catch (err) {
        if (err.code === "P2002") {
          // Self-heal sequence
          await prisma.$executeRawUnsafe(
            "SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1))"
          );
          category = await prisma.category.create({
            data: {
              name: cleanName,
              slug: `${slug}-${Date.now()}`,
              description: `Koleksi karpet berkualitas untuk kategori ${cleanName}.`,
              productsCount: 1,
              status: "Aktif",
              iconType: iconType,
            },
          });
        } else {
          throw err;
        }
      }
    }

    return category;
  } catch (error) {
    console.error("Error in findOrCreateCategory:", error);
    return null;
  }
}

/**
 * Sinkronisasi jumlah produk per kategori di database
 */
export async function updateAllCategoryCounts() {
  try {
    const categories = await prisma.category.findMany();
    for (const cat of categories) {
      const count = await prisma.product.count({
        where: {
          OR: [
            { categoryId: cat.id },
            { category: cat.name },
            { category: { equals: cat.name, mode: "insensitive" } },
          ],
        },
      });

      if (cat.productsCount !== count) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { productsCount: count },
        });
      }
    }
  } catch (err) {
    console.warn("Gagal update total produk per kategori:", err);
  }
}
