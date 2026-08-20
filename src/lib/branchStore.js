// Store terpusat untuk Manajemen Cabang & Showroom AB Carpet (Database Prisma + Local Storage + Realtime Sync)

export const DEFAULT_BRANCHES = [
  {
    id: 1,
    name: "AB Carpet Head Office & Workshop Sidoarjo",
    city: "Sidoarjo",
    badge: "Pusat & Gudang Utama",
    address: "Jl. Raya Taman No. 45, Sidoarjo, Jawa Timur (Dekat Bundaran Waru)",
    phone: "0812-5223-5800",
    mapsUrl: "https://maps.google.com/?q=AB+Carpet+Sidoarjo",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Showroom Cabang Surabaya",
    city: "Surabaya",
    badge: "Showroom Display",
    address: "Jl. Ahmad Yani No. 45, Surabaya, Jawa Timur",
    phone: "0812-5223-5800",
    mapsUrl: "https://maps.google.com/?q=AB+Carpet+Surabaya",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200",
    status: "Aktif",
  },
  {
    id: 3,
    name: "Showroom Cabang Malang",
    city: "Malang",
    badge: "Showroom & Konsultasi",
    address: "Jl. Soekarno Hatta No. 20, Malang, Jawa Timur",
    phone: "0812-5223-5800",
    mapsUrl: "https://maps.google.com/?q=AB+Carpet+Malang",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200",
    status: "Aktif",
  },
];

const STORAGE_KEY = "abcarpet_branches_data_v1";

export async function syncBranchesFromDatabase() {
  if (typeof window === "undefined") return DEFAULT_BRANCHES;
  try {
    const res = await fetch("/api/branches");
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      saveBranches(json.data);
      return json.data;
    }
  } catch (err) {
    console.warn("Gagal sinkron database cabang:", err);
  }
  return getStoredBranches();
}

export function getStoredBranches() {
  if (typeof window === "undefined") {
    return DEFAULT_BRANCHES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BRANCHES));
      return DEFAULT_BRANCHES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_BRANCHES;
  } catch (error) {
    console.error("Gagal membaca cabang dari storage:", error);
    return DEFAULT_BRANCHES;
  }
}

export function saveBranches(branches) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
    window.dispatchEvent(
      new CustomEvent("abcarpet:branches_updated", {
        detail: branches,
      })
    );
  } catch (error) {
    console.error("Gagal menyimpan data cabang:", error);
  }
}

export function subscribeBranches(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e) => {
    if (e?.detail) {
      callback(e.detail);
    } else {
      callback(getStoredBranches());
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getStoredBranches());
    }
  };

  window.addEventListener("abcarpet:branches_updated", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener("abcarpet:branches_updated", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
