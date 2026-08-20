// Store data terpusat untuk AB Carpet (Produk, Portfolio, Testimonial, Kategori)

export const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Karpet Masjid Premium",
    category: "Karpet Masjid",
    rating: 5,
    reviews: 24,
    stock: 24,
    status: "Aktif",
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
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
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
    stock: 18,
    status: "Aktif",
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
];

export const INITIAL_PORTFOLIOS = [
  {
    id: 1,
    title: "Pemasangan Karpet Masjid Al-Hidayah",
    category: "Karpet Masjid",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
    description:
      "Pemasangan karpet premium untuk area utama masjid dengan luas lebih dari 500m² menggunakan material berkualitas tinggi dan pengerjaan terampil profesional.",
    location: "Sidoarjo",
    area: "500 m²",
    duration: "7 Hari",
    year: "2026",
  },
  {
    id: 2,
    title: "Karpet Hotel Luxury Surabaya",
    category: "Karpet Hotel",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
    description:
      "Instalasi karpet berkualitas untuk area lobby dan koridor hotel berbintang di Surabaya dengan desain khas elegan.",
    location: "Surabaya",
    area: "850 m²",
    duration: "14 Hari",
    year: "2026",
  },
  {
    id: 3,
    title: "Karpet Kantor Modern Head Office",
    category: "Karpet Kantor",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
    description:
      "Pemasangan karpet tile akustik di gedung perkantoran 4 lantai untuk menciptakan suasana kerja hening dan profesional.",
    location: "Surabaya",
    area: "1200 m²",
    duration: "10 Hari",
    year: "2026",
  },
  {
    id: 4,
    title: "Karpet Custom Residence Villa",
    category: "Karpet Rumah",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
    description:
      "Proyek pemotongan dan obras karpet custom rumah tinggal mewah dengan motif geometris eksklusif.",
    location: "Sidoarjo",
    area: "350 m²",
    duration: "5 Hari",
    year: "2026",
  },
];

export const INITIAL_TESTIMONIALS = [
  {
    id: 1,
    name: "H. Ahmad Fauzi",
    role: "Pengurus Masjid Al-Hidayah",
    text: "Karpet masjid dari AB Carpet sangat lembut, tebal, dan nyaman dipakai jamaah. Pemasangannya sangat presisi!",
    rating: 5,
    status: "Aktif",
  },
  {
    id: 2,
    name: "Siti Rahmawati",
    role: "General Manager Grand Hotel",
    text: "Pelayanan sangat profesional, tepat waktu, dan karpet hotel yang dipasang membuat lobby tampil mewah memukau.",
    rating: 5,
    status: "Aktif",
  },
  {
    id: 3,
    name: "Ir. Bambang Wijaya",
    role: "Project Manager Office Tower",
    text: "Kualitas karpet kantor luar biasa dan pengerjaan obras rapi. Sangat direkomendasikan untuk proyek skala besar.",
    rating: 5,
    status: "Aktif",
  },
];
