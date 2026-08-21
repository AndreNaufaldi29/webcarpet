import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Seed Users if not exist
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      await prisma.user.createMany({
        data: [
          {
            name: "Ahmad Fauzi",
            email: "admin@abcarpet.com",
            password: "admin123",
            role: "Super Admin",
            status: "active",
            avatar: "A",
            phone: "0812-3456-7890",
          },
          {
            name: "Budi Santoso",
            email: "budi.santoso@abcarpet.com",
            password: "manager123",
            role: "Manager",
            status: "active",
            avatar: "B",
            phone: "0819-8765-4321",
          },
          {
            name: "Hendra Wijaya",
            email: "hendra.staff@abcarpet.com",
            password: "staff123",
            role: "Staff",
            status: "active",
            avatar: "H",
            phone: "0838-4455-6677",
          },
          {
            name: "Siti Rahmawati",
            email: "siti.rahma@gmail.com",
            password: "user12345",
            role: "Pelanggan",
            status: "active",
            avatar: "S",
            phone: "0857-1234-5678",
          },
          {
            name: "Dewi Lestari",
            email: "dewi.lestari@yahoo.com",
            password: "dewi@secret",
            role: "Pelanggan",
            status: "pending",
            avatar: "D",
            phone: "0821-9988-7766",
          },
          {
            name: "Rina Novita",
            email: "rina.novita@gmail.com",
            password: "rina12345",
            role: "Pelanggan",
            status: "inactive",
            avatar: "R",
            phone: "0878-1122-3344",
          },
          {
            name: "Rizky Pratama",
            email: "rizky.pratama@outlook.com",
            password: "rizky@123",
            role: "Pelanggan",
            status: "active",
            avatar: "R",
            phone: "0813-5566-7788",
          },
          {
            name: "Maya Indah",
            email: "maya.indah@gmail.com",
            password: "maya@pass",
            role: "Pelanggan",
            status: "active",
            avatar: "M",
            phone: "0852-6677-8899",
          },
        ],
      });
    }

    // 2. Seed Categories if not exist
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      await prisma.category.createMany({
        data: [
          {
            name: "Karpet Masjid",
            slug: "karpet-masjid",
            description: "Karpet tebal dan empuk untuk masjid, musholla, dan pesantren.",
            productsCount: 12,
            iconType: "mosque",
            status: "Aktif",
          },
          {
            name: "Karpet Hotel",
            slug: "karpet-hotel",
            description: "Karpet elegan & mewah untuk ballroom, lorong, dan kamar hotel.",
            productsCount: 8,
            iconType: "hotel",
            status: "Aktif",
          },
          {
            name: "Karpet Kantor",
            slug: "karpet-kantor",
            description: "Karpet tile & roll profesional berdaya tahan tinggi untuk kantor modern.",
            productsCount: 15,
            iconType: "office",
            status: "Aktif",
          },
          {
            name: "Karpet Rumah",
            slug: "karpet-rumah",
            description: "Karpet aesthetic yang nyaman dan lembut untuk ruang keluarga & kamar.",
            productsCount: 20,
            iconType: "home",
            status: "Aktif",
          },
          {
            name: "Karpet Custom",
            slug: "karpet-custom",
            description: "Karpet handtufted dengan motif, ukuran, dan ketebalan sesuai pesanan.",
            productsCount: 6,
            iconType: "custom",
            status: "Aktif",
          },
          {
            name: "Aksesoris Karpet",
            slug: "aksesoris",
            description: "Underlayer foam, list jepit tangga bordes, dan lem perekat karpet.",
            productsCount: 10,
            iconType: "tool",
            status: "Aktif",
          },
        ],
      });
    }

    // 3. Seed Admin Notifications if not exist
    const notifCount = await prisma.adminNotification.count();
    if (notifCount === 0) {
      await prisma.adminNotification.createMany({
        data: [
          {
            title: "Peringatan Stok Rendah",
            message: "Stok Karpet Custom Motif Eksklusif tersisa 5 meter / roll.",
            type: "warning",
            module: "product",
            isRead: false,
            link: "/admin/produk",
          },
          {
            title: "Review Pelanggan Baru",
            message: "Testimonial baru dari Budi Santoso (Ketua DKM Masjid) telah masuk.",
            type: "success",
            module: "testimonial",
            isRead: false,
            link: "/admin/testimonial",
          },
          {
            title: "Pengguna Baru Terdaftar",
            message: "Akun Dewi Lestari baru saja didaftarkan sebagai Pelanggan.",
            type: "info",
            module: "user",
            isRead: true,
            link: "/admin/user",
          },
        ],
      });
    }

    // 4. Seed Admin Activity Logs if not exist
    const logCount = await prisma.adminLog.count();
    if (logCount === 0) {
      await prisma.adminLog.createMany({
        data: [
          {
            userName: "Ahmad Fauzi",
            userRole: "Super Admin",
            action: "LOGIN",
            module: "Auth",
            description: "Super Admin login ke Dashboard Rumah Indah Carpet",
            ipAddress: "127.0.0.1",
          },
          {
            userName: "Ahmad Fauzi",
            userRole: "Super Admin",
            action: "UPDATE_USER",
            module: "User",
            description: "Memperbarui data dan password pengguna",
            ipAddress: "127.0.0.1",
          },
        ],
      });
    }

    // 5. Sync sequences
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
    } catch (seqErr) {
      console.warn("Sequence sync warning in API:", seqErr);
    }

    return NextResponse.json({
      success: true,
      message: "Database Prisma Rumah Indah Carpet berhasil disinkronkan!",
    });
  } catch (error) {
    console.error("Error syncing database:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyinkronkan database" },
      { status: 500 }
    );
  }
}
