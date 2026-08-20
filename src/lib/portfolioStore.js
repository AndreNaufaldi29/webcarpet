// Store terpusat untuk Portofolio Proyek AB Carpet (Database Prisma + Local Storage + Realtime Event Sync)

export const DEFAULT_PORTFOLIOS = [
  {
    id: 1,
    title: "Pemasangan Karpet Masjid Al-Ikhlas",
    category: "Masjid",
    location: "Sidoarjo, Jawa Timur",
    area: "450 m²",
    date: "Januari 2026",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
    mediaType: "image",
    description: "Instalasi karpet masjid tebal 14mm custom motif shaf hijau zamrud dengan list kiblat emas.",
  },
  {
    id: 2,
    title: "Grand Ballroom Karpet Hotel Majapahit",
    category: "Hotel",
    location: "Surabaya, Jawa Timur",
    area: "850 m²",
    date: "Desember 2025",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
    mediaType: "image",
    description: "Karpet axminster motif klasik royal blue peredam kebisingan untuk area ballroom utama.",
  },
  {
    id: 3,
    title: "Karpet Tile Kantor Telkom Regional",
    category: "Kantor",
    location: "Surabaya, Jawa Timur",
    area: "620 m²",
    date: "Februari 2026",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
    mediaType: "image",
    description: "Pemasangan karpet tile 50x50 cm warna abu-abu modern untuk ruang open space dan meeting.",
  },
  {
    id: 4,
    title: "Karpet Rumah Tinggal Mewah Minimalis",
    category: "Rumah",
    location: "Puri Indah, Sidoarjo",
    area: "120 m²",
    date: "Maret 2026",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
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

export async function syncPortfoliosFromDatabase() {
  if (typeof window === "undefined") return DEFAULT_PORTFOLIOS;
  try {
    const res = await fetch("/api/portfolios");
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      savePortfolios(json.data);
      return json.data;
    }
  } catch (err) {
    console.warn("Gagal sinkron database portofolio:", err);
  }
  return getStoredPortfolios();
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
      return parsed;
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
