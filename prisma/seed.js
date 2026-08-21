import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:123@localhost:5432/abcarpet?schema=public";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Memulai seeding database AB Carpet...");

  // 1. SEED USERS
  const users = [
    {
      id: 1,
      name: "Ahmad Fauzi",
      email: "admin@abcarpet.com",
      password: "admin123",
      role: "Super Admin",
      status: "active",
      avatar: "A",
      phone: "0812-3456-7890",
    },
    {
      id: 2,
      name: "Andre Naufaldi",
      email: "andrenaufaldi29@gmail.com",
      password: "coregundam",
      role: "Super Admin",
      status: "active",
      avatar: "A",
      phone: "0823-33893-4488",
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
  }
  console.log("✓ Berhasil seed data Users");

  // 2. SEED CATEGORIES
  const categories = [
    {
      id: 1,
      name: "Karpet Masjid",
      slug: "karpet-masjid",
      description: "Karpet tebal dan empuk untuk masjid, musholla, dan pesantren.",
      productsCount: 12,
      iconType: "mosque",
      status: "Aktif",
    },
    {
      id: 2,
      name: "Karpet Hotel",
      slug: "karpet-hotel",
      description: "Karpet elegan & mewah untuk ballroom, lorong, dan kamar hotel.",
      productsCount: 8,
      iconType: "hotel",
      status: "Aktif",
    },
    {
      id: 3,
      name: "Karpet Kantor",
      slug: "karpet-kantor",
      description: "Karpet tile & roll profesional berdaya tahan tinggi untuk kantor modern.",
      productsCount: 15,
      iconType: "office",
      status: "Aktif",
    },
    {
      id: 4,
      name: "Karpet Rumah",
      slug: "karpet-rumah",
      description: "Karpet aesthetic yang nyaman dan lembut untuk ruang keluarga & kamar.",
      productsCount: 20,
      iconType: "home",
      status: "Aktif",
    },
    {
      id: 5,
      name: "Karpet Custom",
      slug: "karpet-custom",
      description: "Karpet handtufted dengan motif, ukuran, dan ketebalan sesuai pesanan.",
      productsCount: 6,
      iconType: "custom",
      status: "Aktif",
    },
    {
      id: 6,
      name: "Aksesoris Karpet",
      slug: "aksesoris",
      description: "Underlayer foam, list jepit tangga bordes, dan lem perekat karpet.",
      productsCount: 10,
      iconType: "tool",
      status: "Aktif",
    },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log("✓ Berhasil seed data Categories");

  // 3. SEED PRODUCTS
  const products = [
    {
      id: 1,
      name: "Karpet Masjid Premium Grade A+",
      slug: "karpet-masjid-premium",
      category: "Karpet Masjid",
      categoryId: 1,
      stock: 24,
      status: "Aktif",
      rating: 5.0,
      reviews: 24,
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
      name: "Karpet Hotel Luxury Ballroom",
      slug: "karpet-hotel-luxury",
      category: "Karpet Hotel",
      categoryId: 2,
      stock: 15,
      status: "Aktif",
      rating: 5.0,
      reviews: 31,
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
      name: "Karpet Kantor Modern Acoustic",
      slug: "karpet-kantor-modern",
      category: "Karpet Kantor",
      categoryId: 3,
      stock: 18,
      status: "Aktif",
      rating: 5.0,
      reviews: 18,
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
      name: "Karpet Rumah Elegan Shaggy",
      slug: "karpet-rumah-elegan",
      category: "Karpet Rumah",
      categoryId: 4,
      stock: 12,
      status: "Aktif",
      rating: 5.0,
      reviews: 16,
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
      slug: "karpet-custom-eksklusif",
      category: "Karpet Custom",
      categoryId: 5,
      stock: 5,
      status: "Aktif",
      rating: 5.0,
      reviews: 12,
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

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log("✓ Berhasil seed data Products");

  // 4. SEED PORTFOLIOS
  const portfolios = [
    {
      id: 1,
      title: "Pemasangan Karpet Masjid Al-Ikhlas",
      category: "Masjid",
      location: "Sidoarjo, Jawa Timur",
      area: "450 m²",
      date: "Januari 2026",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
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
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
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
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800",
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
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      mediaType: "image",
      description: "Karpet handtufted super soft wool untuk ruang tamu utama dan master bedroom.",
    },
  ];

  for (const pf of portfolios) {
    await prisma.portfolio.upsert({
      where: { id: pf.id },
      update: pf,
      create: pf,
    });
  }
  console.log("✓ Berhasil seed data Portfolios");

  // 5. SEED TESTIMONIALS
  const testimonials = [
    {
      id: 1,
      name: "Budi Santoso",
      role: "Ketua DKM Masjid Agung Al-Ikhlas",
      category: "Karpet Masjid",
      city: "Surabaya",
      text: "Pemasangan karpet masjid sangat rapi, tebal, dan nyaman sekali untuk sholat tarawih & pengajian. Pelayanan tim AB Carpet sangat memuaskan dan tepat waktu!",
      rating: 5,
      status: "Aktif",
      avatarBg: "#2563eb",
      date: "14 Agu 2026",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43d?w=300",
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
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }
  console.log("✓ Berhasil seed data Testimonials");

  // 6. SEED SETTINGS
  const settingData = {
    id: 1,
    companyName: "Rumah Indah Carpet",
    tagline: "Spesialis Karpet Masjid, Hotel, Kantor & Custom Premium",
    phone: "0812-5223-5800",
    whatsapp: "081252235800",
    email: "marketing1@rumahindahcarpet.com",
    address: "Jl. Raya Taman No. 45, Sidoarjo, Jawa Timur (Dekat Bundaran Waru)",
    workingHours: "Senin - Sabtu: 08:00 - 17:00 WIB (Minggu Libur/Perjanjian)",
    description:
      "Rumah Indah Carpet adalah produsen dan distributor karpet terkemuka di Indonesia yang melayani penjualan, pembuatan motif custom, hingga jasa pemasangan bergaransi untuk masjid, hotel, kantor, dan residensial.",
    instagram: "https://instagram.com/rumahindahcarpet",
    facebook: "https://facebook.com/rumahindahcarpet",
    tiktok: "https://tiktok.com/@rumahindahcarpet",
    youtube: "https://youtube.com/@rumahindahcarpet",
    mapsUrl: "https://maps.google.com/?q=Rumah+Indah+Carpet+Sidoarjo",
    metaTitle: "Rumah Indah Carpet - Produsen & Toko Karpet Masjid & Hotel Premium Sidoarjo Surabaya",
    metaDescription:
      "Pusat karpet masjid, karpet hotel, karpet kantor, dan karpet custom berkualitas tinggi dengan harga distributor langsung. Gratis konsultasi & pemasangan rapi bergaransi.",
    metaKeywords:
      "karpet masjid, karpet hotel, karpet kantor, karpet custom, rumah indah carpet, karpet sidoarjo, karpet surabaya, produsen karpet, pasang karpet masjid",
    metaAuthor: "Rumah Indah Carpet Indonesia",
    ogImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
    canonicalUrl: "https://rumahindahcarpet.co.id",
    robotsIndex: "index, follow",
    promoActive: true,
    promoText: "🎉 Dapatkan Diskon Spesial Karpet Masjid & Free Obras dari Rumah Indah Carpet! Hubungi Kami Sekarang.",
    promoLink: "https://wa.me/6281252235800",
  };

  await prisma.setting.upsert({
    where: { id: 1 },
    update: settingData,
    create: settingData,
  });
  console.log("✓ Berhasil seed data Settings & SEO");

  // 7. SEED BRANCHES
  const branches = [
    {
      id: 1,
      name: "Rumah Indah Carpet Head Office & Workshop Sidoarjo",
      city: "Sidoarjo",
      badge: "Pusat & Gudang Utama",
      address: "Jl. Raya Taman No. 45, Sidoarjo, Jawa Timur (Dekat Bundaran Waru)",
      phone: "0812-5223-5800",
      mapsUrl: "https://maps.google.com/?q=Rumah+Indah+Carpet+Sidoarjo",
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
      mapsUrl: "https://maps.google.com/?q=Rumah+Indah+Carpet+Surabaya",
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
      mapsUrl: "https://maps.google.com/?q=Rumah+Indah+Carpet+Malang",
      image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200",
      status: "Aktif",
    },
  ];

  for (const b of branches) {
    await prisma.branch.upsert({
      where: { id: b.id },
      update: b,
      create: b,
    });
  }
  console.log("✓ Berhasil seed data Branches");

  // 8. SEED ADMIN LOGS
  const adminLogs = [
    {
      id: 1,
      userId: 1,
      userName: "Ahmad Fauzi",
      userRole: "Super Admin",
      action: "LOGIN",
      module: "Auth",
      description: "Super Admin login ke Dashboard AB Carpet",
      ipAddress: "127.0.0.1",
    },
    {
      id: 2,
      userId: 1,
      userName: "Ahmad Fauzi",
      userRole: "Super Admin",
      action: "UPDATE_USER",
      module: "User",
      description: "Memperbarui data dan password user",
      ipAddress: "127.0.0.1",
    },
    {
      id: 3,
      userId: 2,
      userName: "Budi Santoso",
      userRole: "Manager",
      action: "CREATE_PRODUCT",
      module: "Product",
      description: "Menambahkan produk baru Karpet Masjid Premium Grade A+",
      ipAddress: "127.0.0.1",
    },
  ];

  for (const log of adminLogs) {
    await prisma.adminLog.upsert({
      where: { id: log.id },
      update: log,
      create: log,
    });
  }
  console.log("✓ Berhasil seed data Admin Logs");

  // 9. SEED ADMIN NOTIFICATIONS
  const adminNotifications = [
    {
      id: 1,
      title: "Peringatan Stok Rendah",
      message: "Stok Karpet Custom Motif Eksklusif tersisa 5 meter / roll.",
      type: "warning",
      module: "product",
      isRead: false,
      link: "/admin/produk",
    },
    {
      id: 2,
      title: "Review Pelanggan Baru",
      message: "Testimonial baru dari Budi Santoso (Ketua DKM Masjid Agung Al-Ikhlas) telah masuk.",
      type: "success",
      module: "testimonial",
      isRead: false,
      link: "/admin/testimonial",
    },
    {
      id: 3,
      title: "Pengguna Baru Terdaftar",
      message: "Akun Dewi Lestari baru saja didaftarkan sebagai Pelanggan.",
      type: "info",
      module: "user",
      isRead: true,
      link: "/admin/user",
    },
  ];

  for (const notif of adminNotifications) {
    await prisma.adminNotification.upsert({
      where: { id: notif.id },
      update: notif,
      create: notif,
    });
  }
  console.log("✓ Berhasil seed data Admin Notifications");

  // SYNC POSTGRES AUTO-INCREMENT SEQUENCES
  try {
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));
      SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1));
      SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1));
      SELECT setval(pg_get_serial_sequence('portfolios', 'id'), COALESCE((SELECT MAX(id) FROM portfolios), 1));
      SELECT setval(pg_get_serial_sequence('testimonials', 'id'), COALESCE((SELECT MAX(id) FROM testimonials), 1));
      SELECT setval(pg_get_serial_sequence('settings', 'id'), COALESCE((SELECT MAX(id) FROM settings), 1));
      SELECT setval(pg_get_serial_sequence('branches', 'id'), COALESCE((SELECT MAX(id) FROM branches), 1));
      SELECT setval(pg_get_serial_sequence('admin_logs', 'id'), COALESCE((SELECT MAX(id) FROM admin_logs), 1));
      SELECT setval(pg_get_serial_sequence('admin_notifications', 'id'), COALESCE((SELECT MAX(id) FROM admin_notifications), 1));
    `);
    console.log("✓ Berhasil menyinkronkan sequence ID PostgreSQL");
  } catch (e) {
    console.warn("Sequence sync warning:", e);
  }

  console.log("🎉 Database AB Carpet telah berhasil disinkronkan sepenuhnya!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
