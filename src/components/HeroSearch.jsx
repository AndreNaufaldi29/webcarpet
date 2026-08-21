"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiStar,
  FiX,
} from "react-icons/fi";
import {
  getStoredCategories,
  subscribeCategories,
  syncCategoriesFromDatabase,
} from "@/lib/categoryStore";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600",
    badge: "KARPET MASJID & IBADAH",
    title: "Lembut, Nyaman & Elegan Untuk Rumah Ibadah Anda",
    desc:
      "Rumah Indah Carpet menyediakan berbagai pilihan karpet berkualitas tinggi untuk masjid, musholla, hotel, kantor dan kebutuhan custom lainnya.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600",
    badge: "KARPET RESIDENSIAL MEWAH",
    title: "Karpet Premium Untuk Rumah & Hunian Modern",
    desc:
      "Karpet pilihan dengan material terbaik untuk menciptakan kenyamanan maksimal dan kehangatan di setiap sudut rumah Anda.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600",
    badge: "KARPET KANTOR & KOMERSIAL",
    title: "Karpet Kantor Profesional & Ballroom Hotel",
    desc:
      "Menciptakan suasana kerja yang elegan, kedap suara, nyaman dan meningkatkan produktivitas serta prestise perusahaan.",
  },
];

const DEFAULT_CATEGORY_NAMES = [
  "Semua",
  "Karpet Masjid",
  "Karpet Hotel",
  "Karpet Kantor",
  "Karpet Rumah",
  "Karpet Custom",
  "Aksesoris",
];

function HeroSearch() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [categories, setCategories] = useState(DEFAULT_CATEGORY_NAMES);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sync category pills from Prisma PostgreSQL database
  useEffect(() => {
    // 1. Initial cached categories
    const initialCats = getStoredCategories().filter((c) => c.status !== "Nonaktif");
    if (initialCats.length > 0) {
      setCategories(["Semua", ...initialCats.map((c) => c.name)]);
    }

    // 2. Fetch fresh categories from Prisma DB
    syncCategoriesFromDatabase().then((dbCategories) => {
      if (Array.isArray(dbCategories) && dbCategories.length > 0) {
        const activeCats = dbCategories.filter((c) => c.status !== "Nonaktif");
        setCategories(["Semua", ...activeCats.map((c) => c.name)]);
      }
    });

    // 3. Subscribe to realtime category updates
    const unsubscribe = subscribeCategories((updated) => {
      const activeCats = updated.filter((c) => c.status !== "Nonaktif");
      setCategories(["Semua", ...activeCats.map((c) => c.name)]);
    });

    return () => unsubscribe();
  }, []);

  // Slide rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      handleSlideChange((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6500);

    return () => clearInterval(timer);
  }, []);

  const handleSlideChange = (updater) => {
    setIsTransitioning(true);
    setCurrent(updater);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("search", query.trim());
    }
    if (activeCategory && activeCategory !== "Semua") {
      params.set("category", activeCategory.replace(/^Karpet\s+/i, ""));
    }
    const queryString = params.toString();
    router.push(`/catalog${queryString ? `?${queryString}` : ""}`);
  };

  const handleCategoryClick = (item) => {
    setActiveCategory(item);
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("search", query.trim());
    }
    if (item !== "Semua") {
      params.set("category", item.replace(/^Karpet\s+/i, ""));
    }
    const queryString = params.toString();
    router.push(`/catalog${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <section className="hero-search">
      {/* HERO SLIDE CONTAINER */}
      <div
        key={current}
        className={`hero-slide ${isTransitioning ? "slide-fade" : "slide-active"}`}
        style={{
          backgroundImage: `
          linear-gradient(
            90deg,
            rgba(0,11,88,.92) 0%,
            rgba(0,11,88,.65) 50%,
            rgba(0,11,88,.25) 100%
          ),
          url(${slides[current].image})
          `,
        }}
      >
        {/* AMBIENT FLOATING LIGHTS */}
        <div className="hero-ambient-glow" />

        <div className="hero-content">
          <div className="hero-badge animate-badge-pop">
            <FiStar className="badge-sparkle-icon" />
            <span>{slides[current].badge || "KARPET BERKUALITAS PREMIUM"}</span>
          </div>

          <h1 className="hero-title-anim">{slides[current].title}</h1>

          <p className="hero-desc-anim">{slides[current].desc}</p>

          <div className="hero-actions-anim">
            <Link href="/catalog" className="hero-btn">
              <span>Jelajahi Katalog</span>
              <FiArrowRight className="hero-btn-arrow" />
            </Link>

            <Link href="/portofolio" className="hero-btn-secondary">
              <span>Lihat Portofolio</span>
            </Link>
          </div>
        </div>

        {/* SLIDE CONTROLS */}
        <button
          type="button"
          className="arrow left"
          onClick={() =>
            handleSlideChange(current === 0 ? slides.length - 1 : current - 1)
          }
          aria-label="Slide Sebelumnya"
        >
          <FiChevronLeft />
        </button>

        <button
          type="button"
          className="arrow right"
          onClick={() =>
            handleSlideChange(current === slides.length - 1 ? 0 : current + 1)
          }
          aria-label="Slide Berikutnya"
        >
          <FiChevronRight />
        </button>

        {/* SLIDE INDICATORS */}
        <div className="hero-indicators">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`indicator-dot ${current === idx ? "active" : ""}`}
              onClick={() => handleSlideChange(idx)}
              aria-label={`Pindah ke slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* SEARCH FLOATING BOX */}
      <form className="search-box animate-float-search" onSubmit={handleSearch}>
        <div className="search-row">
          <div className="search-input-wrap">
            <FiSearch className="search-icon-inside" />
            <input
              type="text"
              placeholder="Cari nama karpet, warna, bahan, atau kebutuhan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cari Karpet"
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian"
              >
                <FiX />
              </button>
            )}
          </div>

          <button type="submit" className="search-btn" aria-label="Cari Produk">
            <FiSearch className="search-btn-icon" />
            <span className="search-btn-text-desktop">Cari Produk</span>
            <span className="search-btn-text-mobile">Cari</span>
          </button>
        </div>

        {/* DYNAMIC CATEGORY FILTER PILLS UNDER SEARCH */}
        <div className="category-filter-wrap">
          <div className="category-filter" role="tablist" aria-label="Filter Kategori Karpet">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={activeCategory === item}
                className={activeCategory === item ? "active" : ""}
                onClick={() => handleCategoryClick(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </form>
    </section>
  );
}

export default HeroSearch;
