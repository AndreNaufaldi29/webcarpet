// Store terpusat untuk Manajemen Hero Carousel & Slider Beranda (Database Prisma + Local Storage + Realtime Sync)

export const DEFAULT_CAROUSEL_SETTINGS = {
  autoplay: true,
  interval: 6500, // ms
  transition: "fade", // "fade" | "slide"
};

export const DEFAULT_SLIDES = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600",
    badge: "KARPET MASJID & IBADAH",
    title: "Lembut, Nyaman & Elegan Untuk Rumah Ibadah Anda",
    desc:
      "Rumah Indah Carpet menyediakan berbagai pilihan karpet berkualitas tinggi untuk masjid, musholla, hotel, kantor dan kebutuhan custom lainnya.",
    btnPrimaryText: "Jelajahi Katalog",
    btnPrimaryLink: "/catalog",
    btnSecondaryText: "Lihat Portofolio",
    btnSecondaryLink: "/portofolio",
    order: 1,
    status: "Aktif",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600",
    badge: "KARPET RESIDENSIAL MEWAH",
    title: "Karpet Premium Untuk Rumah & Hunian Modern",
    desc:
      "Karpet pilihan dengan material terbaik untuk menciptakan kenyamanan maksimal dan kehangatan di setiap sudut rumah Anda.",
    btnPrimaryText: "Jelajahi Katalog",
    btnPrimaryLink: "/catalog",
    btnSecondaryText: "Lihat Portofolio",
    btnSecondaryLink: "/portofolio",
    order: 2,
    status: "Aktif",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600",
    badge: "KARPET KANTOR & KOMERSIAL",
    title: "Karpet Kantor Profesional & Ballroom Hotel",
    desc:
      "Menciptakan suasana kerja yang elegan, kedap suara, nyaman dan meningkatkan produktivitas serta prestise perusahaan.",
    btnPrimaryText: "Jelajahi Katalog",
    btnPrimaryLink: "/catalog",
    btnSecondaryText: "Lihat Portofolio",
    btnSecondaryLink: "/portofolio",
    order: 3,
    status: "Aktif",
  },
];

const SLIDES_STORAGE_KEY = "rumahindah_carousel_slides_v1";
const SETTINGS_STORAGE_KEY = "rumahindah_carousel_settings_v1";

let inFlightSlidesPromise = null;
let lastSlidesSyncTime = 0;
const CACHE_TTL_MS = 15000;

/**
 * Sync slides & settings from Database API
 */
export async function syncSlidesFromDatabase(force = false) {
  if (typeof window === "undefined") return DEFAULT_SLIDES;

  const now = Date.now();
  if (!force && now - lastSlidesSyncTime < CACHE_TTL_MS) {
    return getStoredSlides();
  }

  if (inFlightSlidesPromise) {
    return inFlightSlidesPromise;
  }

  inFlightSlidesPromise = (async () => {
    try {
      const res = await fetch(`/api/carousel?_t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          lastSlidesSyncTime = Date.now();
          saveSlides(json.data);
          if (json.settings) {
            saveCarouselSettings(json.settings);
          }
          return json.data;
        }
      }
    } catch (err) {
      console.warn("Gagal sinkron database carousel:", err);
    } finally {
      inFlightSlidesPromise = null;
    }
    return getStoredSlides();
  })();

  return inFlightSlidesPromise;
}

/**
 * Get stored slides from LocalStorage or default
 */
export function getStoredSlides() {
  if (typeof window === "undefined") {
    return DEFAULT_SLIDES;
  }

  try {
    const raw = localStorage.getItem(SLIDES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SLIDES_STORAGE_KEY, JSON.stringify(DEFAULT_SLIDES));
      return DEFAULT_SLIDES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return DEFAULT_SLIDES;
  } catch (error) {
    console.error("Gagal membaca carousel slides dari storage:", error);
    return DEFAULT_SLIDES;
  }
}

/**
 * Save slides to LocalStorage & dispatch custom event
 */
export function saveSlides(slides) {
  if (typeof window === "undefined") return;
  try {
    const sorted = [...slides].sort((a, b) => (a.order || 0) - (b.order || 0));
    localStorage.setItem(SLIDES_STORAGE_KEY, JSON.stringify(sorted));
    window.dispatchEvent(
      new CustomEvent("abcarpet:carousel_updated", {
        detail: sorted,
      })
    );
  } catch (error) {
    console.error("Gagal menyimpan data carousel slides:", error);
  }
}

/**
 * Subscribe to realtime slide updates
 */
export function subscribeSlides(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e) => {
    if (e?.detail) {
      callback(e.detail);
    } else {
      callback(getStoredSlides());
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === SLIDES_STORAGE_KEY) {
      callback(getStoredSlides());
    }
  };

  window.addEventListener("abcarpet:carousel_updated", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener("abcarpet:carousel_updated", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

/**
 * Get stored carousel global settings
 */
export function getStoredCarouselSettings() {
  if (typeof window === "undefined") {
    return DEFAULT_CAROUSEL_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(DEFAULT_CAROUSEL_SETTINGS)
      );
      return DEFAULT_CAROUSEL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CAROUSEL_SETTINGS, ...parsed };
  } catch (error) {
    console.error("Gagal membaca carousel settings dari storage:", error);
    return DEFAULT_CAROUSEL_SETTINGS;
  }
}

/**
 * Save carousel global settings
 */
export function saveCarouselSettings(settings) {
  if (typeof window === "undefined") return;
  try {
    const merged = { ...DEFAULT_CAROUSEL_SETTINGS, ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(
      new CustomEvent("abcarpet:carousel_settings_updated", {
        detail: merged,
      })
    );
  } catch (error) {
    console.error("Gagal menyimpan data carousel settings:", error);
  }
}

/**
 * Subscribe to carousel settings updates
 */
export function subscribeCarouselSettings(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e) => {
    if (e?.detail) {
      callback(e.detail);
    } else {
      callback(getStoredCarouselSettings());
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === SETTINGS_STORAGE_KEY) {
      callback(getStoredCarouselSettings());
    }
  };

  window.addEventListener("abcarpet:carousel_settings_updated", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(
      "abcarpet:carousel_settings_updated",
      handleCustomEvent
    );
    window.removeEventListener("storage", handleStorageEvent);
  };
}
