// Store terpusat untuk Manajemen Testimonial Rumah Indah Carpet (Database Prisma + Local Storage + Event Synchronization)

export const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    name: "Budi Santoso",
    role: "Ketua DKM Masjid Agung Al-Ikhlas",
    category: "Karpet Masjid",
    city: "Surabaya",
    text: "Pemasangan karpet masjid sangat rapi, tebal, dan nyaman sekali untuk sholat tarawih & pengajian. Pelayanan tim Rumah Indah Carpet sangat memuaskan dan tepat waktu!",
    rating: 5,
    status: "Aktif",
    avatarBg: "#0A3B25",
    date: "14 Agu 2026",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43d?w=300",
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
      },
    ],
  },
  {
    id: 2,
    name: "Siti Rahma",
    role: "General Manager Grand Palace Hotel",
    category: "Karpet Hotel",
    city: "Surabaya",
    text: "Karpet ballroom hotel kami menjadi sangat mewah dan elegan. Tamu-tamu sering memuji kenyamanan dan peredam suaranya. Sangat direkomendasikan!",
    rating: 5,
    status: "Aktif",
    avatarBg: "#9333ea",
    date: "10 Agu 2026",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
      },
    ],
  },
  {
    id: 3,
    name: "Andi Wijaya",
    role: "Facility Manager PT Global Tech",
    category: "Karpet Kantor",
    city: "Sidoarjo",
    text: "Karpet tile kantor kualitasnya nomor satu. Kuat, tahan lalu lalang kursi roda kantor, dan mudah dibersihkan. Tim teknisi sangat profesional saat instalasi.",
    rating: 5,
    status: "Aktif",
    avatarBg: "#16a34a",
    date: "05 Agu 2026",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
      },
    ],
  },
  {
    id: 4,
    name: "Hj. Nurul Aini",
    role: "Pengurus Musholla Nurul Iman",
    category: "Karpet Masjid",
    city: "Gresik",
    text: "Alhamdulillah jamaah musholla sangat senang dengan karpet barunya. Warna hijau shafnya menyejukkan mata dan busanya sangat empuk.",
    rating: 5,
    status: "Aktif",
    avatarBg: "#ea580c",
    date: "01 Agu 2026",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      },
    ],
  },
];

const STORAGE_KEY = "abcarpet_testimonials_data_v1";

const CATEGORY_DEFAULT_IMAGES = {
  "Karpet Masjid": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
  "Karpet Hotel": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
  "Karpet Kantor": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
  "Karpet Rumah": "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
  "Karpet Custom": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
};

const AVATAR_COLORS = [
  "#2563eb",
  "#9333ea",
  "#16a34a",
  "#ea580c",
  "#dc2626",
  "#0d9488",
  "#0284c7",
];

export async function syncTestimonialsFromDatabase() {
  if (typeof window === "undefined") return DEFAULT_TESTIMONIALS;
  try {
    const res = await fetch("/api/testimonials");
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      saveTestimonials(json.data);
      return json.data;
    }
  } catch (err) {
    console.warn("Gagal sinkron database testimoni:", err);
  }
  return getStoredTestimonials();
}

export function getStoredTestimonials() {
  if (typeof window === "undefined") {
    return DEFAULT_TESTIMONIALS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TESTIMONIALS));
      return DEFAULT_TESTIMONIALS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_TESTIMONIALS;
  } catch (error) {
    console.error("Gagal membaca data testimonial dari storage:", error);
    return DEFAULT_TESTIMONIALS;
  }
}

export function saveTestimonials(testimonials) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
    window.dispatchEvent(
      new CustomEvent("abcarpet:testimonials_updated", {
        detail: testimonials,
      })
    );
  } catch (error) {
    console.error("Gagal menyimpan data testimonial:", error);
  }
}

export async function addTestimonial({
  name,
  role = "",
  category = "Karpet Masjid",
  city = "",
  review = "",
  rating = 5,
  status = "Aktif",
  media = [],
}) {
  const current = getStoredTestimonials();
  const randomColor =
    AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const defaultImg =
    CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES["Karpet Masjid"];

  const now = new Date();
  const formattedDate = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const finalMedia =
    Array.isArray(media) && media.length > 0
      ? media
      : [
          {
            type: "image",
            src: defaultImg,
          },
        ];

  const payload = {
    name: name.trim(),
    role: role.trim() || "Pelanggan Rumah Indah Carpet",
    category: category || "Karpet Masjid",
    city: city.trim() || "Indonesia",
    text: review.trim(),
    rating: Number(rating) || 5,
    status: status,
    avatarBg: randomColor,
    date: formattedDate,
    photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=${randomColor.replace("#", "")}&color=fff`,
    media: finalMedia,
  };

  try {
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success && result.data) {
      const updated = [result.data, ...current];
      saveTestimonials(updated);
      return result.data;
    }
  } catch (err) {
    console.warn("Gagal simpan testimoni ke API:", err);
  }

  const fallback = { id: Date.now(), ...payload };
  const updated = [fallback, ...current];
  saveTestimonials(updated);
  return fallback;
}

export async function approveTestimonial(id) {
  return updateTestimonial(id, { status: "Aktif" });
}

export async function rejectTestimonial(id) {
  return deleteTestimonial(id);
}

export async function deleteTestimonial(id) {
  const current = getStoredTestimonials();
  const numId = Number(id);

  try {
    await fetch(`/api/testimonials/${numId}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Gagal delete testimoni ke API:", err);
  }

  const updated = current.filter((item) => item.id !== numId);
  saveTestimonials(updated);
  return updated;
}

export async function updateTestimonial(id, updatedFields) {
  const current = getStoredTestimonials();
  const numId = Number(id);

  try {
    const res = await fetch(`/api/testimonials/${numId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    const result = await res.json();
    if (result.success && result.data) {
      const updated = current.map((item) =>
        item.id === numId ? { ...item, ...result.data } : item
      );
      saveTestimonials(updated);
      return updated;
    }
  } catch (err) {
    console.warn("Gagal update testimoni ke API:", err);
  }

  const updated = current.map((item) =>
    item.id === numId ? { ...item, ...updatedFields } : item
  );
  saveTestimonials(updated);
  return updated;
}

export function subscribeTestimonials(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e) => {
    if (e?.detail) {
      callback(e.detail);
    } else {
      callback(getStoredTestimonials());
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getStoredTestimonials());
    }
  };

  window.addEventListener("abcarpet:testimonials_updated", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(
      "abcarpet:testimonials_updated",
      handleCustomEvent
    );
    window.removeEventListener("storage", handleStorageEvent);
  };
}
