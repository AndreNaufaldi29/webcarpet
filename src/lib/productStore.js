// Store terpusat untuk Manajemen Produk AB Carpet (Database Prisma + Local Cache + Realtime Sync)

export const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Karpet Masjid Premium",
    category: "Karpet Masjid",
    rating: 5,
    reviews: 24,
    stock: 24,
    status: "Aktif",
    isFeatured: true,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
    ],
    description:
      "Karpet premium berkualitas tinggi untuk masjid dan musholla dengan material lembut, tahan lama serta sangat nyaman digunakan untuk ibadah.",
    specifications: {
      Material: "Polypropylene Premium",
      Ketebalan: "12 mm",
      Warna: "Maroon / Hijau",
      Garansi: "1 Tahun",
      Ukuran: "Custom Sesuai Ruangan",
    },
  },
  {
    id: 2,
    name: "Karpet Hotel Luxury",
    category: "Karpet Hotel",
    rating: 5,
    reviews: 31,
    stock: 15,
    status: "Aktif",
    isFeatured: true,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
      "https://images.unsplash.com/photo-184154218962-a197022b5858?w=1200",
    ],
    description:
      "Karpet hotel premium dengan desain mewah dan material empuk untuk meningkatkan kenyamanan serta kemewahan area lobby dan koridor.",
    specifications: {
      Material: "Polyester Premium",
      Ketebalan: "14 mm",
      Warna: "Cokelat Emas",
      Garansi: "1 Tahun",
      Ukuran: "Custom",
    },
  },
  {
    id: 3,
    name: "Karpet Kantor Modern",
    category: "Karpet Kantor",
    rating: 5,
    reviews: 18,
    stock: 8,
    status: "Aktif",
    isFeatured: true,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
    ],
    description:
      "Karpet kantor berkualitas tinggi untuk ruang kerja profesional dengan ketahanan ekstra terhadap lalu lintas jalan kaki.",
    specifications: {
      Material: "Nylon Loop Tile",
      Ketebalan: "8 mm",
      Warna: "Abu-abu / Navy",
      Garansi: "1 Tahun",
      Ukuran: "Tile 50x50 cm / Roll",
    },
  },
  {
    id: 4,
    name: "Karpet Rumah Elegan",
    category: "Karpet Rumah",
    rating: 5,
    reviews: 16,
    stock: 12,
    status: "Aktif",
    isFeatured: true,
    isNew: false,
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
    ],
    description:
      "Karpet rumah elegan untuk ruang keluarga dan kamar dengan tekstur sangat lembut dan mudah dibersihkan.",
    specifications: {
      Material: "Soft Wool Blend",
      Ketebalan: "10 mm",
      Warna: "Cream / Beige",
      Garansi: "1 Tahun",
      Ukuran: "200x300 cm / Custom",
    },
  },
  {
    id: 5,
    name: "Karpet Custom Motif Eksklusif",
    category: "Karpet Custom",
    rating: 5,
    reviews: 12,
    stock: 5,
    status: "Aktif",
    isFeatured: false,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
    ],
    description:
      "Karpet custom printing dan hand-tufted dengan motif khusus sesuai permintaan logo dan arsitektur ruangan Anda.",
    specifications: {
      Material: "New Zealand Wool / Nylon",
      Ketebalan: "14 mm",
      Warna: "Full Custom (Sesuai Desain)",
      Garansi: "2 Tahun",
      Ukuran: "Custom Sesuai Ruangan",
    },
  },
];

const STORAGE_KEY = "abcarpet_products_data_v1";

const CATEGORY_DEFAULT_IMAGES = {
  "Karpet Masjid": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
  "Karpet Hotel": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
  "Karpet Kantor": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
  "Karpet Rumah": "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
  "Karpet Custom": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
  "Aksesoris": "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200",
};

/**
 * Fetch data produk dari Prisma API dan simpan ke local cache
 */
export async function syncProductsFromDatabase() {
  if (typeof window === "undefined") return DEFAULT_PRODUCTS;
  try {
    const res = await fetch("/api/products");
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      saveProducts(json.data);
      return json.data;
    }
  } catch (err) {
    console.warn("Gagal sinkron database produk:", err);
  }
  return getStoredProducts();
}

/**
 * Mendapatkan seluruh daftar produk dari LocalStorage
 */
export function getStoredProducts() {
  if (typeof window === "undefined") {
    return DEFAULT_PRODUCTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PRODUCTS;
  } catch (error) {
    console.error("Gagal membaca produk dari storage:", error);
    return DEFAULT_PRODUCTS;
  }
}

