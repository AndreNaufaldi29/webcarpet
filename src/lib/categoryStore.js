// Store terpusat untuk Manajemen Kategori AB Carpet (Database Prisma + Local Storage + Realtime Sync)

export const DEFAULT_CATEGORIES = [
  {
    id: 1,
    name: "Karpet Masjid",
    slug: "karpet-masjid",
    description: "Tebal, empuk, dan nyaman untuk sholat berjamaah.",
    products: 12,
    iconType: "mosque",
    color: "blue",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Karpet Hotel",
    slug: "karpet-hotel",
    description: "Desain mewah & elegan untuk ballroom dan kamar.",
    products: 8,
    iconType: "hotel",
    color: "purple",
    status: "Aktif",
  },
  {
    id: 3,
    name: "Karpet Kantor",
    slug: "karpet-kantor",
    description: "Tahan aus, modern & peredam suara ruangan kerja.",
    products: 15,
    iconType: "office",
    color: "green",
    status: "Aktif",
  },
  {
    id: 4,
    name: "Karpet Rumah",
    slug: "karpet-rumah",
    description: "Sentuhan lembut & hangat untuk ruang keluarga.",
    products: 20,
    iconType: "home",
    color: "orange",
    status: "Aktif",
  },
  {
    id: 5,
    name: "Karpet Custom",
    slug: "karpet-custom",
    description: "Bebas pilih motif, warna, ukuran sesuai pesanan.",
    products: 6,
    iconType: "custom",
    color: "red",
    status: "Aktif",
  },
  {
    id: 6,
    name: "Aksesoris Karpet",
    slug: "aksesoris-karpet",
    description: "Underlayer, list jepit tangga, & pembersih karpet.",
    products: 10,
    iconType: "tools",
    color: "teal",
    status: "Aktif",
  },
];

const STORAGE_KEY = "abcarpet_categories_data_v1";

const COLOR_PALETTE = ["blue", "purple", "green", "orange", "red", "teal", "indigo", "rose", "amber"];

export function getCategoryColor(cat, index = 0) {
  if (cat?.color) return cat.color;
  const name = (cat?.name || "").toLowerCase();
  if (name.includes("masjid")) return "blue";
  if (name.includes("hotel")) return "purple";
  if (name.includes("kantor")) return "green";
  if (name.includes("rumah")) return "orange";
  if (name.includes("custom")) return "red";
  if (name.includes("aksesoris")) return "teal";
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

export async function syncCategoriesFromDatabase() {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const res = await fetch("/api/categories");
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      saveCategories(json.data);
      return json.data;
    }
  } catch (err) {
    console.warn("Gagal sinkron database kategori:", err);
  }
  return getStoredCategories();
}

export function getStoredCategories() {
  if (typeof window === "undefined") {
    return DEFAULT_CATEGORIES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error("Gagal membaca kategori dari storage:", error);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(
      new CustomEvent("abcarpet:categories_updated", {
        detail: categories,
      })
    );
  } catch (error) {
    console.error("Gagal menyimpan data kategori:", error);
  }
}

export function subscribeCategories(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e) => {
    if (e?.detail) {
      callback(e.detail);
    } else {
      callback(getStoredCategories());
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getStoredCategories());
    }
  };

  window.addEventListener("abcarpet:categories_updated", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener("abcarpet:categories_updated", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
