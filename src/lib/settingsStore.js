// Store terpusat untuk Pengaturan Website & SEO Rumah Indah Carpet (Database Prisma + Local Storage + Realtime Event Sync)

export const DEFAULT_SETTINGS = {
  // General & Profil Bisnis
  companyName: "Rumah Indah Carpet",
  tagline: "Spesialis Karpet Masjid, Hotel, Kantor & Custom Premium",
  phone: "0821-2128-701",
  whatsapp: "08212128701",
  email: "rumahindahkarpet1@gmail.com",
  address: "Jl. Raya Taman No. 45, Sidoarjo, Jawa Timur (Dekat Bundaran Waru)",
  workingHours: "Senin - Sabtu: 08:00 - 17:00 WIB (Minggu Libur/Perjanjian)",
  description:
    "Rumah Indah Carpet adalah produsen dan distributor karpet terkemuka di Indonesia yang melayani penjualan, pembuatan motif custom, hingga jasa pemasangan bergaransi untuk masjid, hotel, kantor, dan residensial.",

  // Social & Lokasi
  instagram: "https://instagram.com/rumahindahcarpet",
  facebook: "https://facebook.com/rumahindahcarpet",
  tiktok: "https://tiktok.com/@rumahindahcarpet",
  youtube: "https://youtube.com/@rumahindahcarpet",
  mapsUrl: "https://maps.google.com/?q=Rumah+Indah+Carpet+Sidoarjo",

  // SEO & Metadata Default
  metaTitle: "Rumah Indah Carpet - Produsen & Toko Karpet Masjid & Hotel Premium Sidoarjo Surabaya",
  metaDescription:
    "Pusat karpet masjid, karpet hotel, karpet kantor, dan karpet custom berkualitas tinggi dengan harga distributor langsung. Gratis konsultasi & pemasangan rapi bergaransi.",
  metaKeywords:
    "karpet masjid, karpet hotel, karpet kantor, karpet custom, rumah indah carpet, karpet sidoarjo, karpet surabaya, produsen karpet, pasang karpet masjid",
  metaAuthor: "Rumah Indah Carpet Indonesia",
  ogImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
  canonicalUrl: "https://rumahindahcarpet.co.id",
  robotsIndex: "index, follow",

  // Banner Pengumuman & Promo
  promoActive: "true",
  promoText: "🎉 Dapatkan Diskon Spesial Karpet Masjid & Free Obras dari Rumah Indah Carpet! Hubungi Kami Sekarang.",
  promoLink: "https://wa.me/628212128701",

  // Layanan Survei & Konsultasi Cabang
  surveyActive: "true",
  surveyBadge: "LAYANAN SURVEI & KONSULTASI GRATIS",
  surveyTitle: "Ingin Tim Kami Datang Langsung ke Lokasi Anda?",
  surveyDescription:
    "Dapatkan layanan ukur lokasi presisi, estimasi kebutuhan karpet, dan bawa ratusan sampel bahan langsung ke masjid, kantor, atau kediaman Anda di seluruh Jawa Timur.",
  surveyButtonText: "Jadwalkan Survei Sekarang",
  surveyWhatsapp: "08212128701",
  surveyMessage:
    "Halo Rumah Indah Carpet, saya ingin mengajukan jadwal survei lokasi dan konsultasi sampel karpet.",
};

const STORAGE_KEY = "rumahindah_website_settings_v3";

let inFlightSettingsPromise = null;
let lastSettingsSyncTime = 0;
const CACHE_TTL_MS = 60000;

/**
 * Fetch pengaturan terbaru dari database Prisma
 */
export async function syncSettingsFromDatabase(force = false) {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  const now = Date.now();
  if (!force && now - lastSettingsSyncTime < CACHE_TTL_MS) {
    return getStoredSettings();
  }

  if (inFlightSettingsPromise) {
    return inFlightSettingsPromise;
  }

  inFlightSettingsPromise = (async () => {
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success && json.data) {
        lastSettingsSyncTime = Date.now();
        const merged = {
          ...DEFAULT_SETTINGS,
          ...json.data,
          promoActive: String(json.data.promoActive),
          surveyActive: String(json.data.surveyActive ?? true),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(
          new CustomEvent("abcarpet:settings_updated", {
            detail: merged,
          })
        );
        return merged;
      }
    } catch (err) {
      console.warn("Gagal sinkron database pengaturan:", err);
    } finally {
      inFlightSettingsPromise = null;
    }
    return getStoredSettings();
  })();

  return inFlightSettingsPromise;
}

/**
 * Mendapatkan pengaturan yang tersimpan di localStorage atau fallback ke default
 */
export function getStoredSettings() {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.error("Gagal membaca pengaturan dari storage:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Menyimpan data pengaturan ke API database Prisma & localStorage
 */
export async function saveSettings(newSettings) {
  const merged = {
    ...getStoredSettings(),
    ...newSettings,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(
        new CustomEvent("abcarpet:settings_updated", {
          detail: merged,
        })
      );
    } catch (e) {
      console.warn("Error caching settings:", e);
    }
  }

  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
    const result = await res.json();
    if (result.success && result.data) {
      return result.data;
    }
  } catch (error) {
    console.error("Gagal menyimpan data pengaturan ke database:", error);
  }

  return merged;
}

/**
 * Reset pengaturan ke nilai awal bawaan pabrik
 */
export async function resetSettings() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      window.dispatchEvent(
        new CustomEvent("abcarpet:settings_updated", {
          detail: DEFAULT_SETTINGS,
        })
      );
    } catch (e) {
      console.warn("Error resetting settings cache:", e);
    }
  }

  try {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(DEFAULT_SETTINGS),
    });
  } catch (e) {
    console.warn("Gagal reset pengaturan di server database:", e);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Menghapus/mengosongkan data SEO & Metadata Google dari database Prisma & localStorage
 */
export async function deleteSeoSettings() {
  const current = getStoredSettings();
  const cleared = {
    ...current,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogImage: "",
    robotsIndex: "index, follow",
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleared));
      window.dispatchEvent(
        new CustomEvent("abcarpet:settings_updated", {
          detail: cleared,
        })
      );
    } catch (e) {
      console.warn("Error caching cleared SEO settings:", e);
    }
  }

  try {
    const res = await fetch("/api/settings?type=seo", {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.success && result.data) {
      const merged = {
        ...cleared,
        ...result.data,
        promoActive: String(result.data.promoActive),
        surveyActive: String(result.data.surveyActive ?? true),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch (error) {
    console.error("Gagal menghapus data SEO di database:", error);
    await saveSettings(cleared);
  }

  return cleared;
}

/**
 * Subscribe terhadap perubahan pengaturan (antar komponen dan antar tab)
 */
export function subscribeSettings(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e) => {
    if (e?.detail) {
      callback(e.detail);
    } else {
      callback(getStoredSettings());
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getStoredSettings());
    }
  };

  window.addEventListener("abcarpet:settings_updated", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener("abcarpet:settings_updated", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