/**
 * Menyimpan array produk ke LocalStorage dan broadcast update event
 */
export function saveProducts(products) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(
      new CustomEvent("abcarpet:products_updated", {
        detail: products,
      })
    );
  } catch (error) {
    console.error("Gagal menyimpan data produk:", error);
  }
}

/**
 * Menambahkan produk baru ke database & storage
 */
export async function addProduct({
  name,
  category = "Karpet Masjid",
  stock = 10,
  status = "Aktif",
  rating = 5,
  reviews = 0,
  description = "",
  images = [],
  isFeatured = false,
  isNew = false,
  specifications = {},
}) {
  const current = getStoredProducts();
  const defaultImg =
    CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES["Karpet Masjid"];

  const finalImages =
    Array.isArray(images) && images.length > 0
      ? images
      : [defaultImg];

  const defaultSpecs = {
    Material: "Polypropylene Premium",
    Ketebalan: "12 mm",
    Warna: "Custom Pilihan",
    Garansi: "1 Tahun",
    Ukuran: "Custom Sesuai Ruangan",
    ...specifications,
  };

  const payload = {
    name: name.trim(),
    category: category || "Karpet Masjid",
    stock: Number(stock) >= 0 ? Number(stock) : 0,
    status: status || "Aktif",
    rating: Number(rating) || 5,
    reviews: Number(reviews) || 0,
    isFeatured: Boolean(isFeatured),
    isNew: Boolean(isNew),
    description:
      description.trim() ||
      `Karpet premium berkualitas tinggi kategori ${category} dengan kenyamanan dan ketahanan maksimal.`,
    images: finalImages,
    specifications: defaultSpecs,
  };

  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success && result.data) {
      const updated = [result.data, ...current];
      saveProducts(updated);
      return result.data;
    }
  } catch (err) {
    console.warn("Simpan produk ke API gagal, fallback lokal:", err);
  }

  // Fallback lokal
  const nextId =
    current.length > 0
      ? Math.max(...current.map((item) => Number(item.id) || 0)) + 1
      : 1;
  const newProduct = { ...payload, id: nextId };
  const updated = [newProduct, ...current];
  saveProducts(updated);
  return newProduct;
}

export async function updateProduct(id, updatedFields) {
  const current = getStoredProducts();
  const numId = Number(id);

  try {
    const res = await fetch(`/api/products/${numId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    const result = await res.json();
    if (result.success && result.data) {
      const updated = current.map((item) =>
        item.id === numId ? { ...item, ...result.data } : item
      );
      saveProducts(updated);
      return updated;
    }
  } catch (err) {
    console.warn("Update produk ke API gagal, fallback lokal:", err);
  }

  const updated = current.map((item) => {
    if (item.id === numId) {
      return {
        ...item,
        ...updatedFields,
        stock:
          updatedFields.stock !== undefined
            ? Number(updatedFields.stock)
            : item.stock,
      };
    }
    return item;
  });
  saveProducts(updated);
  return updated;
}

export async function deleteProduct(id) {
  const current = getStoredProducts();
  const numId = Number(id);

  try {
    await fetch(`/api/products/${numId}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Delete produk ke API gagal:", err);
  }

  const updated = current.filter((item) => item.id !== numId);
  saveProducts(updated);
  return updated;
}

export async function toggleProductStatus(id) {
  const current = getStoredProducts();
  const numId = Number(id);
  const target = current.find((item) => item.id === numId);
  if (!target) return current;

  const nextStatus = target.status === "Aktif" ? "Nonaktif" : "Aktif";
  return updateProduct(numId, { status: nextStatus });
}

export async function duplicateProduct(id) {
  const current = getStoredProducts();
  const target = current.find((item) => item.id === Number(id));
  if (!target) return current;

  const duplicatedData = {
    name: `${target.name} (Salinan)`,
    category: target.category,
    stock: target.stock,
    status: target.status,
    rating: target.rating,
    reviews: target.reviews,
    description: target.description,
    images: target.images,
    specifications: target.specifications,
  };

  return addProduct(duplicatedData);
}

export function subscribeProducts(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e) => {
    if (e?.detail) {
      callback(e.detail);
    } else {
      callback(getStoredProducts());
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getStoredProducts());
    }
  };

  window.addEventListener("abcarpet:products_updated", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(
      "abcarpet:products_updated",
      handleCustomEvent
    );
    window.removeEventListener("storage", handleStorageEvent);
  };
}
