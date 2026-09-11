import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:123@localhost:5432/abcarpet?schema=public";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("Adding columns and tables safely...");

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "carouselAutoplay" BOOLEAN DEFAULT true;
  `);
  console.log("✓ Added carouselAutoplay column to settings");

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "carouselInterval" INTEGER DEFAULT 6500;
  `);
  console.log("✓ Added carouselInterval column to settings");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "hero_slides" (
      "id" SERIAL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "badge" TEXT DEFAULT 'KARPET MASJID & IBADAH',
      "desc" TEXT NOT NULL,
      "image" TEXT NOT NULL,
      "btnPrimaryText" TEXT DEFAULT 'Jelajahi Katalog',
      "btnPrimaryLink" TEXT DEFAULT '/catalog',
      "btnSecondaryText" TEXT DEFAULT 'Lihat Portofolio',
      "btnSecondaryLink" TEXT DEFAULT '/portofolio',
      "order" INTEGER DEFAULT 0,
      "status" TEXT DEFAULT 'Aktif',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✓ Ensured hero_slides table exists");

  // Seed default slides if table is empty
  const count = await prisma.heroSlide.count();
  console.log("Current hero_slides count in DB:", count);
  if (count === 0) {
    const defaultSlides = [
      {
        id: 1,
        title: "Lembut, Nyaman & Elegan Untuk Rumah Ibadah Anda",
        badge: "KARPET MASJID & IBADAH",
        desc: "Rumah Indah Carpet menyediakan berbagai pilihan karpet berkualitas tinggi untuk masjid, musholla, hotel, kantor dan kebutuhan custom lainnya.",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600",
        btnPrimaryText: "Jelajahi Katalog",
        btnPrimaryLink: "/catalog",
        btnSecondaryText: "Lihat Portofolio",
        btnSecondaryLink: "/portofolio",
        order: 1,
        status: "Aktif",
      },
      {
        id: 2,
        title: "Karpet Premium Untuk Rumah & Hunian Modern",
        badge: "KARPET RESIDENSIAL MEWAH",
        desc: "Karpet pilihan dengan material terbaik untuk menciptakan kenyamanan maksimal dan kehangatan di setiap sudut rumah Anda.",
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600",
        btnPrimaryText: "Jelajahi Katalog",
        btnPrimaryLink: "/catalog",
        btnSecondaryText: "Lihat Portofolio",
        btnSecondaryLink: "/portofolio",
        order: 2,
        status: "Aktif",
      },
      {
        id: 3,
        title: "Karpet Kantor Profesional & Ballroom Hotel",
        badge: "KARPET KANTOR & KOMERSIAL",
        desc: "Menciptakan suasana kerja yang elegan, kedap suara, nyaman dan meningkatkan produktivitas serta prestise perusahaan.",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600",
        btnPrimaryText: "Jelajahi Katalog",
        btnPrimaryLink: "/catalog",
        btnSecondaryText: "Lihat Portofolio",
        btnSecondaryLink: "/portofolio",
        order: 3,
        status: "Aktif",
      },
    ];

    for (const slide of defaultSlides) {
      await prisma.heroSlide.create({ data: slide });
    }
    console.log("✓ Seeded default hero slides");
  }

  const testSetting = await prisma.setting.findUnique({ where: { id: 1 } });
  console.log("✓ Test query prisma.setting.findUnique() success:", {
    companyName: testSetting?.companyName,
    carouselAutoplay: testSetting?.carouselAutoplay,
    carouselInterval: testSetting?.carouselInterval,
  });

  console.log("🎉 Database schema update completed successfully!");
}

run()
  .catch((e) => {
    console.error("Migration script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
