// Store terpusat untuk Portofolio Proyek AB Carpet (Database Prisma + Local Storage + Realtime Event Sync)

export const CATEGORY_FALLBACK_IMAGES = {
  Masjid: [
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
    "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200",
    "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200",
    "https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=1200",
    "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1200",
  ],
  Hotel: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200",
    "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1200",
  ],
  Kantor: [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200",
  ],
  Rumah: [
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200",
    "https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200",
  ],
  Custom: [
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
  ],
};

export function getPortfolioGalleryImages(portfolio) {
  if (!portfolio) return CATEGORY_FALLBACK_IMAGES["Masjid"];

  // 1. If images is already an array with valid items
  if (Array.isArray(portfolio.images) && portfolio.images.length > 0) {
    return portfolio.images.filter(Boolean);
  }

  // 2. If media property exists (from DB JSON or media array)
  if (Array.isArray(portfolio.media) && portfolio.media.length > 0) {
    const extracted = portfolio.media
      .map((m) => (typeof m === "string" ? m : m?.src))
      .filter(Boolean);
    if (extracted.length > 0) return extracted;
  }

  // 3. Fallback based on category with main image prioritized
  const catKey =
    Object.keys(CATEGORY_FALLBACK_IMAGES).find((k) =>
      portfolio.category?.toLowerCase().includes(k.toLowerCase())
    ) || "Masjid";

  const fallbackList =
    CATEGORY_FALLBACK_IMAGES[catKey] || CATEGORY_FALLBACK_IMAGES["Masjid"];

  if (portfolio.image && typeof portfolio.image === "string") {
    const others = fallbackList.filter((img) => img !== portfolio.image);
    return [portfolio.image, ...others];
  }

  return fallbackList;
}

export const DEFAULT_PORTFOLIOS = [
  {
    id: 1,
    title: "Pemasangan Karpet Masjid Al-Ikhlas",
    category: "Masjid",
    location: "Sidoarjo, Jawa Timur",
    area: "450 m²",
    duration: "7 Hari",
    date: "Januari 2026",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200",
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200",
      "https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=1200",
      "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1200",
    ],
    mediaType: "image",
    description: "Instalasi karpet masjid tebal 14mm custom motif shaf hijau zamrud dengan list kiblat emas.",
  },
  {
    id: 2,
    title: "Grand Ballroom Karpet Hotel Majapahit",
    category: "Hotel",
    location: "Surabaya, Jawa Timur",
    area: "850 m²",
    duration: "14 Hari",
    date: "Desember 2025",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200",
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1200",
    ],
    mediaType: "image",
    description: "Karpet axminster motif klasik royal blue peredam kebisingan untuk area ballroom utama.",
  },
  {
    id: 3,
    title: "Karpet Tile Kantor Telkom Regional",
    category: "Kantor",
    location: "Surabaya, Jawa Timur",
    area: "620 m²",
    duration: "5 Hari",
    date: "Februari 2026",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200",
    ],
    mediaType: "image",
    description: "Pemasangan karpet tile 50x50 cm warna abu-abu modern untuk ruang open space dan meeting.",
  },
  {
    id: 4,
    title: "Karpet Rumah Tinggal Mewah Minimalis",
    category: "Rumah",
    location: "Puri Indah, Sidoarjo",
    area: "120 m²",
    duration: "3 Hari",
    date: "Maret 2026",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200",
      "https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200",
    ],
    mediaType: "image",
    description: "Karpet handtufted super soft wool untuk ruang tamu utama dan master bedroom.",
  },
];

const STORAGE_KEY = "abcarpet_admin_portfolios_v1";

export function isVideoMedia(url = "", mediaType = "") {
  if (mediaType === "video") return true;
  if (!url || typeof url !== "string") return false;
  return (
    url.startsWith("data:video") ||
    url.endsWith(".mp4") ||
    url.endsWith(".webm") ||
    url.endsWith(".mov") ||
    url.includes("video/mp4")
  );
}

let inFlightPortfoliosPromise = null;
let lastPortfoliosSyncTime = 0;
const CACHE_TTL_MS = 60000;

export async function syncPortfoliosFromDatabase(force = false) {
  if (typeof window === "undefined") return DEFAULT_PORTFOLIOS;

  const now = Date.now();
  if (!force && now - lastPortfoliosSyncTime < CACHE_TTL_MS) {
    return getStoredPortfolios();
  }

  if (inFlightPortfoliosPromise) {
    return inFlightPortfoliosPromise;
  }

  inFlightPortfoliosPromise = (async () => {
    try {
      const res = await fetch("/api/portfolios");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        lastPortfoliosSyncTime = Date.now();
        // Enrich with gallery images if missing
        const enriched = json.data.map((item) => ({
          ...item,
          images: getPortfolioGalleryImages(item),
        }));
        savePortfolios(enriched);
        return enriched;
      }
    } catch (err) {
      console.warn("Gagal sinkron database portofolio:", err);
    } finally {
      inFlightPortfoliosPromise = null;
    }
    return getStoredPortfolios();
  })();

  return inFlightPortfoliosPromise;
}

export function getStoredPortfolios() {
  if (typeof window === "undefined") {
    return DEFAULT_PORTFOLIOS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PORTFOLIOS));
      return DEFAULT_PORTFOLIOS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure each item has images array
      const enriched = parsed.map((item) => {
        if (!item.images || !Array.isArray(item.images) || item.images.length === 0) {
          return {
            ...item,
            images: getPortfolioGalleryImages(item),
          };
        }
        return item;
      });
      return enriched;
    }
    return DEFAULT_PORTFOLIOS;
  } catch (error) {
    console.error("Gagal membaca portofolio dari storage:", error);
    return DEFAULT_PORTFOLIOS;
  }
}

export function savePortfolios(portfolios) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
    window.dispatchEvent(
      new CustomEvent("abcarpet:portfolios_updated", {
        detail: portfolios,
      })
    );
  } catch (error) {
    console.error("Gagal menyimpan data portofolio:", error);
  }
}

export function subscribePortfolios(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e) => {
    if (e?.detail) {
      callback(e.detail);
    } else {
      callback(getStoredPortfolios());
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getStoredPortfolios());
    }
  };

  window.addEventListener("abcarpet:portfolios_updated", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener("abcarpet:portfolios_updated", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
